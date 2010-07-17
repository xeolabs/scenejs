/**
 * @class A Scene node that defines a region within a {@link SceneJS.LookAt} in which the translations specified by that node have no effect.
 * @extends SceneJS.Node
 *
 * <p> As the parameters of the {@link SceneJS.LookAt} are modified, the content in the subgraph
 * of this node will rotate about the eye position, but will not translate as the eye position moves. You could therefore
 * define a skybox within the subgraph of this node, that will always stay in the distance.</p>
 *
 * <p><b>Example:</b></p><p>A box that the eye position never appears to move outside of</b></p><pre><code>
 * var l = new SceneJS.LookAt({
 *     eye  : { x: 0.0, y: 10.0, z: -15 },
 *     look : { y:1.0 },
 *     up   : { y: 1.0 },
 *
 *      new SceneJS.Stationary(
 *          new SceneJS.Scale({ x: 100.0, y: 100.0, z: 100.0 },
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 *
 * </pre></code>
 *
 *  @constructor
 * Create a new SceneJS.Stationary
 * @param {args} args Zero or more child nodes
 */
SceneJS.Stationary = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "stationary";
    this._xform = null;
};

SceneJS._inherit(SceneJS.Stationary, SceneJS.Node);

SceneJS.Stationary.prototype._render = function(traversalContext, data) {
    var superXform = SceneJS._viewTransformModule.getTransform();
    var lookAt = superXform.lookAt;
    if (lookAt) {
        if (this._memoLevel == 0) {
            this._xform = {
                matrix: SceneJS._math_mulMat4(
                        superXform.matrix,
                        SceneJS._math_translationMat4c(
                                lookAt.eye.x,
                                lookAt.eye.y,
                                lookAt.eye.z)),
                lookAt: lookAt,
                fixed: superXform.fixed
            };
            if (superXform.fixed && !SceneJS._instancingModule.instancing()) {
                this._memoLevel = 1;
            }
        }
        SceneJS._viewTransformModule.setTransform(this._xform);
        this._renderNodes(traversalContext, data);
        SceneJS._viewTransformModule.setTransform(superXform);
    } else {
        this._renderNodes(traversalContext, data);
    }
};


/** Factory function that returns a new {@link SceneJS.Stationary} instance
 */
SceneJS.stationary = function() {
    var n = new SceneJS.Stationary();
    SceneJS.Stationary.prototype.constructor.apply(n, arguments);
    return n;
};

