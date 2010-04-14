SceneJS._backends.installBackend(

        "monitoring",

        function(ctx) {

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {

                    });
        });
