/**
 * SceneJS IOC service container
 */

SceneJS.Services = new (function() {

    this.NODE_LOADER_SERVICE_ID = "node-loader";

    this._services = {};

    this.addService = function(name, service) {
        this._services[name] = service;
    };

    this.getService = function(name) {
        return this._services[name];
    };

    /*----------------------------------------------------
     * Install default services
     *---------------------------------------------------*/

    this.addService(this.NODE_LOADER_SERVICE_ID, {
        loadNode: function(nodeId) {
        }
    });

    /* Namespace for core implementations    
     */
    this.impl = {};
})();