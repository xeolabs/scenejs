SceneJS.errors = {};

SceneJS.errors.ERROR = 0;
SceneJS.errors.WEBGL_NOT_SUPPORTED = 1;
SceneJS.errors.NODE_CONFIG_EXPECTED = 2;
SceneJS.errors.ILLEGAL_NODE_CONFIG = 3;
SceneJS.errors.SHADER_COMPILATION_FAILURE = 4;
SceneJS.errors.SHADER_LINK_FAILURE = 5;
SceneJS.errors.CANVAS_NOT_FOUND = 6;
SceneJS.errors.OUT_OF_VRAM = 7;
SceneJS.errors.WEBGL_UNSUPPORTED_NODE_CONFIG = 8;
SceneJS.errors.INSTANCE_TARGET_NOT_FOUND = 9;
SceneJS.errors.INSTANCE_CYCLE = 10;
SceneJS.errors.NODE_NOT_FOUND = 11;
SceneJS.errors.NODE_ILLEGAL_STATE = 12;
SceneJS.errors.ID_CLASH = 13;
SceneJS.errors.ILLEGAL_MESSAGE = 14;
SceneJS.errors.SCENE_ILLEGAL_UPDATE = 15;


SceneJS.errors._getErrorName = function(code) {
    for (var key in SceneJS.errors) {
        if (SceneJS.errors.hasOwnProperty(key) && SceneJS.errors[key] == code) {
            return key;
        }
    }
    return null;
}


