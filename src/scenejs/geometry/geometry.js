new (function() {

    var canvas;
    var canvasGeos = {};                   // Geometry map for each canvas
    var currentGeos = null;
    var geoStack = [];
    var stackLen = 0;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                canvas = params.canvas;
                if (!canvasGeos[canvas.canvasId]) {      // Lazy-create geometry map for canvas
                    canvasGeos[canvas.canvasId] = new SceneJS_Map();
                }
                currentGeos = canvasGeos[canvas.canvasId];
                stackLen = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                for (var canvasId in canvasGeos) {    // Destroy geometries on all canvases
                    if (canvasGeos.hasOwnProperty(canvasId)) {
                        var geoMap = canvasGeos[canvasId].items;
                        for (var resource in geoMap) {
                            if (geoMap.hasOwnProperty(resource)) {
                                var geometry = geoMap[resource];
                                destroyVBOs(geometry);
                            }
                        }
                    }
                }
                canvas = null;
                canvasGeos = {};
                currentGeos = null;
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
        var geoMap = canvasGeos[geo.canvas.canvasId];
        if (geoMap) {
            geoMap.removeItem(geo.resource);
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

    function createGeometry(resource, source, callback) {
        if (typeof source == "string") {

            /* Load from stream
             */
            var geoService = SceneJS.Services.getService(SceneJS.Services.GEO_LOADER_SERVICE_ID);
            var self = this;

            /* http://scenejs.wikispaces.com/GeoLoaderService
             */
            geoService.loadGeometry(source,
                    function(data) {
                        callback(_createGeometry(resource, data));
                    });
        } else {

            if (resource) {  // Attempt to reuse a geo resource
                var geo = currentGeos.items[resource];
                if (geo) {
                    geo._resourceCount++;
                    return { canvasId: canvas.canvasId, resource: geo.resource, arrays: geo.arrays };
                }
            }

            /* Arrays specified
             */
            var data = createTypedArrays(source);
            data.primitive = source.primitive;
            return _createGeometry(resource, data);
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

    function _createGeometry(resource, data) {

        if (!data.primitive) { // "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "SceneJS.geometry node property expected : primitive");
        }
        var context = canvas.context;
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
                canvas : canvas,
                context : context,
                vertexBuf : vertexBuf,
                normalBuf : normalBuf,
                indexBuf : indexBuf,
                uvBuf: uvBuf,
                uvBuf2: uvBuf2,
                colorBuf: colorBuf,
                arrays: data,          // Retain the arrays for geometric ops
                _resourceCount : 1     // One user of this geo resource so far
            };
            if (data.positions) {
                // geo.boundary = getBoundary(data.positions);
            }
            geo.resource = resource ? currentGeos.addItem(resource, geo) : currentGeos.addItem(geo);
            return { canvasId: canvas.canvasId, resource: geo.resource, arrays: geo.arrays };
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

    function destroyGeometry(handle) {
        var geos = canvasGeos[handle.canvasId];
        if (!geos) {  // Canvas must have been destroyed - that's OK, will have destroyed geometry as well
            return;
        }
        var geo = geos.items[handle.resource];
        if (!geo) {
            throw SceneJS_errorModule.fatalError("geometry not found: '" + handle.resource + "'");
        }
        if (--geo._resourceCount == 0) {
            destroyVBOs(geo);
        }
    }

    function pushGeometry(id, handle) {
        var geo = currentGeos.items[handle.resource];
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
            SceneJS_renderModule.setGeometry(id, geo);
        }
        geoStack[stackLen++] = geo;
    }

    function getBoundary(positions) {
        var boundary = {
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
            if (x < boundary.xmin) {
                boundary.xmin = x;
            }
            if (y < boundary.ymin) {
                boundary.ymin = y;
            }
            if (z < boundary.zmin) {
                boundary.zmin = z;
            }

            if (x > boundary.xmax) {
                boundary.xmax = x;
            }
            if (y > boundary.ymax) {
                boundary.ymax = y;
            }
            if (z > boundary.zmax) {
                boundary.zmax = z;
            }
        }
        return boundary;
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

    window.SceneJS_geometry = SceneJS.createNodeType("geometry");

    SceneJS_geometry.prototype._init = function(params) {
        this._create = null; // Callback to create geometry
        this._handle = null; // Handle to created geometry
        this._resource = params.resource;       // Optional - can be null
        if (params.create instanceof Function) { // Factory function
            this._create = params.create;
        } else if (params.stream) { // Stream
            this._stream = params.stream;
        } else { // Arrays
            this.attr.positions = params.positions || [];
            this.attr.normals = params.normals || [];
            this.attr.colors = params.colors || [];
            this.attr.indices = params.indices || [];
            this.attr.uv = params.uv || [];
            this.attr.uv2 = params.uv2 || [];
            this.attr.primitive = params.primitive || "triangles";
        }
    };

    SceneJS_geometry.prototype.getStream = function() {
        return this._stream;
    };

    SceneJS_geometry.prototype.getPositions = function() {
        return this._getArrays().positions;
    };

    SceneJS_geometry.prototype.getNormals = function() {
        return this._getArrays().normals;
    };

    SceneJS_geometry.prototype.getColors = function() {
        return this._getArrays().colors;
    };

    SceneJS_geometry.prototype.getIndices = function() {
        return this._getArrays().indices;
    };

    SceneJS_geometry.prototype.getUv = function() {
        return this._getArrays().uv;
    };

    SceneJS_geometry.prototype.getUv2 = function() {
        return this._getArrays().uv2;
    };

    SceneJS_geometry.prototype.getPrimitive = function() {
        return this.attr.primitive;
    };

    SceneJS_geometry.prototype._getArrays = function() {
        if (this.attr.positions) {
            return this.attr;
        } else {
            if (!this._handle) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.NODE_ILLEGAL_STATE,
                        "Invalid node state exception: geometry stream not loaded yet - can't query geometry data yet");
            }
            return this._handle.arrays;
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

    SceneJS_geometry.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    SceneJS_geometry.prototype._preCompile = function() {
        if (!this._handle) { // Geometry VBOs not created yet
            if (this._create) { // Factory function
                var attr = this._create();
                this.attr.positions = attr.positions;
                this.attr.normals = attr.normals;
                this.attr.colors = attr.colors;
                this.attr.indices = attr.indices;
                this.attr.uv = attr.uv;
                this.attr.uv2 = attr.uv2;
                this.attr.primitive = attr.primitive;
                this._handle = createGeometry(this._resource, this.attr);
            } else if (this._stream) { // Stream
                var self = this;
                createGeometry(
                        this._resource,
                        this._stream,
                        function(handle) {
                            self._handle = handle;
                            SceneJS_compileModule.nodeUpdated(self, "loaded"); // Compile again to apply freshly-loaded geometry
                        });
            } else { // Arrays
                this._handle = createGeometry(this._resource, this.attr);
            }
        }
        if (this._handle) {
            pushGeometry(this.attr.id, this._handle);
        }
    };

    SceneJS_geometry.prototype._postCompile = function() {
        if (this._handle) {
            popGeometry();
        }
    };

    SceneJS_geometry.prototype._destroy = function() {
        if (this._handle) { // Not created yet
            destroyGeometry(this._handle);
        }
        this._handle = null;

        /* When destroying scene nodes, we only need to notify the rendering module
         * of each geometry node destruction because that will destroy the display list
         * node associated with the geometry, which will in turn destroy rendering
         * states associated with the display list node, and so on.
         */
        SceneJS_renderModule.removeGeometry(this.scene.attr.id, this.attr.id);
    };
})();