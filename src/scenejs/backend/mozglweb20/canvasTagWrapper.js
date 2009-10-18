/** WebGL canvas backend
 *
 */
SceneJs.Backend.installCanvasBackend(new (function() {

    this.canvasType = 'moz-glweb20';

    /** Attempts to get a context on the given canvas it for this plugin. Returns context on success else null.
     * The actual context is wrapped in an object that could bundle resources alongside the context.
     */
    this.getConfig = function(canvas) {
        var cfg = null;
        var context = null;
        if (!canvas) {
            throw 'canvas is undefined';
        }
        try {
            context = canvas.getContext(this.canvasType);
            context.enable(context.CULL_FACE);
        } catch(e) {
        }
        return context ? {  canvas: canvas,  context: context } : null;
    };

    this.aquire = function(cfg) {
    };

    this.release = function(cfg) {
        cfg.context.swapBuffers();
    };

    this.destroy = function(cfg) {
    };
})());