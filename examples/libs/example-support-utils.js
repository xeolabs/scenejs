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

    document.body.addEventListener('mousedown', mouseDown, true);
    document.body.addEventListener('mousemove', mouseMove, true);
    document.body.addEventListener('mouseup', mouseUp, true);
    document.body.addEventListener('touchstart', touchStart, true);
    document.body.addEventListener('touchmove', touchMove, true);
    document.body.addEventListener('touchend', touchEnd, true);
}


function mousePanLookatUtility(scene) {

// Get handles to scene nodes

    var lookatNode = scene.getNode("lookat");

// Pan with mouse drags

    var lastX;
    var lastY;
    var dragging = false;

    var xeye = 0;
    var yeye = 0;

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

            xeye -= (posX - lastX) * 0.5;
            yeye -= (posY - lastY) * 0.5;

            lastX = posX;
            lastY = posY;

            lookatNode.set({
                eye:{ x:xeye, y:yeye }
            });
        }
    }

    document.body.addEventListener('mousedown', mouseDown, true);
    document.body.addEventListener('mousemove', mouseMove, true);
    document.body.addEventListener('mouseup', mouseUp, true);
    document.body.addEventListener('touchstart', touchStart, true);
    document.body.addEventListener('touchmove', touchMove, true);
    document.body.addEventListener('touchend', touchEnd, true);
}