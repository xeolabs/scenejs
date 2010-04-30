/* Backend that manages picking
 *
 * Services the SceneJS.scene node, providing it with methods to enter picking mode and collect names of
 * subgraph that was picked.
 *
 *  @private
 */
var SceneJS_pickModule = new (function() {

    var pickInfo = [];          // Entry for each scene
    var currentPickInfo;        // Entry for current active scene

    var pickX;
    var pickY;
    var canvas;

    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.RESET,
    //                    function() {
    //                        pickInfo = [];
    //                        currentPickInfo = null;
    //                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.SCENE_CREATED,
    //                    function(params) {
    //                        pickInfo[params.sceneId] = {
    //                            sceneId: params.sceneId
    //                        };
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.SCENE_ACTIVATED,
    //                    function(params) {
    //                        currentPickInfo = pickInfo[params.sceneId];
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
    //                    function(transform) {
    //                        currentPickInfo.projectionTransform = transform;
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
    //                    function(transform) {
    //                        currentPickInfo.viewTransform = transform;
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.CANVAS_ACTIVATED,
    //                    function(c) {
    //                        canvas = c;
    //                        if (!currentPickInfo.pickBuffer) {
    //                            currentPickInfo.pickBuffer = createPickBuffer();
    //                        }
    //                    });
    //
    //            SceneJS_eventModule.onEvent(
    //                    SceneJS_eventModule.SCENE_DESTROYED,
    //                    function(params) {
    //                        pickInfo[params.sceneId] = null;
    //                    });

    /**
     * @private
     */
    function createPickBuffer() { // TODO: Dont assume allocation succeeds!
        var context = canvas.context;
        var pickBuffer = {
            frameBuffer : context.createFramebuffer(),
            renderBuffer : context.createRenderbuffer(),
            texture : context.createTexture()
        };
        context.bindTexture(context.TEXTURE_2D, pickBuffer.texture);
        try {
            context.texImage2D(
                    context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, null);
        } catch (e) {
            var texture = new WebUnsignedByteArray(3);
            context.texImage2D(
                    context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, texture);
        }
        context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
        context.bindRenderbuffer(context.RENDERBUFFER, pickBuffer.renderBuffer);
        context.renderbufferStorage(context.RENDERBUFFER, context.COLOR_COMPONENT, 1, 1);
        context.bindRenderbuffer(context.RENDERBUFFER, null);
        context.framebufferTexture2D(
                context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, pickBuffer.texture, 0);
        context.framebufferRenderbuffer(
                context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, pickBuffer.renderBuffer);
        context.bindFramebuffer(context.FRAMEBUFFER, null);
        return pickBuffer;
    }

    /**
     * @private
     */
    function activatePicking() {
        var context = canvas.context;
        var pickBuffer = pickBuffers[canvas.id];

        context.bindFramebuffer(context.FRAMEBUFFER, pickBuffer.frameBuffer);
        context.viewport(0, 0, 1, 1);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.disable(context.BLEND);

        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_PICKING;
    }

    /**
     * @private
     */
    function pick(x, y) {

        var viewTransform = currentPickInfo.viewTransform;
        var projTransform = currentPickInfo.viewTransform;

        var origViewMatrix = viewTransform.matrix;
        var origProjMatrix = projTransform.matrix;

        /* Get camera space coordinates
         */
        var xcoord = -( ( ( 2 * x ) / canvas.canvas.width ) - 1 ) / SceneJS_math_getCellMat4(viewTransform.matrix, 1, 1);
        var ycoord = ( ( ( 2 * y ) / canvas.canvas.height ) - 1 ) / SceneJS_math_getCellMat4(projTransform.matrix, 2, 2);
        var zcoord = 1;

        if (projTransform.type == "perspective") {
            var coord = SceneJS_math_transformPoint3(
                    SceneJS_math_inverseMat4(viewTransform.matrix),
                    [xcoord,ycoord,zcoord,0]);

            var cameraPos = viewTransform.lookAt.eye;

            var zvec = coord.toUnitVector();
            var xvec = (new GLGE.Vec([0,0,1])).cross(zvec).toUnitVector();
            var yvec = zvec.cross(xvec).toUnitVector();
            this.camera.matrix = new GLGE.Mat([xvec.e(1), yvec.e(1), zvec.e(1), cameraPos.x,
                xvec.e(2), yvec.e(2), zvec.e(2), cameraPos.y,
                xvec.e(3), yvec.e(3), zvec.e(3), cameraPos.z,
                0, 0, 0, 1]).inverse();
        }
        if (this.camera.type == GLGE.C_ORTHO) {
            this.camera.matrix = this.camera.matrix.inv().x(GLGE.translateMatrix(-xcoord, -ycoord, 0)).inv();
        }
        this.camera.pMatrix = GLGE.makeOrtho(-0.0001, 0.0001, -0.0001, 0.0001, this.camera.near, this.camera.far);
        //render for picking
        var gl = this.renderer.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framePickBuffer);
        gl.viewport(0, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.renderer.gl.disable(this.renderer.gl.BLEND);

        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].GLRender(this.renderer.gl, GLGE.RENDER_PICK);
        }
        var data = gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE);
        //TODO: firefox hack :-( remove when fixed!
        if (data.data) data = data.data;
        var index = data[0] + data[1] * 256;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);

        //revert the view matrix
        this.camera.matrix = origmatrix;
        this.camera.pMatrix = origpmatrix;

        if (index > 0) {
            return this.objects[index - 1];
        } else {
            return false;
        }

    }

    /**
     * @private
     */
    function deactivatePicking() {
        canvas.context.bindFramebuffer(canvas.context.FRAMEBUFFER, null);
        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
    }


    /** Begin picking at given coordinates, switch to picking mode
     * @private
     */
    this.pick = function(x, y) {
        //                    activatePicking();
        //                    pickX = x;
        //                    pickY = y;
    };

    /** Get name path to whatever was picked, unbind pick buffers, switch back to rendering mode
     * @private
     */
    this.getPicked = function() {
        //                    var context = canvas.context;
        //
        //                    var data = context.readPixels(pickX, pickY, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
        //                    if (data.data) {
        //                        data = data.data; // TODO: hack for firefox
        //                    }
        //
        //                    SceneJS_loggingModule.info(pickX + ", " + pickY + ": " + data[0] + ", " + data[1] + "," + data[2]);
        //
        //                    var id = data[0] + data[1] * 256;
        //
        //                    deactivatePicking();
        //                    return id;
    };
})();
