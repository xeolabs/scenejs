/**
 * @class Scene node that provides a virtual trackball transformation
 * @extends SceneJS.Node
 * <p><b></b></p><pre><code>
 * var tb = new SceneKs.Trackball({
 *                      actions: [
 *                          {
 *                              action: "rotate",
 *                              x : 45.0,
 *                              y : 30.0
 *                          },
 *                          {
 *                              action: "pan",
 *                              x : 20.0,
 *                              y : 10.0,
 *                              z : 20.0
 *                          },
 *                          {
 *                              action: "dolly",
 *                              z : 2.0
 *                          },
 *                          {
 *                              action: "scale",
 *                              z : 2.0
 *                          }
 *                          {
 *                              action: "rotate",
 *                              x : 15.0,
 *                              y : 20.0
 *                          },
 *                      ]
 *           });
 * </pre></code>
 *
 * @constructor
 * Create a new SceneJS.Trackbacll
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Trackball = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "trackball";
    this._xform = null;
    this.reset();
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Trackball, SceneJS.Node);

SceneJS.Trackball.MODE_DORMANT = 0;

SceneJS.Trackball.prototype.reset = function() {
    this._mat = SceneJS_math_identityMat4();
    this._pts = [
        [0.0, 0.0],
        [0.0, 0.0]
    ];
};

/** @private */
SceneJS.Trackball.prototype._projectOnSphere = function(x, y) {
    var r = 1.0;
    var z = 0.0;
    var d = Math.sqrt(x * x + y * y);
    if (d < (r * 0.70710678118654752440)) {
        /* Inside sphere */
        z = Math.sqrt(r * r - d * d);
    }
    else {
        /* On hyperbola */
        var t = r / 1.41421356237309504880;
        z = t * t / d;
    }
    return z;
};

/** @private */
SceneJS.Trackball.prototype._transform = function(m, x, y, z) {
    return SceneJS_math_mulMat4v4(m, [x, y, z, 0.0]);
};

/** @private */
SceneJS.Trackball.prototype._transformOnSphere = function(m, x, y) {
    var z = this._projectOnSphere(x, y);
    return this._transform(m, x, y, z);
};

/** @private */
SceneJS.Trackball.prototype._translate = function(offset, f) {
    var invMat = SceneJS_math_inverseMat4(this._mat);
    var t = [offset[0], offset[1], offset[2], 0.0];  // vec3 to 4
    t = SceneJS_math_mulMat4v4(invMat, t);
    t = SceneJS_math_mulVec4Scalar(t, f);
    var trMat = SceneJS_math_translationMat4v(t);
    this._mat = SceneJS_math_mulMat4(this._mat, trMat);
};

/** @private */
SceneJS.Trackball.prototype.rotate = function(m) {
    if ((this._pts[0][0] == this._pts[1][0]) && (this._pts[0][1] == this._pts[1][1])) return;

    var mInv = SceneJS_math_inverseMat4(m);
    var v0 = this._transformOnSphere(mInv, this._pts[0][0], this._pts[0][1]);
    var v1 = this._transformOnSphere(mInv, this._pts[1][0], this._pts[1][1]);

    var axis = SceneJS_math_cross3Vec3(v0, v1);
    var angle = SceneJS_math_lenVec3(axis);
    var rotMat = SceneJS_math_rotationMat4v(angle, axis);

    this._mat = SceneJS_math_mulMat4(rotMat, this._mat);
};

/** @private */
SceneJS.Trackball.prototype.pan = function(m) {
    var mInv = SceneJS_math_inverseMat4(m);
    var v0 = this._transform(mInv, this._pts[0][0], this._pts[0][1], -1.0);
    var v1 = this._transform(mInv, this._pts[1][0], this._pts[1][1], -1.0);
    var offset = SceneJS_math_subVec3(v1, v0);
    this._translate(offset, 2.0);
};

SceneJS.Trackball.prototype.dolly = function(m, dz) {
    var mInv = SceneJS_math_inverseMat4(m);
    var offset = this._transform(mInv, 0.0, 0.0, dz);
    this._translate(offset, 1.0);
};

SceneJS.Trackball.prototype.scale = function(m, s) {
    var scaleMat = SceneJS_math_scalingMat4c(s, s, s);
    this._mat = SceneJS_math_mulMat4(this._mat, scaleMat);
};

/** @private */
SceneJS.Trackball.prototype.track = function(m, action) {
    this._pts[0][0] = this._pts[1][0];
    this._pts[0][1] = this._pts[1][1];
    this._pts[1][0] = action.x || 0;
    this._pts[1][1] = action.y || 0;
    switch (action.action) {
        case "rotate":
            this.rotate(m);
            break;

        case "pan":
            this.pan(m);
            break;

        case "dolly":
            this.dolly(m, action.z);
            break;

        case "scale":
            this.scale(m, action.z);
            break;

        default:
            break;
    }
};

SceneJS.Trackball.prototype._init = function(params) {
    var m = SceneJS_math_identityMat4();
   
    if (params.actions) {
        for (var i = 0; i < params.actions.length; i++) {
            var action = params.actions[i];
            this.track(m, action);
        }
    }
};

SceneJS.Trackball.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var instancing = SceneJS_instancingModule.instancing();
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams && !instancing
        };
        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelViewTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.trackball = function() {
    var n = new SceneJS.Trackball();
    SceneJS.Trackball.prototype.constructor.apply(n, arguments);
    return n;
};