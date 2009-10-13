/**
 * WebGL backend for SceneJs.Vars node 
 *
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'vars';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
            };

            this.pushVarOverrides = function(vars) {
                ctx.pushVarOverrides(cfg.context, vars);
            };

            this.popVarOverrides = function() {
                ctx.popVarOverrides(cfg.context);
            };
        })());