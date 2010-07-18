/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
SceneJS._errorModule = new (function() {

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                var time = (new Date()).getTime();
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.TIME_UPDATED, time);
            });

    // @private
    this.fatalError = function(e) {
        e = e.message ? e : new SceneJS.errors.Exception(e);

        /* Dont log because exception should be thrown        
         */
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.ERROR, {
            exception: e,
            fatal: true
        });
        return e.message;
    };

    // @private
    this.error = function(e) {
        e = e.message ? e : new SceneJS.errors.Exception(e);
        SceneJS._loggingModule.error(e.message);
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.ERROR, {
            exception: e,
            fatal: false
        });
        return e.message;
    };
})();
