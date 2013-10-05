/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "listeners",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build : function() {
    },

    draw : function(ctx) {

        var listeners = this.core.listeners;
        var renderListenerCtx = ctx.renderListenerCtx;

        for (var i = listeners.length - 1; i >= 0; i--) { // Child listeners first
            if (listeners[i](renderListenerCtx) === true) { // Call listener with query facade object as scope
                return true;
            }
        }
    }
});