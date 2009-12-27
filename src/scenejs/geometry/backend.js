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
                ctx.buffers = {};
            };

            this.intersects = function(boundary) {
                return true; // TODO
            };

            var createBuffer = function(context, items, bufType, itemSize, glArray) {
                var handle = {
                    bufferId : context.createBuffer(),
                    itemSize: itemSize,
                    numItems : items.length
                };
                context.bindBuffer(bufType, handle.bufferId);
                context.bufferData(bufType, glArray, context.STATIC_DRAW);
                return handle;
            };

            /** Tests if a buffer for the given geometry type exists on the current canvas
             *
             * @param geoType - IE. "teapot", "cube" etc.
             */
            this.findGeoBuffer = function(geoType) {
                var bufId = ctx.canvas.canvasId + type;
                return (ctx.buffers[bufId]) ? bufId : null;
            };

            /** Creates a buffer containing the given geometry, associated with the activate canvas and returns its ID.
             * When the geoType is given, the buffer ID is the concatenation of the geoID with the canvas ID, otherwise
             * an "anonymous" unique buffer ID is generated.
             */
            this.createGeoBuffer = function(geoType, geo) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                var bufId = ctx.canvas.canvasId + (geoType || nextBufId++);
                var context = ctx.canvas.context;
                ctx.buffers[bufId] = {
                    vertexBuf : createBuffer(context, geo.vertices, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.vertices)),
                    //normalBuf : createBuffer(context, geo.normals, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.normals)),
                    indexBuf :  createBuffer(context, geo.indices, context.ELEMENT_ARRAY_BUFFER, 1, new WebGLUnsignedShortArray(geo.indices))
                };
                return bufId;
            };

            /** Draws the geometry in the given buffer
             */
            this.drawGeoBuffer = function(bufId) {
                var buffer = ctx.buffers[bufId];

                /* Bind vertex and normal buffers to active program
                 */
                ctx.programs.bindVertexBuffer(buffer.vertexBuf.bufferId);
                //  ctx.programs.bindNormalBuffer(buf.normalBuf.bufferId);

                /* Bind index buffer and draw geometry using the active program
                 */
                var context = ctx.canvas.context;
                context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.indexBuf.bufferId);
                context.drawElements(context.TRIANGLES, buffer.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                //   context.flush();
            };

            this.freeGeoBuffer = function(bufId) { // TODO: freeGeoBuffer  - maybe use auto cache eviction?


            };

        })());