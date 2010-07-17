/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 *  @private
 */
SceneJS._timeModule = new (function() {

    var time = (new Date()).getTime();

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                time = (new Date()).getTime();
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.TIME_UPDATED, time);
            });

    this.getTime = function() {
        return time;
    };
})();
