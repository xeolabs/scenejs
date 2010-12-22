SceneJS.Text = SceneJS.createNodeType("text");

// @private
SceneJS.Text.prototype._init = function(params) {
    var mode = params.mode || "bitmap";
    if (mode != "vector" && mode != "bitmap") {
        throw SceneJS._errorModule.fatalError(new SceneJS.errors.InvalidNodeConfigException(
                "SceneJS.Text unsupported mode - should be 'vector' or 'bitmap'"));
    }
    this._mode = mode;
    if (this._mode === "bitmap") {
		// Save initial parameters to be reused when setText is called at runtime
		this.font = params.font || "Helvetica";
		this.size = params.size || 1;
		this.color = params.color || [1,1,1,1];
		this.text = params.text || "";
		
		// Keep track of subnodes so they can be updated if text is changed
		this.matId = this._id + "-Text_material";
		this.geoId = this._id + "-Text_geometry";
		
        this.addNode({
            type: "material",
			id: this.matId,
            emit: 0,
            baseColor:      { r: 0.0, g: 0.0, b: 0.0 },
            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
            specular:       0.9,
            shine:          100.0
        });
		
		this.setText({
			font: this.font,
			size: this.size,
			color: this.color,
			text: this.text
		});
    } else {
        this.addNode({
            type: "geometry",
            create: function() {
                var geo = SceneJS._vectorTextModule.getGeometry(3, 0, 0, params.text); // Unit size
                return {
                    resource: this._id, // Assuming text geometry varies a lot - don't try to share VBOs
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

/* <p>Updates the geometry sub-node of Text node. The geometry node is removed
 * and then re-added with new values since we cannot update a geometries vertices directly</p>
 * @param {float} width
 * @param {float} height
 * @param {Object} params 
 */
SceneJS.Text.prototype._updateGeometry = function (width, height, params) {
	var w = width / 16;
	var h = height / 16;

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
	
	var thisMatNode = SceneJS.withNode(this.matId);
	
	// We must remove existing geometry node
	if (thisMatNode.hasNode(this.geoId)) {
		thisMatNode.remove({
			nodes: [this.geoId]
		});
	}	
	
	thisMatNode.add("node", 
		{
			type: "geometry",
			id: this.geoId,
			primitive: "triangles",
			positions : positions,
			normals : normals,
			uv : uv,
			indices : indices
		}
	);
	
	SceneJS._needFrame = true;
}

SceneJS.Text.prototype.setText = function (params) {
    var text;
    if (this._mode === "bitmap") {
		// Save new parameters to be reused when setText is called next
		this.font = params.font || this.font;
		this.size = params.size || this.size;
		this.color = params.color || this.color;
		this.text = params.text || this.text;
	
        text = SceneJS._bitmapTextModule.createText(params.font || this.font, params.size || this.size, params.text || this.text, params.color || this.color);
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
        
        this._updateGeometry(text.width, text.height, params);
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