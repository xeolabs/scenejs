function mouseOrbitUtility(scene) {


// Get handles to scene nodes

    var yawNode = scene.getNode("yaw");
    var pitchNode = scene.getNode("pitch");

// Rotate with mouse drags

    var lastX;
    var lastY;
    var dragging = false;

    var newInput = false;
    var yaw = 0;
    var pitch = 0;

    var canvas = scene.getCanvas();

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

            yaw += (posX - lastX) * 0.5;
            pitch += (posY - lastY) * 0.5;

            lastX = posX;
            lastY = posY;

            yawNode.set("angle", yaw);
            pitchNode.set("angle", pitch);
        }
    }

    canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mousemove', mouseMove, true);
    canvas.addEventListener('mouseup', mouseUp, true);
    canvas.addEventListener('touchstart', touchStart, true);
    canvas.addEventListener('touchmove', touchMove, true);
    canvas.addEventListener('touchend', touchEnd, true);
}