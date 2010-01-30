/**
 * Defines geometry on the currently-active canvas, to be shaded with the current shader.
 *
 */
SceneJs.geometry = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('geometry');

    var canvasId;
    var bufId; // handle to backend geometry buffer

    return function(scope) {
        var params = cfg.getParams(scope);

        if (!params.type) {
            throw new SceneJs.exceptions.NodeConfigExpectedException("Geometry type parameter expected");
        }

        if (params.type) {

            /* Buffer geometry that is identified with a type
             */
            if (canvasId != backend.getActiveCanvasId()) { // TODO: backend should listen for canvas switch and throw out buffer
                bufId = null;
            }

            /* Backend may have evicted geometry buffer, so we may have to reallocate it
             */
            bufId = backend.findGeoBuffer(params.type);
            if (!bufId) {
                if (params.create) {

                    /** Callback function lazy-computes geometry
                     */
                    bufId = backend.createGeoBuffer(params.type, params.create());
                } else {
                    bufId = backend.createGeoBuffer(params.type, {
                        vertices : params.vertices,
                        normals: params.normals,
                        colors : params.colors || [],
                        indices : params.indices,
                        texCoords : params.texCoords || []
                    });
                }
            }
            canvasId = backend.getActiveCanvasId();
        } else {
            // TODO: render eometry without using VBO
        }
        backend.drawGeoBuffer(bufId);
        SceneJs.utils.visitChildren(cfg, scope);
    };
};

