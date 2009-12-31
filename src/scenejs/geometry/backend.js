/*
 * Backend for a geometry node. Manages geometry buffers (VBOs), allowing their creation, loading and activation.
 * More on VBOs: http://www.opengl.org/wiki/Vertex_Buffer_Objects
 */

SceneJs.backends.installBackend(
        new (function() {

            var nextBufId = 0;

            this.type = 'geometry';

            var ctx;
            var buffers = {};

            this.install = function(_ctx) {
                ctx = _ctx;
                buffers = {};
            };

            this.intersects = function(boundary) {
                return true; // TODO
            };

            /** Tests if a buffer for the given geometry type exists on the current canvas
             *
             * @param geoType - IE. "teapot", "cube" etc.
             */
            this.findGeoBuffer = function(geoType) {
                var bufId = ctx.canvas.canvasId + type;
                return (buffers[bufId]) ? bufId : null;
            };

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

                var vertexBuf;
                var normalBuf;
                var indexBuf;

                try {
                    vertexBuf = createArrayBuffer(context, geo.vertices, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.vertices));
                    normalBuf = createArrayBuffer(context, geo.normals, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.normals));
                    indexBuf = createArrayBuffer(context, geo.indices, context.ELEMENT_ARRAY_BUFFER, 1, new WebGLUnsignedShortArray(geo.indices));

                    buffers[bufId] = { // TODO: catch out-of-memory exception
                        canvas : ctx.canvas,
                        context : context,
                        vertexBuf : vertexBuf,
                        normalBuf : normalBuf,
                        indexBuf : indexBuf
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
                    throw e;
                }
            };

            /** Draws the geometry in the given buffer
             */
            this.drawGeoBuffer = function(bufId) {
                var buffer = buffers[bufId];

                /* Bind vertex and normal buffers to active program
                 */
                ctx.programs.bindVertexBuffer(buffer.vertexBuf.bufferId);
                ctx.programs.bindNormalBuffer(buffer.normalBuf.bufferId);

                /* Bind index buffer and draw geometry using the active program
                 */
                var context = ctx.canvas.context;

                context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buffer.indexBuf.bufferId);
                context.drawElements(context.TRIANGLES, buffer.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                context.flush();
            };

            /** Deletes a geometry buffer
             */
            var deleteGeoBuffer = function(buffer) { // TODO: freeGeoBuffer  - maybe use auto cache eviction?
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
                }
            };

            /** Frees resources (geometry buffers) held by this backend
             */
            this.reset = function() {
                for (var bufId in buffers) {
                    deleteGeoBuffer(buffers[bufId]);
                }
                buffers = {};
            };

        })());