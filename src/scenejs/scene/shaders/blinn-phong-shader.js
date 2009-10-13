/**
 * Plain vanilla smooth shader
 *
 * @param cfg
 */
//SceneJs.BlinnPhongShader = SceneJs.extend(SceneJs.Shader, {
//    getType: function() {
//        return 'blinn-phong-shader';
//    }
//});

SceneJs.BlinnPhongShader = function(cfg) {
    SceneJs.BlinnPhongShader.superclass.constructor.call(this, SceneJs.apply(cfg || {}, {
        type: 'blinn-phong-shader'
    }));
};

SceneJs.extend(SceneJs.BlinnPhongShader, SceneJs.Node, {});

SceneJs.Backend.installNodeBackend(new SceneJs.ShaderBackend({

    nodeType: 'blinn-phong-shader',

    fragmentShaders: [
        'varying float intensity; ' +
        'varying vec4 FragColor; ' +
        'void main(void) { ' +
        '      gl_FragColor = FragColor; ' +
        '}'
    ],

    vertexShaders: [
        'struct Material { ' +
        '   vec4 ambient; ' +
        '   vec4 diffuse; ' +
        '   vec4 specular; ' +
        '   float shininess; ' +
        ' }; ' +

        'vec2 dLight(' +
        'in vec3 light_pos,' + // light position
        'in vec3 half_light, ' + // half-way vector between light and view
        'in vec3 frag_normal, ' + // geometry normal
        'in float shininess ' +
        ') { ' +
            // returns vec2( ambientMult, diffuseMult )
        '   float n_dot_pos = max( 0.0, dot(frag_normal, light_pos)); ' +
        '   float n_dot_half = 0.0; ' +
        '   if (n_dot_pos > -.05) { ' +
        '       n_dot_half = pow(max(0.0,dot(half_light, frag_normal)), shininess); ' +
        '   } ' +
        '   return vec2( n_dot_pos, n_dot_half); ' +
        ' } ' +

        ' uniform Material material; ' +
        ' uniform vec4 Global_ambient; ' +
        ' uniform vec4 lights[ 12 ]; ' + // 3 possible lights 4 vec4's each
        ' varying vec3 baseNormal; ' +

        ' void main() { ' +
        '     vec4 fragColor = Global_ambient * material.ambient; ' +
        '     int AMBIENT = 0; ' +
        '     int DIFFUSE = 1; ' +
        '     int SPECULAR = 2; ' +
        '     int POSITION = 3; ' +
        '     int i; ' +
        '     for (i=0;i<12;i=i+4) { ' +
        '         vec3 EC_Light_location = normalize( ' + // normalized eye-coordinate Light location
        '             gl_NormalMatrix * lights[i+POSITION].xyz ' +
        '         ); ' +
        '         vec3 Light_half = normalize( ' + // half-vector calculation
        '             EC_Light_location - vec3( 0,0,-1 ) ' +
        '         ); ' +
        '         vec2 weights = dLight( EC_Light_location, Light_half,baseNormal, material.shininess ); ' +
        '         fragColor = ( ' +
        '             fragColor ' +
        '             + (lights[i+AMBIENT] * material.ambient) ' +
        '             + (lights[i+DIFFUSE] * material.diffuse * weights.x) ' +
        '             + (lights[i+SPECULAR] * material.specular * weights.y) ' +
        '         ); ' +
        '     } ' +
        '     gl_FragColor = fragColor; ' +
        ' } '
    ],

    /** Setter functions to inject data into the scripts via the GL context. Note that in some cases these also
     * convert the incoming data objects to the target variable types.
     *
     */
    setters : {

        scene_ModelViewMatrix: function(gl, findVar, mat) {
            if (!mat) {

            } else {
                gl.uniformMatrix4fv(findVar(gl, 'MVMatrix'), mat.flatten());
            }
        },

        scene_ModelViewProjectionMatrix: function(gl, findVar, mat) {
            if (!mat) {

            } else {
                gl.uniformMatrix4fv(findVar(gl, 'PMatrix'), mat.flatten());
            }
        },

        //        scene_NormalMatrix: function(gl, findVar, mat) {
        //            gl.uniformMatrix4fv(findVar(gl, 'NMatrix'), mat.flatten());
        //        },

        scene_Normal: function(gl, findVar, normals) {
            if (!normals) {

            } else {
                var loc = findVar(gl, 'Normal');
                gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, normals);
                gl.enableVertexAttribArray(loc);
            }
        },

        scene_Vertex: function(gl, findVar, vertices) {
            if (!vertices) {

            } else {
                var loc = findVar(gl, 'Vertex') ;
                gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, vertices);
                gl.enableVertexAttribArray(loc);
            }
        },

        scene_Color:  function(gl, findVar, colors) {

            var loc = findVar(gl, 'InColor');
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, colors);
            gl.enableVertexAttribArray(loc);
        },

        lights: function(gl, findVar, lights) {
            var la = [];
            for (var i = 0; i < lights.length; i++) {
                var l = lights[i];
                la.push([l.ambient.pos.x, l.ambient.pos.y, l.ambient.pos.z, 1.0]);
                la.push([l.diffuse.pos.x, l.diffuse.pos.y, l.diffuse.pos.z, 1.0]);
                la.push([l.specular.pos.x, l.specular.pos.y, l.specular.pos.z, 1.0]);
                la.push([l.position.pos.x, l.position.pos.y, l.position.pos.z, 1.0]);
            }
            gl.uniform4fv(findVar(gl, 'lights'), 12, lights);
        }
    }
}));


