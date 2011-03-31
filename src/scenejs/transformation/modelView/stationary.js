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
 *              new SceneJS.Cube()
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
SceneJS.Stationary = SceneJS.createNodeType("stationary");

SceneJS.Stationary.prototype._compile = function(traversalContext) {

    var origMemoLevel = this._memoLevel;

    var superXform = SceneJS._viewTransformModule.getTransform();
    var lookAt = superXform.lookAt;
    if (lookAt) {
        if (this._memoLevel == 0 || (!superXform.fixed)) {
            var tempMat = SceneJS._math_mat4();
            SceneJS._math_mulMat4(superXform.matrix,
                    SceneJS._math_translationMat4v(lookAt.eye), tempMat);
            this._xform = {
                matrix: tempMat,
                lookAt: lookAt,
                fixed: origMemoLevel == 1
            };

            if (superXform.fixed && !SceneJS._instancingModule.instancing()) {
                this._memoLevel = 1;
            }
        }
        SceneJS._viewTransformModule.pushTransform(this._attr.id, this._xform);
        this._compileNodes(traversalContext);
        SceneJS._viewTransformModule.popTransform();
    } else {
        this._compileNodes(traversalContext);

        SceneJS._stationaryModule.popStationary();
    }
};


