/** WebGL Support for Geometry node
 *
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'geometry';

            var ctx;
            var cfg;
            var context;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
                context = _cfg.context;
            };

            this.drawGeometry = function(g) {
                if (ctx.programs && ctx.programs.getActiveProgramName()) {
                    if (g.vertices) {
                        ctx.programs.setVariable(context, 'scene_Vertex', g.vertices);
                    }
                    if (g.normals) {
                        ctx.programs.setVariable(context, 'scene_Normal', g.normals);
                    }
                    if (g.colors) {
                        // ctx.programs.setVariable(context, 'scene_Color', g.colors);
                    }
                    context.drawElements(context.TRIANGLES, g.indices.length, context.UNSIGNED_SHORT, g.indices);
                } else {
                    // No program active.
                    // TODO: load geometry via GL fixed function pipeline
                }
            };
        })());