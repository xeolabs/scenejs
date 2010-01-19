SceneJs.exceptions.NodeConfigExpectedException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.ShaderLinkFailureException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.ShaderVariableNotFoundException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.NoCanvasActiveException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.NoShaderActiveException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.CanvasNotSupportedException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.CanvasNotFoundException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.InvalidLookAtConfigException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.InvalidGeometryConfigException = function(msg) {
    this.message = msg;
};

/** Thrown on attempt to do something that's not yet supported in SceneJS
 */
SceneJs.exceptions.UnsupportedOperationException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.IllegalRotateConfigException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.InvalidNodeConfigException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.NodeBackendNotFoundException = function(msg) {
    this.message = msg;
};

SceneJs.exceptions.AssetLoadFailureException = function(msg, uri, proxy) {      // TODO: handle more cases for asset failure?
    this.message = msg + " (uri=\"" + (uri || "null") + "\", proxy=\"" + (proxy || "null") + "\")";
};

SceneJs.exceptions.NoViewportActiveException = function(msg) {
    this.message = msg;
};

