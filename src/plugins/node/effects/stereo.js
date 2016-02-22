/**
 Stereo effect node

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>

 // Create scene with stereo view

 var scene = SceneJS.createScene({

        nodes: [

            // Mouse-orbited camera, implemented by plugin at
            // http://scenejs.org/api/latest/plugins/node/cameras/pickFlyOrbit.js
            {
                type: "cameras/orbit",
                yaw: 40,
                pitch: -20,
                zoom: 10,
                zoomSensitivity: 1.0,
                eye: { x: 0, y: 0, z: 10 },
                look: { x: 0, y: 0, z: 0 },

                nodes: [

                    // Stereo effect, implemented by plugin at:
                    // http://scenejs.org/api/latest/plugins/node/effects/stereo.js
                    {
                        type: "effects/stereo",
                        id: "myStereo",
                        eyeSep: 10, // Eye separation
                        focalLength: 100, // Focal length

                        nodes: [

                            // Teapot, implemented by plugin at:
                            // http://scenejs.org/api/latest/plugins/node/models/geometry/teapot.js
                            {
                                type: "geometry/teapot"
                            }
                        ]
                    }
                ]
            }
        ]
    });

 // Modify stereo params

 scene.getNode("myStereo",
 function(stereo) {

            stereo.setEyeSep(20.0);
            stereo.setFocalLength(150.0);

        });
 </pre>
 */
SceneJS.Types.addType("effects/stereo", {

    construct: function (params) {

        // Reference lookat
        // initialised on pre-compile
        this._lookat = null;

        // Renderer to control viewports
        this._renderer = this.addNode({
            type: "renderer"
        });

        this._camera = this._renderer.addNode({
            type: "camera",
            optics: {
                type: "frustum"
            }
        });

        // Local viewing transform
        this._localLookat = this._camera.addNode({
            type: "lookAt"
        });

        // Leaf node
        this._leaf = this._localLookat.addNode({
            id: this.id + ".leaf"
        });

        // Child nodes
        if (params.nodes) {
            this._leaf.addNodes(params.nodes);
        }

        this._eyeSep = params.eyeSep || 0.2;

        this._focalLength = params.focalLength || 20.0;
    },

    /**
     * Set eye separation distance
     * @param {Number} eyeSep
     */
    setEyeSep: function (eyeSep) {
        this._eyeSep = eyeSep;

        // Scene state is indirectly dependant on our new variable value
        // but needs to be notified that a re-render is needed to update it
        this.getScene().needFrame();
    },

    /**
     * Get eye separation distance
     * @returns {Number}
     */
    getEyeSep: function () {
        return this._eyeSep;
    },

    /**
     * Set focal length
     * @param {Number} focalLength
     */
    setFocalLength: function (focalLength) {
        this._focalLength = focalLength;

        // Scene state is indirectly dependant on our new variable value
        // but needs to be notified that a re-render is needed to update it
        this.getScene().needFrame();
    },

    /**
     * Get focal length
     * @returns {Number}
     */
    getFocalLength: function () {
        return this._focalLength;
    },

    preCompile: function () {
        this._build();
    },

    // Sets up multipass rendering for left and right eyes
    //
    // - Find a parent lookat node
    // - Configure scene to perform two passes per render
    // - Intercept passes for left and right eyes, adjusting camera, lookat and viewport accordingly on each pass

    _build: function () {

        // The scene graph root
        var scene = this.getScene();

        if (this._renderingSub) {
            scene.off(this._renderingSub);
        }

        this._lookat = this._findLookat();

        if (!this._lookat) {
            return;
        }

        // Configure scene to render twice on each render, once for each eye
        scene.setNumPasses(2);

        var aperture = 45;

        var near = 0.1;
        var DTOR = 0.0174532925;
        var radians = DTOR * aperture / 2;
        var wd2 = near * Math.tan(radians);

        // Eye separation vector, origin at left eye
        var sepVec;

        var self = this;

        // On first and second render passes, configure scene to render to left
        // and right halves of the canvas, respectively
        this._renderingSub = scene.on("rendering",
            function (params) {

                var canvas = scene.getCanvas();
                var halfWidth = canvas.width / 2.0;
                var height = canvas.height;
                var ratio = canvas.width / canvas.height;
                var ndfl = near / self._focalLength;

                switch (params.pass) {

                    case 0:

                        // Right eye

                        var eye = self._lookat.getEye();
                        var look = self._lookat.getLook();
                        var _eye = [eye.x, eye.y, eye.z];
                        var _look = [look.x, look.y, look.z];
                        var _up = [0, 1, 0];

                        // Derive the two eye positions
                        var eyeVec = SceneJS_math_subVec3(_eye, _look, []);

                        sepVec = SceneJS_math_cross3Vec3(_up, eyeVec, []);
                        sepVec = SceneJS_math_normalizeVec3(sepVec, []);
                        sepVec = SceneJS_math_mulVec3Scalar(sepVec, self._eyeSep / 2.0, []);

                        var rightEye = { x: eye.x + sepVec[0], y: eye.y + sepVec[1], z: eye.z + sepVec[2] };
                        var rightLook = { x: look.x + sepVec[0], y: look.y + sepVec[1], z: look.z + sepVec[2] };

                        self._localLookat.setEye(rightEye);
                        self._localLookat.setLook(rightLook);

                        self._camera.setOptics({
                            left: -ratio * wd2 - 0.5 * self._eyeSep * ndfl,
                            right: ratio * wd2 - 0.5 * self._eyeSep * ndfl,
                            top: wd2,
                            bottom: -wd2
                        });

                        //
                        self._renderer.setViewport({
                            x: halfWidth,
                            y: 0,
                            width: halfWidth,
                            height: height
                        });

                        break;

                    case 1:

                        // Left eye

                        var eye = self._lookat.getEye();
                        var look = self._lookat.getLook();
                        var leftEye = { x: eye.x - sepVec[0], y: eye.y - sepVec[1], z: eye.z - sepVec[2] };
                        var leftLook = { x: look.x - sepVec[0], y: look.y - sepVec[1], z: look.z - sepVec[2] };

                        self._localLookat.setEye(leftEye);
                        self._localLookat.setLook(leftLook);

                        self._camera.setOptics({
                            left: -ratio * wd2 + 0.5 * self._eyeSep * ndfl,
                            right: ratio * wd2 + 0.5 * self._eyeSep * ndfl,
                            top: wd2,
                            bottom: -wd2
                        });

                        //
                        self._renderer.setViewport({
                            x: 0,
                            y: 0,
                            width: halfWidth,
                            height: height
                        });

                        break;
                }
            });
    },

    _findLookat: function () {
        var node = this.parent;
        while (node && node.type != "lookAt") {
            node = node.parent
        }
        return node;
    }
});
