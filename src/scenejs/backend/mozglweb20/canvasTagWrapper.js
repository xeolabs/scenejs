/** Installs canvas tag wrapper for WebGL2.0 canvas
 *
 */
SceneJs.Backend.installCanvasBackend(new (function() {

    this.canvasType = 'moz-glweb20';

    /** Attempts to get a context on the given canvas it for this plugin. Returns context on success else null.
     * The actual context is wrapped in an object that could bundle resources alongside the context.
     */
    this.getConfig = function(_canvas) {
        var cfg = null;
        var context = null;
        if (!_canvas) {
            throw 'canvas is undefined';
        }
        try {
            context = _canvas.getContext(this.canvasType);
        } catch(e) {
        }
        cfg = {
            canvas: _canvas,
            context: context
        };
        return cfg;
    };

    this.aquire = function(cfg) {
        var context = cfg.context;
        context.clearColor(0.8, 0.8, 0.9, 1.0);
        context.clearDepth(1.0);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.enable(context.DEPTH_TEST);
        //      context.enable(context.CULL_FACE);
        //    context.hint(context.PERSPECTIVE_CORRECTION_HINT, context.NICEST);
    };

    this.release = function(cfg) {
        cfg.context.swapBuffers();
    };

    /** Called to release config resources when canvas element removed from DOM
     */
    this.destroy = function(cfg) {

    };
})());