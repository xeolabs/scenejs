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

// @private
SceneJS.Billboard.prototype._compile = function(traversalContext) {
    this._preCompile();
    this._compileNodes(traversalContext);
    this._postCompile();
};

// @private
SceneJS.Billboard.prototype._preCompile = function(traversalContext) {
    // 0. The base variable
    var superViewXForm = SceneJS._viewTransformModule.getTransform();
    var lookAt = superViewXForm.lookAt;

    var superModelXForm = SceneJS._modelTransformModule.getTransform();
    var matrix = superModelXForm.matrix.slice(0);

    // 1. Invert the model rotation matrix, which will reset the subnodes rotation
    var rotMatrix = [
        matrix[0], matrix[1], matrix[2],  0,
        matrix[4], matrix[5], matrix[6],  0,
        matrix[8], matrix[9], matrix[10], 0,
        0,         0,         0,          1
    ];
    SceneJS._math_inverseMat4(rotMatrix);
    SceneJS._math_mulMat4(matrix, rotMatrix, matrix);

    // 2. Get the billboard Z vector
    var ZZ = [];
    SceneJS._math_subVec3(lookAt.eye, lookAt.look, ZZ);
    SceneJS._math_normalizeVec3(ZZ);

    // 3. Get the billboard X vector
    var XX = [];
    SceneJS._math_cross3Vec3(lookAt.up, ZZ, XX);
    SceneJS._math_normalizeVec3(XX);

    // 4. Get the billboard Y vector
    var YY = [];
    SceneJS._math_cross3Vec3(ZZ, XX, YY);
    SceneJS._math_normalizeVec3(YY);

    // 5. Multiply those billboard vector to the matrix
    SceneJS._math_mulMat4(matrix, [
        XX[0], XX[1], XX[2], 0,
        YY[0], YY[1], YY[2], 0,
        ZZ[0], ZZ[1], ZZ[2], 0,
        0,     0,     0,     1
    ], matrix);

    // 6. Render
    SceneJS._modelTransformModule.pushTransform(this._attr.id,  { matrix: matrix }); // TODO : memoize!
};

// @private
SceneJS.Billboard.prototype._postCompile = function(traversalContext) {
    SceneJS._modelTransformModule.popTransform();
};