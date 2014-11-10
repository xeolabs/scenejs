/**
 * @class A chunk of WebGL state changes to render a {@link SceneJS_Core} for drawing and picking (if applicable to the core type).
 *
 * <p>Instances of this class are created and recycled by a {@link SceneJS_ChunkFactory}.</p>
 *
 * <p>Each {@link SceneJS_Object} has a list of chunks to render it's {@link SceneJS_Core}s</p>
 *
 * @private
 */
var SceneJS_Chunk = function() {};

/**
 * Initialises the chunk. This is called within the constructor, and also to by the owner {@link SceneJS_ChunkFactory}
 * when recycling a chunk from its free chunk pool. This method sets the given properties on the chunk, then calls the
 * chunk instance's <b>build</b> method if the chunk has been augmented with one.
 *
 * @param {String} id Chunk ID
 * @param {SceneJS_Program} program Program to render the chunk
 * @param {SceneJS_Core} core The state core rendered by this chunk
 * @param {SceneJS_Core} core2 Another state core rendered by this chunk, only used for geometry
 */
SceneJS_Chunk.prototype.init = function(id, program, core, core2) {

    this.id = id;
    this.program = program;
    this.core = core;
    this.core2 = core2;

    if (this.build) {
        this.build();
    }
};
