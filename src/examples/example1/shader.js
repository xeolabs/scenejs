SceneJs.Backend.installNodeBackend(new SceneJs.ShaderBackend({

    nodeType: 'example-shader-1',

    fragmentShaders: [
        'varying float intensity; ' +
        'varying vec4 FragColor; ' +
        'void main(void) { ' +
        '      gl_FragColor = FragColor; ' +
        '}'
    ],

    vertexShaders: [
        "attribute vec3 Vertex;\n" +
        "attribute vec3 Normal;\n" +
        "attribute vec4 InColor;\n" +

            /* Matrix locations - these will be mapped to scene reserved names
             */
        "uniform mat4 PMatrix;\n" +
        "uniform mat4 MVMatrix;\n" +
        "uniform mat3 NMatrix;\n" +

            /* Light position - a value for this is specified in the node's 'vars' config
             */
        "uniform vec4 LightPos;\n" +

        "varying vec4 FragColor;\n" +

        "void main(void) {\n" +
        "    vec4 v = vec4(Vertex, 1.0);\n" +
        "    vec4 vmv = MVMatrix * v;\n" +
        "    gl_Position = PMatrix * vmv;\n" +

        "    vec3 nn = normalize(NMatrix * Normal);\n" +
        "    vec3 lightDir = vec3(normalize(vmv - LightPos));\n" +

        "    float intensity = dot(lightDir, nn);\n" +

        "    vec4 color;\n" +

        "    if (intensity > 0.95)\n" +
        "      color = vec4(1.0,0.5,0.5,1.0);\n" +
        "    else if (intensity > 0.5)\n" +
        "      color = vec4(0.6,0.3,0.3,1.0);\n" +
        "    else if (intensity > 0.25)\n" +
        "      color = vec4(0.4,0.2,0.2,1.0);\n" +
        "    else\n" +
        "      color = vec4(0.2,0.1,0.1,1.0);\n" +

        "    FragColor = color;\n" +
        "}\n"
    ],

    /** Setter functions to inject data into the scripts via the GL context. Note that in some cases these also
     * convert the incoming data objects to the target variable types.
     *
     */
    setters : {

        scene_ModelViewMatrix: function(gl, findVar, mat) {
            gl.uniformMatrix4fv(findVar(gl, 'MVMatrix'), mat.flatten());
        },

        scene_ModelViewProjectionMatrix: function(gl, findVar, mat) {
            gl.uniformMatrix4fv(findVar(gl, 'PMatrix'), mat.flatten());
        },

        scene_NormalMatrix: function(gl, findVar, mat) {
            gl.uniformMatrix3fv(findVar(gl, 'NMatrix'), mat.flatten());
        },

        scene_Normal: function(gl, findVar, normals) {
            var loc = findVar(gl, 'Normal');
            gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, normals);
            gl.enableVertexAttribArray(loc);
        },

        scene_Vertex: function(gl, findVar, vertices) {
            var loc = findVar(gl, 'Vertex') ;
            gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, vertices);
            gl.enableVertexAttribArray(loc);
        },

        scene_Color:  function(gl, findVar, colors) {
            var loc = findVar(gl, 'InColor');
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, colors);
            gl.enableVertexAttribArray(loc);
        },

        light: function(gl, findVar, light) {
            gl.uniform4fv(findVar(gl, 'LightPos'), $V([light.pos.x, light.pos.y, light.pos.z, 1.0]).flatten());
        }
    }
}));


