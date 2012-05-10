SceneJS.Text = SceneJS.createNodeType("text");

// @private
SceneJS.Text.prototype._init = function(params) {
    var mode = params.mode || "bitmap";
    
    // Save defaults to be reused during runtime if setText is called
    this.font = params.font || "Helvetica";
    this.size = params.size || 10;
    this.text = params.text || " ";
    this.color = params.color || [1,1,1,1];
    
    if (mode != "vector" && mode != "bitmap") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.Text unsupported mode - should be 'vector' or 'bitmap'"));
    }
    this._mode = mode;
    if (this._mode == "bitmap") {
        var text = this.setText(params);
        
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
            type: "material",
            emit: 0,
            baseColor:      { r: 0.0, g: 0.0, b: 0.0 },
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
        });
    } else {
        this.addNode({
            type: "geometry",
            create: function() {
                var geo = SceneJS._vectorTextModule.getGeometry(3, 0, 0, params.text); // Unit size
                return {
                    resource: this._attr.id, // Assuming text geometry varies a lot - don't try to share VBOs
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

SceneJS.Text.prototype.setText = function(params) {
    var text;
    if (this._mode == "bitmap") {
        text = SceneJS._bitmapTextModule.createText(params.font || this.font, params.size || this.size, params.color || this.color, params.text || this.text);
        this._layer = {
            creationParams: {
                image: text.image,
                minFilter: "linear",
                magFilter: "linear",
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
            },
            texture: null,
            applyFrom: "uv",
            applyTo: "baseColor",
            blendMode: "add",
            scale : null,
            translate : null,
            rotate : null,
            rebuildMatrix : true
        };
    }
    
    return text;
};

SceneJS.Text.prototype._render = function(traversalContext) {
    if (this._mode == "bitmap") {
        if (!this._layer.texture && !this._error) {
            var self = this;
            (function() {

                SceneJS._textureModule.createTexture(
                        self._layer.creationParams,
                        function(texture) { // Success
                            self._layer.texture = texture;
                        },
                        function() { // General error
                            self._error = true;
                            var message = "SceneJS.text texture creation failed";
                            SceneJS._loggingModule.warn(message);
                        },
                        function() { // Aborted
                            self._error = true;
                            var message = "SceneJS.text texture creation failed";
                            SceneJS._loggingModule.warn(message);
                        });
            })();
        }

        if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
            this._renderNodes(traversalContext);
        } else {
            if (this._layer) {
                SceneJS._textureModule.pushTexture([this._layer]);
                this._renderNodes(traversalContext);
                SceneJS._textureModule.popTexture();
            }
        }
    } else {
        this._renderNodes(traversalContext);
    }
};