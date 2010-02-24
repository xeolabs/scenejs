/**
 * Backend module for a lights node, provides ability to set lights on the current shader. The lights are held in a
 * stack, which is pushed to and popped from by the node. Each time after it is pushed or popped, the stack is loaded
 * into the shader. Note that the current shader may have a limit on how many lights it will recognise, in which case
 * only that many lights from the top of the stack downwards will be effectively active within the shader.
 */
SceneJS._backends.installBackend(

        "lights",

        function(ctx) {

            var lights = [];        // Lights stack
            var loaded = false;     // True when certain that lights are loaded in active shader

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        lights = [];
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING, // Geometry about to render - need to load lights
                    function() {
                        if (!loaded) {
                            if (lights.length > 0) {
                                ctx.events.fireEvent(SceneJS._eventTypes.SHADER_UNIFORM_SET, [SceneJS._webgl.shaderVarNames.LIGHT_POS, lights[0].pos]);
                            }
                            // for (var i = 0; i < lights.length; i++) {
                            //      ctx.events.fireEvent(SceneJS._eventTypes.PROGRAM_UNIFORM_LOAD, ["LightPos" + i, lights[i]]);
                            // }
                            loaded = true;
                        }
                    });

            return { // Node-facing API

                /** Push lights onto active lights stack
                 */
                pushLights : function(l) {
                    ctx.logging.debug("Pushing lights: " + l.length);
                    for (var i = 0; i < l.length; i++) {
                        lights.push(l[i]);
                    }
                    loaded = false;
                },

                /** Pop given number of lights off active lights stack
                 */
                popLights : function(numLights) {
                    ctx.logging.debug("Popping lights: " + lights.length);
                    for (var i = 0; i < numLights; i++) {
                        lights.pop();
                    }
                    loaded = false;
                }
            };
        });

