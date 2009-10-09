/** WebGL support for projection nodes.
 *
 * @param type
 */

var WebGlProjectionBackend = function(type) {

    this.canvasType = 'moz-glweb20';
    this.nodeType = type;

    var ctx;
    var cfg;

    this.install = function(_ctx) {
        ctx = _ctx;
    };

    this.configure = function(_cfg) {
        cfg = _cfg;
    };

    this.setProjectionMatrix = function(mat) {
        if (ctx.programs && ctx.programs.getActiveProgramName()) {

            /* Not able to access built-in uniforms via glUniform
             * so we'll fall back on our own names
             */
            ctx.programs.setVariable(cfg.context, 'scene_ModelViewProjectionMatrix', mat);
        }
        else {
            // No program activate - programs object is lazy-created
            // by the first installed shader backend instance, so that
            // can also be the case if we never installed installed a
            // shader backend at all

            // TODO: set matrix for GL fixed function pipeline
        }
    };
};

SceneJs.Backend.installNodeBackend(new WebGlProjectionBackend('frustum'));
SceneJs.Backend.installNodeBackend(new WebGlProjectionBackend('perspective'));
SceneJs.Backend.installNodeBackend(new WebGlProjectionBackend('ortho'));
