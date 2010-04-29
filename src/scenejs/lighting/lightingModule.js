/**
 * Backend that manages scene lighting.
 *
 * Holds the sources on a stack and provides the SceneJS.light node with methods to push and pop them.
 *
 * Tracks the view and modelling transform matrices through incoming VIEW_TRANSFORM_UPDATED and
 * MODEL_TRANSFORM_UPDATED events. As each light are pushed, its position and/or direction is multipled by the
 * matrices. The stack will therefore contain sources that are instanced in view space by different modelling
 * transforms, with positions and directions that may be animated,
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * LIGHTS_EXPORTED to pass the entire light stack to the shading backend.
 *
 * Avoids redundant export of the sources with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the lights node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes or pops the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
var SceneJS_lightingModule = new (function() {

    var viewMat;
    var modelMat;
    var lightStack = [];
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                modelMat = viewMat = SceneJS_math_identityMat4();
                lightStack = [];
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.MODEL_TRANSFORM_UPDATED,
            function(params) {
                modelMat = params.matrix;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.LIGHTS_EXPORTED,
                            lightStack);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    function instanceSources(sources) {
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source._type == "point") {
                source._viewPos =  SceneJS_math_transformPoint3(viewMat, SceneJS_math_transformPoint3(modelMat, source._pos));
            } else if (source._type == "dir") {
                source._viewDir = SceneJS_math_transformVector3(viewMat, SceneJS_math_transformVector3(modelMat, source._dir));
            }
        }
    };

    this.pushLightSources = function(sources) {
        instanceSources(sources);
        for (var i = 0; i < sources.length; i++) {
            lightStack.push(sources[i]);
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.LIGHTS_UPDATED,
                lightStack);
    };

    this.popLightSources = function(numSources) {
        for (var i = 0; i < numSources; i++) {
            lightStack.pop();
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.LIGHTS_UPDATED,
                lightStack);
    };
})();

