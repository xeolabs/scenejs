/**
 @class SceneJS.Scene
 @extends SceneJS.Node
 <p>Root node of a scene graph</p>
 @throws {SceneJS.exceptions.UnsupportedOperationException} If attempt made to configure scene with function
 */
SceneJS.Scene = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scene";
    if (!this._fixedParams) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.UnsupportedOperationException
                        ("Dynamic configuration of SceneJS.scene node is not supported"));
    }
    this._params = this._getParams();
    this._lastRenderedData = null;
    if (this._params.canvasId) {
        this._canvasId = document.getElementById(this._params.canvasId) ? this._params.canvasId : SceneJS_webgl_DEFAULT_CANVAS_ID;
    } else {
        this._canvasId = SceneJS_webgl_DEFAULT_CANVAS_ID;
    }
};

SceneJS._utils.inherit(SceneJS.Scene, SceneJS.Node);

/** Returns the ID of the canvas element that this scene is to bind to. When no canvasId was configured, it will be the
 * the default ID of "_scenejs-default-canvas".
 */
SceneJS.Scene.prototype.getCanvasId = function() {
    return this._canvasId;
};

/**
 * Renders the scene, passing in the given parameters to override any node parameters
 * that were set on the Scene config.
 * @private
 */
SceneJS.Scene.prototype.render = function(paramOverrides) {
    if (!this._sceneId) {
        this._sceneId = SceneJS_sceneModule.createScene(this, this._getParams());
    }
    SceneJS_sceneModule.activateScene(this._sceneId);
    var data = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed data for cacheing??
    if (paramOverrides) {        // Override with traversal params
        for (var key in paramOverrides) {
            data.put(key, paramOverrides[key]);
        }
    }
    if (this._params.proxy) {
        SceneJS_loadModule.setProxy(this._params.proxy);
    }
    var traversalContext = {
    };
    this._renderNodes(traversalContext, data);
    SceneJS_loadModule.setProxy(null);
    SceneJS_sceneModule.deactivateScene();
    this._lastRenderedData = data;
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
//SceneJS.Scene.prototype.pick = function(canvasX, canvasY) {
//    if (this._sceneId) {
//        try {
//            if (!this._lastRenderedData) {
//                throw new SceneJS.exceptions.PickWithoutRenderedException
//                        ("Scene not rendered - need to render before picking");
//            }
//            SceneJS_sceneModule.activateScene(this._sceneId);  // Also activates canvas
//            SceneJS_pickModule.pick(canvasX, canvasY);
//            if (this._params.proxy) {
//                SceneJS_loadModule.setProxy(this._params.proxy);
//            }
//            var traversalContext = {};
//            this._renderNodes(traversalContext, this._lastRenderedData);
//            SceneJS_loadModule.setProxy(null);
//            var picked = SceneJS_pickModule.getPicked();
//            SceneJS_sceneModule.deactivateScene();
//            return picked;
//        } finally {
//            SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
//        }
//    }
//};


/**
 * Returns count of active processes. A non-zero count indicates that the scene should be rendered
 * at least one more time to allow asynchronous processes to complete - since processes are
 * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
 * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
 * a race condition.
 */
SceneJS.Scene.prototype.getNumProcesses = function() {
    return (this._sceneId) ? SceneJS_processModule.getNumProcesses(this._sceneId) : 0;
};

/** Destroys this scene. You should destroy
 * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
 * resources for it (eg. shaders, VBOs etc) that are no longer in use. A destroyed scene
 * becomes un-destroyed as soon as you render it again.
 */
SceneJS.Scene.prototype.destroy = function() {
    if (this._sceneId) {
        SceneJS_sceneModule.destroyScene(this._sceneId); // Last one fires RESET command
        this._sceneId = null;
    }
};

/** Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function() {
    return (this._sceneId != null);
};

/** Factory function that returns a new Scene instance
 *
 */
SceneJS.scene = function() {
    var n = new SceneJS.Scene();
    SceneJS.Scene.prototype.constructor.apply(n, arguments);
    return n;
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

