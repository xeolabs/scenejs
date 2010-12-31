/**
 * Augments SceneJS.Node with methods to support query of transform-related
 * information at render-time using the likes of:
 *
 * SceneJS.withNode("xyz").query("xyz");
 *
 * For architectural tidyness, we define these methods in this separate file,
 * ie. NOT within the file that defines SceneJS.Node and NOT within files
 * that define modules. The idea is to avoid making either of those files
 * dependant on one another - it's just nicer to isolate these dependencies
 * in a seperate file like this.
 *
 * Created: Lindsay Kay 26/2010
 */

SceneJS.Node.prototype.queryViewMatrix = function() {
    return SceneJS._viewTransformModule.getTransform().matrix.split(0);
};

SceneJS.Node.prototype.queryModelMatrix = function() {
    return SceneJS._modelTransformModule.getTransform().matrix.split(0);
};

SceneJS.Node.prototype.queryCameraMatrix = function() {
    return SceneJS._projectionModule.getTransform().matrix.split(0);
};

SceneJS.Node.prototype.queryModelPos = function() {
    return SceneJS._math_transformPoint3(SceneJS._modelTransformModule.getTransform().matrix, [0,0,0]);
};

SceneJS.Node.prototype.queryViewPos = function() {
    return SceneJS._math_transformPoint3(
            SceneJS._viewTransformModule.getTransform().matrix,
            SceneJS._math_transformPoint3(
                    SceneJS._modelTransformModule.getTransform().matrix, [0,0,0]));
};

SceneJS.Node.prototype.queryCameraPos = function() {
    return SceneJS._math_transformPoint3(
            SceneJS._projectionModule.getTransform().matrix,

            SceneJS._math_transformPoint3(
                    SceneJS._viewTransformModule.getTransform().matrix,

                    SceneJS._math_transformPoint3(
                            SceneJS._modelTransformModule.getTransform().matrix, [0,0,0])));
};

