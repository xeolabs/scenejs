/**
 *@class Root node of a SceneJS scene graph.
 *
 * <p>This is entry and exit point for execution when rendering one frame of a scene graph, which also configures certain
 * global scene parameters as listed below. </p>
 * <p><b>Binding to a canvas</b></p>
 * <p>The Scene node can be configured with a <b>canvasId</b> property to specify the ID of a WebGL compatible Canvas
 * element for the scene to render to. When that is omitted, the node will look for one with the default ID of
 * "_scenejs-default-canvas".</p>
 * <p><b>Timeout for {@link SceneJS.Instance} sub-nodes</b></p>
 * <p>The Scene node can be configured with a <b>loadTimeoutSecs</b> property to specify the number of seconds within
 * which {@link SceneJS.Instance} nodes within its subgraph must receive and parse their content. That may be overridden
 * in the configs of individual {@link SceneJS.Instance} nodes.
 * <p><b>Usage Example:</b></p><p>Shown below is Scene bound to a canvas and specifying a JSONP proxy, that contains a
 * {@link SceneJS.LookAt} node whose "eye" property is dynamically configured with a callback. A {@link SceneJS.LoadCollada}
 * node loads a Collada model cross-domain through the proxy. When the Scene is rendered, a value for the
 * {@link Scene.LookAt}'s property is injected into it. The Scene will put the property on a data scope (which is
 * implemented by a {@link SceneJS.Data}) that the {@link SceneJS.LookAt}'s config callback then accesses.</b></p>
 * <pre><code>
 * var myScene = new SceneJS.Scene({
 *
 *              // Bind scene to render to WebGL Canvas element with given ID.
 *              // Default is "_scenejs-default-canvas"
 *
 *              canvasId:        "myCanvas",
 *
 *              // Optionally write scene logging to a DIV:
 *
 *              loggingElementId: "myLoggingDiv",
 *
 *              // Optional default timeout for SceneJS.Instance<xxx> nodes, which may override
 *              // it individually - default is 180 seconds
 *
 *              loadTimeoutSecs: 180
 *          },
 *
 *          new SceneJS.LookAt(
 *              function(data) {
 *                  return {
 *                      eye: data.get("eye")
 *                  };
 *              },
 *
 *              new SceneJS.LoadCollada("http://foo.com/models/myModel.dae")
 *      );
 *
 * myScene.render({
 *          eye: {
 *             x: 0, y: 0, z: -100
 *          }
 *      });
 *
 * </pre></code>
 * @extends SceneJS.Node
 */
SceneJS.Scene = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scene";
    if (!this._fixedParams) {
        throw SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException
                        ("Dynamic configuration of SceneJS.scene node is not supported"));
    }
    this._params = this._getParams();
    this._lastRenderedData = null;
    if (this._params.canvasId) {
        this._canvasId = document.getElementById(this._params.canvasId) ? this._params.canvasId : SceneJS.Scene.DEFAULT_CANVAS_ID;
    } else {
        this._canvasId = SceneJS.Scene.DEFAULT_CANVAS_ID;
    }
};

SceneJS._inherit(SceneJS.Scene, SceneJS.Node);

/** ID of canvas SceneJS looks for when {@link SceneJS.Scene} node does not supply one
 */
SceneJS.Scene.DEFAULT_CANVAS_ID = "_scenejs-default-canvas";

/** ID ("_scenejs-default-logging") of default element to which {@link SceneJS.Scene} node will log to, if found.
 */
SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID = "_scenejs-default-logging";

/** Returns the ID of the canvas element that this scene is to bind to. When no canvasId was configured, it will be the
 * the default ID of "_scenejs-default-canvas".
 */
SceneJS.Scene.prototype.getCanvasId = function() {
    return this._canvasId;
};

/**
 * Renders the scene, passing in any properties required for dynamic configuration of its contained nodes.
 *
 */
SceneJS.Scene.prototype.render = function(paramOverrides) {
    if (!this._sceneId) {
        this._sceneId = SceneJS_sceneModule.createScene(this, this._getParams());
    }
    SceneJS_sceneModule.activateScene(this._sceneId);
    SceneJS_loadModule.setLoadTimeoutSecs(this._params.loadTimeoutSecs);  // null to use default     
    var traversalContext = {};
    this._renderNodes(traversalContext, new SceneJS.Data(null, false, paramOverrides));
    SceneJS_loadModule.setLoadTimeoutSecs(null);
    SceneJS_sceneModule.deactivateScene();
    this._lastRenderedData = paramOverrides;
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
//                throw new SceneJS.PickWithoutRenderedException
//                        ("Scene not rendered - need to render before picking");
//            }
//            SceneJS_sceneModule.activateScene(this._sceneId);  // Also activates canvas
//            SceneJS_pickModule.pick(canvasX, canvasY);
//            if (this._params.loadProxy) {
//                SceneJS_loadModule.setLoadProxyUri(this._params.proxy);
//            }
//            var traversalContext = {};
//            this._renderNodes(traversalContext, this._lastRenderedData);
//            SceneJS_loadModule.setLoadProxyUri(null);
//            var picked = SceneJS_pickModule.getPicked();
//            SceneJS_sceneModule.deactivateScene();
//            return picked;
//        } finally {
//            SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_RENDER;
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

/** Factory function that returns a new {@link SceneJS.Scene} instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Scene constructor
 * @returns {SceneJS.Scene}
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

