/**
 *
 */
SceneJS_ChunkFactory.createChunkType({

    type: "listeners",

    // Avoid reapplication of a chunk after a program switch.
    programGlobal:true,

    build : function() {
    },

    draw : function(frameCtx) {

        var listeners = this.core.listeners;
        var renderListenerCtx = frameCtx.renderListenerCtx;

        for (var i = listeners.length - 1; i >= 0; i--) { // Child listeners first
            if (listeners[i](renderListenerCtx) === true) { // Call listener with query facade object as scope
                return true;
            }
        }
    }
});