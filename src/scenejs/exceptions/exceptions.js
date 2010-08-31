SceneJS.errors = {};
/**
 * @class Wrapper for an exception not recognised by SceneJS.
 */
SceneJS.errors.Exception = function(msg, cause) {
    this.message = "SceneJS.errors.Exception: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS when a recognised WebGL context could not be found on the canvas specified to a {@link SceneJS.Scene}.
 */
SceneJS.errors.WebGLNotSupportedException = function(msg, cause) {
    this.message = "SceneJS.errors.WebGLNotSupportedException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by {@link SceneJS.Node} or subtypes when a mandatory configuration was not supplied
 */
SceneJS.errors.NodeConfigExpectedException = function(msg, cause) {
    this.message = "SceneJS.errors.NodeConfigExpectedException: " + msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.errors.ShaderCompilationFailureException = function(msg, cause) {
    this.message = "SceneJS.errors.ShaderCompilationFailureException: " + msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.errors.ShaderLinkFailureException = function(msg, cause) {
    this.message = "SceneJS.errors.ShaderLinkFailureException: " + msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.errors.NoSceneActiveException = function(msg, cause) {
    this.message = "SceneJS.errors.NoSceneActiveException: " + msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.errors.NoCanvasActiveException = function(msg, cause) {
    this.message = "SceneJS.errors.NoCanvasActiveException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown when a {@link SceneJS.Scene} 'canvasId' configuration does not match any elements in the page and no
 * default canvas was found with the ID specified in {@link SceneJS.Scene.DEFAULT_CANVAS_ID}.
 */
SceneJS.errors.CanvasNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.CanvasNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS node classes when configuration property is invalid.
 */
SceneJS.errors.InvalidNodeConfigException = function(msg, cause) {
    this.message = "SceneJS.errors.InvalidNodeConfigException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when SceneJS fails to allocate a buffer (eg. texture, vertex array) in video RAM.
 * <p>Whether this is actually thrown before your GPU/computer hangs depends on the quality of implementation within the underlying
 * OS/OpenGL/WebGL stack, so there are no guarantees that SceneJS will warn you with one of these.</p.
 */
SceneJS.errors.OutOfVRAMException = function(msg, cause) {
    this.message = "SceneJS.errors.OutOfVRAMException: " + msg;
    this.cause = cause;
};

/**@class  Exception thrown when a {@link SceneJS.Scene} 'loggingElementId' configuration does not match any elements in the page and no
 * default DIV was found with the ID specified in {@link SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID}.
 */
SceneJS.errors.DocumentElementNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.DocumentElementNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown by nodes such as {@link SceneJS.Renderer} and {@link SceneJS.Texture} when the browser's WebGL does not support
 * a specified config value.
 */
SceneJS.errors.WebGLUnsupportedNodeConfigException = function(msg, cause) {
    this.message = "SceneJS.errors.WebGLUnsupportedNodeConfigException: " + msg;
    this.cause = cause;
};

/** @private */
SceneJS.errors.PickWithoutRenderedException = function(msg, cause) {
    this.message = "SceneJS.errors.PickWithoutRenderedException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when a node (such as {@link SceneJS.ScalarInterpolator}) expects to find some element of data on the current
 * data scope (SceneJS.Data).
 */
SceneJS.errors.DataExpectedException = function(msg, cause) {
    this.message = "SceneJS.errors.DataExpectedException: " + msg;
    this.cause = cause;
};


/**
 * @class  Exception thrown to signify a general internal SceneJS exception, ie. a SceneJS implementation bug.
 */
SceneJS.errors.InternalException = function(msg, cause) {
    this.message = "SceneJS.errors.InternalException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that a {@link SceneJS.Instance} node could not find
 * it's target node
 */
SceneJS.errors.SymbolNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.SymbolNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that a {@link SceneJS.Instance} node is attempting to create a cyclic
 * chain of instantiation
 */
SceneJS.errors.CyclicInstanceException = function(msg, cause) {
    this.message = "SceneJS.errors.CyclicInstanceException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify an attempt to link/nest {@link SceneJS.Node}s or subtypes in a manner that would create an invalid scene graph
 * a {@link SceneJS.Symbol} to instance
 */
SceneJS.errors.InvalidSceneGraphException = function(msg, cause) {
    this.message = "SceneJS.errors.InvalidSceneGraphException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that browser does not support the {@link SceneJS.Socket} node (ie. WebSockets not supported)
 */
SceneJS.errors.SocketNotSupportedException = function(msg, cause) {
    this.message = "SceneJS.errors.SocketNotSupportedException: " + msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify error condition on a {@link SceneJS.Socket}
 */
SceneJS.errors.SocketErrorException = function(msg, cause) {
    this.message = "SceneJS.errors.SocketErrorException: " + msg;
    this.cause = cause;
};


/**
 * @class  Exception thrown to signify error response by a {@link SceneJS.Socket} node's server peer.
 */
SceneJS.errors.SocketServerErrorException = function(msg, cause) {
    this.message = "SceneJS.errors.SocketServerErrorException: " + msg;
    this.cause = cause;
};


/**
 * @class Exception thrown by {@link SceneJS.WithConfigs} when in strictNodes mode and a node reference
 * on its configuration map could not be resolved to any nodes in it's subgraph.
 */
SceneJS.errors.WithConfigsNodeNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.WithConfigsNodeNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by {@link SceneJS.WithConfigs} when in strictProperties mode and a property reference
 * on its configuration map could not be resolved to any methods on a specified target node in it's subgraph.
 */
SceneJS.errors.WithConfigsPropertyNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.WithConfigsPropertyNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by {@link SceneJS.UseModule} when it cannot find a module matching it's name configuration
 * property. This is likely to be because you didn't load any module of that name with SceneJS.requireModule().
 */
SceneJS.errors.ModuleNotFoundException = function(msg, cause) {
    this.message = "SceneJS.errors.ModuleNotFoundException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by {@link SceneJS#requireModule} when a module does not load within timeout interval.
 */
SceneJS.errors.ModuleLoadTimeoutException = function(msg, cause) {
    this.message = "SceneJS.errors.ModuleLoadTimeoutException: " + msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by {@link SceneJS#installModule} when a module caused an exception while installing.
 */
SceneJS.errors.ModuleInstallFailureException = function(msg, cause) {
    this.message = "SceneJS.errors.ModuleInstallFailureException: " + msg;
    this.cause = cause;
};





