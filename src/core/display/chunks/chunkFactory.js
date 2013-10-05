/**
 * @class Manages creation, reuse and destruction of {@link SceneJS_Chunk}s for the nodes within a single {@link SceneJS_Display}.
 * @private
 */
var SceneJS_ChunkFactory = function() {

    this._chunks = {};
    this.chunkTypes = SceneJS_ChunkFactory.chunkTypes;
};

/**
 * Sub-classes of {@link SceneJS_Chunk} provided by this factory
 */
SceneJS_ChunkFactory.chunkTypes = {};    // Supported chunk classes, installed by #createChunkType

/**
 * Free pool of unused {@link SceneJS_Chunk} instances
 */
SceneJS_ChunkFactory._freeChunks = {};    // Free chunk pool for each type

/**
 * Creates a chunk class for instantiation by this factory
 *
 * @param params Members to augment the chunk class prototype with
 * @param params.type Type name for the new chunk class
 * @param params.draw Method to render the chunk in draw render
 * @param params.pick Method to render the chunk in pick render
 * @param params.drawAndPick Method to render the chunk in both draw and pick renders
 */
SceneJS_ChunkFactory.createChunkType = function(params) {

    if (!params.type) {
        throw "'type' expected in params";
    }

    var supa = SceneJS_Chunk;

    var chunkClass = function() { // Create the class
        supa.apply(this, arguments);
        this.type = params.type;
    };

    chunkClass.prototype = new supa();              // Inherit from base class
    chunkClass.prototype.constructor = chunkClass;

    if (params.drawAndPick) {                       // Common method for draw and pick render
        params.draw = params.pick = params.drawAndPick;
    }

    SceneJS_ChunkFactory.chunkTypes[params.type] = chunkClass;

    SceneJS._apply(params, chunkClass.prototype);   // Augment subclass

    SceneJS_ChunkFactory._freeChunks[params.type] = { // Set up free chunk pool for this type
        chunks: [],
        chunksLen: 0
    };

    return chunkClass;
};

/**
 *
 */
SceneJS_ChunkFactory.prototype.getChunk = function(chunkId, type, program, core) {

    var chunkClass = SceneJS_ChunkFactory.chunkTypes[type]; // Check type supported

    if (!chunkClass) {
        throw "chunk type not supported: '" + type + "'";
    }

    var chunk = this._chunks[chunkId];  // Try to reference an existing chunk

    if (chunk) {
        chunk.useCount++;
        return chunk;
    }

    var freeChunks = SceneJS_ChunkFactory._freeChunks[type]; // Try to recycle a free chunk

    if (freeChunks.chunksLen > 0) {
        chunk = freeChunks.chunks[--freeChunks.chunksLen];
    }

    if (chunk) {    // Reinitialise the recycled chunk

        chunk.init(chunkId, program, core);

    } else {        // Instantiate a fresh chunk

        chunk = new chunkClass(chunkId, type, program, core); // Create new chunk
    }

    chunk.useCount = 1;

    this._chunks[chunkId] = chunk;

    return chunk;
};

/**
 * Releases a display state chunk back to this factory, destroying it if the chunk's use count is then zero.
 *
 * @param {SceneJS_Chunk} chunk Chunk to release
 */
SceneJS_ChunkFactory.prototype.putChunk = function (chunk) {

    if (chunk.useCount == 0) {
        return; // In case of excess puts
    }

    if (--chunk.useCount <= 0) {    // Release shared core if use count now zero

        this._chunks[chunk.id] = null;

        var freeChunks = SceneJS_ChunkFactory._freeChunks[chunk.type];

        freeChunks.chunks[freeChunks.chunksLen++] = chunk;
    }
};

/**
 * Re-cache shader variable locations for each active chunk
 */
SceneJS_ChunkFactory.prototype.webglRestored = function () {

    var chunk;

    for (var chunkId in this._chunks) {

        if (this._chunks.hasOwnProperty(chunkId)) {

            chunk = this._chunks[chunkId]; // Re-cache chunk's shader variable locations

            if (chunk.build) {
                chunk.build();
            }
        }
    }
};
