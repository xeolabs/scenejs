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
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
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
SceneJS._lightingModule = new (function() {
    var viewMat;
    var modelMat;

    var idStack = new Array(255);
    var lightStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                modelMat = viewMat = SceneJS._math_identityMat4();
                stackLen = 0;
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MODEL_TRANSFORM_UPDATED,
            function(params) {
                modelMat = params.matrix;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._renderModule.setLights(idStack[stackLen - 1], lightStack.slice(0, stackLen));
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushLight = function(id, light) {  // TODO: what to do with ID?
        instanceLight(light);
        idStack[stackLen] = id;
        lightStack[stackLen] = light;
        stackLen++;
        dirty = true;
    };

    function instanceLight(light) {
        if (light.mode == "point") {
            light.viewPos = SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, light.pos));
        } else if (light.mode == "dir") {
            light.viewDir = SceneJS._math_transformVector3(viewMat, SceneJS._math_transformVector3(modelMat, light.dir));
        }
    }
})();

