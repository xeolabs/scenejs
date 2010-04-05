/**
 * Backend that handles picking.
 *
 *
 */
SceneJS._backends.installBackend(

        "pick",

        function(ctx) {
            var pickX;
            var pickY;
            var projXForm;
            var viewXForm;
            var canvas;
            var pickBuffer;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        projXForm = null;
                        viewXForm = null;
                        pickBuffer = null;
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(xf) {
                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                            projXForm = xf;
                            if (canvas && viewXForm) {
                                activatePickBuffer();
                            }
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(xf) {
                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                            viewXForm = xf;
                            if (canvas && projXForm) {
                                activatePickBuffer();
                            }
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_EXPORTED,
                    function(xf) {
                        //                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                        //                            projXForm = xf;
                        //                            if (canvas && viewXForm) {
                        //                                activatePickBuffer();
                        //                            }
                        //                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_EXPORTED,
                    function(xf) {
                        //                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                        //                            viewXForm = xf;
                        //                            if (canvas && projXForm) {
                        //                                activatePickBuffer();
                        //                            }
                        //                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.NAME_UPDATED,
                    function(params) {
                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                        }
                    });

            function activatePickBuffer() {
                var context = canvas.context;

                /* Create pick buffer
                 */
                pickBuffer = {
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
                context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT, 1, 1);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.framebufferTexture2D(
                        context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, pickBuffer.texture, 0);
                context.framebufferRenderbuffer(
                        context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, pickBuffer.renderBuffer);
                context.bindFramebuffer(context.FRAMEBUFFER, null);

                /* Activate pick buffer
                 */
                context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
                context.viewport(0, 0, 1, 1);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.disable(context.BLEND);


                /* Do pick
                 */
                //get camera space coords
                //                var origmatrix = this.camera.matrix;
                //                var origpmatrix = this.camera.pMatrix;
                //                var xcoord = -( ( ( 2 * x ) / canvas.width ) - 1 ) / this.camera.pMatrix.e(1, 1);
                //                var ycoord = ( ( ( 2 * y ) / canvas.height ) - 1 ) / this.camera.pMatrix.e(2, 2);
                //                var zcoord = 1;
                //                if (this.camera.type == GLGE.C_PERSPECTIVE) {
                //                    var coord = [xcoord,ycoord,zcoord,0];
                //                    coord = this.camera.matrix.inverse().x(coord);
                //                    var cameraPos = this.camera.getPosition();
                //                    var zvec = coord.toUnitVector();
                //                    var xvec = (new GLGE.Vec([0,0,1])).cross(zvec).toUnitVector();
                //                    var yvec = zvec.cross(xvec).toUnitVector();
                //                    this.camera.matrix = new GLGE.Mat([xvec.e(1), yvec.e(1), zvec.e(1), cameraPos.x,
                //                        xvec.e(2), yvec.e(2), zvec.e(2), cameraPos.y,
                //                        xvec.e(3), yvec.e(3), zvec.e(3), cameraPos.z,
                //                        0, 0, 0, 1]).inverse();
                //                }
                //                if (this.camera.type == GLGE.C_ORTHO) {
                //                    this.camera.matrix = this.camera.matrix.inv().x(GLGE.translateMatrix(-xcoord, -ycoord, 0)).inv();
                //                }
                //                this.camera.pMatrix = GLGE.makeOrtho(-0.0001, 0.0001, -0.0001, 0.0001, this.camera.near, this.camera.far);


                /* Re-export projection matrix for picking
                 */
//                ctx.events.fireEvent(SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED, {
//                    matrix: projXForm.matrix,
//                    fixed: false
//                });

                /* Re-export view matrix for picking
                 */
//                ctx.events.fireEvent(SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED, {
//                    matrix: viewXForm.matrix,
//                    lookAt : viewXForm.lookAt,
//                    fixed: false
//                });

                /* Bind pick buffer and set GL modes
                 */
                //                context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
                //                context.viewport(0, 0, 1, 1);
                //                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                //                context.disable(context.BLEND);

                /* Return to SceneJS.scene node, which now renders subgraph in picking mode
                 */
            }


            //                for (var i = 0; i < this.objects.length; i++) {
            //                    this.objects[i].GLRender(this.renderer.gl, GLGE.RENDER_PICK);
            //                }
            //                var data = gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE);
            //                //TODO: firefox hack :-( remove when fixed!
            //                if (data.data) data = data.data;
            //                var index = data[0] + data[1] * 256;
            //                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            //                gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
            //
            //                //revert the view matrix
            //                this.camera.matrix = origmatrix;
            //                this.camera.pMatrix = origpmatrix;
            //
            //                if (index > 0) {
            //                    return this.objects[index - 1];
            //                } else {
            //                    return false;
            //                }
            //
            //            }


            /* Node-facing API
             */
            return {
                pick: function(x, y) {
                    pickX = x;
                    pickY = y;
                    SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_PICKING;

                },

                getPicked: function() {
                    SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    //                    if (!pickBuffer) {
                    //                        throw "Pick failed - no buffer created"
                    //                    }
                    return [];
                    //                var data = context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
                    //                if (data.data) {
                    //                    data = data.data; // TODO: hack for firefox
                    //                }
                    //                var id = data[0] + data[1] * 256;
                    //                context.bindFramebuffer(context.FRAMEBUFFER, null);
                    //                return id;
                }
            };
        });
