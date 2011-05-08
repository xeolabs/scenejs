/**
 * Animated texture example
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 */

/*----------------------------------------------------------------------
 * Scene graph definition
 *---------------------------------------------------------------------*/

SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",

    nodes: [
        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: -10},
            look : { x : 0.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                 "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.3,
                            shine:          10.0,

                            nodes: [


                                /** Textures images are loaded asynchronously and won't render
                                 * immediately. On first traversal, they start loading their image,
                                 * which they collect on a subsequent traversal.
                                 */
                                {
                                    type: "texture",

                                    id: "theTexture",

                                    /* A texture can have multiple layers, each applying an
                                     * image to a different material reflection component.
                                     * This layer applies the Zod image to the diffuse
                                     * component, with animated scaling.
                                     */
                                    layers: [
                                        {
                                            canvasId:"the-2d-canvas",
                                            autoUpdate: true,
                                            minFilter: "linear",
                                            magFilter: "linear",
                                            wrapS: "repeat",
                                            wrapT: "repeat",
                                            isDepth: false,
                                            depthMode:"luminance",
                                            depthCompareMode: "compareRToTexture",
                                            depthCompareFunc: "lequal",
                                            flipY: false,
                                            width: 1,
                                            height: 1,
                                            internalFormat:"lequal",
                                            sourceFormat:"alpha",
                                            sourceType: "unsignedByte",
                                            applyTo:"baseColor",
                                            blendMode: "multiply",

                                            /* Texture rotation angle in degrees
                                             */
                                            rotate: 0.0,

                                            /* Texture translation offset
                                             */
                                            translate : {
                                                x: 0,
                                                y: 0
                                            },

                                            /* Texture scale factors
                                             */
                                            scale : {
                                                x: 1.0,
                                                y: 1.0
                                            }
                                        }
                                    ],

                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: "pitch",
                                            angle: -30.0,
                                            x : 1.0,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: "yaw",
                                                    angle: -30.0,
                                                    y : 1.0,

                                                    nodes: [
                                                        {
                                                            type: "cube"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

/**
 *   Liquid particles canvas experiment
 *   ©2010 spielzeugz.de
 */
(function() {

    var PI_2 = Math.PI * 2;

    var canvasW = 1000;
    var canvasH = 560;
    var numMovers = 600;
    var friction = .96;
    var movers = [];

    var canvas;
    var ctx;
    var canvasDiv;
    var outerDiv;

    var mouseX;
    var mouseY;
    var mouseVX;
    var mouseVY;
    var prevMouseX;
    var prevMouseY;
    var isMouseDown;


    function init() {
        canvas = document.getElementById("the-2d-canvas");

        if (canvas.getContext) {
            setup();
            setInterval(run, 33);
            trace('interact with the mouse, occasionally click or hold down the mousebutton<br /><a href="liquid-chars.html">remix/letters</a> | <a href="/">spielzeugz.de</a>');
        }
        else {
            trace("Sorry, needs the most recent version of Chrome, Firefox, Opera or Safari.");
        }
    }

    function setup() {
        outerDiv = document.getElementById("outer");
        canvasDiv = document.getElementById("canvasContainer");
        ctx = canvas.getContext("2d");

        var i = numMovers;
        while (i--) {
            var m = new Mover();
            m.x = canvasW * 0.5;
            m.y = canvasH * 0.5;
            m.vX = Math.cos(i) * Math.random() * 34;
            m.vY = Math.sin(i) * Math.random() * 34;
            movers[i] = m;
        }

        mouseX = prevMouseX = canvasW * 0.5;
        mouseY = prevMouseY = canvasH * 0.5;

        document.onmousedown = onDocMouseDown;
        document.onmouseup = onDocMouseUp;
        document.onmousemove = onDocMouseMove;
    }

    function run() {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(8,8,12,.65)";
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.globalCompositeOperation = "lighter";

        mouseVX = mouseX - prevMouseX;
        mouseVY = mouseY - prevMouseY;
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        var toDist = canvasW * 0.86;
        var stirDist = canvasW * 0.125;
        var blowDist = canvasW * 0.5;

        var Mrnd = Math.random;
        var Mabs = Math.abs;

        var i = numMovers;
        while (i--) {
            var m = movers[i];
            var x = m.x;
            var y = m.y;
            var vX = m.vX;
            var vY = m.vY;

            var dX = x - mouseX;
            var dY = y - mouseY;
            var d = Math.sqrt(dX * dX + dY * dY);
            if (d == 0) d = 0.001;
            dX /= d;
            dY /= d;

            if (isMouseDown) {
                if (d < blowDist) {
                    var blowAcc = ( 1 - ( d / blowDist ) ) * 14;
                    vX += dX * blowAcc + 0.5 - Mrnd();
                    vY += dY * blowAcc + 0.5 - Mrnd();
                }
            }

            if (d < toDist) {
                var toAcc = ( 1 - ( d / toDist ) ) * canvasW * 0.0014;
                vX -= dX * toAcc;
                vY -= dY * toAcc;
            }

            if (d < stirDist) {
                var mAcc = ( 1 - ( d / stirDist ) ) * canvasW * 0.00026;
                vX += mouseVX * mAcc;
                vY += mouseVY * mAcc;
            }

            vX *= friction;
            vY *= friction;

            var avgVX = Mabs(vX);
            var avgVY = Mabs(vY);
            var avgV = ( avgVX + avgVY ) * 0.5;

            if (avgVX < .1) vX *= Mrnd() * 3;
            if (avgVY < .1) vY *= Mrnd() * 3;

            var sc = avgV * 0.45;
            sc = Math.max(Math.min(sc, 3.5), 0.4);

            var nextX = x + vX;
            var nextY = y + vY;

            if (nextX > canvasW) {
                nextX = canvasW;
                vX *= -1;
            }
            else if (nextX < 0) {
                nextX = 0;
                vX *= -1;
            }

            if (nextY > canvasH) {
                nextY = canvasH;
                vY *= -1;
            }
            else if (nextY < 0) {
                nextY = 0;
                vY *= -1;
            }

            m.vX = vX;
            m.vY = vY;
            m.x = nextX;
            m.y = nextY;

            ctx.fillStyle = m.color;
            ctx.beginPath();
            ctx.arc(nextX, nextY, sc, 0, PI_2, true);
            ctx.closePath();
            ctx.fill();
        }
    }


    function onDocMouseMove(e) {
//        var ev = e ? e : window.event;
//        mouseX = ev.clientX - outerDiv.offsetLeft - canvasDiv.offsetLeft;
//        mouseY = ev.clientY - outerDiv.offsetTop - canvasDiv.offsetTop;
    }

    function onDocMouseDown(e) {
        isMouseDown = true;
        return false;
    }

    function onDocMouseUp(e) {
        isMouseDown = false;
        return false;
    }


    function Mover() {
        this.color = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
        this.y = 0;
        this.x = 0;
        this.vX = 0;
        this.vY = 0;
        this.size = 1;
    }


    function rect(context, x, y, w, h) {
        context.beginPath();
        context.rect(x, y, w, h);
        context.closePath();
        context.fill();
    }


    function trace(str) {
 //       document.getElementById("output").innerHTML = str;
    }


    window.onload = init;

})();

//var example = document.getElementById("the-2d-canvas");
//var context = example.getContext('2d');
//context.fillStyle = "rgb(255,0,0)";
//context.fillRect(30, 30, 50, 50);

/*----------------------------------------------------------------------
 * Enable scene graph compilation (disabled by default in V0.8).
 *
 * This feature is alpha status and may break some scene graphs.
 *
 * It can speed your scene graph up by an order of magnitude - we'll
 * do it here just to show how it's done.
 *
 * http://scenejs.wikispaces.com/V0.8+Branch
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    compilation : {
        enabled : false
    },
    webgl: {
        logTrace: true
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff
 *---------------------------------------------------------------------*/

var yaw = -30;
var pitch = -30;
var lastX;
var lastY;
var dragging = false;

var texAngle = 0.0;
var texScale = 1.0;

/* For texture animation
 */
var timeLast = (new Date()).getTime();

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;
        lastX = event.clientX;
        lastY = event.clientY;

        SceneJS.withNode("pitch").set("angle", pitch);
        SceneJS.withNode("yaw").set("angle", yaw);
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);

SceneJS.withNode("theScene").start();

