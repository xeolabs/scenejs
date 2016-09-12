/**

 A ZSpace effect for SceneJS.

 Dependencies: zSpace.js and glmatrix

 @param {*} cfg
 @param {SceneJS.Scene} cfg.scene The SceneJS scene
 @param {SceneJS.Lookat} cfg.lookat The scene's viewing transform node.
 @param {SceneJS.Camera} cfg.camera The scene's projection transform node
 @param {Number} cfg.farClip Distance to the far clipping plane.
 @constructor
 */
SceneJS.ZSpaceEffect = function (cfg) {

    "use strict";

    var scene = cfg.scene;

    if (!scene.getWebGL2Supported()) {
        console.error("WebGL2 not supported");
        return;
    }

    scene.setNumPasses(2); // Configure SceneJS to perform two passes per render, for left and right eyes
    scene.setClearEachPass(true); // Clear the output framebuffer before each pass

    var gl = scene.getGL();
    var canvas = scene.getCanvas();

    var lookat = cfg.lookat;
    var camera = cfg.camera;

    var zspace = new ZSpace(gl, canvas, window);
    zspace.zspaceInit();
    zspace.setCanvasOffset(0, 0); // Absolute window coordinates of canvas corner
    zspace.setViewerScale(cfg.viewerScale || 10);
    zspace.setFarClip(cfg.farClip || 10000.0);

    var baseViewMat = SceneJS_math_lookAtMat4v([0.0, 3.45, 2.22], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

    var setLookatFromViewMat = (function () { // Sets the SceneJS Lookat to vectors extracted from the given view matrix
        var viewMat = new Float32Array(16);
        var invViewMat = new Float32Array(16);
        return function (mat) {
            SceneJS_math_mulMat4(baseViewMat, mat, viewMat);
            SceneJS_math_inverseMat4(viewMat, invViewMat);
            lookat.setEye({x: invViewMat[12], y: invViewMat[13], z: invViewMat[14]});
            lookat.setLook({x: invViewMat[8], y: invViewMat[9], z: invViewMat[10]});
            lookat.setUp({x: invViewMat[4], y: invViewMat[5], z: invViewMat[6]});
        };
    })();

    var setLookatFromVectors = (function () { // Sets the SceneJS Lookat to the given (eye, look, up) vectors
        return function (eyeLookUp) {
            lookat.setEye({x: eyeLookUp.eye[0], y: eyeLookUp.eye[1], z: eyeLookUp.eye[2]});
            lookat.setLook({x: eyeLookUp.look[0], y: eyeLookUp.look[1], z: eyeLookUp.look[2]});
            lookat.setUp({x: eyeLookUp.up[0], y: eyeLookUp.up[1], z: eyeLookUp.up[2]});
        };
    })();

    function setCameraFrustumAngles(frustumAngles) { // Sets the Camera to the given perspective frustum angles
        camera.setOptics({
            type: "frustumAngles",
            up: frustumAngles.up,
            down: frustumAngles.down,
            left: frustumAngles.left,
            right: frustumAngles.right,
            near: frustumAngles.near,
            far: frustumAngles.far
        });
    }

    // Force SceneJS to render a frame (containing two passes) on each tick
    scene.on("tick", function () {
        scene.renderFrame({force: true})
    });

    // Intercept render passes for left and right eye; we let SceneJS decide when it needs to render,
    // instead of forcing it. Therefore we must inject callbacks to fire before and after each pass.
    scene.on("rendering", function (e) {

        switch (e.pass) {

            case 0: // Left eye

                zspace.zspaceUpdate(); // Update matrices

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                zspace.zspaceLeftView(); // Bind stereo framebuffer for left view

                setLookatFromViewMat(zspace.leftViewMatrix);

                //setLookat(zspace.leftViewLookat);
                setCameraFrustumAngles(zspace.leftFrustumAngles);

                //camera.setMatrix(zspace.leftProjectionMatrix);

                break;

            case 1: // Right eye

                zspace.zspaceRightView(); // Bind stereo framebuffer for right view

                setLookatFromViewMat(zspace.rightViewMatrix);

                //setLookat(zspace.rightViewLookat);

                setCameraFrustumAngles(zspace.rightFrustumAngles);

                // camera.setMatrix(zspace.rightProjectionMatrix);
                break;
        }
    });

    scene.on("rendered", function (e) {
        if (e.pass === 1) { // Both left and right views rendered
            zspace.zspaceFrameEnd(); // Unbind stereo framebuffer
        }
    });

    this.setViewerScale = function (scale) {
        zspace.setViewerScale(scale);
    };

    this.setFarClip = function (clip) {
        zspace.setFarClip(clip);
    };

    this.setViewMat = function(mat) {
        baseViewMat.set(mat);
    }
};