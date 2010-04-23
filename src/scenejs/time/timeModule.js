/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 */
var SceneJS_timeModule = new (function() {

    var time = (new Date()).getTime();

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    this.getTime = function() {
        return time;
    };
})();
