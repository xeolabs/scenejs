/**
 Oculus Rift effect node

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>

 // Create scene for Oculus Rift

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

                    // Oculus Rift effect, implemented by plugin at:
                    // http://scenejs.org/api/latest/plugins/node/effects/oculusRift.js
                    {
                        type: "effects/oculusRift",

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
SceneJS.Types.addType("effects/oculusRift", {

    construct: function (params) {

        // Reference lookat
        // initialised on pre-compile
        this._lookat = null;

        // First stage
        // Renders the scene to a color target
        this._stage1 = this.addNode({
            type: "stage",
            priority: 1,
            pickable: true // Use this stage for picking
        });

        // First stage renders the scene to a color target
        this._colorTarget = this._stage1.addNode({
            type: "colorTarget"
        });

        this._camera = this._colorTarget.addNode({
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

        // Second stage
        // Pipes the color target through a lens distortion shader
        this._stage2 = this.addNode({
            type: "stage",
            priority: 2
        });

        // Feed color target into the second stage as a texture
        this._texture = this._stage2.addNode({
            type: "textureMap",
            target: this._colorTarget.getId()
        });

        // Lens distortion shader
        this._shader = this._texture.addNode({
            type: "shader",
            shaders: [

                // Vertex stage just passes through the positions and UVs
                {
                    stage: "vertex",
                    code: [

                        "attribute vec3 SCENEJS_aVertex;",
                        "attribute vec2 SCENEJS_aUVCoord;",

                        "varying vec3 vPos;",
                        "varying vec2 vUv;",

                        "void main () {",
                        "   vPos = SCENEJS_aVertex;",
                        "   gl_Position = vec4(SCENEJS_aVertex, 1.0);",
                        "   vUv = SCENEJS_aUVCoord;",
                        "}"
                    ]
                },

                // Fragment shader applies distortion effect
                // TODO: chrome aberration like in https://github.com/yazk/yaztekWGL/blob/master/media/shaders/distort_fragment.glsl
                {
                    stage: "fragment",
                    code: [
                        "precision highp float;",

                        "uniform sampler2D SCENEJS_uSampler0;",
                        "uniform vec2 LensCenter;",
                        "uniform vec2 ScreenCenter;",
                        "uniform vec2 Scale;",
                        "uniform vec2 ScaleIn;",
                        "uniform vec4 HmdWarpParam;",
                        "uniform float eyeSign;",

                        "varying vec3 vPos;",
                        "varying vec2 vUv;",

                        "vec2 HmdWarp(vec2 in01) {",
                        "	vec2 theta = (in01 - LensCenter) * ScaleIn;",
                        "	float rSq = theta.x * theta.x + theta.y * theta.y;",
                        "	vec2 rvector = theta * (HmdWarpParam.x + HmdWarpParam.y * rSq +",
                        "		HmdWarpParam.z * rSq * rSq +",
                        "		HmdWarpParam.w * rSq * rSq * rSq);",
                        "	return LensCenter + Scale * rvector;",
                        "}",

                        "void main(){",
                        "   if (eyeSign < 0.0 && vPos.x > 0.0) {",
                        "       discard;",
                        "   }",
                        "   if (eyeSign > 0.0 && vPos.x < 0.0) {",
                        "       discard;",
                        "   }",
                        "	vec2 tc = HmdWarp(vUv);",
                        "	if (any(bvec2(clamp(tc,ScreenCenter-vec2(0.25,0.5), ScreenCenter+vec2(0.25,0.5)) - tc))) {",
                        "       gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
                        "	} else {",
                        "	    gl_FragColor = texture2D(SCENEJS_uSampler0, tc);",
                        "   }",
                        "}"
                    ]
                }
            ],

            params: {

                // These params will remain constant for both eyes:
                "Scale": [0.1469278, 0.2350845],
                "ScaleIn": [4, 5.0],
                "HmdWarpParam": [ 1, 0.22, 0.24, 0],

                // These params will be updated for each eye:
                "LensCenter": [0.0, 0.0],
                "ScreenCenter": [0.0, 0.0],

                // Indicates which eye we're rendering: -1 == left, +1 == right
                "eyeSign": 0
            }
        });

        //
        this._shader.addNode({
            type: "geometry/quad"
        });

        // Eye separation
        this._eyeSep = params.eyeSep || 0.2;

        this._focalLength = params.focalLength || 20.0;
    },

    preCompile: function () {
        this._build();
    },

    // Sets up multipass rendering for left and right eyes
    //
    // - Find a parent lookat node
    // - Configure scene to perform two passes per render
    // - Intercept passes for left and right eyes, adjusting scene state for each

    _build: function () {

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
        var ndfl = near / this._focalLength;
        var eyeSep = this._eyeSep || 10.0;

        // Eye separation vector, origin at left eye
        var sepVec;

        var self = this;

        // On first and second render passes, configure scene to render to left
        // and right halves of the canvas, respectively.
        this._renderingSub = scene.on("rendering",
            function (params) {

                if (!self._lookat) {
                    return;
                }

                var canvas = scene.getCanvas();
                var ratio = canvas.width / canvas.height;

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
                        sepVec = SceneJS_math_mulVec3Scalar(sepVec, eyeSep / 2.0, []);

                        var rightEye = { x: eye.x + sepVec[0], y: eye.y + sepVec[1], z: eye.z + sepVec[2] };
                        var rightLook = { x: look.x + sepVec[0], y: look.y + sepVec[1], z: look.z + sepVec[2] };

                        self._localLookat.setEye(rightEye);
                        self._localLookat.setLook(rightLook);

                        self._camera.set({
                            optics: {
                                left: -ratio * wd2 - 0.5 * eyeSep * ndfl,
                                right: ratio * wd2 - 0.5 * eyeSep * ndfl,
                                top: wd2,
                                bottom: -wd2
                            }
                        });

                        self._shader.setParams({
                            "LensCenter": [0.7136753, 0.5],
                            "ScreenCenter": [0.75, 0.5],
                            "eyeSign": 1
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

                        self._camera.set({
                            optics: {
                                left: -ratio * wd2 + 0.5 * eyeSep * ndfl,
                                right: ratio * wd2 + 0.5 * eyeSep * ndfl,
                                top: wd2,
                                bottom: -wd2
                            }
                        });

                        self._shader.setParams({
                            "LensCenter": [0.2863248, 0.5],
                            "ScreenCenter": [ 0.25, 0.5],
                            "eyeSign": 0
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
