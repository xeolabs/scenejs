
/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 */
var SceneJS_renderModule = new (function() {

    this.MAX_PICK_LISTENERS = 50000;
    this.MAX_NODE_DEPTH = 500;
    this.MAX_SHADERS = 10000;
    this.DEFAULT_STATE_SORT_DELAY = 1;

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
            baseColor :  [ 1.0, 1.0, 1.0 ],
            specularColor :  [ 1.0,  1.0,  1.0 ],
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

    /*----------------------------------------------------------------------
     *
     *--------------------------------------------------------------------*/

    /** Shader programs currently allocated on all canvases
     */
    var programs = {};

    var debugCfg;                       // Debugging configuration for this module
    var time = (new Date()).getTime();  // Current time for least-recently-used shader cache eviction policy

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

    /* Track the scene graph time so we can timestamp the last time
     * we use each shader programs in case we need to evict the
     * least-recently-used program for the memor-management module.
     */
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
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

            rebuildBins = true;              // Rebuild render bins
            rebuildShaders = true;           // Rebuilding shaders - always when rebuilding state graph

            nextStateId = 0;                 // Ready to ID new states

            //  nextProgramId = 0;           // Ready to ID new programs

            nodeMap = states.nodeMap = {};
            stateMap = states.stateMap = {};

            setNeedBinSort();
            // states.needSort = true;

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
        }

        compileMode = options.compileMode;

        picking = false;
    };

    /**
     * Immediately render a frame of the given scene while performing a pick on it.
     * Returns true if something was picked.
     *
     */
    this.pick = function(params, options) {
        states = sceneStates[params.sceneId];
        return pickFrame(params.canvasX, params.canvasY, options);
    };

    this.marshallStates = function() {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SHADER_RENDERING);
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
                    _stateId : nextStateId,
                    _stateType: stateType
                };
                typeMap[id] = state;
            }
        } else {

            /* Recompiling entire scene graph
             */
            state = {
                _stateId : nextStateId,
                _stateType: stateType
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
     * Set the current world-space clipping planes
     */
    this.setClips = function(id, clips) {
        clipState = getState(this._CLIPS, id || "___DEFAULT_CLIPS");
        clips = clips || [];
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
        clipState.clips = clips;
        stateHash = null;
    };

    /**
     * Set the current color transform
     */
    this.setColortrans = function(id, trans) {
        colortransState = getState(this._COLORTRANS, id || "___DEFAULT_COLOR_TRANS");
        colortransState.trans = trans;
        colortransState.hash = trans ? "t" : "f";
        stateHash = null;
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
        fogState.hash = fog ? fog.mode : "";
        stateHash = null;
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
        lightState = getState(this._LIGHTS, id || "___DEFAULT_LIGHTS");
        lightState.lights = lights;
        lightState.hash = hash.join("");
        stateHash = null;
    };

    /**
     * Set the current surface material
     */
    this.setMaterial = function(id, material) {
        materialState = getState(this._MATERIAL, id || "___DEFAULT_MATERIAL");
        material = material || {};
        materialState.material = {
            baseColor : material.baseColor || [ 0.0, 0.0, 0.0 ],
            highlightBaseColor : material.highlightBaseColor || material.baseColor || [ 0.0, 0.0, 0.0 ],
            specularColor : material.specularColor || [ 0.0,  0.0,  0.0 ],
            specular : material.specular != undefined ? material.specular : 1.0,
            shine : material.shine != undefined ? material.shine : 10.0,
            reflect : material.reflect != undefined ? material.reflect : 0.8,
            alpha : material.alpha != undefined ? material.alpha : 1.0,
            emit : material.emit != undefined ? material.emit : 0.0
        };
    };

    /**
     * Set model-space morph targets
     */
    this.setMorph = function(id, morph) {
        morphState = getState(this._MORPH, id || "___DEFAULT_MORPH");
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
        morphState.morph = morph;
        morphState.hash = hash;
        stateHash = null;
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
     * Set the current textures
     */
    this.setTexture = function(id, texlayers) {
        texState = getState(this._TEXTURE, id || "___DEFAULT_TEXTURE");

        texlayers = texlayers || [];

        /* Make hash
         */
        var hashStr;
        if (texlayers.length > 0) {
            var hash = [];
            for (var i = 0; i < texlayers.length; i++) {
                var layer = texlayers[i];
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
        texState.layers = texlayers;
        texState.hash = hashStr;
        stateHash = null;
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
        viewXFormState.lookAt = lookAt || SceneJS_math_LOOKAT;
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

     */
    this.setGeometry = function(id, geo) {

        //        if (id) {
        //            id += ".gl";
        //        }



        /* Pull in dirty states from other modules
         */
        this.marshallStates();

        var node;

        /* If not rebuilding then ensure that the node's shader is updated for state updates
         */
        if (compileMode != SceneJS_renderModule.COMPILE_SCENE) {
            return;
        }


        var program;

        /*
         */
        geoState = getState(this._GEO, id);
        geoState.geo = geo;
        geoState.hash = ([                           // Safe to build geometry hash here - geometry is immutable
            geo.normalBuf ? "t" : "f",
            geo.uvBuf ? "t" : "f",
            geo.uvBuf2 ? "t" : "f"]).join("");

        /* Identify what GLSL is required for the current state soup elements
         */
        if (!stateHash) {
            stateHash = getSceneHash();
        }

        /* Create or re-use a program
         */
        program = getProgram(stateHash);    // Touches for LRU cache

        var layerPriority;

        var layerName = SceneJS_layerModule.getLayer();
        layerPriority = layerName ? SceneJS_layerModule.getLayerPriority(layerName) : 0;

        /* Create state graph node, with program and
         * pointers to current state soup elements
         */
        var sortId = (layerPriority * 100000) + program.id;

        if (idPrefix) {
            id = idPrefix + id;
        }

        node = {

            id: id,

            /* Node will be pre-sorted on shader
             */
            sortId: sortId,

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

            layerName:              layerName
        };

        nodeMap[id] = node;

        states.bin.push(node);

        /* If node has boundary, add to BVH
         */
        //  SceneJS._bvhModule.insertNode(geo.boundary, states.sceneId, id);
    };

    /* When the canvas deactivates, we'll render the node bins.
     */
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
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
                renderFrame();
            });

    /*-----------------------------------------------------------------------------------------------------------------
     * Bin pre-sorting
     *----------------------------------------------------------------------------------------------------------------*/

    function setNeedBinSort() {
        states.rendersUntilSort = stateSortDelay;
        states.needSort = false;
    }

    /**
     * Presorts bins by shader program - shader switches are most
     * pathological because they force all other state switches.
     */
    function preSortBins() {
        states.bin.sort(sortNodes);
    }

    var sortNodes = function(a, b) {
        return a.sortId - b.sortId;
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering
     *----------------------------------------------------------------------------------------------------------------*/

    function renderFrame() {
        states.nodeRenderer.init();
        renderBin(states.bin, false); // Not picking
        states.nodeRenderer.cleanup();
    }

    function renderBin(bin, picking) {

        var enabledLayers = SceneJS_layerModule.getEnabledLayers();
        var context = states.canvas.context;
        var nTransparent = 0;
        var node;
        var i, len = bin.length;
        var flags;

        //  var sceneBVH = SceneJS._bvhModule.sceneBVH[states.sceneId];

        /* Render opaque nodes while buffering transparent nodes.
         * Layer order is preserved independently within opaque and transparent bins.
         */
        for (i = 0; i < len; i++) {
            node = bin[i];

            //if (sceneBVH.visibleNodes[node.id]) {                     // Node within view colume

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
            //}
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
        if (!programs[stateHash]) {
            if (debugCfg.logScripts === true) {
                SceneJS_loggingModule.info("Creating render and pick shaders: '" + stateHash + "'");
            }

            programs[stateHash] = {
                id: nextProgramId++,
                render: createShader(composeRenderingVertexShader(), composeRenderingFragmentShader()),
                pick: createShader(composePickingVertexShader(), composePickingFragmentShader())
            };
        }
        var program = programs[stateHash];
        program.lastUsed = time; // For LRU eviction
        return program;
    }

    function createShader(vertexShaderSrc, fragmentShaderSrc) {
        try {
            return new SceneJS_webgl_Program(
                    stateHash,
                    time,
                    states.canvas.context,
                    [vertexShaderSrc],
                    [fragmentShaderSrc],
                    SceneJS_loggingModule);
        } catch (e) {
            SceneJS_loggingModule.debug("Vertex shader:");
            SceneJS_loggingModule.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
            SceneJS_loggingModule.debug("Fragment shader:");
            SceneJS_loggingModule.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ERROR, "Failed to create shader: " + e.message || e);
        }
    }

    function getShaderLoggingSource(src) {
        return src.join("");
    }

    function composePickingVertexShader() {
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",
            "attribute vec3 aVertex;",
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;"];

        src.push("varying vec4 vWorldVertex;");
        src.push("varying vec4 vViewVertex;");

        src.push("void main(void) {");

        src.push("  vec4 tmpVertex = uMMatrix * vec4(aVertex, 1.0); ");
        src.push("  vWorldVertex = tmpVertex; ");

        src.push("  tmpVertex = uVMatrix * tmpVertex; ");
        src.push("  vViewVertex = tmpVertex;");

        src.push("  gl_Position = uPMatrix * tmpVertex;");
        src.push("}");

        if (debugCfg.logScripts == true) {
            SceneJS_loggingModule.info(src);
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

        src.push("varying vec4 vWorldVertex;");
        src.push("varying vec4 vViewVertex;");
        src.push("uniform vec3 uPickColor;");

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float uClipMode" + i + ";");
                src.push("uniform vec4  uClipNormalAndDist" + i + ";");
            }
        }

        src.push("void main(void) {");

        /*-----------------------------------------------------------------------------------
         * Logic - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(vWorldVertex.xyz, uClipNormalAndDist" + i + ".xyz) - uClipNormalAndDist" + i + ".w;");
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
            SceneJS_loggingModule.info(src);
        }
        return src.join("\n");
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

        var texturing = isTexturing();
        var lighting = isLighting();
        var clipping = clipState.clips.length > 0;
        var morphing = morphState.morph && true;

        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"
        ];
        src.push("attribute vec3 aVertex;");                // Model coordinates

        /*-----------------------------------------------------------------------------------
         * Variables - Lighting
         *----------------------------------------------------------------------------------*/

        if (lighting) {
            src.push("attribute vec3 aEye;");           // World-space eye position

            src.push("attribute vec3 aNormal;");        // Normal vectors
            src.push("uniform   mat4 uMNMatrix;");      // Model normal matrix
            src.push("uniform   mat4 uVNMatrix;");      // View normal matrix

            src.push("varying   vec3 vNormal;");        // Output view normal vector
            src.push("varying   vec3 vEyeVec;");        // Output view eye vector

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

                /* Vector from vertex to light, packaged with the pre-computed length of that vector
                 */
                src.push("varying vec4 vLightVecAndDist" + i + ";");
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

        /* Vertex color variables
         */
        if (geoState.geo.colorBuf) {
            src.push("attribute vec4 aVertexColor;");     // UV2 coords
            src.push("varying vec4 vColor;");
        }

        src.push("uniform mat4 uMMatrix;");                // Model matrix
        src.push("uniform mat4 uVMatrix;");                // View matrix
        src.push("uniform mat4 uPMatrix;");                 // Projection matrix

        src.push("varying vec4 vWorldVertex;");
        src.push("varying vec4 vViewVertex;");

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }
        }

        /*-----------------------------------------------------------------------------------
         * Variables - Morphing
         *----------------------------------------------------------------------------------*/

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

        src.push("void main(void) {");

        src.push("  vec4 modelVertex = vec4(aVertex, 1.0); ");

        if (lighting) {
            src.push("  vec4 modelNormal = vec4(aNormal, 0.0); ");
        }

        /*
         * Morphing - morph targets are in same model space as the geometry
         */
        if (morphing) {
            if (morphState.morph.target1.vertexBuf) {
                src.push("  vec4 vMorphVertex = vec4(aMorphVertex, 1.0); ");
                src.push("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, uMorphFactor), 1.0); ");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("  vec4 vMorphNormal = vec4(aMorphNormal, 1.0); ");
                    src.push("  modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, 0.0), 1.0); ");
                }
            }
        }

        src.push("  vec4 worldVertex = uMMatrix * modelVertex; ");


        if (lighting) {

            /* Transform normal from model to view space
             */
            src.push("  vec4 worldNormal = uMNMatrix * modelNormal; ");
        }

        src.push("  vec4 viewVertex  = uVMatrix * worldVertex; ");

        if (lighting) {
            //            if (debugCfg.invertNormals) {
            //                src.push("  vNormal = normalize(worldNormal.xyz);");
            //            } else {
            src.push("  vNormal = normalize(worldNormal.xyz);");
            //}
        }

        src.push("  vWorldVertex = worldVertex;");
        src.push("  vViewVertex = viewVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");

        /*-----------------------------------------------------------------------------------
         * Logic - Lighting
         *
         * Transform the world-space lights into view space
         *----------------------------------------------------------------------------------*/

        src.push("  vec3 tmpVec3;");
        if (lighting) {
            var light;
            for (var i = 0; i < lightState.lights.length; i++) {
                light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("vLightVecAndDist" + i + " = vec4(-normalize(uLightDir" + i + "), 0.0);");
                }
                if (light.mode == "point") {
                    src.push("tmpVec3 = (uLightPos" + i + ".xyz - worldVertex.xyz);");
                    src.push("vLightVecAndDist" + i + " = vec4(normalize(tmpVec3), length(tmpVec3));");
                }
                if (light.mode == "spot") {

                }
            }
        }

        if (lighting) {
            src.push("vEyeVec = normalize(aEye - worldVertex.xyz);");
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("vUVCoord = aUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("vUVCoord2 = aUVCoord2;");
            }
        }

        /* Vertex colouring
         */
        if (geoState.geo.colorBuf) {
            src.push("vColor = aVertexColor;");
        }

        src.push("}");
        if (debugCfg.logScripts === true) {
            SceneJS_loggingModule.info(src);
        }
        return src.join("\n");
    }

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering Fragment shader
     *---------------------------------------------------------------------------------------------------------------*/

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

        src.push("varying vec4 vWorldVertex;");             // World-space vertex
        src.push("varying vec4 vViewVertex;");              // View-space vertex

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float uClipMode" + i + ";");
                src.push("uniform vec4  uClipNormalAndDist" + i + ";");
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }

            for (var i = 0; i < texState.layers.length; i++) {
                var layer = texState.layers[i];
                src.push("uniform sampler2D uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 uLayer" + i + "Matrix;");
                }
            }
        }


        /* Vertex color variable
         */
        if (geoState.geo.colorBuf) {
            src.push("varying vec4 vColor;");
        }

        src.push("uniform vec3  uMaterialBaseColor;");
        src.push("uniform float uMaterialAlpha;");


        src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
        src.push("uniform float uMaterialEmit;");

        src.push("  vec3    ambientValue=uAmbient;");
        src.push("  float   emit    = uMaterialEmit;");

        if (lighting) {
            src.push("varying vec3 vNormal;");                  // View-space normal
            src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

            src.push("uniform vec3  uMaterialSpecularColor;");
            src.push("uniform float uMaterialSpecular;");
            src.push("uniform float uMaterialShine;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("uniform vec3  uLightColor" + i + ";");
                if (light.mode == "point") {
                    src.push("uniform vec3  uLightAttenuation" + i + ";");
                }
                //                if (light.mode == "spot") {
                //                   src.push("uniform vec3   uLightDir" + i + ";");
                //                    src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                //                    src.push("uniform float  uLightSpotExp" + i + ";");
                //                }
                src.push("varying vec4  vLightVecAndDist" + i + ";");         // Vector from light to vertex
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
        if (geoState.geo.colorBuf) {
            src.push("  vec3    color   = vColor.rgb;");
            src.push("  float   alpha   = vColor.a;");
        } else {
            src.push("  vec3    color   = uMaterialBaseColor;");
            src.push("  float   alpha   = uMaterialAlpha;");
        }

        /*-----------------------------------------------------------------------------------
         * Logic - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(vWorldVertex.xyz, uClipNormalAndDist" + i + ".xyz) - uClipNormalAndDist" + i + ".w;");
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
                        src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (geoState.geo.uvBuf2) {
                        src.push("texturePos = vec4(vUVCoord2.s, vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
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
                if (layer.applyTo == "alpha") {
                    if (layer.blendMode == "multiply") {
                        src.push("alpha = alpha * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b;");
                    } else if (layer.blendMode == "add") {
                        src.push("alpha = alpha + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b;");
                    }
                }

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
                    src.push("normalVec *= -bump;");
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
            src.push("  float   lightDist;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("lightVec = vLightVecAndDist" + i + ".xyz;");

                /* Point Light
                 */
                if (light.mode == "point") {

                    src.push("lightDist = vLightVecAndDist" + i + ".w;");

                    src.push("dotN = max(dot(normalVec, lightVec),0.0);");
                    src.push("if (dotN > 0.0) {");
                    src.push("  attenuation = 1.0 / (" +
                             "  uLightAttenuation" + i + "[0] + " +
                             "  uLightAttenuation" + i + "[1] * lightDist + " +
                             "  uLightAttenuation" + i + "[2] * lightDist * lightDist);");
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

                    //                    src.push("lightDist = vLightVecAndDist" + i + ".w;");
                    //
                    //                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    //                    src.push("if ( spotFactor > 20) {");
                    //                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    //                    src.push("  dotN = max(dot(normalVec,lightVec),0.0);");
                    //                    src.push("      if(dotN>0.0){");

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
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec),normalize(vEyeVec)),0.0), shine);");
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
            src.push("        if (uColortransSaturation < 0.0) {");
            src.push("            float intensity = 0.3 * fragColor.r + 0.59 * fragColor.g + 0.11 * fragColor.b;");
            src.push("            fragColor = vec4((intensity * -uColortransSaturation) + fragColor.rgb * (1.0 + uColortransSaturation), 1.0);");
            src.push("        }");
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
            SceneJS_loggingModule.info(src);
        }
        return src.join("\n");
    }

    function pickFrame(canvasX, canvasY, options) {

        /* Set up pick buffer
         */
        createPickBuffer();
        bindPickBuffer();

        /* Render display list in pick mode
         */
        states.nodeRenderer.init(true);  // TODO: Only re-render when nodes are known to have moved 

        renderBin(states.bin, true);

        /* Read pick buffer
         */
        var pickIndex = readPickBuffer(canvasX, canvasY);

        var wasPicked = (pickIndex >= 0);

        /* Notify listeners
         */
        if (wasPicked) {
            var pickListeners = states.nodeRenderer._pickListeners[pickIndex];
            if (pickListeners) {
                var listeners = pickListeners.listeners;
                for (var i = listeners.length - 1; i >= 0; i--) {
                    listeners[i]({ canvasX: canvasX, canvasY: canvasY }, options);
                }
            }
        }

        /* Clean up
         */
        unbindPickBuffer();
        states.nodeRenderer.cleanup();

        /* Notify caller whether pick was made or not
         */
        return wasPicked;
    }

    function createPickBuffer() {
        var canvas = states.canvas;
        var gl = canvas.context;

        var width = canvas.canvas.width;
        var height = canvas.canvas.height;

        var pickBuf = states.pickBuf;

        if (pickBuf) { // Current have a pick buffer

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
            throw("Invalid framebuffer");
        }
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        switch (status) {
            case gl.FRAMEBUFFER_COMPLETE:
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                throw("Incomplete framebuffer: " + status);
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