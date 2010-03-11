/**
 *
 */
SceneJS._backends.installBackend(

        "naming",

        function(ctx) {

            var activeSceneId;
            var map = {};
            var namePath = [];

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        activeSceneId = null;
                        map = {};
                        namePath = [];
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        activeSceneId = params.sceneId;
                        map = {};
                        namePath = [];
                    });

            ctx.lookup = {
            };

            /* Node-facing API
             */
            return {

                pushName : function(name) {
                    map[name] = {};
                    return namePath.push(name);
                },

                popName : function() {
                    return namePath.pop();
                }
            };
        });