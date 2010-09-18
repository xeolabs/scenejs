/**
 * This module encapsulates the rendering backend behind an event API.
 *
 * It's job is to collect the textures, lights, materials etc. as they are exported during scene
 * traversal by the other modules, then when traversal is finished, sort them into a sequence of
 * that would involve minimal WebGL state changes, then apply the sequence to WebGL.
 *

 * Shader allocation and LRU cache eviction is mediated by SceneJS._memoryModule.
 *  @private
 */
SceneJS._shaderModule = new (function() {

    var debugCfg;

    var time = (new Date()).getTime();      // For LRU shader caching

    var canvas;                             // Currently active canvas

    var nextStateId;                        // Generates unique state ID

    var rendererState;
    var lightState;
    var boundaryState;
    var materialState;
    var fogState;
    var texState;
    var geoState;
    var modelXFormState;
    var viewXFormState;
    var projXFormState;
    var pickState;

    var nodes = [];

    var programs = {};


    /* Register this module to deallocate shaders
     * when memory module needs VRAM
     */
    SceneJS._memoryModule.registerEvictor(
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
                    //  SceneJS._loggingModule.info("Evicting shader: " + hash);
                    programToEvict.destroy();
                    programs[programToEvict.hash] = null;
                    return true;
                }
                return false;   // Couldnt find suitable program to delete
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                for (var programId in programs) {  // Just free allocated programs
                    programs[programId].destroy();
                }
                programs = {};
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                debugCfg = SceneJS._debugModule.getConfigs("shading");
                canvas = null;

                nextStateId = 0;

                rendererState = {
                    props: {},
                    hash: ""
                };

                lightState = {
                    lights: [],
                    hash: ""
                };

                boundaryState = null;

                materialState = {
                    material: {
                        _stateId : nextStateId++,
                        baseColor : [ 0.5, 0.5, 0.5 ],
                        specularColor: [ 0.9,  0.9,  0.9 ],
                        specular : 200,
                        shine : 1,
                        reflect : 0,
                        alpha : 1.0,
                        emit : 0.7
                    },
                    hash: ""
                };

                fogState = null;

                texState = {
                    _stateId : nextStateId++,
                    layers: [],
                    hash: ""
                };

                geoState = null;
                nodes = [];
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RENDERER_EXPORTED,
            function(props) {
                rendererState = {
                    _stateId : nextStateId++,
                    props: props,
                    hash: ""
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TEXTURES_EXPORTED,
            function(texture) {

                /* Build texture hash
                 */
                var hashStr;
                if (texture.layers.length) {
                    var hash = [];
                    for (var i = 0; i < texture.layers.length; i++) {
                        var layer = texture.layers[i];
                        hash.push("/");
                        hash.push(layer.applyFrom);
                        hash.push("/");
                        hash.push(layer.applyTo);
                        hash.push("/");
                        hash.push(layer.blendMode);
                        if (layer.matrix) {
                            hash.push("/anim");
                        }
                    }
                    hashStr = hash.join("");
                } else {
                    hashStr = "__scenejs_no_tex";
                }

                texState = {
                    _stateId : nextStateId++,
                    texture : texture,
                    hash : hashStr
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.LIGHTS_EXPORTED,
            function(lights) {

                /* Build lights hash
                 */
                var hash = [];
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    hash.push(light.mode);
                    if (light.specular) {
                        hash.push("s");
                    }
                    if (light.diffuse) {
                        hash.push("d");
                    }
                }

                lightState = {
                    _stateId : nextStateId++,
                    lights: lights,
                    hash: hash.join("")
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.BOUNDARY_EXPORTED,
            function(params) {
                boundaryState = {
                    _stateId : nextStateId++,
                    boundary: params.boundary,
                    hash: ""
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MATERIAL_EXPORTED,
            function(material) {
                materialState = {
                    _stateId : nextStateId++,
                    material: material,
                    hash: ""
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PICK_COLOR_EXPORTED,
            function(params) {
                pickState = {
                    _stateId : nextStateId++,
                    pickColor: params.pickColor,
                    hash: ""
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.FOG_EXPORTED,
            function(fog) {
                fogState = {
                    _stateId : nextStateId++,
                    fog: fog,
                    hash: fog.mode
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MODEL_TRANSFORM_EXPORTED,
            function(transform) {
                modelXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray,
                    normalMat : transform.normalMatrixAsArray
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_EXPORTED,
            function(transform) {
                viewXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray,
                    normalMat : transform.normalMatrixAsArray
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_EXPORTED,
            function(transform) {
                projXFormState = {                  // No hash needed - does not contribute to shader construction
                    _stateId : nextStateId++,
                    mat : transform.matrixAsArray
                };
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.GEOMETRY_EXPORTED,
            function(geo) {
                geoState = {
                    _stateId : nextStateId++,
                    geo:geo,
                    hash: ([
                        geo.normalBuf ? "t" : "f",
                        geo.uvBuf ? "t" : "f",
                        geo.uvBuf2 ? "t" : "f"]).join("")
                };

                /* Marshal the state soup
                 */
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_RENDERING);

                var sceneHash = getSceneHash();

                /* Add node for geometry, linked to current states in the soup
                 */
                nodes.push({
                    program : {
                        id: sceneHash,
                        program: getProgram(sceneHash)
                    },
                    boundaryState: boundaryState,
                    geoState: geoState,
                    rendererState: rendererState,
                    lightState: lightState,
                    materialState: materialState,
                    fogState : fogState,
                    modelXFormState: modelXFormState,
                    viewXFormState: viewXFormState,
                    projXFormState: projXFormState,
                    texState: texState,
                    pickState : pickState
                });
            });

    function getSceneHash() {
        if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
            return ([canvas.canvasId, "picking"]).join(";");
        } else {
            return ([
                canvas.canvasId,
                rendererState.hash,
                fogState.hash,
                lightState.hash,
                texState.hash,
                geoState.hash]).join(";");
        }
    }

    function getProgram(sceneHash) {
        if (!programs[sceneHash]) {
            SceneJS._loggingModule.info("Creating shader: '" + sceneHash + "'");
            var vertexShaderSrc = composeVertexShader();
            var fragmentShaderSrc = composeFragmentShader();
            SceneJS._memoryModule.allocate(
                    canvas.context,
                    "shader",
                    function() {
                        try {
                            programs[sceneHash] = new SceneJS._webgl_Program(
                                    sceneHash,
                                    time,
                                    canvas.context,
                                    [vertexShaderSrc],
                                    [fragmentShaderSrc],
                                    SceneJS._loggingModule);

                        } catch (e) {
                            SceneJS._loggingModule.debug("Vertex shader:");
                            SceneJS._loggingModule.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                            SceneJS._loggingModule.debug("Fragment shader:");
                            SceneJS._loggingModule.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                            throw SceneJS._errorModule.fatalError(e);
                        }
                    });
        }
        var program = programs[sceneHash];
        program.lastUsed = time; // For LRU eviction
        return program;
    }

    /**
     * @private
     */
    function getShaderLoggingSource(src) {
        //        var src2 = [];
        //        for (var i = 0; i < src.length; i++) {
        //            var padding = (i < 10) ? "&nbsp;&nbsp;&nbsp;" : ((i < 100) ? "&nbsp;&nbsp;" : (i < 1000 ? "&nbsp;" : ""));
        //            src2.push(i + padding + ": " + src[i]);
        //        }
        //       // return src2.join("<br/>");
        return src.join("");
    }

    /**
     * @private
     */
    function composeVertexShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingVertexShader() : composePickingVertexShader();
    }

    /**
     * @private
     */
    function composeFragmentShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingFragmentShader() : composePickingFragmentShader();
    }

    /**
     * Composes a vertex shader script for rendering mode in current scene state
     * @private
     */
    function composePickingVertexShader() {
        var src = [
            "attribute vec3 aVertex;",
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;",
            "void main(void) {",
            "  gl_Position = uPMatrix * (uVMatrix * (uMMatrix * vec4(aVertex, 1.0)));",
            "}"
        ];
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    function composePickingFragmentShader() {
        //        var g = parseFloat(Math.round((10 + 1) / 256) / 256);  // TODO: use exported pick color
        //        var r = parseFloat((10 - g * 256 + 1) / 256);
        var src = [
            "#ifdef GL_ES",
            "   precision highp float;",
            "#endif",

            "uniform vec3 uPickColor;",
            "void main(void) {",,
            "    gl_FragColor = vec4(uPickColor.rgb, 1.0);  ",
            "}"
        ];
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }


    /**
     * @private
     */
    function composeRenderingVertexShader() {

        var texturing = texState.texture.layers.length > 0 && (geoState.geo.uvBuf || geoState.geo.uvBuf2);
        var lighting = (lightState.lights.length > 0 && geoState.geo.normalBuf);

        var src = ["\n"];
        src.push("attribute vec3 aVertex;");                // World coordinates

        if (lighting) {
            src.push("attribute vec3 aNormal;");            // Normal vectors
            src.push("uniform mat4 uMNMatrix;");            // Model normal matrix
            src.push("uniform mat4 uVNMatrix;");            // View normal matrix

            src.push("varying vec3 vNormal;");              // Output view normal vector
            src.push("varying vec3 vEyeVec;");              // Output view eye vector

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("uniform vec3 uLightDir" + i + ";");
                }
                if (light.mode == "point") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }
                if (light.mode == "spot") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }

                src.push("varying vec3 vLightVec" + i + ";");
                src.push("varying float vLightDist" + i + ";");
            }
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("attribute vec2 aUVCoord;");      // UV coords
            }
            if (geoState.geo.uvBuf2) {
                src.push("attribute vec2 aUVCoord2;");     // UV2 coords
            }
        }
        src.push("uniform mat4 uMMatrix;");                // Model matrix
        src.push("uniform mat4 uVMatrix;");                // View matrix
        src.push("uniform mat4 uPMatrix;");                 // Projection matrix

        src.push("varying vec4 vViewVertex;");

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }
        }

        src.push("void main(void) {");
        if (lighting) {
            src.push("  vec4 tmpVNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
            src.push("  vNormal = normalize(tmpVNormal.xyz);");
        }
        src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");

        src.push("  vec3 tmpVec;");

        if (lighting) {
            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                if (light.mode == "dir") {
                    src.push("tmpVec = -uLightDir" + i + ";");
                }
                if (light.mode == "point") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex
                }
                if (light.mode == "spot") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex

                }
                src.push("vLightVec" + i + " = tmpVec;");                   // Vector from light to vertex

            }
            src.push("vEyeVec = normalize(-vViewVertex.xyz);");
        }

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("vUVCoord = aUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("vUVCoord2 = aUVCoord2;");
            }
        }
        src.push("}");
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }

    /**
     * @private
     */
    function composeRenderingFragmentShader() {
        var texturing = texState && texState.texture.layers.length > 0 && geoState && geoState.geo.uvBuf || geoState.geo.uvBuf2;
        var lighting = lightState && lightState.lights.length > 0 && geoState && geoState.geo.normalBuf;

        var src = ["\n"];

        src.push("#ifdef GL_ES");
        src.push("   precision highp float;");
        src.push("#endif");

        src.push("varying vec4 vViewVertex;");              // View-space vertex

        if (texturing) {
            if (geoState.geo.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geoState.geo.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }

            for (var i = 0; i < texState.texture.layers.length; i++) {
                var layer = texState.texture.layers[i];
                src.push("uniform sampler2D uSampler" + i + ";");
                if (layer.matrix) {
                    src.push("uniform mat4 uLayer" + i + "Matrix;");
                }
            }
        }

        src.push("uniform vec3  uMaterialBaseColor;");
        src.push("uniform float uMaterialAlpha;");

        if (lighting) {
            src.push("varying vec3 vNormal;");                  // View-space normal
            src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

            src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
            src.push("uniform float uMaterialEmit;");

            src.push("uniform vec3  uMaterialSpecularColor;");
            src.push("uniform float uMaterialSpecular;");
            src.push("uniform float uMaterialShine;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("uniform vec3  uLightColor" + i + ";");
                if (light.mode == "point") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                }
                if (light.mode == "dir") {
                    src.push("uniform vec3   uLightDir" + i + ";");
                }
                if (light.mode == "spot") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                    src.push("uniform vec3   uLightDir" + i + ";");
                    src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                    src.push("uniform float  uLightSpotExp" + i + ";");
                }
                src.push("uniform vec3  uLightAttenuation" + i + ";");
                src.push("varying vec3  vLightVec" + i + ";");         // Vector from light to vertex
                src.push("varying float vLightDist" + i + ";");        // Distance from light to vertex
            }
        }

        /* Fog uniforms
         */
        if (fogState.fog.mode != "disabled") {
            src.push("uniform vec3  uFogColor;");
            src.push("uniform float uFogDensity;");
            src.push("uniform float uFogStart;");
            src.push("uniform float uFogEnd;");
        }

        src.push("void main(void) {");
        src.push("  vec3    color   = uMaterialBaseColor;");
        src.push("  float   alpha   = uMaterialAlpha;");

        if (lighting) {
            src.push("  vec3    ambientValue=uAmbient;");
            src.push("  float   emit    = uMaterialEmit;");

            src.push("  vec4    normalmap = vec4(vNormal,0.0);");
            src.push("  float   specular=uMaterialSpecular;");
            src.push("  vec3    specularColor=uMaterialSpecularColor;");
            src.push("  float   shine=uMaterialShine;");
            src.push("  float   attenuation = 1.0;");
        }

        if (texturing) {
            src.push("  vec4    texturePos;");
            src.push("  vec2    textureCoord=vec2(0.0,0.0);");

            for (var i = 0; i < texState.texture.layers.length; i++) {
                var layer = texState.texture.layers[i];

                /* Texture input
                 */
                if (layer.applyFrom == "normal" && lighting) {
                    if (geoState.geo.normalBuf) {
                        src.push("texturePos=vec4(vNormal.xyz, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv") {
                    if (geoState.geo.uvBuf) {
                        src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (geoState.geo.uvBuf2) {
                        src.push("texturePos = vec4(vUVCoord2.s, vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                        continue;
                    }
                }

                /* Texture matrix
                 */
                if (layer.matrixAsArray) {
                    src.push("textureCoord=(uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Texture output
                 */
                if (layer.applyTo == "baseColor") {
                    if (layer.blendMode == "multiply") {
                        src.push("color  = color * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    } else {
                        src.push("color  = color + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    }
                }
            }
        }

        if (lighting) {
            src.push("  vec3    lightValue      = uAmbient;");
            src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");

            src.push("  vec3    lightVec;");
            src.push("  float   dotN;");
            src.push("  float   spotFactor;");
            src.push("  float   pf;");

            for (var i = 0; i < lightState.lights.length; i++) {
                var light = lightState.lights[i];
                src.push("lightVec = normalize(vLightVec" + i + ");");

                /* Point Light
                 */
                if (light.mode == "point") {
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
                    src.push("if (dotN > 0.0) {");
                    src.push("  attenuation = 1.0 / (" +
                             "  uLightAttenuation" + i + "[0] + " +
                             "  uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                             "  uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    if (light.diffuse) {
                        src.push("  lightValue += dotN *  uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal), vEyeVec),0.0), shine);");
                    }
                    src.push("}");
                }

                /* Directional Light
                 */
                if (light.mode == "dir") {
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
                    if (light.diffuse) {
                        src.push("lightValue += dotN * uLightColor" + i + ";");
                    }
                    if (light.specular) {
                        src.push("specularValue += specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal),normalize(vEyeVec)),0.0), shine);");
                    }
                }

                /* Spot light
                 */
                if (light.mode == "spot") {
                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    src.push("if ( spotFactor > 20) {");
                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    src.push("  dotN = max(dot(vNormal,normalize(lightVec)),0.0);");
                    src.push("      if(dotN>0.0){");

                    //                            src.push("          attenuation = spotFactor / (" +
                    //                                     "uLightAttenuation" + i + "[0] + " +
                    //                                     "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                    //                                     "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    src.push("          attenuation = 1;");

                    if (light.diffuse) {
                        src.push("lightValue +=  dotN * uLightColor" + i + " * attenuation;");
                    }
                    if (light.specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(normalize(lightVec), vNormal),normalize(vEyeVec)),0.0), shine);");
                    }

                    src.push("      }");
                    src.push("}");
                }
            }
            src.push("if (emit>0.0) lightValue = vec3(1.0, 1.0, 1.0);");
            src.push("vec4 fragColor = vec4(specularValue.rgb + color.rgb * (emit+1.0) * lightValue.rgb, alpha);");
        } else {

            /* No lighting
             */
            src.push("vec4 fragColor = vec4(color.rgb, alpha);");
        }

        /* Fog
         */
        if (fogState.fog.mode != "disabled") {
            src.push("float fogFact=1.0;");
            if (fogState.fog.mode == "exp") {
                src.push("fogFact=clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
            } else if (fogState.fog.mode == "linear") {
                src.push("fogFact=clamp((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0, 1.0);");
            }
            src.push("gl_FragColor = fragColor * fogFact + vec4(uFogColor, 1) * (1.0 - fogFact);");
        } else {
            src.push("gl_FragColor = fragColor;");
        }
        if (debugCfg.whitewash == true) {
            src.push("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        }
        src.push("}");
        if (debugCfg.logScripts == true) {
            SceneJS._loggingModule.info(src);
        }
        return src.join("\n");
    }


    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                traverseStateGraph();
                canvas = null;
            });

    function traverseStateGraph() {

       // canvas.context.disable(canvas.context.DEPTH_TEST);

    //    nodes.sort(compareNodeBoundaries);

        renderer.init();

        for (var iNode = 0; iNode < nodes.length; iNode++) {
            var node = nodes[iNode];
            renderer.renderNode(node);
        }
        canvas.context.flush();

       // canvas.context.enable(canvas.context.DEPTH_TEST);
    }

    function compareNodeBoundaries(a, b) {
        if (!a.boundaryState.boundary) {  // Non-bounded nodes to front of list
            return -1;
        }
        if (!b.boundaryState.boundary) {
            return 1;
        }
        return (a.boundaryState.boundary.max[2] - b.boundaryState.boundary.max[2]);
    }

    var renderer = new (function() {

        this.init = function() {
            this._program = null;
            this._lastRendererState = null;
        };

        this.renderNode = function(node) {

            /* Bind program if none bound, or if node uses different program
             * to that currently bound. Also flag all buffers as needing to be bound.
             */
            if ((!this._program) || (node.program.id != this._lastProgramId)) {
                if (this._program) {
                    //  this._program.unbind();
                }

                this._program = node.program.program;
                this._program.bind();

                this._lastGeoStateId = -1;
                this._lastLightStateId = -1;
                this._lastMaterialStateId = -1;
                this._lastViewXFormStateId = -1;
                this._lastModelXFormStateId = -1;
                this._lastProjXFormStateId = -1;
                this._lastPickStateId = -1;

                this._lastProgramId = node.program.id;
            }

            /* Bind geometry
             */
            if (node.geoState._stateId != this._lastGeoStateId) {

                /* Disable all vertex arrays
                 */
                for (var k = 0; k < 8; k++) {
                    canvas.context.disableVertexAttribArray(k);
                }
                this._lastGeoStateId = node.geoState._stateId;
                if (node.geoState.geo.vertexBuf) {
                    this._program.bindFloatArrayBuffer("aVertex", node.geoState.geo.vertexBuf);
                }
                if (node.geoState.geo.normalBuf) {
                    this._program.bindFloatArrayBuffer("aNormal", node.geoState.geo.normalBuf);
                }
                if (node.texState && node.texState.texture.layers.length > 0) {
                    if (node.geoState.geo.uvBuf) {
                        this._program.bindFloatArrayBuffer("aUVCoord", node.geoState.geo.uvBuf);
                    }
                    if (node.geoState.geo.uvBuf2) {
                        this._program.bindFloatArrayBuffer("aUVCoord2", node.geoState.geo.uvBuf2);
                    }
                }
                node.geoState.geo.indexBuf.bind();
            }

            /* Set GL props
             */
            if (node.rendererState) {
                if (!this._lastRendererState || node.rendererState._stateId != this._lastRendererState._stateId) {
                    if (this._lastRendererState) {
                        this._lastRendererState.props.restoreProps(canvas.context);
                    }
                    node.rendererState.props.setProps(canvas.context);
                    this._lastRendererState = node.rendererState;
                }

                /* Bind renderer properties
                 */

                var clearColor = node.rendererState.props.props.clearColor;
                clearColor = clearColor
                        ? [clearColor.r, clearColor.g, clearColor.b]
                        : [0, 0, 0];
                this._program.setUniform("uAmbient", clearColor);
            }

            /* Bind texture layers
             */
            if (node.texState) {
                var layer;
                for (var j = 0; j < node.texState.texture.layers.length; j++) {
                    layer = node.texState.texture.layers[j];
                    this._program.bindTexture("uSampler" + j, layer.texture, j);
                    if (layer.matrixAsArray) {
                        this._program.setUniform("uLayer" + j + "Matrix", layer.matrixAsArray);
                    }
                }
            }

            /* Bind fog
             */
            if (node.fogState && node.fogState.fog.mode != "disabled") {
                this._program.setUniform("uFogColor", node.fogState.fog.color);
                this._program.setUniform("uFogDensity", node.fogState.fog.density);
                this._program.setUniform("uFogStart", node.fogState.fog.start);
                this._program.setUniform("uFogEnd", node.fogState.fog.end);
            }

            /* Bind View matrix
             */
            if (node.viewXFormState._stateId != this._lastViewXFormStateId) {
                this._program.setUniform("uVMatrix", node.viewXFormState.mat);
                this._program.setUniform("uVNMatrix", node.viewXFormState.normalMat);
                this._lastViewXFormStateId = node.viewXFormState._stateId;
            }

            /* Bind Model matrix
             */
            if (node.modelXFormState._stateId != this._lastModelXFormStateId) {
                this._program.setUniform("uMMatrix", node.modelXFormState.mat);
                this._program.setUniform("uMNMatrix", node.modelXFormState.normalMat);
                this._lastModelXFormStateId = node.modelXFormState._stateId;
            }

            /* Bind Projection matrix
             */
            if (node.projXFormState._stateId != this._lastProjXFormStateId) {
                this._program.setUniform("uPMatrix", node.projXFormState.mat);
                this._lastProjXFormStateId = node.projXFormState._stateId;
            }

            /* Bind lights
             */
            if (node.lightState && node.lightState._stateId != this._lastLightStateId) {
                var ambient;
                for (var k = 0; k < node.lightState.lights.length; k++) {
                    var light = node.lightState.lights[k];
                    this._program.setUniform("uLightColor" + k, light.color);
                    this._program.setUniform("uLightDiffuse" + k, light.diffuse);
                    if (light.mode == "dir") {
                        this._program.setUniform("uLightDir" + k, light.viewDir);
                    } else if (light.mode == "ambient") {
                        ambient = ambient ? [
                            ambient[0] + light.color[0],
                            ambient[1] + light.color[1],
                            ambient[2] + light.color[2]
                        ] : light.color;
                    } else {
                        if (light.mode == "point") {
                            this._program.setUniform("uLightPos" + k, light.viewPos);
                        }
                        if (light.mode == "spot") {
                            this._program.setUniform("uLightPos" + k, light.viewPos);
                            this._program.setUniform("uLightDir" + k, light.viewDir);
                            this._program.setUniform("uLightSpotCosCutOff" + k, light.spotCosCutOff);
                            this._program.setUniform("uLightSpotExp" + k, light.spotExponent);
                        }
                        this._program.setUniform("uLightAttenuation" + k,
                                [
                                    light.constantAttenuation,
                                    light.linearAttenuation,
                                    light.quadraticAttenuation
                                ]);
                    }
                }
                this._lastLightStateId = node.lightState._stateId;
            }

            /* Bind Material
             */
            if (node.materialState && node.materialState._stateId != this._lastMaterialStateId) {
                this._program.setUniform("uMaterialBaseColor", node.materialState.material.baseColor);
                this._program.setUniform("uMaterialSpecularColor", node.materialState.material.specularColor);
                this._program.setUniform("uMaterialSpecular", node.materialState.material.specular);
                this._program.setUniform("uMaterialShine", node.materialState.material.shine);
                this._program.setUniform("uMaterialEmit", node.materialState.material.emit);
                this._program.setUniform("uMaterialAlpha", node.materialState.material.alpha);
                this._lastMaterialStateId = node.materialState._stateId;
            }

            /* Bind pick color
             */
            if (node.pickState && node.pickState._stateId != this._lastPickStateId) {
                this._program.setUniform("uPickColor", node.pickState.pickColor);
            }

            /* Draw
             */
            canvas.context.drawElements(
                    node.geoState.geo.primitive,
                    node.geoState.geo.indexBuf.numItems,
                    canvas.context.UNSIGNED_SHORT,
                    0);
        };
    })();
})();