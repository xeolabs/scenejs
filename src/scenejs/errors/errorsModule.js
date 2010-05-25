/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
var SceneJS_errorModule = new (function() {

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                var time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    // @private
    this.fatalError = function(e) {
        e = e.message ? e : new SceneJS.Exception(e);

        /* Dont log because exception should be thrown        
         */
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            exception: e,
            fatal: true
        });
        return e.message;
    };

    // @private
    this.error = function(e) {
        e = e.message ? e : new SceneJS.Exception(e);
        SceneJS_loggingModule.error(e.message);
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            exception: e,
            fatal: false
        });
        return e.message;
    };
})();
