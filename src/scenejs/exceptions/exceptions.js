SceneJs.exceptions.WebGLNotSupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.NodeBackendInstallFailedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.NodeConfigExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.ShaderLinkFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.ShaderVariableNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.NoCanvasActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.NoShaderActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.CanvasNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.CanvasAlreadyActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.InvalidLookAtConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.InvalidGeometryConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.UnsupportedOperationException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.IllegalRotateConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.InvalidNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJs.exceptions.NodeBackendNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};


SceneJs.exceptions.AssetLoadFailureException = function(msg, uri, proxy) {      // TODO: handle more cases for asset failure?
    this.message = msg + " (uri=\"" + (uri || "null") + "\", proxy=\"" + (proxy || "null") + "\")";
};



