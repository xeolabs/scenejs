SceneJs.texture = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend("texture");
    var params;
    var process = null;
    var loading = false;
    var error = false;

    return function(scope) {
        if (!params) {
            params = cfg.getParams(scope);
            if (!cfg.fixed) {
                throw new SceneJs.exceptions.UnsupportedOperationException("Dynamic configuration of textures is not supported");
            }
            if (!params.uri) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory texture parameter missing: uri");
            }

            /* By default, texture will block rendering of its child nodes until it is loaded
             */
            if (params.wait == undefined) {
                params.wait = true;
            }
        }
        if (error) {
            if (!params.wait) {
                SceneJs.utils.visitChildren(cfg, scope);
            }
        } else {
            var textureId = backend.getTexture(params.uri); // Backend may have evicted texture after lack of recent use

            if (!textureId && !loading) {

                /* Don't have texture, and no load process currently running
                 */
                process = backend.loadTexture(

                        params.uri,

                    /** Success handler - stores the texture handle and stops loading.
                     * We'll kill the process when this node is visited on the next traversal, see below.
                     */
                        function(_textureId) {
                            textureId = _textureId;
                            loading = true;
                        },

                    /** Error handler - texture load timed out or 404'd. Backend will kill the process
                     * for us and log an error.
                     */
                        function() {
                            error = true;
                        },

                    /** Abort handler - user has hit browser's Stop button. Backend will kill the process
                     * for us and log a warning.
                     */
                        function() {
                            error = true;
                        });
            } else if (textureId) { // Otherwise activate texture if we do have one
                if (loading) {

                    /* Just finished loading a texture - notify backend, which will kill the load process
                    */
                    backend.textureLoaded(process, textureId);
                    process = null;
                    loading = false;
                }
                backend.activateTexture(textureId);
                SceneJs.utils.visitChildren(cfg, scope);
            } else if (!params.wait) {

                /* Texture configured to render children without texturing while the texture is still loading
                 */
                SceneJs.utils.visitChildren(cfg, scope);
            }
        }
    };
};



