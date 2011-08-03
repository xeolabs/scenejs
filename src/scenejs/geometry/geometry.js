new (function() {

    var geoStack = [];
    var stackLen = 0;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_CREATED,
            function() {
                stackLen = 0;
            });

    function destroyVBOs(geo) {
        if (document.getElementById(geo.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            if (geo.vertexBuf) {
                geo.vertexBuf.destroy();
            }
            if (geo.normalBuf) {
                geo.normalBuf.destroy();
            }
            if (geo.indexBuf) {
                geo.indexBuf.destroy();
            }
            if (geo.uvBuf) {
                geo.uvBuf.destroy();
            }
            if (geo.uvBuf2) {
                geo.uvBuf2.destroy();
            }
            if (geo.colorBuf) {
                geo.colorBuf.destroy();
            }
        }
    }

    function getPrimitiveType(context, primitive) {
        switch (primitive) {
            case "points":
                return context.POINTS;
            case "lines":
                return context.LINES;
            case "line-loop":
                return context.LINE_LOOP;
            case "line-strip":
                return context.LINE_STRIP;
            case "triangles":
                return context.TRIANGLES;
            case "triangle-strip":
                return context.TRIANGLE_STRIP;
            case "triangle-fan":
                return context.TRIANGLE_FAN;
            default:
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "SceneJS.geometry primitive unsupported: '" +
                        primitive +
                        "' - supported types are: 'points', 'lines', 'line-loop', " +
                        "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'");
        }
    }

    function createGeometry(scene, source, callback) {

        if (typeof source == "string") {

            /* Load from stream
             */
            var geoService = SceneJS.Services.getService(SceneJS.Services.GEO_LOADER_SERVICE_ID);
            geoService.loadGeometry(source,
                    function(data) {
                        callback(_createGeometry(scene, data));
                    });
        } else {

            /* Create from arrays
             */
            var data = createTypedArrays(source);
            data.primitive = source.primitive;
            return _createGeometry(scene, data);
        }
    }

    function createTypedArrays(data) {
        return {
            positions: data.positions ? new Float32Array(data.positions) : undefined,
            normals: data.normals ? new Float32Array(data.normals) : undefined,
            uv: data.uv ? new Float32Array(data.uv) : undefined,
            uv2: data.uv2 ? new Float32Array(data.uv2) : undefined,
            colors: data.colors ? new Float32Array(data.colors) : undefined,
            indices: data.indices ? new Int32Array(data.indices) : undefined
        };
    }

    function _createGeometry(scene, data) {

        var context = scene.canvas.context;

        if (!data.primitive) { // "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "SceneJS.geometry node property expected : primitive");
        }
        var usage = context.STATIC_DRAW;
        //var usage = (!data.fixed) ? context.STREAM_DRAW : context.STATIC_DRAW;

        var vertexBuf;
        var normalBuf;
        var uvBuf;
        var uvBuf2;
        var colorBuf;
        var indexBuf;

        try { // TODO: Modify usage flags in accordance with how often geometry is evicted

            if (data.positions && data.positions.length > 0) {
                vertexBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER, data.positions, data.positions.length, 3, usage);
            }
            if (data.normals && data.normals.length > 0) {
                normalBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER, data.normals, data.normals.length, 3, usage);
            }
            if (data.uv && data.uv.length > 0) {
                if (data.uv) {
                    uvBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER, data.uv, data.uv.length, 2, usage);
                }
            }
            if (data.uv2 && data.uv2.length > 0) {
                if (data.uv2) {
                    uvBuf2 = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER, data.uv2, data.uv2.length, 2, usage);
                }
            }
            if (data.colors && data.colors.length > 0) {
                if (data.colors) {
                    colorBuf = new SceneJS_webgl_ArrayBuffer(context, context.ARRAY_BUFFER, data.colors, data.colors.length, 4, usage);
                }
            }
            var primitive;
            if (data.indices && data.indices.length > 0) {
                primitive = getPrimitiveType(context, data.primitive);
                indexBuf = new SceneJS_webgl_ArrayBuffer(context, context.ELEMENT_ARRAY_BUFFER,
                        new Uint16Array(data.indices), data.indices.length, 3, usage);
            }
            var geo = {
                fixed : true, // TODO: support dynamic geometry
                primitive: primitive,
                scene: scene,
                canvas : scene.canvas,
                context : context,
                vertexBuf : vertexBuf,
                normalBuf : normalBuf,
                indexBuf : indexBuf,
                uvBuf: uvBuf,
                uvBuf2: uvBuf2,
                colorBuf: colorBuf,
                arrays: data
            };
            if (data.positions) {
                // geo.boundary = getBoundary(data.positions);
            }

            return geo;
        } catch (e) { // Allocation failure - delete whatever buffers got allocated
            if (vertexBuf) {
                vertexBuf.destroy();
            }
            if (normalBuf) {
                normalBuf.destroy();
            }
            if (uvBuf) {
                uvBuf.destroy();
            }
            if (uvBuf2) {
                uvBuf2.destroy();
            }
            if (colorBuf) {
                colorBuf.destroy();
            }
            if (indexBuf) {
                indexBuf.destroy();
            }
            throw e;
        }
    }

    function destroyGeometry(geo) {
        destroyVBOs(geo);
    }

    function pushGeometry(id, geo) {
        if (!geo.vertexBuf) {

            /* Geometry has no vertex buffer - it must be therefore be indexing a vertex/uv buffers defined
             * by a higher Geometry, as part of a composite geometry:
             *
             * It must therefore inherit the vertex buffer, along with UV coord buffers.
             *
             * We'll leave it to the render state graph traversal to ensure that the
             * vertex and UV buffers are not needlessly rebound for this geometry.
             */
            geo = inheritVertices(geo);
        }
        if (geo.indexBuf) {

            /* We don't render Geometry's that have no index buffer - they merely define
             * vertex/uv buffers that are indexed by sub-Geometry's in a composite geometry
             */
            SceneJS_DrawList.setGeometry(id, geo);
        }
        geoStack[stackLen++] = geo;
    }

    function inheritVertices(geo) {
        var geo2 = {
            primitive: geo.primitive,
            boundary: geo.boundary,
            normalBuf: geo.normalBuf,
            uvBuf: geo.uvBuf,
            uvBuf2: geo.uvBuf2,
            colorBuf: geo.colorBuf,
            indexBuf: geo.indexBuf
        };
        for (var i = stackLen - 1; i >= 0; i--) {
            if (geoStack[i].vertexBuf) {
                geo2.vertexBuf = geoStack[i].vertexBuf;
                geo2.boundary = geoStack[i].boundary;
                geo2.normalBuf = geoStack[i].normalBuf;
                geo2.uvBuf = geoStack[i].uvBuf;           // Vertex and UVs are a package
                geo2.uvBuf2 = geoStack[i].uvBuf2;
                geo2.colorBuf = geoStack[i].colorBuf;
                return geo2;
            }
        }
        return geo2;
    }

    function popGeometry() {
        stackLen--;
    }

    /*----------------------------------------------------------------------------------------------------------------
     * Geometry node
     *---------------------------------------------------------------------------------------------------------------*/

    window.SceneJS_geometry = SceneJS.createNodeType("geometry");

    SceneJS_geometry.prototype._init = function(params) {

        if (this.core._nodeCount == 1) { // This node defines the core

            if (params.create instanceof Function) {

                /* Create using factory function
                 * Expose the arrays on the node
                 */
                var data = params.create();
                SceneJS._apply(createGeometry(this.scene, data), this.core);

            } else if (params.stream) {

                /* Load from stream
                 * TODO: Expose the arrays on the node
                 */
                this._stream = params.stream;
                this.core._loading = true;

                var self = this;
                createGeometry(
                        this.scene,
                        this._stream,
                        function(geo) {
                            SceneJS._apply(geo, self.core);
                            self.core._loading = false;
                            SceneJS_compileModule.nodeUpdated(self, "loaded"); // Compile again to apply freshly-loaded geometry
                        });
            } else {

                /* Create from arrays
                 * Expose the arrays on the node
                 */
                var arrays = {
                    positions : params.positions || [],
                    normals : params.normals || [],
                    colors : params.colors || [],
                    indices : params.indices || [],
                    uv : params.uv || [],
                    uv2 : params.uv2 || [],
                    primitive : params.primitive || "triangles"
                };

                SceneJS._apply(createGeometry(this.scene, arrays), this.core);
            }
        }
    };

    SceneJS_geometry.prototype.getStream = function() {
        return this._stream;
    };

    SceneJS_geometry.prototype.getPositions = function() {
        return this._getArrays().positions;
    };

    SceneJS_geometry.prototype.setPositions = function(params) {
        //    sceneResources["theCanvas"].items["my-geometry"].vertexBuf.setData(new Float32Array(params.positions), params.offset);
        //return this.core.arrays.positions.set(params.positions, params.offset);
    };

    SceneJS_geometry.prototype.getNormals = function() {
        return this._getArrays().normals;
    };

    SceneJS_geometry.prototype.setNormals = function(params) {
        return this._getArrays().normals.set(params.normals, params.offset);
    };

    SceneJS_geometry.prototype.getColors = function() {
        return this._getArrays().colors;
    };

    SceneJS_geometry.prototype.setColors = function(params) {
        return this._getArrays().colors.set(params.colors, params.offset);
    };

    SceneJS_geometry.prototype.getIndices = function() {
        return this._getArrays().indices;
    };

    SceneJS_geometry.prototype.setIndices = function(params) {
        return this._getArrays().colors.set(params.indices, params.offset);
    };

    SceneJS_geometry.prototype.getUv = function() {
        return this._getArrays().uv;
    };

    SceneJS_geometry.prototype.setUv = function(params) {
        return this._getArrays().uv.set(params.uv, params.offset);
    };

    SceneJS_geometry.prototype.getUv2 = function() {
        return this._getArrays().uv2;
    };

    SceneJS_geometry.prototype.setUv2 = function(params) {
        return this._getArrays().uv2.set(params.uv2, params.offset);
    };

    SceneJS_geometry.prototype.getPrimitive = function() {
        return this.attr.primitive;
    };

    SceneJS_geometry.prototype._getArrays = function() {
        if (this.attr.positions) {
            return this.attr;
        } else {
            if (!this.core) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_ILLEGAL_STATE,
                        "Invalid node state exception: geometry stream not loaded yet - can't query geometry data yet");
            }
            return this.core.arrays;
        }
    };

    SceneJS_geometry.prototype.getBoundary = function() {
        if (this._boundary) {
            return this._boundary;
        }
        var positions = this._getArrays().positions;
        this._boundary = {
            xmin : SceneJS_math_MAX_DOUBLE,
            ymin : SceneJS_math_MAX_DOUBLE,
            zmin : SceneJS_math_MAX_DOUBLE,
            xmax : SceneJS_math_MIN_DOUBLE,
            ymax : SceneJS_math_MIN_DOUBLE,
            zmax : SceneJS_math_MIN_DOUBLE
        };
        var x, y, z;
        for (var i = 0, len = positions.length - 2; i < len; i += 3) {
            x = positions[i];
            y = positions[i + 1];
            z = positions[i + 2];

            if (x < this._boundary.xmin) {
                this._boundary.xmin = x;
            }
            if (y < this._boundary.ymin) {
                this._boundary.ymin = y;
            }
            if (z < this._boundary.zmin) {
                this._boundary.zmin = z;
            }
            if (x > this._boundary.xmax) {
                this._boundary.xmax = x;
            }
            if (y > this._boundary.ymax) {
                this._boundary.ymax = y;
            }
            if (z > this._boundary.zmax) {
                this._boundary.zmax = z;
            }
        }
        return this._boundary;
    };

    SceneJS_geometry.prototype._compile = function() {
         if (!this.core._loading) {
            pushGeometry(this.attr.id, this.core);
        }
        this._compileNodes();
          if (!this.core._loading) {
            popGeometry();
        }
    };

    SceneJS_geometry.prototype._destroy = function() {
        if (this.core._nodeCount == 1) { // Last core user
            destroyGeometry(this.core);

            /* When destroying scene nodes, we only need to notify the rendering module
             * of each geometry node destruction because that will destroy the display list
             * node associated with the geometry, which will in turn destroy rendering
             * states associated with the display list node, and so on.
             */
            SceneJS_DrawList.removeGeometry(this.scene.attr.id, this.attr.id);
        }
    };
})();