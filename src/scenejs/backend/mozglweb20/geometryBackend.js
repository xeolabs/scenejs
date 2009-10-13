/** WebGL backend for Geometry node
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

            this.drawGeometry = function(geo) {
                if (ctx.programs && ctx.programs.getActiveProgramName()) {
                    if (geo.vertices) {
                        ctx.programs.setVariable(context, 'scene_Vertex', geo.vertices);
                    }
                    if (geo.normals) {
                        ctx.programs.setVariable(context, 'scene_Normal', geo.normals);
                    }
                    if (geo.colors) {
                        // ctx.programs.setVariable(context, 'scene_Color', geo.colors);
                    }
                    context.drawElements(context.TRIANGLES, geo.indices.length, context.UNSIGNED_SHORT, geo.indices);
                } else {
                    // No program active.
                    // TODO: load geometry via GL fixed function pipeline
                }
            };
        })());