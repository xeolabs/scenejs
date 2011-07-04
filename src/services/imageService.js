SceneJS.Services.IMAGE_SERVICE_ID = "image";

SceneJS.Services.addService(

        SceneJS.Services.IMAGE_SERVICE_ID,

        new (function() {

            SceneJS.bind("reset",
                    function() {
                        this.closeAll();
                    });

            SceneJS.bind("scene-rendering",
                    function() {

                    });

            SceneJS.bind("scene-rendered",
                    function() {

                    });


            this.sample = function(params) {
                if (!params.target) {
                    throw  SceneJS_errorModule.fatalError("ImageService sample param missing: " + params.target);
                }

            };


        })());

