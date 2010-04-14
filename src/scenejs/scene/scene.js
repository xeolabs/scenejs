/**
 * Root node of a scene graph. Like all nodes, its arguments are an optional config object followed by
 * zero or more child nodes. The members of the config object are set on the root data data when rendered.
 *
 */

(function() {

    var eventsBackend = SceneJS._backends.getBackend('events');
    var sceneBackend = SceneJS._backends.getBackend('scene');
    var loadBackend = SceneJS._backends.getBackend('load');
    var processesBackend = SceneJS._backends.getBackend('processes');
    var pickBackend = SceneJS._backends.getBackend('pick');

    /** Creates a new scene
     */
    SceneJS.scene = function() {

        /* Check that backend modules installed OK
         */
        if (SceneJS._backends.getStatus().error) {
            throw SceneJS._backends.getStatus().error;
        }

        /* Collect scene params
         */
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        if (!cfg.fixed) {
            throw new SceneJS.exceptions.UnsupportedOperationException
                    ("Dynamic configuration of SceneJS.scene node is not supported");
        }
        var params = cfg.getParams();

        var lastRenderedData = null; // Saves data from last render for picking traversal

        var sceneId = null; // Unique ID for this scene graph - null again as soon as scene destroyed

        /* Create, register and return the scene graph
         */
        var _scene = {

            /** Returns the canvas element that this scene is bound to. When no canvasId was configured, it will be one
             * that SceneJS selected by default, hence the need to use this method to get the canvas through the scene
             * node rather than assume its ID.
             */
            getCanvas : function() {
                if (!sceneId) {
                    return null;
                }
                return sceneBackend.getSceneCanvas(sceneId);
            },

            /**
             * Renders the scene, passing in the given parameters to override any node parameters
             * that were set on the config.
             */
            render : function(paramOverrides) {
                try {
                    if (sceneId) {
                        sceneBackend.activateScene(sceneId);
                        var data = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed data for cacheing??
                        if (paramOverrides) {        // Override with traversal params
                            for (var key in paramOverrides) {
                                data.put(key, paramOverrides[key]);
                            }
                        }
                        if (params.proxy) {
                            loadBackend.setProxy(params.proxy);
                        }
                        var traversalContext = {

                        };
                        SceneJS._utils.visitChildren(cfg, traversalContext, data);
                        loadBackend.setProxy(null);
                        sceneBackend.deactivateScene();
                        lastRenderedData = data;
                    }
                } catch (e) {
                    alert(e.message || e);
                    throw e;
                }
            },

            /**
             * Performs pick on rendered scene and returns path to picked geometry, if any. The path is the
             * concatenation of the names specified by SceneJS.name nodes on the path to the picked geometry.
             * The scene must have been previously rendered, since this method re-renders it (to a special
             * pick frame buffer) using parameters retained from the prior render() call.
             *
             * @param canvasX
             * @param canvasY
             */
            pick : function(canvasX, canvasY) {
                if (sceneId) {
                    try {
                        if (!lastRenderedData) {
                            throw new SceneJS.exceptions.PickWithoutRenderedException
                                    ("Scene not rendered - need to render before picking");
                        }
                        sceneBackend.activateScene(sceneId);
                        pickBackend.pick(canvasX, canvasY);
                        if (params.proxy) {
                            loadBackend.setProxy(params.proxy);
                        }
                        var traversalContext = {};
                        SceneJS._utils.visitChildren(cfg, traversalContext, lastRenderedData);
                        loadBackend.setProxy(null);
                        var picked = pickBackend.getPicked();
                        sceneBackend.deactivateScene();
                        return picked;
                    } finally {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    }
                }
            },

            /**
             * Returns count of active processes. A non-zero count indicates that the scene should be rendered
             * at least one more time to allow asynchronous processes to complete - since processes are
             * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
             * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
             * a race condition.
             */
            getNumProcesses : function() {
                return (sceneId) ? processesBackend.getNumProcesses(sceneId) : 0;
            },

            /** Destroys this scene, after which it cannot be rendered any more. You should destroy
             * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
             * resources for it (eg. shaders, VBOs etc) that are no longer in use.
             */
            destroy : function() {
                if (sceneId) {
                    sceneBackend.deregisterScene(sceneId); // Last one fires RESET command
                    sceneId = null;
                }
            },

            /** Returns true if scene active, ie. not destroyed
             */
            isActive: function() {
                return (sceneId != null);
            }
        };

        /* Register scene - fires a SCENE_CREATED event
         */
        sceneId = sceneBackend.registerScene(_scene, params);

        return _scene;
    };

    /** Total SceneJS reset - destroys all scenes and cached resources.
     */
    SceneJS.reset = function() {
        var scenes = sceneBackend.getAllScenes();
        var temp = [];
        for (var i = 0; i < scenes.length; i++) {
            temp.push(scenes[i]);
        }
        while (temp.length > 0) {

            /* Destroy each scene individually so it they can mark itself as destroyed.
             * A RESET command will be fired after the last one is destroyed.
             */
            temp.pop().destroy();
        }
    };

    SceneJS.onEvent = function(name, func) {
        switch (name) {

            case "error" : eventsBackend.onEvent(
                    SceneJS._eventTypes.ERROR,
                    function(params) {
                        func({
                            exception: params.exception,
                            fatal: params.fatal
                        });
                    });
                break;

            case "scene-created" : eventsBackend.onEvent(
                    SceneJS._eventTypes.SCENE_CREATED,
                    function(params) {
                        func({
                            sceneId : params.sceneId
                        });
                    });
                break;

            case "scene-activated" : eventsBackend.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        func({
                            sceneId : params.sceneId
                        });
                    });
                break;

            case "canvas-activated" : eventsBackend.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(params) {
                        func({
                            canvas: params.canvas
                        });
                    });
                break;

            case "process-created" : eventsBackend.onEvent(
                    SceneJS._eventTypes.PROCESS_CREATED,
                    function(params) {
                        func(params);
                    });
                break;

            case "process-timed-out" : eventsBackend.onEvent(
                    SceneJS._eventTypes.PROCESS_TIMED_OUT,
                    function(params) {
                        func(params);
                    });
                break;

            case "process-killed" : eventsBackend.onEvent(
                    SceneJS._eventTypes.PROCESS_KILLED,
                    function(params) {
                        func(params);
                    });
                break;

            case "scene-deactivated" : eventsBackend.onEvent(
                    SceneJS._eventTypes.SCENE_DEACTIVATED,
                    function(params) {
                        func({
                            sceneId : params.sceneId
                        });
                    });
                break;

            case "scene-destroyed" : eventsBackend.onEvent(
                    SceneJS._eventTypes.SCENE_DESTROYED,
                    function(params) {
                        func({
                            sceneId : params.sceneId
                        });
                    });
                break;


            default:
                throw "SceneJS.onEvent - this event type not supported: '" + name + "'";
        }
    };
})();
