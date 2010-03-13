/**
 * SceneJS Example - Teapot cluster flythrough
 *
 * Lindsay Kay
 * lindsay.kay AT xeolabs.com
 * January 2010
 *
 * In this scene, the viewpoint moves through a randomly-generated
 * cluster of OpenGL teapots. A generator node dynamically instances
 * the cluster - note how the elems array, containing the teapot
 * positions, is memoised in a closure. More info on generators
 * is available in the generator examples. Then we repeatedly render
 * the scene, each time feeding in a scope containing an increasing
 * value for the eye's location on the Z-axis, which is read by the
 * lookAt node.
 */
var exampleScene = SceneJS.scene(

        SceneJS.loggingToPage({ elementId: "logging" },

                SceneJS.renderer({
                    canvasId: 'theCanvas',
                    clearColor : { r:.0, g:.0, b:.0, a: 0 },
                    viewport: { x:0, y:0, width:800, height:800 },
                    clear : { depth : true, color : true} ,
                    depthRange : { near: .5, far: 1500 }
                },
                        SceneJS.perspective({ fovy : 43.0, aspect : 1.0, near : .5, far : 1500.0
                        },
                                SceneJS.fog({
                                    mode:"exp",
                                    color:{r:.0, g:.0,b:.0},
                                    start: 50,
                                    end:400
                                },

                                    SceneJS.lookAt(function(scope) {
                                    return{
                                        eye : { x: 0.0, y: 0, z: scope.get("z")},
                                        look : { x : 0.0, y : 0.0, z : 0 },
                                        up : { x: 0.0, y: 1.0, z: 0.0 }
                                    };
                                },
                                        SceneJS.lights({
                                            lights: [
                                                {
                                                    type:                   "point",
                                                    ambient:                { r: 0.5, g: 0.5, b: 0.9 },
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: 1000.0, y: 0.0, z: -1000.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                },
                                                {
                                                    type:                   "point",
                                                    ambient:                { r: 0.5, g: 0.5, b: 0.9 },
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: -1000.0, y: 1000.0, z: 0.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                } ,
                                                {
                                                    type:                   "point",
                                                    ambient:                { r: 0.5, g: 0.5, b: 0.9 },
                                                    diffuse:                { r: 0.6, g: 0.6, b: 0.3 },
                                                    specular:               { r: 0.9, g: 0.9, b: 0.6 },
                                                    pos:                    { x: -1000.0, y: 100.0, z: 1000.0 },
                                                    constantAttenuation:    1.0,
                                                    quadraticAttenuation:   0.0,
                                                    linearAttenuation:      0.0
                                                }
                                            ]},
                                                SceneJS.material({
                                                    ambient:   { r: 0.5, g: 0.5, b: 0.5 },
                                                    diffuse:   { r: 0.6, g: 0.6, b: 0.6 },
                                                    specular:  { r: 1, g: 1, b: 1 },
                                                    emission: { r: 0.0, g: 0.0, b: 0.0 },
                                                    shininess: 6.0
                                                },
                                                        SceneJS.generator(
                                                                (function() {
                                                                    var elems = [];
                                                                    for (var i = 0; i < 300; i++) {
                                                                        elems.push({
                                                                            x: (50 * Math.random()) - 25.0,
                                                                            y: (50 * Math.random()) - 25.0,
                                                                            z: (800 * Math.random()) - 250.0
                                                                        });
                                                                    }
                                                                    var j = 0;
                                                                    return function() {
                                                                        if (i < elems.length) {
                                                                            return { param: elems[i++] };
                                                                        } else {
                                                                            i = 0;
                                                                        }
                                                                    };
                                                                })(),

                                                                SceneJS.translate(function(scope) {
                                                                    return scope.get("param");
                                                                },
                                                                        SceneJS.scale({ x:2, y:2, z:2 },
                                                                                SceneJS.objects.teapot())
                                                                        )
                                                                )
                                                        )

                                                )
                                        )
                                        )
                                )
                        )
                )
        ); // scene

var zpos = -500;
var pInterval;

function handleError(e) {
    if (e.message) {
        alert(e.message);
    } else {
        alert(e);
    }
    throw e;
}

function doit() {
    if (zpos > 1500) {
        exampleScene.destroy();
        clearInterval(pInterval);
    }
    zpos += 2.0;
    try {
        exampleScene.render({z:(zpos == 0 ? 0.1 : zpos)}); // Don't allow lookAt node's 'look' to equal its 'at'

    } catch (e) {
        clearInterval(pInterval);
        handleError(e);
    }
}

/* Hack to get any scene definition exceptions up front.
 * Chrome seemed to absorb them in setInterval!
 */
//try {
    exampleScene.render({z:zpos});

    /* Continue animation
     */
    pInterval = setInterval("doit()", 10);
//} catch (e) {
//    handleError(e);
//}


