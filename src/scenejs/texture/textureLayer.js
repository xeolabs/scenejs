/**
 @class A layer within a {@link SceneJS.Texture} node.

 @constructor
 Create a new SceneJS.TextureLayer
 @param {Object} cfg The config object
 */
SceneJS.TextureLayer = function(cfg) {
    this._imageURL = null;
    this._minFilter = "linear";
    this._magFilter = "linear";
    this._wrapS = "clampToEdge";
    this._wrapT = "clampToEdge";
    this._isDepth = false;
    this._depthMode = "luminance";
    this._depthCompareMode = "compareRToTexture";
    this._depthCompareFunc = "lequal";
    this._flipY = true;
    this._width = 1;
    this._height = 1;
    this._internalFormat = "alpha";
    this._sourceFormat = "alpha";
    this._sourceType = "unsignedByte";
};


/** Ready to create texture layer
 *  @private
 */
SceneJS.TextureLayer.STATE_INITIAL = 0;

/** Texture layer image load in progress
 *  @private
 */
SceneJS.TextureLayer.STATE_LOADING = 1;

/** Texture layer image load completed
 *  @private
 */
SceneJS.TextureLayer.STATE_LOADED = 2;

/** Texture layer creation or image load failed
 * @private
 */
SceneJS.TextureLayer.STATE_ERROR = -1;


