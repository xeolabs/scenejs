/*
 * SceneJS WebGL Scene Graph Library for JavaScript
 * http://scenejs.org/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://scenejs.org/license
 * Copyright 2010, Lindsay Kay
 *
 */
SceneJS.Plugins.addPlugin(

        SceneJS.Plugins.GEO_ASSET_PLUGIN,

        "sphere",

        new (function() {

            var assetService = this;

            this.getAsset = function () {

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
                        created(assetService.buildQuad(cfg));
                    },

                    getConfigs : function() {
                        return configs;
                    },

                    destroy : function() {
                    }
                };
            };

            this.buildQuad = function(configs) {

               Quad.prototype._init = function(params) {
        this.attr.type = "quad";

        var solid = (params.solid != undefined) ? params.solid : true;

        var x = params.xSize || 1;
        var y = params.ySize || 1;

        SceneJS_geometry.prototype._init.call(this, {

            /* Core ID ensures that we reuse any quad that has already been created with
             * these parameters instead of wasting memory
             */
            coreId : params.coreId || "quad_" + x + "_" + y + (solid ? "_solid" : "_wire"),

            /* Factory function used when resource not found
             */
            create : function() {

                var xDiv = params.xDiv || 1;
                var yDiv = params.yDiv || 1;

                var positions, normals, uv, indices;

                if (xDiv == 1 && yDiv == 1) {
                    positions = [
                        x, y, 0,
                        -x, y, 0,
                        -x,-y, 0,
                        x,-y, 0
                    ];
                    normals = [
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1
                    ];
                    uv = [
                        1, 1,
                        0, 1,
                        0, 0,
                        1, 0
                    ];
                    indices = [
                        2, 1, 0,
                        3, 2, 0
                    ];
                } else {
                    if (xDiv < 0) {
                        throw SceneJS_error.fatalError(SceneJS.errors.ILLEGAL_NODE_CONFIG, "quad xDiv should be greater than zero");
                    }
                    if (yDiv < 0) {
                        throw SceneJS_error.fatalError(SceneJS.errors.ILLEGAL_NODE_CONFIG, "quad yDiv should be greater than zero");
                    }
                    positions = [];
                    normals = [];
                    uv = [];
                    indices = [];
                    var xStep = (x * 2) / xDiv;
                    var yStep = (y * 2) / yDiv;
                    var xRat = 0.5 / xDiv;
                    var yRat = 0.5 / yDiv;
                    var i = 0;
                    for (var yi = -y, yuv = 0; yi <= y; yi += yStep,yuv += yRat) {
                        for (var xi = -x, xuv = 0; xi <= x; xi += xStep,xuv += xRat) {
                            positions.push(xi);
                            positions.push(yi);
                            positions.push(0);
                            normals.push(0);
                            normals.push(0);
                            normals.push(1);
                            uv.push(xuv);
                            uv.push(yuv);
                            if (yi < y && xi < x) { // Two triangles
                                indices.push(i + 2);
                                indices.push(i + 1);
                                indices.push(i);
                                indices.push(i + 3);
                                indices.push(i + 2);
                                indices.push(i);
                            }
                            i += 3;
                        }
                    }
                }

                return {
                    primitive : solid ? "triangles" : "lines",
                    positions : positions,
                    normals: normals,
                    uv : uv,
                    indices : indices,
                    colors:[]
                };
            }
        });
            };
        })());
