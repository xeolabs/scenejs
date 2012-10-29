var SlideShowTextureLoader = function() {

    var slides = [
        {
            src: "../textures/superman.jpg",
            image: null
        },
        {
            src: "../textures/general-zod.jpg",
            image: null
        }
    ];

    this.getSource = function (context) {

        if (source == "theSlideShow") {

            var i = 0;

            var self = this;

            /* Initial texture image
             */
            var texture = context.createTexture();

            //            this._loadSlide(
            //                    slides[i],
            //                    context,
            //                    texture,
            //
            //                    function() {


            /* Now periodically update the subscriber's texture
             */
            function loadNextImage() {
                window.setTimeout(
                        function() {
                            if (++i >= slides.length) {
                                i = 0;
                            }
                            self._loadSlide(
                                    slides[i],
                                    context,
                                    texture,

                                    function() {
                                        subscriber.updated();
                                        loadNextImage();
                                    });
                        },
                        500);
            }

            loadNextImage();
            //});
        }
    };

    this._loadSlide = function(slide, context, texture, callback) {
        if (!slide.image) {
            var self = this;
            this._loadImage(
                    slide.src,
                    function(image) {
                        slide.image = image;
                        self._loadSlide(slide, context, texture, callback);
                    });
        } else {
            context.bindTexture(context.TEXTURE_2D, texture);
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, slide.image);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
            //   context.generateMipmap(context.TEXTURE_2D);
            callback();
        }
    };

    this._loadImage = function(src, callback) {
        var image = new Image();
        image.crossOrigin = "anonymous";
        var self = this;
        image.onload = function() {
            callback(self._ensureImageSizePowerOfTwo(image));
        };
        image.src = src;
    };

    this._ensureImageSizePowerOfTwo = function(image) {
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

    this._isPowerOfTwo = function(x) {
        return (x & (x - 1)) == 0;
    };

    this._nextHighestPowerOfTwo = function(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    };

    this.unsubscribe = function(source) {
    };
};