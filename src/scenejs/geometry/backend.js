/** WebGL backend for Geometry node
 *
 */
SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'geometry';
            
            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.drawGeometry = function(geo) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                if (geo.vertices) {
                    ctx.programs.setVar(ctx.canvas.context, 'scene_Vertex', geo.vertices);
                }
                if (geo.normals) {
                    ctx.programs.setVar(ctx.canvas.context, 'scene_Normal', geo.normals);
                }
                if (geo.colors) {
                    // ctx.programs.setVariable(context, 'scene_Color', geo.colors);
                }
                ctx.canvas.context.drawElements(context.TRIANGLES, geo.indices.length, context.UNSIGNED_SHORT, geo.indices);
            };
        })());