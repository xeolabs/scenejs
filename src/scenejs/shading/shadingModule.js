/**
 * This module encapsulates shading behind an event API.
 *
 * By listening to XXX_UPDATED events, this module tracks various elements of scene state, such as WebGL settings,
 * texture layers, lighting, current material properties etc.
 *
 * On a SHADER_ACTIVATE event it will compose and activate a shader taylored to the current scene state
 * (ie. where the shader has variables and routines for the current lights, materials etc), then fire a
 * SHADER_ACTIVATED event when the shader is ready for business.
 *
 * Other modules will then handle the SHADER_ACTIVATED event by firing XXXXX_EXPORTED events parameterised with
 * resources that they want loaded into the shader. This module then handles those by loading their parameters into
 * the shader.
 *
 * The module will avoid constant re-generation of shaders by caching each of them against a hash code that it
 * derives from the current collective scene state; on a SHADER_ACTIVATE event, it will attempt to reuse a shader
 * cached for the hash of the current scene state.
 *
 * Shader allocation and LRU cache eviction is mediated by SceneJS._memoryModule.
 *  @private
 */
SceneJS._shaderModule = new (function() {

    var debugCfg;

    var time = (new Date()).getTime();      // For LRU caching

    /* Resources contributing to shader
     */
    var canvas;                             // Currently active canvas
    var rendererState;                      // WebGL settings state
    var lights = [];                        // Current lighting state
    var material = {};                      // Current material state
    var fog = null;                         // Current fog
    var textureLayers = [];                 // Texture layers are pushed/popped to this as they occur
    var geometry = null;                    // Current geometry

    /* Hash codes identifying states of contributing resources
     */
    var rendererHash = "";
    var fogHash = "";
    var lightsHash = "";
    var textureHash = "";
    var geometryHash = "";

    /* Shader programs
     */
    var programs = {};                      // Program cache
    var activeProgram = null;               // Currently active program

    /* Combined hash from those of contributing resources, to identify shaders
     */
    var sceneHash;


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
                rendererState = null;
                activeProgram = null;
                lights = [];
                material = {};
                textureLayers = [];

                sceneHash = null;
                fogHash = "";
                lightsHash = "";
                textureHash = "";
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                activeProgram = null;
                sceneHash = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                activeProgram = null;
                sceneHash = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RENDERER_UPDATED,
            function(_rendererState) {
                rendererState = _rendererState;  // Canvas change will be signified by a CANVAS_UPDATED
                sceneHash = null;
                rendererHash = "";
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RENDERER_EXPORTED,
            function(_rendererState) {

                /* Default ambient material colour is taken from canvas clear colour
                 */
                var clearColor = _rendererState.clearColor;
                activeProgram.setUniform("uAmbient",
                        clearColor
                                ? [clearColor.r, clearColor.g, clearColor.b]
                                : [0, 0, 0]);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TEXTURES_UPDATED,
            function(texture) {
                textureLayers = texture.layers || [];
                sceneHash = null;

                /* Build texture hash
                 */
                var hash = [];
                for (var i = 0; i < textureLayers.length; i++) {
                    var layer = textureLayers[i];
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
                textureHash = hash.join("");
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TEXTURES_EXPORTED,
            function(texture) {
                var layers = texture.layers || [];
                var layer;
                for (var i = 0; i < layers.length; i++) {
                    layer = layers[i];
                    activeProgram.bindTexture("uSampler" + i, layer.texture, i);
                    if (layer.matrixAsArray) {
                        activeProgram.setUniform("uLayer" + i + "Matrix", layer.matrixAsArray);
                    }
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.LIGHTS_UPDATED,
            function(l) {
                lights = l;
                sceneHash = null;

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
                lightsHash = hash.join("");
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.LIGHTS_EXPORTED,
            function(_lights) {
                var ambient;
                for (var i = 0; i < _lights.length; i++) {
                    var light = _lights[i];
                    activeProgram.setUniform("uLightColor" + i, light.color);
                    activeProgram.setUniform("uLightDiffuse" + i, light.diffuse);
                    if (light.mode == "dir") {
                        activeProgram.setUniform("uLightDir" + i, light.viewDir);
                    } else if (light.mode == "ambient") {
                        ambient = ambient ? [
                            ambient[0] + light.color[0],
                            ambient[1] + light.color[1],
                            ambient[2] + light.color[2]
                        ] : light.color;
                    } else {
                        if (light.mode == "point") {
                            activeProgram.setUniform("uLightPos" + i, light.viewPos);
                        }
                        if (light.mode == "spot") {
                            activeProgram.setUniform("uLightPos" + i, light.viewPos);
                            activeProgram.setUniform("uLightDir" + i, light.viewDir);
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
                }
                if (ambient) {
                    //activeProgram.setUniform("uLightPos" + i, light.viewPos);
                }
            });


    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MATERIAL_UPDATED,
            function(m) {
                material = m;
                sceneHash = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MATERIAL_EXPORTED,
            function(m) {
                activeProgram.setUniform("uMaterialBaseColor", m.baseColor);
                activeProgram.setUniform("uMaterialSpecularColor", m.specularColor);

                activeProgram.setUniform("uMaterialSpecular", m.specular);
                activeProgram.setUniform("uMaterialShine", m.shine);
                activeProgram.setUniform("uMaterialEmit", m.emit);
                activeProgram.setUniform("uMaterialAlpha", m.alpha);
            });

    /**
     * When in pick mode, then with the pick fragment shader loaded, we'll get the
     * pick color instead of a material
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PICK_COLOR_EXPORTED,
            function(p) {
                activeProgram.setUniform("uPickColor", p.pickColor);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.FOG_UPDATED,
            function(f) {
                fog = f;
                sceneHash = null;
                fogHash = fog ? fog.mode : "";
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.FOG_EXPORTED,
            function(f) {
                activeProgram.setUniform("uFogColor", f.color);
                activeProgram.setUniform("uFogDensity", f.density);
                activeProgram.setUniform("uFogStart", f.start);
                activeProgram.setUniform("uFogEnd", f.end);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.MODEL_TRANSFORM_EXPORTED,
            function(transform) {
                activeProgram.setUniform("uMMatrix", transform.matrixAsArray);
                activeProgram.setUniform("uMNMatrix", transform.normalMatrixAsArray);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_EXPORTED,
            function(transform) {
                activeProgram.setUniform("uVMatrix", transform.matrixAsArray);
                activeProgram.setUniform("uVNMatrix", transform.normalMatrixAsArray);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_EXPORTED,
            function(transform) {
                activeProgram.setUniform("uPMatrix", transform.matrixAsArray);
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.GEOMETRY_UPDATED,
            function(geo) {
                geometry = geo;
                sceneHash = null;
                geometryHash = ([
                    geometry.normalBuf ? "t" : "f",
                    geometry.uvBuf ? "t" : "f",
                    geometry.uvBuf2 ? "t" : "f"]).join("");
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.GEOMETRY_EXPORTED,
            function(geo) {
                if (geo.vertexBuf) {
                    activeProgram.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                }
                if (geo.normalBuf) {
                    activeProgram.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                }
                if (textureLayers.length > 0) {
                    if (geo.uvBuf) {
                        activeProgram.bindFloatArrayBuffer("aUVCoord", geo.uvBuf);
                    }
                    if (geo.uvBuf2) {
                        activeProgram.bindFloatArrayBuffer("aUVCoord2", geo.uvBuf2);
                    }
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATE, // Request to activate a shader
            function() {
                activateProgram();
            });

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

    /**
     * @private
     */
    function activateProgram() {
        if (!canvas) {
            throw SceneJS._errorModule.fatalError(new SceneJS.errors.NoCanvasActiveException("No canvas active"));
        }

        if (!sceneHash) {
            generateHash();
        }

        if (!activeProgram || activeProgram.hash != sceneHash) {
            if (activeProgram) {
                canvas.context.flush();
                activeProgram.unbind();
                activeProgram = null;
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_DEACTIVATED);
            }

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
                                //  SceneJS._loggingModule.info("OK - Created shader: '" + sceneHash + "'");
                            } catch (e) {
                                SceneJS._loggingModule.debug("Vertex shader:");
                                SceneJS._loggingModule.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                                SceneJS._loggingModule.debug("Fragment shader:");
                                SceneJS._loggingModule.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                                throw SceneJS._errorModule.fatalError(e);
                            }
                        });
            }
            activeProgram = programs[sceneHash];
            activeProgram.lastUsed = time;
            activeProgram.bind();
            SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_ACTIVATED);
        }

        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SHADER_RENDERING);
    }

    /**
     * Generates a shader hash code from current rendering state.
     * @private
     */
    function generateHash() {
        if (SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_PICKING) {
            sceneHash = ([canvas.canvasId, "picking"]).join(";");
        } else {
            sceneHash = ([canvas.canvasId, rendererHash, fogHash, lightsHash, textureHash, geometryHash]).join(";");
        }
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

        var texturing = textureLayers.length > 0 && (geometry.uvBuf || geometry.uvBuf2);
        var lighting = (lights.length > 0 && geometry.normalBuf);

        var src = ["\n"];
        src.push("attribute vec3 aVertex;");                // World coordinates

        if (lighting) {
            src.push("attribute vec3 aNormal;");            // Normal vectors
            src.push("uniform mat4 uMNMatrix;");            // Model normal matrix
            src.push("uniform mat4 uVNMatrix;");            // View normal matrix

            src.push("varying vec3 vNormal;");              // Output view normal vector
            src.push("varying vec3 vEyeVec;");              // Output view eye vector

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
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
            if (geometry.uvBuf) {
                src.push("attribute vec2 aUVCoord;");      // UV coords
            }
            if (geometry.uvBuf2) {
                src.push("attribute vec2 aUVCoord2;");     // UV2 coords
            }
        }
        src.push("uniform mat4 uMMatrix;");                // Model matrix
        src.push("uniform mat4 uVMatrix;");                // View matrix
        src.push("uniform mat4 uPMatrix;");                 // Projection matrix

        src.push("varying vec4 vViewVertex;");

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geometry.uvBuf2) {
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
            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
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
            if (geometry.uvBuf) {
                src.push("vUVCoord = aUVCoord;");
            }
            if (geometry.uvBuf2) {
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
        var texturing = textureLayers.length > 0 && (geometry.uvBuf || geometry.uvBuf2);
        var lighting = (lights.length > 0 && geometry.normalBuf);

        var src = ["\n"];
                
        src.push("#ifdef GL_ES");
        src.push("   precision highp float;");
        src.push("#endif");

        src.push("varying vec4 vViewVertex;");              // View-space vertex

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geometry.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }

            for (var i = 0; i < textureLayers.length; i++) {
                var layer = textureLayers[i];
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

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
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
        if (fog && fog.mode != "disabled") {
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

            for (var i = 0; i < textureLayers.length; i++) {
                var layer = textureLayers[i];

                /* Texture input
                 */
                if (layer.applyFrom == "normal" && lighting) {
                    if (geometry.normalBuf) {
                        src.push("texturePos=vec4(vNormal.xyz, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyFrom='normal' but geometry has no normal vectors");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv") {
                    if (geometry.uvBuf) {
                        src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS._loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.applyFrom == "uv2") {
                    if (geometry.uvBuf2) {
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

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
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
        if (fog && fog.mode != "disabled") {
            src.push("float fogFact=1.0;");
            if (fog.mode == "exp") {
                src.push("fogFact=clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
            } else if (fog.mode == "linear") {
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
})();