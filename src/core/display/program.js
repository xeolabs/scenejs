/**
 * @class Vertex and fragment shaders for pick and draw
 * @private
 *
 * @param {Number} id ID unique among all programs in the owner {@link SceneJS_ProgramFactory}
 * @param {String} hash Hash code which uniquely identifies the capabilities of the program, computed from hashes on the {@link Scene_Core}s that the {@link SceneJS_ProgramSource} composed to render
 * @param {SceneJS_ProgramSource} source Sourcecode from which the the program is compiled in {@link #build}
 * @param {WebGLRenderingContext} gl WebGL context 
 */
var SceneJS_Program = function(id, hash, source, gl) {

    /**
     * ID for this program, unique among all programs in the display
     * @type Number
     */
    this.id = id;

    /**
     * Hash code for this program's capabilities, same as the hash on {@link #source}
     * @type String
     */
    this.hash = source.hash;

    /**
     * Source code for this program's shaders
     * @type SceneJS_ProgramSource
     */
    this.source = source;

    /**
     * WebGL context on which this program's shaders are allocated
     * @type WebGLRenderingContext
     */
    this.gl = gl;

    /**
     * The drawing program
     * @type SceneJS._webgl.Program
     */
    this.draw = null;

    /**
     * The picking program
     * @type SceneJS._webgl.Program
     */
    this.pick = null;

    /**
     * The count of display objects using this program
     * @type Number
     */
    this.useCount = 0;

    this.build(gl);
};

/**
 *  Creates the render and pick programs.
 * This is also re-called to re-create them after WebGL context loss.
 */
SceneJS_Program.prototype.build = function(gl) {
    /**
     * Current draw uniform state cached as a bitfield to avoid costly extra uniform1i calls
     * @type Number
     */
    this.drawUniformFlags = 0;

    this.gl = gl;
    this.draw = new SceneJS._webgl.Program(gl, [this.source.drawVertexSrc.join("\n")], [this.source.drawFragmentSrc.join("\n")]);
    this.pick = new SceneJS._webgl.Program(gl, [this.source.pickVertexSrc.join("\n")], [this.source.pickFragmentSrc.join("\n")]);
};
