/** Asynchronously imports an asset from a file into a scene graph. This node is configured with the location of a file
 * that describes a (portion of) a 3D scene. When first visited, it will cause that file to be imported into the scene
 * graph to become its subtree, providing that a backend has been installed to help SceneJS asset that particular file
 * type.
 */
SceneJs.asset = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend;
    var loading = false;
    return function(scope) {
        var params = cfg.getParams(scope);

        var getFileExtension = function(fileName) {
            var i = fileName.lastIndexOf(".");
            if (i == -1 || i == fileName.length - 1) {
                throw "Invalid location config for asset node - extension missing";
            }
            return fileName.substr(i + 1);
        };

        if (!backend) {
            if (!params.proxy) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory asset parameter missing: proxy");
            }
            if (!params.uri) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory asset parameter missing: uri");
            }
            backend = SceneJs.backends.getBackend("asset." + getFileExtension(params.uri));
        }

        var assetNode = backend.getAsset(params.uri); // Backend may have evicted asset after lack of recent use

        if (!assetNode && !loading) { // Load asset if we dont have one and we're not busy loading one
            loading = true;
            backend.loadAsset(
                    params.proxy,
                    params.uri,
                    function(_assetNode) { // Success
                        assetNode = _assetNode;
                    });
        } else if (assetNode) { // Otherwise render asset if we do have one
            if (loading) {
                backend.assetLoaded();    // And notify backend so it can kill the load process
                loading = false;
            }
            if (params.params) {
                var childScope = SceneJs.utils.newScope(scope, cfg.fixed);
                for (var key in params.params) {
                    childScope.put(key, params.params[key]);
                }
                assetNode.call(this, childScope);
            } else {
                assetNode.call(this, scope);
            }

        }
        SceneJs.utils.visitChildren(cfg, scope); // For completeness - probably wont have children on an asset node        
    };
};


