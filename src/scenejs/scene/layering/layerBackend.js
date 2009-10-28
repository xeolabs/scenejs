/**
 * WebGL support for Layer node
 *
 */
SceneJs.private.backend.installBackend(
        new (function() {

            this.type = 'layer';
            
            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.setCullFace = function(enable) {
                if (enable) {
                    cfg.context.enable(cfg.context.CULL_FACE);
                } else {
                    cfg.context.disable(cfg.context.CULL_FACE);
                }
            };

            this.flush = function() {
                cfg.context.flush();
            };
        })());
