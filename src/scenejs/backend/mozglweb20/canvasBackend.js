/**
 * WebGL backend for Canvas node
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'canvas';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
                cfg.context.clearDepth(1.0);
            };

            this.setDepthTest = function(enable) {
                if (enable) {
                    cfg.context.enable(cfg.context.DEPTH_TEST);
                } else {
                    cfg.context.disable(cfg.context.DEPTH_TEST);
                }
            };

            this.setClearColor = function(c) {
                cfg.context.clearColor(c.r, c.g, c.b, c.a);
            };

            this.setClearDepth = function(depth) {
                cfg.context.clearDepth(depth);
            };

            this.flush = function() {
                cfg.context.flush();
            };

            this.swapBuffers = function() {
                cfg.context.swapBuffers();
            };
        })());
