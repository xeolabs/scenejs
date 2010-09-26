/**
 * SceneJS IOC service container
 */
SceneJS.Services = new (function() {

    /** ID of node loader service
     */
    this.NODE_LOADER_SERVICE_ID = "node-loader";

    this._services = {

        /* Default node loader service
         */
        "node-loader" : {
            loadNode: function(nodeId) {
            }
        }
    };

    this.addService = function(name, service) {
        this._services[name] = service;
    };

    this.getService = function(name) {
        return this._services[name];
    };
})();

SceneJS.Services.impl = {

    NodeFileLoader : function (cfg) {

        this._loads = {};

        /**
         * Loads the node of the given ID if it does not exist and is not already loading
         */
        this.loadNode = function(nodeId) {
            if (!SceneJS.nodeExists(nodeId) && this._loads[nodeId]) {
                this._loadNode(nodeId);
            }
        };

        /** Performs the JSONP load.
         */
        this._loadNode = function(nodeId) {
            var head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.type = "text/javascript";
            head.appendChild(script);
            this._loads[nodeId] = {
                timeStarted: (new Date()).getTime()
            };
            script.src = cfg.urlStrategy(nodeId);
        };
    }
};
