/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 *
 * By listening to XXX_UPDATED events, this module tracks various elements of scene state, such as WebGL settings,
 * texture layers, lighting, current material properties etc.
 *
 * On a SHADER_ACTIVATE event it will compose and activate a shader taylored to the current scene state
 * (ie. where the shader has variables and routines for the current lights, materials etc), then fire a
 * SHADER_ACTIVATED event when the shader is ready for business.
 *
 * Other modules will then handle the SHADER_RENDERING event by firing XXXXX_EXPORTED events parameterised with
 * resources that they want loaded into the shader. This module then handles those by loading their parameters into
 * the shader.
 *
 * The module will avoid constant re-generation of shaders by caching each of them against a hash code that it
 * derives from the current collective scene state; on a SHADER_ACTIVATE event, it will attempt to reuse a shader
 * cached for the hash of the current scene state.
 *
 * Shader allocation and LRU cache eviction is mediated by SceneJS._memoryModule.
 *  @private
 */
SceneJS._shaderModule = new (function() {
    var debugCfg;                       // Debugging configuration for this module
    var time = (new Date()).getTime();  // Current time for least-recently-used shader cache eviction policy
    var canvas;                         // Currently active WebGL canvas
    var nextStateId;                    // Generates unique state chunk ID

    /* Currently exported states
     */
    var flagsState;
    var rendererState;
    var lightState;
    var boundaryState;
    var colortransState;
    var materialState;
    var fogState;
    var texState;
    var geoState;
    var modelXFormState;
    var viewXFormState;
    var projXFormState;
    var pickState;
    var imageBufState;
    var clipState;
    var deformState;
    var morphState;

    /** Bin sets for the currently-active canvas, organsed into layers,
     * initialised on CANVAS_ACTIVATED event below
     */
    var layers = {};

    /** Shader programs currently allocated on all canvases
     */
    var programs = {};

    /** Current scene state hash
     */
    var stateHash = null;

    /* Volunteer this module with the VRAM memory management module
     * to deallocate programs when memory module needs VRAM.
     */
    SceneJS._memoryModule.registerEvictor(
            function() {
                var earliest = time;
                var programToEvict;
                for (var hash in programs) {
                    if (hash) {
                        var program = programs[hash];
                        if (program.lastUsed < earliest) {
                            programToEvict = program;
                            earliest = programToEvict.lastUsed;
                        }
                    }
                }
                if (programToEvict) { // Delete LRU program's shaders and deregister program
                    //  SceneJS._loggingModule.info("Evicting shader: " + hash);
                    programToEvict.destroy();
                    programs[programToEvict.hash] = null;
                    return true;
                }
                return false;   // Couldnt find suitable program to delete
            });

    /* Track the scene graph time so we can timestamp the last time
     * we use each shader programs in case we need to evict the
     * least-recently-used program for the memor-management module.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    /* When SceneJS resets we'll free all the programs
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                for (var programId in programs) {  // Just free allocated programs
                    programs[programId].destroy();
                }
                programs = {};
            });


    //    SceneJS._eventModule.addListener(
    //            SceneJS._eventModule.SCENE_RENDERING,
    //            function(params) {
    //            });


    /* When a canvas is activated we'll get a reference to it, prepare the default state soup,
     * and an initial empty set of node bins
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(activatedCanvas) {
                debugCfg = SceneJS._debugModule.getConfigs("shading");

                /* Get reference to active canvas
                 */
                canvas = activatedCanvas;

                /* Prepare initial default state soup
                 */
                nextStateId = 0;
                flagsState = {
                    flags: {},
                    hash: ""
                };
                rendererState = {
                    props: {},
                    hash: ""
                };
                lightState = {
                    lights: [],
                    hash: ""
                };
                boundaryState = null;
                colortransState = {
                    _stateId : nextStateId++,
                    trans: {
                    },
                    hash: ""
                };
                materialState = {
                    material: {
                        _stateId : nextStateId++,
                        baseColor : [ 0.5, 0.5, 0.5 ],
                        specularColor: [ 0.9,  0.9,  0.9 ],
                        specular : 200,
                        shine : 1,
                        reflect : 0,
                        alpha : 1.0,
                        emit : 0.7
                    },
                    hash: ""
                };
                fogState = {
                    _stateId : nextStateId++,
                    fog: null,
                    hash: ""
                };
                texState = {
                    _stateId : nextStateId++,
                    layers: [],
                    hash: ""
                };
                geoState = null;
                imageBufState = null;

                /* Prepare initial set of empty node bins
                 */
                createLayer(SceneJS._layerModule.DEFAULT_LAYER_NAME);

                clipState = {
                    _stateId : nextStateId++,
                    clips: [],
                    hash: ""
                };

                deformState = {
                    _stateId : nextStateId++,
                    deform: null,
                    hash: ""
                };

                morphState = {
                    _stateId : nextStateId++,
                    morph: null,
                    hash: ""
                };

                stateHash = null;
            });

    function createLayer(layerName) {
        layers[layerName] = {
            binSet : {
                opaqueNodes : [],
                transpNodes : []
            }
        };
    }

    /**
     *
     */
    this.setFlags = function(flags) {
        flagsState = {
            _stateId : nextStateId++,
            flags: flags
        };
        // Note we don't force stateHash compute
    };


    /* Import GL flags state
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RENDERER_EXPORTED,
            function(props) {
                rendererState = {
                    _stateId : nextStateId++,
                    props: props,
                    hash: ""
                };
                stateHash = null;
            });


    /* When texture state exported, add it to the state soup
     * and make hash identity for its GLSL fragment.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TEXTURES_EXPORTED,
            function(texture) {

                /* Make hash
                 */
                var hashStr;
                if (texture.layers.length) {
                    var hash = [];
                    for (var i = 0; i < texture.layers.length; i++) {
                        var layer = texture.layers[i];
                        hash.push("/");
                        hash.push(layer.applyFrom);
                        hash.push("/");
                        hash.push(layer.applyTo);
                        hash.push("/");
                        hash.push(layer.blendMode);
                        if (layer.matrix) {
                            hash.push("/anim");
                        }
                    }
                    hashStr = hash.join("");
                } else {
                    hashStr = "__scenejs_no_tex";
                }

                /* Add to state soup
                 */
                texState = {
                    _stateId : nextStateId++,
                    texture : texture,
                    hash : hashStr
                };

                stateHash = null;
            });

    /* When lighting state exported, add it to the state soup
     * and make hash identity for its GLSL fragment.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.LIGHTS_EXPORTED,
            function(lights) {

                /* Make hash
                 */
                var hash = [];
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    hash.push(light.mode);
                    if (light.specular) {
                        hash.push("s");
                    }
                    if (light.diffuse) {
                        hash.push("d");
                    }
                }

                /* Add to state soup
                 */
                lightState = {
                    _stateId : nextStateId++,
                    lights: lights,
                    hash: hash.join("")
                };

                stateHash = null;
            });

    /* When boundary state exported, add it to the state soup.
     * We don't need a hash identity since it's not renderable.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.BOUNDARY_EXPORTED,
            function(boundary) {
                boundaryState = {
                    _stateId : nextStateId++,
                    boundary: boundary.viewBox,
                    hash: ""
                };
                stateHash = null;
            });

    /**
     * When color transform set, add it to the state soup
     */
    this.setColortrans = function(trans) {

        /* Add colortrans to state soup.
         */
        colortransState = {
            _stateId : nextStateId++,
            trans:      trans,
            hash: trans ? "t" : "f"
        };

        stateHash = null;
    };


    /**
     *
     */
    this.addMaterial = function(material) {
        materialState = {
            _stateId : nextStateId++,
            material: {
                baseColor : material.baseColor || [ 0.0, 0.0, 0.0 ],
                highlightBaseColor : material.highlightBaseColor || material.baseColor || [ 0.0, 0.0, 0.0 ],
                specularColor : material.specularColor || [ 0.5,  0.5,  0.5 ],
                specular : material.specular != undefined ? material.specular : 2,
                shine : material.shine != undefined ? material.shine : 0.5,
                reflect : material.reflect != undefined ? material.reflect : 0,
                alpha : material.alpha != undefined ? material.alpha : 1.0,
                emit : material.emit != undefined ? material.emit : 0.0
            },
            hash: ""
        };

        stateHash = null;
        return materialState;
    };

    /**
     * Updates the material referenced by the given handle. The update must match the
     * mode specified on the material when that was added.
     *
     * @param {Object} materialState Handle to the material
     * @param {Object} material New material properties
     */
    this.updateMaterial = function(materialState, material) {

        // TODO: override material that's already set, not override defaults

        materialState.material = {
            baseColor : material.baseColor || [ 0.0, 0.0, 0.0 ],
            highlightBaseColor : material.highlightBaseColor || material.baseColor || [ 0.0, 0.0, 0.0 ],
            specularColor : material.specularColor || [ 0.5,  0.5,  0.5 ],
            specular : material.specular != undefined ? material.specular : 2,
            shine : material.shine != undefined ? material.shine : 0.5,
            reflect : material.reflect != undefined ? material.reflect : 0,
            alpha : material.alpha != undefined ? material.alpha : 1.0,
            emit : material.emit != undefined ? material.emit : 0.0
        };
    };


    /* When picking state exported, add it to the state soup.
     * We don't need a hash identity since we'll just switch to
     * a special pick shader for picking mode.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PICK_COLOR_EXPORTED,
            function(params) {
                pickState = {
                    _stateId : nextStateId++,
                    pickColor: params.pickColor,
                    hash: ""
                };

                stateHash = null;
            });

    /**
     *
     */
    this.addFog = function(fog) {
        fogState = {
            _stateId : nextStateId++,
            fog: fog,
            hash: fog ? fog.mode : ""
        };
        stateHash = null;
        return fogState;
    };

    /**
     * Updates the fog referenced by the given handle. The update must match the
     * mode specified on the fog when that was added.
     *
     * @param {Object} fogState Handle to the fog
     * @param {Object} fog New fog properties
     */
    this.updateFog = function(fogState, fog) {
        if (fogState.fog.mode != fog.mode) {
            throw "Shader fog update not compatible with fog - different modes";
        }
        fogState.fog = fog;
    };

    /**
     *
     */
    this.addClips = function(clips) {
        /* Make hash
         */
        var hash = [];
        for (var i = 0; i < clips.length; i++) {
            var clip = clips[i];
            hash.push(clip.mode);
        }

        /* Add to state soup
         */
        clipState = {
            _stateId : nextStateId++,
            clips: clips,
            hash: hash.join("")
        };
        stateHash = null;
        return clipState;
    };

    /**
     * Updates the clipping planes referenced by the given handle.
     *
     * @param {Object} clipsState Handle to the clips
     * @param {Object} clips New clips properties
     */
    this.updateClips = function(clipsState, clips) {
        clipsState.clips = clips;
    };

    /**
     *
     */
    this.addDeform = function(deform) {
        deformState = {
            _stateId : nextStateId++,
            deform: deform,
            hash: deform ? "d" + deform.verts.length : ""
        };
        stateHash = null;
        return deformState;
    };

    /**
     * Updates the deform referenced by the given handle. The update must match the
     * properties specified on the deform when that was added - it must not omit properties
     * or introduce new ones.
     *
     * @param {Object} deformState Handle to the deform
     * @param {Object} deform New deform properties
     */
    this.updateDeform = function(deformState, deform) {
        if (deformState.verts.length != deform.verts.length) {
            throw "Shader deform update not compatible with deform";
        }
        deformState.deform = deform;
    };

    /**
     *
     */
    this.addMorph = function(morph) {

        /* Make hash
         */
        var hash;
        if (morph) {
            hash = [];
            var target1 = morph.target1;
            hash = ([
                target1.vertexBuf ? "t" : "f",
                target1.normalBuf ? "t" : "f",
                target1.uvBuf ? "t" : "f",
                target1.uvBuf2 ? "t" : "f"]).join("")
        } else {
            hash = "";
        }
        morphState = {
            _stateId : nextStateId++,
            morph: morph,
            hash: hash
        };
        stateHash = null;
        return morphState;
    };

    /**
     * Updates the morph referenced by the given handle. The update must match the
     * properties specified on the morph when that was added - it must not omit properties
     * or introduce new ones.
     *
     * @param {Object} morphState Handle to the morph
     * @param {Object} morph New morph properties
     */
    this.updateMorph = function(morphState, morph) {
        var newHash = ([
            morph.target1.vertexBuf ? "t" : "f",
            morph.target1.normalBuf ? "t" : "f",
            morph.target1.uvBuf ? "t" : "f",
            morph.target1.uvBuf2 ? "t" : "f"]).join("");

        if (morphState.hash != newHash) {
            throw "Shader morph update not compatible with morph";
        }
        morphState.morph = morph;
    };


    /**
     * Sets the current model and normals matrices
     * @param {Float32Array} modelMat The model matrix as a WebGL array
     * @param {Float32Array} normalMat The modelling normal matrix as a WebGL array
     */
    this.addModelMatrices = function(modelMat, normalMat) {
        modelXFormState = {                  // No hash needed - does not contribute to shader construction
            _stateId : nextStateId++,
            mat : modelMat,
            normalMat : normalMat
        };
        stateHash = null;
    };

    /**
     * Updates the model matrices referenced by the given handle.
     * @param {modelXFormState} object Handle to the model matrices
     * @param {Float32Array} modelMat The modeling matrix as a WebGL array
     * @param {Float32Array} normalMat The modeling normal matrix as a WebGL array
     */
    this.updateModelMatrices = function(modelXFormState, modelMat, normalMat) {
        modelXFormState.mat = modelMat;
        modelXFormState.normalMat = normalMat;
    };

    /**
     * Sets the current view matrix and returns a handle to it. The handle is just a pointer, not to be modified an any way.
     * @param {Float32Array} viewMat The viewing matrix as a WebGL array
     * @param {Float32Array} normalMat The viewing normal matrix as a WebGL array
     * @return {Object} Handle to a view matrix in this module
     */
    this.addViewMatrices = function(viewMat, normalMat) {
        viewXFormState = {                  // No hash needed - does not contribute to shader construction
            _stateId : nextStateId++,
            mat : viewMat,
            normalMat : normalMat
        };
        stateHash = null;
        return viewXFormState;
    };

    /**
     * Updates the view matrices referenced by the given handle.
     * @param {viewXFormState} object Handle to the view matrices
     * @param {Float32Array} viewMat The viewing matrix as a WebGL array
     * @param {Float32Array} normalMat The viewing normal matrix as a WebGL array
     */
    this.updateViewMatrices = function(viewXFormState, viewMat, normalMat) {
        viewXFormState.mat = viewMat;
        viewXFormState.normalMat = normalMat;
    };

    /**
     * Sets the current camera (projection) matrix and returns a handle to it.
     * @param {Float32Array} projMat The camera (projection) matrix as a WebGL array
     * @return {Object} Handle to a projection matrix in this module
     */
    this.addProjectionMatrix = function(projMat) {
        projXFormState = {                  // No hash needed - does not contribute to shader construction
            _stateId : nextStateId++,
            mat : projMat
        };
        stateHash = null;
        return projXFormState;
    };

    /**
     * Updates the projection matrix referenced by the given handle.
     * @param {projXFormState} object Handle to the projection matrix
     * @param {Float32Array} projMat The projection matrix as a WebGL array
     */
    this.updateProjectionMatrix = function(projXFormState, projMat) {
        projXFormState.mat = projMat;
    };

    /**
     * Sets the current image buffer to source textures from
     * @param {Object} imageBuf The image buffer object
     */
    this.addImageBuf = function(imageBuf) {
        imageBufState = {
            _stateId : nextStateId++,
            imageBuf: imageBuf
        };
        stateHash = null;
    };

    /* When geometry set, add it to the state soup and make GLSL hash code on the VBOs it provides.
     *
     * Geometry is automatically exported when a scene graph geometry node
     * is rendered.
     *
     * Geometry is the central element of a state graph node, so now we
     * will create a state graph node with pointers to the elements currently
     * in the state soup.
     *
     * But first we need to ensure that the state soup is up to date. Other kinds of state
     * are not automatically exported by scene traversal, where their modules
     * require us to notify them that we'll be rendering something (the geometry) and
     * need an up-to-date set state soup. If they havent yet exported their state
     * (textures, material and so on) for this scene traversal, they'll do so.
     *
     * And if we need boundaries for our rendering algorithm, we'll send a
     * special marshalling notification for those.
     *
     * Next, we'll build a program hash code by concatenating the hashes on
     * the state soup elements, then use that to create (or re-use) a shader program
     * that is equipped to render the current state soup elements.
     *
     * Then we create the state graph node, which has the program and pointers to
     * the current state soup elements.
     *
     * Finally we put that node into either the opaque or transparent bin within the
     * active bin set, depending on whether the material state is opaque or transparent.
     */
    this.setGeometry = function(geo) {

        var layer;

        var layerName = SceneJS._layerModule.getLayer();
        if (layerName) {
            if (!layers[layerName]) {
                createLayer(layerName);
            }
            layer = layers[layerName];
        } else {
            layer = layers[SceneJS._layerModule.DEFAULT_LAYER_NAME];
        }

        /* Add geometry to state soup.
         */
        geoState = {
            _stateId : nextStateId++,
            geo:       geo,
            hash: ([
                geo.normalBuf ? "t" : "f",
                geo.uvBuf ? "t" : "f",
                geo.uvBuf2 ? "t" : "f"]).join("")
        };

        /* Ensure the rest of the state soup is marshalled
         */
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_RENDERING);

        /* Identify what GLSL is required for the current state soup elements
         */
        if (!stateHash) {
            stateHash = getSceneHash();
        }

        /* Create or re-use a program
         */
        var program = getProgram(stateHash);    // Touches for LRU cache

        /* Create state graph node, with program and
         * pointers to current state soup elements
         */
        var node = {

            program : {
                id: stateHash,
                program: program
            },

            /* Pointers into state soup
             */
            boundaryState:    boundaryState,
            geoState:         geoState,
            flagsState:       flagsState,
            rendererState:    rendererState,
            lightState:       lightState,
            colortransState : colortransState,
            materialState:    materialState,
            fogState :        fogState,
            modelXFormState:  modelXFormState,
            viewXFormState:   viewXFormState,
            projXFormState:   projXFormState,
            texState:         texState,
            pickState :       pickState ,
            imageBufState :   imageBufState,
            clipState :       clipState,
            deformState :     deformState,
            morphState :      morphState
        };

        /* Put node into either the transoarent or opaque bin,
         * depending on current material state's opacity
         */
        if (flagsState.flags.transparent === true) {
            layer.binSet.transpNodes.push(node);
        } else {
            layer.binSet.opaqueNodes.push(node);
        }
    };


    /* When the canvas deactivates, we'll render the node bins.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                NodeRenderer.init();

                var layerOrder = SceneJS._layerModule.getLayerOrder();
                var layer;

                for (var i = 0, len = layerOrder.length; i < len; i++) {
                    layer = layers[layerOrder[i].name];
                    if (layer) {
                        renderBinSet(layer.binSet);
                    }
                }
                NodeRenderer.cleanup();
                canvas = null;
            });

    //    this.redraw = function() {
    //        NodeRenderer.init();
    //        renderBinSet(layers.__default.binSet);
    //    };


    /**
     * Renders the given bin set.
     */
    function renderBinSet(binSet) {
        var nTransparent = binSet.transpNodes.length;

        if (nTransparent == 0) {

            /* Bin set contains no transparent nodes, so we'll just render the opaque ones.
             */
            renderOpaqueNodes(binSet.opaqueNodes);
        } else {

            /* Bin set contains contains many transparent nodes. Render opaque nodes wihout blending,
             * then render transparent nodes with blending.
             */
            renderOpaqueNodes(binSet.opaqueNodes);
            renderTransparentNodes(binSet.transpNodes);
        }
    }

    function renderOpaqueNodes(opaqueNodes) {
        //NodeRenderer.init();
        var context = canvas.context;
        //        context.blendFunc(context.SRC_ALPHA, context.LESS);
        //        context.disable(context.BLEND);
        for (var i = 0, len = opaqueNodes.length; i < len; i++) {
            NodeRenderer.renderNode(opaqueNodes[i]);
        }
        //NodeRenderer.cleanup();
    }

    function renderTransparentNodes(transpNodes) {
        //NodeRenderer.init();
        var context = canvas.context;

        context.enable(context.BLEND);

        /* Order independent blend; unfortunately tends to wash out against a
         * white background because all colours are basically added
         */
        context.blendFunc(context.SRC_ALPHA, context.ONE);

        for (var i = 0, len = transpNodes.length; i < len; i++) {
            NodeRenderer.renderNode(transpNodes[i]);
        }
        /// context.blendFunc(context.SRC_ALPHA, context.LESS);
        context.disable(context.BLEND);
        //NodeRenderer.cleanup();
    }

    /**
     * State node renderer
     */
    const NodeRenderer = new (function() {

        /**
         * Called before we render all state nodes for a frame.
         * Forgets any program that was used for the last node rendered, which causes it
         * to forget all states for that node.
         */
        this.init = function() {
            this._program = null;
            this._lastRendererState = null;
            this._lastImageBufState = null;
        };

        /**
         * Renders a state node. Makes state changes only where the node's states have different IDs
         * that the states of the last node. If the node has a different program than the last node
         * rendered, Renderer forgets all states for the previous node and makes a fresh set of transitions
         * into all states for this node.
         */
        this.renderNode = function(node) {

            var context = canvas.context;

            /* Bind program if none bound, or if node uses different program
             * to that currently bound.
             *
             * Also flag all buffers as needing to be bound.
             */
            if ((!this._program) || (node.program.id != this._lastProgramId)) {
                if (this._program) {
                    this._program.unbind();
                }

                this._program = node.program.program;
                this._program.bind();

                this._lastFlagsStateId = -1;
                this._lastGeoStateId = -1;
                this._lastLightStateId = -1;
                this._lastClipStateId = -1;
                this._lastDeformStateId = -1;
                this._lastMorphStateId = -1;
                this._lastTexStateId = -1;
                this._lastMaterialStateId = -1;
                this._lastViewXFormStateId = -1;
                this._lastModelXFormStateId = -1;
                this._lastProjXFormStateId = -1;
                this._lastPickStateId = -1;
                this._lastImageBufStateId = -1;
                this._lastFogStateId = -1;

                this._lastProgramId = node.program.id;
            }

            /*----------------------------------------------------------------------------------------------------------
             * flags
             *--------------------------------------------------------------------------------------------------------*/

            if (! node._lastFlagsState || node.flagsState._stateId != this._lastFlagsState._stateId) {

                /*
                 */
                this._lastFlagsState = node.flagsState;
            }

            /*----------------------------------------------------------------------------------------------------------
             * imagebuf
             *--------------------------------------------------------------------------------------------------------*/

            if (! node._lastImageBufState || node.imageBufState._stateId != this._lastImageBufState._stateId) {
                if (this._lastImageBufState && this._lastImageBufState.imageBuf) {
                    context.flush();
                    this._lastImageBufState.imageBuf.unbind();

                }
                if (node.imageBufState.imageBuf) {

                    node.imageBufState.imageBuf.bind();
                }
                this._lastImageBufState = node.imageBufState;
            }

            /*----------------------------------------------------------------------------------------------------------
             * geometry or morphGeometry
             *
             * 1. Disable VBOs
             * 2. If new morphGeometry then bind target VBOs and remember which arrays we bound
             * 3. If new geometry then bind VBOs for whatever is not already bound
             *--------------------------------------------------------------------------------------------------------*/

            if ((node.geoState._stateId != this._lastGeoStateId)  // New geometry
                    || (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId)) {   // New morphGeometry

                /* Disable all vertex arrays
                 */
                for (var k = 0; k < 8; k++) {
                    context.disableVertexAttribArray(k);
                }

                var vertexBufBound = false;
                var normalBufBound = false;
                var uvBufBound = false;
                var uvBuf2Bound = false;

                var morph;
                var target1, target2;

                var geo = node.geoState.geo;

                if (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId) {

                    /* Bind morph VBOs
                     */

                    morph = node.morphState.morph;

                    target1 = morph.target1;
                    target2 = morph.target2;

                    if (target1.vertexBuf) {
                        this._program.bindFloatArrayBuffer("aVertex", target1.vertexBuf);
                        this._program.bindFloatArrayBuffer("aMorphVertex", target2.vertexBuf);
                        vertexBufBound = true;
                    }

                    if (target1.normalBuf) {
                        this._program.bindFloatArrayBuffer("aNormal", target1.normalBuf);
                        this._program.bindFloatArrayBuffer("aMorphNormal", target2.normalBuf);
                        normalBufBound = true;
                    }

                    if (target1.uvBuf) {
                        this._program.bindFloatArrayBuffer("aUVCoord", target1.uvBuf);
                        this._program.bindFloatArrayBuffer("aMorphUVCoord", target2.uvBuf);
                        uvBufBound = true;
                    }

                    if (target1.uvBuf2) {
                        this._program.bindFloatArrayBuffer("aUVCoord2", target1.uvBuf);
                        this._program.bindFloatArrayBuffer("aMorphUVCoord2", target2.uvBuf);
                        uvBuf2Bound = true;
                    }

                    this._program.setUniform("uMorphFactor", morph.factor);
                    this._lastMorphStateId = node.morphState._stateId;
                }

                /* Bind geometry VBOs - do that in any case, since we'll always have a geometry
                 * within a morphGeometry
                 */

                this._lastGeoStateId = node.geoState._stateId;

                if (!vertexBufBound && geo.vertexBuf) {
                    this._program.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                }

                if (!normalBufBound && geo.normalBuf) {
                    this._program.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                }
                // TODO
                if (node.texState && node.texState.texture.layers.length > 0) {
                    if (geo.uvBuf) {
                        this._program.bindFloatArrayBuffer("aUVCoord", geo.uvBuf);
                    }
                    if (geo.uvBuf2) {
                        this._program.bindFloatArrayBuffer("aUVCoord2", geo.uvBuf2);
                    }
                }

                geo.indexBuf.bind();
            }

            /* Set GL props
             */
            if (node.rendererState) {
                if (!this._lastRendererState || node.rendererState._stateId != this._lastRendererState._stateId) {
                    if (this._lastRendererState) {
                        this._lastRendererState.props.restoreProps(context);
                    }
                    node.rendererState.props.setProps(context);
                    this._lastRendererState = node.rendererState;
                }

                /* Bind renderer properties
                 */

                var clearColor = node.rendererState.props.props.clearColor;
                clearColor = clearColor
                        ? [clearColor.r, clearColor.g, clearColor.b]
                        : [0, 0, 0];
                this._program.setUniform("uAmbient", clearColor);
            }

            /*----------------------------------------------------------------------------------------------------------
             * texture
             *--------------------------------------------------------------------------------------------------------*/

            if (node.texState && node.texState._stateId != this._lastTexStateId) {
                var layer;
                for (var j = 0; j < node.texState.texture.layers.length; j++) {
                    layer = node.texState.texture.layers[j];
                    this._program.bindTexture("uSampler" + j, layer.texture, j);
                    if (layer.matrixAsArray) {
                        this._program.setUniform("uLayer" + j + "Matrix", layer.matrixAsArray);
                    }
                }
                this._lastTexStateId = node.texState._stateId;
            } else if (!node.texState) {
                this._lastTexStateId = -1;
            }

            /*----------------------------------------------------------------------------------------------------------
             * fog
             *--------------------------------------------------------------------------------------------------------*/

            if (node.fogState && node.fogState.fog && node.fogState._stateId != this._lastFogStateId) {
                var fog = node.fogState.fog;
                if (node.flagsState.flags.fog === false || fog.mode == "disabled") {

                    // When fog is disabled, don't bother loading any of its parameters
                    // because they will be ignored by the shader

                    this._program.setUniform("uFogMode", 0.0);
                } else {

                    if (fog.mode == "constant") {
                        this._program.setUniform("uFogMode", 4.0);
                        this._program.setUniform("uFogColor", fog.color);
                        this._program.setUniform("uFogDensity", fog.density);

                    } else {

                        if (fog.mode == "linear") {
                            this._program.setUniform("uFogMode", 1.0);
                        } else if (fog.mode == "exp") {
                            this._program.setUniform("uFogMode", 2.0);
                        } else if (fog.mode == "exp2") {
                            this._program.setUniform("uFogMode", 3.0); // mode is "exp2"
                        }
                        this._program.setUniform("uFogColor", fog.color);
                        this._program.setUniform("uFogDensity", fog.density);
                        this._program.setUniform("uFogStart", fog.start);
                        this._program.setUniform("uFogEnd", fog.end);
                    }
                }
                this._lastFogStateId = node.fogState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * view matrix
             *--------------------------------------------------------------------------------------------------------*/

            if (node.viewXFormState._stateId != this._lastViewXFormStateId) {
                this._program.setUniform("uVMatrix", node.viewXFormState.mat);
                this._program.setUniform("uVNMatrix", node.viewXFormState.normalMat);
                this._lastViewXFormStateId = node.viewXFormState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * model matrix
             *--------------------------------------------------------------------------------------------------------*/

            if (node.modelXFormState._stateId != this._lastModelXFormStateId) {
                this._program.setUniform("uMMatrix", node.modelXFormState.mat);
                this._program.setUniform("uMNMatrix", node.modelXFormState.normalMat);
                this._lastModelXFormStateId = node.modelXFormState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * projection matrix
             *--------------------------------------------------------------------------------------------------------*/

            if (node.projXFormState._stateId != this._lastProjXFormStateId) {
                this._program.setUniform("uPMatrix", node.projXFormState.mat);
                this._lastProjXFormStateId = node.projXFormState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * lights
             *--------------------------------------------------------------------------------------------------------*/

            if (node.lightState && node.lightState._stateId != this._lastLightStateId) {
                var ambient;
                var light;
                for (var k = 0; k < node.lightState.lights.length; k++) {
                    light = node.lightState.lights[k];
                    this._program.setUniform("uLightColor" + k, light.color);
                    this._program.setUniform("uLightDiffuse" + k, light.diffuse);
                    if (light.mode == "dir") {
                        this._program.setUniform("uLightDir" + k, light.viewDir);
                    } else if (light.mode == "ambient") {
                        ambient = ambient ? [
                            ambient[0] + light.color[0],
                            ambient[1] + light.color[1],
                            ambient[2] + light.color[2]
                        ] : light.color;
                    } else {
                        if (light.mode == "point") {
                            this._program.setUniform("uLightPos" + k, light.viewPos);
                        }
                        if (light.mode == "spot") {
                            this._program.setUniform("uLightPos" + k, light.viewPos);
                            this._program.setUniform("uLightDir" + k, light.viewDir);
                            this._program.setUniform("uLightSpotCosCutOff" + k, light.spotCosCutOff);
                            this._program.setUniform("uLightSpotExp" + k, light.spotExponent);
                        }
                        this._program.setUniform("uLightAttenuation" + k,
                                [
                                    light.constantAttenuation,
                                    light.linearAttenuation,
                                    light.quadraticAttenuation
                                ]);
                    }
                }
                this._lastLightStateId = node.lightState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * clip planes
             *--------------------------------------------------------------------------------------------------------*/

            if (node.clipState && node.clipState._stateId != this._lastClipStateId) {
                var clip;
                for (var k = 0; k < node.clipState.clips.length; k++) {
                    clip = node.clipState.clips[k];
                    this._program.setUniform("uClipNormal" + k, clip.normal);
                    this._program.setUniform("uClipDist" + k, clip.dist);

                    if (node.rendererState.props.props.enableClip === false) { // Renderer node disables clipping
                        this._program.setUniform("uClipMode" + k, 0);
                    } else if (clip.mode == "inside") {
                        this._program.setUniform("uClipMode" + k, 2);
                    } else if (clip.mode == "outside") {
                        this._program.setUniform("uClipMode" + k, 1);
                    } else { // disabled
                        this._program.setUniform("uClipMode" + k, 0);
                    }
                }
                this._lastClipStateId = node.clipState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * deform
             *--------------------------------------------------------------------------------------------------------*/

            if (node.deformState && node.deformState.deform && node.deformState._stateId != this._lastDeformStateId) {
                var verts = node.deformState.deform.verts;
                var vert;
                for (var k = 0, len = verts.length; k < len; k++) {
                    vert = verts[k];
                    this._program.setUniform("uDeformVertex" + k, vert.pos);
                    this._program.setUniform("uDeformWeight" + k, vert.weight);
                    if (vert.mode == "linear") {
                        this._program.setUniform("uDeformMode" + k, 0.0);
                    } else if (vert.mode == "exp") {
                        this._program.setUniform("uDeformMode" + k, 1.0);
                    }
                }
                this._lastDeformStateId = node.deformState._stateId;
            }


            /*----------------------------------------------------------------------------------------------------------
             * colortrans
             *--------------------------------------------------------------------------------------------------------*/

            if (node.colortransState && node.colortransState.trans && node.colortransState != this._lastColortransStateId) {

                /* Bind colortrans
                 */
                if (node.flagsState.flags.colortrans === false) {
                    this._program.setUniform("uColortransMode", 0);  // Disable
                } else {
                    var trans = node.colortransState.trans;
                    var scale = trans.scale;
                    var add = trans.add;
                    this._program.setUniform("uColortransMode", 1);  // Enable
                    this._program.setUniform("uColortransScale", [scale.r, scale.g, scale.b, scale.a]);  // Scale
                    this._program.setUniform("uColortransAdd", [add.r, add.g, add.b, add.a]);  // Scale
                    this._program.setUniform("uColortransSaturation", trans.saturation);  // Saturation
                    this._lastColortransStateId = node.colortransState._stateId;
                }
            }

            /*----------------------------------------------------------------------------------------------------------
             * material
             *--------------------------------------------------------------------------------------------------------*/

            if (node.materialState && node.materialState != this._lastMaterialStateId) {

                /* Bind Material
                 */
                var material = node.materialState.material;
                this._program.setUniform("uMaterialBaseColor", material.baseColor);
                this._program.setUniform("uMaterialSpecularColor", material.specularColor);
                this._program.setUniform("uMaterialSpecular", material.specular);
                this._program.setUniform("uMaterialShine", material.shine);
                this._program.setUniform("uMaterialEmit", material.emit);
                this._program.setUniform("uMaterialAlpha", material.alpha);

                this._lastMaterialStateId = node.materialState._stateId;

                /* If highlighting then override material's baseColor. We'll also force a
                 * material state change for the next node, otherwise otherwise the highlight
                 * may linger in the shader uniform if there is no material state change for the next node.
                 */
                if (node.flagsState && node.flagsState.flags.highlight) {
                    this._program.setUniform("uMaterialBaseColor", material.highlightBaseColor);
                    this._lastMaterialStateId = null;
                }
            }

            /*----------------------------------------------------------------------------------------------------------
             * pick color
             *--------------------------------------------------------------------------------------------------------*/

            if (node.pickState && node.pickState._stateId != this._lastPickStateId) {
                this._program.setUniform("uPickColor", node.pickState.pickColor);
            }

            /*----------------------------------------------------------------------------------------------------------
             * Draw the geometry;  When wireframe option is set we'll render
             * triangle primitives as wireframe
             * TODO: should we also suppress shading in the renderer? This will currently apply phong shading to the lines.
             *--------------------------------------------------------------------------------------------------------*/

            var primitive = node.geoState.geo.primitive;
            if (node.rendererState && node.rendererState.props.props.wireframe) {
                if (primitive == context.TRIANGLES ||
                    primitive == context.TRIANGLE_STRIP ||
                    primitive == context.TRIANGLE_FAN) {

                    primitive = context.LINES;
                }
            }
            context.drawElements(
                    primitive,
                    node.geoState.geo.indexBuf.numItems,
                    context.UNSIGNED_SHORT,
                    0);
        };

        /**
         * Called after all nodes rendered for the current frame
         */
        this.cleanup = function() {
            canvas.context.flush();
            //            if (this._lastRendererState) {
            //                this._lastRendererState.props.restoreProps(canvas.context);
            //            }
            //            if (this._program) {
            //                this._program.unbind();
            //            }
        };
    }
            )
            ();


    //-----------------------------------------------------------------------------------------------------------------
    //  Shader generation
    //-----------------------------------------------------------------------------------------------------------------

    function getSceneHash() {
        if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
            return ([canvas.canvasId, "picking"]).join(";");
        } else {
            return ([
                canvas.canvasId,
                rendererState.hash,
                fogState.hash,
                lightState.hash,
                texState.hash,
                clipState.hash,
                deformState.hash,
                morphState.hash,
                geoState.hash]).join(";");
        }
    }

    function getProgram(stateHash) {
        if (!programs[stateHash]) {
            SceneJS._loggingModule.info("Creating shader: '" + stateHash + "'");
            var vertexShaderSrc = composeVertexShader();
            var fragmentShaderSrc = composeFragmentShader();
            SceneJS._memoryModule.allocate(
                    canvas.context,
                    "shader",
                    function() {
                        try {
                            programs[stateHash] = new SceneJS._webgl_Program(
                                    stateHash,
                                    time,
                                    canvas.context,
                                    [vertexShaderSrc],
                                    [fragmentShaderSrc],
                                    SceneJS._loggingModule);

                        } catch (e) {
                            SceneJS._loggingModule.debug("Vertex shader:");
                            SceneJS._loggingModule.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                            SceneJS._loggingModule.debug("Fragment shader:");
                            SceneJS._loggingModule.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                            throw SceneJS._errorModule.fatalError(e);
                        }
                    });
        }
        var program = programs[stateHash];
        program.lastUsed = time; // For LRU eviction
        return program;
    }

    /**
     * @private
     */
    function getShaderLoggingSource(src) {
        //        var src2 = [];
        //        for (var i = 0; i < src.length; i++) {
        //            var padding = (i < 10) ? "&nbsp;&nbsp;&nbsp;" : ((i < 100) ? "&nbsp;&nbsp;" : (i < 1000 ? "&nbsp;" : ""));
        //            src2.push(i + padding + ": " + src[i]);
        //        }
        //       // return src2.join("<br/>");
        return src.join("");
    }

    /**
     * @private
     */
    function composeVertexShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingVertexShader() : composePickingVertexShader();
    }

    /**
     * @private
     */
    function composeFragmentShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingFragmentShader() : composePickingFragmentShader();
    }

    /**
     * Composes a vertex shader script for rendering mode in current scene state
     * @private
     */
    function composePickingVertexShader() {
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",
            "attribute vec3 aVertex;",
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;"];

        src.push("varying vec4 vViewVertex;");
        src.push("void main(void) {");
        src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");
        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    function composePickingFragmentShader() {
        var clipping = clipState && clipState.clips.length > 0;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"];

        src.push("uniform vec3 uPickColor;");

        /* User-defined clipping vars
         */
        if (clipping) {
            src.push("varying vec4 vViewVertex;");              // View-space vertex
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float uClipMode" + i + ";");
                src.push("uniform vec3  uClipNormal" + i + ";");
                src.push("uniform float uClipDist" + i + ";");
            }
        }

        src.push("void main(void) {");

        /* User-defined clipping logic
         */

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(vViewVertex.xyz, uClipNormal" + i + ") - uClipDist" + i + ";");
                src.push("        if (uClipMode" + i + " == 1.0) {");
                src.push("            if (dist < 0.0) { discard; }");
                src.push("        }");
                src.push("        if (uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
        }

        src.push("    gl_FragColor = vec4(uPickColor.rgb, 1.0);  ");

        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }


    /*===================================================================================================================
     *
     * Rendering vertex shader
     *
     *==================================================================================================================*/

    function isTexturing() {
        if (texState.texture.layers.length > 0) {
            if (geoState.geo.uvBuf || geoState.geo.uvBuf2) {
                return true;
            }
            if (morphState.morph && (morphState.morph.target1.uvBuf || morphState.morph.target1.uvBuf2)) {
                return true;
            }
        }
        return false;
    }

    function isLighting() {
        if (lightState.lights.length > 0) {
            if (geoState.geo.normalBuf) {
                return true;
            }
            if (morphState.morph && morphState.morph.target1.normalBuf) {
                return true;
            }
        }
        return false;
    }

    function composeRenderingVertexShader() {

        var texturing = isTexturing();
        var lighting = isLighting();
        var deforming = deformState.deform && true;
        var morphing = morphState.morph && true;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"
        ];
        src.push("attribute vec3 aVertex;");                // World coordinates

        if (lighting) {
            src.push("attribute vec3 aNormal;");            // Normal vectors
            src.push("uniform   mat4 uMNMatrix;");            // Model normal matrix
            src.push("uniform   mat4 uVNMatrix;");            // View normal matrix

            src.push("varying   vec3 vNormal;");              // Output view normal vector
            src.push("varying   vec3 vEyeVec;");              // Output view eye vector

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("uniform vec3 uLightDir" + i + ";");
                }
                if (light.mode == "point") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }
                if (light.mode == "spot") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }

                src.push("varying vec3 vLightVec" + i + ";");
                src.push("varying float vLightDist" + i + ";");
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("attribute vec2 aUVCoord;");      // UV coords
            }
            if (geoState.geo.uvBuf2) {
                src.push("attribute vec2 aUVCoord2;");     // UV2 coords
            }
        }
        src.push("uniform mat4 uMMatrix;");                // Model matrix
        src.push("uniform mat4 uVMatrix;");                // View matrix
        src.push("uniform mat4 uPMatrix;");                 // Projection matrix

        src.push("varying vec4 vViewVertex;");

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }
        }

        /* Morphing - declare uniforms for target and interpolation factor
         */
        if (morphing) {
            src.push("uniform float uMorphFactor;");       // LERP factor for morph
            if (morphState.morph.target1.vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 aMorphVertex;");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("attribute vec3 aMorphNormal;");
                }
            }
        }

        /* Deformation - declare uniforms for control points
         */
        if (deforming) {
            for (var i = 0, len = deformState.deform.verts.length; i < len; i++) {
                src.push("uniform float uDeformMode" + i + ";");
                src.push("uniform vec3  uDeformVertex" + i + ";");
                src.push("uniform float uDeformWeight" + i + ";");
            }
        }

        src.push("void main(void) {");

        src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");

        if (lighting) {
            src.push("  vec4 tmpNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
        }

        /*
         * Morphing - transform morph targets and interpolate towards it
         */
        if (morphing) {
            if (morphState.morph.target1.vertexBuf) {
                src.push("  vec4 vMorphVertex = uVMatrix * (uMMatrix * vec4(aMorphVertex, 1.0)); ");
                src.push("  tmpVertex = vec4(tmpVertex.xyz + mix(tmpVertex.xyz, vMorphVertex.xyz, uMorphFactor), 1.0); ");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("  vec4 vMorphNormal = uVMatrix * (uMMatrix * vec4(aMorphNormal, 1.0)); ");
                    src.push("  tmpNormal = vec4(tmpNormal.xyz + mix(tmpNormal.xyz, vMorphNormal.xyz, 0.0), 1.0); ");
                }
            }
        }

        /*
         * Deformation
         */
        if (deforming) {
            src.push("  vec3 deformVec;");
            src.push("  float deformLen;");
            src.push("  vec3 deformVecSum = vec3(0.0, 0.0, 0.0);");
            src.push("  float deformScalar;");
            for (var i = 0, len = deformState.deform.verts.length; i < len; i++) {
                src.push("deformVec = uDeformVertex" + i + ".xyz - tmpVertex.xyz;");
                src.push("deformLen = length(deformVec);");
                src.push("if (uDeformMode" + i + " == 0.0) {");
                src.push("    deformScalar = deformLen;");
                src.push("} else {");
                src.push("    deformScalar = deformLen * deformLen;");
                src.push("}");
                src.push("deformVecSum += deformVec * -uDeformWeight" + i + " * (1.0 / deformScalar);"); // TODO: weight
            }

            src.push("tmpVertex = vec4(deformVecSum.xyz + tmpVertex.xyz, 1.0);");
        }

        if (lighting) {
            src.push("  vNormal = normalize(tmpNormal.xyz);");

        }

        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");


        /* Lighting
         */
        src.push("  vec3 tmpVec;");
        if (lighting) {
            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("tmpVec = -uLightDir" + i + ";");
                }
                if (light.mode == "point") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex
                }
                if (light.mode == "spot") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex

                }
                src.push("vLightVec" + i + " = tmpVec;");                   // Vector from light to vertex

            }
            src.push("vEyeVec = normalize(-vViewVertex.xyz);");
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("vUVCoord = aUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("vUVCoord2 = aUVCoord2;");
            }
        }
        src.push("}");
        if (debugCfg.logScripts === true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

    /**
     * @private
     */
    function composeRenderingFragmentShader() {
        var texturing = isTexturing();
        var lighting = isLighting();
        var fogging = fogState.fog && true;
        var clipping = clipState && clipState.clips.length > 0;
        var colortrans = colortransState && colortransState.trans;

        var src = ["\n"];

        src.push("#ifdef GL_ES");
        src.push("   precision highp float;");
        src.push("#endif");

        src.push("varying vec4 vViewVertex;");              // View-space vertex

        /* User-defined clipping vars
         */
        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float uClipMode" + i + ";");
                src.push("uniform vec3  uClipNormal" + i + ";");
                src.push("uniform float uClipDist" + i + ";");
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }

            for (var i = 0; i < texState.texture.layers.length; i++) {
                var layer = texState.texture.layers[i];
                src.push("uniform sampler2D uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 uLayer" + i + "Matrix;");
                }
            }
        }

        src.push("uniform vec3  uMaterialBaseColor;");
        src.push("uniform float uMaterialAlpha;");


        src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
        src.push("uniform float uMaterialEmit;");

        src.push("  vec3    ambientValue=uAmbient;");
        src.push("  float   emit    = uMaterialEmit;");

        if (lighting) {
            src.push("varying vec3 n;");
            src.push("varying vec3 vNormal;");                  // View-space normal
            src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye


            src.push("uniform vec3  uMaterialSpecularColor;");
            src.push("uniform float uMaterialSpecular;");
            src.push("uniform float uMaterialShine;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("uniform vec3  uLightColor" + i + ";");
                if (light.mode == "point") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                }
                if (light.mode == "dir") {
                    src.push("uniform vec3   uLightDir" + i + ";");
                }
                if (light.mode == "spot") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                    src.push("uniform vec3   uLightDir" + i + ";");
                    src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                    src.push("uniform float  uLightSpotExp" + i + ";");
                }
                src.push("uniform vec3  uLightAttenuation" + i + ";");
                src.push("varying vec3  vLightVec" + i + ";");         // Vector from light to vertex
                src.push("varying float vLightDist" + i + ";");        // Distance from light to vertex
            }
        }


        /* Fog uniforms
         */
        if (fogging) {
            src.push("uniform float uFogMode;");
            src.push("uniform vec3  uFogColor;");
            src.push("uniform float uFogDensity;");
            src.push("uniform float uFogStart;");
            src.push("uniform float uFogEnd;");
        }

        if (colortrans) {
            src.push("uniform float  uColortransMode ;");
            src.push("uniform vec4   uColortransAdd;");
            src.push("uniform vec4   uColortransScale;");
            src.push("uniform float  uColortransSaturation;");
        }

        //--------------------------------------------------------------------------
        // Main
        //--------------------------------------------------------------------------

        src.push("void main(void) {");
        src.push("  vec3    color   = uMaterialBaseColor;");
        src.push("  float   alpha   = uMaterialAlpha;");

        /* User-defined clipping logic
         */

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(vViewVertex.xyz, uClipNormal" + i + ") - uClipDist" + i + ";");
                src.push("        if (uClipMode" + i + " == 1.0) {");
                src.push("            if (dist < 0.0) { discard; }");
                src.push("        }");
                src.push("        if (uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
        }

        if (lighting) {


            // TODO: Cutaway mode should be available for no lighting

            //            src.push("  float dotEyeNorm = dot(vNormal,vEyeVec);");
            //            src.push("  if (dotEyeNorm > 0.3 || dotEyeNorm < -0.3) discard;");


            src.push("  float   specular=uMaterialSpecular;");
            src.push("  vec3    specularColor=uMaterialSpecularColor;");
            src.push("  float   shine=uMaterialShine;");
            src.push("  float   attenuation = 1.0;");

            src.push("  vec3    normalVec=vNormal;");
        }

        if (texturing) {
            src.push("  vec4    texturePos;");
            src.push("  vec2    textureCoord=vec2(0.0,0.0);");

            for (var i = 0; i < texState.texture.layers.length; i++) {
                var layer = texState.texture.layers[i];

                /* Texture input
                 */
                if (layer.applyFrom == "normal" && lighting) {
                    if (geoState.geo.normalBuf) {
                        src.push("texturePos=vec4(normalVec.xyz, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv") {
                    if (geoState.geo.uvBuf) {
                        src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (geoState.geo.uvBuf2) {
                        src.push("texturePos = vec4(vUVCoord2.s, vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                        continue;
                    }
                }

                /* Texture matrix
                 */
                if (layer.matrixAsArray) {
                    src.push("textureCoord=(uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Alpha from Texture
                 * */
                //   src.push("alpha = texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).a;");

                /* Texture output
                 */

                if (layer.applyTo == "baseColor") {
                    if (layer.blendMode == "multiply") {
                        src.push("color  = color * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    } else {
                        src.push("color  = color + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    }
                }

                if (layer.applyTo == "emit") {
                    if (layer.blendMode == "multiply") {
                        src.push("emit  = emit * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r;");
                    } else {
                        src.push("emit  = emit + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r;");
                    }
                }

                if (layer.applyTo == "specular" && lighting) {
                    if (layer.blendMode == "multiply") {
                        src.push("specular  = specular * (1.0-texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("specular  = specular + (1.0- texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "normals") {
                    src.push("vec3 bump = normalize(texture2D(uSampler" + i + ", textureCoord).xyz * 2.0 - 1.0);");
                    src.push("normalVec *= bump;");
                }
            }
        }

        if (lighting) {
            src.push("  vec3    lightValue      = uAmbient;");
            src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");

            src.push("  vec3    lightVec;");
            src.push("  float   dotN;");
            src.push("  float   spotFactor;");
            src.push("  float   pf;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("lightVec = normalize(vLightVec" + i + ");");

                /* Point Light
                 */
                if (light.mode == "point") {
                    src.push("dotN = max(dot(normalVec, lightVec),0.0);");
                    src.push("if (dotN > 0.0) {");
                    src.push("  attenuation = 1.0 / (" +
                             "  uLightAttenuation" + i + "[0] + " +
                             "  uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                             "  uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    if (light.diffuse) {
                        src.push("  lightValue += dotN *  uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec), vEyeVec),0.0), shine);");
                    }
                    src.push("}");
                }

                /* Directional Light
                 */
                if (light.mode == "dir") {

                    src.push("dotN = max(dot(normalVec,lightVec),0.0);");
                    if (light.diffuse) {
                        src.push("lightValue += dotN * uLightColor" + i + ";");
                    }
                    if (light.specular) {
                        src.push("specularValue += specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec),normalize(vEyeVec)),0.0), shine);");
                    }
                }

                /* Spot light
                 */
                if (light.mode == "spot") {
                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    src.push("if ( spotFactor > 20) {");
                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    src.push("  dotN = max(dot(normalVec,normalize(lightVec)),0.0);");
                    src.push("      if(dotN>0.0){");

                    //                            src.push("          attenuation = spotFactor / (" +
                    //                                     "uLightAttenuation" + i + "[0] + " +
                    //                                     "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                    //                                     "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    src.push("          attenuation = 1;");

                    if (light.diffuse) {
                        src.push("lightValue +=  dotN * uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(normalize(lightVec), normalVec),normalize(vEyeVec)),0.0), shine);");
                    }

                    src.push("      }");
                    src.push("}");
                }
            }
            src.push("if (emit>0.0) lightValue = vec3(1.0, 1.0, 1.0);");
            src.push("vec4 fragColor = vec4(specularValue.rgb + color.rgb * (emit+1.0) * lightValue.rgb, alpha);");
        } else {

            /* No lighting
             */
            src.push("vec4 fragColor = vec4(emit * color.rgb, alpha);");
        }

        /* Fog
         */
        if (fogging) {
            src.push("if (uFogMode != 0.0) {");          // not "disabled"
            src.push("    float fogFact = (1.0 - uFogDensity);");
            src.push("    if (uFogMode != 4.0) {");      // not "constant"
            src.push("       if (uFogMode == 1.0) {");  // "linear"
            src.push("          fogFact *= clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
            src.push("       } else {");                // "exp" or "exp2"
            src.push("          fogFact *= clamp((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0, 1.0);");
            src.push("       }");
            src.push("    }");
            src.push("    fragColor = fragColor * (fogFact + vec4(uFogColor, 1)) * (1.0 - fogFact);");
            src.push("}");
        }

        /* Color transformations
         */
        if (colortrans) {

            src.push("    if (uColortransMode != 0.0) {");     // Not disabled
            /* Desaturate
             */
            src.push("        if (uColortransSaturation < 0.0) {");
            src.push("            float intensity = 0.3 * fragColor.r + 0.59 * fragColor.g + 0.11 * fragColor.b;");
            src.push("            fragColor = vec4((intensity * -uColortransSaturation) + fragColor.rgb * (1.0 + uColortransSaturation), 1.0);");
            src.push("        }");

            /* Scale/add
             */
            src.push("        fragColor = (fragColor * uColortransScale) + uColortransAdd;");
            src.push("    }");
        }

        if (debugCfg.whitewash == true) {
            src.push("    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        } else {
            src.push("    gl_FragColor = fragColor;");
        }

        src.push("}");
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

} )
        ();