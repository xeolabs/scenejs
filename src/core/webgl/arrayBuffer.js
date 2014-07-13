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

    this.gl = gl;
    this.type = type;
    this.itemSize = itemSize;

    this._allocate = function (values, numItems) {
        this.handle = gl.createBuffer();
        this.handle.numItems = numItems;
        this.handle.itemSize = itemSize;
        gl.bindBuffer(type, this.handle);
        gl.bufferData(type, values, usage);
        this.handle.numItems = numItems;
        gl.bindBuffer(type, null);
        this.numItems = numItems;
        this.length = values.length;
    };

    this._allocate(values, numItems);

    this.setData = function (data, offset) {

        if (data.length > this.length) {
            this.destroy();
            this._allocate(data, data.length);

        } else {

            if (offset || offset === 0) {
                gl.bufferSubData(type, offset, data);
            } else {
                gl.bufferData(type, data);
            }
        }
    };

    this.unbind = function () {
        gl.bindBuffer(type, null);
    };

    this.destroy = function () {
        gl.deleteBuffer(this.handle);
    };
};

SceneJS._webgl.ArrayBuffer.prototype.bind = function () {
    this.gl.bindBuffer(this.type, this.handle);
};


