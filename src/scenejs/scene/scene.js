/**
 *@class Root node of a SceneJS scene graph.
 *
 * <p>This is entry and exit point for execution when rendering one frame of a scene graph, while also providing
 * the means to configure global data scope values and configurations for each frame. </p>
 * <p><b>Binding to a canvas</b></p>
 * <p>The Scene node can be configured with a <b>canvasId</b> property to specify the ID of a WebGL compatible Canvas
 * element for the scene to render to. When that is omitted, the node will look for one with the default ID of
 * "_scenejs-default-canvas".</p>
 * <p><b>Timeout for {@link SceneJS.Instance} sub-nodes</b></p>
 * <p>The Scene node can be configured with a <b>loadTimeoutSecs</b> property to specify the number of seconds within
 * which {@link SceneJS.Instance} nodes within its subgraph must receive and parse content when they load it from files.
 * That may be overridden in the configs of individual {@link SceneJS.Instance} nodes.
 * <p><b>Usage Example:</b></p><p>Shown below is Scene bound to a canvas and specifying a JSONP proxy, that contains a
 * {@link SceneJS.LookAt} node whose "eye" property is dynamically configured with a callback. A {@link SceneJS.Instance}
 * node loads a Collada model cross-domain through the proxy. When the Scene is rendered, a value for the
 * {@link Scene.LookAt}'s property is injected into it. The Scene will put the property on a data scope (which is
 * implemented by a {@link SceneJS.Data}) that the {@link SceneJS.LookAt}'s config callback then accesses.</b></p>
 * <pre><code>
 *
 * // To enable the COLLADA content to load cross-domain, we'll first configure SceneJS with a strategy to allow it
 * // to use a Web service to proxy the JSONP load request. As shown here, the strategy implements two methods, one to
 * // create the request URL for the service, and another to extract the data from the response.
 *
 * SceneJS.setJSONPStrategy({
 *     request : function(url, format, callback) {
 *        return "http://scenejs.org/cgi-bin/jsonp_proxy.pl?uri=" + url + "&format=" + format + "&callback=" + callback;
 *     },
 *
 *    response : function(data) {
 *
 *        // The SceneJS proxy will provide an error message like this when
 *        // it fails to service the request
 *
 *        if (data.error) {
 *            throw "Proxy server responded with error: " + data.error;
 *        }
 *        return data;
 *    }
 * });
 *
 * var myScene = new SceneJS.Scene({
 *
 *         // Bind scene to render to WebGL Canvas element with given ID.
 *         // Default is "_scenejs-default-canvas"
 *
 *         canvasId:        "myCanvas",
 *
 *         // Optionally write scene logging to a DIV:
 *
 *        loggingElementId: "myLoggingDiv",
 *
 *        // Optional default timeout for SceneJS.Instance<xxx> nodes, which may override
 *        // it individually - default is 180 seconds
 *
 *       loadTimeoutSecs: 180
 *   },
 *
 *   new SceneJS.LookAt(
 *       function(data) {
 *           return {
 *              eye: data.get("eye")
 *          };
 *       },
 *
 *       new SceneJS.Instance({ uri: "http://foo.com/models/myModel.dae" })
 * );
 *
 * myScene.setData({
 *          eye: {
 *             x: 0, y: 0, z: -100
 *          }
 *      }).render();
 *
 * </pre></code>
 * @extends SceneJS.Node
 */
SceneJS.Scene = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scene";
    if (!this._fixedParams) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException
                        ("Dynamic configuration of SceneJS.scene node is not supported"));
    }
    this._params = this._getParams();
    this._data = {};
    this._configs = {};
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
 * Sets a map of values to set on the global scene data scope. This data will then be available
 * to any configuration callbacks that are used to configure nodes. The map is the same as that
 * configured on a {@link SceneJS.WithData} and works the same way. The given values will be forgotten
 * when the scene is next rendered with {@link #render}.
 * @param {object} values Values for the global scene data scope, same format as that given to {@link SceneJS.WithData}
 */
SceneJS.Scene.prototype.setData = function(values) {
    this._data = values || {};
    return this;
};

/**
 * Returns any data values map previously set with {@link #setData} since the last call to {@link #render}.
 *
 * @returns {Object} The data values map
 */
SceneJS.Scene.prototype.getData = function() {
    return this._configs;
};

/**
 * Sets a map of values to set on nodes in the scene graph as they are rendered. The map is the same as that
 * configured on a {@link SceneJS.WithConfigs} and works the same way. The given values will be forgotten
 * when the scene is next rendered with {@link #render}.
 * @param {object} values Map of values, same format as that given to {@link SceneJS.WithConfigs}
 */
SceneJS.Scene.prototype.setConfigs = function(values) {
    this._configs = values || {};
    return this;
};

/**
 * Returns any config values map previously set with {@link #setConfigs} since the last call to {@link #render}.
 *
 * @returns {Object} The config values map
 */
SceneJS.Scene.prototype.getConfigs = function() {
    return this._configs;
};

/**
 * Renders the scene, applying any config and data scope values given to {@link #setData} and {#link setConfigs},
 * then clearing those values afterwards.
 */
SceneJS.Scene.prototype.render = function() {
    if (!this._sceneId) {
        this._sceneId = SceneJS._sceneModule.createScene(this, this._getParams());
    }
    SceneJS._sceneModule.activateScene(this._sceneId);
    var traversalContext = {};
    this._renderNodes(traversalContext, new SceneJS.Data(null, false, this._data));
    SceneJS._sceneModule.deactivateScene();
    this._lastRenderedData = this._data;
    this._data = {};
    this._configs = {};
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
//            SceneJS._sceneModule.activateScene(this._sceneId);  // Also activates canvas
//            SceneJS._pickModule.pick(canvasX, canvasY);
//            if (this._params.loadProxy) {
//                SceneJS._loadModule.setLoadProxyUri(this._params.proxy);
//            }
//            var traversalContext = {};
//            this._renderNodes(traversalContext, this._lastRenderedData);
//            SceneJS._loadModule.setLoadProxyUri(null);
//            var picked = SceneJS._pickModule.getPicked();
//            SceneJS._sceneModule.deactivateScene();
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
    return (this._sceneId) ? SceneJS._processModule.getNumProcesses(this._sceneId) : 0;
};

/** Destroys this scene. You should destroy
 * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
 * resources for it (eg. shaders, VBOs etc) that are no longer in use. A destroyed scene
 * becomes un-destroyed as soon as you render it again.
 */
SceneJS.Scene.prototype.destroy = function() {
    if (this._sceneId) {
        SceneJS._sceneModule.destroyScene(this._sceneId); // Last one fires RESET command
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
    var scenes = SceneJS._sceneModule.getAllScenes();
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

//
//SceneJS._Visitor = (function() {
//    this._nodeStack = new Object[5000];
//    this._nStack = 0;
//
//
//    this.visit = function(node, tc, data) {
//        this._nodeStack[this._nStack++] = node;
//        while (this._nStack > 0) {
//            node = this._nodeStack[--this._nStack];
//            node._visited = true;
//            node._preRender(tc, data);
//            for (var i = 0; i < node._children.length; i++) {
//
//            }
//
//        }
//
//
//        node._preRender(tc, data);
//        node._render(tc, data);
//        node._postRender(tc, data);
//    };
//
//    this.visitChildren = function(children, tc, data) {
//        node._preRender(tc, data);
//        node._render(tc, data);
//
//        node._postRender(tc, data);
//    };
//});
