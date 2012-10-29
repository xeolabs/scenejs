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

                var wasCreated = false;

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

                        if (!wasCreated) {

                            created(assetService.buildSphere(cfg));
                            
                            wasCreated = true;

                        } else {

                            updated(assetService.buildSphere(cfg));
                        }
                    },

                    getConfigs : function() {
                        return configs;
                    },

                    destroy : function() {
                    }
                };
            };

            this.buildSphere = function(configs) {

                var slices = configs.slices || 30;
                var rings = configs.rings || 30;
                var radius = configs.radius || 1;

                var semiMajorAxis = configs.semiMajorAxis || 1;
                var semiMinorAxis = 1 / semiMajorAxis;

                var sweep = configs.sweep || 1;
                if (sweep > 1) {
                    sweep = 1;
                }

                var sliceDepth = configs.sliceDepth || 1;
                if (sliceDepth > 1) {
                    sliceDepth = 1;
                }

                var ringLimit = rings * sweep;
                var sliceLimit = slices * sliceDepth;

                var theta;
                var sinTheta;
                var cosTheta;

                var positions = [];
                var normals = [];
                var uv = [];
                var ringNum, sliceNum, index;

                var phi;
                var sinPhi;
                var cosPhi;

                var x;
                var y;
                var z;
                var u;
                var v;
                var yPos;
                var first;
                var second;

                for (sliceNum = 0; sliceNum <= slices; sliceNum++) {
                    if (sliceNum > sliceLimit) break;
                    theta = sliceNum * Math.PI / slices;
                    sinTheta = Math.sin(theta);
                    cosTheta = Math.cos(theta);

                    for (ringNum = 0; ringNum <= rings; ringNum++) {
                        if (ringNum > ringLimit) break;
                        phi = ringNum * 2 * Math.PI / rings;
                        sinPhi = semiMinorAxis * Math.sin(phi);
                        cosPhi = semiMajorAxis * Math.cos(phi);

                        x = cosPhi * sinTheta;
                        y = cosTheta;
                        z = sinPhi * sinTheta;
                        u = 1 - (ringNum / rings);
                        v = sliceNum / slices;

                        normals.push(x);
                        normals.push(y);
                        normals.push(z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(radius * y);
                        positions.push(radius * z);
                    }
                }

                // create a center point which is only used when sweep or sliceDepth are less than one
                if (sliceDepth < 1) {
                    yPos = Math.cos((sliceNum - 1) * Math.PI / slices) * radius;
                    positions.push(0, yPos, 0);
                    normals.push(1, 1, 1);
                    uv.push(1, 1);
                } else {
                    positions.push(0, 0, 0);
                    normals.push(1, 1, 1);
                    uv.push(1, 1);
                }

                // index of the center position point in the positions array
                // var centerIndex = (ringLimit + 1) *  (sliceLimit);
                var centerIndex = positions.length / 3 - 1;

                var indices = [];

                for (sliceNum = 0; sliceNum < slices; sliceNum++) {
                    if (sliceNum >= sliceLimit) break;
                    for (ringNum = 0; ringNum < rings; ringNum++) {
                        if (ringNum >= ringLimit) break;
                        first = (sliceNum * (ringLimit + 1)) + ringNum;
                        second = first + ringLimit + 1;
                        indices.push(first);
                        indices.push(second);
                        indices.push(first + 1);

                        indices.push(second);
                        indices.push(second + 1);
                        indices.push(first + 1);
                    }
                    if (rings >= ringLimit) {
                        // We aren't sweeping the whole way around so ...
                        //  indices for a sphere with fours ring-segments when only two are drawn.
                        index = (ringLimit + 1) * sliceNum;
                        //    0,3,15   2,5,15  3,6,15  5,8,15 ...
                        indices.push(index, index + ringLimit + 1, centerIndex);
                        indices.push(index + ringLimit, index + ringLimit * 2 + 1, centerIndex);
                    }
                }

                if (slices > sliceLimit) {
                    // We aren't sweeping from the top all the way to the bottom so ...
                    for (ringNum = 1; ringNum <= ringLimit; ringNum++) {
                        index = sliceNum * ringLimit + ringNum;
                        indices.push(index, index + 1, centerIndex);
                    }
                    indices.push(index + 1, sliceNum * ringLimit + 1, centerIndex);
                }

                return {
                    primitive : "triangles",
                    coreId : "sphere_" + radius + "_" + rings + "_" + slices + "_" + semiMajorAxis + "_" + sweep + "_" + sliceDepth,
                    positions : new Float32Array(positions),
                    normals: new Float32Array(normals),
                    uv : new Float32Array(uv),
                    indices : new Uint16Array(indices)
                };
            };
        })());
