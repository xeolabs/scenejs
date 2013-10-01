/**
 * @class Mouse control to pick scene objects.
 * @param {SceneJS.Scene} scene Scene graph to control
 * @param {*} options Control options
 * @constructor
 */
SceneJS.PickControls = function (scene, options) {

    options = options || {};

    var canvas = scene.getCanvas();

    canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mouseup', mouseUp, true);
    canvas.addEventListener('touchstart', touchStart, true);
    canvas.addEventListener('touchend', touchEnd, true);

    var lastX;
    var lastY;
    var dragging;

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
        if (dragging) {
            scene.pick(event.clientX, event.clientY);
        }
        dragging = false;
    }

    function touchEnd() {
        if (dragging) {
            scene.pick(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
        }
        dragging = false;
    }
};