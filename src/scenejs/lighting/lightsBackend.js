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
                        modelMat = viewMat = SceneJS_math_identityMat4();
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

            function pointToArray(p, fallback) {
                return p ? [ p.x || 0, p.y || 0, p.z || 0, p.w || 1] : fallback;
            }

            function colourToArray(v, fallback) {
                return v ? [
                    v.r == undefined ? fallback[0] : v.r,
                    v.g == undefined ? fallback[1] : v.g,
                    v.b == undefined ? fallback[2] : v.b] : fallback;
            }

            /* Creates a view-space light
             */
            function createLight(light) {
                if (light.type) {
                    if (light.type != "dir"
                            && light.type != "point") {
                        throw new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.light node has a light of unsupported type - should be 'dir' or 'point'");
                    }
                } else {
                    light.type = light.type || "point";
                }

                if (light.type == "point") {
                    return {
                        type: light.type,
                        color: colourToArray(light.color, [ 1.0, 1.0, 1.0 ]),
                        diffuse : light.diffuse,
                        specular : light.specular,
                        pos : SceneJS_math_transformPoint3(
                                viewMat,
                                SceneJS_math_transformPoint3(
                                        modelMat,
                                        pointToArray(light.pos, [ 0,  0, 1.0, 1.0]))),
                        constantAttenuation: light.constantAttenuation == undefined ? 1.0 : light.constantAttenuation,
                        linearAttenuation: light.linearAttenuation == undefined ? 0.0 : light.linearAttenuation,
                        quadraticAttenuation: light.quadraticAttenuation == undefined ? 0.0 : light.quadraticAttenuation
                    };
                }

                if (light.type == "dir") {
                    return {
                        type: light.type,
                        color: colourToArray(light.color, [ 1.0, 1.0, 1.0 ]),
                        diffuse : light.diffuse,
                        specular : light.specular,
                        dir : SceneJS_math_transformVector3(
                                viewMat,
                                SceneJS_math_transformVector3(
                                        modelMat,
                                        vectorToArray(light.dir, [ 0,  0,  1.0])))
                    };
                }

//                if (light.type == "spot") {
//                    return {
//                        type: light.type,
//                        color: colourToArray(light.color, [ 1.0, 1.0, 1.0 ]),
//                        diffuse : light.diffuse,
//                        specular : light.specular,
//                        pos : SceneJS_math_transformPoint3(
//                                viewMat,
//                                SceneJS_math_transformPoint3(
//                                        modelMat,
//                                        pointToArray(light.pos, [ 0,  0,  1.0, 1.0]))),
//
//                        dir : SceneJS_math_transformVector3(
//                                viewMat,
//                                SceneJS_math_transformVector3(
//                                        modelMat,
//                                        vectorToArray(light.dir, [ 0,  0,  1.0]))),
//                        spotExponent: light.spotExponent == undefined ? 1.0 : light.spotExponent,
//                        spotCosCutOff: light.spotCosCutOff == undefined ? 20.0 : light.spotCosCutOff,
//                        constantAttenuation: light.constantAttenuation == undefined ? 1.0 : light.constantAttenuation,
//                        linearAttenuation: light.linearAttenuation == undefined ? 0.0 : light.linearAttenuation,
//                        quadraticAttenuation: light.quadraticAttenuation == undefined ? 0.0 : light.quadraticAttenuation
//                    };
//                }
            }

            /* Node-facing API
             */
            return {

                pushLights : function(sources) {
                    for (var i = 0; i < sources.length; i++) {
                        lightStack.push(createLight(sources[i]));
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                },

                popLights : function(numSources) {
                    for (var i = 0; i < numSources; i++) {
                        lightStack.pop();
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                }
            };
        });

