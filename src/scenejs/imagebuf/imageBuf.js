SceneJS.ImageBuf = SceneJS.createNodeType("imageBuf");

// @private
SceneJS.ImageBuf.prototype._init = function(params) {
};

// @private
SceneJS.ImageBuf.prototype._render = function(traversalContext) {

    /* Create image buffer if we don't have one yet
     */
    if (!this._bufId) {
        this._bufId = SceneJS._imageBufModule.createImageBuffer(this._id);
    }

    /* Activate image buffer, render child nodes, deactivate again then restore any
     * previously active image buffer
     */
    SceneJS._imageBufModule.pushImageBuffer(this._bufId);
    this._renderNodes(traversalContext);
    SceneJS._imageBufModule.popImageBuffer();
};


/**
 * Destroys image buffer when this node is destroyed
 * @private
 */
SceneJS.ImageBuf.prototype._destroy = function() {
    if (this._bufId) {
        SceneJS._imageBufModule.destroyImageBuffer(this._bufId);
        this._bufId = null;
    }
};