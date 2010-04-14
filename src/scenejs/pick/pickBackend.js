/* Backend that manages picking
 *
 * Services the SceneJS.scene node, providing it with methods to enter picking mode and collect names of
 * subgraph that was picked.
 *
 */
SceneJS._backends.installBackend(

        "pick",

        function(ctx) {
            var pickX;
            var pickY;
            var canvas;
            var pickBuffers;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        pickBuffers = {};
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
//                        if (!pickBuffers[canvas.id]) {
//                            createPickBuffer();
//                        }
                    });

            function createPickBuffer() {
                var context = canvas.context;

                /* Create pick buffer
                 */
                var pickBuffer = {
                    frameBuffer : context.createFramebuffer(),
                    renderBuffer : context.createRenderbuffer(),
                    texture : context.createTexture()
                };
                context.bindTexture(context.TEXTURE_2D, pickBuffer.texture);
                try {
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, null);
                } catch (e) {
                    var texture = new WebcontextUnsignedByteArray(3);
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, texture);
                }
                context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
                context.bindRenderbuffer(context.RENDERBUFFER, pickBuffer.renderBuffer);
                context.renderbufferStorage(context.RENDERBUFFER, context.COLOR_COMPONENT, 1, 1);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.framebufferTexture2D(
                        context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, pickBuffer.texture, 0);
                context.framebufferRenderbuffer(
                        context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, pickBuffer.renderBuffer);
                context.bindFramebuffer(context.FRAMEBUFFER, null);

                pickBuffers[canvas.id] = pickBuffer;
            }

            function activatePicking() {
                var context = canvas.context;
                var pickBuffer = pickBuffers[canvas.id];
                context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
                context.viewport(0, 0, 800, 600);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.disable(context.BLEND);
                SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_PICKING;
            }

            function deactivatePicking() {
                canvas.context.bindFramebuffer(context.FRAMEBUFFER, null);
                SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
            }

            /* Node-facing API
             */
            return {

                /** Begin picking at given coordinates, switch to picking mode
                 */
                pick: function(x, y) {
                    if (!canvas) {
                        ctx.error.fatalError("No canvas active");
                    }
                    activatePicking();
                    pickX = x;
                    pickY = y;
                },

                /** Get name path to whatever was picked, unbind pick buffers, switch back to rendering mode
                 */
                getPicked: function() {
                    if (!pickBuffer) {
                        //         throw "No pick buffer created";
                    }
                    var context = canvas.context;

                    /* Read colour of picked pixel
                     */
                    var data = context.readPixels(pickX, pickY, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
                    if (data.data) {
                        data = data.data; // TODO: hack for firefox
                    }

                    ctx.logging.info(pickX + ", " + pickY + ": " + data[0] + ", " + data[1] + "," + data[2]);

                    var id = data[0] + data[1] * 256;
                    //     alert(id);

                    deactivatePicking();


                    return id;
                }
            };
        });
