/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
var SceneJS_errorModule = new (function() {   

    this.fatalError = function(code, message) {
        if (typeof code == "string") {
            message = code;
            code = SceneJS.errors.ERROR;
        }
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
