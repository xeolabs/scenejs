/**
 * Pre-made scene environment
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>This environment has:</p>
 *
 * <ul>
 *     <li>lights</li>
 *     <li>clouds sky box</li>
 *     <li>clouds reflection map</li>
 *     <li>grassy ground</li>
 *     <li>depth-of-field post-effect</li>
 *     <li>camera that flies to and orbits wherever you ray-pick</li>
 * </ul>
 *
 * <p>Usage:</p>
 * .
 * <pre>
 * someNode.addNode({
 *      type: "environments/lawn",
 *      nodes: [
 *          {
 *              type: "models/buildings/city"
 *          }
 *      ]
 *  });
 * </pre>
 */
SceneJS.Types.addType("environments/lawn", {

    construct: function (params) {

        var cameraId = this.getId() + ".camera";
        var effectId = this.getId() + ".effect";

        this.addNode({
            type: "cameras/pickFlyOrbit",
            id: cameraId,
            yaw: -40,
            pitch: -20,
            maxPitch: -10,
            minPitch: -80,
            zoom: 800,
            eye: { x: 0, y: 150, z: -1000 },
            look: { x: 0, y: 150, z: 0 },
            zoomSensitivity: 20.0,
            showPick: true,
            showCursor: true,

            nodes: [
                {
                    type: "postprocess/dof",
                    id: effectId,
                    texelSize: 0.00022,
                    blurCoeff: 0.0084,
                    focusDist: 500.0,
                    ppm: 10000,
                    near: 0.1,
                    far: 10000.0,

                    nodes: [
                        {
                            type: "lights",
                            lights: [
                                {
                                    mode: "ambient",
                                    color: { r: 0.7, g: 0.7, b: 0.9 },
                                    diffuse: false,
                                    specular: false
                                },
                                {
                                    mode: "dir",
                                    color: { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse: true,
                                    specular: false,
                                    dir: { x: 1.0, y: -0.9, z: -0.7 },
                                    space: "world"
                                },
                                {
                                    mode: "dir",
                                    color: { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse: true,
                                    specular: false,
                                    dir: { x: -1.0, y: -0.9, z: 0.7 },
                                    space: "world"
                                }
                            ],

                            nodes: [
                                {
                                    type: "skybox/clouds",
                                    size: 10000
                                },
                                {
                                    type: "reflect/clouds",
                                    intensity: 0.4,
                                    nodes: params.nodes
                                },
                                {
                                    type: "models/ground/grid"
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
});
