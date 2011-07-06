/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 */
var SceneJS_renderModule = new (function() {

    this.DEFAULT_STATE_SORT_DELAY = 10;

    /* Number of frames after each complete display list rebuild at which GL state is re-sorted.
     * To enable sort, is set to a positive number like 5, to prevent continuous re-sort when
     * display list is often rebuilt.
     *
     * Set to 0 to continuously re-sort.
     *
     * Set to -1 to never sort.
     */
    var stateSortDelay = this.DEFAULT_STATE_SORT_DELAY;

    /*----------------------------------------------------------------------
     * ID for each state type
     *--------------------------------------------------------------------*/

    this._GEO = 0;
    this._CLIPS = 1;
    this._COLORTRANS = 2;
    this._FLAGS = 3;
    this._FOG = 4;
    this._IMAGEBUF = 5;
    this._LIGHTS = 6;
    this._MATERIAL = 7;
    this._MORPH = 8;
    this._PICKCOLOR = 9;
    this._TEXTURE = 10;
    this._RENDERER = 11;
    this._MODEL_TRANSFORM = 12;
    this._PROJ_TRANSFORM = 13;
    this._VIEW_TRANSFORM = 14;
    this._PICK_LISTENERS = 15;
    this._RENDER_LISTENERS = 16;
    this._SHADER = 17;

    /*----------------------------------------------------------------------
     * Default state values
     *--------------------------------------------------------------------*/

    /* Default transform matrices
     */
    var DEFAULT_MAT = new Float32Array(SceneJS_math_identityMat4());

    var DEFAULT_NORMAL_MAT = new Float32Array(
            SceneJS_math_transposeMat4(
                    SceneJS_math_inverseMat4(
                            SceneJS_math_identityMat4(),
                            SceneJS_math_mat4())));

    var DEFAULT_CLIPS = {
        clips: [],
        hash: ""
    };

    var DEFAULT_COLOR_TRANS = {
        trans : null,
        hash :"f"
    };

    var DEFAULT_FLAGS = {
        fog: true,              // Fog enabled
        colortrans : true,      // Effect of colortrans enabled
        picking : true,         // Picking enabled
        clipping : true,        // User-defined clipping enabled
        enabled : true,         // Node not culled from traversal
        visible : true,         // Node visible - when false, everything happens except geometry draw
        transparent: false,     // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,        // Show backfaces
        frontface: "ccw"        // Default vertex winding for front face
    };

    var DEFAULT_FOG = {
        fog: null,
        hash: ""
    };

    var DEFAULT_IMAGEBUF = {
        imageBuf: null
    };

    var DEFAULT_LIGHTS = {
        lights: [],
        hash: ""
    };

    var DEFAULT_MATERIAL = {
        material: {
            baseColor :  [ 0.0, 0.0, 0.0 ],
            specularColor :  [ 0.0,  0.0,  0.0 ],
            specular : 1.0,
            shine :  10.0,
            reflect :  0.8,
            alpha :  1.0,
            emit :  0.0
        }
    };

    var DEFAULT_MORPH = {
        morph: null,
        hash: ""
    };

    var DEFAULT_PICK = {
        pickColor: null,
        hash: ""
    };
    var DEFAULT_TEXTURE = {
        layers: [],
        params: {},
        hash: ""
    };

    var DEFAULT_RENDERER = {
        props: null
    };

    var DEFAULT_MODEL_TRANSFORM = {
        mat : DEFAULT_MAT,
        normalMat : DEFAULT_NORMAL_MAT
    };

    var DEFAULT_PROJ_TRANSFORM = {
        mat : DEFAULT_MAT
    };

    var DEFAULT_VIEW_TRANSFORM = {
        mat : DEFAULT_MAT,
        normalMat : DEFAULT_NORMAL_MAT
    };

    var DEFAULT_LISTENERS = {
        listeners : []
    };

    var DEFAULT_SHADER = {
        shader : {}
    };

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    /** Shader programs currently allocated on all canvases
     */
    var programs = {};

    var debugCfg;                       // Debugging configuration for this module

    /* A state set for each scene
     */
    var sceneStates = {};

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    var states;
    var nodeMap;
    var stateMap;
    var nextStateId;

    var idPrefix;

    var nextProgramId = 0;

    this.COMPILE_SCENE = 0;     // When we set a state update, rebuilding entire scene from scratch
    this.COMPILE_NODES = 1;   //

    var compileMode; // DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation

    var picking; // True when picking

    /* Currently exported states
     */
    var flagsState;
    var rendererState;
    var lightState;
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
    var morphState;
    var pickListenersState;
    var renderListenersState;
    var shaderState;

    /** Current scene state hash
     */
    var stateHash;

    var rebuildBins = true;
    var rebuildShaders = true;


    var transparentBin = [];  // Temp buffer for transparent nodes, used when rendering

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.INIT,
            function() {
                debugCfg = SceneJS_debugModule.getConfigs("shading");
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                for (var programId in programs) {  // Just free allocated programs
                    programs[programId].destroy();
                }
                programs = {};
                nextProgramId = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_CREATED,
            function(params) {
                var sceneId = params.sceneId;

                if (!sceneStates[sceneId]) {

                    sceneStates[sceneId] = {
                        sceneId: sceneId,

                        canvas: params.canvas,

                        nodeRenderer: new SceneJS_NodeRenderer({
                            canvas: params.canvas.canvas,
                            context: params.canvas.context
                        }),

                        boundaries : [],        // Node boundaries packed in one array
                        boundaryNodes : [],     // Maps boundary index to node ID

                        bin: [],
                        nodeMap: {},
                        geoNodesMap : {},        // Display list nodes findable by their geometry scene nodes
                        stateMap: {},
                        rendersUntilSort: stateSortDelay
                    };
                }
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {

            });

    /**
     * Sets the number of frames after each complete display list rebuild
     * at which GL state is re-sorted. To enable sort, set this to a positive
     * number like 5, to prevent continuous re-sort when display list is
     * often rebuilt.
     *
     * +n - lazy-sort after n frames
     *  0 - continuously re-sort.
     * -1 - never sort.
     * Undefined - select default.
     *
     * @param stateSortDelay
     */
    this.setStateSortDelay = function(stateSortDelay) {
        stateSortDelay = typeof stateSortDelay == "number" ? stateSortDelay == undefined : this.DEFAULT_STATE_SORT_DELAY;
    };

    /**
     * Prepares renderer for new scene graph compilation pass
     */
    this.bindScene = function(params, options) {
        options = options || {};

        /* Activate states for scene
         */
        states = sceneStates[params.sceneId];
        nodeMap = states.nodeMap;
        stateMap = states.stateMap;

        stateHash = null;

        idPrefix = null;

        if (options.compileMode == SceneJS_renderModule.COMPILE_SCENE) {        // Rebuild display list for entire scene

            /* Going to rebuild the state graph as we recompile
             * the entire scene graph. We'll set the state soup to
             * defaults, prepare to rebuild the node bins and shaders
             */

            clipState = DEFAULT_CLIPS;
            colortransState = DEFAULT_COLOR_TRANS;
            flagsState = DEFAULT_FLAGS;
            fogState = DEFAULT_FOG;
            imageBufState = DEFAULT_IMAGEBUF;
            lightState = DEFAULT_LIGHTS;
            materialState = DEFAULT_MATERIAL;
            morphState = DEFAULT_MORPH;
            pickState = DEFAULT_PICK;
            rendererState = DEFAULT_RENDERER;
            texState = DEFAULT_TEXTURE;
            modelXFormState = DEFAULT_MODEL_TRANSFORM;
            projXFormState = DEFAULT_PROJ_TRANSFORM;
            viewXFormState = DEFAULT_VIEW_TRANSFORM;
            pickListenersState = DEFAULT_LISTENERS;
            renderListenersState = DEFAULT_LISTENERS;
            shaderState = DEFAULT_SHADER;


            flagsState._refCount = 0;
            rendererState._refCount = 0;
            lightState._refCount = 0;
            colortransState._refCount = 0;
            materialState._refCount = 0;
            fogState._refCount = 0;
            modelXFormState._refCount = 0;
            viewXFormState._refCount = 0;
            projXFormState._refCount = 0;
            texState._refCount = 0;
            pickState._refCount = 0;
            imageBufState._refCount = 0;
            clipState._refCount = 0;
            morphState._refCount = 0;
            pickListenersState._refCount = 0;
            renderListenersState._refCount = 0;
            shaderState._refCount = 0;

            rebuildBins = true;              // Rebuild render bins
            rebuildShaders = true;           // Rebuilding shaders - always when rebuilding state graph

            nextStateId = 0;                 // Ready to ID new states

            //  nextProgramId = 0;           // Ready to ID new programs

            nodeMap = states.nodeMap = {};
            stateMap = states.stateMap = {};

            forceBinSort(true);             // Sort display list with orders re-built from layer orders

        } else if (options.compileMode == SceneJS_renderModule.COMPILE_NODES) {   // Rebuild display list for subtree

            /* Going to overwrite selected state graph nodes
             * as we partially recompile portions of the scene graph.
             *
             * We'll preserve the state graph and shaders.
             */

            rebuildBins = false;             // Retain render bins
            rebuildShaders = false;          // Might rebuild shaders, depending on level of compile

            nodeMap = states.nodeMap;
            stateMap = states.stateMap;

            if (options.resort) {
                forceBinSort(true);         // Sort display list with orders re-built from layer orders
            }
        }

        compileMode = options.compileMode;

        picking = false;
    };


    this.marshallStates = function() {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_RENDERING, { fullCompile : compileMode === SceneJS_renderModule.COMPILE_SCENE });
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * State setting/updating
     *----------------------------------------------------------------------------------------------------------------*/

    /**
     * Set when pre/post compiling instance nodes, this is prefixed to all IDs
     * by getState to disambiguate when the ID'd nodes are within instances
     */
    this.setIDPrefix = function(id) {
        idPrefix = id;
    };

    /** Find or create a new state of the given state type and node ID
     * @param stateType ID of the type of state, eg.  this._TEXTURE etc
     * @param id ID of scene graph node that is setting this state
     */
    function getState(stateType, id) {
        if (idPrefix) {
            id = idPrefix + id;
        }
        var state;
        var typeMap = stateMap[stateType];
        if (!typeMap) {
            typeMap = stateMap[stateType] = {};
        }
        if (compileMode != SceneJS_renderModule.COMPILE_SCENE) {
            state = typeMap[id];
            if (!state) {
                state = {
                    _id: id,
                    _stateId : nextStateId,
                    _stateType: stateType,
                    _refCount: 0
                };
                typeMap[id] = state;
            }
        } else {

            /* Recompiling entire scene graph
             */
            state = {
                _id: id,
                _stateId : nextStateId,
                _stateType: stateType,
                _refCount: 0
            };
            if (id) {
                typeMap[id] = state;
            }
        }

        nextStateId++;

        if (rebuildBins) {
            states.bin = [];
            rebuildBins = false;
        }
        return state;
    }

    /**
     * Release a state after detach from display node. Destroys node if usage count is then zero.
     */
    function releaseState(state) {
        if (state._refCount <= 0) {
            return;
        }
        if (--state._refCount == 0) {
            var typeMap = stateMap[state._stateType];
            if (typeMap) {
                delete typeMap[state.id];
            }
        }
    }

    /**
     * Set the current world-space clipping planes
     */
    this.setClips = function(id, clips) {
        clipState = getState(this._CLIPS, id || "___DEFAULT_CLIPS");
        clips = clips || [];
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
            if (clips.length > 0) {
                var hash = [];
                for (var i = 0; i < clips.length; i++) {
                    var clip = clips[i];
                    hash.push(clip.mode);
                }
                clipState.hash = hash.join("");
            } else {
                clipState.hash = "";
            }
            stateHash = null;
        }
        clipState.clips = clips;
    };

    /**
     * Set the current color transform
     */
    this.setColortrans = function(id, trans) {
        colortransState = getState(this._COLORTRANS, id || "___DEFAULT_COLOR_TRANS");
        colortransState.trans = trans;
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
            colortransState.hash = trans ? "t" : "f";
            stateHash = null;
        }
    };

    /**
     * Set the current flags
     */
    this.setFlags = function(id, flags) {
        flagsState = getState(this._FLAGS, id || "___DEFAULT_FLAGS");
        flagsState.flags = flags || DEFAULT_FLAGS;
    };

    /**
     * Set the current fog
     */
    this.setFog = function(id, fog) {
        fogState = getState(this._FOG, id || "___DEFAULT_FOG");
        fogState.fog = fog;
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
            fogState.hash = fog ? fog.mode : "";
            stateHash = null;
        }
    };

    /**
     * Set the current image buffer
     */
    this.setImagebuf = function(id, imageBuf) {
        imageBufState = getState(this._IMAGEBUF, id || "___DEFAULT_IMAGEBUF");
        imageBufState.imageBuf = imageBuf;
    };

    /**
     * Set the current world-space light sources
     */
    this.setLights = function(id, lights) { // TODO: what to do with the ID
        lights = lights || [];
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
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
            lightState.hash = hash.join("");
            stateHash = null;
        }
        lightState = getState(this._LIGHTS, id || "___DEFAULT_LIGHTS");
        lightState.lights = lights;
    };

    /**
     * Set the current surface material
     */
    this.setMaterial = function(id, material) {
        materialState = getState(this._MATERIAL, id || "___DEFAULT_MATERIAL");
        materialState.material = material || DEFAULT_MATERIAL.material;
    };

    /**
     * Set model-space morph targets
     */
    this.setMorph = function(id, morph) {
        morphState = getState(this._MORPH, id || "___DEFAULT_MORPH");
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
            if (morph) {
                var target1 = morph.target1;
                morphState.hash = ([
                    target1.vertexBuf ? "t" : "f",
                    target1.normalBuf ? "t" : "f",
                    target1.uvBuf ? "t" : "f",
                    target1.uvBuf2 ? "t" : "f"]).join("")
            } else {
                morphState.hash = "";
            }
            stateHash = null;
        }
        morphState.morph = morph;
    };

    /**
     * Pick color is only expected to be set within a pick traversal
     */
    this.setPickColor = function(id, pickColor) {
        pickState = getState(this._PICKCOLOR, id || "___DEFAULT_PICK");
        pickState.pickColor = pickColor;
        stateHash = null;
    };

    /**
     * Set the current textures. Each layer can have a texture object, which
     * can be null when that layer's texture has not yet loaded.
     */
    this.setTexture = function(id, texture) {
        texState = getState(this._TEXTURE, id || "___DEFAULT_TEXTURE");
        texture = texture || {};
        var layers = texture.layers || [];
        if (compileMode == SceneJS_renderModule.COMPILE_SCENE) {   // Only make hash for full recompile
            var hashStr;
            if (layers.length > 0) {
                var hash = [];
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
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
            texState.hash = hashStr;
            stateHash = null;
        }
        texState.layers = layers;
        texState.params = texture.params || {};
    };

    /**
     * Set the current renderer configs
     */
    this.setRenderer = function(id, props) {
        rendererState = getState(this._RENDERER, id || "___DEFAULT_RENDERER");
        rendererState.props = props;
        stateHash = null;
    };

    /**
     * Set the current model matrix and model normal matrix
     */
    this.setModelTransform = function(id, mat, normalMat) {
        modelXFormState = getState(this._MODEL_TRANSFORM, id || "___DEFAULT_MODEL_TRANSFORM");
        modelXFormState.mat = mat || DEFAULT_MAT;
        modelXFormState.normalMat = normalMat || DEFAULT_NORMAL_MAT;
    };

    /**
     * Set the current projection matrix
     */
    this.setProjectionTransform = function(id, mat) {
        projXFormState = getState(this._PROJ_TRANSFORM, id || "___DEFAULT_PROJ_TRANSFORM");
        projXFormState.mat = mat || DEFAULT_MAT;
    };

    /**
     * Set the current view matrix and view normal matrix
     */
    this.setViewTransform = function(id, mat, normalMat, lookAt) {
        viewXFormState = getState(this._VIEW_TRANSFORM, id || "___DEFAULT_VIEW_TRANSFORM");
        viewXFormState.mat = mat || DEFAULT_MAT;
        viewXFormState.normalMat = normalMat || DEFAULT_NORMAL_MAT;
        viewXFormState.lookAt = lookAt || SceneJS_math_LOOKAT_ARRAYS;
    };

    /**
     * Set the current pick listeners
     */
    this.setPickListeners = function(id, listeners) {
        pickListenersState = getState(this._PICK_LISTENERS, id || "___DEFAULT_PICK_LISTENERS");
        pickListenersState.listeners = listeners || [];
    };

    /**
     * Set the current node render listeners
     */
    this.setRenderListeners = function(id, listeners) {
        renderListenersState = getState(this._RENDER_LISTENERS, id || "___DEFAULT_RENDER_LISTENERS");
        renderListenersState.listeners = listeners || [];
    };

    /**
     * Set model-space shader targets
     */
    this.setShader = function(id, shader) {
        shaderState = getState(this._SHADER, id || "___DEFAULT_SHADER");
        shaderState.shader = shader || {};
        shaderState.hash = id;
        stateHash = null;
    };

    /**
     * Add a geometry and link it to currently active resources (states)
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
     * Next, we'll build a program hash code by concatenating the hashes on
     * the state soup elements, then use that to create (or re-use) a shader program
     * that is equipped to render the current state soup elements.
     *
     * Then we create the state graph node, which has the program and pointers to
     * the current state soup elements.
     *

     */
    this.setGeometry = function(geoId, geo) {

        /* Pull in dirty states from other modules
         */
        this.marshallStates();

        var node;
        var id;

        if (compileMode != SceneJS_renderModule.COMPILE_SCENE) {

            /* Dynamic state reattachment for scene branch compilation.
             *
             * Attach new states that have been generated for this display node during scene
             * graph branch recompilation. The only kinds of states can be regenerated in this
             * way are those that can be created/destroyed on any node type, such as flags and
             * listeners. Other state types do not apply because they are bound to particular
             * node types, and any change to those would have resulted in a complete scene graph
             * recompilation.
             *
             * A reference count is incremented on newly attached states, and decremented on
             * previously attached states as they are detached. Those states are then destroyed
             * if their reference count has dropped to zero.
             *
             */
            if (idPrefix) {
                id = idPrefix + geoId;
            }
            node = nodeMap[id];
            if (node.renderListenersState._stateId != renderListenersState._stateId) {
                releaseState(node.renderListenersState);
                node.renderListenersState = renderListenersState;
                renderListenersState._refCount++;
            }
//            if (node.flagsState._stateId != flagsState._stateId) {
//                releaseState(node.flagsState);
//                node.flagsState = flagsState;
//                flagsState._refCount++;
//            }
            return;
        }

        /*
         */

        geoState = getState(this._GEO, geoId);
        geoState.geo = geo;
        geoState.hash = ([                           // Safe to build geometry hash here - geometry is immutable
            geo.normalBuf ? "t" : "f",
            geo.uvBuf ? "t" : "f",
            geo.uvBuf2 ? "t" : "f",
            geo.colorBuf ? "t" : "f"]).join("");

        /* Identify what GLSL is required for the current state soup elements
         */
        if (!stateHash) {
            stateHash = getSceneHash();
        }

        /* Create or re-use a program
         */
        var program = getProgram(stateHash);    // Touches for LRU cache

        if (idPrefix) {
            id = idPrefix + geoId;
        }

        geoState._refCount++;
        flagsState._refCount++;
        rendererState._refCount++;
        lightState._refCount++;
        colortransState._refCount++;
        materialState._refCount++;
        fogState._refCount++;
        modelXFormState._refCount++;
        viewXFormState._refCount++;
        projXFormState._refCount++;
        texState._refCount++;
        pickState._refCount++;
        imageBufState._refCount++;
        clipState._refCount++;
        morphState._refCount++;
        pickListenersState._refCount++;
        renderListenersState._refCount++;
        shaderState._refCount++;

        node = {
            id: id,

            sortId: 0,  // Lazy-create later

            stateHash : stateHash,

            program : program,

            geoState:               geoState,
            flagsState:             flagsState,
            rendererState:          rendererState,
            lightState:             lightState,
            colortransState :       colortransState,
            materialState:          materialState,
            fogState :              fogState,
            modelXFormState:        modelXFormState,
            viewXFormState:         viewXFormState,
            projXFormState:         projXFormState,
            texState:               texState,
            pickState :             pickState,        // Will be DEFAULT_PICK because we are compiling whole scene here
            imageBufState :         imageBufState,
            clipState :             clipState,
            morphState :            morphState,
            pickListenersState:     pickListenersState,
            renderListenersState:   renderListenersState,
            shaderState:            shaderState,

            layerName:              SceneJS_layerModule.getLayer()
        };

        states.nodeMap[id] = node;

        states.bin.push(node);

        /* Make the display list node findable by its geometry scene nodes
         */
        var geoNodeMap = states.geoNodesMap[geoId];
        if (!geoNodeMap) {
            geoNodeMap = states.geoNodesMap[geoId] = [];
        }
        geoNodeMap.push(node);

        /* If node has boundary, add to BVH
         */
        //  SceneJS._bvhModule.insertNode(geo.boundary, states.sceneId, id);
    };

    this._attachState = function(node, stateName, soupState) {
        var state = node[stateName];
        if (state && state._stateId != soupState._stateId) {
            releaseState(state);
        }
        node[stateName] = soupState;
        soupState._refCount++;
        return soupState;
    };

    /**
     * Removes a geometry, which deletes the associated display list node. Linked states then get their reference
     * counts decremented. States whose reference count becomes zero are deleted.
     *
     * This may be done outside of a render pass.
     */
    this.removeGeometry = function(sceneId, geoId) {
        var sceneState = sceneStates[sceneId];
        var geoNodesMap = sceneState.geoNodesMap;
        var nodes = geoNodesMap[geoId];
        if (!nodes) {
            return;
        }
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            node.destroyed = true;  // Differ node destruction to bin render time, when we'll know it's bin index
            releaseProgram(node.program);
            releaseState(node.geoState);
            releaseState(node.flagsState);
            releaseState(node.rendererState);
            releaseState(node.lightState);
            releaseState(node.colortransState);
            releaseState(node.materialState);
            releaseState(node.fogState);
            releaseState(node.modelXFormState);
            releaseState(node.viewXFormState);
            releaseState(node.projXFormState);
            releaseState(node.texState)
            releaseState(node.pickState);
            releaseState(node.imageBufState);
            releaseState(node.clipState);
            releaseState(node.morphState);
            releaseState(node.pickListenersState);
            releaseState(node.renderListenersState);
            releaseState(node.shaderState);
        }
        geoNodesMap[geoId] = null;
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * Bin pre-sorting
     *----------------------------------------------------------------------------------------------------------------*/

    function createSortIDs(bin) {
        if (states.needSortIds) {
            var node;
            var layerPriority;
            for (var i = 0, len = bin.length; i < len; i++) {
                node = bin[i];
                if (node.layerName) {
                    layerPriority = SceneJS_layerModule.getLayerPriority(node.layerName) || 0;
                    node.sortId = (layerPriority * 100000) + node.program.id;
                } else {
                    node.sortId = node.program.id;
                }
            }
            states.needSortIds = false;
        }
    }

    //    function hintBinSort() {
    //        states.rendersUntilSort = stateSortDelay;
    //        states.needSort = false;
    //    }

    function forceBinSort(rebuildSortIDs) {
        if (rebuildSortIDs) {
            states.needSortIds = rebuildSortIDs;
        }
        states.rendersUntilSort = 0;
        states.needSort = true;
    }

    /**
     * Presorts bins by shader program - shader switches are most
     * pathological because they force all other state switches.
     */
    function preSortBins() {
        if (states.needSortIds) {
            createSortIDs(states.bin);
        }
        states.bin.sort(sortNodes);
    }

    var sortNodes = function(a, b) {
        return a.sortId - b.sortId;
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering
     *----------------------------------------------------------------------------------------------------------------*/

    this.renderFrame = function(params) {
        if (!states) {
            throw  SceneJS_errorModule.fatalError("No scene bound");
        }
        params = params || {};
        if (states.needSort) {
            preSortBins();
            states.needSort = false;
        } else {
            if (stateSortDelay >= 0) {
                states.rendersUntilSort--;
                if (states.rendersUntilSort == 0) { // Will not sort again until >= 0
                    states.needSort = true;
                }
            }
        }
        var doProfile = params.profileFunc ? true : false;
        var nodeRenderer = states.nodeRenderer;
        nodeRenderer.init({ doProfile: doProfile });
        renderBin(states.bin, false); //Not picking
        nodeRenderer.cleanup();
        states = null;
        if (doProfile) {
            params.profileFunc(nodeRenderer.profile);
        }
    };

    function renderBin(bin, picking) {

        var enabledLayers = SceneJS_layerModule.getEnabledLayers();
        var context = states.canvas.context;
        var nTransparent = 0;
        var node;
        var countDestroyed = 0;
        var i, len = bin.length;
        var flags;

        //  var sceneBVH = SceneJS._bvhModule.sceneBVH[states.sceneId];

        /* Render opaque nodes while buffering transparent nodes.
         * Layer order is preserved independently within opaque and transparent bins.
         * At each node that is marked destroyed, we'll just slice it out of the bin array instead.
         */
        for (i = 0; i < len; i++) {
            node = bin[i];

            if (node.destroyed) {
                if (i < len) {
                    countDestroyed++;
                    bin[i] = bin[i + countDestroyed];
                }
                continue;
            }

            if (countDestroyed > 0) {
                bin[i] = bin[i + countDestroyed];
            }

            if (node.layerName && !enabledLayers[node.layerName]) {     // Skip disabled layers
                continue;
            }

            flags = node.flagsState.flags;

            if (flags.enabled === false) {                              // Skip disabled node
                continue;
            }

            if (picking && flags.picking === false) {                   // When picking, skip unpickable node
                continue;
            }

            if (!picking && flags.transparent === true) {               // Buffer transparent node when not picking
                transparentBin[nTransparent++] = node;

            } else {
                states.nodeRenderer.renderNode(node);                   // Render node if opaque or in picking mode
            }
        }

        if (countDestroyed > 0) {
            bin.length -= countDestroyed;
        }

        /* Render transparent nodes with blending
         */
        if (nTransparent > 0) {
            context.enable(context.BLEND);
            context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);  // Default - may be overridden by flags
            for (i = 0,len = nTransparent; i < len; i++) {
                node = transparentBin[i];
                states.nodeRenderer.renderNode(node);
            }
            context.disable(context.BLEND);
        }
    }

    //-----------------------------------------------------------------------------------------------------------------
    //  Shader generation
    //-----------------------------------------------------------------------------------------------------------------

    function getSceneHash() {
        return ([                           // Same hash for both render and pick shaders
            states.canvas.canvasId,
            rendererState.hash,
            fogState.hash,
            lightState.hash,
            texState.hash,
            clipState.hash,
            morphState.hash,
            geoState.hash
        ]).join(";");
    }

    function getProgram(stateHash) {
        var program = programs[stateHash];
        if (!program) {
            if (debugCfg.logScripts === true) {
                SceneJS_loggingModule.info("Creating render and pick shaders: '" + stateHash + "'");
            }
            program = programs[stateHash] = {
                id: nextProgramId++,
                render: createShader(composeRenderingVertexShader(), composeRenderingFragmentShader()),
                pick: createShader(composePickingVertexShader(), composePickingFragmentShader()),
                stateHash: stateHash,
                refCount: 0
            };
        }
        program.refCount++;
        return program;
    }

    function releaseProgram(program) {
        if (--program.refCount <= 0) {
            program.render.destroy();
            program.pick.destroy();
            programs[program.stateHash] = null;
        }
    }

    function createShader(vertexShaderSrc, fragmentShaderSrc) {
        try {
            return new SceneJS_webgl_Program(
                    stateHash,
                    states.canvas.context,
                    [vertexShaderSrc.join("\n")],
                    [fragmentShaderSrc.join("\n")],
                    SceneJS_loggingModule);

        } catch (e) {
            console.error("-----------------------------------------------------------------------------------------:");
            console.error("Failed to create SceneJS Shader");
            console.error("SceneJS Version: " + SceneJS.VERSION);
            console.error("Error message: " + e);
            console.error("");
            console.error("Vertex shader:");
            console.error("");
            logShaderLoggingSource(vertexShaderSrc);
            console.error("");
            console.error("Fragment shader:");
            logShaderLoggingSource(fragmentShaderSrc);
            console.error("-----------------------------------------------------------------------------------------:");
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ERROR, "Failed to create SceneJS Shader: " + e);
        }
    }

    function logShaderLoggingSource(src) {
        for (var i = 0, len = src.length; i < len; i++) {
            console.error(src[i]);
        }
    }

    function composePickingVertexShader() {

        var customShaders = shaderState.shader.shaders || {};

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var clipping = clipState.clips.length > 0;
        var morphing = morphState.morph && true;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",
            "attribute vec3 SCENEJS_aVertex;",
            "uniform mat4 SCENEJS_uMMatrix;",
            "uniform mat4 SCENEJS_uVMatrix;",
            "uniform mat4 SCENEJS_uPMatrix;"];

        if (clipping || fragmentHooks.worldPosClip) {
            src.push("varying vec4 SCENEJS_vWorldVertex;");
        }

        if (fragmentHooks.viewPosClip) {
            src.push("varying vec4 SCENEJS_vViewVertex;\n");
        }

        if (customVertexShader.code) {
            src.push("\n" + customVertexShader.code + "\n");
        }

        if (morphing) {
            src.push("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (morphState.morph.target1.vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 SCENEJS_aMorphVertex;");
            }
        }

        src.push("void main(void) {");
        src.push("   vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (vertexHooks.modelPos) {
            src.push("tmpVertex=" + vertexHooks.modelPos + "(tmpVertex);");
        }

        if (morphing) {
            if (morphState.morph.target1.vertexBuf) {
                src.push("  vec4 vMorphVertex = vec4(SCENEJS_aMorphVertex, 1.0); ");

                if (vertexHooks.modelPos) {
                    src.push("vMorphVertex=" + vertexHooks.modelPos + "(vMorphVertex);");
                }

                src.push("  tmpVertex = vec4(mix(tmpVertex.xyz, vMorphVertex.xyz, SCENEJS_uMorphFactor), 1.0); ");
            }
        }

        src.push("  tmpVertex = SCENEJS_uMMatrix * tmpVertex; ");

        if (vertexHooks.worldPos) {
            src.push("tmpVertex=" + vertexHooks.worldPos + "(tmpVertex);");
        }

        if (clipping || fragmentHooks.worldPosClip) {
            src.push("  SCENEJS_vWorldVertex = tmpVertex; ");
        }

        src.push("  tmpVertex = SCENEJS_uVMatrix * tmpVertex; ");

        if (vertexHooks.viewPos) {
            src.push("tmpVertex=" + vertexHooks.viewPos + "(tmpVertex);");
        }

        if (fragmentHooks.viewPosClip) {
            src.push("  SCENEJS_vViewVertex = tmpVertex;");
        }

        src.push("  gl_Position = SCENEJS_uPMatrix * tmpVertex;");
        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    }

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    function composePickingFragmentShader() {

        var customShaders = shaderState.shader.shaders || {};
        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var clipping = clipState && clipState.clips.length > 0;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"];

        if (clipping || fragmentHooks.worldPosClip) {
            src.push("varying vec4 SCENEJS_vWorldVertex;");             // World-space vertex
        }

        if (fragmentHooks.viewPosClip) {
            src.push("varying vec4 SCENEJS_vViewVertex;");              // View-space vertex
        }

        src.push("uniform vec3 SCENEJS_uPickColor;");

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float SCENEJS_uClipMode" + i + ";");
                src.push("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }


        /*-----------------------------------------------------------------------------------
         * Custom GLSL - situated here to use SceneJS-managed variables
         *----------------------------------------------------------------------------------*/

        if (customFragmentShader.code) {
            src.push("\n" + customFragmentShader.code + "\n");
        }

        src.push("void main(void) {");

        if (fragmentHooks.worldPosClip) {
            src.push("if (" + fragmentHooks.worldPosClip + "(SCENEJS_vWorldVertex) == false) { discard; };");
        }
        if (fragmentHooks.viewPosClip) {
            src.push("if (!" + fragmentHooks.viewPosClip + "(SCENEJS_vViewVertex) == false) { discard; };");
        }

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (SCENEJS_uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w;");
                src.push("        if (SCENEJS_uClipMode" + i + " == 1.0) {");
                src.push("            if (dist < 0.0) { discard; }");
                src.push("        }");
                src.push("        if (SCENEJS_uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
        }
        src.push("    gl_FragColor = vec4(SCENEJS_uPickColor.rgb, 1.0);  ");
        src.push("}");
        // }

        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    }


    /*===================================================================================================================
     *
     * Rendering vertex shader
     *
     *==================================================================================================================*/

    function isTexturing() {
        if (texState.layers.length > 0) {
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

        var customShaders = shaderState.shader.shaders || {};

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};


        var texturing = isTexturing();
        var lighting = isLighting();
        var fogging = fogState.fog && true;
        var clipping = clipState.clips.length > 0;
        var morphing = morphState.morph && true;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"
        ];

        src.push("attribute vec3 SCENEJS_aVertex;");                // Model coordinates

        /*-----------------------------------------------------------------------------------
         * Variables - Lighting
         *----------------------------------------------------------------------------------*/

        if (lighting) {
            src.push("uniform vec3 SCENEJS_uEye;");             // World-space eye position

            src.push("attribute vec3 SCENEJS_aNormal;");        // Normal vectors
            src.push("uniform   mat4 SCENEJS_uMNMatrix;");      // Model normal matrix
            src.push("uniform   mat4 SCENEJS_uVNMatrix;");      // View normal matrix

            src.push("varying   vec3 SCENEJS_vNormal;");        // Output world-space vertex normal vector
            src.push("varying   vec3 SCENEJS_vEyeVec;");        // Output world-space eye vector

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("uniform vec3 SCENEJS_uLightDir" + i + ";");
                }
                if (light.mode == "point") {
                    src.push("uniform vec4 SCENEJS_uLightPos" + i + ";");
                }
                if (light.mode == "spot") {
                    src.push("uniform vec4 SCENEJS_uLightPos" + i + ";");
                }

                /* Vector from vertex to light, packaged with the pre-computed length of that vector
                 */
                src.push("varying vec4 SCENEJS_vLightVecAndDist" + i + ";");    // varying for fragment lighting
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("attribute vec2 SCENEJS_aUVCoord;");      // UV coords
            }
            if (geoState.geo.uvBuf2) {
                src.push("attribute vec2 SCENEJS_aUVCoord2;");     // UV2 coords
            }
        }

        /* Vertex color variables
         */
        if (geoState.geo.colorBuf) {
            src.push("attribute vec4 SCENEJS_aVertexColor;");       // UV2 coords
            src.push("varying vec4 SCENEJS_vColor;");               // Varying for fragment texturing
        }

        src.push("uniform mat4 SCENEJS_uMMatrix;");                 // Model matrix
        src.push("uniform mat4 SCENEJS_uVMatrix;");                 // View matrix
        src.push("uniform mat4 SCENEJS_uPMatrix;");                 // Projection matrix

        if (clipping || fragmentHooks.worldPosClip) {
            src.push("varying vec4 SCENEJS_vWorldVertex;");         // Varying for fragment clip or world pos hook
        }

        if (fragmentHooks.viewPosClip || fogging) {
            src.push("varying vec4 SCENEJS_vViewVertex;");          // Varying for fragment view clip hook
        }

        if (texturing) {                                            // Varyings for fragment texturing
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 SCENEJS_vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 SCENEJS_vUVCoord2;");
            }
        }

        /*-----------------------------------------------------------------------------------
         * Variables - Morphing
         *----------------------------------------------------------------------------------*/

        if (morphing) {
            src.push("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (morphState.morph.target1.vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 SCENEJS_aMorphVertex;");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("attribute vec3 SCENEJS_aMorphNormal;");
                }
            }
        }

        if (customVertexShader.code) {
            src.push("\n" + customVertexShader.code + "\n");
        }

        src.push("void main(void) {");
        src.push("vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (vertexHooks.modelPos) {
            src.push("tmpVertex=" + vertexHooks.modelPos + "(tmpVertex);");
        }

        src.push("  vec4 modelVertex = tmpVertex; ");
        if (lighting) {
            src.push("  vec4 modelNormal = vec4(SCENEJS_aNormal, 0.0); ");
        }

        /*
         * Morphing - morph targets are in same model space as the geometry
         */
        if (morphing) {
            if (morphState.morph.target1.vertexBuf) {
                src.push("  vec4 vMorphVertex = vec4(SCENEJS_aMorphVertex, 1.0); ");
                src.push("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, SCENEJS_uMorphFactor), 1.0); ");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("  vec4 vMorphNormal = vec4(SCENEJS_aMorphNormal, 1.0); ");
                    src.push("  modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, 0.0), 1.0); ");
                }
            }
        }

        src.push("  vec4 worldVertex = SCENEJS_uMMatrix * modelVertex; ");

        if (vertexHooks.worldPos) {
            src.push("worldVertex=" + vertexHooks.worldPos + "(worldVertex);");
        }

        if (lighting) { // Transform normal from model to view space
            src.push("  vec4 worldNormal = SCENEJS_uMNMatrix * modelNormal; ");
        }

        src.push("  vec4 viewVertex  = SCENEJS_uVMatrix * worldVertex; ");

        if (vertexHooks.viewPos) {
            src.push("viewVertex=" + vertexHooks.viewPos + "(viewVertex);");    // Vertex hook function
        }

        if (lighting) {
            src.push("  SCENEJS_vNormal = normalize(worldNormal.xyz);");
        }

        if (clipping || fragmentHooks.worldPosClip) {
            src.push("  SCENEJS_vWorldVertex = worldVertex;");                  // Varying for fragment world clip or hooks
        }

        if (fragmentHooks.viewPosClip || fogging) {
            src.push("  SCENEJS_vViewVertex = viewVertex;");                    // Varying for fragment hooks
        }

        src.push("  gl_Position = SCENEJS_uPMatrix * viewVertex;");

        /*-----------------------------------------------------------------------------------
         * Logic - Lighting
         *
         * Transform the world-space lights into view space
         *----------------------------------------------------------------------------------*/

        src.push("  vec3 tmpVec3;");
        if (lighting) {                                                         // Varyings for fragment lighting
            var light;
            for (var i = 0; i < lightState.lights.length; i++) {
                light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("SCENEJS_vLightVecAndDist" + i + " = vec4(-normalize(SCENEJS_uLightDir" + i + "), 0.0);");
                }
                if (light.mode == "point") {
                    src.push("tmpVec3 = (SCENEJS_uLightPos" + i + ".xyz - worldVertex.xyz);");
                    src.push("SCENEJS_vLightVecAndDist" + i + " = vec4(normalize(tmpVec3), length(tmpVec3));");
                }
                if (light.mode == "spot") {

                }
            }
            src.push("SCENEJS_vEyeVec = normalize(SCENEJS_uEye - worldVertex.xyz);");
        }

        if (texturing) {                                                        // varyings for fragment texturing
            if (geoState.geo.uvBuf) {
                src.push("SCENEJS_vUVCoord = SCENEJS_aUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("SCENEJS_vUVCoord2 = SCENEJS_aUVCoord2;");
            }
        }

        if (geoState.geo.colorBuf) {
            src.push("SCENEJS_vColor = SCENEJS_aVertexColor;");                 // Varyings for fragment interpolated vertex coloring
        }
        src.push("}");


        if (debugCfg.logScripts === true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    }

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering Fragment shader
     *---------------------------------------------------------------------------------------------------------------*/

    function composeRenderingFragmentShader() {

        var customShaders = shaderState.shader.shaders || {};
        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var texturing = isTexturing();
        var lighting = isLighting();
        var fogging = fogState.fog && true;
        var clipping = clipState && clipState.clips.length > 0;
        var colortrans = colortransState && colortransState.trans;

        var src = ["\n"];

        src.push("#ifdef GL_ES");
        src.push("   precision highp float;");
        src.push("#endif");


        if (clipping || fragmentHooks.worldPos || fragmentHooks.worldPosClip) {
            src.push("varying vec4 SCENEJS_vWorldVertex;");             // World-space vertex
        }

        if (fragmentHooks.viewPosClip || fogging) {
            src.push("varying vec4 SCENEJS_vViewVertex;");              // View-space vertex
        }

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float SCENEJS_uClipMode" + i + ";");
                src.push("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 SCENEJS_vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 SCENEJS_vUVCoord2;");
            }

            for (var i = 0; i < texState.layers.length; i++) {
                var layer = texState.layers[i];
                src.push("uniform sampler2D SCENEJS_uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 SCENEJS_uLayer" + i + "Matrix;");
                }
            }
        }


        /* Vertex color variable
         */
        if (geoState.geo.colorBuf) {
            src.push("varying vec4 SCENEJS_vColor;");
        }

        src.push("uniform vec3  SCENEJS_uAmbient;");                         // Scene ambient colour - taken from clear colour

        src.push("uniform vec3  SCENEJS_uMaterialBaseColor;");
        src.push("uniform float SCENEJS_uMaterialAlpha;");
        src.push("uniform float SCENEJS_uMaterialEmit;");
        src.push("uniform vec3  SCENEJS_uMaterialSpecularColor;");
        src.push("uniform float SCENEJS_uMaterialSpecular;");
        src.push("uniform float SCENEJS_uMaterialShine;");

        src.push("  vec3    ambientValue=SCENEJS_uAmbient;");
        src.push("  float   emit    = SCENEJS_uMaterialEmit;");

        if (lighting) {
            src.push("varying vec3 SCENEJS_vNormal;");                  // View-space normal
            src.push("varying vec3 SCENEJS_vEyeVec;");                  // Direction of view-space vertex from eye

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("uniform vec3  SCENEJS_uLightColor" + i + ";");
                if (light.mode == "point") {
                    src.push("uniform vec3  SCENEJS_uLightAttenuation" + i + ";");
                }
                //                if (light.mode == "spot") {
                //                   src.push("uniform vec3   SCENEJS_uLightDir" + i + ";");
                //                    src.push("uniform float  SCENEJS_uLightCutOff" + i + ";");
                //                    src.push("uniform float  SCENEJS_uLightSpotExp" + i + ";");
                //                }
                src.push("varying vec4  SCENEJS_vLightVecAndDist" + i + ";");         // Vector from light to vertex
            }
        }


        /* Fog uniforms
         */
        if (fogging) {
            src.push("uniform float SCENEJS_uFogMode;");
            src.push("uniform vec3  SCENEJS_uFogColor;");
            src.push("uniform float SCENEJS_uFogDensity;");
            src.push("uniform float SCENEJS_uFogStart;");
            src.push("uniform float SCENEJS_uFogEnd;");
        }

        if (colortrans) {
            src.push("uniform float  SCENEJS_uColorTransMode ;");
            src.push("uniform vec4   SCENEJS_uColorTransAdd;");
            src.push("uniform vec4   SCENEJS_uColorTransScale;");
            src.push("uniform float  SCENEJS_uColorTransSaturation;");
        }

        if (customFragmentShader.code) {
            src.push("\n" + customFragmentShader.code + "\n");
        }

        src.push("void main(void) {");

        if (fragmentHooks.worldPosClip) {
            src.push("if (" + fragmentHooks.worldPosClip + "(SCENEJS_vWorldVertex) == false) { discard; };");
        }

        if (fragmentHooks.viewPosClip) {
            src.push("if (!" + fragmentHooks.viewPosClip + "(SCENEJS_vViewVertex) == false) { discard; };");
        }

        if (geoState.geo.colorBuf) {
            src.push("  vec3    color   = SCENEJS_vColor.rgb;");
            //                src.push("  float   alpha   = SCENEJS_vColor.a;");
        } else {
            src.push("  vec3    color   = SCENEJS_uMaterialBaseColor;");
            //                src.push("  float   alpha   = SCENEJS_uMaterialAlpha;");
        }

        src.push("  float alpha         = SCENEJS_uMaterialAlpha;");
        src.push("  float emit          = SCENEJS_uMaterialEmit;");
        src.push("  float specular      = SCENEJS_uMaterialSpecular;");
        src.push("  vec3  specularColor = SCENEJS_uMaterialSpecularColor;");
        src.push("  float shine         = SCENEJS_uMaterialShine;");


        if (fragmentHooks.materialBaseColor) {
            src.push("color=" + fragmentHooks.materialBaseColor + "(color);");
        }
        if (fragmentHooks.materialAlpha) {
            src.push("alpha=" + fragmentHooks.materialAlpha + "(alpha);");
        }
        if (fragmentHooks.materialEmit) {
            src.push("emit=" + fragmentHooks.materialEmit + "(emit);");
        }
        if (fragmentHooks.materialSpecular) {
            src.push("specular=" + fragmentHooks.materialSpecular + "(specular);");
        }
        if (fragmentHooks.materialSpecularColor) {
            src.push("specularColor=" + fragmentHooks.materialSpecularColor + "(specularColor);");
        }
        if (fragmentHooks.materialShine) {
            src.push("shine=" + fragmentHooks.materialShine + "(shine);");
        }
        //                if (fragmentHooks.worldPos) {
        //                    src.push("worldVertex=" + hooks.worldPos + "(worldVertex);");
        //                }
        //                if (fragmentHooks.normal) {
        //                    src.push("normalVec=" + hooks.normal + "(normalVec);");
        //                }


        /*-----------------------------------------------------------------------------------
         * Logic - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (SCENEJS_uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w;");
                src.push("        if (SCENEJS_uClipMode" + i + " == 1.0) {");
                src.push("            if (dist < 0.0) { discard; }");
                src.push("        }");
                src.push("        if (SCENEJS_uClipMode" + i + " == 2.0) {");
                src.push("            if (dist > 0.0) { discard; }");
                src.push("        }");
                src.push("    }");
            }
        }

        if (lighting) {


            // TODO: Cutaway mode should be available for no lighting

            //            src.push("  float dotEyeNorm = dot(SCENEJS_vNormal,SCENEJS_vEyeVec);");
            //            src.push("  if (dotEyeNorm > 0.3 || dotEyeNorm < -0.3) discard;");


            //                src.push("  float   specular=SCENEJS_uMaterialSpecular;");
            //                src.push("  vec3    specularColor=SCENEJS_uMaterialSpecularColor;");
            //                src.push("  float   shine=SCENEJS_uMaterialShine;");
            src.push("  float   attenuation = 1.0;");

            src.push("  vec3    normalVec=SCENEJS_vNormal;");
        }

        if (texturing) {
            src.push("  vec4    texturePos;");
            src.push("  vec2    textureCoord=vec2(0.0,0.0);");

            for (var i = 0; i < texState.layers.length; i++) {
                var layer = texState.layers[i];

                /* Texture input
                 */
                if (layer.applyFrom == "normal" && lighting) {
                    if (geoState.geo.normalBuf) {
                        src.push("texturePos=vec4(normalVec.xyz, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv") {
                    if (geoState.geo.uvBuf) {
                        src.push("texturePos = vec4(SCENEJS_vUVCoord.s, SCENEJS_vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (geoState.geo.uvBuf2) {
                        src.push("texturePos = vec4(SCENEJS_vUVCoord2.s, SCENEJS_vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                        continue;
                    }
                }

                /* Texture matrix
                 */
                if (layer.matrixAsArray) {
                    src.push("textureCoord=(SCENEJS_uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Alpha from Texture
                 * */
                if (layer.applyTo == "alpha") {
                    if (layer.blendMode == "multiply") {
                        src.push("alpha = alpha * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b;");
                    } else if (layer.blendMode == "add") {
                        src.push("alpha = alpha + texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b;");
                    }
                }

                /* Texture output
                 */

                if (layer.applyTo == "baseColor") {
                    if (layer.blendMode == "multiply") {
                        src.push("color  = color * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    } else {
                        src.push("color  = color + texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    }
                }

                if (layer.applyTo == "emit") {
                    if (layer.blendMode == "multiply") {
                        src.push("emit  = emit * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r;");
                    } else {
                        src.push("emit  = emit + texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r;");
                    }
                }

                if (layer.applyTo == "specular" && lighting) {
                    if (layer.blendMode == "multiply") {
                        src.push("specular  = specular * (1.0-texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("specular  = specular + (1.0- texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "normals") {
                    src.push("vec3 bump = normalize(texture2D(SCENEJS_uSampler" + i + ", textureCoord).xyz * 2.0 - 1.0);");
                    src.push("normalVec *= -bump;");
                }
            }
        }

        if (lighting) {
            src.push("  vec3    lightValue      = SCENEJS_uAmbient;");
            src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");

            src.push("  vec3    lightVec;");
            src.push("  float   dotN;");
            src.push("  float   spotFactor;");
            src.push("  float   pf;");
            src.push("  float   lightDist;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("lightVec = SCENEJS_vLightVecAndDist" + i + ".xyz;");

                /* Point Light
                 */
                if (light.mode == "point") {

                    src.push("lightDist = SCENEJS_vLightVecAndDist" + i + ".w;");

                    src.push("dotN = max(dot(normalVec, lightVec),0.0);");
                    src.push("if (dotN > 0.0) {");
                    src.push("  attenuation = 1.0 / (" +
                             "  SCENEJS_uLightAttenuation" + i + "[0] + " +
                             "  SCENEJS_uLightAttenuation" + i + "[1] * lightDist + " +
                             "  SCENEJS_uLightAttenuation" + i + "[2] * lightDist * lightDist);");
                    if (light.diffuse) {
                        src.push("  lightValue += dotN *  SCENEJS_uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * SCENEJS_uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec), SCENEJS_vEyeVec),0.0), shine);");
                    }
                    src.push("}");
                }

                /* Directional Light
                 */
                if (light.mode == "dir") {

                    src.push("dotN = max(dot(normalVec,lightVec),0.0);");

                    if (light.diffuse) {
                        src.push("lightValue += dotN * SCENEJS_uLightColor" + i + ";");
                    }
                    if (light.specular) {
                        src.push("specularValue += specularColor * SCENEJS_uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec),normalize(SCENEJS_vEyeVec)),0.0), shine);");
                    }
                }

                /* Spot light
                 */
                if (light.mode == "spot") {

                    //                    src.push("lightDist = SCENEJS_vLightVecAndDist" + i + ".w;");
                    //
                    //                    src.push("spotFactor = max(dot(normalize(SCENEJS_uLightDir" + i + "), lightVec));");
                    //                    src.push("if ( spotFactor > 20) {");
                    //                    src.push("  spotFactor = pow(spotFactor, SCENEJS_uLightSpotExp" + i + ");");
                    //                    src.push("  dotN = max(dot(normalVec,lightVec),0.0);");
                    //                    src.push("      if(dotN>0.0){");

                    //                            src.push("          attenuation = spotFactor / (" +
                    //                                     "SCENEJS_uLightAttenuation" + i + "[0] + " +
                    //                                     "SCENEJS_uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                    //                                     "SCENEJS_uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    src.push("          attenuation = 1;");

                    if (light.diffuse) {
                        src.push("lightValue +=  dotN * SCENEJS_uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * SCENEJS_uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec),normalize(SCENEJS_vEyeVec)),0.0), shine);");
                    }

                    src.push("      }");
                    src.push("}");
                }
            }

            src.push("vec4 fragColor = vec4((specularValue.rgb + color.rgb * lightValue.rgb) + (emit * color.rgb), alpha);");
        } else {

            /* No lighting
             */
            src.push("vec4 fragColor = vec4(emit * color.rgb, alpha);");
        }

        /* Fog
         */
        if (fogging) {
            src.push("if (SCENEJS_uFogMode != 0.0) {");          // not "disabled"
            src.push("    float fogFact = (1.0 - SCENEJS_uFogDensity);");
            src.push("    if (SCENEJS_uFogMode != 4.0) {");      // not "constant"
            src.push("       if (SCENEJS_uFogMode == 1.0) {");  // "linear"
            src.push("          fogFact *= clamp(pow(max((SCENEJS_uFogEnd - length(-SCENEJS_vViewVertex.xyz)) / (SCENEJS_uFogEnd - SCENEJS_uFogStart), 0.0), 2.0), 0.0, 1.0);");
            src.push("       } else {");                // "exp" or "exp2"
            src.push("          fogFact *= clamp((SCENEJS_uFogEnd - length(-SCENEJS_vViewVertex.xyz)) / (SCENEJS_uFogEnd - SCENEJS_uFogStart), 0.0, 1.0);");
            src.push("       }");
            src.push("    }");
            src.push("    fragColor = fragColor * (fogFact + vec4(SCENEJS_uFogColor, 1)) * (1.0 - fogFact);");
            src.push("}");
        }

        /* Color transformations
         */
        if (colortrans) {
            src.push("    if (SCENEJS_uColorTransMode != 0.0) {");     // Not disabled
            src.push("        if (SCENEJS_uColorTransSaturation < 0.0) {");
            src.push("            float intensity = 0.3 * fragColor.r + 0.59 * fragColor.g + 0.11 * fragColor.b;");
            src.push("            fragColor = vec4((intensity * -SCENEJS_uColorTransSaturation) + fragColor.rgb * (1.0 + SCENEJS_uColorTransSaturation), 1.0);");
            src.push("        }");
            src.push("        fragColor = (fragColor * SCENEJS_uColorTransScale) + SCENEJS_uColorTransAdd;");
            src.push("    }");
        }

        if (fragmentHooks.pixelColor) {
            src.push("fragColor=" + fragmentHooks.pixelColor + "(fragColor);");
        }

        if (debugCfg.whitewash == true) {
            src.push("    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        } else {
            src.push("    gl_FragColor = fragColor;");
        }
        src.push("}");


        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    }

    this.pick = function(params, options) {
        states = sceneStates[params.sceneId];
        return pickFrame(params.sceneId, params.canvasX, params.canvasY, options);
    };

    function pickFrame(sceneId, canvasX, canvasY, options) {
        //if (!states.pickBufferActive) {
        createPickBuffer();
        bindPickBuffer();
        states.nodeRenderer.init({ picking: true });
        renderBin(states.bin, true);
        states.pickBufferActive = true;
        states.nodeRenderer.cleanup();
        //}
        var pickIndex = readPickBuffer(canvasX, canvasY);
        var wasPicked = false;
        var pickListeners = states.nodeRenderer.pickListeners[pickIndex];
        if (pickListeners) {
            var listeners = pickListeners.listeners;
            for (var i = listeners.length - 1; i >= 0; i--) {
                wasPicked = true;
                listeners[i]({ canvasX: canvasX, canvasY: canvasY }, options);
            }
        }
        unbindPickBuffer();
        return wasPicked;
    }

    function deactivatePick() {

    }

    function createPickBuffer() {
        var canvas = states.canvas;
        var gl = canvas.context;
        var width = canvas.canvas.width;
        var height = canvas.canvas.height;
        var pickBuf = states.pickBuf;
        if (pickBuf) { // Currently have a pick buffer
            if (pickBuf.width == width && pickBuf.height) { // Canvas size unchanged, buffer still good
                return;
            } else { // Buffer needs reallocation for new canvas size

                gl.deleteTexture(pickBuf.texture);
                gl.deleteFramebuffer(pickBuf.frameBuf);
                gl.deleteRenderbuffer(pickBuf.renderBuf);
            }
        }

        pickBuf = states.pickBuf = {
            frameBuf : gl.createFramebuffer(),
            renderBuf : gl.createRenderbuffer(),
            texture : gl.createTexture(),
            width: width,
            height: height
        };

        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.frameBuf);

        gl.bindTexture(gl.TEXTURE_2D, pickBuf.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        try {
            // Do it the way the spec requires
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        } catch (exception) {
            // Workaround for what appears to be a Minefield bug.
            var textureStorage = new WebGLUnsignedByteArray(width * height * 3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, textureStorage);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, pickBuf.renderBuf);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickBuf.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickBuf.renderBuf);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /* Verify framebuffer is OK
         */
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuf.frameBuf);
        if (!gl.isFramebuffer(pickBuf.frameBuf)) {
            throw  SceneJS_errorModule.fatalError("Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw  SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw  SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw  SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw  SceneJS_errorModule.fatalError("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw  SceneJS_errorModule.fatalError("Incomplete framebuffer: " + status);
        }
    }

    function bindPickBuffer() {
        var context = states.canvas.context;
        context.bindFramebuffer(context.FRAMEBUFFER, states.pickBuf.frameBuf);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.disable(context.BLEND);
    }

    /** Reads pick buffer pixel at given coordinates, returns index of associated listener else (-1)
     */
    function readPickBuffer(pickX, pickY) {
        var canvas = states.canvas.canvas;
        var context = states.canvas.context;

        var x = pickX;
        var y = canvas.height - pickY;
        var pix = new Uint8Array(4);
        context.readPixels(x, y, 1, 1, context.RGBA, context.UNSIGNED_BYTE, pix);

        var pickedNodeIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        return (pickedNodeIndex >= 1) ? pickedNodeIndex - 1 : -1;
    }

    function unbindPickBuffer() {
        var context = states.canvas.context;
        context.bindFramebuffer(context.FRAMEBUFFER, null);
    }
})();