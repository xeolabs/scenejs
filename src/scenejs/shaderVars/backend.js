/**
 * Backend for scene vars node, sets variables on the active shader and retains them.
 *
 */
SceneJS._backends.installBackend(

        "vars",

        function(ctx) {
            var vars = {
                vars : {
                },
                fixed: true
            };

            var loaded = false;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        vars = {
                            vars : {
                            },
                            fixed: true
                        };
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
                    SceneJS._eventTypes.GEOMETRY_RENDERING,
                    function() {
                        if (!loaded) {
                            for (var name in vars) {
                                ctx.events.fireEvent(SceneJS._eventTypes.SHADER_UNIFORM_SET, name, vars[name]);
                            }
                            loaded = true;
                        }
                    });

            return { // Node-facing API

                setVars: function(v) {
                    vars = v;
                    loaded = false;
                },

                getVars: function() {
                    return vars;
                }
            };
        });
