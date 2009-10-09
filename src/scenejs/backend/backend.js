SceneJs.Backend = new (function() {

    var backendContextsByCanvasType = {}; // A shared renderer Backend context for each canvas type

    var canvasBackendsByType = {}; // Context plugins mapped to canvas type names
    var canvasBackendsById = {}; // Context plugins mapped to canvas IDs

    var canvasConfigsById = {}; // Contexts mapped to canvas IDs
    var canvassesById = {}; // Canvasses mapped to IDs

    var nodeBackendSetsByCanvasType = {}; // A set of renderer plugins mapped to each canvas type

    var activeCanvasBackend;
    var activeCanvasConfig;

    this.installCanvasBackend = function(canvasBackend) {
        canvasBackendsByType[canvasBackend.canvasType] = canvasBackend;
    };

    /**
     * Renderer plugins need to be installed in order of dependency via the backend context. Ie. Scene first.
     * @param nodeBackend
     */
    this.installNodeBackend = function(nodeBackend) {
        var plugins = nodeBackendSetsByCanvasType[nodeBackend.canvasType];
        if (!plugins) {
            plugins = {};
            nodeBackendSetsByCanvasType[nodeBackend.canvasType] = plugins;
        }
        plugins[nodeBackend.nodeType] = nodeBackend;

        var backendContext = backendContextsByCanvasType[nodeBackend.canvasType];
        if (!backendContext) {
            backendContext = {};
            backendContextsByCanvasType[nodeBackend.canvasType] = backendContext;
        }
        nodeBackend.install(backendContext);
    };

    var getCanvasConfig = function(canvasId) {   // TODO: release config when canvas element dissappears
        var config = canvasConfigsById[canvasId];
        if (config) {
            return config;
        }
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw 'Canvas element not found in DOM (element ID = \'' + canvasId + '\')';
        }
        for (var contextType in canvasBackendsByType) {
            config = canvasBackendsByType[contextType].getConfig(canvas);
            if (config) {
                canvasConfigsById[canvasId] = config;
                canvassesById[canvasId] = canvas;
                canvasBackendsById[canvasId] = canvasBackendsByType[contextType];
                return config;
            }
        }
        throw 'Canvas element is not a supported type (element ID = \'' + canvasId + '\') - install plugins into SceneJs.Backend to support it';
    };

    this.acquireCanvas = function(canvasId) {
        if (activeCanvasBackend) {
            this.releaseCanvas();
        }
        activeCanvasConfig = getCanvasConfig(canvasId);
        activeCanvasBackend = canvasBackendsById[canvasId];
        activeCanvasBackend.aquire(activeCanvasConfig);
    };

    this.getNodeBackend = function(nodeType) {
        if (!activeCanvasBackend) {
            return null;  // Probably a missing Canvas node - so be it!
            //throw 'Cannot get backend - no canvas is currently aquired'; // TODO: mention the missing Canvas node?
        }
        var backendSet = nodeBackendSetsByCanvasType[activeCanvasBackend.canvasType];
        if (!backendSet) {
            return null;
        }
        var backend = backendSet[nodeType];
        if (!backend) {
            return null;
        }
        backend.configure(activeCanvasConfig);
        return backend;
    };

    this.releaseCanvas = function() {
        if (activeCanvasBackend) {
            activeCanvasBackend.release(activeCanvasConfig);
            activeCanvasBackend = null;
            activeCanvasConfig = null;
        }
    };
})();
