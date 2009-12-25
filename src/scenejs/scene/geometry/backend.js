/** WebGL backend for Geometry node
 *
 */
SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'geometry';
            
            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.bufferGeometry = function(geo) {
                if (!ctx.programs.getActiveProgramName()) {
                    throw 'No shader active';
                }
                if (geo.vertices) {
                    ctx.programs.setVar(context, 'scene_Vertex', geo.vertices);
                }
                if (geo.normals) {
                    ctx.programs.setVar(context, 'scene_Normal', geo.normals);
                }
                if (geo.colors) {
                    // ctx.programs.setVariable(context, 'scene_Color', geo.colors);
                }
                ctx.canvas.context.drawElements(context.TRIANGLES, geo.indices.length, context.UNSIGNED_SHORT, geo.indices);
            };
        })());