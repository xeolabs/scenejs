/** Buffer for vertices and indices
 *
 * @private
 * @param gl  WebGL gl
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */

SceneJS._webgl.ArrayBuffer = function (gl, type, values, numItems, itemSize, usage) {

    /**
     * True when this buffer is allocated and ready to go
     * @type {boolean}
     */
    this.allocated = false;

    var itemType = values.constructor == Uint8Array   ? gl.UNSIGNED_BYTE :
                   values.constructor == Uint16Array  ? gl.UNSIGNED_SHORT :
                   values.constructor == Uint32Array  ? gl.UNSIGNED_INT :
                                                        gl.FLOAT;

    this.gl = gl;
    this.type = type;
    this.itemType = itemType;
    this.numItems = numItems;
    this.itemSize = itemSize;
    this.usage = usage;
    this._allocate(values, numItems);
};

/**
 * Allocates this buffer
 *
 * @param values
 * @param numItems
 * @private
 */
SceneJS._webgl.ArrayBuffer.prototype._allocate = function (values, numItems) {
    this.allocated = false;
    this.handle = this.gl.createBuffer();
    if (!this.handle) {
        throw SceneJS_error.fatalError(SceneJS.errors.OUT_OF_VRAM, "Failed to allocate WebGL ArrayBuffer");
    }
    if (this.handle) {
        this.gl.bindBuffer(this.type, this.handle);
        this.gl.bufferData(this.type, values, this.usage);
        this.gl.bindBuffer(this.type, null);
        this.numItems = numItems;
        this.length = values.length;
        this.allocated = true;
    }
};

/**
 * Updates values within this buffer, reallocating if needed
 *
 * @param data
 * @param offset
 */
SceneJS._webgl.ArrayBuffer.prototype.setData = function (data, offset) {
    if (!this.allocated) {
        return;
    }
    if (data.length > this.length) {
        // Needs reallocation
        this.destroy();
        this._allocate(data, data.length);
    } else {
        // No reallocation needed
        if (offset || offset === 0) {
            this.gl.bufferSubData(this.type, offset, data);
        } else {
            this.gl.bufferData(this.type, data);
        }
    }
};

/**
 * Unbinds this buffer on WebGL
 */
SceneJS._webgl.ArrayBuffer.prototype.unbind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, null);
};

/**
 * Destroys this buffer
 */
SceneJS._webgl.ArrayBuffer.prototype.destroy = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.deleteBuffer(this.handle);
    this.handle = null;
    this.allocated = false;
};


SceneJS._webgl.ArrayBuffer.prototype.bind = function () {
    if (!this.allocated) {
        return;
    }
    this.gl.bindBuffer(this.type, this.handle);
};


