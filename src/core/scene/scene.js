/**
 * Core scene graph management
 *
 */
var Human_scene = new (function () {

    /**
     *      timeStarted     - time engine started
     *      timeNow         - time at this tick
     *      timeLast        - time at last tick
     *      tick            - number of this tick, will wrap around when exceeding max Number range
     */
    Human.defineEvent("Scene.Tick", {
        isPublic:true,
        description:"Signals a 'tick', which is effectively the heartbeat of the engine " +
            "on which various processes periodically update themselves."
    });

    Human.defineEvent("Scene.Sleep", {
        isPublic:true,
        description:"Signals that the 3D scene is now in synch with all engine state and therefore " +
            "no frame render is pending. Now is a good time to perform tasks that" +
            " may be deferred while things are animating."
    });

    Human.defineEvent("Scene.CanvasResized", {
        isPublic:true,
        description:"Signals that the HTML canvas has been resized"
    });

    Human.defineEvent("Scene.Picked", {
        isPublic:true,
        description:"Signals that an element within the 3D scene has been picked."
    });

    Human.defineEvent("Scene.DoublePicked", {
        isPublic:true,
        description:"Signals that an element within the 3D scene has been double-picked (i.e. double-clicked)."
    });

    Human.defineEvent("Scene.NothingPicked", {
        isPublic:true,
        description:"Signals that empty space has been picked in the 3D scene (i.e. nothing was picked)."
    });

    Human.defineEvent("Scene.HoverPicked", {
        isPublic:true,
        description:"Signals that an element within the 3D scene has been hover-picked, where the mouse has rested over the element (i.e. moused over)."
    });

    Human.defineEvent("Scene.NothingHoverPicked", {
        isPublic:true,
        description:"Signals that empty space has been hover-picked in the 3D scene, where the mouse has rested over empty space (i.e. nothing was picked)."
    });

    var bgStandard = Human_configs.objectFx.background.standard;
    var bgStandardColorTop = bgStandard.color.top;
    var bgStandardColorBottom = bgStandard.color.bottom;

    var self = this;
    var scene;

    var mouseOverEvent = null;


    this.canvas = null;

    /*---------------------------------------------------------------------------
     * Scene definition
     *
     *--------------------------------------------------------------------------*/

    this.createScene = function () {

        SceneJS.reset();

        /* Define scene graph JSON representation (SceneJS API)
         */
        var json = {
            type:"scene",
            id:Human.SCENE_ROOT_ID,
            canvasId:Human.CANVAS_ID,
            contextAttr:{

                /* Default: false. If false, once the drawing buffer is presented as described in theDrawing Buffer
                 * section, the contents of the drawing buffer are cleared to their default values. All elements of the
                 * drawing buffer (color, depth and stencil) are cleared. If the value is true the buffers will not be
                 * cleared and will preserve their values until cleared or overwritten by the author.
                 * On some hardware setting the preserveDrawingBuffer flag to true can have significant performance implications.
                 */
                preserveDrawingBuffer:false, // http://code.google.com/p/chromium/issues/detail?id=82086
                antialias:true
            },

            nodes:[
                {
                    type:"renderer",

                    // id: "attach-lights-here",

                    clearColor:{
                        r:0.03,
                        g:0.03,
                        b:0.03,
                        a:bgStandard.texture ? 1.0 : 0.0
                    },

                    clear:{
                        depth:true,
                        color:true,
                        stencil:false
                    },

                    frontFace:"ccw",
                    enableCullFace:false,
                    cullFace:"back",
                    enableDepthTest:true,
                    lineWidth:3,

                    nodes:[

                        /*--------------------------------------------------------------------------------------
                         * View transform and camera - these are managed by a Human_camera
                         *------------------------------------------------------------------------------------*/

                        {
                            type:"camera",
                            id:Human.CAMERA_ID,

                            optics:{
                                type:"perspective",
                                aspect:$(window).width() / $(window).height(),
                                fovy:60,
                                near:0.01,
                                far:400.0
                            },

                            nodes:[

                                /*----------------------------------------------------------
                                 * Annotation lines
                                 *---------------------------------------------------------*/

                                // Don't rely on SceneJS default lookat for label wires
                                {
                                    type:"lookAt",
                                    eye:{ x:0.0, y:0.0, z:0.05 },
                                    look:{ x:0.0, y:0, z:0 },
                                    up:{ y:1.0 },

                                    nodes:[
                                        {
                                            type:"node",
                                            id:"annotation-lines"
                                        }
                                    ]
                                },

                                /*----------------------------------------------------------
                                 * Illuminated annotation labels in frustum space
                                 *---------------------------------------------------------*/

                                {
                                    type:"lights",
                                    lights:[
                                        {
                                            mode:"dir",
                                            color:{ r:1.0, g:1.0, b:1.0 },
                                            dir:{ x:0.0, y:0.0, z:-1.0 },
                                            diffuse:true,
                                            specular:true,
                                            space:"view"
                                        }
                                    ],
                                    nodes:[
                                        {
                                            type:"node",
                                            id:"annotation-labels"
                                        }
                                    ]
                                },

                                {

                                    type:"library",
                                    //        id:lineFlagsNodeId,

                                    flags:{
                                        //enabled: cfg.labelShown,
                                        enabled:true,
//                transparent:true,
                                        clipping:false
                                    }

                                },

                                /*----------------------------------------------------------
                                 * Background
                                 *---------------------------------------------------------*/

                                {
                                    type:"lookAt",
                                    eye:{ x:0, y:0, z:-30 },
                                    look:{ x:0, y:0, z:0 },
                                    up:{ x:0, y:1, z:.0 },
                                    id:Human.VIEW_SPACE_ID,

                                    nodes:[
                                        {
                                            type:"lights",
                                            lights:[
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:1.0 },
                                                    dir:{ x:0.0, y:0.0, z:-1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    space:"view"
                                                }
                                            ],

                                            nodes:[
                                                {
                                                    type:"material",
                                                    baseColor:{ r:.95, g:.95, b:.95 },
                                                    specularColor:{ r:0.0, g:0.0, b:0.0 },
                                                    emit:0.2,
                                                    specular:0.9,
                                                    shine:3.0,

                                                    nodes:[

//                                                        {
//                                                            type:"translate",
//                                                            x:5,
//                                                            nodes:[
//                                                                {
//                                                                    type:"rotate",
//                                                                    y:1,
//                                                                    angle: 0,
//                                                                    nodes:[
//                                                                        {
//                                                                            type:"material",
//                                                                            baseColor:{ r:1.0, g:1.0, b:1.0 },
//                                                                            specularColor:{ r:0.4, g:0.4, b:0.0 },
//                                                                            specular:0.2,
//                                                                            shine:6.0,
//
//                                                                            nodes:[
//
//                                                                                {
//                                                                                    type:"geometry",
//
//                                                                                    origin:{
//                                                                                        y:-2.5
//                                                                                    },
//
//                                                                                    primitive:"triangles",
//
//                                                                                    positions:[
//                                                                                        2, 2, 0,
//                                                                                        -2, 2, 0,
//                                                                                        -2, -2, 0,
//                                                                                        2, -2, 0
//                                                                                    ],
//
//                                                                                    normals:[
//                                                                                        0, 0, 1,
//                                                                                        0, 0, 1,
//                                                                                        0, 0, 1,
//                                                                                        0, 0, 1
//                                                                                    ],
//
//                                                                                    "uv":[
//                                                                                        1, 1,
//                                                                                        0, 1,
//                                                                                        0, 0,
//                                                                                        1, 0
//                                                                                    ],
//
//                                                                                    "indices":[
//                                                                                        2, 1, 0,
//                                                                                        3, 2, 0
//                                                                                    ]
//                                                                                }
//                                                                            ]
//                                                                        }
//                                                                    ]
//                                                                }
//                                                            ]
//                                                        },
                                                        {
                                                            type:"geometry",

                                                            primitive:"triangles",

                                                            id:"bgQuad",

                                                            positions:[
                                                                950, 200, 300,
                                                                -950, 200, 300,
                                                                -950, -200, 300,
                                                                950, -200, 300
                                                            ],

                                                            normals:[
                                                                0, 0, -1,
                                                                0, 0, -1,
                                                                0, 0, -1,
                                                                0, 0, -1
                                                            ],

                                                            uv:[
                                                                10, 10,
                                                                0, 10,
                                                                0, 0,
                                                                10, 0
                                                            ],

                                                            colors:[
                                                                bgStandardColorTop.r,
                                                                bgStandardColorTop.g,
                                                                bgStandardColorTop.b,
                                                                1.0,

                                                                bgStandardColorTop.r,
                                                                bgStandardColorTop.g,
                                                                bgStandardColorTop.b,
                                                                1.0,

                                                                bgStandardColorBottom.r,
                                                                bgStandardColorBottom.g,
                                                                bgStandardColorBottom.b,
                                                                1.0,

                                                                bgStandardColorBottom.r,
                                                                bgStandardColorBottom.g,
                                                                bgStandardColorBottom.b,
                                                                1.0
                                                            ],

                                                            indices:[
                                                                0, 1, 2, 0, 2, 3
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },

                                /*----------------------------------------------------------
                                 *
                                 *---------------------------------------------------------*/


                                {
                                    // Camera attributes will be overwritten by Human_camera
                                    type:"lookAt",

                                    id:Human.LOOKAT_ID,

                                    eye:{ x:0.0, y:0.0, z:55 },
                                    look:{ x:0.0, y:0, z:0 },
                                    up:{ y:1.0 },

                                    nodes:[
                                        {
                                            type:"lights",
                                            lights:[
                                                {
                                                    mode:"ambient",
                                                    color:{ r:0.1, g:0.1, b:0.1 },
                                                    diffuse:true
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:0.35, g:0.35, b:0.4 },
                                                    dir:{ x:-0.3, y:0.4, z:0.5 },
                                                    diffuse:true,
                                                    specular:true,
                                                    space:"view"
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.1, g:1.1, b:1.0 },
                                                    dir:{ x:0.2, y:-0.5, z:-1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    space:"view"
                                                }
                                            ],

                                            nodes:[

                                                /* Clip indicators
                                                 */
                                                {
                                                    type:"layer",
                                                    priority:10000,
                                                    nodes:[
                                                        {
                                                            type:"flags",
                                                            id:Human.CLIP_INDICATORS_ATTACH_ID,
                                                            flags:{
                                                                picking:false
                                                            }
                                                        }
                                                    ]
                                                },

                                                /* Clip planes
                                                 */
                                                {
                                                    type:"node",
                                                    id:Human.CLIP_ATTACH_ID
                                                },

                                                {
                                                    type:"clips",
                                                    id:"clips-node",

                                                    clips:[
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        },
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        },
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        },
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        },
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        },
                                                        {
                                                            mode:"disabled",
                                                            space:"world"
                                                        }
                                                    ],

                                                    nodes:[

                                                        /* Content
                                                         */
                                                        {
                                                            type:"material",
                                                            id:Human.MATERIAL_ROOT_ID,
                                                            emit:0,
                                                            baseColor:{ r:0.9, g:0.9, b:0.9 },
                                                            specularColor:{ r:0.9, g:0.9, b:0.9 },
                                                            specular:0.9,
                                                            shine:100.0,
                                                            nodes:[

                                                                /*---------------------------------------------------------------------
                                                                 * Null objects - hack to give global labels something to bind to.
                                                                 * Note we avoid scaling transforms around the null object, because
                                                                 * those will distort the offset that is fed into the "rendered"
                                                                 * handler.
                                                                 *
                                                                 * We have multiple null objects - one for labels, another for
                                                                 * annotations. For some reason those clobber each other when on
                                                                 * same null object.
                                                                 *--------------------------------------------------------------------*/

                                                                /* Null object #1
                                                                 */
                                                                {
                                                                    type:"node",
                                                                    id:Human.NULL_OBJECT_ID,
                                                                    nodes:[

                                                                        /* Infintesimally small dummy triangle.
                                                                         *
                                                                         * Was getting SceneJS problems with primitives like "points"
                                                                         * and "lines" where the lighting/shading states of other
                                                                         * "triangles" geometries subsequent in the scene
                                                                         * were not applied, ie. coming up black for some reason.
                                                                         */
                                                                        {
                                                                            type:"geometry",
                                                                            positions:[
                                                                                0, 0, 0,
                                                                                0.1, 0.1, 0.1,
                                                                                0.2, 0.2, 0.2
                                                                            ],
                                                                            indices:[0, 1, 2],
                                                                            uv:[0, 0, 1, 0, 1, 1],
                                                                            normals:[0, 1, 0, 0, 1, 0, 0, 1, 0],
                                                                            // Above error happens when normals missing
                                                                            primitive:"triangles"

                                                                        }
                                                                    ]
                                                                },

                                                                {
                                                                    type:"node",
                                                                    id:Human.NULL_OBJECT_ID2,

                                                                    nodes:[

                                                                        /* Infintesimally small dummy triangle.
                                                                         *
                                                                         * Was getting SceneJS problems with primitives like "points"
                                                                         * and "lines" where the lighting/shading states of other
                                                                         * "triangles" geometries subsequent in the scene
                                                                         * were not applied, ie. coming up black for some reason.
                                                                         */
                                                                        {
                                                                            type:"geometry",
                                                                            positions:[0, 0, 0, 0.1, 0.1, 0.1, 0.2, 0.2, 0.2],
                                                                            indices:[0, 1, 2],
                                                                            uv:[0, 0, 1, 0, 1, 1],
                                                                            normals:[0, 1, 0, 0, 1, 0, 0, 1, 0],
                                                                            // Above error happens when normals missing
                                                                            primitive:"triangles"

                                                                        }
                                                                    ]
                                                                },

                                                                /* Default flags at content root, overridden by
                                                                 * flags wrapping objects, morphs etc.
                                                                 */
                                                                {
                                                                    type:"flags",

                                                                    id:Human.CONTENT_ROOT_ID,

                                                                    flags:{
                                                                        picking:true,
                                                                        enabled:true,
                                                                        specular:true,
                                                                        backfaceLighting:true,
                                                                        backfaceTexturing:true,
                                                                        backfaces:true
                                                                    }
                                                                }

                                                            ]
                                                        },


                                                        /*---------------------------------------------------------------------------
                                                         * Object Boundary - shown when flying. rotating. panning etc
                                                         *--------------------------------------------------------------------------*/

                                                        {
                                                            type:"flags",

                                                            id:"object-boundary-flags",

                                                            flags:{
                                                                enabled:false,
                                                                transparent:true,
                                                                clipping:false
                                                            },

                                                            nodes:[
                                                                {
                                                                    type:"material",
                                                                    baseColor:{ r:0.0, g:1.0, b:0.0 },
                                                                    specularColor:{ r:0.0, g:1.0, b:0.0 },
                                                                    emit:1.0,
                                                                    alpha:0.4,
                                                                    nodes:[
                                                                        {
                                                                            type:"geometry",

                                                                            id:"object-boundary-geo",

                                                                            positions:[
                                                                                1.0, 1.0, 1.0,
                                                                                1.0, -1.0, 1.0,
                                                                                -1.0, -1.0, 1.0,
                                                                                -1.0, 1.0, 1.0,
                                                                                1.0, 1.0, -1.0,
                                                                                1.0, -1.0, -1.0,
                                                                                -1.0, -1.0, -1.0,
                                                                                -1.0, 1.0, -1.0
                                                                            ],
                                                                            primitive:"lines",
                                                                            indices:[
                                                                                0, 1, 1,
                                                                                2, 2, 3,
                                                                                3, 0, 4,
                                                                                5, 5, 6,
                                                                                6, 7, 7,
                                                                                4, 0, 4,
                                                                                1, 5, 2,
                                                                                6, 3, 7
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
                        }
                    ]
                }

            ]
        };

        var simulateWebGLContextLost = false;

        scene = SceneJS.createScene(json, { simulateWebGLContextLost:simulateWebGLContextLost });

        //  window._context = scene._engine.canvas.gl;

        if (simulateWebGLContextLost) {

            /**
             * Simulate WebGL context loss on interval
             */
            window.setInterval(
                function () {
                    //  alert("losing webgl context");
                    scene.loseWebGLContext();
                }, 15000);
        }

        // Create a SceneHub scene, bound to the SceneJS graph
//        window.Human_scenehub = (new SceneHub()).createScene({ // TODO: make not global somehow
//            // Hook our SceneHub scene into the SceneJS scene
//            scenejs:{
//                scene:Human.SCENE_ROOT_ID,
//                lookAt:Human.LOOKAT_ID,
//                camera:Human.CAMERA_ID,
//                world:Human.CONTENT_ROOT_ID
//            },
//            objects:[
//                {
//                    geometry:"prims.box",
//                    appearance:"heroes.superman",
//                    scale:{
//                        x:10,
//                        y:10,
//                        z:10
//                    },
//                    rotate:{
//                        x:1,
//                        y:1,
//                        z:1,
//                        angle:-20
//                    }
//                }
//            ]
//        });

        var resize = function () {

            var canvasInfo = self._fitCanvasToScreen(); // Fit canvas element

            //            var gl = scene.getGL();
            //            gl.viewport(0, 0, canvasInfo.width, canvasInfo.height);

            Human_camera.setAspect(canvasInfo.width / canvasInfo.height); // Fix camera aspect

            Human.fireEvent("Scene.CanvasResized", { // Notify observers
                canvasWidth:canvasInfo.width,
                canvasHeight:canvasInfo.height
            });

            //  scene.renderFrame({ force: true });
        };

        /* Resize canvas with browser window
         */
        $(window).resize(resize);

        resize();

        /*------------------------------------------------------------------------
         * Camera properties
         *----------------------------------------------------------------------*/

        var cameraNode = scene.getNode(Human.CAMERA_ID);

        Human_styles.subscribe({
            styleId:"scene.camera",
            props:{
                optics:{
                    fovy:60,
                    type:"perspective",
                    near:0.01,
                    far:400.0
                }
            },
            fn:function (props) {
                if (props.optics) {
                    cameraNode.setOptics(
                        Human._apply({
                            aspect:$(window).width() / $(window).height()
                        }, props.optics));
                }
            }
        });

        /*------------------------------------------------------------------------
         * Background style
         *----------------------------------------------------------------------*/

        Human_styles.subscribe({
            subId:"background",
            styleId:"background.default",
            props:{
                colors:[
                    0.05, 0.06, 0.07, 1.0, // top left (R,G,B,A)
                    0.05, 0.06, 0.07, 1.0, // top right
                    0.85, 0.9, 0.98, 1.0, // bottom right
                    0.85, 0.9, 0.98, 1.0   // bottom left
                ]
            },
            fn:function (props) {
                if (props.colors) {

                    var bgQuad = scene.findNode("bgQuad");

                    if (!bgQuad) {
                        Human.log.error("Scene node 'bgQuad' not found");
                        return;
                    }

                    bgQuad.setColors({
                        colors:props.colors
                    });
                }
            }
        });


        Human.onEvent({
            type:"Object.PropertyChanged",
            mask:{
                objectId:"Configs",
                propertyId:"lights"
            },
            fn:function (params) {

                //                /* Destroy existing lights node, if any
                //                 */
                //                var lightsNode = Human_scene.getNode("bd-human-lights");
                //                if (lightsNode) {
                //                    lightsNode.destroy();
                //                }
                //
                //                /* Create new lights node
                //                 */
                //                var lights = params.propertyValue;
                //                var light;
                //                var lightsJSON = [];
                //
                //                for (var i = 0, len = lights.length; i < len; i++) {
                //                    light = lights[i];
                //                    lightsJSON.push({
                //                        type: "light",
                //                        mode: light.mode,
                //                        dir : light.dir,
                //                        color : light.color,
                //                        diffuse: light.diffuse,
                //                        specular: light.specular
                //                    });
                //                }
                //
                //                Human_scene.getNode("attach-lights-here").add("node", {
                //                    type: "node",
                //                    id: "bd-human-lights",
                //                    nodes: lightsJSON
                //                });
            }
        });
    };

    /*---------------------------------------------------------------------------
     * Render loop control
     *
     *--------------------------------------------------------------------------*/

    this.startScene = function (params) {

        var timeStarted = (new Date()).getTime();
        var timeLast = timeStarted;
        var tick = 0;

        if (!this._listenersBound) {
            this._listenersBound = true;

            scene.on("tick",
                function (event) {

                    /*--------------------------------------------------------------
                     * The mouseover event is buffered then converted into a SceneJS
                     * pick operation during the renderer idle function, before the
                     * TICK event is fired.
                     *
                     * The pick operation must be done synchronously with respect
                     * to the render loop.
                     *
                     * When the mouseover was converted into the pick operation
                     * asynchronously (after a timeout), this created a black
                     * flickering, which was possibly due to asynch disruption of
                     * the SceneJS render loop.
                     *-------------------------------------------------------------*/

                    if (mouseOverEvent) {

                        var hit = scene.pick(mouseOverEvent.x, mouseOverEvent.y);

                        // HACK: Fixes black flicker after picking
                        scene.renderFrame({ force:true });

                        var canvasX = mouseOverEvent.x;
                        var canvasY = mouseOverEvent.y;

                        mouseOverEvent = null;

                        if (hit) {

                            var event = {
                                canvasPos:{
                                    x:canvasX,
                                    y:canvasY
                                }
                            };

                            var pickName = hit.name;
                            var object = Human_anatomy.objects[pickName];
                            if (object) {
                                event.objectId = object.objectId;
                                event.fmaId = object.fmaId;
                            } else {
                                event.pickName = pickName;
                            }

                            Human.fireEvent("Scene.HoverPicked", event);

                        } else {

                            Human.fireEvent("Scene.NothingHoverPicked");
                        }

                    } else {

                        var timeNow = (new Date()).getTime();

                        Human.fireEvent("Scene.Tick", {
                            timeStarted:timeStarted,
                            timeLast:timeLast,
                            timeNow:timeNow,
                            tick:tick
                        });

                        timeLast = timeNow;
                        tick++;
                    }

                });

            scene.on("sleep",
                function () {
                    Human.fireEvent("Scene.Sleep");
                });
        }

        scene.start();
    };

    this.stopScene = function () {
        scene.stop();
    };

    this.pauseScene = function (doPause) {
        scene.pause(doPause);
        scene.renderFrame();   // Forces garbage collection
    };

    this.forceRenderFrame = function () {
        scene.renderFrame({ force:true });
    };


    var rayPickEnabled = false;
    var hit;

    Human.defineCommand({
        commandName:"Scene.Pick",
        execute:function (ctx, params, onComplete, onError) {
            pickOnCanvas(params.canvasX, params.canvasY, !!params.rayPick);
        }
    });


    this.enableRayPick = function (enable) {
        rayPickEnabled = enable;
    };

    this.getRayPickEnabled = function () {
        return rayPickEnabled;
    };

    function pickOnCanvas(canvasX, canvasY, rayPick) {

        if (!scene) {
            return;
        }

        hit = scene.pick(canvasX, canvasY, {
            rayPick:rayPick
        });

        // HACK: Fixes black flicker after picking
        scene.renderFrame({ force:true });

        if (hit) {

            //alert("Picked 'name' node with id '" + hit.nodeId + "' at canvasX=" + hit.canvasX + ", canvasY=" + hit.canvasY);

            var event = {
                canvasPos:{
                    x:canvasX,
                    y:canvasY
                },
                worldPos:hit.worldPos
            };

            var pickName = hit.name;
            var object = Human_anatomy.objects[pickName];
            if (object) {
                event.objectId = object.objectId;
                event.fmaId = object.fmaId;
            } else {
                event.pickName = pickName;
            }

            //alert(JSON.stringify(hit));

            Human.fireEvent("Scene.Picked", event);

        } else {
            Human.fireEvent("Scene.NothingPicked");
        }
    }

    this.mouseClick = function (event) {
        if (!scene) {
            return;
        }
        var elementCoords = getClickCoordsWithinElement(event);
        pickOnCanvas(elementCoords.x, elementCoords.y, rayPickEnabled);
    };

    /** Finds local coords within HTML element for the given mouse click event
     */
    function getClickCoordsWithinElement(event) {
        var coords = { x:0, y:0 };
        if (!event) {
            event = window.event;
            coords.x = event.x;
            coords.y = event.y;
        }
        else {
            var element = event.target;
            var totalOffsetLeft = 0;
            var totalOffsetTop = 0;

            while (element.offsetParent) {
                totalOffsetLeft += element.offsetLeft;
                totalOffsetTop += element.offsetTop;
                element = element.offsetParent;
            }
            coords.x = event.pageX - totalOffsetLeft;
            coords.y = event.pageY - totalOffsetTop;
        }
        return coords;
    }

    this.mouseDoubleClick = function () {

        if (hit) {
            var event = {
                canvasPos:{
                    x:hit.canvasX,
                    y:hit.canvasY
                },
                worldPos:hit.worldPos,
                doubleClick:true
            };

            var pickName = hit.name;
            var object = Human_anatomy.objects[pickName];
            if (object) {
                event.objectId = object.objectId;
                event.fmaId = object.fmaId;
            } else {
                event.pickName = pickName;
            }

            Human.fireEvent("Scene.DoublePicked", event);

        } else {

            Human.fireEvent("Scene.NothingPicked", {
                doubleClick:true
            });
        }
    };

    /**
     *
     */
    this.mouseover = function (event) {
        mouseOverEvent = getClickCoordsWithinElement(event);
    };


    /* set canvas bounds within window
     * and return the object { canvas, width , height }
     */
    this._fitCanvasToScreen = function () {
        var canvas = $("#" + Human.CANVAS_ID);
        var canvasBody = canvas.parent();
        var canvasWidth = canvasBody.width();
        var canvasHeight = canvasBody.height();
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.attr({ width:canvasWidth, height:canvasHeight });
        return { canvas:canvas, width:canvasWidth, height:canvasHeight };
    };


    /*----------------------------------------------------------------------------
     * Node identity and location
     *
     *--------------------------------------------------------------------------*/

    this.getScene = function () {
        return SceneJS.scene(Human.SCENE_ROOT_ID);
    };

    this.getContentRootNode = function () {
        return this.getNode(Human.CONTENT_ROOT_ID);
    };

    this.getNode = function (nodeId) {
        return scene.findNode(nodeId);
    };

    this.getLookAt = function () {
        return this.getNode(Human.LOOKAT_ID);
    };

    this.nodeExists = function (nodeId) {
        var node = scene.findNode(nodeId);
        return (node != null && node != undefined);
    };

    this.setTagMask = function (tagMask) {
        scene.setTagMask(tagMask);
    };

    this.findNodesInSubtree = function (node, nodeTypes) {
        var nodes = {};
        var numToFind = nodeTypes.length;
        for (var i = 0, len = numToFind; i < len; i++) {
            nodes[nodeTypes] = null;
        }
        var type;
        node.eachNode(
            function () {
                type = this.get("type");
                if (nodes[type] === null) {
                    nodes[type] = this;
                    if (--numToFind == 0) {
                        return;
                    }
                }
            }, { andSelf:true, depthFirst:true });
        return nodes;
    };

    /**
     * Blocks while count of current scene graph asset loads is not zero
     */


    var checkLoaded;

    this.blockUntilLoadsFinished = function (onComplete) {

        var numTasks = Human_scene.getScene().get("status");
        if (!numTasks || numTasks == 0) {
            onComplete();
            return;
        }

        if (checkLoaded) {
            throw "Human_scene.blockUntilLoadsFinished: already blocking";
        }

        checkLoaded = window.setInterval(
            function () {
                var numTasks = Human_scene.getScene().get("status").numTasks;
                if (!numTasks || numTasks == 0) {
                    window.clearInterval(checkLoaded);
                    checkLoaded = null;
                    onComplete();
                }
            }, 200);
    };


})();
