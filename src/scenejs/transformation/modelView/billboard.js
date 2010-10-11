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

SceneJS.Billboard.prototype._render = function(traversalContext) {
    var superViewXForm = SceneJS._viewTransformModule.getTransform();
    var superModelXForm = SceneJS._modelTransformModule.getTransform();

    var pos = SceneJS._math_transformPoint3(superViewXForm.matrix, SceneJS._math_transformPoint3(superModelXForm.matrix, [0,0,0]));
    var pos2 =   SceneJS._math_transformPoint3(superViewXForm.matrix, SceneJS._math_transformPoint3(superModelXForm.matrix, [0,0,-1]));
//var eye = {x:.4,y:0,z:.4};
    var eye = superViewXForm.lookAt.eye;
    var look = superViewXForm.lookAt.look;

    var v1 = SceneJS._math_normalizeVec3(SceneJS._math_subVec3(   [eye.x, eye.y, eye.z], [0,0,0]));
    var v2 = SceneJS._math_normalizeVec3(SceneJS._math_subVec3(pos2, pos));

    var crossVec = SceneJS._math_cross3Vec3(v1, v2);
//
//
    var dotVec = SceneJS._math_dotVector3(v1, v2);
//
//
    //var q = [crossVec[0],crossVec[1], crossVec[2],   Math.acos(dotVec)];

    var q = SceneJS._math_angleAxisQuaternion(crossVec[0],crossVec[1], crossVec[2],  - Math.acos(dotVec) * 57.2957795);
    // q = SceneJS._math_normalizeQuaternion(q);
   // var modelMat = SceneJS._math_mulMat4(superModelXForm.matrix, SceneJS._math_newMat4FromQuaternion(q));

     var modelMat = SceneJS._math_mulMat4(superModelXForm.matrix, SceneJS._math_rotationMat4v(dotVec, crossVec));
    SceneJS._modelTransformModule.setTransform({ matrix: modelMat});

    this._renderNodes(traversalContext);

    SceneJS._modelTransformModule.setTransform(superModelXForm);
};

