/**
 * @class A scene node that defines a view of the nodes within its subgraph.
 *
 * <h2>Position and Orientation</h2>
 * <p>A Camera is oriented such that the local +X is to the right, the lens looks down the local -Z axis, and the top
 * points up the +Y axis. Its orientation and location may be transformed by defining it within transform nodes. The example
 * below defines a perspective Camera that is positioned using using a {@link SceneJS.LookAt}:</p><pre><code>
 * var exampleScene = new SceneJS.Scene({ ... },
 *
 *    // Viewing transform specifies eye position, looking
 *    // at the origin by default
 *
 *    SceneJS.lookAt({
 *           eye : { x: 0.0, y: 10.0, z: -10 },
 *           look : { y:1.0 },
 *           up : { y: 1.0 }
 *        },
 *
 *        new SceneJS.Camera({
 *              optics: {
 *                 type   : "perspective",
 *                 fovy   : 60.0,           // Horizontal field of view in degrees
 *                 aspect : 1.0,            // Aspect ratio of the field of view
 *                 near   : 0.10,           // Distance of the near clipping plane
 *                 far    : 10000.0         // Distance of the far clipping plane
 *              }
 *           },
 *
 *           // ... child nodes
 *        )
 *     )
 * )
 * </pre></code>
 *
 * <h2>Optics</h2>
 * <p>As you saw in the above example, a Camera has an <em>optics</em> property that defines the way that it projects light to
 * form the view. Supported types are described below.</p>
 *
 * <p><b>Perspective </b></p><p>Perspective projection embodies the appearance of objects relative to their
 * distance from the view point. It implicitly defines a frustum that embodies the view volume. The example below sets
 * the default properties for a projection:</p><pre><code>
 * var p = new SceneJS.Camera({
 *       optics: {
 *           type   : "perspective",
 *           fovy   : 60.0,           // Horizontal field of view in degrees
 *           aspect : 1.0,            // Aspect ratio of the field of view
 *           near   : 0.10,           // Distance of the near clipping plane
 *           far    : 10000.0         // Distance of the far clipping plane
 *       },
 *
 *       // ... child nodes
 * )
 * </pre></code>
 *
 * <p><b>Frustum</b></p><p>Frustum projection is effectively the same as perspective, providing you with the ability
 * to explicitly set the view frustum, which can be useful if you want it to be asymmetrical. The example below sets
 * the default properties for a frustum:</p><pre><code>
 * var p = new SceneJS.Camera({
 *       optics: {
 *           type   : "frustum",
 *           left   : -0.02,
 *           bottom : -0.02,
 *           near   :  0.1,
 *           right  :  0.02,
 *           top    :  0.02,
 *           far    :  1000.0
 *       },
 *
 *       // ... child nodes
 * )
 * </pre></code>
 *
 * <p><b>Ortho</b></p><p>Orthographic, or parallel, projections consist of those that involve no perspective correction.
 * There is no adjustment for distance from the camera made in these projections, meaning objects on the screen
 * will appear the same size no matter how close or far away they are. The example below specifies the default view
 * volume for orthographic projection:</p><pre><code>
 * var p = new SceneJS.Camera({
 *       optics: {
 *           type   : "ortho",
 *           left : -1.0,
 *           right : 1.0,
 *           bottom : -1.0,
 *           top : 1.0,
 *           near : 0.1,
 *           far : 1000.0
 *    },
 *
 *    // ... child nodes
 * )
 * </pre></code>
 *
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Camera
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Camera = SceneJS.createNodeType("camera");

// @private
SceneJS.Camera.prototype._init = function(params) {
    this.setOptics(params.optics); // Can be undefined
};

/**
 * Sets projection properties on the camera.
 * Sets to default when args undefined.
 *
 * @param {Object} optics Projection properties
 * @returns {SceneJS.Camera} this
 */
