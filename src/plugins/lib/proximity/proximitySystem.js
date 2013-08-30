/**
 * A proximity system, which proxies a ProximityEngine running in a Web Worker
 */
(function () {

    define(function () {
        return ProximitySystem;
    });

    function ProximitySystem(systemId) {

        this.systemId = systemId;

        // Maximum number of bodies supported
        var maxBodies = 20000;

        var bodies = [];
        var map = new Map(bodies);

        // Create proximity engine in worker
        var workerPath = SceneJS.getConfigs().pluginPath + "/lib/proximity/proximityEngineWorker.js";
        var worker = new Worker(workerPath);

        var workerOutputBuf = new ArrayBuffer(maxBodies * 2);

        // True while worker is busy integrating
        // We don't send integration requests to it while this is true
        var integrating = false;

        // System is integrating only when this true
        var enabled = true;

        // Only integrate when center or radii change
        var center;
        var innerRadius;
        var outerRadius;

        // Schedules integration when true
        var needIntegrate = true;

        // Route updates from proximity engine to bodies
        worker.addEventListener('message',
            function (e) {

                var data = e.data;
                workerOutputBuf = data.buffer; // Worker transfers ownership of buffer to us
                var output = new Int16Array(workerOutputBuf);
                var lenOutput = data.lenOutput;
                var bodyId;
                var body;
                var status;

                // The data buffer from the web worker contains a 2-element portion for
                // each proximity body, each of which contains the body ID and proximity status:
                //
                // [
                //      bodyId, status,
                //      bodyId, status,
                //      ...
                // ]
                for (var i = 0, len = lenOutput - 1; i < len; i += 2) {
                    bodyId = output[i]; // First element for body ID
                    body = bodies[bodyId];
                    status = output[i + 1];
                    if (body) { // May have been deleted
                        body.callback(status);
                    }
                }

                integrating = false;

            }, false);

        /**
         * Configures this proximity system
         * @param configs Values for configs
         */
        this.setConfigs = function (configs) {
            // Schedule integration needed if center or radii updated
            if (configs.center) {
                var c = configs.center;
                if (!center || c[0] != center[0] || c[1] != center[1] || c[2] != center[2]) {
                    center = center || [0,0,0];
                    center[0] = c[0];
                    center[1] = c[1];
                    center[2] = c[2];
                    needIntegrate = true;
                }
            }
            if (configs.innerRadius != undefined) {
                if (configs.innerRadius != innerRadius) {
                    innerRadius = configs.innerRadius;
                    needIntegrate = true;
                }
            }
            if (configs.outerRadius != undefined) {
                if (configs.outerRadius != outerRadius) {
                    outerRadius = configs.outerRadius;
                    needIntegrate = true;
                }
            }
            // Configure proximity system
            worker.postMessage({ cmd:"setConfigs", configs:configs });
        };

        /**
         * Enable or disable this proximity system.
         * To save on CPU, you would typically disable the system when its not in view.
         * @param enable
         */
        this.setEnabled = function (enable) {
            enabled = enable;
            if (enable) {
                needIntegrate = true;
            }
        };

        /**
         * Creates a proximity body, returns it's unique ID
         * @param params Body params
         * @param callback Callback fired whenever body updated
         * @return Body ID
         */
        this.createBody = function (params, callback) {
            needIntegrate = true;
            var bodyId = map.add({
                callback:callback
            });
            worker.postMessage({ cmd:"createBody", bodyId:bodyId, bodyCfg:params });
            return bodyId;
        };

        /**
         * Updates an existing proximity body
         * @param bodyId Body ID
         * @param params Body params
         */
        this.updateBody = function (bodyId, params) {
            needIntegrate = true;
            worker.postMessage({ cmd:"updateBody", bodyId:bodyId, bodyCfg:params });
        };

        /**
         * Removes a proximity body
         */
        this.removeBody = function (bodyId) {
            worker.postMessage({ cmd:"removeBody", bodyId:bodyId });
            map.remove(bodyId);
        };

        /**
         * Integrates this proximity system
         * Does nothing when system is disabled with {@link ProximitySystem#setEnabled}.
         */
        this.integrate = function () {

            if (!enabled) {
                return;
            }

            if (integrating) { // Don't choke worker
                return;
            }

            if (needIntegrate) {

                integrating = true;
                needIntegrate = false;

                // Transfer ownership of output buffer to the worker
                var msg = {
                    cmd:"integrate",
                    buffer:workerOutputBuf
                };

                worker.postMessage(msg, [msg.buffer]);
            }
        };

        /**
         * Destroys system, terminating its worker
         */
        this.destroy = function () {
            worker.terminate();
        };
    }

    /**
     * Uniquely ID'd map of items
     * @param items Array that will contain the items
     */
    function Map(items) {
        this.add = function (item) {

            // Start looking from the beginning of the array
            // because we don't want an infinitely-expanding
            // sparse array as we remove then add nodes.

            // We're trading insertion overhead for the benefit
            // of a nicely packed array that's fast to traverse
            // when posting updates back to the proximity body nodes.

            var i = 0;
            while (true) {
                if (!items[i]) {
                    items[i] = item;
                    return i;
                }
                i++;
            }
        };
        this.remove = function (id) {
            delete items[id];
        };
    }
})();