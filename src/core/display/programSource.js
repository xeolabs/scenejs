/**
 * @class Source code for pick and draw shader programs, to be compiled into one or more {@link SceneJS_Program}s
 * @private
 * 
 * @param {String} hash Hash code identifying the rendering capabilities of the programs
 * @param {String} pickVertexSrc Source code of the pick vertex shader
 * @param {String} pickFragmentSrc Source code of the pick fragment shader
 * @param {String} drawVertexSrc Source code of the draw vertex shader
 * @param {String} drawFragmentSrc Source code of the draw fragment shader
 */
var SceneJS_ProgramSource = function(hash, pickVertexSrc, pickFragmentSrc, drawVertexSrc, drawFragmentSrc) {

    /**
     * Hash code identifying the capabilities of the {@link SceneJS_Program} that is compiled from this source
     * @type String
     */
    this.hash = hash;

    /**
     * Source code for pick vertex shader
     * @type String
     */
    this.pickVertexSrc = pickVertexSrc;

    /**
     * Source code for pick fragment shader
     * @type String
     */
    this.pickFragmentSrc = pickFragmentSrc;

    /**
     * Source code for draw vertex shader
     * @type String
     */
    this.drawVertexSrc = drawVertexSrc;

    /**
     * Source code for draw fragment shader
     * @type String
     */
    this.drawFragmentSrc = drawFragmentSrc;

    /**
     * Count of {@link SceneJS_Program}s compiled from this program source code
     * @type Number
     */
    this.useCount = 0;
};

