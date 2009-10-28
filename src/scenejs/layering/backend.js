/**
 * WebGL support for Layer node
 *
 */
SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'layer';
            
            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.setCullFace = function(enable) {
                if (enable) {
                    cfg.canvas.context.enable(cfg.context.CULL_FACE);
                } else {
                    cfg.canvas.context.disable(cfg.context.CULL_FACE);
                }
            };

            this.flush = function() {
                cfg.context.flush();
            };
        })());
