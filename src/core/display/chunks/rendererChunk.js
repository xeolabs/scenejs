/**
 *
 */
SceneJS_ChunkFactory.createChunkType({
    
    type: "renderer",

    build : function() {
    },

    drawAndPick : function(ctx) {

        if (this.core.props) {

            var gl = this.program.gl;

            if (ctx.renderer) {
                ctx.renderer.props.restoreProps(gl);
                ctx.renderer = this.core;
            }

            this.core.props.setProps(gl);
        }
    }
});
