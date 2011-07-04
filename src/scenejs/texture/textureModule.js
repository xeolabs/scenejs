/**
 * Backend that manages material texture layers.
 *
 * Manages asynchronous load of texture images.
 *
 * Caches textures with a least-recently-used eviction policy.
 *
 * Holds currently-applied textures as "layers". Each layer specifies a texture and a set of parameters for
 * how the texture is to be applied, ie. to modulate ambient, diffuse, specular material colors, geometry normals etc.
 *
 * Holds the layers on a stack and provides the SceneJS.texture node with methods to push and pop them.
 *
 * Interacts with the shading backend through events; on a SCENE_RENDERING event it will respond with a
 * TEXTURES_EXPORTED to pass the entire layer stack to the shading backend.
 *
 * Avoids redundant export of the layers with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the texture node, or on SCENE_COMPILING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a texture node pushes or pops the stack, this backend publishes it with a TEXTURES_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_textureModule = new (function() {
    var canvas;
    var idStack = new Array(255);
    var textureStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                canvas = params.canvas;
                stackLen = 0;
                dirty = true;
            });  

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setTexture(idStack[stackLen - 1], textureStack[stackLen - 1]);
                    } else {
                        SceneJS_renderModule.setTexture();
                    }
                    dirty = false;
                }
            });

    /** Creates texture from either image URL or image object
     */
    this.createTexture = function(cfg, onComplete) {
        var context = canvas.context;
        var textureId = SceneJS._createUUID();
        try {
            if (cfg.autoUpdate) {
                var update = function() {
                    //TODO: fix this when minefield is upto spec
                    try {
                        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
                    }
                    catch(e) {
                        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image, null);
                    }
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
                    //  context.generateMipmap(context.TEXTURE_2D);
                };
            }
            return new SceneJS_webgl_Texture2D(context, {
                textureId : textureId,
                canvas: canvas,
                image : cfg.image,
                url: cfg.uri,
                texels :cfg.texels,
                minFilter : this._getGLOption("minFilter", context, cfg, context.LINEAR),
                magFilter :  this._getGLOption("magFilter", context, cfg, context.LINEAR),
                wrapS : this._getGLOption("wrapS", context, cfg, context.CLAMP_TO_EDGE),
                wrapT :   this._getGLOption("wrapT", context, cfg, context.CLAMP_TO_EDGE),
                isDepth :  this._getOption(cfg.isDepth, false),
                depthMode : this._getGLOption("depthMode", context, cfg, context.LUMINANCE),
                depthCompareMode : this._getGLOption("depthCompareMode", context, cfg, context.COMPARE_R_TO_TEXTURE),
                depthCompareFunc : this._getGLOption("depthCompareFunc", context, cfg, context.LEQUAL),
                flipY : this._getOption(cfg.flipY, true),
                width: this._getOption(cfg.width, 1),
                height: this._getOption(cfg.height, 1),
                internalFormat : this._getGLOption("internalFormat", context, cfg, context.LEQUAL),
                sourceFormat : this._getGLOption("sourceType", context, cfg, context.ALPHA),
                sourceType : this._getGLOption("sourceType", context, cfg, context.UNSIGNED_BYTE),
                logging: SceneJS_loggingModule ,
                update: update
            }, onComplete);
        } catch (e) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ERROR, "Failed to create texture: " + e.message || e);
        }
    };

    this._getGLOption = function(name, context, cfg, defaultVal) {
        var value = cfg[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS_webgl_enumMap[value];
        if (glName == undefined) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised value for texture node property '" + name + "' value: '" + value + "'");
        }
        var glValue = context[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.errors.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    };

    this._getOption = function(value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    };

    this.destroyTexture = function(texture) {
        texture.destroy();
    };

    this.pushTexture = function(id, layers) {
        idStack[stackLen] = id;
        textureStack[stackLen] = layers;
        stackLen++;
        dirty = true;
    };

    this.popTexture = function() {
        stackLen--;
        dirty = true;
    };
})();