SceneJS.Camera.prototype.setOptics = function(optics) {
    if (!optics) {
        this._attr.optics = {
            type: "perspective",
            fovy : 60.0,
            aspect : 1.0,
            near : 0.10,
            far : 5000.0
        };
    } else {
        if (optics.type == "ortho") {
            this._attr.optics = {
                type: optics.type,
                left : optics.left || -1.0,
                bottom : optics.bottom || -1.0,
                near : optics.near || 0.1,
                right : optics.right || 1.00,
                top : optics.top || 1.0,
                far : optics.far || 5000.0
            };
        } else if (optics.type == "frustum") {
            this._attr.optics = {
                type: optics.type,
                left : optics.left || -1.0,
                bottom : optics.bottom || -1.0,
                near : optics.near || 0.1,
                right : optics.right || 1.00,
                top : optics.top || 1.0,
                far : optics.far || 5000.0
            };
        } else  if (optics.type == "perspective") {
            this._attr.optics = {
                type: optics.type,
                fovy : optics.fovy || 60.0,
                aspect: optics.aspect || 1.0,
                near : optics.near || 0.1,
                far : optics.far || 5000.0
            };
        } else if (!optics.type) {
            throw SceneJS_errorModule.fatalError(
                     SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "SceneJS.Camera configuration invalid: optics type not specified - " +
                            "supported types are 'perspective', 'frustum' and 'ortho'");
        } else {
            throw SceneJS_errorModule.fatalError(
                     SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "SceneJS.Camera configuration invalid: optics type not supported - " +
                            "supported types are 'perspective', 'frustum' and 'ortho'");
        }
    }
    this._setDirty();
    return this;
};

/**
 * Gets the camera's projection properties
 * @returns {Object} Projection properties
 */
SceneJS.Camera.prototype.getOptics = function() {
    var optics = {};
    for (var key in this._attr.optics) {
        if (this._attr.optics.hasOwnProperty(key)) {
            optics[key] = this._attr.optics[key];
        }
    }
    return optics;
};

/**
 * Returns a copy of the matrix as a 1D array of 16 elements
 * @returns {Number[16]}
 */
SceneJS.Camera.prototype.getMatrix = function() {
    if (this._memoLevel == 0) {
        this._rebuild();
    }
    return this._transform.matrix.slice(0);
};

// Override
SceneJS.Camera.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};

// Override
SceneJS.Camera.prototype._preCompile = function(traversalContext) {
    if (this._memoLevel == 0) {
        this._rebuild();
    }
    SceneJS_projectionModule.pushTransform(this._attr.id, this._transform);
};

// Override
SceneJS.Camera.prototype._postCompile = function(traversalContext) {
    SceneJS_projectionModule.popTransform();
};

/** @private
 */
SceneJS.Camera.prototype._rebuild = function () {
    if (this._memoLevel == 0) {
        var optics = this._attr.optics;
        if (optics.type == "ortho") {
            this._transform = {
                type: optics.type,
                optics : {
                    left: optics.left,
                    right: optics.right,
                    bottom: optics.bottom,
                    top: optics.top,
                    near: optics.near,
                    far : optics.far
                },
                matrix:SceneJS_math_orthoMat4c(
                        optics.left,
                        optics.right,
                        optics.bottom,
                        optics.top,
                        optics.near,
                        optics.far)
            };
        } else if (optics.type == "frustum") {
            this._transform = {
                type: optics.type,
                optics : {
                    left: optics.left,
                    right: optics.right,
                    bottom: optics.bottom,
                    top: optics.top,
                    near: optics.near,
                    far : optics.far
                },
                matrix: SceneJS_math_frustumMatrix4(
                        optics.left,
                        optics.right,
                        optics.bottom,
                        optics.top,
                        optics.near,
                        optics.far)
            };
        } else if (optics.type == "perspective") {
            this._transform = {
                type: optics.type,
                optics : {
                    fovy: optics.fovy,
                    aspect: optics.aspect,
                    near: optics.near,
                    far: optics.far
                },
                matrix:SceneJS_math_perspectiveMatrix4(
                        optics.fovy * Math.PI / 180.0,
                        optics.aspect,
                        optics.near,
                        optics.far)
            };
        }
        this._memoLevel = 1;
    }
};
