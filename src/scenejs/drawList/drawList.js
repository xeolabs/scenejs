/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 */
var SceneJS_DrawList = new (function() {

    this._DEFAULT_STATE_SORT_DELAY = 10;

    /* Number of frames after each complete display list rebuild at which GL state is re-sorted.
     * To enable sort, is set to a positive number like 5, to prevent continuous re-sort when
     * display list is often rebuilt.
     *
     * Set to 0 to continuously re-sort.
     *
     * Set to -1 to never sort.
     */
    var stateSortDelay = this._DEFAULT_STATE_SORT_DELAY;

    /*----------------------------------------------------------------------
     * ID for each state type
     *--------------------------------------------------------------------*/

    this._GEO = 0;
    this._CLIPS = 1;
    this._COLORTRANS = 2;
    this._FLAGS = 3;
    this._LAYER = 4;
    this._FOG = 5;
    this._IMAGEBUF = 6;
    this._LIGHTS = 7;
    this._MATERIAL = 8;
    this._MORPH = 9;
    this._PICKCOLOR = 10;
    this._TEXTURE = 11;
    this._RENDERER = 12;
    this._MODEL_TRANSFORM = 13;
    this._PROJ_TRANSFORM = 14;
    this._VIEW_TRANSFORM = 15;
    this._PICK_LISTENERS = 16;
    this._NAME = 17;
    this._TAG = 18;
    this._RENDER_LISTENERS = 19;
    this._SHADER = 20;

    /*----------------------------------------------------------------------
     * Default state values
     *--------------------------------------------------------------------*/

    var createState = (function() {
        var stateId = -1;
        return function(data) {
            data._id = stateId;
            data._stateId = stateId--;
            data._nodeCount = 0;
            data._default = true;
            return data;
        };
    })();

    /* Default transform matrices
     */
    this._DEFAULT_MAT = new Float32Array(SceneJS_math_identityMat4());

    this._DEFAULT_NORMAL_MAT = new Float32Array(
            SceneJS_math_transposeMat4(
                    SceneJS_math_inverseMat4(
                            SceneJS_math_identityMat4(),
                            SceneJS_math_mat4())));

    this._DEFAULT_CLIP_STATE = createState({
        clips: [],
        hash: ""
    });

    this._DEFAULT_COLORTRANS_STATE = createState({
        core : null,
        hash :"f"
    });

    this._DEFAULT_FLAGS_STATE = createState({
        flags : {
            fog: true,              // Fog enabled
            colortrans : true,      // Effect of colortrans enabled
            picking : true,         // Picking enabled
            clipping : true,        // User-defined clipping enabled
            enabled : true,         // Node not culled from traversal
            transparent: false,     // Node transparent - works in conjunction with matarial alpha properties
            backfaces: true,        // Show backfaces
            frontface: "ccw"        // Default vertex winding for front face
        }
    });

    this._DEFAULT_LAYER_STATE = createState({
        core: {
            priority : 0,
            enabled: true
        }
    });

    this._DEFAULT_FOG_STATE = createState({
        fog: null,
        hash: ""
    });

    this._DEFAULT_IMAGEBUF_STATE = createState({
        imageBuf: null
    });

    this._DEFAULT_LIGHTS_STATE = createState({
        lights: [],
        hash: ""
    });

    this._DEFAULT_MATERIAL_STATE = createState({
        material: {
            baseColor :  [ 0.0, 0.0, 0.0 ],
            specularColor :  [ 0.0,  0.0,  0.0 ],
            specular : 1.0,
            shine :  10.0,
            reflect :  0.8,
            alpha :  1.0,
            emit :  0.0
        }
    });

    this._DEFAULT_MORPH_STATE = createState({
        morph: null,
        hash: ""
    });

    this._DEFAULT_PICK_COLOR_STATE = createState({
        pickColor: null,
        hash: ""
    });

    this._DEFAULT_PICK_LISTENERS_STATE = createState({
        listeners : []
    });

    this._DEFAULT_NAME_STATE = createState({
        core : null
    });

    this._DEFAULT_TAG_STATE = createState({
        core : null
    });

    this._DEFAULT_TEXTURE_STATE = createState({
        hash: ""
    });

    this._DEFAULT_RENDERER_STATE = createState({
        props: null
    });

    this._DEFAULT_MODEL_TRANSFORM_STATE = createState({
        mat : this._DEFAULT_MAT,
        normalMat : this._DEFAULT_NORMAL_MAT
    });

    this._DEFAULT_PROJ_TRANSFORM_STATE = createState({
        mat : this._DEFAULT_MAT
    });

    this._DEFAULT_VIEW_TRANSFORM_STATE = createState({
        mat : this._DEFAULT_MAT,
        normalMat : this._DEFAULT_NORMAL_MAT,
        lookAt:SceneJS_math_LOOKAT_ARRAYS
    });

    this._DEFAULT_RENDER_LISTENERS_STATE = createState({
        listeners : []
    });

    this._DEFAULT_SHADER_STATE = createState({
        shader : {}
    });

    /** Shader programs currently allocated on all canvases
     */
    this._programs = {};

    var debugCfg;                       // Debugging configuration for this module

    /* A state set for each scene
     */
    this._sceneStates = {};

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    this._states = null;
    this._nodeMap = null;
    this._stateMap = null;
    var nextStateId;

    var nextProgramId = 0;

    this.COMPILE_SCENE = 0;     // When we set a state update, rebuilding entire scene from scratch
    this.COMPILE_BRANCH = 1;   //
    this.COMPILE_NODES = 2;   //

    this.compileMode = null; // DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation

    var picking; // True when picking

    /* Currently exported states
     */
    var flagsState;
    var layerState;
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
    var pickColorState;
    var imageBufState;
    var clipState;
    var morphState;
    var pickListenersState;
    var nameState;
    var tagState;
    var renderListenersState;
    var shaderState;

    /** Current scene state hash
     */
    this._stateHash = null;

    var transparentBin = [];  // Temp buffer for transparent nodes, used when rendering

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    var self = this;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.INIT,
            function() {
                debugCfg = SceneJS_debugModule.getConfigs("shading");
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                for (var programId in self._programs) {  // Just free allocated programs
                    self._programs[programId].destroy();
                }
                self._programs = {};
                nextProgramId = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_CREATED,
            function(params) {
                var sceneId = params.sceneId;

                if (!self._sceneStates[sceneId]) {

                    self._sceneStates[sceneId] = {
                        sceneId: sceneId,

                        canvas: params.canvas,

                        nodeRenderer: new SceneJS_NodeRenderer({
                            canvas: params.canvas.canvas,
                            context: params.canvas.context
                        }),

                        bin: [],                // Draw list - state sorting happens here
                        lenBin: 0,

                        enabledBin: [],          // Draw list containing enabled nodes
                        lenEnabledBin: 0,

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
        stateSortDelay = typeof stateSortDelay == "number" ? stateSortDelay == undefined : this._DEFAULT_STATE_SORT_DELAY;
    };

    /**
     * Prepares renderer for new scene graph compilation pass
     */
    this.bindScene = function(params, options) {

        options = options || {};

        /* Activate states for scene
         */
        this._states = this._sceneStates[params.sceneId];
        this._nodeMap = this._states.nodeMap;
        this._stateMap = this._states.stateMap;

        this._stateHash = null;

        if (options.compileMode == SceneJS_DrawList.COMPILE_SCENE               // Rebuild from whole scene
                || options.compileMode == SceneJS_DrawList.COMPILE_BRANCH) {    // Rebuild from branch(es)

            /* Default state soup
             */

            clipState = this._DEFAULT_CLIP_STATE;
            colortransState = this._DEFAULT_COLORTRANS_STATE;
            flagsState = this._DEFAULT_FLAGS_STATE;
            layerState = this._DEFAULT_LAYER_STATE;
            fogState = this._DEFAULT_FOG_STATE;
            imageBufState = this._DEFAULT_IMAGEBUF_STATE;
            lightState = this._DEFAULT_LIGHTS_STATE;
            materialState = this._DEFAULT_MATERIAL_STATE;
            morphState = this._DEFAULT_MORPH_STATE;
            pickColorState = this._DEFAULT_PICK_COLOR_STATE;
            rendererState = this._DEFAULT_RENDERER_STATE;
            texState = this._DEFAULT_TEXTURE_STATE;
            modelXFormState = this._DEFAULT_MODEL_TRANSFORM_STATE;
            projXFormState = this._DEFAULT_PROJ_TRANSFORM_STATE;
            viewXFormState = this._DEFAULT_VIEW_TRANSFORM_STATE;
            pickListenersState = this._DEFAULT_PICK_LISTENERS_STATE;
            nameState = this._DEFAULT_NAME_STATE;
            tagState = this._DEFAULT_TAG_STATE;
            renderListenersState = this._DEFAULT_RENDER_LISTENERS_STATE;
            shaderState = this._DEFAULT_SHADER_STATE;

            this._forceBinSort(true);             // Sort display list with orders re-built from layer orders

            if (options.compileMode == SceneJS_DrawList.COMPILE_SCENE) {
                this._states.lenBin = 0;

                nextStateId = 0;                                // All new states
                //  nextProgramId = 0;                              // All new programs

                this._nodeMap = this._states.nodeMap = {};
                this._stateMap = this._states.stateMap = {};
            }
        }


        if (options.compileMode == SceneJS_DrawList.COMPILE_NODES) {   // Rebuild display list for subtree

            /* Going to overwrite selected state graph nodes
             * as we partially recompile portions of the scene graph.
             *
             * We'll preserve the state graph and shaders.
             */
            this._nodeMap = this._states.nodeMap;
            this._stateMap = this._states.stateMap;

            if (options.resort) {
                this._forceBinSort(true);         // Sort display list with orders re-built from layer orders
            }
        }

        this.compileMode = options.compileMode;

        picking = false;
    };


    this.marshallStates = function() {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_RENDERING, { fullCompile : this.compileMode === SceneJS_DrawList.COMPILE_SCENE });
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * State setting/updating
     *----------------------------------------------------------------------------------------------------------------*/

    /** Find or create a new state of the given state type and node ID
     * @param stateType ID of the type of state, eg.  this._TEXTURE etc
     * @param id ID of scene graph node that is setting this state
     */
    this._getState = function(stateType, id) {
        var state;
        var typeMap = this._stateMap[stateType];
        if (!typeMap) {
            typeMap = this._stateMap[stateType] = {};
        }
        if (this.compileMode != SceneJS_DrawList.COMPILE_SCENE) {
            state = typeMap[id];
            if (!state) {
                state = {
                    _id: id,
                    _stateId : nextStateId++,
                    _stateType: stateType,
                    _nodeCount: 0
                };
                typeMap[id] = state;
            }
        } else { // Recompiling whole scene
            state = {
                _id: id,
                _stateId : nextStateId++,
                _stateType: stateType,
                _nodeCount: 0
            };
            if (id) {
                typeMap[id] = state;
            }
        }

        return state;
    };

    /**
     * Release a state after detach from display node. Destroys node if usage count is then zero.
     */
    this._releaseState = function(state) {
        if (state._stateType == undefined) {
            return;
        }
        if (state._nodeCount <= 0) {
            return;
        }
        if (--state._nodeCount == 0) {
            var typeMap = this._stateMap[state._stateType];
            if (typeMap) {
                delete typeMap[state.id];
            }
        }
    };

    this.setClips = function(id, clips) {
        if (!id) {
            clipState = this._DEFAULT_CLIP_STATE;
            this._stateHash = null;
            return;
        }
        clipState = this._getState(this._CLIPS, id);
        clips = clips || [];
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
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
            this._stateHash = null;
        }
        clipState.clips = clips;
    };

    this.setColortrans = function(id, core) {
        if (!id) {
            colortransState = this._DEFAULT_COLORTRANS_STATE;
            this._stateHash = null;
            return;
        }
        colortransState = this._getState(this._COLORTRANS, id, true);
        colortransState.core = core;
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
            colortransState.hash = core ? "t" : "f";
            this._stateHash = null;
        }
    };

    this.setFlags = function(id, flags) {
        if (arguments.length == 0) {
            flagsState = this._DEFAULT_FLAGS_STATE;
            return;
        }
        flagsState = this._getState(this._FLAGS, id);
        flags = flags || this._DEFAULT_FLAGS_STATE.flags;
        flagsState.flags = flags || this._DEFAULT_FLAGS_STATE.flags;
        this._states.lenEnabledBin = 0;
    };

    this.setLayer = function(id, core) {
        if (arguments.length == 0) {
            layerState = this._DEFAULT_LAYER_STATE;
            return;
        }
        layerState = this._getState(this._LAYER, id);
        layerState.core = core;
        this._states.lenEnabledBin = 0;
    };

    this.setFog = function(id, fog) {
        if (arguments.length == 0) {
            fogState = this._DEFAULT_FOG_STATE;
            this._stateHash = null;
            return;
        }
        fogState = this._getState(this._FOG, id);
        fogState.fog = fog;
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
            fogState.hash = fog ? fog.mode : "";
            this._stateHash = null;
        }
    };

    this.setImagebuf = function(id, imageBuf) {
        if (arguments.length == 0) {
            imageBufState = this._DEFAULT_IMAGEBUF_STATE;
            return;
        }
        imageBufState = this._getState(this._IMAGEBUF, id);
        imageBufState.imageBuf = imageBuf;
    };

    this.setLights = function(id, lights) {
        if (arguments.length == 0) {
            lightState = this._DEFAULT_LIGHTS_STATE;
            this._stateHash = null;
            return;
        }
        lightState = this._getState(this._LIGHTS, id);
        lights = lights || [];
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
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
            this._stateHash = null;
        }
        lightState.lights = lights;
    };

    this.setMaterial = function(id, material) {
        if (arguments.length == 0) {
            materialState = this._DEFAULT_MATERIAL_STATE;
            return;
        }
        materialState = this._getState(this._MATERIAL, id, true);
        materialState.material = material || this._DEFAULT_MATERIAL_STATE.material;
    };

    this.setMorph = function(id, morph) {
        if (arguments.length == 0) {
            morphState = this._DEFAULT_MORPH_STATE;
            this._stateHash = null;
            return;
        }
        morphState = this._getState(this._MORPH, id);
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
            if (morph) {
                var target0 = morph.targets[0];  // All targets have same arrays
                morphState.hash = ([
                    target0.vertexBuf ? "t" : "f",
                    target0.normalBuf ? "t" : "f",
                    target0.uvBuf ? "t" : "f",
                    target0.uvBuf2 ? "t" : "f"]).join("")
            } else {
                morphState.hash = "";
            }
            this._stateHash = null;
        }
        morphState.morph = morph;
    };

    //    this.setPickColor = function(id, pickColor) {
    //        if (arguments.length == 0) {
    //            pickColorState = this._DEFAULT_PICK_COLOR_STATE;
    //            this._stateHash = null;
    //            return;
    //        }
    //        pickColorState = this._getState(this._PICKCOLOR, id);
    //        pickColorState.pickColor = pickColor;
    //        this._stateHash = null;
    //    };

    this.setTexture = function(id, core) {
        if (arguments.length == 0) {
            texState = this._DEFAULT_TEXTURE_STATE;
            this._stateHash = null;
            return;
        }
        texState = this._getState(this._TEXTURE, id);
        if (true && this.compileMode == SceneJS_DrawList.COMPILE_SCENE) {   // Only make hash for full recompile
            var hashStr;
            if (core && core.layers.length > 0) {
                var layers = core.layers;
                var hash = [];
                for (var i = 0, len = layers.length; i < len; i++) {
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
            this._stateHash = null;
        }
        texState.core = core;
    };

    this.setRenderer = function(id, props) {
        if (arguments.length == 0) {
            rendererState = this._DEFAULT_RENDERER_STATE;
            return;
        }
        rendererState = this._getState(this._RENDERER, id);
        rendererState.props = props;
        this._stateHash = null;
    };

    this.setModelTransform = function(id, mat, normalMat) {
        if (arguments.length == 0) {
            modelXFormState = this._DEFAULT_MODEL_TRANSFORM_STATE;
            return;
        }
        modelXFormState = this._getState(this._MODEL_TRANSFORM, id);
        modelXFormState.mat = mat || this._DEFAULT_MAT;
        modelXFormState.normalMat = normalMat || this._DEFAULT_NORMAL_MAT;
    };

    this.setProjectionTransform = function(id, transform) {
        if (arguments.length == 0) {
            projXFormState = this._DEFAULT_PROJ_TRANSFORM_STATE;
            return;
        }
        projXFormState = this._getState(this._PROJ_TRANSFORM, id);
        projXFormState.mat = transform.matrixAsArray || this._DEFAULT_MAT;
    };

    this.setViewTransform = function(id, mat, normalMat, lookAt) {
        if (arguments.length == 0) {
            viewXFormState = this._DEFAULT_VIEW_TRANSFORM_STATE;
            return;
        }
        viewXFormState = this._getState(this._VIEW_TRANSFORM, id);
        viewXFormState.mat = mat || this._DEFAULT_MAT;
        viewXFormState.normalMat = normalMat || this._DEFAULT_NORMAL_MAT;
        viewXFormState.lookAt = lookAt || SceneJS_math_LOOKAT_ARRAYS;
    };

    this.setPickListeners = function(id, listeners) {
        if (arguments.length == 0) {
            pickListenersState = this._DEFAULT_PICK_LISTENERS_STATE;
            return;
        }
        pickListenersState = this._getState(this._PICK_LISTENERS, id);
        pickListenersState.listeners = listeners || [];
    };

    this.setName = function(id, name) {
        if (arguments.length == 0) {
            nameState = this._DEFAULT_NAME_STATE;
            return;
        }
        nameState = this._getState(this._NAME, id);
        nameState.name = name;             // Can be null
    };

    this.setTag = function(id, core) {
        if (arguments.length == 0) {
            tagState = this._DEFAULT_TAG_STATE;
            return;
        }
        tagState = this._getState(this._TAG, id);
        tagState.core = core;             // Can be null
    };


    this.setRenderListeners = function(id, listeners) {
        if (arguments.length == 0) {
            renderListenersState = this._DEFAULT_RENDER_LISTENERS_STATE;
            return;
        }
        renderListenersState = this._getState(this._RENDER_LISTENERS, id);
        renderListenersState.listeners = listeners || [];
    };

    this.setShader = function(id, shader) {
        if (arguments.length == 0) {
            shaderState = this._DEFAULT_SHADER_STATE;
            return;
        }
        shaderState = this._getState(this._SHADER, id);
        shaderState.shader = shader || {};
        shaderState.hash = id;
        this._stateHash = null;
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
    this.setGeometry = function(id, geo) {

        /* Pull in dirty states from other modules
         */
        this.marshallStates();

        var node;

        if (this.compileMode != SceneJS_DrawList.COMPILE_SCENE) {

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
            node = this._nodeMap[id];
            if (node.renderListenersState._stateId != renderListenersState._stateId) {
                this._releaseState(node.renderListenersState);
                node.renderListenersState = renderListenersState;
                renderListenersState._nodeCount++;
            }
            if (node.pickListenersState._stateId != pickListenersState._stateId) {
                this._releaseState(node.pickListenersState);
                node.pickListenersState = pickListenersState;
                pickListenersState._nodeCount++;
            }
            if (node.flagsState._stateId != flagsState._stateId) {
                this._releaseState(node.flagsState);
                node.flagsState = flagsState;
                flagsState._nodeCount++;
            }
            return;
        }

        /*
         */

        geoState = this._getState(this._GEO, id);
        geoState.geo = geo;
        geoState.hash = ([                           // Safe to build geometry hash here - geometry is immutable
            geo.normalBuf ? "t" : "f",
            geo.uvBuf ? "t" : "f",
            geo.uvBuf2 ? "t" : "f",
            geo.colorBuf ? "t" : "f"]).join("");

        /* Identify what GLSL is required for the current state soup elements
         */
        if (!this._stateHash) {
            this._stateHash = this._getSceneHash();
        }

        /* Create or re-use a program
         */
        var program = this._getProgram(this._stateHash);    // Touches for LRU cache

        geoState._nodeCount++;
        flagsState._nodeCount++;
        layerState._nodeCount++;
        rendererState._nodeCount++;
        lightState._nodeCount++;
        colortransState._nodeCount++;
        materialState._nodeCount++;
        fogState._nodeCount++;
        modelXFormState._nodeCount++;
        viewXFormState._nodeCount++;
        projXFormState._nodeCount++;
        texState._nodeCount++;
        pickColorState._nodeCount++;
        imageBufState._nodeCount++;
        clipState._nodeCount++;
        morphState._nodeCount++;
        pickListenersState._nodeCount++;
        nameState._nodeCount++;
        tagState._nodeCount++;
        renderListenersState._nodeCount++;
        shaderState._nodeCount++;

        node = {
            id: id,

            sortId: 0,  // Lazy-create later

            stateHash : this._stateHash,

            program : program,

            geoState:               geoState,
            layerState:             layerState,
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
            pickColorState :        pickColorState,
            imageBufState :         imageBufState,
            clipState :             clipState,
            morphState :            morphState,
            pickListenersState:     pickListenersState,
            nameState:              nameState,
            tagState:              tagState,
            renderListenersState:   renderListenersState,
            shaderState:            shaderState
        };

        this._states.nodeMap[id] = node;

        this._states.bin[this._states.lenBin++] = node;

        /* Make the display list node findable by its geometry scene node
         */
        var geoNodesMap = this._states.geoNodesMap[id];
        if (!geoNodesMap) {
            geoNodesMap = this._states.geoNodesMap[id] = [];
        }
        geoNodesMap.push(node);
    };

    this._attachState = function(node, stateName, soupState) {
        var state = node[stateName];
        if (state && state._stateId != soupState._stateId) {
            this._releaseState(state);
        }
        node[stateName] = soupState;
        soupState._nodeCount++;
        return soupState;
    };


    /**
     * Removes a geometry, which deletes the associated display list node. Linked states then get their reference
     * counts decremented. States whose reference count becomes zero are deleted.
     *
     * This may be done outside of a render pass.
     */
    this.removeGeometry = function(sceneId, id) {
        var sceneState = this._sceneStates[sceneId];
        var geoNodesMap = sceneState.geoNodesMap;
        var nodes = geoNodesMap[id];
        if (!nodes) {
            return;
        }
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            node.destroyed = true;  // Differ node destruction to bin render time, when we'll know it's bin index
            this._releaseProgram(node.program);
            this._releaseState(node.geoState);
            this._releaseState(node.flagsState);
            this._releaseState(node.layerState);
            this._releaseState(node.rendererState);
            this._releaseState(node.lightState);
            this._releaseState(node.colortransState);
            this._releaseState(node.materialState);
            this._releaseState(node.fogState);
            this._releaseState(node.modelXFormState);
            this._releaseState(node.viewXFormState);
            this._releaseState(node.projXFormState);
            this._releaseState(node.texState);
            this._releaseState(node.pickColorState);
            this._releaseState(node.imageBufState);
            this._releaseState(node.clipState);
            this._releaseState(node.morphState);
            this._releaseState(node.pickListenersState);
            this._releaseState(node.nameState);
            this._releaseState(node.tagState);
            this._releaseState(node.renderListenersState);
            this._releaseState(node.shaderState);
        }
        geoNodesMap[id] = null;
        sceneState.lenEnabledBin = 0;
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * Bin pre-sorting
     *----------------------------------------------------------------------------------------------------------------*/

    this._createSortIDs = function(bin) {
        if (this._states.needSortIds) {
            var node;
            var layerPriority;
            for (var i = 0, len = bin.length; i < len; i++) {
                node = bin[i];
                node.sortId = (node.layerState.core.priority * 100000) + node.program.id;
            }
            this._states.needSortIds = false;
        }
    };

    this._forceBinSort = function(rebuildSortIDs) {
        if (rebuildSortIDs) {
            this._states.needSortIds = rebuildSortIDs;
        }
        this._states.rendersUntilSort = 0;
        this._states.needSort = true;
    };

    /**
     * Presorts bins by shader program - shader switches are most
     * pathological because they force all other state switches.
     */
    this._preSortBins = function() {
        var states = this._states;
        if (states.needSortIds) {
            this._createSortIDs(states.bin);
        }
        states.bin.length = states.lenBin;
        states.bin.sort(this._sortNodes);
        states.lenEnabledBin = 0;
    };

    this._sortNodes = function(a, b) {
        return a.sortId - b.sortId;
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering
     *----------------------------------------------------------------------------------------------------------------*/

    this.renderFrame = function(params) {
        if (!this._states) {
            throw  SceneJS_errorModule.fatalError("No scene bound");
        }

        this._states.pickBufDirty = true; // Pick buff will now need rendering on next pick

        params = params || {};
        if (this._states.needSort) {
            this._preSortBins();
            this._states.needSort = false;
        } else {
            if (stateSortDelay >= 0) {
                this._states.rendersUntilSort--;
                if (this._states.rendersUntilSort == 0) { // Will not sort again until >= 0
                    this._states.needSort = true;
                }
            }
        }
        var doProfile = params.profileFunc ? true : false;
        var nodeRenderer = this._states.nodeRenderer;
        nodeRenderer.init({ doProfile: doProfile });
        this._renderBin(this._states, false, params.tagSelector); //Not picking
        nodeRenderer.cleanup();
        this._states = null;
        if (doProfile) {
            params.profileFunc(nodeRenderer.profile);
        }
    };

    this._renderBin = function(states, picking, tagSelector) {

        var context = states.canvas.context;

        var enabledBin = states.enabledBin;
        var lenEnabledBin = states.lenEnabledBin;
        var nodeRenderer = states.nodeRenderer;
        var nTransparent = 0;
        var _transparentBin = transparentBin;

        var drawListFilter = false;  // TODO: breaks picking of transparent objects in BDS Human
        if (drawListFilter && lenEnabledBin > 0) {
            for (var i = 0; i < lenEnabledBin; i++) {
                node = enabledBin[i];
                flags = node.flagsState.flags;
                if (picking && flags.picking === false) {                   // When picking, skip unpickable node
                    continue;
                }
                if (!picking && flags.transparent === true) {               // Buffer transparent node when not picking
                    _transparentBin[nTransparent++] = node;

                } else {
                    nodeRenderer.renderNode(node);                   // Render node if opaque or in picking mode
                }
            }
        } else {

            var bin = states.bin;

            var node;
            var countDestroyed = 0;
            var flags;
            var tagCore;
            var _picking = picking;

            /* Tag matching
             */
            var tagMask;
            var tagRegex;
            if (tagSelector) {
                tagMask = tagSelector.mask;
                tagRegex = tagSelector.regex;
            }

            /* Render opaque nodes while buffering transparent nodes.
             * Layer order is preserved independently within opaque and transparent bins.
             * At each node that is marked destroyed, we'll just slice it out of the bin array instead.
             */
            for (var i = 0, len = states.lenBin; i < len; i++) {
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

                flags = node.flagsState.flags;

                if (flags.enabled === false) {                              // Skip disabled node
                    continue;
                }

                /* Skip unmatched tags
                 */
                if (tagMask) {
                    tagCore = node.tagState.core;
                    if (tagCore) {
                        if (tagCore.mask != tagMask) { // Scene tag mask was updated since last render
                            tagCore.mask = tagMask;
                            tagCore.matches = tagRegex.test(tagCore.tag);
                        }
                        if (!tagCore.matches) {
                            continue;
                        }
                    }
                }

                if (!node.layerState.core.enabled) {                        // Skip disabled layers
                    continue;
                }

                if (_picking && flags.picking === false) {                  // When picking, skip unpickable node
                    continue;
                }

                if (!_picking && flags.transparent === true) {              // Buffer transparent node when not picking
                    _transparentBin[nTransparent++] = node;

                } else {
                    nodeRenderer.renderNode(node);                          // Render node if opaque or in picking mode
                    if (drawListFilter) {
                        enabledBin[states.lenEnabledBin++] = node;
                    }
                }
            }
            if (countDestroyed > 0) {
                bin.length -= countDestroyed;  // TODO: tidy this up
                states.lenBin = bin.length;
                len = bin.length;
            }
        }

        /* Render transparent nodes with blending
         */
        if (nTransparent > 0) {
            context.enable(context.BLEND);
            context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);  // Default - may be overridden by flags
            for (i = 0,len = nTransparent; i < len; i++) {
                nodeRenderer.renderNode(transparentBin[i]);
            }
            context.disable(context.BLEND);
        }
    };


    /*===================================================================================================================
     *
     * PICK
     *
     *==================================================================================================================*/

    this.pick = function(params, options) {
        var states = this._sceneStates[params.sceneId];
        if (!states) {
            throw "No drawList found for scene '" + params.sceneId + "'";
        }

        options = options || {};

        var canvasX = params.canvasX;
        var canvasY = params.canvasY;

        var pickBuf = states.pickBuf;
        if (!pickBuf) {
            pickBuf = states.pickBuf = new SceneJS_PickBuffer({ canvas: states.canvas });
            states.pickBufDirty = true;
        }

        pickBuf.bind();

        if (states.pickBufDirty) {

            pickBuf.clear();

            states.nodeRenderer.init({ picking: true });
            this._renderBin(states, true);
            states.nodeRenderer.cleanup();

            states.pickBufDirty = false;
        }
        var pix = pickBuf.read(canvasX, canvasY);
        var pickedNodeIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        var pickIndex = (pickedNodeIndex >= 1) ? pickedNodeIndex - 1 : -1;

        //        var wasPicked = false;
        //        var pickListeners = states.nodeRenderer.pickListeners[pickIndex];
        //        if (pickListeners) {
        //            var listeners = pickListeners.listeners;
        //
        //            var canvasZ = (options.zPick) ? this._zPick(states, canvasX, canvasY, pickListeners._stateId) : undefined;
        //
        //            for (var i = listeners.length - 1; i >= 0; i--) {
        //                wasPicked = true;
        //                listeners[i]({
        //                    canvasX: canvasX,
        //                    canvasY: canvasY,
        //                    canvasZ: canvasZ
        //                }, options);
        //            }
        //
        //        }

        pickBuf.unbind();

        return states.nodeRenderer.pickNames[pickIndex];
    };

    this._zPick = function(states, canvasX, canvasY, pickListenersStateId) {

        states.pickBuf.unbind();

        var zPickBuf = states.zPickBuf;
        if (!zPickBuf) {
            zPickBuf = states.zPickBuf = new SceneJS_PickBuffer({ canvas: states.canvas });
        }

        zPickBuf.bind();

        var nodeRenderer = states.nodeRenderer;
        nodeRenderer.init({ zPick: true });

        /* Do Z-intersect pass on render bin
         */
        var bin = states.bin;
        var node;
        var viewMat;
        var projMat;
        for (var i = 0, len = bin.length; i < len; i++) {
            node = bin[i];
            if (node.pickListenersState._stateId == pickListenersStateId) {
                nodeRenderer.renderNode(node);
                viewMat = node.viewXFormState.mat;
                projMat = node.projXFormState.mat;
            }
        }


        nodeRenderer.cleanup();

        var pix = zPickBuf.read(canvasX, canvasY);
        var nz = pix[2];

        var canvas = states.canvas.canvas;

        var nx = -((2.0 * (canvasX / canvas.width)) - 1.0) / projMat[0];
        var ny = -((-2.0 * (canvasY / canvas.height)) + 1.0) / projMat[5];
        var inViewMat = SceneJS_math_inverseMat4(viewMat, SceneJS_math_mat4());

        var worldPos = SceneJS_math_transformPoint3(inViewMat, [nx, ny, nz]);

        alert(JSON.stringify(worldPos));
        //alert(JSON.stringify(projMat));

        zPickBuf.unbind();

        return worldPos[2];
    };

    //    ayPick.prototype.execute = function(params, completed) {
    //        var inViewMat, nx, ny, projMat, rayDirection, rayOrigin, viewMat;
    //        viewMat = SceneJS.withNode(this._cfg.lookAtNode).get("matrix");
    //        projMat = SceneJS.withNode(this._cfg.cameraNode).get("matrix");
    //        nx = -((2.0 * (params.x / this._cfg.canvasWidth)) - 1.0) / projMat[0];
    //        ny = -((-2.0 * (params.y / this._cfg.canvasHeight)) + 1.0) / projMat[5];
    //        inViewMat = this._inverseMat4(viewMat);
    //        rayOrigin = [0, 0, 0, 1];
    //        rayDirection = [nx, ny, 1, 0];
    //        rayOrigin = this._mulMat4v4(inViewMat, rayOrigin);
    //        rayDirection = this._mulMat4v4(inViewMat, rayDirection);
    //        this._result = {
    //            rayOrigin: rayOrigin,
    //            rayDirection: rayDirection
    //        };
    //        if (completed) {
    //            completed(this);
    //        }
    //        return this;
    //    };


    /*===================================================================================================================
     *
     * SHADERS
     *
     *==================================================================================================================*/

    this._getSceneHash = function() {
        return ([                           // Same hash for both render and pick shaders
            this._states.canvas.canvasId,
            rendererState.hash,
            fogState.hash,
            lightState.hash,
            texState.hash,
            clipState.hash,
            morphState.hash,
            geoState.hash
        ]).join(";");
    };

    this._getProgram = function(stateHash) {
        var program = this._programs[stateHash];
        if (!program) {
            if (debugCfg.logScripts === true) {
                SceneJS_loggingModule.info("Creating render and pick shaders: '" + stateHash + "'");
            }
            program = this._programs[stateHash] = {
                id: nextProgramId++,

                render: this._createShader(this._composeRenderingVertexShader(), this._composeRenderingFragmentShader()),
                pick: this._createShader(this._composePickingVertexShader(), this._composePickingFragmentShader()),
                //     zPick: this._createShader(this._composeZIntersectVertexShader(), this._composeZIntersectFragmentShader()),
                stateHash: stateHash,
                refCount: 0
            };
        }
        program.refCount++;
        return program;
    };

    this._releaseProgram = function(program) {
        if (--program.refCount <= 0) {
            //            program.render.destroy();
            //            program.pick.destroy();
            //            this._programs[program.stateHash] = null;
        }
    };

    this._createShader = function(vertexShaderSrc, fragmentShaderSrc) {
        try {
            return new SceneJS_webgl_Program(
                    this._stateHash,
                    this._states.canvas.context,
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
            this._logShaderLoggingSource(vertexShaderSrc);
            console.error("");
            console.error("Fragment shader:");
            this._logShaderLoggingSource(fragmentShaderSrc);
            console.error("-----------------------------------------------------------------------------------------:");
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ERROR, "Failed to create SceneJS Shader: " + e);
        }
    };

    this._logShaderLoggingSource = function(src) {
        for (var i = 0, len = src.length; i < len; i++) {
            console.error(src[i]);
        }
    };

    this._composePickingVertexShader = function() {

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
            if (morphState.morph.targets[0].vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 SCENEJS_aMorphVertex;");
            }
        }

        src.push("void main(void) {");
        src.push("   vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (vertexHooks.modelPos) {
            src.push("tmpVertex=" + vertexHooks.modelPos + "(tmpVertex);");
        }

        if (morphing) {
            if (morphState.morph.targets[0].vertexBuf) {
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
    };

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    this._composePickingFragmentShader = function() {

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
         * Custom GLSL
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
    };


    /*===================================================================================================================
     *
     * Z-intersect shaders
     *
     *==================================================================================================================*/

    this._composeZIntersectVertexShader = function() {

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

        //  if (fragmentHooks.viewPosClip) {
        src.push("varying vec4 SCENEJS_vViewVertex;\n");
        //   }

        src.push("varying vec4 SCENEJS_vProjVertex;\n");

        if (customVertexShader.code) {
            src.push("\n" + customVertexShader.code + "\n");
        }

        if (morphing) {
            src.push("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (morphState.morph.targets[0].vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 SCENEJS_aMorphVertex;");
            }
        }

        src.push("void main(void) {");
        src.push("   vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (vertexHooks.modelPos) {
            src.push("tmpVertex=" + vertexHooks.modelPos + "(tmpVertex);");
        }

        if (morphing) {
            if (morphState.morph.targets[0].vertexBuf) {
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

        //if (fragmentHooks.viewPosClip) {
        src.push("  SCENEJS_vViewVertex = tmpVertex;");
        //  }

        src.push("  SCENEJS_vProjVertex = SCENEJS_uPMatrix * tmpVertex;");

        src.push("  gl_Position = SCENEJS_vProjVertex;");
        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    };

    this._composeZIntersectFragmentShader = function() {

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

        //  if (fragmentHooks.viewPosClip) {
        src.push("varying vec4 SCENEJS_vViewVertex;");              // View-space vertex
        //}

        src.push("varying vec4 SCENEJS_vProjVertex;\n");

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
         * Custom GLSL
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


        //src.push("    gl_FragColor = vec4(1.0, 1.0, (800.0-SCENEJS_vProjVertex.z)/300.0, 1.0); ");
        src.push("    gl_FragColor = vec4(SCENEJS_vWorldVertex.x, SCENEJS_vWorldVertex.y, SCENEJS_vWorldVertex.z, 1.0); ");

        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
        }
        return src;
    };


    /*===================================================================================================================
     *
     * Rendering vertex shader
     *
     *==================================================================================================================*/

    this._isTexturing = function() {
        if (texState.core && texState.core.layers.length > 0) {
            if (geoState.geo.uvBuf || geoState.geo.uvBuf2) {
                return true;
            }
            if (morphState.morph && (morphState.morph.targets[0].uvBuf || morphState.morph.targets[0].uvBuf2)) {
                return true;
            }
        }
        return false;
    };

    this._isLighting = function() {
        if (lightState.lights.length > 0) {
            if (geoState.geo.normalBuf) {
                return true;
            }
            if (morphState.morph && morphState.morph.targets[0].normalBuf) {
                return true;
            }
        }
        return false;
    };

    this._composeRenderingVertexShader = function() {

        var customShaders = shaderState.shader.shaders || {};

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};


        var texturing = this._isTexturing();
        var lighting = this._isLighting();
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
            if (morphState.morph.targets[0].vertexBuf) {      // target2 has these arrays also
                src.push("attribute vec3 SCENEJS_aMorphVertex;");
            }
            if (lighting) {
                if (morphState.morph.targets[0].normalBuf) {
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
            if (morphState.morph.targets[0].vertexBuf) {
                src.push("  vec4 vMorphVertex = vec4(SCENEJS_aMorphVertex, 1.0); ");
                src.push("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, SCENEJS_uMorphFactor), 1.0); ");
            }
            if (lighting) {
                if (morphState.morph.targets[0].normalBuf) {
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

    this._composeRenderingFragmentShader = function() {

        var customShaders = shaderState.shader.shaders || {};
        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var texturing = this._isTexturing();
        var lighting = this._isLighting();
        var fogging = fogState.fog && true;
        var clipping = clipState && clipState.clips.length > 0;
        var colortrans = colortransState && colortransState.core;

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

            var layer;
            for (var i = 0, len = texState.core.layers.length; i < len; i++) {
                layer = texState.core.layers[i];
                src.push("uniform sampler2D SCENEJS_uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 SCENEJS_uLayer" + i + "Matrix;");
                }
                src.push("uniform float SCENEJS_uLayer" + i + "BlendFactor;");
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

            var layer;
            for (var i = 0, len = texState.core.layers.length; i < len; i++) {
                layer = texState.core.layers[i];

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
                if (layer.matrix) {
                    src.push("textureCoord=(SCENEJS_uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Alpha from Texture
                 * */
                if (layer.applyTo == "alpha") {
                    if (layer.blendMode == "multiply") {
                        src.push("alpha = alpha * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    } else if (layer.blendMode == "add") {
                        src.push("alpha = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * alpha) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    }
                }

                /* Texture output
                 */
                if (layer.applyTo == "baseColor") {
                    if (layer.blendMode == "multiply") {
                        src.push("color = color * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    } else {
                        src.push("color = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * color) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    }
                }

                if (layer.applyTo == "emit") {
                    if (layer.blendMode == "multiply") {
                        src.push("emit  = emit * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("emit = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * emit) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (layer.applyTo == "specular" && lighting) {
                    if (layer.blendMode == "multiply") {
                        src.push("specular  = specular * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        src.push("specular = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * specular) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
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
    };
})();