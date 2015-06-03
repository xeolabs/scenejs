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
                self._buildNodeCore(self._engine.canvas.gl, self._core);
            };

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
        var IndexArrayType = this._engine.canvas.UINT_INDEX_ENABLED ? Uint32Array : Uint16Array;

        core.primitive = this._getPrimitiveType(primitive);

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
        core.arrays = {
            positions: data.positions
                ? new Float32Array((options.scale || options.origin)
                ? this._applyOptions(data.positions, options)
                : data.positions) : undefined,
            normals: data.normals ? new Float32Array(data.normals) : undefined,
            uv: data.uv ? new Float32Array(data.uv) : undefined,
            uv2: data.uv2 ? new Float32Array(data.uv2) : undefined,
            colors: data.colors ? new Float32Array(data.colors) : undefined,
            indices: data.indices ? new IndexArrayType(data.indices) : undefined
        };

        delete data.positions;
        delete data.normals;
        delete data.uv;
        delete data.uv2;
        delete data.indices;
        delete data.colors;

        // Lazy-build tangents, only when needed as rendering
        core.getTangentBuf = function () {
            if (core.tangentBuf) {
                return core.tangentBuf;
            }
            var arrays =  core.arrays;
            if (arrays.positions && arrays.indices && arrays.uv) {
                var gl = self._engine.canvas.gl;
                var tangents = new Float32Array(self._buildTangents(arrays)); // Build tangents array;
                core.arrays.tangents = tangents;
                var usage = gl.STATIC_DRAW;
                return core.tangentBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, tangents, tangents.length, 3, usage);
            }
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

        var positions2 = positions.slice ? positions.slice(0) : new Float32Array(positions);  // HACK

        if (options.scale) {

            var scaleX = options.scale.x != undefined ? options.scale.x : 1.0;
            var scaleY = options.scale.y != undefined ? options.scale.y : 1.0;
            var scaleZ = options.scale.z != undefined ? options.scale.z : 1.0;

            for (var i = 0, len = positions2.length; i < len; i += 3) {
                positions2[i    ] *= scaleX;
                positions2[i + 1] *= scaleY;
                positions2[i + 2] *= scaleZ;
            }
        }

        if (options.origin) {

            var originX = options.origin.x != undefined ? options.origin.x : 0.0;
            var originY = options.origin.y != undefined ? options.origin.y : 0.0;
            var originZ = options.origin.z != undefined ? options.origin.z : 0.0;

            for (var i = 0, len = positions2.length; i < len; i += 3) {
                positions2[i    ] -= originX;
                positions2[i + 1] -= originY;
                positions2[i + 2] -= originZ;
            }
        }

        return positions2;
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

        if (core.uvBuf) {
            core.uvBuf.destroy();
            core.uvBuf = null;
        }

        if (core.uvBuf2) {
            core.uvBuf2.destroy();
            core.uvBuf2 = null;
        }

        if (core.colorBuf) {
            core.colorBuf.destroy();
            core.colorBuf = null;
        }

        if (core.tangentBuf) {
            core.tangentBuf.destroy();
            core.tangentBuf = null;
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

        var usage = gl.STATIC_DRAW; //var usage = (!arrays.fixed) ? gl.STREAM_DRAW : gl.STATIC_DRAW;

        try { // TODO: Modify usage flags in accordance with how often geometry is evicted

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

            if (arrays.uv) {
                if (canInterleave) {
                    core.interleavedUVOffset = prepareInterleaveBuffer(arrays.uv, 2);
                }
                core.uvBuf = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.uv, arrays.uv.length, 2, usage);
            }

            if (arrays.uv2) {
                if (canInterleave) {
                    core.interleavedUV2Offset = prepareInterleaveBuffer(arrays.uv2, 2);
                }
                core.uvBuf2 = new SceneJS._webgl.ArrayBuffer(gl, gl.ARRAY_BUFFER, arrays.uv2, arrays.uv2.length, 2, usage);
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

        var normals = new Array(positions.length);

        // now go through and average out everything
        for (var i = 0, len = nvecs.length; i < len; i++) {
            var count = nvecs[i].length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvecs[i][j][0];
                y += nvecs[i][j][1];
                z += nvecs[i][j][2];
            }
            normals[i * 3 + 0] = (x / count);
            normals[i * 3 + 1] = (y / count);
            normals[i * 3 + 2] = (z / count);
        }

        data.normals = normals;
    };


    /**
     * Builds vertex tangent vectors from positions, UVs and indices
     *
     * Based on code by @rollokb, in his fork of webgl-obj-loader:
     * https://github.com/rollokb/webgl-obj-loader
     *
     * @private
     **/
    SceneJS.Geometry.prototype._buildTangents = function (arrays) {

        var positions = arrays.positions;
        var indices = arrays.indices;
        var uv = arrays.uv;

        var tangents = [];

        // The vertex arrays needs to be calculated
        // before the calculation of the tangents

        for (var location = 0; location < indices.length; location += 3) {

            // Recontructing each vertex and UV coordinate into the respective vectors

            var index = indices[location];

            var v0 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv0 = [uv[index * 2], uv[(index * 2) + 1]];

            index = indices[location + 1];

            var v1 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv1 = [uv[index * 2], uv[(index * 2) + 1]];

            index = indices[location + 2];

            var v2 = [positions[index * 3], positions[(index * 3) + 1], positions[(index * 3) + 2]];
            var uv2 = [uv[index * 2], uv[(index * 2) + 1]];

            var deltaPos1 = SceneJS_math_subVec3(v1, v0, []);
            var deltaPos2 = SceneJS_math_subVec3(v2, v0, []);

            var deltaUV1 = SceneJS_math_subVec2(uv1, uv0, []);
            var deltaUV2 = SceneJS_math_subVec2(uv2, uv0, []);

            var r = 1 / ((deltaUV1[0] * deltaUV2[1]) - (deltaUV1[1] * deltaUV2[0]));

            var tangent = SceneJS_math_mulVec3Scalar(
                SceneJS_math_subVec3(
                    SceneJS_math_mulVec3Scalar(deltaPos1, deltaUV2[1], []),
                    SceneJS_math_mulVec3Scalar(deltaPos2, deltaUV1[1], []),
                    []
                ),
                r,
                []
            );

            // Average the value of the vectors outs
            for (var v = 0; v < 3; v++) {
                var addTo = indices[location + v];
                if (typeof tangents[addTo] != "undefined") {
                    tangents[addTo] = SceneJS_math_addVec3(tangents[addTo], tangent, []);
                } else {
                    tangents[addTo] = tangent;
                }
            }
        }

        // Deconstruct the vectors back into 1D arrays for WebGL

        var tangents2 = [];

        for (var i = 0; i < tangents.length; i++) {
            tangents2 = tangents2.concat(tangents[i]);
        }

        return tangents2;
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

    SceneJS.Geometry.prototype.getIndices = function () {
        return this._core.arrays ? this._core.arrays.indices : null;
    };

    SceneJS.Geometry.prototype.setUV = function (data) {
        if (data.uv && this._core.uvBuf) {
            var core = this._core;
            core.uvBuf.bind();
            core.uvBuf.setData(new Float32Array(data.uv), data.uvOffset || 0);
            core.arrays.uv.set(data.uv, data.uvOffset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getUV = function () {
        return this._core.arrays ? this._core.arrays.uv : null;
    };

    SceneJS.Geometry.prototype.setUV2 = function (data) {
        if (data.uv2 && this._core.uv2Buf) {
            var core = this._core;
            core.uv2Buf.bind();
            core.uv2Buf.setData(new Float32Array(data.uv2), data.uv2Offset || 0);
            core.arrays.uv2.set(data.uv2, data.uv2Offset || 0);
            this._engine.display.imageDirty = true;
            if (core.interleavedBuf) {
                core.interleavedBuf.dirty = true;
            }
        }
    };

    SceneJS.Geometry.prototype.getUV2 = function () {
        return this._core.arrays ? this._core.arrays.uv2 : null;
    };

    SceneJS.Geometry.prototype.getPrimitive = function () {
        return this.primitive;
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

        if (core.indexBuf) { // Can only render when we have indices

            core.hash = ([                           // Safe to build geometry hash here - geometry is immutable
                core.normalBuf ? "t" : "f",
                core.arrays && core.arrays.tangents ? "t" : "f",
                core.uvBuf ? "t" : "f",
                core.uvBuf2 ? "t" : "f",
                core.colorBuf ? "t" : "f",
                core.primitive
            ]).join("");

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
    };

    SceneJS.Geometry.prototype._inheritVBOs = function (core) {

        var core2 = {
            primitive: core.primitive,
            boundary: core.boundary,
            normalBuf: core.normalBuf,
            uvBuf: core.uvBuf,
            uvBuf2: core.uvBuf2,
            colorBuf: core.colorBuf,
            interleavedBuf: core.interleavedBuf,
            indexBuf: core.indexBuf,
            interleavedStride: core.interleavedStride,
            interleavedPositionOffset: core.interleavedPositionOffset,
            interleavedNormalOffset: core.interleavedNormalOffset,
            interleavedUVOffset: core.interleavedUVOffset,
            interleavedUV2Offset: core.interleavedUV2Offset,
            interleavedColorOffset: core.interleavedColorOffset
        };

        for (var i = stackLen - 1; i >= 0; i--) {
            if (coreStack[i].vertexBuf) {
                core2.vertexBuf = coreStack[i].vertexBuf;
                core2.boundary = coreStack[i].boundary;
                core2.normalBuf = coreStack[i].normalBuf;
                core2.uvBuf = coreStack[i].uvBuf;           // Vertex and UVs are a package
                core2.uvBuf2 = coreStack[i].uvBuf2;
                core2.colorBuf = coreStack[i].colorBuf;
                core2.interleavedBuf = coreStack[i].interleavedBuf;
                core2.interleavedStride = coreStack[i].interleavedStride;
                core2.interleavedPositionOffset = coreStack[i].interleavedPositionOffset;
                core2.interleavedNormalOffset = coreStack[i].interleavedNormalOffset;
                core2.interleavedUVOffset = coreStack[i].interleavedUVOffset;
                core2.interleavedUV2Offset = coreStack[i].interleavedUV2Offset;
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
        }
    };

    SceneJS.Geometry.prototype._destroyNodeCore = function () {

        if (document.getElementById(this._engine.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            destroyBuffers(this._core);
        }
    };

})();
