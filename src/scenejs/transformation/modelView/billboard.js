/**
 * @class A scene node that applies a model-space billboard transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A billboard to orient a flattened cube towards the lookat:</b></p><pre><code>
 * var billboard = new SceneJS.Billboard(
 *     new SceneJS.Scale({
 *       x: 5.0,
 *       y: 5.0,
 *       z: 0.1
 *   },
 *      new SceneJS.Cube()))
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Billboard
 * @param {Object} config  Config object followed by zero or more child nodes
 */
SceneJS.Billboard = SceneJS.createNodeType("billboard");


SceneJS.Billboard.prototype._renderOLD = function(traversalContext) {

    var superViewXForm = SceneJS._viewTransformModule.getTransform();
    var superModelXForm = SceneJS._modelTransformModule.getTransform();

    /* 1. Get world-space billboard center
     */
    var pos = SceneJS._math_transformPoint3(superModelXForm.matrix, [0,0,0]);

    /* 2. Get world-space vector from eye to billboard center
     */
    var eye = superViewXForm.lookAt.eye;
    var look = SceneJS._math_normalizeVec3(SceneJS._math_subVec3([eye.x, eye.y, eye.z], pos));

    var up = superViewXForm.lookAt.up;
    up = SceneJS._math_normalizeVec3([up.x, up.y, up.z]);

    var right = SceneJS._math_cross3Vec3(look, up);

    up = SceneJS._math_cross3Vec3(right, look);

    var r1 = right[0], r2 = right[1], r3 = right[2],
            u1 = up[0], u2 = up[1], u3 = up[2],
            l1 = look[0], l2 = look[1], l3 = look[2],
            px = pos[0], py = pos[1], pz = pos[2];

    var mat = [
        r1,    u1,    l1,    px,
        r2,    u2,    l2,    py,
        r3,    u3,    l3,    pz,
        0,    0,    0,    1
    ];

    //var modelMat = SceneJS._math_translationMat4v(pos);
    var modelMat = SceneJS._math_identityMat4();
    var viewMat = SceneJS._math_mulMat4(superViewXForm.matrix, mat);

    SceneJS._viewTransformModule.setTransform({ matrix: viewMat });
    SceneJS._modelTransformModule.setTransform({ matrix: modelMat});

    this._renderNodes(traversalContext);

    SceneJS._modelTransformModule.setTransform(superModelXForm);
    SceneJS._viewTransformModule.setTransform(superViewXForm);
};


SceneJS.Billboard.prototype._render = function(traversalContext) {

    var superViewXForm = SceneJS._viewTransformModule.getTransform();
    var superModelXForm = SceneJS._modelTransformModule.getTransform();

    /* 1. Get world-space billboard center
     */
    var pos = SceneJS._math_transformPoint3(superModelXForm.matrix, [0,0,0]);
    
    /* 2. Get world-space vector from eye to billboard center
     */
    var eye = superViewXForm.lookAt.eye;
    var look = SceneJS._math_normalizeVec3(SceneJS._math_subVec3([eye.x, eye.y, eye.z], pos));

    var up = SceneJS._math_normalizeVec3([
        SceneJS._math_getCellMat4(superViewXForm.matrix, 0, 1),
        SceneJS._math_getCellMat4(superViewXForm.matrix, 1, 1),
        SceneJS._math_getCellMat4(superViewXForm.matrix, 2, 1)
    ]);

    var right = SceneJS._math_cross3Vec3(look, up);

    up = SceneJS._math_cross3Vec3(right, look);

    var mat = [
        right[0],    up[0],    look[0],    0,
        right[1],    up[1],    look[1],    0,
        right[2],    up[2],    look[2],    0,
        0,    0,    0,    1
    ];

    var modelMat = SceneJS._math_translationMat4v([-pos[0], -pos[1], -pos[2]]);
   // var modelMat = SceneJS._math_identityMat4();
    var viewMat = SceneJS._math_mulMat4(superViewXForm.matrix, mat);

    SceneJS._viewTransformModule.setTransform({ matrix: viewMat });
    SceneJS._modelTransformModule.setTransform({ matrix: modelMat});

    this._renderNodes(traversalContext);

    SceneJS._modelTransformModule.setTransform(superModelXForm);
    SceneJS._viewTransformModule.setTransform(superViewXForm);
};
