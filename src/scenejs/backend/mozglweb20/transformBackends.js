/** WebGL backends for model-view transformation nodes.
 *
 * @param type
 */
(function() {
    var WebGlTransformBackend = function(type) {
        this.canvasType = 'moz-glweb20';
        this.nodeType = type;

        var ctx;
        var cfg;
        var context;

        this.install = function(_ctx) {
            ctx = _ctx;

            if (!ctx.mvMatrixStack) {
                ctx.mvMatrixStack = new function() {
                    var stack = [$M([
                        [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
                    ])];
                    var top = null;

                    this.push = function(context, mat) {
                        if (top) {
                            mat = top.x(mat).ensure4x4();
                        }
                        stack.push(mat);
                        if (ctx.programs && ctx.programs.getActiveProgramName()) {
                            ctx.programs.setVar(context, 'scene_ModelViewMatrix', mat);
                            ctx.programs.setVar(context, 'scene_NormalMatrix', mat.inverse().transpose().make3x3());
                        } else {
                            // No program active.
                            // TODO: set matrix for GL fixed function pipeline
                        }
                        top = mat;
                    };

                    this.pop = function(context) {
                        if (stack.length > 1) {
                            stack.pop();
                            top = stack[stack.length - 1];
                            if (ctx.programs && ctx.programs.getActiveProgramName()) {
                                ctx.programs.setVar(context, 'scene_ModelViewMatrix', top);
                                ctx.programs.setVar(context, 'scene_NormalMatrix', top.inverse().transpose().make3x3());
                            } else {
                                // No program loaded.
                                // TODO: set matrix for GL fixed function pipeline
                            }
                        }  else {
                            top = null;
                        }
                    };

                    this.peek = function() {
                        return top;
                    };
                };
            }
        };

        this.configure = function(_cfg) {
            cfg = _cfg;
            context = cfg.context;
        };

        this.getModelViewMatrixTop = function() {
            return ctx.mvMatrixStack.peek();
        };

        this.pushModelViewMatrix = function(m) {
            ctx.mvMatrixStack.push(context, m);
        };

        this.popModelViewMatrix = function() {
            ctx.mvMatrixStack.pop(context, cfg);
        };
    };

    SceneJs.Backend.installNodeBackend(new WebGlTransformBackend('lookat'));
    SceneJs.Backend.installNodeBackend(new WebGlTransformBackend('rotate'));
    SceneJs.Backend.installNodeBackend(new WebGlTransformBackend('translate'));
    SceneJs.Backend.installNodeBackend(new WebGlTransformBackend('scale'));
})();