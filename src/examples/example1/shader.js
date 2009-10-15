SceneJs.Backend.installNodeBackend(new SceneJs.ShaderBackend({

    nodeType: 'example-shader-1',

    vertexShaders: [
        'attribute vec3 Vertex; ' +
        'attribute vec3 Normal; ' +
        'attribute vec4 InColor; ' +

        'uniform mat4 PMatrix; ' +
        'uniform mat4 MVMatrix; ' +

        'uniform vec4 LightPos; ' +
        'varying vec4 FragColor; ' +

        'void main(void) { ' +
        ' vec4 v = vec4(Vertex, 1.0); ' +
        ' vec4 vmv = MVMatrix * v; ' +
        ' gl_Position = PMatrix * vmv; ' +

        ' vec3 lightDir = vec3(normalize(vmv - LightPos)); ' +

        ' float NdotL = max(dot(lightDir, Normal), 0.0); ' +

        ' const vec3 diffuseColor = vec3(0.4, 0.4, 0.2); ' +
        ' const vec3 lightColor = vec3(0.1, 0.1, 0.6); ' +
        ' const vec3 ambientColor = vec3(0.1, 0.1, 0.1); ' +

        ' vec3 diffuse = diffuseColor + lightColor; ' +

        ' FragColor = vec4(NdotL * diffuse + ambientColor, 1.0); ' +
        '}'
    ],

    fragmentShaders: [
        'varying float intensity; ' +
        'varying vec4 FragColor; ' +
        'void main(void) { ' +
        '      gl_FragColor = FragColor; ' +
        '}'
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


