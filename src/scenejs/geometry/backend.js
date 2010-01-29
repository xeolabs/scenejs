/*
 * Backend for a geometry node. Manages geometry buffers (VBOs), allowing their creation, loading and activation.
 * More on VBOs: http://www.opengl.org/wiki/Vertex_Buffer_Objects
 */

SceneJs.backends.installBackend(
        new (function() {

            var nextBufId = 0;

            this.type = 'geometry';

            var ctx;


            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.geometry = (function() {
                    var buffers = {};

                    /* Currently bound buffer - prevents continuous rebind of same buffer
                     */
                    var currentBoundBufId;

                    /** Program activation unbinds buffer
                     */
                    ctx.programs.onProgramActivate(function() {
                        currentBoundBufId = null;
                    });

                    var createArrayBuffer = function(context, items, bufType, itemSize, glArray) {
                        var handle = {
                            bufferId : context.createBuffer(),
                            itemSize: itemSize,
                            numItems : items.length
                        };
                        context.bindBuffer(bufType, handle.bufferId);
                        context.bufferData(bufType, glArray, context.STATIC_DRAW);
                        return handle;
                    };

                    /** Other backends who want to know when geometry is about to be rendered
                     */
                    var drawObservers = [];

                    var notifyDraw = function() {
                        for (var i = 0; i < drawObservers.length; i++) {
                            drawObservers[i]();
                        }
                    };

                    return {

                        /** Tests if a buffer for the given geometry type exists on the current canvas
                         *
                         * @param geoType - IE. "teapot", "cube" etc.
                         */
                        findGeoBuffer : function(geoType) {
                            var bufId = ctx.renderer.canvas.canvasId + geoType;
                            return (buffers[bufId]) ? bufId : null;
                        },

                        /** Creates a buffer containing the given geometry, associated with the activate canvas and returns its ID.
                         * When the geoType is given, the buffer ID is the concatenation of the geoID with the canvas ID, otherwise
                         * an "anonymous" unique buffer ID is generated.
                         */
                        createGeoBuffer : function(geoType, geo) {
                            if (!ctx.programs.getActiveProgramId()) {
                                throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                            }
                            var bufId = ctx.renderer.canvas.canvasId + (geoType || nextBufId++);
                            var context = ctx.renderer.canvas.context;

                            var vertexBuf;
                            var normalBuf;
                            var indexBuf;
                            var textureBuf;

                            try {
                                vertexBuf = createArrayBuffer(context, geo.vertices, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.vertices));
                                normalBuf = createArrayBuffer(context, geo.normals, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.normals));
                                indexBuf = createArrayBuffer(context, geo.indices, context.ELEMENT_ARRAY_BUFFER, 1, new WebGLUnsignedShortArray(geo.indices));
                                if (geo.texCoords) {
                                    textureBuf = createArrayBuffer(context, geo.texCoords, context.ARRAY_BUFFER, 2, new WebGLFloatArray(geo.texCoords));
                                }

                                buffers[bufId] = {
                                    bufId: bufId,
                                    age: 0,
                                    canvas : ctx.renderer.canvas,
                                    context : context,
                                    vertexBuf : vertexBuf,
                                    normalBuf : normalBuf,
                                    indexBuf : indexBuf,
                                    textureBuf: textureBuf
                                };

                                return bufId;
                            } catch (e) {

                                /* Failure to allocate an array buffer - delete any that were allocated
                                 */
                                if (vertexBuf) {
                                    context.deleteBuffer(vertexBuf.bufferId);
                                }
                                if (normalBuf) {
                                    context.deleteBuffer(normalBuf.bufferId);
                                }
                                if (normalBuf) {
                                    context.deleteBuffer(indexBuf.bufferId);
                                }
                                if (textureBuf) {
                                    context.deleteBuffer(textureBuf.bufferId);
                                }
                                throw e;
                            }
                        },

                        /** Draws the geometry in the given buffer
                         */
                        drawGeoBuffer : function(bufId) {
                            var buffer = buffers[bufId];
                            var context = ctx.renderer.canvas.context;

                            /* If no shader active, then activate the appropriate one depending on whether
                             * a texture is active or not
                             */
                            var tempShader = false;
                            var shaderBackend = null;
//                         

                            /** Tell observers that we're about to draw
                             */
                            notifyDraw();

                            /* Dont rebind buffer if already bound
                             */
                            if (currentBoundBufId != bufId) {

                                /* Bind vertex and normal buffers to active program
                                 */
                                ctx.programs.bindVertexBuffer(buffer.vertexBuf.bufferId);
                                ctx.programs.bindNormalBuffer(buffer.normalBuf.bufferId);

                                /* Textures optional in geometry
                                 */
                                if (buffer.textureBuf) {
                                    ctx.programs.bindTextureCoordBuffer(buffer.textureBuf.bufferId);
                                }

                                /* Bind index buffer and draw geometry using the active program
                                 */
                                context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.indexBuf.bufferId);

                                currentBoundBufId = bufId;
                            }
                            context.drawElements(context.TRIANGLES, buffer.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                            context.flush();

                            /* Deactivate any shader that was temporarily activated
                             */
                            if (tempShader) {
                                shaderBackend.deactivateProgram();
                            }
                        },

                        deleteGeoBuffer : function(buffer) { // TODO: freeGeoBuffer  - maybe use auto cache eviction?

                            // TODO: delete individual buffer

                            if (document.getElementById(buffer.canvas.canvasId)) { // Context won't exist if canvas has disappeared
                                if (buffer.vertexBuf) {
                                    buffer.context.deleteBuffer(buffer.vertexBuf.bufferId);
                                }
                                if (buffer.normalBuf) {
                                    buffer.context.deleteBuffer(buffer.normalBuf.bufferId);
                                }
                                if (buffer.indexBuf) {
                                    buffer.context.deleteBuffer(buffer.indexBuf.bufferId);
                                }
                                if (buffer.textureBuf) {
                                    buffer.context.deleteBuffer(buffer.textureBuf.bufferId);
                                }
                            }
                        },

                        /** Register an observer to notify when a new program is activated
                         */
                        onDraw : function(f) {
                            drawObservers.push(f);
                        },

                        reset : function() {
                            for (var bufId in buffers) {
                                deleteGeoBuffer(buffers[bufId]);
                            }
                            buffers = {};
                            currentBoundBufId = null;
                        }
                    };
                })();

            };

            this.intersects = function(boundary) {
                return true; // TODO
            };

            /* Geometry node needs to know to obtain new VBOs if the super canvas node
             * has dynamically switched to some other canvas.
             */
            this.getActiveCanvasId = function() {
                return ctx.renderer.canvas.canvasId;
            };

            this.findGeoBuffer = function(geoType) {
                return ctx.geometry.findGeoBuffer(geoType);
            };

            this.createGeoBuffer = function(geoType, geo) {
                return ctx.geometry.createGeoBuffer(geoType, geo);
            };

            this.drawGeoBuffer = function(bufId) {
                return ctx.geometry.drawGeoBuffer(bufId);
            };

            var deleteGeoBuffer = function(buffer) { // TODO: freeGeoBuffer  - maybe use auto cache eviction?
                return ctx.geometry.deleteGeoBuffer(buffer);
            };

            /** Frees resources (geometry buffers) held by this backend
             */
            this.reset = function() {
                return ctx.geometry.reset();
            };

        })());