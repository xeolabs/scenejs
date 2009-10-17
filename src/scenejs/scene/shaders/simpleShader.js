/**
 * Sawn-off smooth shader that uses only the position of the most recently defined light
 * source (last light defined in the the light list of the current Light node) and
 * the ambient, specular and diffuse components of a Material.
 *
 * This is just to get you started!
 *
 * In practise, your shaders would want to use all of the lights, perhaps using something
 * like the virtualised lightsources technique described at:
 * http://gpwiki.org/index.php/OpenGL:Tutorials:Virtualized_Lights_with_OpenGL_and_GLSL
 *
 * @param cfg
 */

SceneJs.ns("SceneJs.shaders");

SceneJs.shaders.simpleShader = function() {
    return SceneJs.inherit(SceneJs.shader, arguments, {
        type: 'simple-shader'
    });
};

SceneJs.Backend.installNodeBackend(SceneJs.shaderBackend({

    nodeType: 'simple-shader',

    vertexShaders: [
        'attribute vec3 Vertex; ' +
        'attribute vec3 Normal; ' +

        'uniform mat4 PMatrix; ' +
        'uniform mat4 MVMatrix; ' +

        'uniform vec4 LightPos; ' +
        'varying vec4 FragColor; ' +

        'uniform vec3 MaterialDiffuse;' +
        'uniform vec3 MaterialSpecular;' +
        'uniform vec3 MaterialAmbient;' +

        'void main(void) { ' +
        '   vec4 v = vec4(Vertex, 1.0); ' +
        '   vec4 vmv = MVMatrix * v; ' +
        '   gl_Position = PMatrix * vmv; ' +

        '   vec3 lightDir = vec3(normalize(vmv - LightPos)); ' +

        '   float NdotL = max(dot(lightDir, Normal), 0.0); ' +

        '   vec3 diffuse = MaterialDiffuse + MaterialSpecular; ' +

        '   FragColor = vec4(NdotL * diffuse + MaterialAmbient, 1.0); ' +
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
            if (mat) {
                gl.uniformMatrix4fv(findVar(gl, 'MVMatrix'), mat.flatten());
            }
        },

        scene_ProjectionMatrix: function(gl, findVar, mat) {
            if (mat) {
                gl.uniformMatrix4fv(findVar(gl, 'PMatrix'), mat.flatten());
            }
        },

        scene_Normal: function(gl, findVar, normals) {
            if (normals) {
                var loc = findVar(gl, 'Normal');
                gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, normals);
                gl.enableVertexAttribArray(loc);
            }
        },

        scene_Vertex: function(gl, findVar, vertices) {
            if (vertices) {
                var loc = findVar(gl, 'Vertex') ;
                gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, vertices);
                gl.enableVertexAttribArray(loc);
            }
        },

        scene_Material: function(gl, findVar, m) {
            if (m) {
                gl.uniform4fv(findVar(gl, 'MaterialAmbient'), $V([m.ambient.r, m.ambient.g, m.ambient.b, m.ambient.a]).flatten());
                gl.uniform4fv(findVar(gl, 'MaterialDiffuse'), $V([m.diffuse.r, m.diffuse.g, m.diffuse.b, m.diffuse.a]).flatten());
                gl.uniform4fv(findVar(gl, 'MaterialSpecular'), $V([m.specular.r, m.specular.g, m.specular.b, m.specular.a]).flatten());
            }
        },

        scene_Lights: function(gl, findVar, lights) {
            if (lights && lights.length > 0) {
                var l = lights[0];
                gl.uniform4fv(findVar(gl, 'LightPos'), $V([l.pos.x, l.pos.y, l.pos.z, 1.0]).flatten());
            }
        }
    }
}));


