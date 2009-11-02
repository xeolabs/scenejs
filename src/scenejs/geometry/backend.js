/**
 * Backend for a geometry node. Provides the means to insert gemetry into the currently active shader.
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
                    ctx.programs.setVar('scene_Vertex', geo.vertices);
                }
                if (geo.normals) {
                    ctx.programs.setVar('scene_Normal', geo.normals);
                }
                if (geo.colors) {
                    // ctx.programs.setVariable(context, 'scene_Color', geo.colors);
                }
                var context = ctx.canvas.context;
                context.drawElements(context.TRIANGLES, geo.indices.length, context.UNSIGNED_SHORT, geo.indices);
            };
        })());