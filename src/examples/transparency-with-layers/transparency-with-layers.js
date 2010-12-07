/*
 Introductory SceneJS scene which demonstrates the use of layers with transparency blending.

 An opaque blue background sphere and a transparent red teapot are defined in the default layer.

 Then an opaque white background sphere is defined in a user-specified layer that has a higher
 render order than the default layer. The default layer has a render of zero, while our user-defined
 layer has a render order of one.

 SceneJS will render the default layer first, causing the teapot to be blended with the blue sphere,
 resulting in a transparent (or translucent) pink teapot.

 Then SceneJS renders our user-defined layer, which positions the white sphere just behind the teapot,
 and just inside the blue sphere, to create a white background.

 Our layer is rendered because we enabled it on the scene graph, along with an order value, just
 before we render the scene.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */
SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [


        {
            type: "lookAt",
            eye : { x: 0.0, y: 0.0, z: 35.0},
            look : { x : .0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 65.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [

                        /*--------------------------------------------------------------------------------------
                         * Opaque blue background sphere, enclosing everything. The teapot, which is transparent,
                         * will be blended with this because this sphere and the teapot are both in the default
                         * layer.
                         *------------------------------------------------------------------------------------*/

                        {
                            type: "material",
                            baseColor:      { r: 0, g: 0, b: 1 },

                            nodes: [

                                {
                                    type:"scale",
                                    x: 100,
                                    y: 100,
                                    z: 100,

                                    nodes: [
                                        {
                                            type: "sphere"
                                        }

                                    ]
                                }
                            ]
                        },


                        /*--------------------------------------------------------------------------------------
                         * Opaque white background sphere, fits inside the blue sphere. This will be rendered
                         * AFTER the blue sphere and the teapot because it is in a user-defined layer with
                         * a lower render priority than the default layer that contains the sphere and teapot.
                         *
                         * Since it is opaque, it will not be blended with them, and since it is inside the
                         * blue sphere, while enclosing the teapot, it will cause whiteness to be rendered
                         * behind teh teapot.
                         *------------------------------------------------------------------------------------*/

                        {
                            type: "material",
                            baseColor: { r: 1, g: 1, b: 1 },

                            layer: "white-sphere-layer",

                            nodes: [

                                {
                                    type:"scale",
                                    x: 90,
                                    y: 90,
                                    z: 90,

                                    nodes: [
                                        {
                                            type: "sphere"
                                        }

                                    ]
                                }
                            ]
                        },

                        /*--------------------------------------------------------------------------------------
                         * Light sources which will illuminate the teapot, because the teapot is rendered next
                         * in sequence.
                         *------------------------------------------------------------------------------------*/

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -2.0, y: -1.0, z: 0.0 }
                        },


                        /*--------------------------------------------------------------------------------------
                         * Transparent red teapot. This is in the default layer along with the opaque blue sphere,
                         * so it will be blended with the blue sphere. It will not be blended with the opaque white
                         * sphere because that is in a seperate, lower priority user-defined layer that is rendered
                         * AFTER the blue sphere and teapot.
                         *------------------------------------------------------------------------------------*/

                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       0.9,
                            shine:          6.0,
                            //  alpha: 0.5,
                            opacity: 0.2,

                            //  layer: "teapot-layer",

                            nodes: [
                                {
                                    type:"scale",
                                    x: 5,
                                    y: 5,
                                    z: 5,

                                    nodes: [
                                        {
                                            type: "teapot"
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


/*-------------------------------------------------------------------------------------------
 * We're going to render the scene with the white sphere layer enabled and rendered at a lower
 * priority than the default implicit priority-zero layer that contains the blue sphere and
 * teapot.
 *
 * In other words, the default layer containing the blue sphere and teapot will be rendered,
 * THEN our user-defined layer containing the white sphere.
 *-------------------------------------------------------------------------------------------*/

SceneJS.withNode("theScene").set("layers", {
    "white-sphere-layer": 1
});

SceneJS.withNode("theScene").render();
