/**
 * WebGL support for Layer node
 *
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'layer';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
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
