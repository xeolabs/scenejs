/**
 * Backend for a scene node.
 */
SceneJS._backends.installBackend(

        "scene",

        function(ctx) {

            var initialised = false; // True as soon as first scene registered
            var scenes = {};
            var nScenes = 0;
            var activeSceneId;

            var projMat;
            var viewMat;
            var picking;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            function updatePick() {

            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(params) {
                        projMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                    });

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             *
             * If canvasId is null, will fall back on SceneJS_webgl_DEFAULT_CANVAS_ID
             */
            var findCanvas = function(canvasId) {
                var canvas;
                if (!canvasId) {
                    ctx.logging.info("SceneJS.scene config 'canvasId' omitted - looking for default canvas with ID '"
                            + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                    canvasId = SceneJS_webgl_DEFAULT_CANVAS_ID;
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        ctx.error.fatalError(new SceneJS.exceptions.CanvasNotFoundException
                                ("SceneJS.scene config 'canvasId' omitted and could not find default canvas with ID '"
                                        + SceneJS_webgl_DEFAULT_CANVAS_ID + "'"));
                    }
                } else {
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        ctx.logging.info("SceneJS.scene config 'canvasId' unresolved - looking for default canvas with " +
                                         "ID '" + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                        canvasId = SceneJS_webgl_DEFAULT_CANVAS_ID;
                        canvas = document.getElementById(canvasId);
                        if (!canvas) {
                            ctx.error.fatalError(new SceneJS.exceptions.CanvasNotFoundException
                                    ("SceneJS.scene config 'canvasId' does not match any elements in the page and no " +
                                     "default canvas found with ID '" + SceneJS_webgl_DEFAULT_CANVAS_ID + "'"));
                        }
                    }
                }
                var context;
                var contextNames = SceneJS_webgl_contextNames;
                for (var i = 0; (!context) && i < contextNames.length; i++) {
                    try {

                        context = canvas.getContext(contextNames[i]);

                        //
                        //                                                alert("WebGL Trace enabled");
                        //                                                context = WebGLDebugUtils.makeDebugContext(canvas.getContext(contextNames[i]));
                        //                                                context.setTracing(true);
                    } catch (e) {

                    }
                }
                if (!context) {
                    ctx.error.fatalError(new SceneJS.exceptions.WebGLNotSupportedException
                            ('Canvas document element with ID \''
                                    + canvasId
                                    + '\' failed to provide a supported WebGL context'));
                }
                context.clearColor(0.0, 0.0, 0.0, 1.0);
                context.clearDepth(1.0);
                context.enable(context.DEPTH_TEST);
                context.disable(context.CULL_FACE);
                context.disable(context.TEXTURE_2D);
                context.depthRange(0, 1);
                context.disable(context.SCISSOR_TEST);
                return {
                    canvas: canvas,
                    context: context,
                    canvasId : canvasId
                };
            };

           

            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene, params) {
                    if (!initialised) {
                        ctx.logging.info("SceneJS V" + SceneJS.version + " initialised");
                        ctx.events.fireEvent(SceneJS._eventTypes.INIT);
                    }
                    var canvas = findCanvas(params.canvasId); // canvasId can be null
                    var sceneId = SceneJS._utils.createKeyForMap(scenes, "scene");
                    scenes[sceneId] = {
                        sceneId: sceneId,
                        scene:scene,
                        canvas: canvas
                    };
                    nScenes++;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_CREATED, {sceneId : sceneId });
                    ctx.logging.info("Scene defined: " + sceneId);
                    return sceneId;
                },

                /** Deregisters scene
                 */
                deregisterScene :function(sceneId) {
                    scenes[sceneId] = null;
                    nScenes--;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DESTROYED, {sceneId : sceneId });
                    if (activeSceneId == sceneId) {
                        activeSceneId = null;
                    }
                    ctx.logging.info("Scene destroyed: " + sceneId);
                    if (nScenes == 0) {
                        ctx.logging.info("SceneJS reset");
                        ctx.events.fireEvent(SceneJS._eventTypes.RESET);

                    }
                },

                /** Specifies which registered scene is the currently active one
                 */
                activateScene : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        ctx.error.fatalError("Scene not defined: '" + sceneId + "'");
                    }
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, scene.canvas);
                },

                /** Returns the canvas element the given scene is bound to
                 */
                getSceneCanvas : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        ctx.error.fatalError("Scene not defined: '" + sceneId + "'");
                    }
                    return scene.canvas.canvas;
                },
                //
                //                activatePick : function(sceneId) {
                //
                //                },

                /** Returns all registered scenes
                 */
                getAllScenes:function() {
                    var list = [];
                    for (var id in scenes) {
                        var scene = scenes[id];
                        if (scene) {
                            list.push(scene.scene);
                        }
                    }
                    return list;
                },

                /** Finds a registered scene
                 */
                getScene : function(sceneId) {
                    return scenes[sceneId].scene;
                },

                /** Deactivates the currently active scene and reaps destroyed and timed out processes
                 */
                deactivateScene : function() {
                    if (!activeSceneId) {
                        ctx.error.fatalError("Internal error: no scene active");
                    }
                    var sceneId = activeSceneId;
                    activeSceneId = null;
                    var scene = scenes[sceneId];
                    if (!scene) {
                        ctx.error.fatalError("Scene not defined: '" + sceneId + "'");
                    }
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED, scene.canvas);
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    //ctx.logging.info("Scene deactivated: " + sceneId);

                }
            };
        });
