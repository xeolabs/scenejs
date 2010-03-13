/**
 * This backend encapsulates shading behind an event API.
 *
 * By listening to XXX_UPDATED events, this backend tracks various elements of scene state, such as WebGL settings,
 * lighting, current material properties etc.
 *
 * On a SHADER_ACTIVATE event it will compose and activate a shader taylored to the current scene state
 * (ie. where the shader has variables and routines for the current lights, materials etc), then fire a
 * SHADER_ACTIVATED event when the shader is ready for business.
 *
 * Other backends will then handle the SHADER_ACTIVATED event by firing XXXXX_EXPORTED events parameterised with
 * resources that they want loaded into the shader. This backend then handles those by loading their parameters into
 * the shader.
 *
 * The backend will avoid constant re-generation of shaders by caching each of them against a hash code that it
 * derives from the current collective scene state; on a SHADER_ACTIVATE event, it will attempt to reuse a shader
 * cached for the hash of the current scene state.
 *
 * Shader allocation and LRU cache eviction is mediated by the "memory" backend.
 */
SceneJS._backends.installBackend(

        "shader",

        function(ctx) {

            var time = (new Date()).getTime();      // For LRU caching
            var canvas;                             // Currently active canvas
            var rendererState;                      // WebGL settings state
            var programs = {};                      // Program cache
            var activeProgram = null;               // Currently active program
            var lights = [];                        // Current lighting state
            var material = {};                      // Current material state
            var texture = false;                    // True when a texture is active
            var sceneHash;                          // Current hash of collective scene state pertenant to shaders

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        for (var programId in programs) {  // Just free allocated programs
                            programs[programId].destroy();
                        }
                        programs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        rendererState = null;
                        activeProgram = null;
                        lights = [];
                        material = {};
                        texture = false;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        activeProgram = null;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        activeProgram = null;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RENDERER_UPDATED,
                    function(_rendererState) {
                        rendererState = _rendererState;  // Canvas change will be signified by a CANVAS_UPDATED
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RENDERER_EXPORTED,
                    function(_rendererState) {

                        /* Default ambient material colour is taken from canvas clear colour
                         */
                        var clearColor = _rendererState.clearColor;
                        activeProgram.setUniform("uAmbient",
                                clearColor
                                        ? [clearColor.r, clearColor.g, clearColor.b]
                                        : [0, 0, 0]);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURE_ACTIVATED,
                    function(t) {
                        texture = t;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURE_EXPORTED,
                    function(texture) {
                        activeProgram.bindTexture("uSampler", texture);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURE_DEACTIVATED,
                    function() {
                        texture = null;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_UPDATED,
                    function(l) {
                        lights = l;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_EXPORTED,
                    function(_lights) {
                        for (var i = 0; i < _lights.length; i++) {
                            var light = _lights[i];
                            activeProgram.setUniform("uLightPos" + i, light.pos);
                            activeProgram.setUniform("uLightDir" + i, light.dir);
                            activeProgram.setUniform("uLightColor" + i, light.color);

                            if (light.type == "spot") {
                                activeProgram.setUniform("uLightSpotCosCutOff" + i, light.spotCosCutOff);
                                activeProgram.setUniform("uLightSpotExp" + i, light.spotExponent);
                            }

                            activeProgram.setUniform("uLightAttenuation" + i,
                                    [
                                        light.constantAttenuation,
                                        light.linearAttenuation,
                                        light.quadraticAttenuation
                                    ]);
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MATERIAL_UPDATED,
                    function(m) {
                        material = m;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MATERIAL_EXPORTED,
                    function(_material) {
                        activeProgram.setUniform("uMatColor", _material.color);
                        activeProgram.setUniform("uMatSpecularColor", _material.specularColor);
                        activeProgram.setUniform("uMatReflectivity", _material.reflectivity);
                        activeProgram.setUniform("uMatSpecular", _material.specular);
                        activeProgram.setUniform("uMatEmissive", _material.emissive);
                        activeProgram.setUniform("uMatShininess", _material.shininess);
                        activeProgram.setUniform("uMatAlpha", _material.alpha);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MODEL_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uMMatrix", transform.matrixAsArray);
                        activeProgram.setUniform("uMNMatrix", transform.normalMatrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uVMatrix", transform.matrixAsArray);
                        activeProgram.setUniform("uVNMatrix", transform.normalMatrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uPMatrix", transform.matrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_EXPORTED,
                    function(geo) {
                        activeProgram.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                        activeProgram.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                        if (geo.texCoordBuf && texture && rendererState.enableTexture2D) {
                            activeProgram.bindFloatArrayBuffer("aTextureCoord", geo.texCoordBuf);
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATE, // Request to activate a shader
                    function() {
                        activateProgram();
                    });

            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time;
                        var programToEvict;
                        for (var hash in programs) {
                            if (hash) {
                                var program = programs[hash];

                                /* Avoiding eviction of shader just used,
                                 * currently in use, or likely about to use
                                 */
                                if (program.lastUsed < earliest && program.hash != sceneHash) {
                                    programToEvict = program;
                                    earliest = programToEvict.lastUsed;
                                }
                            }
                        }
                        if (programToEvict) { // Delete LRU program's shaders and deregister program
                            ctx.logging.info("Evicting shader: " + hash);
                            programToEvict.destroy();
                            programs[programToEvict.hash] = null;
                            return true;
                        }
                        return false;   // Couldnt find suitable program to delete
                    });

            function activateProgram() {
                if (!canvas) {
                    throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                }

                if (!sceneHash) {
                    generateHash();
                }

                if (!activeProgram || activeProgram.hash != sceneHash) {
                    if (activeProgram) {
                        canvas.context.flush();
                        activeProgram.unbind();
                        activeProgram = null;
                        ctx.events.fireEvent(SceneJS._eventTypes.SHADER_DEACTIVATED);
                    }

                    if (!programs[sceneHash]) {
                        ctx.logging.info("Creating shader: '" + sceneHash + "'");
                        ctx.memory.allocate(
                                "shader",
                                function() {
                                    programs[sceneHash] = new SceneJS._webgl.Program(
                                            sceneHash,
                                            time,
                                            canvas.context,
                                            [composeVertexShader()],
                                            [composeFragmentShader()],
                                            ctx.logging);
                                });
                    }
                    activeProgram = programs[sceneHash];
                    activeProgram.lastUsed = time;
                    activeProgram.bind();
                    ctx.events.fireEvent(SceneJS._eventTypes.SHADER_ACTIVATED);
                }

                ctx.events.fireEvent(SceneJS._eventTypes.SHADER_RENDERING);
            }

            /** Generates a shader hash code from current rendering state.
             */
            function generateHash() {
                var val = [
                    canvas.canvasId,
                    ";",
                    (texture && rendererState.enableTexture2D) ? "tex=yes;" : "tex=no;"
                ];

                /* Lighting
                 */
                val.push("lights=[");
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    if (i > 0) {
                        val.push(",");
                    }
                    val.push("{");
                    val.push(light.type);
                    val.push(";");
                    if (light.specular) {
                        val.push("specular;");
                    }
                    if (light.diffuse) {
                        val.push("diffuse;");
                    }
                    val.push("}");
                }
                val.push("];");
                sceneHash = val.join("");
            }

            /**
             * Generates a vertex shader script for current rendering state. The vertex shader is
             * the generic counterpart for whatever other specialised material/shadow/picking
             * fragment shaders we also use.
             */
            function composeVertexShader() {

                var texturing = texture && rendererState.enableTexture2D;

                var src = ["\n"];


                // --------- Inputs ---------------------------------------------------------------

                /* Vertex and normal
                 */
                src.push("attribute vec3 aVertex;");                // World
                src.push("attribute vec3 aNormal;");                // World

                /* Texture coords
                 */
                if (texturing) {
                    src.push("attribute vec2 aTextureCoord;");      // World
                }

                /* Matrices
                 */
                src.push("uniform mat4 uMMatrix;");               // Model
                src.push("uniform mat4 uMNMatrix;");              // Model Normal

                src.push("uniform mat4 uVMatrix;");               // View
                src.push("uniform mat4 uVNMatrix;");              // View Normal

                src.push("uniform mat4 uPMatrix;");               // Projection

                /* Lights
                 */
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    src.push("uniform vec4 uLightPos" + i + ";");     // View position
                    if (light.type == "dir") {
                        src.push("uniform vec3 uLightDir" + i + ";"); // View direction
                    }
                }

                // --------- Outputs --------------------------------------------------------------

                /* Vertex
                 */
                src.push("varying vec4 vViewVertex;");             // View-space vertex position
                src.push("varying vec3 vNormal;");                 // View-space normal
                src.push("varying vec3 vEyeVec;");


                if (texturing) {
                    src.push("varying vec2 vTextureCoord;");        // Straight-through texture coord
                }

                /* Lights
                 */
                for (var i = 0; i < lights.length; i++) {
                    src.push("varying vec3 vLightDir" + i + ";"); // View-space light vector from vertex
                    src.push("varying float vLightDist" + i + ";");// View-space light distance from vertex
                }

                // --------- Main -----------------------------------------------------------------

                src.push("void main(void) {");

                /* Normal - transform into view space via model and view normal matrices
                 */
                src.push("vec4 tmpMNormal = uMNMatrix * vec4(aNormal, 1.0);");
                src.push("vec4 tmpVNormal = uVNMatrix * tmpMNormal; ");
                src.push("vNormal = tmpVNormal.xyz;");

                /* Vertex - transform into view and eye space
                 */
                src.push("vViewVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
                src.push("gl_Position = uPMatrix * vViewVertex;");

                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    if (light.type == "dir") {
                        src.push("vLightDir" + i + " = uLightDir" + i + ";");
                    } else {
                        src.push("vLightDir" + i + " = (uLightPos" + i + ".xyz - vViewVertex.xyz);");
                    }
                    src.push("vLightDist" + i + " = length(uLightPos" + i + ".xyz - vViewVertex.xyz);");
                }
                src.push("vEyeVec = -vViewVertex.xyz;");                      // Eye vector
                if (texturing) {
                    src.push("vTextureCoord = aTextureCoord;");
                }
                src.push("}");

                return src.join("\n");
            }


            /**
             * Generates a fragment shader script for current scene state.
             */
            function composeFragmentShader() {

                var texturing = texture && rendererState.enableTexture2D;

                var src = ["\n"];

                // ------------ Inputs ----------------------------------------------

                /* Global scene ambient colour, taken from clear color
                 */
                src.push("uniform vec3 uAmbient;");

                /* Vertex and normal
                 */
                src.push("varying vec4 vViewVertex;");              // View
                src.push("varying vec3 vNormal;");                  // View
                src.push("varying vec3 vEyeVec;");

                /* Texture coords
                 */
                if (texturing) {
                    src.push("varying vec2 vTextureCoord;");
                }

                /* Lights
                 */
                if (lights) {
                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];
                        src.push("uniform vec4  uLightPos" + i + ";");
                        src.push("uniform vec3  uLightDir" + i + ";");
                        src.push("uniform vec3  uLightColor" + i + ";");
                        src.push("uniform vec3  uLightAttenuation" + i + ";");

                        if (light.type == "spot") {
                            src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                            src.push("uniform float  uLightSpotExp" + i + ";");
                        }

                        src.push("varying vec3   vLightDir" + i + ";");
                        src.push("varying float  vLightDist" + i + ";");
                    }
                }

                /* Base material properties
                 */
                src.push("uniform vec3  uMatColor;");
                src.push("uniform vec3  uMatSpecularColor;");
                src.push("uniform float uMatReflectivity;");
                src.push("uniform float uMatSpecular;");
                src.push("uniform float uMatEmissive;");
                src.push("uniform float uMatShininess;");
                src.push("uniform float uMatAlpha;");

                // ========= Main =====================================================================================

                src.push("void main(void) {");

                src.push("float   attenuation = 1.0;");

                src.push("vec3    normal = vNormal;");

                src.push("vec3    lightValue=uAmbient;");         // Total diffuse value
                src.push("vec3    specValue=vec3(0.0,0.0,0.0);"); // Total specular value

                src.push("float   dotN;");
                src.push("float   spotEffect;");

                src.push("vec3    lightVec=vec3(0.0,0.0,0.0);");
                src.push("vec3    viewVec=vec3(0.0,0.0,0.0);");


                for (var i = 0; i < lights.length; i++) {
                    src.push("lightVec = vLightDir" + i + ";");
                    src.push("viewVec = vEyeVec;");

                    // -------- Point light ---------------------------------

                    if (lights[i].type == "point") {
                        src.push("dotN = max(dot(vNormal, normalize(lightVec)), 0.0);");
                        src.push("if (dotN > 0.0) {");
                        src.push(" attenuation = 1.0 / (" +

                            // constant
                                 "uLightAttenuation" + i + "[0] + " +

                            // linear
                                 "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +

                            // quadratic
                                 "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");

                        if (lights[i].diffuse) {
                            src.push("lightValue += attenuation * dotN * uLightColor" + i + ";");
                        }
                        src.push("}");

                        if (lights[i].specular) {
                            src.push("specValue += attenuation * uMatSpecularColor * uLightColor" + i +
                                     " * uMatSpecular  * pow(max(dot(reflect(normalize(lightVec), normal), normalize(viewVec)),0.0), uMatShininess);");
                        }
                    }

                    // -------- Spot light -----------------------------------


                    //
                    //                        hash.push("S");
                    //
                    //                        src.push(  "spotEffect = dot(normalize(lightdir" + i + "), normalize(-lightvec" + i + "));");
                    //                        src.push(  "if (spotEffect > spotCosCutOff" + i + ") {\n");
                    //                        src.push(  "spotEffect = pow(spotEffect, spotExp" + i + ");");
                    //                        src.push(  "dotN=max(dot(normal,normalize(-lightvec)),0.0);\n");
                    //                        src.push(  "if(dotN>0.0){\n");
                    //                        src.push(  "attenuation = spotEffect / (lightAttenuation" + i + "[0] + lightAttenuation" + i + "[1] * lightdist" + i + " + lightAttenuation" + i + "[2] * lightdist" + i + " * lightdist" + i + ");\n");
                    //                        if (lights[i].diffuse) {
                    //
                    //                            hash.push("D");
                    //
                    //                            src.push(  "lightvalue += attenuation * dotN * lightcolor" + i + ";\n");
                    //                        }
                    //                        if (lights[i].specular) {
                    //
                    //                            hash.push("S");
                    //
                    //                            src.push(  "specvalue += attenuation * specC * lightcolor" + i + " * spec  * pow(max(dot(reflect(normalize(lightvec), normal),normalize(viewvec)),0.0), sh);\n");
                    //                        }
                    //                        src.push(  "}\n}\n");

                    if (lights[i].type == "spot") {
                        src.push("spotEffect = dot(normalize(uLightDir" + i + "), normalize(-vLightDir" + i + "));");

                        src.push("if (spotEffect > uLightSpotCosCutOff" + i + ") {\n");
                        src.push("spotEffect = pow(spotEffect, uLightSpotExp" + i + ");");


                        src.push("dotN=max(dot(normal,normalize(-lightVec)),0.0);\n");

                        src.push("if(dotN>0.0){\n");
                        src.push("attenuation = spotEffect / (" +
                                 "uLightAttenuation" + i + "[0] + " +
                                 "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                                 "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");\n");

                        if (lights[i].diffuse) {
                            src.push("lightValue += attenuation * dotN * uLightColor" + i + ";\n");
                        }

                        if (lights[i].specular) {
                            src.push("specValue += attenuation * uMatSpecularColor * uLightColor" + i + " * uMatSpecular  * pow(max(dot(reflect(normalize(lightVec), normal),normalize(viewVec)),0.0), uMatShininess);\n");
                        }

                        src.push("}\n");
                        src.push("}\n");
                    }
                    //
                    //                    if (lights[i].type == "dir") {
                    //
                    //                        hash.push("D");
                    //
                    //                        src.push(  "dotN=max(dot(normal,-normalize(lightvec)),0.0);\n");
                    //                        if (lights[i].diffuse) {
                    //                            hash.push("D");
                    //                            src.push(  "lightvalue += dotN * lightcolor" + i + ";\n");
                    //                        }
                    //                        if (lights[i].specular) {
                    //                            hash.push("S");
                    //                            src.push(  "specvalue += specC * lightcolor" + i + " * spec  * pow(max(dot(reflect(normalize(lightvec), normal),normalize(viewvec)),0.0), sh);\n");
                    //                        }
                    //                    }
                }
                src.push("    gl_FragColor = vec4(specValue.rgb + uMatColor.rgb * lightValue.rgb, 1.0);  ");
                //  src.push(  "    gl_FragColor = vec4(0, 0, 1.0, 1.0);  ");
                src.push("}");

                return src.join("\n");
            }
        });
