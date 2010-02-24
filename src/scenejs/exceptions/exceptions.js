SceneJS.exceptions.WebGLNotSupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeBackendInstallFailedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeConfigExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ShaderLinkFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ShaderVariableNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoSceneActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoCanvasActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoShaderActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.CanvasNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.CanvasAlreadyActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidLookAtConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidGeometryConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.UnsupportedOperationException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.IllegalRotateConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeBackendNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.AssetLoadFailureException = function(msg, uri, proxy) {      // TODO: handle more cases for asset failure?
    this.message = msg + " (uri=\"" + (uri || "null") + "\", proxy=\"" + (proxy || "null") + "\")";
};

SceneJS.exceptions.AssetTypeUnsupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.OutOfMemoryException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};



