/**
 * @class Scene graph node which defines a rotation modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Rotate = SceneJS_NodeFactory.createNodeType("rotate");

SceneJS.Rotate.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);
        
        this.setMultOrder(params.multOrder);

        this.setAngle(params.angle);

        this.setXYZ({
            x: params.x,
            y: params.y,
            z: params.z
        });

        var core = this._core;

        this._core.buildMatrix = function() {
            core.matrix = SceneJS_math_rotationMat4v(core.angle * Math.PI / 180.0, [core.x, core.y, core.z]);
        };
    }
};

/**
 * Sets the multiplication order of this node's transform matrix with respect to the parent modeling transform
 * in the scene graph.
 *
 * @param {String} multOrder Mulplication order - "post" and "pre"
 */
SceneJS.Rotate.prototype.setMultOrder = function(multOrder) {

    multOrder = multOrder || "post";

    if (multOrder != "post" && multOrder != "pre") {

        throw SceneJS_error.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "Illegal multOrder for rotate node - '" + multOrder + "' should be 'pre' or 'post'");
    }

    this._core.multOrder = multOrder;

    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._core.angle = angle || 0;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getAngle = function() {
    return this._core.angle;
};

SceneJS.Rotate.prototype.setXYZ = function(xyz) {

    xyz = xyz || {};

    this._core.x = xyz.x || 0;
    this._core.y = xyz.y || 0;
    this._core.z = xyz.z || 0;

    this._core.setDirty();

    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getXYZ = function() {
    return {
        x: this._core.x,
        y: this._core.y,
        z: this._core.z
    };
};

SceneJS.Rotate.prototype.setX = function(x) {
    this._core.x = x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getX = function() {
    return this._core.x;
};

SceneJS.Rotate.prototype.setY = function(y) {
    this._core.y = y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getY = function() {
    return this._core.y;
};

SceneJS.Rotate.prototype.setZ = function(z) {
    this._core.z = z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype.getZ = function() {
    return this._core.z;
};

SceneJS.Rotate.prototype.incAngle = function(angle) {
    this._core.angle += angle;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
};

SceneJS.Rotate.prototype._compile = function() {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes();
    SceneJS_modelXFormStack.pop();
};
