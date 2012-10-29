/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "shader",

    build : function() {
    },

    drawAndPick : function(ctx) {

        var paramsStack = this.core.paramsStack;

        if (paramsStack) {

            var program = ctx.pick ? this.program.pick : this.program.draw;
            var params;
            var name;

            for (var i = 0, len = paramsStack.length; i < len; i++) {
                params = paramsStack[i];
                for (name in params) {
                    if (params.hasOwnProperty(name)) {
                        program.setUniform(name, params[name]);  // TODO: cache locations
                    }
                }
            }
        }
    }
});