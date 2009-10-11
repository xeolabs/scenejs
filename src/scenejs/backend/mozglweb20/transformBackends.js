/** WebGL support for model-view transformation nodes.
 *
 * @param type
 */

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
                    stack.push(mat);
                    if (ctx.programs && ctx.programs.getActiveProgramName()) {
                        ctx.programs.setVariable(context, 'scene_ModelViewMatrix', mat);

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
                            ctx.programs.setVariable(context, 'scene_ModelViewMatrix', top);
                        } else {
                            // No program loaded.
                            // TODO: set matrix for GL fixed function pipeline
                        }
                    }
                };

                this.peek = function() {
                    var m = stack[stack.length - 1];
                    return m ? m : null;
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