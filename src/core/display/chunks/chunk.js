/**
 * @class A chunk of WebGL state changes to render a {@link SceneJS_Core} for drawing and picking (if applicable to the core type).
 *
 * <p>Instances of this class are created and recycled by a {@link SceneJS_ChunkFactory}.</p>
 *
 * <p>Each {@link SceneJS_Object} has a list of chunks to render it's {@link SceneJS_Core}s</p>
 *
 * @private
 */
var SceneJS_Chunk = function(id, type, program, core) {

    /**
     * The type of the corresponding {@link SceneJS_Core}
     * @type String
     * @see {SceneJS_Core#type}
     */
    this.type = type;

    /**
     * The chunk ID
     * @type Number
     */
    this.id = id;

    /**
     * The program this chunk will render with
     * @type {SceneJS_Program}
     */
    this.program = program;

    /**
     * The state core rendered by this chunk
     * @type {SceneJS_Core}
     */
    this.core = core;

    /**
     * Count of {@link SceneJS_Object} instances using this chunk
     * @type Number
     */
    this.useCount = 0;

    if (this.build) {
        this.build();
    }
};

/**
 * Initialises the chunk. This is called within the constructor, and also to by the owner {@link SceneJS_ChunkFactory}
 * when recycling a chunk from its free chunk pool. This method sets the given properties on the chunk, then calls the
 * chunk instance's <b>build</b> method if the chunk has been augmented with one.
 *
 * @param {Number} id Chunk ID
 * @param {SceneJS_Program} program Program to render the chunk
 * @param {SceneJS_Core} core The state core rendered by this chunk
 */
SceneJS_Chunk.prototype.init = function(id, program, core) {

    this.id = id;
    this.program = program;
    this.core = core;

    if (this.build) {
        this.build();
    }
};
