/**
 * @class Exception thrown by SceneJS when a recognised WebGL context could not be found on the canvas specified to a SceneJS.Scene.
 */
SceneJS.WebGLNotSupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS node classes when a mandatory configuration was not supplied
 */
SceneJS.NodeConfigExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.ShaderCompilationFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.ShaderLinkFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.NoSceneActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.NoCanvasActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown when a SceneJS.Scene 'canvasId' configuration does not match any elements in the page and no
 * default canvas was found with the ID specified in SceneJS.DEFAULT_CANVAS_ID.
 */
SceneJS.CanvasNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS node classes when configuration property is invalid.
 */
SceneJS.InvalidNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when SceneJS fails to allocate a buffer (eg. texture, vertex array) in video RAM.
 * <p>Whether this is actually thrown before your GPU/computer hangs depends on the quality of implementation within the underlying
 * OS/OpenGL/WebGL stack, so there are no guarantees that SceneJS will warn you with one of these.</p.
 */
SceneJS.OutOfVRAMException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**@class  Exception thrown when a SceneJS.LoggingToPage 'elementId' configuration does not match any elements in the page and no
 * default DIV was found with the ID specified in SceneJS.DEFAULT_LOGGING_DIV_ID.
 */
SceneJS.DocumentElementNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when parsing of a Collada file fails for some reason.
 */
SceneJS.ColladaParseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when the element ID given in its 'node' configuration does not match the ID
 * of any node in the Collada document.
 */
SceneJS.ColladaRootNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when it could not find the default Collada node ("asset) to parse and needs you to
 * explicitly provide the ID of a target asset through a 'node' configuration property.
 */
SceneJS.ColladaRootRequiredException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when you have attempted to make a cross-domain load without specify the proxy to mediate the transfer. The
 * URL of the proxy must be specified with a 'proxy' configuration property on either the SceneJS.Scene node or the node
 * that does the load  (eg. SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyNotSpecifiedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify an error response from the proxy configured for cross-domain loads
 * (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyErrorResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify an empty response from the proxy configured for cross-domain loads
 * (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyEmptyResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that empty content was loaded (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.EmptyResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that an HTTP error occured while attempting to load content (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.HttpException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown by nodes such as SceneJS.Renderer and SceneJS.Texture when the browser's WebGL does not support
 * a specified config value.
 */
SceneJS.WebGLUnsupportedNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @private */
SceneJS.PickWithoutRenderedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when a node (such as SceneJs.ScalarInterpolator) expects to find some element of data on the current
 * data scope (SceneJS.Data).
 */
SceneJS.DataExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown by nodes such as SceneJs.Load and SceneJS.LoadCollada when they timeout waiting for their content to load.
 */
SceneJS.LoadTimeoutException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify a general internal SceneJS exception, ie. a SceneJS implementation bug.
 */
SceneJS.InternalException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};



