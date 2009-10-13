/**
 * WebGL backend for SceneJs.Lights node 
 */

SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'lights';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.lightStack) {
                    ctx.lightStack = new function() {
                        var stack = [];

                        this.pushLights = function(context, lights) {
                            if (!ctx.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            for (var i = 0; i < lights.length; i++) {
                                stack.push(lights[i]);
                            }
                            ctx.setVars(context, { lights: stack });
                        };

                        this.popLights = function(context, numLights) {
                            if (!ctx.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            for (var i = 0; i < numLights; i++) {
                                stack.pop();
                            }
                            ctx.setVars(context, { lights: stack });
                        };
                    };
                }
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
            };

            this.pushLights = function(lights) {
                ctx.pushLights(cfg.context, lights);
            };

            this.popLights = function(numLights) {
                ctx.popLights(cfg.context, numLights);
            };
        })());