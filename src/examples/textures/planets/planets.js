/**
 * Introductory SceneJS Example - Cube Textured with Image of General Zod
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 *
 */

var exampleScene = SceneJS.scene({ canvasId: 'theCanvas' },

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    clear : { depth : true, color : true}
                },

                        SceneJS.lights({
                            lights: [
                                {
                                    pos: { x: -30.0, y: -1000.0, z: 300.0 }
                                }
                            ]},
                                SceneJS.perspective({ fovy : 25.0, aspect : 1.0, near : 0.10, far : 300.0
                                },
                                        SceneJS.lookAt({
                                            eye : { x: 0.0, y: 0.0, z: -120},
                                            look : { x : 0.0, y : 0.0, z : 0 },
                                            up : { x: 0.0, y: 1.0, z: 0.0 }

                                        },
                                                SceneJS.material({
                                                    ambient:  { r:0.4, g:0.4, b:0.4 },
                                                    diffuse:  { r:0.8, g:0.8, b:0.8 },
                                                    specular:  { r:0.5, g:0.5, b:0.5 },
                                                    //   emission:  { r:0.5, g:0.5, b:0.5 },
                                                    shininess: 2},

                                                        SceneJS.translate({y:-9},
                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/mercury/mercury.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                ),

                                                        SceneJS.translate({y:-6},
                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/venus/venus.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                ),

                                                        SceneJS.translate({y:-3},
                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/earth/earth.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                ),

                                                        SceneJS.translate({y:-0},
                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/mars/mars.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl",
                                                                    wait: false})
                                                                ),

                                                        SceneJS.translate({y:3},

                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/jupiter/jupiter.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                ),

                                                        SceneJS.translate({y:6},

                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/uranus/uranus.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                ),

                                                        SceneJS.translate({y:9},

                                                                SceneJS.asset({
                                                                    uri:"http://scenejs.com/app/data/assets/catalogue/assets/v0.7.0/planets/neptune/neptune.js",
                                                                    proxy:"http://scenejs.com/cgi-bin/jsonp_wrapper.pl"})
                                                                )
                                                        )
                                                ) // lookAt
                                        ) // perspective
                                ) // lights
                        ) // renderer
                ) // logger
        )
        ; // scene


var pInterval;


function handleError(e) {
    if (e.message) {
        alert(e.message);
    } else {
        alert(e);
    }
    throw e;
}

/* Our periodic render function. This will stop the render interval when the count of
 * scene processes is zero.
 */
function doit() {
    if (exampleScene.getNumProcesses() == 0) {

        /* No processes running in scene, so asset is loaded and we'll stop. The previous
         * render will have drawn the asset.
         */
        exampleScene.destroy();
        clearInterval(pInterval);
    } else {

        /* Otherwise, a process is still running on the scene, so the asset
         * must still be loading. Note that just as scene processes are created
         * during a scene render, they are also destroyed during another
         * subsequent render. Scene processes don't magically stop between renders,
         * you have to do a render to given them the opportunity to stop.
         */
        try {
            exampleScene.render();
        } catch (e) {
            handleError(e);
        }
    }
}

/* This initial render will trigger the asset load, starting one scene process
 */
try {
    exampleScene.render();
} catch (e) {
    handleError(e);
}

/* Keep rendering until asset loaded, ie. no scene processes running
 */
pInterval = setInterval("doit()", 10);
  