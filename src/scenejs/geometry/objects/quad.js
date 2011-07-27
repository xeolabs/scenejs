(function() {

    /**
     * A scene node that defines 2D quad (sprite) geometry.
     * The geometry is complete with normals for shading and one layer of UV coordinates for
     * texture-mapping. A Quad may be configured with an optional half-size for X and Y axis. Where
     * not specified, the half-size on each axis will be 1 by default. It can also be configured as solid (default),
     * to construct it from triangles with normals for shading and one layer of UV coordinates for texture-mapping
     * one made of triangles. When not solid, it will be a wireframe drawn as line segments.
     */
    var Quad = SceneJS.createNodeType("quad", "geometry");

    Quad.prototype._init = function(params) {
        this.attr.type = "quad";

        var solid = (params.solid != undefined) ? params.solid : true;

        var x = params.xSize || 1;
        var y = params.ySize || 1;

        SceneJS_geometry.prototype._init.call(this, {

            /* Core ID ensures that we reuse any quad that has already been created with
             * these parameters instead of wasting memory
             */
            coreId : params.coreId || "quad_" + x + "_" + y + (solid ? "_solid" : "_wire"),

            /* Factory function used when resource not found
             */
            create : function() {

                var xDiv = params.xDiv || 1;
                var yDiv = params.yDiv || 1;

                var positions, normals, uv, indices;

                if (xDiv == 1 && yDiv == 1) {
                    positions = [
                        x, y, 0,
                        -x, y, 0,
                        -x,-y, 0,
                        x,-y, 0
                    ];
                    normals = [
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1
                    ];
                    uv = [
                        1, 1,
                        0, 1,
                        0, 0,
                        1, 0
                    ];
                    indices = [
                        2, 1, 0,
                        3, 2, 0
                    ];
                } else {
                    if (xDiv < 0) {
                        throw SceneJS_errorModule.fatalError(SceneJS.errors.ILLEGAL_NODE_CONFIG, "quad xDiv should be greater than zero");
                    }
                    if (yDiv < 0) {
                        throw SceneJS_errorModule.fatalError(SceneJS.errors.ILLEGAL_NODE_CONFIG, "quad yDiv should be greater than zero");
                    }
                    positions = [];
                    normals = [];
                    uv = [];
                    indices = [];
                    var xStep = (x * 2) / xDiv;
                    var yStep = (y * 2) / yDiv;
                    var xRat = 0.5 / xDiv;
                    var yRat = 0.5 / yDiv;
                    var i = 0;
                    for (var yi = -y, yuv = 0; yi <= y; yi += yStep,yuv += yRat) {
                        for (var xi = -x, xuv = 0; xi <= x; xi += xStep,xuv += xRat) {
                            positions.push(xi);
                            positions.push(yi);
                            positions.push(0);
                            normals.push(0);
                            normals.push(0);
                            normals.push(1);
                            uv.push(xuv);
                            uv.push(yuv);
                            if (yi < y && xi < x) { // Two triangles
                                indices.push(i + 2);
                                indices.push(i + 1);
                                indices.push(i);
                                indices.push(i + 3);
                                indices.push(i + 2);
                                indices.push(i);
                            }
                            i += 3;
                        }
                    }
                }

                return {
                    primitive : solid ? "triangles" : "lines",
                    positions : positions,
                    normals: normals,
                    uv : uv,
                    indices : indices,
                    colors:[]
                };
            }
        });
    };

})();