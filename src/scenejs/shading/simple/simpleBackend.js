/**
 * Sawn-off smooth shader that uses only the position of the most recently defined light
 * source (last light defined in the the light list of the current Light node) and
 * the ambient, specular and diffuse components of a Material.
 *
 * SceneJS shaders always have separate projection, view and modelling matrices for efficiency.
 *
 * This is just to get you started!
 *
 * In practise, your shaders would want to use all of the lights, perhaps using something
 * like the virtualised lightsources technique described at:
 * http://gpwiki.org/index.php/OpenGL:Tutorials:Virtualized_Lights_with_OpenGL_and_GLSL
 *
 * @param cfg
 */

SceneJs.utils.ns("SceneJs.shaders");

SceneJs.private.backendModules.install(SceneJs.shaderBackend({

    type: 'simple-shader',

    vertexShaders: [
        'attribute vec3 Vertex; ' +
        'attribute vec3 Normal; ' +

            /* Projection, view and modelling matrices
             */
        'uniform mat4 PMatrix; ' +
        'uniform mat4 VMatrix; ' +
        'uniform mat4 MMatrix; ' +

        'uniform vec4 LightPos; ' +
        'varying vec4 FragColor; ' +

        'uniform vec3 MaterialDiffuse;' +
        'uniform vec3 MaterialSpecular;' +
        'uniform vec3 MaterialAmbient;' +

        'void main(void) { ' +
        '   vec4 v = vec4(Vertex, 1.0); ' +
        '   vec4 mv = MMatrix * v; ' +
        '   vec4 vmv = PMatrix * mv; ' +
        '   gl_Position = PMatrix * vmv; ' +

        '   vec3 lightDir = vec3(normalize(vmv - LightPos)); ' +

        '   float NdotL = max(dot(lightDir, Normal), 0.0); ' +

        '   vec3 diffuse = MaterialDiffuse + MaterialSpecular; ' +

        '   FragColor = vec4(NdotL * diffuse + MaterialAmbient, 1.0); ' +
        '} '
    ],

    fragmentShaders: [
        'varying float intensity; ' +
        'varying vec4 FragColor; ' +
        'void main(void) { ' +
        '      gl_FragColor = FragColor; ' +
        '} '
    ],

    /** Setter functions to inject data into the scripts via the GL context. Note that in some cases these also
     * convert the incoming data objects to the target variable types.
     *
     */
    setters : {

        scene_ViewMatrix: function(context, findVar, mat) {
            if (mat) {
                context.uniformMatrix4fv(findVar(context, 'VMatrix'), mat.elements);
            }
        },

        scene_ModelMatrix: function(context, findVar, mat) {
            if (mat) {
                context.uniformMatrix4fv(findVar(context, 'MMatrix'), mat.elements);
            }
        },

        scene_ProjectionMatrix: function(context, findVar, mat) {
            if (mat) {
                context.uniformMatrix4fv(findVar(context, 'PMatrix'), mat.elements);
            }
        },

        scene_Normal: function(context, findVar, normals) {
            if (normals) {
                var loc = findVar(context, 'Normal');
                context.vertexAttribPointer(loc, 3, context.FLOAT, false, 0, normals);
                context.enableVertexAttribArray(loc);
            }
        },

        scene_Vertex: function(context, findVar, vertices) {
            if (vertices) {
                var loc = findVar(context, 'Vertex') ;
                context.vertexAttribPointer(loc, 3, context.FLOAT, false, 0, vertices);
                context.enableVertexAttribArray(loc);
            }
        },

        scene_Material: function(context, findVar, m) {
            if (m) {
                context.uniform3fv(findVar(context, 'MaterialAmbient'), [m.ambient.r, m.ambient.g, m.ambient.b]);   // TODO: cache locations?
                context.uniform3fv(findVar(context, 'MaterialDiffuse'), [m.diffuse.r, m.diffuse.g, m.diffuse.b]);
                context.uniform3fv(findVar(context, 'MaterialSpecular'), [m.specular.r, m.specular.g, m.specular.b]);
            }
        },

        scene_Lights: function(context, findVar, lights) {
            if (lights && lights.length > 0) {
                var l = lights[0];
                context.uniform4fv(findVar(context, 'LightPos'), [l.pos.x, l.pos.y, l.pos.z, 1.0]);
            }
        }
    }
}));


