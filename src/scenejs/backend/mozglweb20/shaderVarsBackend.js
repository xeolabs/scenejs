/** WebGL support for the ShaderVars node
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'shader-vars';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
            };

            this.setVariable = function(name, value) {
                ctx.programs.setVariable(cfg.context, name, value);
            };
        })());