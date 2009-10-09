/** WebGL support for Viewport node
 *
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'viewport';

            var ctx;
            var cfg;
            var context;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
                context = cfg.context;
            };

            this.setViewport = function(x, y, width, height) {
                context.viewport(x, y, width, height);
                context.clear(context.COLOR_BUFFER_BIT);
            };

            this.destroyViewport = function() { // TODO: destroy viewport on post-visit?

            };
        })());
