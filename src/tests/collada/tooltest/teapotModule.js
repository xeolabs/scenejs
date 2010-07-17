(function() {

    SceneJS._modules["teapot"] = {

        imagesDir : "../images",

        getInfo : function() {
            alert("sssss");
        },

        node : function(options) {
            return SceneJS.objects.teapot({});
        }
    };
})();