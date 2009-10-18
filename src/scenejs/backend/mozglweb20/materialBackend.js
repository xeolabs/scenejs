/**
 * WebGL backend for SceneJs.Material node 
 */
SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'material';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.materialStack) {
                    ctx.materialStack = new function() {
                        var stack = [];

                        this.pushMaterial = function(context, material) {
                            if (!ctx.programs.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            stack.push(material);
                            ctx.programs.setVar(context, 'scene_Material', material);
                        };

                        this.popMaterial = function(context) {
                            if (!ctx.programs.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            stack.pop();
                            if (stack.length > 0) {
                                ctx.programs.setVar(context, 'scene_Material',  stack[stack.length - 1] );
                            } else {
                                ctx.programs.setVar(context, 'scene_Material',  null); // Script will revert to default material
                            }
                        };
                    };
                }
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
            };

            this.pushMaterial = function(material) {
                ctx.materialStack.pushMaterial(cfg.context, material);
            };

            this.popMaterial = function() {
                ctx.materialStack.popMaterial(cfg.context);
            };
        })());