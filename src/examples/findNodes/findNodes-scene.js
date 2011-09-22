/*


 Lindsay S. Kay,
 lindsay.kay@xeolabs.com


 */

SceneJS.createScene({

    id: "theScene",

    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 10.0, z: 15 },
            look : { y:1.0 },
            up : { y: 1.0 },

            nodes: [
 {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
{
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 0.8 },
                            diffuse:                true,
                            specular:               false,
                            dir:                    { x: 0.0, y: -0.5, z: -1.0 }
                        },

                        {
                            type: "rotate",
                            id: "rotate.pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "rotate.yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [

                                       {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.5, g: 0.5, b: 0.6 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       1.0,
                                            shine:          70.0,

                                            nodes: [
                                                {
                                                    type : "teapot"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});


var scene = SceneJS.scene("theScene");

var rotateNodes = scene.findNodes("(rotate)");

alert("Number of 'rotate' nodes found: " + rotateNodes.length);

scene.start();

