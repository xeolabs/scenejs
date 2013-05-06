function mouseOrbitUtility_OLD(scene) {

    var canvas = scene.getCanvas();
    var yawNode = scene.getNode("yaw");
    var pitchNode = scene.getNode("pitch");

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

    function mouseUp(event) {
        if (lastX == event.clientX && lastY == event.clientY) {
            //  scene.pick(lastX, lastY);
        }
        dragging = false;
    }

    function touchEnd(event) {
        if (lastX == event.clientX && lastY == event.clientY) {
            //   scene.pick(lastX, lastY);
        }
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


function new SceneJS.OrbitControl(scene); {

// Get handles to scene nodes

    var lookatNode;

    scene.eachNode(
        function () {
            if (this.get("type") == "lookAt") {
                lookatNode = this;
                return true;
            }
        });

    if (!lookatNode) {
        lookatNode = scene.insertNode({
            type:"lookAt"
        });
    }

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

            xeye -= (posX - lastX) * 0.1;
            yeye -= (posY - lastY) * 0.1;

            lastX = posX;
            lastY = posY;

            lookatNode.set({
                eye:{ x:xeye, y:yeye, z:xeye + 5 }
//                ,
//                look:{ x:xeye, y:yeye, z: xeye }
            });
        }
    }

    canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mousemove', mouseMove, true);
    canvas.addEventListener('mouseup', mouseUp, true);
    canvas.addEventListener('touchstart', touchStart, true);
    canvas.addEventListener('touchmove', touchMove, true);
    canvas.addEventListener('touchend', touchEnd, true);
}