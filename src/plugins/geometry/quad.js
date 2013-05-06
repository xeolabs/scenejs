/*
 * SceneJS WebGL Scene Graph Library for JavaScript
 * http://scenejs.org/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://scenejs.org/license
 * Copyright 2010, Lindsay Kay
 *
 */
SceneJS.Plugins.addPlugin(

    "geometry", // Node type
    "quad",

    new (function () {

        this.getSource = function () {

            var created;
            var updated;

            var configs = {};

            return {

                onCreate:function (fn) {
                    created = fn;
                },

                onUpdate:function (fn) {
                    updated = fn;
                },

                setConfigs:function (cfg) {
                    configs = cfg;
                    created(build(cfg));
                },

                getConfigs:function () {
                    return configs;
                },

                destroy:function () {
                }
            };
        };

        function build(cfg) {

            var positions = [ 1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0 ];
            var normals = [ -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0 ];
            var uv = [ 1, 1, 0, 1, 0, 0, 1, 0 ];
            var indices = [ 0, 1, 2, 0, 2, 3 ];

            return {
                primitive:cfg.wire ? "lines" : "triangles",
                coreId:"quad"+ (cfg.wire ? "wire" : "_solid"),
                positions:new Float32Array(positions),
                normals:new Float32Array(normals),
                uv:new Float32Array(uv),
                indices:new Uint16Array(indices)
            };
        }

    })());
