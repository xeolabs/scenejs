/**
 * @class A scene node that defines the deformation of geometries in the subgraph
 */
SceneJS.Deform = SceneJS.createNodeType("deform");

// @private
SceneJS.Deform.prototype._init = function(params) {
    this.setVerts(params.verts);
};

SceneJS.Deform.prototype.setVerts = function(verts) {
    verts = verts || [];
    var tmpVerts = [];
    var vert;
    for (var i = 0, len = verts.length; i < len; i++) {
        vert = verts[i];
        if (vert.mode && (vert.mode != "linear" && vert.mode != "exp")) {
            throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                    "Can't set deform vertex " + i + " - unsupported mode - should be 'linear' or 'exp'"));
        }
        tmpVerts.push({
            x: vert.x || 0.0,
            y: vert.y || 0.0,
            z: vert.z || 0.0,
            mode: vert.mode || "linear",
            weight: vert.weight || 0.0
        });
    }
    this._attr.verts = tmpVerts;
};

SceneJS.Deform.prototype.setVert = function(vert) {
    vert = vert || {};
    if (vert.index == undefined) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't set deform vertex - attribute missing: 'index'"));
    }
    if (vert.index < 0 || vert.index >= this._attr.verts.length) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't set deform vertex - index " + vert.indx + " out of range of existing vertices [0-" + this._attr.verts.length + "]"));
    }
    if (vert.mode && (vert.mode != "linear" && vert.mode != "exp")) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't set deform vertex - unsupported mode - should be 'linear' or 'exp'"));
    }
    var temp = this._attr.verts[vert.index];

    this._attr.verts[vert.index] = {
        x: vert.x != undefined ? vert.x : temp.x,
        y: vert.y != undefined ? vert.y : temp.y,
        z: vert.z != undefined ? vert.z : temp.z,
        mode: vert.mode != undefined ? vert.mode : temp.mode,
        weight: vert.weight != undefined ? vert.weight : temp.weight
    };
};

SceneJS.Deform.prototype.getVert = function(index) {
    if (index == undefined) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't get deform vertex - attribute missing: 'index'"));
    }
    if (index < 0 || index > this._attr.verts.length) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't get deform vertex - index out of range of existing vertices"));
    }
    return SceneJS._shallowClone(this._attr.verts[index]);
};

SceneJS.Deform.prototype.addVert = function(vert) {
    vert = vert || {};
    if (vert.mode && (vert.mode != "linear" && vert.mode != "exp")) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't add deform vertex - unsupported mode - should be 'linear' or 'exp'"));
    }
    var temp = {
        x: vert.x || 0.0,
        y: vert.y || 0.0,
        z: vert.z || 0.0,
        mode: vert.mode || "linear",
        weight: vert.weight || 0.0
    };
    if (vert.index) {
        this._attr.verts.splice(vert.index, 0, temp);
    } else {
        this._attr.verts.push(vert);
    }
};

SceneJS.Deform.prototype.removeVert = function(index) {
    if (index == undefined) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't remove deform vertex - attribute undefined: 'index'"));
    }
    if (index < 0 || index > this._attr.verts.length) {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "Can't remove deform vertex - index out of range of existing vertices"));
    }
    this._attr.verts.splice(index, 1);
};

// @private
SceneJS.Deform.prototype._render = function(traversalContext) {
    SceneJS._deformModule.pushDeform(this._attr);
    this._renderNodes(traversalContext);
    SceneJS._deformModule.popDeform();
};