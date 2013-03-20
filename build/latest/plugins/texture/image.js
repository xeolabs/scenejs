SceneJS.Plugins.addPlugin(

    "texture",
    "image",

    new (function () {

        var sourceService = this;

        this.getSource = function (params) {

            var gl = params.gl;
            var configs = {};
            var texture = gl.createTexture();
            var updated;

            return {

                getTexture:function () {
                    return texture;
                },

                onUpdate:function (fn) {
                    updated = fn;
                },

                setConfigs:function (cfg) {

                    if (!cfg.src) {
                        throw "Parameter expected: 'src'";
                    }

                    configs = cfg;

                    var image = new Image();
                    image.crossOrigin = "anonymous";

                    image.onload = function () {

                        gl.bindTexture(gl.TEXTURE_2D, texture);

                        var potImage = sourceService._ensureImageSizePowerOfTwo(image); // WebGL hates NPOT images

                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, potImage);

                        if (updated) {
                            updated();
                        }
                    };

                    image.src = configs.src;
                },

                getConfigs:function () {
                    return configs;
                },

                destroy:function () {
                }
            };
        };

        /*----------------------------------------------------------------------------
         * Utility methods owned by the factory service
         *---------------------------------------------------------------------------*/

        this._ensureImageSizePowerOfTwo = function (image) {
            if (!this._isPowerOfTwo(image.width) || !this._isPowerOfTwo(image.height)) {
                var canvas = document.createElement("canvas");
                canvas.width = this._nextHighestPowerOfTwo(image.width);
                canvas.height = this._nextHighestPowerOfTwo(image.height);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image,
                    0, 0, image.width, image.height,
                    0, 0, canvas.width, canvas.height);
                image = canvas;
            }
            return image;
        };

        this._isPowerOfTwo = function (x) {
            return (x & (x - 1)) == 0;
        };

        this._nextHighestPowerOfTwo = function (x) {
            --x;
            for (var i = 1; i < 32; i <<= 1) {
                x = x | x >> i;
            }
            return x + 1;
        };

    })());

