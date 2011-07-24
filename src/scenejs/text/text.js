SceneJS.Text = SceneJS.createNodeType("text");

// @private
SceneJS.Text.prototype._init = function(params) {
    var mode = params.mode || "bitmap";
    if (mode != "vector" && mode != "bitmap") {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "SceneJS.Text unsupported mode - should be 'vector' or 'bitmap'");
    }
    this._mode = mode;
    if (this._mode == "bitmap") {
        var text = SceneJS_bitmapTextModule.createText("Helvetica", params.size || 1, params.text || "");

        var w = text.width / 16;
        var h = text.height / 16;

        var positions = [ w, h, 0.01, 0, h, 0.1, 0,0, 0.1, w,0, 0.01 ];
        var normals = [ 0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1 ];
        var uv = [1, 1,  0, 1,  0, 0, 1, 0];
        var indices = [0, 1, 2,  0, 2, 3];

        if (params.doubleSided) {
            var z = 0.01;
            positions = positions.concat([w,0,-z, 0,0,-z, 0, h,-z, w, h,-z]);
            normals = normals.concat([0, 0,1, 0, 0,1, 0, 0,1,  0, 0,1]);
            uv = uv.concat([0, 0, 1, 0, 1, 1, 0, 1]);
            indices = indices.concat([4,5,6, 4,6,7]);
        }

        this.addNode({
            type: "texture",
            layers: [
                {
                    image: text.image,
                    minFilter: "linear",
                    magFilter: "linear",
                    wrapS: "repeat",
                    wrapT: "repeat",
                    isDepth: false,
                    depthMode:"luminance",
                    depthCompareMode: "compareRToTexture",
                    depthCompareFunc: "lequal",
                    flipY: false,
                    width: 1,
                    height: 1,
                    internalFormat:"lequal",
                    sourceFormat:"alpha",
                    sourceType: "unsignedByte",
                    applyTo:"baseColor",
                    blendMode:"add"
                }
            ],

            nodes: [
                {
                    type: "material",
                    emit: 1,
                    baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                    specular:       0.9,
                    shine:          100.0,
                    nodes: [
                        {
                            type: "geometry",
                            primitive: "triangles",
                            positions : positions,
                            normals : normals,
                            uv : uv,
                            indices : indices
                        }
                    ]
                }
            ]
        });
    } else {
        this.addNode({
            type: "geometry",
            create: function() {
                var geo = SceneJS_vectorTextModule.getGeometry(3, 0, 0, params.text); // Unit size
                return {
                    resource: this.attr.id, // Assuming text geometry varies a lot - don't try to share VBOs
                    primitive : "lines",
                    positions : geo.positions,
                    normals: [],
                    uv : [],
                    indices : geo.indices,
                    colors:[]
                };
            }
        });
    }
};

SceneJS.Text.prototype._compile = function() {
    if (this._mode == "bitmap") {
        this._compileNodes();
    }
};