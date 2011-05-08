/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
SceneJS._errorModule = new (function() {

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                var time = (new Date()).getTime();
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.TIME_UPDATED, time);
            });

    this.fatalError = function(code, message) {
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.ERROR, {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: true
        });
        return message;
    };

    this.error = function(code, message) {
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.ERROR, {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: false
        });
    };
})();
