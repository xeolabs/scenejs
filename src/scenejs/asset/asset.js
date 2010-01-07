/** Imports an asset from a file into a scene graph. This node is configured with the location of a file that describes
 * a (portion of) a 3D scene. When first visited, it will cause that file to be imported into the scene graph
 * to become its subtree, providing that a backend has been installed to help SceneJS asset that particular file type.
 */
SceneJs.asset = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend;

    return function(scope) {
        var params = cfg.getParams(scope);

        var getFileExtension = function(fileName) {
            var i = fileName.lastIndexOf(".");
            if (i == -1 || i == fileName.length-1) {
                throw "Invalid location config for asset node - extension missing";
            }
            return fileName.substr(i+1);
        };

        if (!backend) {
            if (!params.location) {
                throw new SceneJs.exceptions.NodeConfigExpectedException("Mandatory asset parameter missing: location");
            }
            backend = SceneJs.backends.getBackend("asset." + getFileExtension(params.location));
        }

        /* We dont hold onto the asset in order to allow SceneJS the option
         * of evicting it when it has not been used recently
         */
        var assetNode = backend.getAsset(params.location);

        /* Render the asset
         */
        assetNode.call(this, scope);
    };
};


