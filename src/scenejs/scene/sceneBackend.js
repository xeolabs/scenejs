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


            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             */
            var findCanvas = function(canvasId) {
                var canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw new SceneJS.exceptions.CanvasNotFoundException
                            ('Could not find canvas document element with id \'' + canvasId + '\'');
                }
                var context;
                var contextNames = SceneJS._webgl.contextNames;
                for (var i = 0; (!context) && i < contextNames.length; i++) {
                    try {
                        context = canvas.getContext(contextNames[i]);
                    } catch (e) {

                    }
                }
                if (!context) {
                    throw new SceneJS.exceptions.WebGLNotSupportedException
                            ('Canvas document element with id \''
                                    + canvasId
                                    + '\' failed to provide a supported context');
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

            function createPickBuffer(context) {
                var buffer = {
                    frameBuffer : context.createFramebuffer(),
                    renderBuffer : context.createRenderbuffer(),
                    texture : context.createTexture()
                };
                context.bindTexture(context.TEXTURE_2D, buffer.texture);
                try { // Null may be OK with some browsers - thanks Paul
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, null);
                } catch (e) {
                    var texture = new WebcontextUnsignedByteArray(3);
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, texture);
                }
                context.bindFramebuffer(context.FRAMEBUFFER, buffer.frameBuffer);
                context.bindRenderbuffer(context.RENDERBUFFER, buffer.renderBuffer);
                context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT, 1, 1);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.framebufferTexture2D(
                        context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, buffer.texture, 0);
                context.framebufferRenderbuffer(
                        context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, buffer.renderBuffer);
                context.bindFramebuffer(context.FRAMEBUFFER, null);
                return buffer;
            };

            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene, params) {
                    if (!initialised) {
                        ctx.logging.info("SceneJS V" + SceneJS.version + " initialised");
                        ctx.events.fireEvent(SceneJS._eventTypes.INIT);
                    }
                    var canvas = findCanvas(params.canvasId);
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
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, scene.canvas);
                },

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
                        throw "Internal error: no scene active";
                    }
                    var sceneId = activeSceneId;
                    activeSceneId = null;
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED, scene.canvas);
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    //ctx.logging.info("Scene deactivated: " + sceneId);

                }
            };
        });
