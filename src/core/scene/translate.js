/**
 * @class Scene graph node which defines a translation modelling transform to apply to the objects in its subgraph
 * @extends SceneJS.Node
 */
SceneJS.Translate = SceneJS_NodeFactory.createNodeType("translate");

SceneJS.Translate.prototype._init = function(params) {

    if (this._core.useCount == 1) { // This node is the resource definer

        SceneJS_modelXFormStack.buildCore(this._core);
        
        this.setMultOrder(params.multOrder);

        this.setXYZ({
            x: params.x,
            y: params.y,
            z: params.z
        });

        var core = this._core;

        this._core.buildMatrix = function() {
            core.matrix = SceneJS_math_translationMat4v([core.x, core.y, core.z], core.matrix);
        };
    }
};

/**
 * Get Model matrix
 * @return {*}
 */
SceneJS.Translate.prototype.getModelMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return this._core.matrix;
};

/**
 * Get World matrix. That's the multiplication of this node's Model matrix by the World matrix of the the next
 * tranform (scale, translate, translate etc) node on the path to the scene root.
 * @return {*}
 */
SceneJS.Translate.prototype.getWorldMatrix = function() {
    if (this._core.dirty) {
        this._core.build();
    }
    return Array.apply( [], this._core.mat);
};


/**
 * Sets the multiplication order of this node's transform matrix with respect to the parent modeling transform
 * in the scene graph.
 *
 * @param {String} multOrder Mulplication order - "post" and "pre"
 */
SceneJS.Translate.prototype.setMultOrder = function(multOrder) {

    multOrder = multOrder || "post";

    if (multOrder != "post" && multOrder != "pre") {

        throw SceneJS_error.fatalError(
                SceneJS.errors.NODE_CONFIG_EXPECTED,
                "Illegal multOrder for translate node - '" + multOrder + "' should be 'pre' or 'post'");
    }

    this._core.multOrder = multOrder;

    this._core.setDirty();

    this._engine.display.imageDirty = true;
};

SceneJS.Translate.prototype.setXYZ = function(xyz) {

    xyz = xyz || {};

    this._core.x = xyz.x || 0;
    this._core.y = xyz.y || 0;
    this._core.z = xyz.z || 0;

    this._core.setDirty();

    this._engine.display.imageDirty = true;

    return this;
};

SceneJS.Translate.prototype.getXYZ = function() {
    return {
        x: this._core.x,
        y: this._core.y,
        z: this._core.z
    };
};

SceneJS.Translate.prototype.setX = function(x) {
    this._core.x = x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.getX = function() {
    return this._core.x;
};

SceneJS.Translate.prototype.setY = function(y) {
    this._core.y = y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.getY = function() {
    return this._core.y;
};

SceneJS.Translate.prototype.setZ = function(z) {
    this._core.z = z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.getZ = function() {
    return this._core.z;
};

SceneJS.Translate.prototype.incX = function(x) {
    this._core.x += x;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.incY = function(y) {
    this._core.y += y;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype.incZ = function(z) {
    this._core.z += z;
    this._core.setDirty();
    this._engine.display.imageDirty = true;
    return this;
};

SceneJS.Translate.prototype._compile = function() {
    SceneJS_modelXFormStack.push(this._core);
    this._compileNodes();
    SceneJS_modelXFormStack.pop();
};
