with (SceneJS) {

    var myScene = scene({

        canvasId: 'theCanvas',

        proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" },

            SceneJS.perspective({
                fovy   : 55.0,
                aspect : 1.0,
                near   : 0.10,
                far    : 1000.0 },

                    SceneJS.lookAt({
                        eye  : { x: -1.0, y: 0.0, z: 15 },
                        look : { x: -1.0, y: 0, z: 0 },
                        up   : { y: 1.0 }
                    },

                            SceneJS.lights({
                                sources: [
                                    {
                                        type:  "dir",
                                        color: { r: 1.0, g: 1.0, b: 1.0 },
                                        dir:   { x: 1.0, y: -1.0, z: 1.0 }
                                    },
                                    {
                                        type:  "dir",
                                        color: { r: 1.0, g: 1.0, b: 1.0 },
                                        dir:   { x: -1.0, y: -1.0, z: -3.0 }
                                    }
                                ]},

                                    SceneJS.rotate(function(data) {
                                        return {
                                            angle: data.get('yaw'), y : 1.0
                                        };
                                    },

                                            SceneJS.rotate(function(data) {
                                                return {
                                                    angle: data.get('pitch'), x : 1.0
                                                };
                                            },

                                                    SceneJS.loadCollada({
                                                        uri: "http://www.scenejs.org/library/v0.7/assets/" +
                                                             "examples/seymourplane_triangulate/" +
                                                             "seymourplane_triangulate.dae"
                                                    }))
                                            )
                                    )
                            )
                    )
            );

    myScene.render({ yaw: 315, pitch: 20 });
}