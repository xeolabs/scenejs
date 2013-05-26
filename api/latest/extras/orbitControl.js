/**
 * @class Mouse control to orbit a scene's {@link SceneJS.Lookat}.
 * <p>Searches the given scene depth-first for a {@link SceneJS.Lookat} and inserts one at the root if not found.</p>
 * <p>Converts mouse events on the scene's canvas into orbit and zoom updates.</p>
 * @param {SceneJS.Scene} scene Scene graph to control
 * @param {*} options Control options
 * @constructor
 */
SceneJS.OrbitControls = function (scene, options) {

    options = options || {};

    var yaw = options.yaw || 0;
    var pitch = options.pitch || 0;
    var zoom = options.zoom || 10;
    var zoomSensitivity = options.zoomSensitivity || 1.0;

    var lastX;
    var lastY;
    var dragging = false;

    var lookatNode;

    // Find lookat node
    scene.eachNode(
        function () {
            if (this.get("type") == "lookAt") {
                lookatNode = this;
                return true;
            }
        }, {
            depthFirst:true
        });

    // Insert lookat node if not found
    if (!lookatNode) {
        lookatNode = scene.insertNode({
            type:"lookAt"
        });
    }

    var eye = options.eye || { x:0, y:0, z:0 };
    var look = options.look || { x:0, y:0, z:0};

    lookatNode.set({
        eye:{ x:eye.x, y:eye.y, z:-zoom },
        look:{ x:look.x, y:look.y, z:look.z },
        up:{ x:0, y:1, z:0 }
    });

    update();

    var canvas = scene.getCanvas();

    canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mousemove', mouseMove, true);
    canvas.addEventListener('mouseup', mouseUp, true);
    canvas.addEventListener('touchstart', touchStart, true);
    canvas.addEventListener('touchmove', touchMove, true);
    canvas.addEventListener('touchend', touchEnd, true);
    canvas.addEventListener('mousewheel', mouseWheel, true);
    canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

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

            yaw -= (posX - lastX) * 0.1;
            pitch -= (posY - lastY) * 0.1;

            update();

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
                zoom -= zoomSensitivity;
            } else {
                zoom += zoomSensitivity;
            }
        }
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
        update();

    }

    function update() {

        var eye = [0, 0, zoom];
        var look = [0, 0, 0];
        var up = [0, 1, 0];

        var eyeVec = SceneJS_math_subVec3(eye, look, []);
        var axis = SceneJS_math_cross3Vec3(up, eyeVec, []);

        var pitchMat = SceneJS_math_rotationMat4v(pitch * 0.0174532925, axis);
        var yawMat = SceneJS_math_rotationMat4v(yaw * 0.0174532925, up);


        var eye3 = SceneJS_math_transformPoint3(pitchMat, eye);
        eye3 = SceneJS_math_transformPoint3(yawMat, eye3);

        lookatNode.setEye({x:eye3[0], y:eye3[1], z:eye3[2] });
    }

};