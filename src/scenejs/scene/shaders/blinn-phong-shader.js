/**
 * Plain vanilla smooth shader
 *
 * @param cfg
 */

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

        'vec2 dLight(in vec3 light_pos,' + // light position
        '   in vec3 half_light, ' + // half-way vector between light and view
        '   in vec3 frag_normal, ' + // geometry normal
        '   in float shininess ' +
        ') { ' +
            // returns vec2( ambientMult, diffuseMult )
        '       float n_dot_pos = max( 0.0, dot(frag_normal, light_pos)); ' +
        '       float n_dot_half = 0.0; ' +
        '       if (n_dot_pos > -.05) { ' +
        '           n_dot_half = pow(max(0.0,dot(half_light, frag_normal)), shininess); ' +
        '       } ' +
        '       return vec2( n_dot_pos, n_dot_half); ' +
        ' } ' +

        ' uniform Material material; ' +
        ' uniform vec4 Global_ambient; ' +
        ' uniform vec4 lights[ 12 ]; ' + // 3 possible lights 4 vec4's each
        ' varying vec3 baseNormal; ' +

        ' void main() { ' +
        '       vec4 fragColor = Global_ambient * material.ambient; ' +

        '       int AMBIENT = 0; ' +
        '       int DIFFUSE = 1; ' +
        '       int SPECULAR = 2; ' +
        '       int POSITION = 3; ' +

        '       int i; ' +

        '       for (i=0; i<12; i=i+4) { ' +

        '           vec3 EC_Light_location = normalize( ' + // normalized eye-coordinate Light location
        '               gl_NormalMatrix * lights[i+POSITION].xyz ' +
        '           ); ' +

        '           vec3 Light_half = normalize( ' + // half-vector calculation
        '               EC_Light_location - vec3( 0,0,-1 ) ' +
        '           ); ' +

        '           vec2 weights = dLight( EC_Light_location, Light_half,baseNormal, material.shininess ); ' +

        '           fragColor = ( ' +
        '               fragColor ' +
        '               + (lights[i+AMBIENT] * material.ambient) ' +
        '               + (lights[i+DIFFUSE] * material.diffuse * weights.x) ' +
        '               + (lights[i+SPECULAR] * material.specular * weights.y) ' +
        '           ); ' +
        '       } ' +
        '       gl_FragColor = fragColor; ' +
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

        scene_Material: function(gl, findVar, material) {
            gl.uniform3fv(findVar(gl, 'Material'),
                    [
                        m.ambient.r, m.ambient.g, m.ambient.b, m.ambient.a,//
                        m.diffuse.r, m.diffuse.g, m.diffuse.b, m.diffuse.a,//
                        m.specular.r, m.specular.g, m.specular.b, m.specular.a,//
                        m.shininess
                    ]);
        },

        scene_Lights: function(gl, findVar, lights) {
            var la = [];
            for (var i = 0; i < lights.length; i++) {
                var l = lights[i];

                la.push([l.ambient.r]);
                la.push([l.ambient.g]);
                la.push([l.ambient.b]);
                la.push([l.ambient.a]);

                la.push([l.diffuse.r]);
                la.push([l.diffuse.g]);
                la.push([l.diffuse.b]);
                la.push([l.diffuse.a]);

                la.push([l.specular.r]);
                la.push([l.specular.g]);
                la.push([l.specular.b]);
                la.push([l.specular.a]);

                la.push([l.position.x]);
                la.push([l.position.y]);
                la.push([l.position.z]);
                la.push([0]); // 0 to flag as direction
            }
            gl.uniform4fv(findVar(gl, 'lights'), lights);
        }
    }
}));


