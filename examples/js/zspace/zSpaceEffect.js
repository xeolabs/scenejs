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

    var gl = scene.getGL();
    var canvas = scene.getCanvas();

    //----------------------------------------------------------------------
    // Configure SceneJS to do two passes (left and right) on each frame,
    // while clearing the stereo framebuffer before each pass
    //----------------------------------------------------------------------

    scene.setNumPasses(2);
    scene.setClearEachPass(true);

    //----------------------------------------------------------------------
    // We'll be updating SceneJS' view and projection transforms
    // through these scene graph nodes
    //----------------------------------------------------------------------

    var lookat = cfg.lookat;
    var camera = cfg.camera;

    //----------------------------------------------------------------------
    // Set up zSpace
    //----------------------------------------------------------------------

    var zspace = new ZSpace(gl, canvas, window);
    zspace.zspaceInit();
    zspace.setCanvasOffset(0, 0); // Absolute window coordinates of canvas corner
    zspace.setViewerScale(cfg.viewerScale || 10);
    zspace.setFarClip(cfg.farClip || 10000.0);

    // The "base" view matrix we use to position and orient the virtual camera
    var baseViewMat = SceneJS_math_lookAtMat4v([0.0, 3.45, 2.22], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);

    //----------------------------------------------------------------------
    // Gets World-space stylus position and direction from zSpace
    //----------------------------------------------------------------------

    var stylusWorldPos = new Float32Array(3);
    var stylusWorldDir = new Float32Array(3);

    var processStylus = (function () {

        var invViewMat = new Float32Array(16);
        var stylusWorldMat = new Float32Array(16);

        return function () {

            var viewMat = camera.getMatrix(); // View matrix (assuming this is the inverse of the World matrix?)

            //SceneJS_math_inverseMat4(viewMat, invViewMat);
            SceneJS_math_mulMat4(viewMat, zspace.stylusCameraMatrix, stylusWorldMat);

            stylusWorldPos[0] = stylusWorldMat[12];
            stylusWorldPos[1] = stylusWorldMat[13];
            stylusWorldPos[2] = stylusWorldMat[14];

            stylusWorldDir[0] = -stylusWorldMat[8];
            stylusWorldDir[1] = -stylusWorldMat[9];
            stylusWorldDir[2] = -stylusWorldMat[10];

            SceneJS_math_normalizeVec3(stylusWorldDir);
        };
    })();

    //----------------------------------------------------------------------
    // Concatenates the given matrix to the base view matrix, then feeds
    // the result into our SceneJS lookat node
    //----------------------------------------------------------------------

    var setViewMatrix = (function () { // Sets the SceneJS Lookat to vectors extracted from the given view matrix
        var viewMat = new Float32Array(16);
        return function (mat) {
            SceneJS_math_mulMat4(baseViewMat, mat, viewMat);
            lookat.setMatrix(viewMat);
        };
    })();

    //----------------------------------------------------------------------
    // Sets the matrix on our SceneJS camera node
    //----------------------------------------------------------------------

    function setProjMatrix(mat) {
        camera.setMatrix(mat);
    }

    //----------------------------------------------------------------------
    // On each SceneJS tick, update zSpace, process stylus input and
    // force-render a frame (which contains left and right passes)
    //----------------------------------------------------------------------

    scene.on("tick", function () {
        zspace.zspaceUpdate();
        processStylus();
        scene.renderFrame({force: true});
    });

    //----------------------------------------------------------------------
    // Intercept each left/right render pass to bind stereo buffer
    // and update view and projection transforms
    //----------------------------------------------------------------------

    scene.on("rendering", function (e) {

        switch (e.pass) {

            case 0: // Left eye

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                zspace.zspaceLeftView();

                setViewMatrix(zspace.leftViewMatrix);
                setProjMatrix(zspace.leftProjectionMatrix);

                break;

            case 1: // Right eye

                zspace.zspaceRightView();

                setViewMatrix(zspace.rightViewMatrix);
                setProjMatrix(zspace.rightProjectionMatrix);

                break;
        }
    });

    //----------------------------------------------------------------------
    // Unbind stereo buffer after right pass
    //----------------------------------------------------------------------

    scene.on("rendered", function (e) {
        if (e.pass === 1) {
            zspace.zspaceFrameEnd();
        }
    });

    /**
     * Sets the base viewing transform; the zSpace viewing transform is
     * post-multiplied with this.
     *
     * @param {Float32Array} mat The base viewing transform.
     */
    this.setViewMat = function (mat) {
        baseViewMat.set(mat);
    };

    /**
     * Sets the zSpace viewer scale factor.
     * @param {Number} scale The scale factor
     */
    this.setViewerScale = function (scale) {
        zspace.setViewerScale(scale);
    };

    /**
     * Sets the distance to the zSpace far clipping plane.
     * @param {Number} clip Distance to far clipping plane
     */
    this.setFarClip = function (clip) {
        zspace.setFarClip(clip);
    };

    /**
     * Gets the World-space position of the stylus.
     * @returns {Float32Array}
     */
    this.getStylusWorldPos = function() {
        return stylusWorldPos;
    };

    /**
     * Gets the World-space direction of the stylus.
     * @returns {Float32Array}
     */
    this.getStylusWorldDir = function() {
        return stylusWorldDir;
    };

    /**
     * Gets the states of the three stylus buttons.
     * @returns {Array of Number}
     */
    this.getStylusButtons = function() {
        return zspace.buttonPressed;
    };
};