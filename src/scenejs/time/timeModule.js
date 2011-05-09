/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 *  @private
 */
var SceneJS_timeModule = new (function() {

    var time = (new Date()).getTime();

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    this.getTime = function() {
        return time;
    };
})();
