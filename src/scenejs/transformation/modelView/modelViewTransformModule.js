/**
 *
 *
 *  @private
 */
var SceneJS_modelViewTransformModule = new (function() {

    var viewSpaceActive = true;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                viewSpaceActive = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(t) {
                viewSpaceActive = t.isDefault;
            });

    this.setTransform = function(t) {
        if (viewSpaceActive) {
            SceneJS_viewTransformModule.setTransform(t);
        } else {
            SceneJS_modelTransformModule.setTransform(t);
        }
    };

    this.getTransform = function() {
        if (viewSpaceActive) {
            return SceneJS_viewTransformModule.getTransform();
        } else {
            return SceneJS_modelTransformModule.getTransform();
        }
    };
})();
