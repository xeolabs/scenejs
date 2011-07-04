/**
 * Backend that manages scene lighting.
 *
 * Holds the sources on a stack and provides the SceneJS.light node with methods to push them.
 *
 * Tracks the view and modelling transform matrices through incoming VIEW_TRANSFORM_UPDATED and
 * MODEL_TRANSFORM_UPDATED events. As each light is pushed, its position and/or direction is multipled by the
 * matrices. The stack will therefore contain sources that are instanced in view space by different modelling
 * transforms, with positions and directions that may be animated,
 *
 * Interacts with the shading backend through events; on a SCENE_RENDERING event it will respond with a
 * LIGHTS_EXPORTED to pass the entire light stack to the shading backend.
 *
 * Avoids redundant export of the sources with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the lights node, or on SCENE_COMPILING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_lightingModule = new (function() {
    var idStack = new Array(255);
    var lightStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_renderModule.setLights(idStack[stackLen - 1], lightStack.slice(0, stackLen));
                    dirty = false;
                }
            });

    this.pushLight = function(id, light) {  // TODO: what to do with ID?
        var modelMat = SceneJS_modelTransformModule.getTransform().matrix;
        if (light.mode == "point") {
            light.worldPos = SceneJS_math_transformPoint3(modelMat, light.pos);
        } else if (light.mode == "dir") {
            light.worldDir = SceneJS_math_transformVector3(modelMat, light.dir);
        }
        idStack[stackLen] = id;
        lightStack[stackLen] = light;
        stackLen++;
        dirty = true;
    };
})();

