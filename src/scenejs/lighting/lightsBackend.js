/**
 * Backend that manages scene lighting.
 *
 * Holds the lights on a stack and provides the SceneJS.lights node with methods to push and pop them.
 *
 * Tracks the view and modelling transform matrices through incoming VIEW_TRANSFORM_UPDATED and
 * MODEL_TRANSFORM_UPDATED events. As each light are pushed, its position and/or direction is multipled by the
 * matrices. The stack will therefore contain lights that are instanced in view space by different modelling
 * transforms, with positions and directions that may be animated,
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * LIGHTS_EXPORTED to pass the entire light stack to the shading backend.
 *
 * Avoids redundant export of the lights with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the lights node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes or pops the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "lights",

        function(ctx) {

            var viewMat;
            var modelMat;
            var lightStack = [];
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        modelMat = viewMat = SceneJS._math.identityMat4();
                        lightStack = [];
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MODEL_TRANSFORM_UPDATED,
                    function(params) {
                        modelMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.LIGHTS_EXPORTED,
                                    lightStack);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            function vectorToArray(v, fallback) {
                return v ? [ v.x || 0, v.y || 0, v.z || 0] : fallback;
            }

            function colourToArray(v, fallback) {
                return v ? [ v.r || fallback[0], v.g || fallback[1], v.b || fallback[2]] : fallback;
            }

            /* Transforms light by view and model matrices
             */
            function createLight(light) {
                if (light.type &&
                    (light.type != "spot"
                            && light.type != "dir"
                            && light.type != "point")) {
                    throw SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.lights node has a light of unsupported type - should be 'spot', 'direction' or 'point'");
                }
                return {
                    type: light.type || "point",
                    ambient: colourToArray(light.ambient, [ 0.2, 0.2, 0.2 ]),
                    diffuse: colourToArray(light.diffuse, [ 1.0, 1.0, 1.0 ]),
                    specular: colourToArray(light.specular, [ 1.0, 1.0, 1.0 ]),

                    pos : SceneJS._math.transformPoint3(
                            viewMat,
                            SceneJS._math.transformPoint3(
                                    modelMat,
                                    vectorToArray(light.pos, [ 0,  0,  1.0]))),
                    spotDir: SceneJS._math.transformVector3(
                            viewMat,
                            SceneJS._math.transformVector3(
                                    modelMat,
                                    vectorToArray(light.spotDir, [ 0,  0,  -1.0]))),

                    spotExponent: light.spotExponent || 0.0,
                    spotCosCutOff: light.spotCosCutOff || 20.0,

                    constantAttenuation: light.constantAttenuation || 1.0,
                    linearAttenuation: light.linearAttenuation || 0.0,
                    quadraticAttenuation: light.quadraticAttenuation || 0.0
                };
            }

            /* Node-facing API
             */
            return {

                pushLights : function(lights) {
                    for (var i = 0; i < lights.length; i++) {
                        lightStack.push(createLight(lights[i]));
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                },

                popLights : function(numLights) {
                    for (var i = 0; i < numLights; i++) {
                        lightStack.pop();
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                }
            };
        });

