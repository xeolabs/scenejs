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
    "sphere",

    new (function () {

        var sourceService = this;

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
                    created(sourceService.buildDisk(cfg));
                },

                getConfigs:function () {
                    return configs;
                },

                destroy:function () {
                }
            };
        };

        this.buildDisk = function (configs) {

            var radius = params.radius || 1;
            var height = params.height || 1;
            var rings = params.rings || 30;
            var innerRadius = params.innerRadius || 0;
            if (innerRadius > radius) {
                innerRadius = radius
            }

            var semiMajorAxis = params.semiMajorAxis || 1;
            var semiMinorAxis = 1 / semiMajorAxis;

            var sweep = params.sweep || 1;
            if (sweep > 1) {
                sweep = 1
            }

            var ringLimit = rings * sweep;

            SceneJS_geometry.prototype._init.call(this, {

                /* Resource ID ensures that we reuse any sphere that has already been created with
                 * these parameters instead of wasting memory
                 */
                coreId:params.coreId || "disk_" + radius + "_" + height + "_" + rings + "_" + innerRadius + "_" + semiMajorAxis + "_" + sweep,

                /* Callback that does the creation in case we can't find matching disk to reuse
                 */
                create:function () {
                    var positions = [];
                    var normals = [];
                    var uv = [];

                    var ybot = height * -0.5;
                    var ytop = height * 0.5;

                    if (innerRadius <= 0) {
                        // create the central vertices

                        // bottom vertex
                        normals.push(0);
                        normals.push(-1);
                        normals.push(0);
                        uv.push(u);
                        uv.push(v);
                        positions.push(0);
                        positions.push(ybot);
                        positions.push(0);

                        // top vertex
                        normals.push(0);
                        normals.push(1);
                        normals.push(0);
                        uv.push(u);
                        uv.push(v);
                        positions.push(0);
                        positions.push(ytop);
                        positions.push(0);
                    }

                    for (var ringNum = 0; ringNum <= rings; ringNum++) {

                        if (ringNum > ringLimit) break;

                        var phi = ringNum * 2 * Math.PI / rings;
                        var sinPhi = semiMinorAxis * Math.sin(phi);
                        var cosPhi = semiMajorAxis * Math.cos(phi);

                        var x = cosPhi;
                        var z = sinPhi;
                        var u = 1 - (ringNum / rings);
                        var v = 0.5;

                        //
                        // Create the outer set of vertices,
                        // two for the bottom and two for the top.
                        //

                        // bottom vertex, facing the disk axis
                        normals.push(0);
                        normals.push(-1);
                        normals.push(0);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(ybot);
                        positions.push(radius * z);

                        // bottom vertex, facing outwards
                        normals.push(x);
                        normals.push(0);
                        normals.push(z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(ybot);
                        positions.push(radius * z);

                        // top vertex, facing the disk axis
                        normals.push(0);
                        normals.push(1);
                        normals.push(0);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(ytop);
                        positions.push(radius * z);

                        // top vertex, facing outwards
                        normals.push(x);
                        normals.push(0);
                        normals.push(z);
                        uv.push(u);
                        uv.push(v);
                        positions.push(radius * x);
                        positions.push(ytop);
                        positions.push(radius * z);

                        if (innerRadius > 0) {

                            //
                            // Creating a disk with a hole in the middle ...
                            // generate the inner set of vertices,
                            // one for the bottom and one for the top
                            //

                            // bottom vertex, facing the disk axis
                            normals.push(0);
                            normals.push(-1);
                            normals.push(0);
                            uv.push(u);
                            uv.push(v);
                            positions.push(innerRadius * x);
                            positions.push(ybot);
                            positions.push(innerRadius * z);

                            // bottom vertex, facing inwards
                            normals.push(-x);
                            normals.push(0);
                            normals.push(-z);
                            uv.push(u);
                            uv.push(v);
                            positions.push(innerRadius * x);
                            positions.push(ybot);
                            positions.push(innerRadius * z);

                            // top vertex, facing the disk axis
                            normals.push(0);
                            normals.push(1);
                            normals.push(0);
                            uv.push(u);
                            uv.push(v);
                            positions.push(innerRadius * x);
                            positions.push(ytop);
                            positions.push(innerRadius * z);

                            // top vertex, facing inwards
                            normals.push(-x);
                            normals.push(0);
                            normals.push(-z);
                            uv.push(u);
                            uv.push(v);
                            positions.push(innerRadius * x);
                            positions.push(ytop);
                            positions.push(innerRadius * z);
                        }

                        if (ringNum + 1 > ringLimit) {

                            //
                            // Create (outer) vertices for end caps.
                            //

                            // bottom vertex for the first end cap
                            normals.push(0);
                            normals.push(0);
                            normals.push(-1);
                            uv.push(u);
                            uv.push(v);
                            positions.push(radius * semiMajorAxis);
                            positions.push(ybot);
                            positions.push(0);

                            // top vertex for the first end cap
                            normals.push(0);
                            normals.push(0);
                            normals.push(-1);
                            uv.push(u);
                            uv.push(v);
                            positions.push(radius * semiMajorAxis);
                            positions.push(ytop);
                            positions.push(0);

                            // bottom vertex for the second end cap
                            normals.push(-z);
                            normals.push(0);
                            normals.push(x);
                            uv.push(u);
                            uv.push(v);
                            positions.push(radius * x);
                            positions.push(ybot);
                            positions.push(radius * z);

                            // top vertex for the second end cap
                            normals.push(-z);
                            normals.push(0);
                            normals.push(x);
                            uv.push(u);
                            uv.push(v);
                            positions.push(radius * x);
                            positions.push(ytop);
                            positions.push(radius * z);

                            if (innerRadius > 0) {

                                //
                                // Disk with a hole.
                                // Create inner vertices for end caps.
                                //

                                // bottom vertex for the first end cap
                                normals.push(0);
                                normals.push(0);
                                normals.push(-1);
                                uv.push(u);
                                uv.push(v);
                                positions.push(innerRadius * semiMajorAxis);
                                positions.push(ybot);
                                positions.push(0);

                                // top vertex for the first end cap
                                normals.push(0);
                                normals.push(0);
                                normals.push(-1);
                                uv.push(u);
                                uv.push(v);
                                positions.push(innerRadius * semiMajorAxis);
                                positions.push(ytop);
                                positions.push(0);

                                // bottom vertex for the second end cap
                                normals.push(-z);
                                normals.push(0);
                                normals.push(x);
                                uv.push(u);
                                uv.push(v);
                                positions.push(innerRadius * x);
                                positions.push(ybot);
                                positions.push(innerRadius * z);

                                // top vertex for the second end cap
                                normals.push(-z);
                                normals.push(0);
                                normals.push(x);
                                uv.push(u);
                                uv.push(v);
                                positions.push(innerRadius * x);
                                positions.push(ytop);
                                positions.push(innerRadius * z);
                            } else {

                                //
                                // Disk without a hole.
                                // End cap vertices at the center of the disk.
                                //

                                // bottom vertex for the first end cap
                                normals.push(0);
                                normals.push(0);
                                normals.push(-1);
                                uv.push(u);
                                uv.push(v);
                                positions.push(0);
                                positions.push(ybot);
                                positions.push(0);

                                // top vertex for the first end cap
                                normals.push(0);
                                normals.push(0);
                                normals.push(-1);
                                uv.push(u);
                                uv.push(v);
                                positions.push(0);
                                positions.push(ytop);
                                positions.push(0);

                                // bottom vertex for the second end cap
                                normals.push(-z);
                                normals.push(0);
                                normals.push(x);
                                uv.push(u);
                                uv.push(v);
                                positions.push(0);
                                positions.push(ybot);
                                positions.push(0);

                                // top vertex for the second end cap
                                normals.push(-z);
                                normals.push(0);
                                normals.push(x);
                                uv.push(u);
                                uv.push(v);
                                positions.push(0);
                                positions.push(ytop);
                                positions.push(0);
                            }

                            break;
                        }
                    }

                    var indices = [];

                    //
                    // Create indices pointing to vertices for the top, bottom
                    // and optional endcaps for the disk
                    //

                    if (innerRadius > 0) {
                        //
                        // Creating a disk with a hole in the middle ...
                        // Each ring sengment rquires a quad surface on the top and bottom
                        // so create two triangles for the top and two for the bottom.
                        //
                        var index;
                        for (var ringNum = 0; ringNum < rings; ringNum++) {
                            if (ringNum + 1 > ringLimit) {

                                //
                                // We aren't sweeping the whole way around so also create triangles to cap the ends.
                                //

                                index = (ringNum + 1) * 8;    // the first vertex after the regular vertices

                                // start cap
                                indices.push(index);
                                indices.push(index + 4);
                                indices.push(index + 5);

                                indices.push(index);
                                indices.push(index + 5);
                                indices.push(index + 1);

                                // end cap
                                indices.push(index + 2);
                                indices.push(index + 7);
                                indices.push(index + 6);

                                indices.push(index + 2);
                                indices.push(index + 3);
                                indices.push(index + 7);

                                break;
                            }

                            index = ringNum * 8;

                            // outer ring segment quad
                            indices.push(index + 1);
                            indices.push(index + 3);
                            indices.push(index + 11);

                            indices.push(index + 1);
                            indices.push(index + 11);
                            indices.push(index + 9);

                            // inner ring segment quad
                            indices.push(index + 5);
                            indices.push(index + 7);
                            indices.push(index + 15);

                            indices.push(index + 5);
                            indices.push(index + 15);
                            indices.push(index + 13);

                            // bottom disk segment
                            indices.push(index);
                            indices.push(index + 8);
                            indices.push(index + 12);

                            indices.push(index + 0);
                            indices.push(index + 12);
                            indices.push(index + 4);

                            // top disk segment
                            indices.push(index + 2);
                            indices.push(index + 6);
                            indices.push(index + 14);

                            indices.push(index + 2);
                            indices.push(index + 14);
                            indices.push(index + 10);
                        }

                    } else {
                        //
                        // Create a solid disk without a hole in the middle.
                        //

                        for (var ringNum = 0; ringNum < rings; ringNum++) {

                            if (ringNum + 1 > ringLimit) {
                                index = 2 + (ringNum + 1) * 4;    // the first after the regular vertices

                                // start cap
                                indices.push(index);
                                indices.push(index + 4);
                                indices.push(index + 5);

                                indices.push(index + 0);
                                indices.push(index + 5);
                                indices.push(index + 1);

                                // end cap
                                indices.push(index + 2);
                                indices.push(index + 7);
                                indices.push(index + 6);

                                indices.push(index + 2);
                                indices.push(index + 3);
                                indices.push(index + 7);

                                break;
                            }

                            //
                            //  generate the two outer-facing triangles for each ring segment
                            //

                            var index = ringNum * 4 + 2;

                            // outer ring segment quad
                            indices.push(index + 1);
                            indices.push(index + 3);
                            indices.push(index + 7);

                            indices.push(index + 1);
                            indices.push(index + 7);
                            indices.push(index + 5);

                            // bottom disk segment
                            indices.push(index);
                            indices.push(0);
                            indices.push(index + 4);

                            // top disk segment
                            indices.push(index + 2);
                            indices.push(1);
                            indices.push(index + 6);
                        }
                    }

                    return {
                        primitive:"triangles",
                        positions:positions,
                        normals:normals,
                        uv:uv,
                        indices:indices
                    };
                };
        }
        )
        ()
        )
        ;
