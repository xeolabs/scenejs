/**

 Video texture

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 myScene.addNode({
     type: "texture/video",
     src: "movies/bunny.ogg",
     applyTo: "color",
     id: "myTexture",

     nodes: [
         {
             type: "material",
             color: { r: 0.7, g: 0.7, b: 0.7 },
             specularColor: { r: 1.0, g: 1.0, b: 1.0 },
             specular: 0.0,
             shine: 50.0,

             nodes: [

                 // Heightmap node type implemented by plugin at
                 // http://scenejs.org/api/latest/plugins/node/geometry/heightmap.js
                 {
                     type: "geometry/heightmap",
                     src: 'textures/heightMap.jpg'
                 }
             ]
         }
     ]
 });

 // Get the texture and modify some properties

 var myScene.getNode("myTexture",
        function(texture) {

            // Set UV coordinate scale
            texture.setScale({
                x: 0.5, y: 0.5
            });

            // Set UV coordinate translation
            texture.setTranslate({
                x: -0.2, y: 0.1
            });

            // Set UV coordinate rotation
            texture.setRotate(45.0);

            // Set blend factor, the amount by which the texture is blended
            // with whatever is under it, eg. material color or another texture
            texture.setBlendFactor(0.5);
        });
 </pre>
 */

SceneJS.Types.addType("texture/video", {

    construct: function (params) {

        if (!params.src) {
            this.log("error", "Attribute expected: src");
        }

        this._texture = this.addNode({
            type: "texture",
            minFilter: "linear",
            magFilter: "linear",
            wrapS: params.wrapS,
            wrapT: params.wrapT,
            applyTo: params.applyTo,
            nodes: params.nodes
        });

        var canvas = document.createElement("canvas");
        document.getElementsByTagName("body")[0].appendChild(canvas);
        var ctx = canvas.getContext("2d");

        // Create hidden video canvas
        var video = document.createElement("video");
        video.style.display = "none";
        video.setAttribute("loop", "loop");
        video.autoplay = true;
        video.addEventListener("ended", // looping broken in FF
            function () {
                this.play();
            },
            true);
        document.getElementsByTagName("body")[0].appendChild(video);
        //video.crossOrigin = "anonymous";
        video.src = params.src;

        var self = this;

        // Periodically feed images from canvas into texture
        this._tick = this.getScene().on("tick",
            function () {
                if (video.readyState > 0) {
                    if (video.height <= 0) {
                        video.style.display = "";
                        video.height = video.offsetHeight;
                        video.width = video.offsetWidth;
                        video.style.display = "none";
                    }
                    self._texture.setImage(video);
                }
            });
    },

    /**
     * Sets the texture's blend factor with respect to other active textures.
     * @param {number} blendFactor The blend factor, in range [0..1]
     */
    setBlendFactor: function (blendFactor) {
        this._texture.setBlendFactor(blendFactor);
    },

    getBlendFactor: function () {
        return this._texture.getBlendFactor();
    },

    setTranslate: function (t) {
        this._texture.setTranslate(t);
    },

    getTranslate: function () {
        return this._texture.getTranslate();
    },

    setScale: function (s) {
        this._texture.setScale(s);
    },

    getScale: function () {
        return this._texture.getScale();
    },

    setRotate: function (angle) {
        this._texture.setRotate(s);
    },

    getRotate: function () {
        return this._texture.getRotate();
    },

    getMatrix: function () {
        return this._texture.getMatrix();
    },

    destruct: function () {
        this.getScene.off(this._tick);
    }
});
