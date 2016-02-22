/**
 Anaglyph effect node

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>

 // Create scene with anaglyph view

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

                    // Anaglyph effect, implemented by plugin at:
                    // http://scenejs.org/api/latest/plugins/node/effects/anaglyph.js
                    {
                        type: "effects/anaglyph",

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

 </pre>
 */
SceneJS.Types.addType("effects/anaglyph", {

    construct: function (params) {

        // Reference lookat - initialised in #_preCompile
        this._lookat = null;

        // Renderer to disable blending
        this._renderer = this.addNode({
            type: "renderer"
        });

        // Color buffer to control color masking
        this._colorBuffer = this.addNode({
            type: "colorBuffer"
        });

        // For multipass, SceneJS clears all buffers before the first pass,
        // but leaves it to us to manually clear them, if we need to, before each subsequent pass.
        // For Anaglyph we just need to clear the depth buffer between passes.
        this._depthBuffer = this._colorBuffer.addNode({
            type: "depthBuffer",
            clear: true
        });

        // Camera for left and right frustums
        this._camera = this._depthBuffer.addNode({
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

        var scene = this.getScene();

        if (this._renderingSub) {
            scene.off(this._renderingSub);
        }

        this._initLookat();

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

                if (!self._lookat) {
                    return;
                }

                var canvas = scene.getCanvas();
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
                     //   var eyeSepOnProjection = eyeSep * _near / focalLength;

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

                        self._colorBuffer.setColorMask({
                            r: true,
                            g: false,
                            b: false,
                            a: true
                        });

                        break;

                    case 1:

                        // Left eye

                        self._renderer.setEnableBlend(true);

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

                        self._colorBuffer.setColorMask({
                            r: false,
                            g: true,
                            b: true,
                            a: true
                        });

                        break;
                }
            });
    },

    _initLookat: function () {
        var node = this.parent;
        while (node && node.type != "lookAt") {
            node = node.parent
        }
        if (node && (!this._lookat || node.id != this._lookat.id)) {
            if (this._lookat) {
                this._lookat.off(this._lookatSub);
            }
            this._lookat = node;
            var self = this;
            // Synchronise focus length with length of eye->look vector
            // Synch eye separation with focal length
            this._lookatSub = (!node) ? null : node.on("matrix",
                function () {
                    var look = self._lookat.getLook();
                    var eye = self._lookat.getEye();
                    self._focalLength = SceneJS_math_lenVec3([ look.x - eye.x, look.y - eye.y, look.z - eye.z ]);
                    self._eyeSep = self._focalLength / 45 * 0.5

                    // Scene state is indirectly dependant on our new variable value
                    // but needs to be notified that a re-render is needed to update it
                    self.getScene().needFrame();
                });
        }
    }
});
