/**
 *
 * Quaternion-based viewing transform with pan, zoom and rotate, plus separate orbit and first-person modes.
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Example #1</p>
 * <pre>
 * someNode.addNode({
 *      type: "cameras/trackball",
 *
 *      // Initial params
 *      eye:{ x: y:0 },
 *      look:{ y:0 },
 *      up: { y: 1 },
 *
 *      // Will orbit about the 'look' point (default)
 *      // otherwise will orbit about 'eye'
 *      orbit:true,
 *
 *      // Will bind to mouse drag for rotate and wheel for zoom (default),
 *      // otherwise you'll need to hok up your own mouse handlers
 *      input: true,
 *
 *      // Zoomed in to half-way between initial 'eye' and 'look'
 *      zoom: 0.5,
 *
 *      // Sensitivity of mouse wheel in controlling zoom
 *      zoomSensitivity:10.0,
 * });
 * </pre>
 *
 * <p>The camera is initially positioned at the given 'eye' and 'look', then the distance of 'eye' is zoomed out
 * away from 'look' by the amount given in 'zoom', and then 'eye' is rotated by 'yaw' and 'pitch'.</p>
 *
 */
SceneJS.Types.addType("cameras/trackball", {

    construct: function (params) {

        var self = this;

        this._zoom = params.zoom || 1.0;
        this._zoomRange = params.zoomRange; // Can be undefined, then lazy-calculated in _update

        this._pan = params.pan || [0, 0, 0];

        this._q = null;
        this._mat = SceneJS_math_identityMat4();

        this._lookat = this.addNode({
            type: "lookAt",
            eye: params.eye,
            look: params.look,
            up: params.up,
            nodes: params.nodes
        });

        this._orbit = params.orbit !== false;

        if (params.input !== false) {

            // Internally-managed default input handling

            var x;
            var y;
            var lastX;
            var lastY;
            var dragging = false;

            var rotateSensitivity = params.rotateSensitivity || 0.1;
            var zoomSensitivity = params.zoomSensitivity || 1.0;

            var canvas = this.getScene().getCanvas();

            function mouseDown(event) {
                x = event.clientX;
                y = event.clientY;
                lastX = x;
                lastY = y;
                dragging = true;
            }

            function touchStart(event) {
                x = event.targetTouches[0].clientX;
                y = event.targetTouches[0].clientY;
                lastX = x;
                lastY = y;
                dragging = true;
            }

            function mouseUp() {
                dragging = false;
            }

            function touchEnd() {
                dragging = false;
            }

            function mouseMove(event) {
                x = event.clientX;
                y = event.clientY;
                if (dragging) {
                    drag(x - lastX, y - lastY, 0);
                }
                lastX = x;
                lastY = y;
            }

            function touchMove(event) {
                x = event.targetTouches[0].clientX;
                y = event.targetTouches[0].clientY;
                if (dragging) {
                    drag(x - lastX, y - lastY, 0);
                }
                lastX = x;
                lastY = y;
            }

            function drag(x, y) {
                self._update([
                    SceneJS_math_angleAxisQuaternion(0.0, 1.0, 0.0, -x * rotateSensitivity),
                    SceneJS_math_angleAxisQuaternion(1.0, 0.0, 0.0, y * rotateSensitivity)
                ]);
            }

            function mouseWheel(event) {
                var delta = 0;
                if (!event) event = window.event;
                if (event.wheelDelta) {
                    delta = event.wheelDelta / 120;
                    if (window.opera) delta = -delta;
                } else if (event.detail) {
                    delta = -event.detail / 3;
                }
                if (delta) {
                    var deltaZoom = 0;
                    if (delta < 0) {
                        deltaZoom = -zoomSensitivity;
                    } else {
                        deltaZoom = zoomSensitivity;
                    }
                    self.addZoom(deltaZoom);
                }
                if (event.preventDefault) {
                    event.preventDefault();
                }
                event.returnValue = false;
            }

            canvas.addEventListener('mousedown', mouseDown, true);
            canvas.addEventListener('mousemove', mouseMove, true);
            canvas.addEventListener('mouseup', mouseUp, true);
            canvas.addEventListener('touchstart', touchStart, true);
            canvas.addEventListener('touchmove', touchMove, true);
            canvas.addEventListener('touchend', touchEnd, true);
            canvas.addEventListener('mousewheel', mouseWheel, true);
            canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

            this._removeCanvasListeners = function() {
                canvas.removeEventListener('mousedown', mouseDown, true);
                canvas.removeEventListener('mousemove', mouseMove, true);
                canvas.removeEventListener('mouseup', mouseUp, true);
                canvas.removeEventListener('touchstart', touchStart, true);
                canvas.removeEventListener('touchmove', touchMove, true);
                canvas.removeEventListener('touchend', touchEnd, true);
                canvas.removeEventListener('mousewheel', mouseWheel, true);
                canvas.removeEventListener('DOMMouseScroll', mouseWheel, true);
            }
        }

        this._update();
    },

    setOrbit: function (orbit) {
        this._orbit = orbit;
        this._update();
    },

    getOrbit: function () {
        return this._orbit
    },

    setLookat: function (params) {
        this._lookat.set(params); // Update scene
        this._q = null; // Reset quaternion rotation
        this._pan = [0, 0, 0];
        this._zoomRange = null;
    },

    getLookat: function () {
        return {
            eye: this._lookat.getEye(),
            look: this._lookat.getLook(),
            up: this._lookat.getUp()
        };
    },

    addRotation: function (rotation) {
        this._update([
            SceneJS_math_angleAxisQuaternion(rotation.x || 0, rotation.y || 0, rotation.z || 0, rotation.angle || 0)
        ]);
    },

    addRotations: function (rotations) {
        var q = [];
        var rotation;
        for (var i = 0, len = rotations.length; i < len; i++) {
            rotation = rotations[i];
            q.push(SceneJS_math_angleAxisQuaternion(rotation.x || 0, rotation.y || 0, rotation.z || 0, rotation.angle || 0))
        }
        this._update(q);
    },

    setZoomRange: function (zoomRange) {
        this._zoomRange = zoomRange;
        this._update();
    },

    getZoomRange: function () {
        return this._zoomRange;
    },

    setZoom: function (zoom) {
        this._zoom = zoom < 0 ? 0 : (zoom > 1.0 ? 1.0 : zoom);
        this._update();
    },

    addZoom: function (zoom) {
        this.setZoom(this._zoom + zoom);
    },

    getZoom: function () {
        return this._zoom;
    },

    setPan: function (pan) {
        this._pan = pan;
        this._update();
    },

    addPan: function (pan) {
        this._update(null, pan);
    },

    getPan: function () {
        return this._pan;
    },

    _update: function (rotations, pan) {

        if (!this._q) {
            this._q = SceneJS_math_identityQuaternion();
            this._eye = this._objToArray(this._lookat.getEye());
            this._look = this._objToArray(this._lookat.getLook());
            this._up = this._objToArray(this._lookat.getUp());
        }

        if (!this._zoomRange) {
            // Set zoom range to distance between current eye and look
            var eyeLookVec = SceneJS_math_subVec3(this._eye, this._look, []);
            this._zoomRange = [0, Math.abs(SceneJS_math_lenVec3(eyeLookVec))];
        }

        if (rotations) {
            for (var i = 0, len = rotations.length; i < len; i++) {
                this._q = SceneJS_math_mulQuaternions(this._q, rotations[i]);
            }
            this._mat = SceneJS_math_newMat4FromQuaternion(this._q);
        }

        var eye2;
        var look2;
        var up2;

        if (this._orbit) {

            var zoom = this._zoomRange[0] + (this._zoom * (this._zoomRange[1] - this._zoomRange[0]));

            eye2 = SceneJS_math_subVec3(this._eye, this._look, []);
            eye2 = SceneJS_math_transformVector3(this._mat, eye2, []);
            eye2 = SceneJS_math_normalizeVec3(eye2);
            eye2 = SceneJS_math_mulVec3Scalar(eye2, zoom);
            eye2 = SceneJS_math_addVec3(eye2, this._look, []);
            look2 = this._look;

        } else {

            look2 = SceneJS_math_subVec3(this._look, this._eye, []);
            look2 = SceneJS_math_transformVector3(this._mat, look2, []);
            look2 = SceneJS_math_addVec3(look2, this._eye, []);
            eye2 = this._eye;
        }

        if (pan) {
            pan = SceneJS_math_transformVector3(this._mat, pan, []);
            SceneJS_math_addVec3(this._pan, pan);
        }

        eye2 = SceneJS_math_addVec3(eye2, this._pan, []);
        look2 = SceneJS_math_addVec3(look2, this._pan, []);
        up2 = SceneJS_math_transformVector3(this._mat, this._up, []);

        this._lookat.setEye({x: eye2[0], y: eye2[1], z: eye2[2] });
        this._lookat.setLook({x: look2[0], y: look2[1], z: look2[2] });
        this._lookat.setUp({x: up2[0], y: up2[1], z: up2[2] });
    },

    _objToArray: function (v) {
        return [v.x, v.y, v.z];
    },

    _arrayToObj: function (v) {
        return { x: v[0], y: v[1], z: v[2] };
    },

    destruct: function () {
        if (this._removeCanvasListeners) {
            this._removeCanvasListeners();
        }
    }
});

