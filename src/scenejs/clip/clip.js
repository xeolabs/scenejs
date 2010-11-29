/**
 * @class A scene node that defines an arbitrary clipping plane for nodes in its sub graph.

 */
SceneJS.Clip = SceneJS.createNodeType("clip");

// @private
SceneJS.Clip.prototype._init = function(params) {
    this._attr = {};
    this.setMode(params.mode);
    this.setA(params.a);
    this.setB(params.b);
    this.setC(params.c);
};

/**
 Sets the clipping mode. Default is "disabled".
 @function setMode
 @param {string} mode - "outside", "inside" or "disabled"
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.setMode = function(mode) {
    mode = mode || "disabled";
    if (mode != "disabled" && mode != "inside" && mode != "outside") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.clip has a mode of unsupported type: '" + mode + " - should be 'disabled', 'inside' or 'outside'"));
    }
    this._attr.mode = mode;
    this._memoLevel = 0;
};

/**
 Returns clipping mode
 @function {string} getMode
 @returns {string} The clipping mode - "disabled", "inside" or "outside"
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.getMode = function() {
    return this._attr.mode;
};

/**
 Sets the clipping plane
 @function setPlane
 @param {object} abc - eg. { a: {x: 0, y: 0, z: 0 }, b: {x: 0, y: 5, z: 0 }, c: {x: 5, y: 5, z: 0 } }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.setABC = function(abc) {
    abc = abc || {};
    this.setA(abc.a);
    this.setB(abc.b);
    this.setC(abc.c);
};

/**
 Returns the clipping plane
 @function {object} getABC
 @returns {object} Clipping plane - eg. { a: {x: 0, y: 0, z: 0 }, b: {x: 0, y: 5, z: 0 }, c: {x: 5, y: 5, z: 0 } }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.getABC = function() {
    return {
        a: this.getA(),
        b: this.getB(),
        c: this.getC()
    };
};

/**
 Set vertex A
 @function setA
 @param {object} a Vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.setA = function(a) {
    a = a || {};
    this._attr.a = [
        a.x != undefined ? a.x : 0.0,
        a.y != undefined ? a.y : 0.0,
        a.z != undefined ? a.z : 0.0,
        1
    ];
    this._memoLevel = 0;
};

/**
 Returns vertex A
 @function setA
 @return {object} The vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.getA = function() {
    return {
        x: this._attr.a[0],
        y: this._attr.a[1],
        z: this._attr.a[2]
    };
};

/**
 Set vertex B
 @function setB
 @param {object} b Vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.setB = function(b) {
    b = b || {};
    this._attr.b = [
        b.x != undefined ? b.x : 0.0,
        b.y != undefined ? b.y : 0.0,
        b.z != undefined ? b.z : 0.0,
        1
    ];
    this._memoLevel = 0;
};

/**
 Returns vertex B
 @function setB
 @return {object} The vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.getB = function() {
    return {
        x: this._attr.b[0],
        y: this._attr.b[1],
        z: this._attr.b[2]
    };
};


/**
 Set vertex C
 @function setC
 @param {object} c Vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.setC = function(c) {
    c = c || {};
    this._attr.c = [
        c.x != undefined ? c.x : 0.0,
        c.y != undefined ? c.y : 0.0,
        c.z != undefined ? c.z : 0.0,
        1
    ];
    this._memoLevel = 0;
};

/**
 Returns vertex C
 @function setC
 @return {object} The vertex - eg. {x: 0, y: 0, z: 0 }
 @since Version 0.7.9
 */
SceneJS.Clip.prototype.getC = function() {
    return {
        x: this._attr.c[0],
        y: this._attr.c[1],
        z: this._attr.c[2]
    };
};

/**
 * Returns attributes that were passed to constructor, with any value changes that have been subsequently set
 * @returns {{String:<value>} Attribute map
 */
SceneJS.Clip.prototype.getAttributes = function() {
    return {
        mode: this._attr.mode,
        a: this.getA(),
        b: this.getB(),
        c: this.getC()
    };
};

// @private
SceneJS.Clip.prototype._render = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._makePlane();
    }
    if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext); // No clip for pick
    } else {
        SceneJS._clipModule.pushClip(this._attr);
        this._renderNodes(traversalContext);
        SceneJS._clipModule.popClip();
    }
};

/** Create succinct plane representation from points A, B & C
 *
 */
SceneJS.Clip.prototype._makePlane = function() {
    var modelMat = SceneJS._modelTransformModule.getTransform().matrix;
    var viewMat = SceneJS._viewTransformModule.getTransform().matrix;

    var a = SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, this._attr.a));
    var b = SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, this._attr.b));
    var c = SceneJS._math_transformPoint3(viewMat, SceneJS._math_transformPoint3(modelMat, this._attr.c));

    var q = [
        b[0] - a[0],
        b[1] - a[1],
        b[2] - a[2]
    ];
    var v = [
        b[0] - c[0],
        b[1] - c[1],
        b[2] - c[2]
    ];

    this._attr.normal = SceneJS._math_normalizeVec3(SceneJS._math_cross3Vec3(q, v));
    this._attr.dist = SceneJS._math_dotVector3(this._attr.normal, [a[0], a[1], a[2]]);   // dist from origin

    // this._memoLevel = 1;
};
