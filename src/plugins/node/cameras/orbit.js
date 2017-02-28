/**
 * Orbiting camera node type
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Usage</p>
 * <pre>
 * someNode.addNode({
 *      type: "cameras/orbit",
 *      eye:{ x: y:0 },
 *      look:{ y:0 },
 *      yaw: 340,,
 *      pitch: -20,
 *      zoom: 350,
 *      zoomSensitivity:10.0,
 * });
 * </pre>
 * <p>The camera is initially positioned at the given 'eye' and 'look', then the distance of 'eye' is zoomed out
 * away from 'look' by the amount given in 'zoom', and then 'eye' is rotated by 'yaw' and 'pitch'.</p>
 *
 */
SceneJS.Types.addType("cameras/orbit", {

    construct: function (params) {

        this._lookat = this.addNode({
            type: "lookAt",

            // A plugin node type is responsible for attaching specified
            // child nodes within itself
            nodes: params.nodes
        });

        this.yaw = params.yaw || 0;
        this.pitch = params.pitch || 0;
        this.zoom = params.zoom || 10;
        this.minPitch = params.minPitch;
        this.maxPitch = params.maxPitch;
        this.zoomSensitivity = params.zoomSensitivity || 1.0;

        this.eye = params.eye || { x: 0, y: 0, z: 0 };
        this.look = params.look || { x: 0, y: 0, z: 0};
        this.up = params.up || { x: 0, y: 1, z: 0 };

        this._lookat.setEye({ x: this.eye.x, y: this.eye.y, z: this.eye.z });
        this._lookat.setLook({ x: this.look.x, y: this.look.y, z: this.look.z });
        this._lookat.setUp({ x: this.up.x, y: this.up.y, z: this.up.z });

        if (params.spin || params.spinYaw || params.spinPitch) {
            if (params.spin) {
                this.spinYaw = params.spin;
            } else {
                this.spinYaw = params.spinYaw || 0.0;
                this.spinPitch = params.spinPitch || 0.0;
            }

            this._tick = this.getScene().on("tick",
                function () {
                    this.yaw -= this.spinYaw;
                    this.pitch -= this.spinPitch;
                    this._update();
                });
        }

        var canvas = this.getScene().getCanvas();

        var self = this;
        var lastX;
        var lastY;
        var dragging = false;
        var lookatDirty = false;

        function mouseDown(event) {
            lastX = event.clientX;
            lastY = event.clientY;
            dragging = true;
        }

        function touchStart(event) {
            lastX = event.targetTouches[0].clientX;
            lastY = event.targetTouches[0].clientY;
            dragging = true;
        }

        function mouseUp() {
            dragging = false;
        }

        function touchEnd() {
            dragging = false;
        }

        function mouseMove(event) {
            var posX = event.clientX;
            var posY = event.clientY;
            actionMove(posX, posY);
        }

        function touchMove(event) {
            var posX = event.targetTouches[0].clientX;
            var posY = event.targetTouches[0].clientY;
            actionMove(posX, posY);
        }

        function actionMove(posX, posY) {
            if (dragging) {

                self.yaw -= (posX - lastX) * 0.1;
                self.pitch -= (posY - lastY) * 0.1;

                self._update();

                lastX = posX;
                lastY = posY;
            }
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
                if (delta < 0) {
                    self.zoom -= self.zoomSensitivity;
                } else {
                    self.zoom += self.zoomSensitivity;
                }
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
            self._update();
        }

        canvas.addEventListener('mousedown', mouseDown, true);
        canvas.addEventListener('mousemove', mouseMove, true);
        canvas.addEventListener('mouseup', mouseUp, true);
        canvas.addEventListener('touchstart', touchStart, true);
        canvas.addEventListener('touchmove', touchMove, true);
        canvas.addEventListener('touchend', touchEnd, true);
        canvas.addEventListener('mousewheel', mouseWheel, true);
        canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

        this._update();
    },

    setLook: function (l) {
        this.look = l;
        this._update();
    },

    setEye: function (e) {
        this.eye = e;
        this._update();
    },

    setUp: function (u) {
        this.up = u;
        this._update();
    },

    _update: function () {
        if (this.minPitch != undefined && this.pitch < this.minPitch) {
            this.pitch = this.minPitch;
        }

        if (this.maxPitch != undefined && this.pitch > this.maxPitch) {
            this.pitch = this.maxPitch;
        }

        var e = [this.eye.x, this.eye.y, this.zoom * this.eye.z];
        var l = [this.look.x, this.look.y, this.look.z];
        var u = [this.up.x, this.up.y, this.up.z];

        // TODO: These references are to private SceneJS math methods, which are not part of API
        var eyeVec = SceneJS_math_subVec3(e, l, []);
        var axis = SceneJS_math_cross3Vec3(u, eyeVec, []);

        var pitchMat = SceneJS_math_rotationMat4v(this.pitch * 0.0174532925, axis);
        var yawMat = SceneJS_math_rotationMat4v(this.yaw * 0.0174532925, u);

        var eye3 = SceneJS_math_transformPoint3(pitchMat, e);
        eye3 = SceneJS_math_transformPoint3(yawMat, eye3);

        this._lookat.setEye({x: eye3[0], y: eye3[1], z: eye3[2] });
        this._lookat.setLook(this.look);
        this._lookat.setUp(this.up);
    },

    destruct: function () {
        this.getScene().off(this.tick);
        // TODO: remove mouse handlers
    }
});
