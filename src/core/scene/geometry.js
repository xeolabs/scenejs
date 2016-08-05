new (function () {

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function () {
            stackLen = 0;
        });

    /**
     * @class Scene graph node that defines geometry.
     * @extends SceneJS.Node
     * When this node is at a leaf, it defines a scene object which inherits the state set up by all the nodes above it
     * on the path up to the root. These nodes can be nested, so that child geometries inherit arrays
     * defined by parent geometries.
     */
    SceneJS.Geometry = SceneJS_NodeFactory.createNodeType("geometry");

    SceneJS.Geometry.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the core

            this._initNodeCore(params, {
                origin: params.origin,
                scale: params.scale,
                autoNormals: params.normals == "auto"
            });

            this._buildNodeCore(this._engine.canvas.gl, this._core);

            var self = this;

            this._core.webglRestored = function () {

                // Ensure that we recreate these in subsequent calls to
                // core.getTangents and core.getPickPositions
                self._core.tangentBufs = null;
                self._core.pickPositionsBuf = null;

                self._buildNodeCore(self._engine.canvas.gl, self._core);
            };

            this._engine.stats.memory.meshes++;
        }
    };

    /**
     * Convert JSON arrays into typed arrays,
     * apply optional baked Model-space transforms to positions
     */
    SceneJS.Geometry.prototype._initNodeCore = function (data, options) {

        var self = this;

        options = options || {};

        var primitive = data.primitive || "triangles";
        var core = this._core;
        var IndexArrayType = SceneJS.WEBGL_INFO.SUPPORTED_EXTENSIONS["OES_element_index_uint"] ? Uint32Array : Uint16Array;

        core.primitive = this._getPrimitiveType(primitive);
        core.primitiveName = primitive;
        core.pointSize = data.pointSize || 1;

        // Generate normals
        if (data.normals) {
            if (primitive == "triangles") {
                if (data.normals === "auto" || data.normals === true) {
                    if (data.positions && data.indices) {
                        this._buildNormals(data); // Auto normal generation - build normals array
                    }
                }
            }
        }

        // Create typed arrays, apply any baked transforms
        core.arrays = {};

        if (data.positions) {
            if (data.positions.constructor != Float32Array) {
                data.positions = new Float32Array(data.positions);
            }

            if (options.scale || options.origin) {
                this._applyOptions(data.positions, options)
            }

            core.arrays.positions = data.positions;
            this._engine.stats.memory.positions += data.positions.length / 3;
        }

        if (data.normals) {
            if (data.normals.constructor != Float32Array) {
                data.normals = new Float32Array(data.normals);
            }

            core.arrays.normals = data.normals;
            this._engine.stats.memory.normals += data.normals.length / 3;
        }

        if (data.uvs) {
            var uvs = data.uvs;
            var uv;
            for (var i = 0, len = uvs.length; i < len; i++) {
                uv = uvs[i];
                if (uv.constructor != Float32Array) {
                    uvs[i] = new Float32Array(uvs[i]);
                }
                this._engine.stats.memory.uvs += uv.length / 2;
            }
            core.arrays.uvs = uvs;
        }

        // ---------------- Backward-compatibility -------------------

        if (data.uv) {
            if (data.uv.constructor != Float32Array) {
                data.uv = new Float32Array(data.uv);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[0] = data.uv;
            this._engine.stats.memory.uvs += data.uv.length / 2;
        }

        if (data.uv1) {
            if (data.uv1.constructor != Float32Array) {
                data.uv1 = new Float32Array(data.uv1);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[1] = data.uv1;
            this._engine.stats.memory.uvs += data.uv1.length / 2;
        }

        if (data.uv2) {
            if (data.uv2.constructor != Float32Array) {
                data.uv2 = new Float32Array(data.uv2);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[2] = data.uv2;
            this._engine.stats.memory.uvs += data.uv2.length / 2;
        }

        if (data.uv3) {
            if (data.uv3.constructor != Float32Array) {
                data.uv3 = new Float32Array(data.uv3);
            }
            if (!core.arrays.uvs) {
                core.arrays.uvs = [];
            }
            core.arrays.uvs[3] = data.uv3;
            this._engine.stats.memory.uvs += data.uv3.length / 2;
        }

        // ----------------------------------------------------------

        if (core.arrays.normals && core.arrays.uvs) {
            core.arrays.tangents = [];
        }

        if (data.colors) {
            if (data.colors.constructor != Float32Array) {
                data.colors = new Float32Array(data.colors);
            }

            core.arrays.colors = data.colors;
            this._engine.stats.memory.colors += data.colors.length / 4;
        }

        if (data.indices) {
            if (data.indices.constructor != Uint8Array &&
                data.indices.constructor != Uint16Array &&
                data.indices.constructor != Uint32Array)
            {
                data.indices = new IndexArrayType(data.indices);
            }

            core.arrays.indices = data.indices;
            this._engine.stats.memory.indices += data.indices.length;
        }

        // Lazy-build tangents, only when needed as rendering
        core.getTangents = function (uvLayerIdx) {

            // We're only allowed one normal map per drawable, but we'll
            // cache tangents for each UV layer. In practice the cache would
            // only contain one array of tangents, for the UV layer that
            // happens to be used for normal mapping.

            if (!core.tangentBufs) {
                core.tangentBufs = [];
            }
            if (core.tangentBufs[uvLayerIdx]) {
                return core.tangentBufs[uvLayerIdx];
            }
            var arrays = core.arrays;
            var tangents = core.arrays.tangents[uvLayerIdx];
            if (!tangents) {
                // Retaining tangents data after WebGL context recovery
                if (arrays.positions && arrays.indices && arrays.uvs && arrays.uvs[uvLayerIdx]) {
                    var gl = self._engine.canvas.gl;
                    tangents = new Float32Array(SceneJS_math_buildTangents(arrays.positions, arrays.indices, arrays.uvs[uvLayerIdx])); // Build tangents array;
                    core.arrays.tangents[uvLayerIdx] = tangents;
                }
            }
            if (tangents) {
                return core.tangentBufs[uvLayerIdx] = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, tangents, tangents.length, 3, gl.STATIC_DRAW);
            } else {
                return null;
            }
        };

        // Buffers for primitive-pick rendering

        core.getPickPositions = function () {
            if (core.pickPositionsBuf) {
                return core.pickPositionsBuf;
            }

            createPickArrays();

            return core.pickPositionsBuf;
        };

        core.getPickColors = function () {
            if (core.pickColorsBuf) {
                return core.pickColorsBuf;
            }

            createPickArrays();

            return core.pickColorsBuf;
        };

        function createPickArrays() {
            var gl = self._engine.canvas.gl;

            var pickArrays, pickPositions, pickColors;

            if (core.arrays.positions) {
                pickArrays = SceneJS_math_getPickPrimitives(core.arrays.positions, core.arrays.indices);
                pickPositions = pickArrays.positions;
                pickColors = pickArrays.colors;
                core.pickPositionsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickPositions, pickPositions.length, 3, gl.STATIC_DRAW);
            } else {
                pickColors = SceneJS_math_getPickColors(core.arrays.indices);
            }

            core.pickColorsBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, pickColors, pickColors.length, 4, gl.STATIC_DRAW);
        }
    };


    /**
     * Returns WebGL constant for primitive name
     */
    SceneJS.Geometry.prototype._getPrimitiveType = function (primitive) {

        var gl = this._engine.canvas.gl;

        switch (primitive) {

            case "points":
                return gl.POINTS;

            case "lines":
                return gl.LINES;

            case "line-loop":
                return gl.LINE_LOOP;

            case "line-strip":
                return gl.LINE_STRIP;

            case "triangles":
                return gl.TRIANGLES;

            case "triangle-strip":
                return gl.TRIANGLE_STRIP;

            case "triangle-fan":
                return gl.TRIANGLE_FAN;

            default:
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "geometry primitive unsupported: '" +
                    primitive +
                    "' - supported types are: 'points', 'lines', 'line-loop', " +
                    "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'");
        }
    };

    /**
     * Apply baked Model-space transformations to give position array
     */
    SceneJS.Geometry.prototype._applyOptions = function (positions, options) {

        if (options.scale) {

            var scaleX = options.scale.x != undefined ? options.scale.x : 1.0;
            var scaleY = options.scale.y != undefined ? options.scale.y : 1.0;
            var scaleZ = options.scale.z != undefined ? options.scale.z : 1.0;

            for (var i = 0, len = positions.length; i < len; i += 3) {
                positions[i] *= scaleX;
                positions[i + 1] *= scaleY;
                positions[i + 2] *= scaleZ;
            }
        }

        if (options.origin) {

            var originX = options.origin.x != undefined ? options.origin.x : 0.0;
            var originY = options.origin.y != undefined ? options.origin.y : 0.0;
            var originZ = options.origin.z != undefined ? options.origin.z : 0.0;

            for (var i = 0, len = positions.length; i < len; i += 3) {
                positions[i] -= originX;
                positions[i + 1] -= originY;
                positions[i + 2] -= originZ;
            }
        }

        return positions;
    };

    /**
     * Destroy vertex buffers associated with given core
     */
    var destroyBuffers = function (core) {
        if (core.vertexBuf) {
            core.vertexBuf.destroy();
            core.vertexBuf = null;
        }

        if (core.normalBuf) {
            core.normalBuf.destroy();
            core.normalBuf = null;
        }

        if (core.uvBufs) {
            var uvBufs = core.uvBufs;
            var uvBuf;
            for (var i = 0, len = uvBufs.length; i < len; i++) {
                uvBuf = uvBufs[i];
                if (uvBuf) {
                    uvBuf.destroy();
                }
            }
            core.uvBufs = null;
        }

        if (core.colorBuf) {
            core.colorBuf.destroy();
            core.colorBuf = null;
        }

        if (core.tangentBufs) {
            var tangentBufs = core.tangentBufs;
            var tangentBuf;
            for (var j = 0, lenj = tangentBufs.length; j < lenj; j++) {
                tangentBuf = tangentBufs[j];
                if (tangentBuf) {
                    tangentBuf.destroy();
                }
            }
            core.tangentBufs = null;
        }

        if (core.indexBuf) {
            core.indexBuf.destroy();
            core.indexBuf = null;
        }

        if (core.interleavedBuf) {
            core.interleavedBuf.destroy();
            core.interleavedBuf = null;
        }
    };

    /**
     * Allocates WebGL buffers for geometry arrays
     *
     * In addition to initially allocating those, this is called to reallocate them after
     * WebGL context is regained after being lost.
     */
    SceneJS.Geometry.prototype._buildNodeCore = function (gl, core) {

        try { // TODO: Modify usage flags in accordance with how often geometry is evicted
            buildCore(gl, core);
        } catch (e) { // Allocation failure - delete whatever buffers got allocated
            destroyBuffers(core);
            throw SceneJS_error.fatalError(
                SceneJS.errors.ERROR,
                "Failed to allocate geometry: " + e);
        }
    };

    SceneJS.Geometry.prototype._updateArray = function (array, items, offset) {

        var arrayLen = array.length;
        var itemsLen = items.length;

        if (itemsLen + offset > arrayLen) {
            itemsLen -= (itemsLen + offset) - arrayLen;
        }

        for (var i = offset, j = 0; j < itemsLen; i++, j++) {
            array[i] = items[j];
        }

    };

    /** Builds normal vectors from positions and indices
     * @private
     */
    SceneJS.Geometry.prototype._buildNormals = function (data) {

        var positions = data.positions;
        var indices = data.indices;
        var nvecs = new Array(positions.length / 3);
        var j0;
        var j1;
        var j2;
        var v1;
        var v2;
        var v3;

        for (var i = 0, len = indices.length - 3; i < len; i += 3) {
            j0 = indices[i + 0];
            j1 = indices[i + 1];
            j2 = indices[i + 2];

            v1 = [positions[j0 * 3 + 0], positions[j0 * 3 + 1], positions[j0 * 3 + 2]];
            v2 = [positions[j1 * 3 + 0], positions[j1 * 3 + 1], positions[j1 * 3 + 2]];
            v3 = [positions[j2 * 3 + 0], positions[j2 * 3 + 1], positions[j2 * 3 + 2]];

            v2 = SceneJS_math_subVec4(v2, v1, [0, 0, 0, 0]);
            v3 = SceneJS_math_subVec4(v3, v1, [0, 0, 0, 0]);

            var n = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(v2, v3, [0, 0, 0, 0]), [0, 0, 0, 0]);

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Float32Array(positions.length);

        // now go through and average out everything
        for (var i = 0, len = nvecs.length; i < len; i++) {
            var nvec = nvecs[i];
            if (!nvec) {
                continue;
            }
            var count = nvec.length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvec[j][0];
                y += nvec[j][1];
                z += nvec[j][2];
            }
            normals[i * 3 + 0] = (x / count);
            normals[i * 3 + 1] = (y / count);
            normals[i * 3 + 2] = (z / count);
        }

        data.normals = normals;
        this._engine.stats.memory.normals += normals.length / 3;
    };

    SceneJS.Geometry.prototype.setSource = function (sourceConfigs) {
        this._sourceConfigs = sourceConfigs;
        var source = this._source;
        if (source && source.configure) {
            source.configure(sourceConfigs);
        }
    };

    SceneJS.Geometry.prototype.getSource = function () {
        return this._sourceConfigs || {};
    };

    SceneJS.Geometry.prototype.setPositions = function (data) {
        if (data.positions && this._core.vertexBuf) {
            this._boundary = null;
            var core = this._core;
            core.vertexBuf.bind();
            core.vertexBuf.setData(new Float32Array(data.positions), data.positionsOffset || 0);
            core.arrays.positions.set(data.positions, data.positionsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getPositions = function () {
        return this._core.arrays ? this._core.arrays.positions : null;
    };

    SceneJS.Geometry.prototype.setNormals = function (data) {
        if (data.normals && this._core.normalBuf) {
            var core = this._core;
            core.normalBuf.bind();
            core.normalBuf.setData(new Float32Array(data.normals), data.normalsOffset || 0);
            core.arrays.normals.set(data.normals, data.normalsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getNormals = function () {
        return this._core.arrays ? this._core.arrays.normals : null;
    };

    SceneJS.Geometry.prototype.setColors = function (data) {
        if (data.colors && this._core.colorBuf) {
            var core = this._core;
            core.colorBuf.bind();
            core.colorBuf.setData(new Float32Array(data.colors), data.colorsOffset || 0);
            core.arrays.colors.set(data.colors, data.colorsOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getColors = function () {
        return this._core.arrays ? this._core.arrays.colors : null;
    };

    SceneJS.Geometry.prototype.setIndices = function (data) {
        if (data.indices && this._core.indexBuf) {
            this._boundary = null;
            var core = this._core;
            core.indexBuf.bind();

            // Make sure indices remain of the same type.
            if (data.indices.constructor != core.arrays.indices.constructor) {
                data.indices = new core.arrays.indices.constructor(data.indices);
            }

            core.indexBuf.setData(data.indices, data.indicesOffset || 0);
            core.arrays.indices.set(data.indices, data.indicesOffset || 0);
            this._engine.display.imageDirty = true;
        }
    };

    SceneJS.Geometry.prototype.getIndices = function () {
        return this._core.arrays ? this._core.arrays.indices : null;
    };

    SceneJS.Geometry.prototype.getUV = function () {
        return this._core.arrays ? this._core.arrays.uvs[0] : null;
    };

    SceneJS.Geometry.prototype.getUV2 = function () {
        return this._core.arrays ? this._core.arrays.uvs[1] : null;
    };

    SceneJS.Geometry.prototype.getUV2 = function () {
        return this._core.arrays ? this._core.arrays.uvs[2] : null;
    };

    SceneJS.Geometry.prototype.getUv3 = function () {
        return this._core.arrays ? this._core.arrays.uvs[3] : null;
    };

    SceneJS.Geometry.prototype.getPrimitive = function () {
        return this.primitive;
    };

    SceneJS.Geometry.prototype.getPointSize = function () {
        return this._core.pointSize;
    };

    SceneJS.Geometry.prototype.setPointSize = function (size) {
        if (size && this._core.pointSize !== size) {
            this._core.pointSize = size;
            this._engine.display.imageDirty = true;
        }
    };

    /** Returns the Model-space boundary of this geometry
     *
     * @returns {*}
     */
    SceneJS.Geometry.prototype.getBoundary = function () {
        if (this._boundary) {
            return this._boundary;
        }

        var arrays = this._core.arrays;

        if (!arrays) {
            return null;
        }

        var positions = arrays.positions;

        if (!positions) {
            return null;
        }

        this._boundary = {
            xmin: SceneJS_math_MAX_DOUBLE,
            ymin: SceneJS_math_MAX_DOUBLE,
            zmin: SceneJS_math_MAX_DOUBLE,
            xmax: SceneJS_math_MIN_DOUBLE,
            ymax: SceneJS_math_MIN_DOUBLE,
            zmax: SceneJS_math_MIN_DOUBLE
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

    SceneJS.Geometry.prototype._compile = function (ctx) {

        if (this._core._loading) { // TODO: Breaks with asynch loaded cores - this node needs to recompile when target core is loaded
            this._compileNodes(ctx);
            return;
        }

        var core = this._core;

        if (!core.vertexBuf) {

            /* SceneJS.Geometry has no vertex buffer - it must be therefore be indexing a vertex/uv buffers defined
             * by a higher Geometry, as part of a composite geometry:
             *
             * It must therefore inherit the vertex buffer, along with UV coord buffers.
             *
             * We'll leave it to the render state graph traversal to ensure that the
             * vertex and UV buffers are not needlessly rebound for this geometry.
             */
            core = this._inheritVBOs(core);
        }

        if (core.indexBuf || core.primitiveName === "points") { // Can only render when we have indices or are drawing points

            var parts = [                           // Safe to build geometry hash here - geometry is immutable
                core.normalBuf ? "t" : "f",
                core.arrays && core.arrays.tangents ? "t" : "f",
                core.colorBuf ? "t" : "f",
                core.primitive
            ];

            // Hash parts for UVs

            parts.push(";uvs");
            var uvBufs = core.uvBufs;
            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    parts.push(uvBufs[i] ? "t" : "f");
                }
            }

            core.hash = parts.join("");

            core.stateId = this._core.stateId;
            core.type = "geometry";

            this._engine.display.geometry = coreStack[stackLen++] = core;

            SceneJS_events.fireEvent(SceneJS_events.OBJECT_COMPILING, { // Pull in state updates from scenes nodes
                display: this._engine.display
            });

            this._engine.display.buildObject(this.id); // Use node ID since we may inherit from many cores

        } else {
            coreStack[stackLen++] = this._core;
        }

        this._compileNodes(ctx);

        stackLen--;
        coreStack[stackLen] = null; // Release memory
    };

    SceneJS.Geometry.prototype._inheritVBOs = function (core) {

        var core2 = {
            arrays: core.arrays,
            primitive: core.primitive,
            primitiveName: core.primitiveName,
            boundary: core.boundary,
            normalBuf: core.normalBuf,
            uvBufs: core.uvBufs,
            colorBuf: core.colorBuf,
            interleavedBuf: core.interleavedBuf,
            indexBuf: core.indexBuf,
            interleavedStride: core.interleavedStride,
            interleavedPositionOffset: core.interleavedPositionOffset,
            interleavedNormalOffset: core.interleavedNormalOffset,
            interleavedUVOffsets: core.interleavedUVOffsets,
            interleavedColorOffset: core.interleavedColorOffset,
            getPickIndices: core.getPickIndices,
            getPickPositions: core.getPickPositions,
            getPickColors: core.getPickColors
        };

        for (var i = stackLen - 1; i >= 0; i--) {
            if (coreStack[i].vertexBuf) {
                core2.vertexBuf = coreStack[i].vertexBuf;
                core2.boundary = coreStack[i].boundary;
                core2.normalBuf = coreStack[i].normalBuf;
                core2.uvBufs = coreStack[i].uvBufs;           // Vertex and UVs are a package
                core2.colorBuf = coreStack[i].colorBuf;
                core2.interleavedBuf = coreStack[i].interleavedBuf;
                core2.interleavedStride = coreStack[i].interleavedStride;
                core2.interleavedPositionOffset = coreStack[i].interleavedPositionOffset;
                core2.interleavedNormalOffset = coreStack[i].interleavedNormalOffset;
                core2.interleavedUVOffsets = coreStack[i].interleavedUVOffsets;
                core2.interleavedColorOffset = coreStack[i].interleavedColorOffset;
                return core2;
            }
        }

        return core2;
    };

    SceneJS.Geometry.prototype._destroy = function () {

        this._engine.display.removeObject(this.id);

        /* Destroy core if no other references
         */
        if (this._core.useCount == 1) {

            this._destroyNodeCore();

            if (this._source && this._source.destroy) {
                this._source.destroy();
            }

            this._engine.stats.memory.meshes--;
        }
    };

    SceneJS.Geometry.prototype._destroyNodeCore = function () {

        if (document.getElementById(this._engine.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            destroyBuffers(this._core);
        }

        var arrays = this._core.arrays;

        if (arrays.positions) {
            this._engine.stats.memory.positions -= arrays.positions.length / 3;
        }
        if (arrays.normals) {
            this._engine.stats.memory.normals -= arrays.normals.length / 3;
        }
        if (arrays.colors) {
            this._engine.stats.memory.colors -= arrays.colors.length / 3;
        }
        if (arrays.uvs && arrays.uvs.length > 0) {
            this._engine.stats.memory.uvs -= arrays.uvs.length * (arrays.uvs[0].length / 2);
        }
        if (arrays.indices) {
            this._engine.stats.memory.indices -= arrays.indices.length;
        }
    };

    function buildCore(gl, core) {
        var usage = gl.STATIC_DRAW;
        var arrays = core.arrays;
        var canInterleave = (SceneJS.getConfigs("enableInterleaving") !== false);
        var dataLength = 0;
        var interleavedValues = 0;
        var interleavedArrays = [];
        var interleavedArrayStrides = [];

        var prepareInterleaveBuffer = function (array, strideInElements) {
            if (dataLength == 0) {
                dataLength = array.length / strideInElements;
            } else if (array.length / strideInElements != dataLength) {
                canInterleave = false;
            }
            interleavedArrays.push(array);
            interleavedArrayStrides.push(strideInElements);
            interleavedValues += strideInElements;
            return (interleavedValues - strideInElements) * 4;
        };

        if (arrays.positions) {
            if (canInterleave) {
                core.interleavedPositionOffset = prepareInterleaveBuffer(arrays.positions, 3);
            }
            core.vertexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.positions, arrays.positions.length, 3, usage);
        }

        if (arrays.normals) {
            if (canInterleave) {
                core.interleavedNormalOffset = prepareInterleaveBuffer(arrays.normals, 3);
            }
            core.normalBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.normals, arrays.normals.length, 3, usage);
        }

        if (arrays.uvs) {

            var uvs = arrays.uvs;
            var offsets;
            var i;
            var len;
            var uv;

            if (canInterleave) {
                core.interleavedUVOffsets = [];
                offsets = core.interleavedUVOffsets;
                for (i = 0, len = uvs.length; i < len; i++) {
                    offsets.push(prepareInterleaveBuffer(arrays.uvs[i], 2));
                }
            }

            core.uvBufs = [];

            for (i = 0, len = uvs.length; i < len; i++) {
                uv = arrays.uvs[i];
                if (uv.length > 0) {
                    core.uvBufs.push(new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, uv, uv.length, 2, usage));
                }
            }
        }

        if (arrays.colors) {
            if (canInterleave) {
                core.interleavedColorOffset = prepareInterleaveBuffer(arrays.colors, 4);
            }
            core.colorBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.colors, arrays.colors.length, 4, usage);
        }

        if (arrays.indices) {
            core.indexBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, arrays.indices, arrays.indices.length, 1, usage);
        }

        if (interleavedValues > 0 && canInterleave) {
            // We'll place the vertex attribute data interleaved in this array.
            // This will enable us to use less bindBuffer calls and make the data
            // efficient to address on the GPU.
            var interleaved = [];

            var arrayCount = interleavedArrays.length;
            for (var i = 0; i < dataLength; ++i) {
                for (var j = 0; j < arrayCount; ++j) {
                    var stride = interleavedArrayStrides[j];
                    for (var k = 0; k < stride; ++k) {
                        interleaved.push(interleavedArrays[j][i * stride + k]);
                    }
                }
            }
            core.interleavedStride = interleavedValues * 4; // in bytes
            core.interleavedBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(interleaved), interleaved.length, interleavedValues, usage);
            core.interleavedBuf.dirty = false;
        }
    }

})();
