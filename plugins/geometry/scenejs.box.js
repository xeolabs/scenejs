/*
 * SceneJS WebGL Scene Graph Library for JavaScript
 * http://scenejs.org/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://scenejs.org/license
 * Copyright 2010, Lindsay Kay
 *
 */
SceneJS.Plugins.addPlugin(

        SceneJS.Plugins.GEO_SOURCE_PLUGIN, // This is a geometry source factory plugin

        "box", // Type of source created by this plugin

        new (function() {

            var sourceService = this;

            this.getSource = function () {

                var created;
                var updated;

                var configs = {};

                return {

                    onCreate : function(fn) {
                        created = fn;
                    },

                    onUpdate : function(fn) {
                        updated = fn;
                    },

                    setConfigs : function(cfg) {
                        configs = cfg;
                        created(sourceService.buildBox(cfg));
                    },

                    getConfigs : function() {
                        return configs;
                    },

                    destroy : function() {
                    }
                };
            };

            this.buildBox = function(configs) {
                var x = configs.xSize || 1;
                var y = configs.ySize || 1;
                var z = configs.zSize || 1;

                var solid = (configs.solid != undefined) ? configs.solid : true;

                var positions = [
                    x, y, z,  -x, y, z, -x,-y, z,  x,-y, z, // v0-v1-v2-v3 front
                    x, y, z,   x,-y, z,  x,-y,-z,  x, y,-z, // v0-v3-v4-v5 right
                    x, y, z,   x, y,-z, -x, y,-z, -x, y, z, // v0-v5-v6-v1 top
                    -x, y, z, -x, y,-z, -x,-y,-z, -x,-y, z, // v1-v6-v7-v2 left
                    -x,-y,-z,  x,-y,-z,  x,-y, z, -x,-y, z, // v7-v4-v3-v2 bottom
                    x,-y,-z,  -x,-y,-z, -x, y,-z,  x, y,-z // v4-v7-v6-v5 back
                ];

                var normals = [
                    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,  // v0-v1-v2-v3 front
                    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
                    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // v0-v5-v6-v1 top
                    -1, 0, 0, -1, 0, 0, -1, 0, 0,-1, 0, 0, // v1-v6-v7-v2 left
                    0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, // v7-v4-v3-v2 bottom
                    0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1     // v4-v7-v6-v5 back
                ];

                var uv = [
                    x, y, 0, y, 0, 0, x, 0, // v0-v1-v2-v3 front
                    0, y, 0, 0, x, 0, x, y, // v0-v3-v4-v5 right
                    x, 0, x, y, 0, y, 0, 0, // v0-v5-v6-v1 top
                    x, y, 0, y, 0, 0, x, 0, // v1-v6-v7-v2 left
                    0, 0, x, 0, x, y, 0, y, // v7-v4-v3-v2 bottom
                    0, 0, x, 0, x, y, 0, y
                ];   // v4-v7-v6-v5 back

                var indices = [
                    0, 1, 2, 0, 2, 3,// front
                    4, 5, 6, 4, 6, 7, // right
                    8, 9,10, 8,10,11, // top
                    12,13,14,12,14,15, // left
                    16,17,18,16,18,19, // bottom
                    20,21,22,20,22,23
                ] ;  // back

                return {
                    primitive : solid ? "triangles" : "lines",
                    coreId: "box_" + x + "_" + y + "_" + z + (solid ? "_solid" : "wire"),
                    positions : new Float32Array(positions),
                    normals: new Float32Array(normals),
                    uv : new Float32Array(uv),
                    indices : new Uint16Array(indices)
                };
            };

        })());
