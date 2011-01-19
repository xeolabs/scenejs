/**
 * Backend that mediates the setting/getting of the current view and model transform matrices.
 *
 * This module works as a mediator between model/iew transform nodes (such as SceneJS.Rotate, SceneJS.Translate etc)
 * and SceneJS._viewTransformModule and SceneJS._modelTransformModule.
 *
 * When recieving a transform during scene traversal when the projection transform (ie. SceneJS.Camera node) has not
 * been rendered yet, it considers the transform space to be "view" and so it sets/gets transforms on the
 * SceneJS._viewTransformModule.
 *
 * Conversely, when the projection has been rendered, it considers the transform space be "modelling" and it will
 * set/get transforms on the SceneJS._modelTransformModule.
 *
 * This module may also be queried on whether it is operating in view or model transform spaces. When in view space,
 * nodes such as SceneJS.Rotate and SceneJS.Translate will apply their transforms inversely (ie. nagated translation
 * vectors and rotation angles) so as to correctly transform the SceneJS.Camera.
 *
 *  @private
 */
SceneJS._modelViewTransformModule = new (function() {

    var viewSpaceActive = true;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                viewSpaceActive = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(t) {
                viewSpaceActive = t.isDefault;
            });

    this.isBuildingViewTransform = function() {
        return viewSpaceActive;
    };

    this.pushTransform = function(id, t) {
        if (viewSpaceActive) {
            SceneJS._viewTransformModule.pushTransform(id, t);
        } else {
            SceneJS._modelTransformModule.pushTransform(id, t);
        }
    };

    this.getTransform = function() {
        if (viewSpaceActive) {
            return SceneJS._viewTransformModule.getTransform();
        } else {
            return SceneJS._modelTransformModule.getTransform();
        }
    };

    this.popTransform = function(id, t) {
        if (viewSpaceActive) {
            SceneJS._viewTransformModule.popTransform(id, t);
        } else {
            SceneJS._modelTransformModule.popTransform(id, t);
        }
    };

})();
