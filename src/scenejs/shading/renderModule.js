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
    var rendererState;
    var lightState;
    var boundaryState;
    var materialState;
    var highlightState;
    var fogState;
    var texState;
    var geoState;
    var modelXFormState;
    var viewXFormState;
    var projXFormState;
    var pickState;
    var imageBufState;

    /** Bin set for the currently-active canvas
     */
    var binSet;

    /** Shader programs currently allocated on all canvases
     */
    var programs = {};

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
                rendererState = {
                    props: {},
                    hash: ""
                };
                lightState = {
                    lights: [],
                    hash: ""
                };
                boundaryState = null;
                materialState = {
                    material: {
                        _stateId : nextStateId++,
                        baseColor : [ 0.5, 0.5, 0.5 ],
                        specularColor: [ 0.9,  0.9,  0.9 ],
                        specular : 200,
                        shine : 1,
                        reflect : 0,
                        alpha : 1.0,
                        emit : 0.7,
                        opacity: 1.0
                    },
                    hash: ""
                };
                highlightState = null;
                fogState = null;
                texState = {
                    _stateId : nextStateId++,
                    layers: [],
                    hash: ""
                };
                geoState = null;
                imageBufState = null;

                /* Prepare initial set of empty node bins
                 */
                binSet = {
                    opaqueNodes : [],
                    transpNodes : []
                };
            });

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
            });

    /* When boundary state exported, add it to the state soup.
     * We don't need a hash identity since it's not renderable.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.BOUNDARY_EXPORTED,
            function(params) {
                boundaryState = {
                    _stateId : nextStateId++,
                    boundary: params.boundary,
                    hash: ""
                };
            });

    /* When material state exported, add it to the state soup. We don't need
     * a GLSL hash for material since our GLSL happens to be generic for
     * material attributes.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MATERIAL_EXPORTED,
            function(material) {
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
                        emit : material.emit != undefined ? material.emit : 0.0,
                        opacity : material.opacity != undefined ? material.opacity : 1.0
                    },
                    hash: ""
                };
            });

    /* When highlight state exported, add it to the state soup.
     * We don't need a hash identity since our GLSL is generic for highlighting.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.HIGHLIGHT_EXPORTED,
            function(params) {
                highlightState = {
                    _stateId : nextStateId++,
                    highlighted: params.highlighted,
                    hash: ""
                };
            });

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
            });

    /* When fog state exported, add it to the state soup and make
     * hash code for its GLSL fragment
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.FOG_EXPORTED,
            function(fog) {
                fogState = {
                    _stateId : nextStateId++,
                    fog: fog,
                    hash: fog.mode
                };
            });

    /* When model matrix exported, add it to the state soup.
     * We don't need a GLSL hash for it since our GLSL always
     * expects a modelling matrix.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MODEL_TRANSFORM_EXPORTED,
            function(transform) {
                modelXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray,
                    normalMat : transform.normalMatrixAsArray
                };
            });

    /* When view matrix exported, add it to the state soup.
     * We don't need a GLSL hash for it since our GLSL always
     * expects a view matrix.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_EXPORTED,
            function(transform) {
                viewXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray,
                    normalMat : transform.normalMatrixAsArray
                };
            });

    /* When projection matrix exported, add it to the state soup.
     * We don't need a GLSL hash for it since our GLSL always
     * expects a projection matrix.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_EXPORTED,
            function(transform) {
                projXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.IMAGEBUFFER_EXPORTED,
            function(params) {
                imageBufState = {
                    _stateId : nextStateId++,
                    imageBuf: params.imageBuf
                };
            });

    /* When geometry exported, add it to the state soup and make
     * GLSL hash code on the VBOs it provides.
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
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.GEOMETRY_EXPORTED,
            function(geo) {

                /* Add geometry to state soup
                 */
                geoState = {
                    _stateId : nextStateId++,
                    geo:geo,
                    hash: ([
                        geo.normalBuf ? "t" : "f",
                        geo.uvBuf ? "t" : "f",
                        geo.uvBuf2 ? "t" : "f"]).join("")
                };

                /* Ensure the rest of the state soup is marshalled
                 */
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_RENDERING);

                //if (materialState.material.opacity != 1.0) {
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_NEEDS_BOUNDARIES);
                //}

                /* Identify what GLSL is required for the current state soup elements
                 */
                var sceneHash = getSceneHash();

                /* Create or re-use a program
                 */
                var program = getProgram(sceneHash);

                /* Create state graph node, with program and
                 * pointers to current state soup elements
                 */
                var node = {

                    program : {
                        id: sceneHash,
                        program: program
                    },

                    /* Pointers into state soup
                     */
                    boundaryState: boundaryState,
                    geoState: geoState,
                    rendererState: rendererState,
                    lightState: lightState,
                    materialState: materialState,
                    highlightState: highlightState,
                    fogState : fogState,
                    modelXFormState: modelXFormState,
                    viewXFormState: viewXFormState,
                    projXFormState: projXFormState,
                    texState: texState,
                    pickState : pickState ,
                    imageBufState : imageBufState
                };

                /* Put node into either the transoarent or opaque bin,
                 * depending on current material state's opacity
                 */
                if (materialState.material.opacity != undefined && materialState.material.opacity != 1.0) {
                    binSet.transpNodes.push(node);
                } else {
                    binSet.opaqueNodes.push(node);
                }
            });

    /* When the canvas deactivates, we'll render the node bins.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                NodeRenderer.init();
                renderBinSet(binSet);
                NodeRenderer.cleanup();
                canvas = null;
            });


    //    this.redraw = function() {
    //        NodeRenderer.init();
    //        renderBinSet(binSet);
    //    };


    /**
     * Renders the given bin set.
     */
    function renderBinSet(binSet) {
        var nTransparent = binSet.transpNodes.length;

        if (nTransparent == 0) {

            /* Bin set contains no transparent nodes, so we'll just render the opaque ones, Sort them
             * first by program, to minimise the number of shader re-binds we do.
             */
        //    binSet.opaqueNodes.sort(programCmp);
            renderOpaqueNodes(binSet.opaqueNodes);
        }

        if (nTransparent == 1) {

            /* Bin set contains one transparent node, so we'll sort the opaque nodes by program,
             * render those, then render the solitary transparent node with blending enabled.
             */
            binSet.opaqueNodes.sort(programCmp);
            renderOpaqueNodes(binSet.opaqueNodes);
            renderTransparentNodes(binSet.transpNodes);
        }

        if (nTransparent > 1) {

            /* Bin set contains contains many transparent nodes. We'll sort the opaque nodes by program,
             * render those, then sort the transparent nodes by boundary and render those with blending enabled.
             */
            binSet.opaqueNodes.sort(programCmp);
            renderOpaqueNodes(binSet.opaqueNodes);

            //  binSet.transpNodes.sort(boundaryCmp);
            renderTransparentNodes(binSet.transpNodes);
        }
    }

    function renderOpaqueNodes(opaqueNodes) {
        for (var i = 0, len = opaqueNodes.length; i < len; i++) {
            NodeRenderer.renderNode(opaqueNodes[i]);
        }
    }

    function renderTransparentNodes(transpNodes) {
        var context = canvas.context;
        context.blendFunc(context.SRC_ALPHA, context.ONE);
        //context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
        context.enable(context.BLEND);

        for (var i = 0, len = transpNodes.length; i < len; i++) {
            NodeRenderer.renderNode(transpNodes[i]);
        }
        context.disable(context.BLEND);
        context.blendFunc(context.SRC_ALPHA, context.LESS);
    }

    /* Comparator function for sorting nodes by program
     */
    var programCmp = function(node1, node2) {
        if (node1.program.id < node2.program.id) {         // TODO: faster ID for comparison
            return -1;
        } else if (node1.program.id > node2.program.id) {
            return 1;
        } else {
            return 0;
        }
    };

    /* Comparator function for sorting nodes by geometry
     */
    var geoCmp = function(node1, node2) {
        return node1.geoState._stateId - node2.geoState._stateId;
    };

    /* Comparator function for sorting nodes by texture
     */
    var texCmp = function(node1, node2) {
        return node1.texState._stateId - node2.texState._stateId;
    };

    /* Comparator function for sorting nodes by boundary view-space Z-depth
     */
    function boundaryCmp(a, b) {
        if (!a.boundaryState.boundary) {  // Non-bounded opaqueBin to front of list
            return -1;
        }
        if (!b.boundaryState.boundary) {
            return 1;
        }
        return (a.boundaryState.boundary.max[2] - b.boundaryState.boundary.max[2]);
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

                this._lastGeoStateId = -1;
                this._lastLightStateId = -1;
                this._lastTexStateId = -1;
                this._lastMaterialStateId = -1;
                this._lastViewXFormStateId = -1;
                this._lastModelXFormStateId = -1;
                this._lastProjXFormStateId = -1;
                this._lastPickStateId = -1;
                this._lastImageBufStateId = -1;

                this._lastProgramId = node.program.id;
            }

            /* Bind image buffer
             */
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

            /* Bind geometry
             */
            if (node.geoState._stateId != this._lastGeoStateId) {

                var geo = node.geoState.geo;

                /* Disable all vertex arrays
                 */
                for (var k = 0; k < 8; k++) {
                    context.disableVertexAttribArray(k);
                }
                this._lastGeoStateId = node.geoState._stateId;
                if (geo.vertexBuf) {
                    this._program.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                }
                if (geo.normalBuf) {
                    this._program.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                }
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

            /* Bind texture layers
             */
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

            /* Bind fog
             */
            if (node.fogState && node.fogState.fog.mode != "disabled") {
                this._program.setUniform("uFogColor", node.fogState.fog.color);
                this._program.setUniform("uFogDensity", node.fogState.fog.density);
                this._program.setUniform("uFogStart", node.fogState.fog.start);
                this._program.setUniform("uFogEnd", node.fogState.fog.end);
            }

            /* Bind View matrix
             */
            if (node.viewXFormState._stateId != this._lastViewXFormStateId) {
                this._program.setUniform("uVMatrix", node.viewXFormState.mat);
                this._program.setUniform("uVNMatrix", node.viewXFormState.normalMat);
                this._lastViewXFormStateId = node.viewXFormState._stateId;
            }

            /* Bind Model matrix
             */
            if (node.modelXFormState._stateId != this._lastModelXFormStateId) {
                this._program.setUniform("uMMatrix", node.modelXFormState.mat);
                this._program.setUniform("uMNMatrix", node.modelXFormState.normalMat);
                this._lastModelXFormStateId = node.modelXFormState._stateId;
            }

            /* Bind Projection matrix
             */
            if (node.projXFormState._stateId != this._lastProjXFormStateId) {
                this._program.setUniform("uPMatrix", node.projXFormState.mat);
                this._lastProjXFormStateId = node.projXFormState._stateId;
            }

            /* Bind lights
             */
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

            /*
             */
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
                if (node.highlightState && node.highlightState.highlighted) {
                    this._program.setUniform("uMaterialBaseColor", material.highlightBaseColor);
                    this._lastMaterialStateId = null;
                }
            }

            /* Bind pick color
             */
            if (node.pickState && node.pickState._stateId != this._lastPickStateId) {
                this._program.setUniform("uPickColor", node.pickState.pickColor);
            }

            /* Draw the geometry
             */
            context.drawElements(
                    node.geoState.geo.primitive,
                    node.geoState.geo.indexBuf.numItems,
                    context.UNSIGNED_SHORT,
                    0);

        };

        /**
         * Called after all nodes rendered for the current frame
         */
        this.cleanup = function() {
            canvas.context.flush();
            if (this._program) {
                this._program.unbind();
            }
        };
    })();


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
                geoState.hash]).join(";");
        }
    }

    function getProgram(sceneHash) {
        if (!programs[sceneHash]) {
            SceneJS._loggingModule.info("Creating shader: '" + sceneHash + "'");
            var vertexShaderSrc = composeVertexShader();
            var fragmentShaderSrc = composeFragmentShader();
            SceneJS._memoryModule.allocate(
                    canvas.context,
                    "shader",
                    function() {
                        try {
                            programs[sceneHash] = new SceneJS._webgl_Program(
                                    sceneHash,
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
        var program = programs[sceneHash];
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
            "attribute vec3 aVertex;",
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;",
            "void main(void) {",
            "  gl_Position = uPMatrix * (uVMatrix * (uMMatrix * vec4(aVertex, 1.0)));",
            "}"
        ];
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
        //        var g = parseFloat(Math.round((10 + 1) / 256) / 256);  // TODO: use exported pick color
        //        var r = parseFloat((10 - g * 256 + 1) / 256);
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",

            "uniform vec3 uPickColor;",
            "void main(void) {",,
            "    gl_FragColor = vec4(uPickColor.rgb, 1.0);  ",
            "}"
        ];
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }


    /**
     * @private
     */
    function composeRenderingVertexShader() {

        var texturing = texState.texture.layers.length > 0 && (geoState.geo.uvBuf || geoState.geo.uvBuf2);
        var lighting = (lightState.lights.length > 0 && geoState.geo.normalBuf);

        var src = ["\n"];
        src.push("attribute vec3 aVertex;");                // World coordinates

        if (lighting) {
            src.push("attribute vec3 aNormal;");            // Normal vectors
            src.push("uniform mat4 uMNMatrix;");            // Model normal matrix
            src.push("uniform mat4 uVNMatrix;");            // View normal matrix

            src.push("varying vec3 vNormal;");              // Output view normal vector
            src.push("varying vec3 vEyeVec;");              // Output view eye vector

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

        src.push("void main(void) {");
        if (lighting) {
            src.push("  vec4 tmpVNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
            src.push("  vNormal = normalize(tmpVNormal.xyz);");
        }
        src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");

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
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

    /**
     * @private
     */
    function composeRenderingFragmentShader() {
        var texturing = texState && texState.texture.layers.length > 0 && geoState && geoState.geo.uvBuf || geoState.geo.uvBuf2;
        var lighting = lightState && lightState.lights.length > 0 && geoState && geoState.geo.normalBuf;

        var src = ["\n"];

        src.push("#ifdef GL_ES");
        src.push("   precision highp float;");
        src.push("#endif");

        src.push("varying vec4 vViewVertex;");              // View-space vertex

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

        if (lighting) {
            src.push("varying vec3 vNormal;");                  // View-space normal
            src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

            src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
            src.push("uniform float uMaterialEmit;");

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
        if (fogState.fog.mode != "disabled") {
            src.push("uniform vec3  uFogColor;");
            src.push("uniform float uFogDensity;");
            src.push("uniform float uFogStart;");
            src.push("uniform float uFogEnd;");
        }

        src.push("void main(void) {");
        src.push("  vec3    color   = uMaterialBaseColor;");
        src.push("  float   alpha   = uMaterialAlpha;");

        if (lighting) {
            src.push("  vec3    ambientValue=uAmbient;");
            src.push("  float   emit    = uMaterialEmit;");

            src.push("  vec4    normalmap = vec4(vNormal,0.0);");
            src.push("  float   specular=uMaterialSpecular;");
            src.push("  vec3    specularColor=uMaterialSpecularColor;");
            src.push("  float   shine=uMaterialShine;");
            src.push("  float   attenuation = 1.0;");
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
                        src.push("texturePos=vec4(vNormal.xyz, 1.0);");
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
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
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
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal), vEyeVec),0.0), shine);");
                    }
                    src.push("}");
                }

                /* Directional Light
                 */
                if (light.mode == "dir") {
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
                    if (light.diffuse) {
                        src.push("lightValue += dotN * uLightColor" + i + ";");
                    }
                    if (light.specular) {
                        src.push("specularValue += specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal),normalize(vEyeVec)),0.0), shine);");
                    }
                }

                /* Spot light
                 */
                if (light.mode == "spot") {
                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    src.push("if ( spotFactor > 20) {");
                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    src.push("  dotN = max(dot(vNormal,normalize(lightVec)),0.0);");
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
                                 " * specular  * pow(max(dot(reflect(normalize(lightVec), vNormal),normalize(vEyeVec)),0.0), shine);");
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
            src.push("vec4 fragColor = vec4(color.rgb, alpha);");
        }

        /* Fog
         */
        if (fogState.fog.mode != "disabled") {
            src.push("float fogFact=1.0;");
            if (fogState.fog.mode == "exp") {
                src.push("fogFact=clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
            } else if (fogState.fog.mode == "linear") {
                src.push("fogFact=clamp((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0, 1.0);");
            }
            src.push("gl_FragColor = fragColor * fogFact + vec4(uFogColor, 1) * (1.0 - fogFact);");
        } else {
            src.push("gl_FragColor = fragColor;");
        }
        if (debugCfg.whitewash == true) {
            src.push("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        }
        src.push("}");
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

})
        ();