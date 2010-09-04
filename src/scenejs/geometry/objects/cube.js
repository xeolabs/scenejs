SceneJS._namespace("SceneJS.objects");

/**
 * @class A scene node that defines cube geometry.
 * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
 * texture-mapping. A Cube may be configured with an optional half-size for each axis. Where
 * not specified, the half-size on each axis will be 1 by default. It can also be configured as solid (default),
 * to construct it from triangles with normals for shading and one layer of UV coordinates for texture-mapping
 * one made of triangles. When not solid, it will be a wireframe drawn as line segments.</p>
 * <p><b>Example Usage</b></p><p>Definition of solid cube that is 6 units long on the X axis and 2 units long on the
 * Y and Z axis:</b></p><pre><code>
 * var c = new SceneJS.Cube({
 *          xSize : 3,
 *          solid: true // Optional - when true (default) cube is solid, otherwise it is wireframe
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Cube
 * @param {Object} [cfg] Static configuration object
 * @param {float} [cfg.xSize=1.0] Half-width on X-axis
 * @param {float} [cfg.ySize=1.0] Half-width on Y-axis
 * @param {float} [cfg.zSize=1.0] Half-width on Z-axis
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Cube = SceneJS.createNodeType("cube", "geometry");

// @private
SceneJS.Cube.prototype._init = function(params) {
    this._nodeType = "cube";

    var x = params.xSize || 1;
    var y = params.ySize || 1;
    var z = params.zSize || 1;

    var solid = (params.solid != undefined) ? params.solid : true;

    /* Resource ID ensures that we reuse any scube that has already been created with
     * these parameters instead of wasting memory
     */
    this._resource = "cube_" + x + "_" + y + "_" + z + (solid ? "_solid" : "wire");

    /* Callback that does the creation in case we can't find matching cube to reuse
     */
    this._create = function() {
        var positions = [
            x, y, z,
            -x, y, z,
            -x,-y, z,
            x,-y, z,
            // v0-v1-v2-v3 front
            x, y, z,
            x,-y, z,
            x,-y,-z,
            x, y,-z,
            // v0-v3-v4-v5 right
            x, y, z,
            x, y,-z,
            -x, y,-z,
            -x, y, z,
            // v0-v5-v6-v1 top
            -x, y, z,
            -x, y,-z,
            -x,-y,-z,
            -x,-y, z,
            // v1-v6-v7-v2 left
            -x,-y,-z,
            x,-y,-z,
            x,-y, z,
            -x,-y, z,
            // v7-v4-v3-v2 bottom
            x,-y,-z,
            -x,-y,-z,
            -x, y,-z,
            x, y,-z
        ];   // v4-v7-v6-v5 back

        var normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            // v0-v1-v2-v3 front
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            // v0-v3-v4-v5 right
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            // v0-v5-v6-v1 top
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            // v1-v6-v7-v2 left
            0,1, 0,
            0,1, 0,
            0,1, 0,
            0,1, 0,
            // v7-v4-v3-v2 bottom
            0, 0,1,
            0, 0,1,
            0, 0,1,
            0, 0,1
        ];    // v4-v7-v6-v5 back

        var uv = [
            x, y,
            0, y,
            0, 0,
            x, 0,
            // v0-v1-v2-v3 front
            0, y,
            0, 0,
            x, 0,
            x, y,
            // v0-v3-v4-v5 right
            x, 0,
            x, y,
            0, y,
            0, 0,
            // v0-v5-v6-v1 top
            x, y,
            0, y,
            0, 0,
            x, 0,
            // v1-v6-v7-v2 left
            0, 0,
            x, 0,
            x, y,
            0, y,
            // v7-v4-v3-v2 bottom
            0, 0,
            x, 0,
            x, y,
            0, y
        ];   // v4-v7-v6-v5 back

        var indices = [
            0, 1, 2,
            0, 2, 3,
            // front
            4, 5, 6,
            4, 6, 7,
            // right
            8, 9,10,
            8,10,11,
            // top
            12,13,14,
            12,14,15,
            // left
            16,17,18,
            16,18,19,
            // bottom
            20,21,22,
            20,22,23
        ] ;  // back

        return {
            primitive : solid ? "triangles" : "lines",
            positions : positions,
            normals: normals,
            uv : uv,
            indices : indices,
            colors:[]
        };
    };
};
