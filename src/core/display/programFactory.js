/**  
 * @class Manages creation, sharing and recycle of {@link SceneJS_Program} instances
 * @private
 */
var SceneJS_ProgramFactory = function(cfg) {

    this._canvas = cfg.canvas;

    this._programs = {};

    this._nextProgramId = 0;
};

/**
 * Gets a program to render the given states
 */
SceneJS_ProgramFactory.prototype.getProgram = function(hash, states) {

    var program = this._programs[hash];

    if (!program) {

        var source = SceneJS_ProgramSourceFactory.getSource(hash, states);

        program = new SceneJS_Program(this._nextProgramId++, hash, source, this._canvas.gl);

        this._programs[hash] = program;
    }

    program.useCount++;

    return program;
};

/**
 * Releases a program back to the shader factory
 */
SceneJS_ProgramFactory.prototype.putProgram = function(program) {

    if (--program.useCount <= 0) {

        program.draw.destroy();
        program.pick.destroy();

        SceneJS_ProgramSourceFactory.putSource(program.hash);

       delete this._programs[program.hash];
    }
};

/**
 * Notifies this shader factory that the WebGL context has been restored after previously being lost
 */
SceneJS_ProgramFactory.prototype.webglRestored = function() {

    var gl = this._canvas.gl;
    var program;

    for (var id in this._programs) {
        if (this._programs.hasOwnProperty(id)) {
            program = this._programs[id];
            if (program && program.build) {
                program.build(gl);
            }
        }
    }
};

/**
 * Destroys this shader factory
 */
SceneJS_ProgramFactory.prototype.destroy = function() {
};
