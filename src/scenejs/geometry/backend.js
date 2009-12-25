/*
 * Backend for a geometry node. Manages geometry buffers (VBOs), allowing their creation, loading and activation.
 * More on VBOs: http://www.opengl.org/wiki/Vertex_Buffer_Objects
 */

SceneJs.backends.installBackend(
        new (function() {

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

            /** Buffers the given geometry and returns a handle to it. This is done once for each client geometry node,
             * which memoizes the handle
             */
            this.createGeoBuffer = function(geo) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                var context = ctx.canvas.context;
                return {
                    vertexBuf : createBuffer(context, geo.vertices, context.ARRAY_BUFFER, 4, new WebGLFloatArray(geo.vertices)),
                    normalBuf : createBuffer(context, geo.normals, context.ARRAY_BUFFER, 3, new WebGLFloatArray(geo.normals)),
                    indexBuf :  createBuffer(context, geo.indices, context.ELEMENT_ARRAY_BUFFER, 1, new WebGLUnsignedShortArray(geo.indices))
                };
            };

            /** Draws the geometry in the given buffer
             */
            this.drawGeoBuffer = function(buf) {

                /* Bind vertex and normal buffers to active program
                 */
                ctx.programs.bindVertexBuffer(buf.vertexBuf.bufferId);
                ctx.programs.bindNormalBuffer(buf.normalBuf.bufferId);

                /* Bind index buffer and draw geometry using the active program
                 */
                var context = ctx.canvas.context;
                context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, buf.indexBuf.bufferId);
                context.drawElements(context.TRIANGLES, buf.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                context.flush();                
            };
        })());