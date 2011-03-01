/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 */
SceneJS._renderModule = new (function() {

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

    var CLIPS = 0;
    var COLORTRANS = 1;
    var DEFORM = 2;
    var FLAGS = 3;
    var FOG = 4;
    var IMAGEBUF = 5;
    var LIGHTS = 6;
    var MATERIAL = 7;
    var MORPH = 8;
    var PICKCOLOR = 9;
    var TEXTURE = 10;
    var RENDERER = 11;
    var MODEL_TRANSFORM = 12;
    var PROJ_TRANSFORM = 13;
    var VIEW_TRANSFORM = 14;
    var PICK_LISTENERS = 15;
    var RENDER_LISTENERS = 16;

    /*----------------------------------------------------------------------
     * Default state values
     *--------------------------------------------------------------------*/

    /* Default transform matrices
     */
    var DEFAULT_MAT = new Float32Array(SceneJS._math_identityMat4());

    var DEFAULT_NORMAL_MAT = new Float32Array(
            SceneJS._math_transposeMat4(
                    SceneJS._math_inverseMat4(
                            SceneJS._math_identityMat4(),
                            SceneJS._math_mat4())));

    var DEFAULT_CLIPS = {
        clips: [],
        hash: ""
    };

    var DEFAULT_COLOR_TRANS = {
        trans : null,
        hash :"f"
    };

    var DEFAULT_DEFORM = {
        deform : null,
        hash : ""
    };

    var DEFAULT_FLAGS = {
        flags: {
            fog: true,          // Fog enabled
            colortrans : true,  // Effect of colortrans enabled
            picking : true,     // Picking enabled
            clipping : true,    // User-defined clipping enabled
            enabled : true,     // Node not culled from traversal
            visible : true,     // Node visible - when false, everything happens except geometry draw
            transparent: false
        }
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
            highlightBaseColor :  [ 0.0, 0.0, 0.0 ],
            specularColor :  [ 0.5,  0.5,  0.5 ],
            specular : 2,
            shine :  0.5,
            reflect :  0,
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
    var deformState;
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

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                debugCfg = SceneJS._debugModule.getConfigs("shading");
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

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                for (var programId in programs) {  // Just free allocated programs
                    programs[programId].destroy();
                }
                programs = {};
                nextProgramId = 0;
            });

    var self = this;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_CREATED,
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

    /* When a canvas is activated we'll get a reference to it, prepare the default state soup,
     * and an initial empty set of node bins
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(activatedCanvas) {
                canvas = activatedCanvas;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_DESTROYED,
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
    this.renderScene = function(params, options) {
        options = options || {};

        /* Activate states for scene
         */
        states = sceneStates[params.sceneId];
        nodeMap = states.nodeMap;
        stateMap = states.stateMap;

        stateHash = null;

        idPrefix = null;

        if (options.compileMode == SceneJS._renderModule.COMPILE_SCENE) {        // Rebuild display list for entire scene

            /* Going to rebuild the state graph as we recompile
             * the entire scene graph. We'll set the state soup to
             * defaults, prepare to rebuild the node bins and shaders
             */

            clipState = DEFAULT_CLIPS;
            colortransState = DEFAULT_COLOR_TRANS;
            deformState = DEFAULT_DEFORM;
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

        } else if (options.compileMode == SceneJS._renderModule.COMPILE_NODES) {   // Rebuild display list for subtree

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
     * Immediately render a frame of the given scene while performing a pick on it
     */
    this.pick = function(params, options) {
        states = sceneStates[params.sceneId];
        pickFrame(params.canvasX, params.canvasY, options);
    };

    this.marshallStates = function() {
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_RENDERING);
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
        if (compileMode != SceneJS._renderModule.COMPILE_SCENE) {
            state = typeMap[id];
            if (!state) {
                state = {
                    _stateId : nextStateId
                };
                typeMap[id] = state;
            }
        } else {

            /* Recompiling entire scene graph
             */
            state = {
                _stateId : nextStateId
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
        state.id = id;
        return state;
    }

    /**
     * Set user-defined clipping planes
     * @param {String} is State ID
     * @param {Array} clips The clipping planes
     */
    this.setClips = function(id, clips) {
        clipState = getState(CLIPS, id || "___DEFAULT_CLIPS");
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
     *
     */
    this.setColortrans = function(id, trans) {
        colortransState = getState(COLORTRANS, id || "___DEFAULT_COLOR_TRANS");
        colortransState.trans = trans;
        colortransState.hash = trans ? "t" : "f";
        stateHash = null;
    };

    /**
     *
     */
    this.setDeform = function(id, deform) {
        deformState = getState(DEFORM, id || "___DEFAULT_DEFORM");
        deformState.deform = deform;
        deformState.hash = deform ? "d" + deform.verts.length : "";
        stateHash = null;
    };

    /**
     *
     */
    this.setFlags = function(id, flags) {
        flagsState = getState(FLAGS, id || "___DEFAULT_FLAGS");
        flagsState.flags = flags || {
            fog: true,          // Fog enabled
            colortrans : true,  // Effect of colortrans enabled
            picking : true,     // Picking enabled
            clipping : true,    // User-defined clipping enabled
            enabled : true,     // Node not culled from traversal
            visible : true,     // Node visible - when false, everything happens except geometry draw
            transparent: false
        };
        flagsState.id = id;
    };

    /**
     *
     */
    this.setFog = function(id, fog) {
        fogState = getState(FOG, id || "___DEFAULT_FOG");
        fogState.fog = fog;
        fogState.hash = fog ? fog.mode : "";
        stateHash = null;
    };

    /**
     */
    this.setImagebuf = function(id, imageBuf) {
        imageBufState = getState(IMAGEBUF, id || "___DEFAULT_IMAGEBUF");
        imageBufState.imageBuf = imageBuf;
    };

    /**
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
        lightState = getState(LIGHTS, id || "___DEFAULT_LIGHTS");
        lightState.lights = lights;
        lightState.hash = hash.join("");
        stateHash = null;
    };

    /**
     *
     */
    this.setMaterial = function(id, material) {
        materialState = getState(MATERIAL, id || "___DEFAULT_MATERIAL");
        material = material || {};
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

    /**
     *
     */
    this.setMorph = function(id, morph) {
        morphState = getState(MORPH, id || "___DEFAULT_MORPH");
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
        pickState = getState(PICKCOLOR, id || "___DEFAULT_PICK");
        pickState.pickColor = pickColor;
        stateHash = null;
    };

    /**
     *
     */
    this.setTexture = function(id, texlayers) {
        texState = getState(TEXTURE, id || "___DEFAULT_TEXTURE");

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
     *
     */
    this.setRenderer = function(id, props) {
        rendererState = getState(RENDERER, id || "___DEFAULT_RENDERER");
        rendererState.props = props;
        stateHash = null;
    };

    /**
     */
    this.setModelTransform = function(id, mat, normalMat) {
        modelXFormState = getState(MODEL_TRANSFORM, id || "___DEFAULT_MODEL_TRANSFORM");
        modelXFormState.mat = mat || DEFAULT_MAT;
        modelXFormState.normalMat = normalMat || DEFAULT_NORMAL_MAT;
        modelXFormState.id = id;
    };

    /**
     */
    this.setProjectionTransform = function(id, mat) {
        projXFormState = getState(PROJ_TRANSFORM, id || "___DEFAULT_PROJ_TRANSFORM");
        projXFormState.mat = mat || DEFAULT_MAT;
    };

    /**
     */
    this.setViewTransform = function(id, mat, normalMat) {
        viewXFormState = getState(VIEW_TRANSFORM, id || "___DEFAULT_VIEW_TRANSFORM");
        viewXFormState.mat = mat || DEFAULT_MAT;
        viewXFormState.normalMat = normalMat || DEFAULT_NORMAL_MAT;
    };

    /**
     */
    this.setPickListeners = function(id, listeners) {
        pickListenersState = getState(PICK_LISTENERS, id || "___DEFAULT_PICK_LISTENERS");
        pickListenersState.listeners = listeners || [];
    };

    /**
     */
    this.setRenderListeners = function(id, listeners) {
        renderListenersState = getState(RENDER_LISTENERS, id || "___DEFAULT_RENDER_LISTENERS");
        renderListenersState.listeners = listeners || [];
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
    this.setGeometry = function(id, geo) {

        if (id) {
            id += ".gl";
        }

        if (idPrefix) {
            id = idPrefix + id;
        }

        /* Pull in dirty states from other modules
         */
        this.marshallStates();

        var node;

        /* If not rebuilding then ensure that the node's shader is updated for state updates
         */
        if (compileMode != SceneJS._renderModule.COMPILE_SCENE) {
            return;
        }


        var program;

        /*
         */
        geoState = getState(id);
        geoState.geo = geo;
        geoState.hash = ([                           // Safe to build geometry hash here - geometry is immutable
            geo.normalBuf ? "t" : "f",
            geo.uvBuf ? "t" : "f",
            geo.uvBuf2 ? "t" : "f"]).join("");

        //        /* Lazy-create layer
        //         */
        //        var layer;
        //        var layerName = SceneJS._layerModule.getLayer() || SceneJS._layerModule.DEFAULT_LAYER_NAME;
        //        layer = states.layers[layerName];
        //        if (!layer) {
        //            layer = states.layers[layerName] = {
        //                bin: []
        //            };
        //        }

        /* Identify what GLSL is required for the current state soup elements
         */
        if (!stateHash) {
            stateHash = getSceneHash();
        }

        /* Create or re-use a program
         */
        program = getProgram(stateHash);    // Touches for LRU cache

        var layerPriority;

        var layerName = SceneJS._layerModule.getLayer();
        layerPriority = layerName ? SceneJS._layerModule.getLayerPriority(layerName) : 0;

        /* Create state graph node, with program and
         * pointers to current state soup elements
         */
        // nodeMap[nextStateId++] =

        if (layerPriority >= 0) {
            layerPriority++;
        }
        var sortId = (layerPriority * 100000) + program.id;

        node = {

            id: id,

            /* Node will be pre-sorted on shader
             */
            sortId: sortId,

            stateHash : stateHash,

            program : program,

            geoState:           geoState,
            flagsState:         flagsState,
            rendererState:      rendererState,
            lightState:         lightState,
            colortransState :   colortransState,
            materialState:      materialState,
            fogState :          fogState,
            modelXFormState:    modelXFormState,
            viewXFormState:     viewXFormState,
            projXFormState:     projXFormState,
            texState:           texState,
            pickState :         pickState,        // Will be DEFAULT_PICK because we are compiling whole scene here
            imageBufState :     imageBufState,
            clipState :         clipState,
            deformState :       deformState,
            morphState :        morphState,
            pickListenersState: pickListenersState,
            renderListenersState: renderListenersState
        };

        nodeMap[id] = node;

        states.bin.push(node);

        /* If node has boundary, add to BVH
         */
        //  SceneJS._bvhModule.insertNode(geo.boundary, states.sceneId, id);
    };


    /* When the canvas deactivates, we'll render the node bins.
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
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

        var context = states.canvas.context;

        /* Render opaque nodes while buffering transparent nodes
         */
        var nTransparent = 0;
        var node;
        var i, len = bin.length;
        var flags;

        //  var sceneBVH = SceneJS._bvhModule.sceneBVH[states.sceneId];

        for (i = 0; i < len; i++) {
            node = bin[i];

            //if (sceneBVH.visibleNodes[node.id]) {                                 // Node within view colume

            flags = node.flagsState.flags;

            if (flags.enabled === false) {                  // Skip disabled node
                continue;
            }

            if (picking && flags.picking === false) {       // When picking, skip unpickable node
                continue;
            }

            if (!picking && flags.transparent === true) {   // Buffer transparent node when not picking
                transparentBin[nTransparent++] = node;

            } else {
                states.nodeRenderer.renderNode(node);              // Render node if opaque or in picking mode
            }
            //}
        }

        //context.flush();

        /* Render transparent nodes with blending
         */
        if (nTransparent > 0) {

            context.enable(context.BLEND);

            //    context.blendFunc(context.SRC_ALPHA, context.ONE);  // TODO: make blend func configurable on flags?

            context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
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
            deformState.hash,
            morphState.hash,
            geoState.hash]).join(";");
    }

    function getProgram(stateHash) {
        if (!programs[stateHash]) {
            SceneJS._loggingModule.info("Creating render and pick shaders: '" + stateHash + "'");
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
        var p;
        SceneJS._memoryModule.allocate(
                states.canvas.context,
                "shader",
                function() {
                    try {
                        p = new SceneJS._webgl_Program(
                                stateHash,
                                time,
                                states.canvas.context,
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
        return p;
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

    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering vertex shader
     *---------------------------------------------------------------------------------------------------------------*/

    function composeRenderingVertexShader() {

        var texturing = isTexturing();
        var lighting = isLighting();
        var clipping = clipState.clips.length > 0;
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

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {

            for (var i = 0; i < clipState.clips.length; i++) {

                /* INPUT: Clip planes
                 */
                src.push("uniform float uClipMode" + i + ";");
                src.push("uniform vec4  uClipA" + i + ";");
                src.push("uniform vec4  uClipB" + i + ";");
                src.push("uniform vec4  uClipC" + i + ";");

                /* OUTPUT: view-space normal and distance from origin                
                 */
                src.push("varying vec4  vClipNormalAndDist" + i + ";");
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
                src.push("  tmpVertex = vec4(mix(tmpVertex.xyz, vMorphVertex.xyz, uMorphFactor), 1.0); ");
            }
            if (lighting) {
                if (morphState.morph.target1.normalBuf) {
                    src.push("  vec4 vMorphNormal = uVMatrix * (uMMatrix * vec4(aMorphNormal, 1.0)); ");
                    src.push("  tmpNormal = vec4( mix(tmpNormal.xyz, vMorphNormal.xyz, 0.0), 1.0); ");
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
                    src.push("vLightVecAndDist" + i + " = vec4(normalize(tmpVec), 0.0);");
                }
                if (light.mode == "point") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightVecAndDist" + i + " = vec4(normalize(tmpVec), length(tmpVec));");
                }
                if (light.mode == "spot") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightVecAndDist" + i + " = vec4(normalize(tmpVec), length(tmpVec));");
                }
            }
            src.push("vEyeVec = normalize(-vViewVertex.xyz);");
        }

        /*-----------------------------------------------------------------------------------
         * Logic - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            src.push("  vec4    tempA;");
            src.push("  vec4    tempB;");
            src.push("  vec4    tempC;");
            src.push("  vec3    tempNormal;");

            for (var i = 0; i < clipState.clips.length; i++) {

                src.push("    if (uClipMode" + i + " != 0.0) {");

                src.push("        tempA = uVMatrix * uClipA" + i + ";");
                src.push("        tempB = uVMatrix * uClipB" + i + ";");
                src.push("        tempC = uVMatrix * uClipC" + i + ";");

                src.push("        tempNormal = normalize(cross(normalize(tempB.xyz - tempA.xyz), normalize(tempB.xyz - tempC.xyz)));");

                src.push("        vClipNormalAndDist" + i + " = vec4(tempNormal.xyz, dot(tempNormal, tempA.xyz));");
                src.push("    }");
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

        src.push("varying vec4 vViewVertex;");              // View-space vertex

        /*-----------------------------------------------------------------------------------
         * Variables - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("uniform float uClipMode" + i + ";");
                src.push("varying vec4  vClipNormalAndDist" + i + ";");
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
                    src.push("uniform vec4  uLightPos" + i + ";");
                    src.push("uniform vec3  uLightAttenuation" + i + ";");
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
        src.push("  vec3    color   = uMaterialBaseColor;");
        src.push("  float   alpha   = uMaterialAlpha;");

        /*-----------------------------------------------------------------------------------
         * Logic - Clipping
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            src.push("  float   dist;");
            for (var i = 0; i < clipState.clips.length; i++) {
                src.push("    if (uClipMode" + i + " != 0.0) {");
                src.push("        dist = dot(vViewVertex.xyz, vClipNormalAndDist" + i + ".xyz) - vClipNormalAndDist" + i + ".w;");
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
                src.push("alpha = texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).a;");

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
            src.push("  float   lightDist;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("lightVec = normalize(vLightVecAndDist" + i + ".xyz);");

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

                    src.push("lightDist = vLightVecAndDist" + i + ".w;");

                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    src.push("if ( spotFactor > 20) {");
                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    src.push("  dotN = max(dot(normalVec,lightVec),0.0);");
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
                                 " * specular  * pow(max(dot(reflect(lightVec, normalVec),normalize(vEyeVec)),0.0), shine);");
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

    function pickFrame(canvasX, canvasY, options) {

        /* Set up pick buffer
         */
        createPickBuffer();
        bindPickBuffer();

        /* Render display list in pick mode
         */
        states.nodeRenderer.init(true);

        renderBin(states.bin, true);

        /* Read pick buffer
         */
        var pickIndex = readPickBuffer(canvasX, canvasY);

        /* Notify listeners
         */
        if (pickIndex >= 0) {
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


    function composeBBoxVertexShader() {
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",

            /* Axis-aligned bounding box
             */
            "attribute vec3 aBBoxMin;",
            "attribute vec3 aBBoxMax;",

            /* Transform matrices
             */
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;"];

        src.push("varying vec3 vViewVertex;");

        src.push("void main(void) {");
        src.push("  vec4 tmpMin = uVMatrix * (uMMatrix * vec4(aBBoxMin, 1.0)); ");
        src.push("  vec4 tmpMax = uVMatrix * (uMMatrix * vec4(aBBoxMax, 1.0)); ");
        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");
        src.push("}");
        return src.join("\n");
    }

    function composeBBoxFragmentShader() {
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif"];
        src.push("void main(void) {");
        src.push("    gl_FragColor = vec4(uPickColor.rgb, 1.0);  ");
        src.push("}");
        return src.join("\n");
    }

})();