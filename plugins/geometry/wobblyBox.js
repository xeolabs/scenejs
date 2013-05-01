SceneJS.Plugins.addPlugin(

    "geometry",

    "wobblyBox",

    new (function() {

        var plugin = this;

        /**
         * Returns a new geometry factory
         */
        this.getSource = function () {

            var wasCreated = false;
            var created;
            var updated;
            var configs = {};

            return {

                /**
                 * Get notification whenever factory creates the geometry
                 */
                onCreate : function(fn) {
                    created = fn;
                },

                /**
                 * Get notification whenever factory updates the geometry
                 */
                onUpdate : function(fn) {
                    updated = fn;
                },

                /**
                 * (Re)configure this factory, which may cause the factory to update the geometry
                 */
                setConfigs : function(cfg) {

                    configs = cfg;

                    if (!wasCreated) {

                        created(plugin.createGeometry(cfg.randomFactor));

                        wasCreated = true;

                    } else {

                        updated(plugin.createGeometry(cfg.randomFactor));
                    }
                },

                /**
                 * Get this factory's current configuration
                 */
                getConfigs : function() {
                    return configs;
                },

                /**
                 * Destroy this factory
                 */
                destroy : function() {
                }
            };
        };

        this.createGeometry = function(randomFactor) {

            return {
                primitive   : "triangles", // Geometry only uses this on create, ignores on update
                positions   : new Float32Array(this.randomize([  5, 5, 5,-5, 5, 5,-5,-5, 5,5,-5, 5,5, 5, 5,5,-5, 5,5,-5,-5,5, 5,-5,5, 5, 5,5, 5,-5,-5, 5,-5,-5, 5, 5, -5, 5, 5,-5, 5,-5,-5,-5,-5,-5,-5, 5,-5,-5,-5,5,-5,-5,5,-5, 5,-5,-5, 5,5,-5,-5,-5,-5,-5,-5, 5,-5, 5, 5,-5], randomFactor)),
                normals     : new Float32Array(this.randomize([  0, 0, 1, 0, 0, 1,  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0,-1, 0, 0, -1, 0, 0,  0,-1, 0, 0,-1, 0,  0,-1, 0, 0,-1, 0, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1], randomFactor)),
                uv          : new Float32Array(this.randomize([  5, 5,0, 5,0, 0, 5, 0,  0, 5,0, 0,5, 0,5, 5,5,0,5, 5,0, 5,0, 0,5,5,0, 5,0, 0,5, 0,0, 0,5,0,5,5,0,5,0,0,5,0,5,5,0,5], randomFactor)),
                uv2         : null,
                indices     : new Uint16Array([ 0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9,10, 8,10,11,12,13,14, 12,14,15,16,17,18,16,18,19,20,21,22,20,22,23])
            };
        };

        this.randomize = function(arry, randomFactor) {

            if (randomFactor == 0) {
                return arry;
            }

            var halfRandomFactor = randomFactor / 2.0;

            for (var i = 0, len = arry.length; i < len; i++) {
                arry[i] += (Math.random() * randomFactor) - halfRandomFactor;
            }

            return arry;
        };

    })());