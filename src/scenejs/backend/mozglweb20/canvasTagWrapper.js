/** WebGL canvas backend
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
    };

    this.release = function(cfg) {
        cfg.context.swapBuffers();
    };

    this.destroy = function(cfg) {

    };
})());