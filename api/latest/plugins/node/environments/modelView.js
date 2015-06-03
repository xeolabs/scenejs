/**
 * A pre-made scene environment
 *
 *  @author xeolabs / http://xeolabs.com
 *
 * <p>This environment has:</p>
 *
 * <ul>
 *     <li>lights</li>
 *     <li>grid sky box</li>
 *     <li>grid reflection map</li>
 *     <li>camera that orbits the origin</li>
 * </ul>
 *
 * <p>Usage:</p>
 * .
 * <pre>
 * someNode.addNode({
 *      type: "environments/modelView",
 *      nodes: [
 *          {
 *              type: "geometry/teapot"
 *          }
 *      ]
 *  });
 * </pre>
 */
SceneJS.Types.addType("environments/modelView", {

    construct: function (params) {

        var scale = params.scale || 1.0;
        var node = this;
        var rotateId = this.getId() + ".rotate";

        var orbit = node.addNode({
            type: "cameras/orbit",
            yaw: 30,
            pitch: -30,
            zoom: params.zoom || 10,
            zoomSensitivity: 1.0,
            eye: { x: 0, y: 0, z: 10 },
            look: { x: 0, y: 0, z: 0 },

            nodes: [
                {
                    type: "lights",
                    lights: [
                        {
                            mode: "ambient",
                            color: { r: 0.5, g: 0.5, b: 0.5 },
                            diffuse: false,
                            specular: false
                        },
                        {
                            mode: "dir",
                            color: { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse: true,
                            specular: true,
                            dir: { x: 1.0, y: -0.9, z: -0.7 },
                            space: "world"
                        },
                        {
                            mode: "dir",
                            color: { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse: true,
                            specular: true,
                            dir: { x: -1.0, y: -0.9, z: 0.7 },
                            space: "world"
                        }
                    ],

                    nodes: [

                        // Skybox with grid pattern, implemented by plugin at:
                        // http://scenejs.org/api/latest/plugins/node/skybox/grid.js
                        {
                            type: "skybox/grid",
                            size: 5000 // Box half-size on each axis - default is 5000
                        },

                        // Reflection of grid skybox, implemented by plugin at:
                        // http://scenejs.org/api/latest/plugins/node/reflect/grid.js
                        {
                            type: "reflect/grid",
                            intensity: 0.2,

                            // Child nodes
                            nodes: [

                                // Default color
                                {
                                    type: "material",
                                    color: { r: 0.6, g: 0.6, b: 0.9 },

                                    nodes: [
                                        {
                                            type: "rotate",
                                            y: 1.0,
                                            id: rotateId,

                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: scale,
                                                    y: scale,
                                                    z: scale,

                                                    nodes: params.nodes
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

        var scene = this.getScene();
        scene.getNode(rotateId,
            function (rotate) {
                scene.on("tick",
                    function (params) {
                        var elapsed = (params.time - params.prevTime) * 0.001;
                        rotate.incAngle(elapsed * 5.0);
                    });
            });
    }
});