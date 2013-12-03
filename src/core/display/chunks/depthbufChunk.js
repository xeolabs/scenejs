/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type:"depthbuf",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    drawAndPick:function (ctx) {

        var enabled = this.core.enabled;
        var gl = this.program.gl;

        if (ctx.depthbufEnabled != enabled) {
            if (enabled) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
            ctx.depthbufEnabled = enabled;
        }

        var clearDepth = this.core.clearDepth;

        if (ctx.clearDepth != clearDepth) {
            gl.clearDepth(clearDepth);
            ctx.clearDepth = clearDepth;
        }

        var depthFunc = this.core.depthFunc;

        if (ctx.depthFunc != depthFunc) {
            gl.depthFunc(depthFunc);
            ctx.depthFunc = depthFunc;
        }

        var stateId = this.core.stateId;
        
        if (ctx.depthbufStateId != stateId) {
            ctx.depthbufStateId = stateId;

            if (enabled) {
                this.program.gl.clear(this.program.gl.DEPTH_BUFFER_BIT);
            }
        }
    }
});
