/** Backend module that creates bitmapp text textures
 *  @private
 */
SceneJS._bitmapTextModule = new (function() {


    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {

            });

    function getHMTLColor(color) {
        if (color.length != 4) {
            return color;
        }
        for (var i = 0; i < color.length; i++) {
            color[i] *= 255;
        }
        return 'rgba(' + color.join(',') + ')';
    }

    this.createText = function(font, size, text) {
        var canvas = document.createElement("canvas");
        var cx = canvas.getContext('2d');

        cx.font = size + "px " + font;

        var width = cx.measureText(text).width;
        canvas.width = width;
        canvas.height = size;

        cx.font = size + "px " + font;
        cx.textBaseline = "middle";
        cx.fillStyle = getHMTLColor([.5, 10, 30, .5]);
        cx.fillStyle = "#FFFF00";


        var x = 0;
        var y = (size / 2);
        cx.fillText(text, x, y);
     
        return {
            image: canvas,
            width: canvas.width,
            height: canvas.height
        };
    };
})();