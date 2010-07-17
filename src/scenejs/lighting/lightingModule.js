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
 * when the stack is pushed or popped by the lights node, or on SCENE_RENDERING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes or pops the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
SceneJS._lightingModule = new (function() {

    var viewMat;
    var modelMat;
    var lightStack = [];
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                modelMat = viewMat = SceneJS._math_identityMat4();
                lightStack = [];
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
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.LIGHTS_EXPORTED,
                            lightStack);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /**
     * @private
     */
    function instanceSources(sources) {
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source._type == "point") {
                source._viewPos =  SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, source._pos));
            } else if (source._type == "dir") {
                source._viewDir = SceneJS._math_transformVector3(viewMat, SceneJS._math_transformVector3(modelMat, source._dir));
            }
        }
    };

    // @private
    this.pushLightSources = function(sources) {
        instanceSources(sources);
        for (var i = 0; i < sources.length; i++) {
            lightStack.push(sources[i]);
        }
        dirty = true;
        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.LIGHTS_UPDATED,
                lightStack);
    };

    // @private
    this.popLightSources = function(numSources) {
        for (var i = 0; i < numSources; i++) {
            lightStack.pop();
        }
        dirty = true;
        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.LIGHTS_UPDATED,
                lightStack);
    };
})();

