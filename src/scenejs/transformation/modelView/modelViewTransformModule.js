/**
 * Backend that mediates the setting/getting of the current view and model transform matrices.
 *
 * This module works as a mediator between model/iew transform nodes (such as SceneJS.Rotate, SceneJS.Translate etc)
 * and SceneJS_viewTransformModule and SceneJS_modelTransformModule.
 *
 * When recieving a transform during scene traversal when the projection transform (ie. SceneJS.Camera node) has not
 * been rendered yet, it considers the transform space to be "view" and so it sets/gets transforms on the
 * SceneJS_viewTransformModule.
 *
 * Conversely, when the projection has been rendered, it considers the transform space be "modelling" and it will
 * set/get transforms on the SceneJS_modelTransformModule.
 *
 * This module may also be queried on whether it is operating in view or model transform spaces. When in view space,
 * nodes such as SceneJS.Rotate and SceneJS.Translate will apply their transforms inversely (ie. nagated translation
 * vectors and rotation angles) so as to correctly transform the SceneJS.Camera.
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

    this.isBuildingViewTransform = function() {
        return viewSpaceActive;
    };

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
