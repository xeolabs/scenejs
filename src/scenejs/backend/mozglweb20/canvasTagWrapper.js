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
            context.clearColor(0.8, 0.8, 0.9, 1.0); 
        //    context.enable(context.CULL_FACE);
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            context.enable(context.DEPTH_TEST);
            context.clearDepth(0.1); 
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