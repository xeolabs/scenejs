SceneJS._namespace("SceneJS.objects");

/**
 * @class A scene node that defines 2D quad (sprite) geometry.
 * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
 * texture-mapping. A Quad may be configured with an optional half-size for X and Y axis. Where
 * not specified, the half-size on each axis will be 1 by default. It can also be configured as solid (default),
 * to construct it from triangles with normals for shading and one layer of UV coordinates for texture-mapping
 * one made of triangles. When not solid, it will be a wireframe drawn as line segments.</p>
 * <p><b>Example Usage</b></p><p>Definition of solid quad that is 6 units long on the X axis and 2 units long on the
 * Y axis:</b></p><pre><code>
 * var c = new SceneJS.Quad({
 *          xSize : 3,
 *          solid: true // Optional - when true (default) quad is solid, otherwise it is wireframe
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @since Version 0.7.9
 * @constructor
 * Create a new SceneJS.Quad
 * @param {Object} [cfg] Static configuration object
 * @param {float} [cfg.xSize=1.0] Half-width on X-axis
 * @param {float} [cfg.ySize=1.0] Half-width on Y-axis
 * @param {bool} [cfg.solid=true] Wether the quad is solid (true) or wireframed (false)
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Quad = SceneJS.createNodeType("quad", "geometry");

// @private
SceneJS.Quad.prototype._init = function(params) {
    this._attr.nodeType = "quad";

    var x = params.xSize || 1;
    var y = params.ySize || 1;

    var solid = (params.solid != undefined) ? params.solid : true;

    /* Resource ID ensures that we reuse any quad that has already been created with
     * these parameters instead of wasting memory
     */
    this._resource = "quad_" + x + "_" + y + (solid ? "_solid" : "_wire");

    /* Callback that does the creation in case we can't find matching quad to reuse
     */
    this._create = function() {
        var positions = [
            x, y, 0,
            -x, y, 0,
            -x,-y, 0,
            x,-y, 0
        ];

        var normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        var uv = [
            1, 1,
            0, 1,
            0, 0,
            1, 0
        ];

        var indices = [
                2, 1, 0,
                3, 2, 0
        ];

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
