/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
var SceneJS_errorModule = new (function() {

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                var time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    this.fatalError = function(code, message) {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: true
        });
        return message;
    };

    this.error = function(code, message) {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            errorName: SceneJS.errors._getErrorName(code) || "ERROR",
            code: code,
            exception: message,
            fatal: false
        });
    };
})();
