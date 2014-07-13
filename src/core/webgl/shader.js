/**
 * A vertex/fragment shader in a program
 *
 * @private
 * @param gl WebGL gl
 * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param source Source code for shader
 * @param logging Shader will write logging's debug channel as it compiles
 */
SceneJS._webgl.Shader = function (gl, type, source) {

    this.handle = gl.createShader(type);

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);

    this.valid = (gl.getShaderParameter(this.handle, gl.COMPILE_STATUS) != 0);

    if (!this.valid) {

        if (!gl.isContextLost()) { // Handled explicitely elsewhere, so wont rehandle here

            SceneJS.log.error("Shader program failed to compile: " + gl.getShaderInfoLog(this.handle));
            SceneJS.log.error("Shader source:");
            var lines = source.split('\n');
            for (var j = 0; j < lines.length; j++) {
                SceneJS.log.error(lines[j]);
            }

            throw SceneJS_error.fatalError(
                SceneJS.errors.SHADER_COMPILATION_FAILURE, "Shader program failed to compile");
        }
    }
};
