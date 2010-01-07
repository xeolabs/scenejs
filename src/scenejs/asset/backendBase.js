/**
 * Base for backends for the asset scene node. This is extended for each file type.
 */
SceneJs.assetBackend = function(cfg) {

    if (!cfg.type) {
        throw new SceneJs.exceptions.NodeConfigExpectedException("Asset backend config missing: type");
    }

    if (!cfg.parse) {
        throw new SceneJs.exceptions.NodeConfigExpectedException("Asset backend config missing: parser");
    }

    return new (function() {
        this.type = cfg.type; // File extension type

        var ctx;

        this.install = function(_ctx) {
            ctx = _ctx;

            if (!ctx.assets) {  // Lazy-create parser registry

                ctx.assets = new function() {

                    var importers = {}; // Backend extensions each create one of these
                    var nodes = {}; // Nodes created by parsers, cached against file name

                    /** Installs parser function provided in extension's configs
                     */
                    this.installImporter = function(cfg) {
                        importers[cfg.type] = {
                            type: cfg.type,
                            parse: cfg.parse
                        };
                    };

                    /** Imports file and returns node result. caches node against given file name.
                     */
                    this.getAsset = function(location, type) {
                        var node = nodes[location];
                        if (!node) {                            
                            var importer = importers[type];
                            if (!importer) {
                                throw "No asset node backend registered for file type: \"" + type + "\"";
                            }
                            node = importer.parse(); // TODO: parse what?
                        }
                        return node;
                    };

                    /** Clears nodes cached from previous imports.
                     */
                    this.clearAssets = function() {
                        nodes = {};
                    };
                };
            }

            /** Install parser function for backend extension
             */
            ctx.assets.installImporter(cfg);
        };

        // Methods for client asset node

        /** Imports the given file and returns a new child for the client asset node
         */
        this.getAsset = function(location) {
            return ctx.assets.getAsset(location, cfg.type);
        };

        /** Frees resources held by this backend (ie. parsers and cached scene graph fragments)
         */
        this.reset = function() {
            ctx.assets.clearAssets();
        };
    })();
};