/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @class SceneJS_error
 * @private
 */
var SceneJS_error = new (function() {

    var activeSceneId;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING, // Set default logging for scene root
            function(params) {
                activeSceneId = params.engine.id;
            });

    SceneJS_events.addListener(
            SceneJS_events.RESET,
            function() {
                activeSceneId = null;
            },
            100000);  // Really low priority - must be reset last

    this.fatalError = function(code, message) {
        if (typeof code == "string") {
            message = code;
            code = SceneJS.errors.ERROR;
        }
        var error = {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: true
        };
        if (activeSceneId) {
            error.sceneId = activeSceneId;
        }
        SceneJS_events.fireEvent(SceneJS_events.ERROR, error);
        return message;
    };

    this.error = function(code, message) {
        var error = {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: false
        };
        if (activeSceneId) {
            error.sceneId = activeSceneId;
        }
        SceneJS_events.fireEvent(SceneJS_events.ERROR, error);
    };
})();

(function() {
    SceneJS.errors = {};

    var n = 0;
    SceneJS.errors.ERROR = n++;
    SceneJS.errors.WEBGL_NOT_SUPPORTED = n++;
    SceneJS.errors.WEBGL_CONTEXT_LOST = n++;
    SceneJS.errors.NODE_CONFIG_EXPECTED = n++;
    SceneJS.errors.ILLEGAL_NODE_CONFIG = n++;
    SceneJS.errors.SHADER_COMPILATION_FAILURE = n++;
    SceneJS.errors.SHADER_LINK_FAILURE = n++;
    SceneJS.errors.CANVAS_NOT_FOUND = n++;
    SceneJS.errors.OUT_OF_VRAM = n++;
    SceneJS.errors.WEBGL_UNSUPPORTED_NODE_CONFIG = n++;
    SceneJS.errors.NODE_NOT_FOUND = n++;
    SceneJS.errors.NODE_ILLEGAL_STATE = n++;
    SceneJS.errors.ID_CLASH = n++;
    SceneJS.errors.PLUGIN_INVALID = n++;
})();

SceneJS.errors._getErrorName = function(code) {
    for (var key in SceneJS.errors) {
        if (SceneJS.errors.hasOwnProperty(key) && SceneJS.errors[key] == code) {
            return key;
        }
    }
    return null;
};

