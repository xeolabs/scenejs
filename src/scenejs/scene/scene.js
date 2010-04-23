/** Root node of a scene graph
 *
 * @class SceneJS.scene
 * @extends SceneJS.node
 */
SceneJS.scene = function() {   

    /* Collect scene params
     */
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of SceneJS.scene node is not supported");
    }
    var params = cfg.getParams();

    var sceneId = null; // Unique ID for this scene graph - null again as soon as scene destroyed

    /* Create, register and return the scene graph
     */
    var _scene = SceneJS._utils.createNode(
            "scene",
            cfg.children,

            new (function() {

                var lastRenderedData = null; // Saves data from last render for picking traversal

                /** Returns the canvas element that this scene is bound to. When no canvasId was configured, it will be one
                 * that SceneJS selected by default, hence the need to use this method to get the canvas through the scene
                 * node rather than assume its ID.
                 */
                this.getCanvas = function() {
                    if (!sceneId) {
                        return null;
                    }
                    return SceneJS_sceneModule.getSceneCanvas(sceneId);
                };

                /**
                 * Renders the scene, passing in the given parameters to override any node parameters
                 * that were set on the config.
                 */
                this.render = function(paramOverrides) {
                    if (sceneId) {
                        SceneJS_sceneModule.activateScene(sceneId);
                        var data = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed data for cacheing??
                        if (paramOverrides) {        // Override with traversal params
                            for (var key in paramOverrides) {
                                data.put(key, paramOverrides[key]);
                            }
                        }
                        if (params.proxy) {
                            SceneJS_loadModule.setProxy(params.proxy);
                        }
                        var traversalContext = {

                        };
                        this._renderChildren(traversalContext, data);
                        SceneJS_loadModule.setProxy(null);
                        SceneJS_sceneModule.deactivateScene();
                        lastRenderedData = data;
                    }
                };

                /**
                 * Performs pick on rendered scene and returns path to picked geometry, if any. The path is the
                 * concatenation of the names specified by SceneJS.name nodes on the path to the picked geometry.
                 * The scene must have been previously rendered, since this method re-renders it (to a special
                 * pick frame buffer) using parameters retained from the prior render() call.
                 *
                 * @param canvasX
                 * @param canvasY
                 */
                this.pick = function(canvasX, canvasY) {
                    if (sceneId) {
                        try {
                            if (!lastRenderedData) {
                                throw new SceneJS.exceptions.PickWithoutRenderedException
                                        ("Scene not rendered - need to render before picking");
                            }
                            SceneJS_sceneModule.activateScene(sceneId);  // Also activates canvas
                            SceneJS_pickModule.pick(canvasX, canvasY);
                            if (params.proxy) {
                                SceneJS_loadModule.setProxy(params.proxy);
                            }
                            var traversalContext = {};
                            this._renderChildren(traversalContext, lastRenderedData);
                            SceneJS_loadModule.setProxy(null);
                            var picked = SceneJS_pickModule.getPicked();
                            SceneJS_sceneModule.deactivateScene();
                            return picked;
                        } finally {
                            SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                        }
                    }
                };

                /**
                 * Returns count of active processes. A non-zero count indicates that the scene should be rendered
                 * at least one more time to allow asynchronous processes to complete - since processes are
                 * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
                 * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
                 * a race condition.
                 */
                this.getNumProcesses = function() {
                    return (sceneId) ? SceneJS_processModule.getNumProcesses(sceneId) : 0;
                };

                /** Destroys this scene, after which it cannot be rendered any more. You should destroy
                 * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
                 * resources for it (eg. shaders, VBOs etc) that are no longer in use.
                 */
                this.destroy = function() {
                    if (sceneId) {
                        SceneJS_sceneModule.destroyScene(sceneId); // Last one fires RESET command
                        sceneId = null;
                    }
                };

                /** Returns true if scene active, ie. not destroyed
                 */
                this.isActive = function() {
                    return (sceneId != null);
                };
            })());

    /* Register scene - fires a SCENE_CREATED event
     */
    sceneId = SceneJS_sceneModule.createScene(_scene, params);

    return _scene;
};

/** Total SceneJS reset - destroys all scenes and cached resources.
 */
SceneJS.reset = function() {
    var scenes = SceneJS_sceneModule.getAllScenes();
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

        case "error" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.ERROR,
                function(params) {
                    func({
                        exception: params.exception,
                        fatal: params.fatal
                    });
                });
            break;

        case "reset" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.RESET,
                function() {
                    func();
                });
            break;

        case "scene-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_CREATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_ACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "canvas-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.CANVAS_ACTIVATED,
                function(params) {
                    func({
                        canvas: params.canvas
                    });
                });
            break;

        case "process-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_CREATED,
                function(params) {
                    func(params);
                });
            break;

        case "process-timed-out" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_TIMED_OUT,
                function(params) {
                    func(params);
                });
            break;

        case "process-killed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_KILLED,
                function(params) {
                    func(params);
                });
            break;

        case "scene-deactivated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DEACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-destroyed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DESTROYED,
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

