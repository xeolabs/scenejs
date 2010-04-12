/**
 * This backend encapsulates shading behind an event API.
 *
 * By listening to XXX_UPDATED events, this backend tracks various elements of scene state, such as WebGL settings,
 * texture layers, lighting, current material properties etc.
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
                        textureLayers = [];

                        sceneHash = null;
                        fogHash = "";
                        lightsHash = "";
                        textureHash = "";
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
                        rendererHash = rendererState.enableTexture2D ? "t" : "f";
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
                    SceneJS._eventTypes.TEXTURES_UPDATED,
                    function(stack) {
                        textureLayers = stack;
                        sceneHash = null;

                        /* Build texture hash
                         */
                        var hash = [];
                        for (var i = 0; i < stack.length; i++) {
                            var layer = textureLayers[i];
                            hash.push("/");
                            hash.push(layer.params.applyFrom);
                            hash.push("/");
                            hash.push(layer.params.applyTo);
                            hash.push("/");
                            hash.push(layer.params.blendMode);
                            if (layer.params.matrix) {
                                hash.push("/anim");
                            }
                        }
                        textureHash = hash.join("");
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURES_EXPORTED,
                    function(stack) {
                        for (var i = 0; i < stack.length; i++) {
                            var layer = stack[i];
                            activeProgram.bindTexture("uSampler" + i, layer.texture, i);
                            if (layer.params.matrixAsArray) {
                                activeProgram.setUniform("uLayer" + i + "Matrix", layer.params.matrixAsArray);
                            }
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_UPDATED,
                    function(l) {
                        lights = l;
                        sceneHash = null;

                        /* Build lights hash
                         */
                        var hash = [];
                        for (var i = 0; i < lights.length; i++) {
                            var light = lights[i];
                            hash.push(light.type);
                            if (light.specular) {
                                hash.push("s");
                            }
                            if (light.diffuse) {
                                hash.push("d");
                            }
                        }
                        lightsHash = hash.join("");
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_EXPORTED,
                    function(_lights) {
                        for (var i = 0; i < _lights.length; i++) {
                            var light = _lights[i];

                            activeProgram.setUniform("uLightColor" + i, light.color);
                            activeProgram.setUniform("uLightDiffuse" + i, light.diffuse);

                            if (light.type == "dir") {
                                activeProgram.setUniform("uLightDir" + i, light.dir);
                            }
                            if (light.type == "point") {
                                activeProgram.setUniform("uLightPos" + i, light.pos);
                            }
                            if (light.type == "spot") {
                                activeProgram.setUniform("uLightPos" + i, light.pos);
                                activeProgram.setUniform("uLightDir" + i, light.dir);
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
                    function(m) {
                        activeProgram.setUniform("uMaterialBaseColor", m.baseColor);
                        activeProgram.setUniform("uMaterialSpecularColor", m.specularColor);

                        activeProgram.setUniform("uMaterialSpecular", m.specular);
                        activeProgram.setUniform("uMaterialShine", m.shine);
                        activeProgram.setUniform("uMaterialEmit", m.emit);
                        activeProgram.setUniform("uMaterialAlpha", m.alpha);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.FOG_UPDATED,
                    function(f) {
                        fog = f;
                        sceneHash = null;
                        fogHash = fog ? fog.mode : "";
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.FOG_EXPORTED,
                    function(f) {
                        activeProgram.setUniform("uFogColor", f.color);
                        activeProgram.setUniform("uFogDensity", f.density);
                        activeProgram.setUniform("uFogStart", f.start);
                        activeProgram.setUniform("uFogEnd", f.end);
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
                    SceneJS._eventTypes.GEOMETRY_UPDATED,
                    function(geo) {
                        var hash = [];
                        geometry = geo;
                        sceneHash = null;
                        geometryHash = ([
                            geometry.uvBuf ? "t" : "f",
                            geometry.uvBuf2 ? "t" : "f"]).join("");
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_EXPORTED,
                    function(geo) {
                        activeProgram.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                        activeProgram.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                        if (textureLayers.length > 0 && rendererState.enableTexture2D) {
                            if (geo.uvBuf) {
                                activeProgram.bindFloatArrayBuffer("aUVCoord", geo.uvBuf);
                            }
                            if (geo.uvBuf2) {
                                activeProgram.bindFloatArrayBuffer("aUVCoord2", geo.uvBuf2);
                            }
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
                            //  ctx.logging.info("Evicting shader: " + hash);
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
                        var vertexShaderSrc = composeVertexShader();
                        var fragmentShaderSrc = composeFragmentShader();
                        ctx.memory.allocate(
                                "shader",
                                function() {
                                    try {
                                        programs[sceneHash] = new SceneJS_webgl_Program(
                                                sceneHash,
                                                time,
                                                canvas.context,
                                                [vertexShaderSrc],
                                                [fragmentShaderSrc],
                                                ctx.logging);
                                    } catch (e) {
                                        ctx.logging.debug("Vertex shader:");
                                        ctx.logging.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                                        ctx.logging.debug("Fragment shader:");
                                        ctx.logging.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                                        throw e;
                                    }
                                });
                    }
                    activeProgram = programs[sceneHash];
                    activeProgram.lastUsed = time;
                    activeProgram.bind();
                    ctx.events.fireEvent(SceneJS._eventTypes.SHADER_ACTIVATED);
                }

                ctx.events.fireEvent(SceneJS._eventTypes.SHADER_RENDERING);
            }

            /**
             * Generates a shader hash code from current rendering state.
             *
             * TODO: use mask
             */
            function generateHash() {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                    sceneHash = ([canvas.canvasId, "picking"]).join(";");
                } else {
                    sceneHash = ([canvas.canvasId, rendererHash, fogHash, lightsHash, textureHash, geometryHash]).join(";");
                }
            }

            function getShaderLoggingSource(src) {
                var src2 = [];
                for (var i = 0; i < src.length; i++) {
                    var padding = (i < 10) ? "&nbsp;&nbsp;&nbsp;" : ((i < 100) ? "&nbsp;&nbsp;" : (i < 1000 ? "&nbsp;" : ""));
                    src2.push(i + padding + ": " + src[i]);
                }
                return src2.join("<br/>");
            }

            function composeVertexShader() {
                return SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_RENDER ?
                       composeRenderingVertexShader() : composePickingVertexShader();
            }

            function composeFragmentShader() {
                return SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_RENDER ?
                       composeRenderingFragmentShader() : composePickingFragmentShader();
            }

            /**
             * Composes a vertex shader script for rendering mode in current scene state
             */
            function composePickingVertexShader() {
                return [
                    "attribute vec3 aVertex;",
                    "uniform mat4 uMMatrix;",
                    "uniform mat4 uVMatrix;",
                    "uniform mat4 uPMatrix;",
                    "void main(void) {",
                    "  gl_Position = uPMatrix * (uVMatrix * (uMMatrix * vec4(aVertex, 1.0)));",
                    "}"
                ].join("\n");
            }

            /**
             * Composes a fragment shader script for rendering mode in current scene state
             */
            function composePickingFragmentShader() {
                var g = parseFloat(Math.round((10 + 1) / 256) / 256);
                var r = parseFloat((10 - g * 256 + 1) / 256);
                var src = [
                    "uniform vec3 uColor;",
                    "void main(void) {",

                    "gl_FragColor = vec4(" + (r.toFixed(17)) + ", " + (g.toFixed(17)) + ",1.0,1.0);",

                    //      "    gl_FragColor = vec4(uColor.rgb, 1.0);  ",
                    "}"
                ].join("\n");

                return src;
            }

            function composeRenderingVertexShader() {
                var haveTextures = textureLayers.length > 0 && rendererState.enableTexture2D;
                var src = ["\n"];
                src.push("attribute vec3 aVertex;");                // World
                src.push("attribute vec3 aNormal;");                // World
                if (haveTextures) {
                    if (geometry.uvBuf) {
                        src.push("attribute vec2 aUVCoord;");      // World
                    }
                    if (geometry.uvBuf2) {
                        src.push("attribute vec2 aUVCoord2;");      // World
                    }
                }
                src.push("uniform mat4 uMMatrix;");               // Model
                src.push("uniform mat4 uMNMatrix;");              // Model Normal
                src.push("uniform mat4 uVMatrix;");               // View
                src.push("uniform mat4 uVNMatrix;");              // View Normal
                src.push("uniform mat4 uPMatrix;");               // Projection

                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    if (light.type == "dir") {
                        src.push("uniform vec3 uLightDir" + i + ";");
                    }
                    if (light.type == "point") {
                        src.push("uniform vec4 uLightPos" + i + ";");
                    }
                    if (light.type == "spot") {
                        src.push("uniform vec4 uLightPos" + i + ";");
                    }
                }
                src.push("varying vec4 vViewVertex;");
                src.push("varying vec3 vNormal;");
                src.push("varying vec3 vEyeVec;");
                if (haveTextures) {
                    if (geometry.uvBuf) {
                        src.push("varying vec2 vUVCoord;");
                    }
                    if (geometry.uvBuf2) {
                        src.push("varying vec2 vUVCoord2;");
                    }
                }

                for (var i = 0; i < lights.length; i++) {
                    src.push("varying vec3 vLightVec" + i + ";");
                    src.push("varying float vLightDist" + i + ";");
                }
                src.push("void main(void) {");
                src.push("  vec4 tmpVNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
                src.push("  vNormal = normalize(tmpVNormal.xyz);");                                 // View-space normal
                src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
                src.push("  vViewVertex = tmpVertex;");
                src.push("  gl_Position = uPMatrix * vViewVertex;");

                src.push("  vec3 tmpVec;");
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    if (light.type == "dir") {
                        src.push("tmpVec = -uLightDir" + i + ";");
                    }
                    if (light.type == "point") {
                        src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                        src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex
                    }
                    if (light.type == "spot") {
                        src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                        src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex

                    }
                    src.push("vLightVec" + i + " = tmpVec;");                   // Vector from light to vertex

                }
                src.push("vEyeVec = normalize(-vViewVertex.xyz);");
                if (haveTextures) {
                    if (geometry.uvBuf) {
                        src.push("vUVCoord = aUVCoord;");
                    }
                    if (geometry.uvBuf2) {
                        src.push("vUVCoord2 = aUVCoord2;");
                    }
                }
                src.push("}");
                //ctx.logging.info(getShaderLoggingSource(src));
                return src.join("\n");
            }


            function composeRenderingFragmentShader() {

                var haveTextures = textureLayers.length > 0 && rendererState.enableTexture2D;
                var haveLights = (lights.length > 0);

                var src = ["\n"];

                src.push("varying vec4 vViewVertex;");              // View-space vertex
                src.push("varying vec3 vNormal;");                  // View-space normal
                src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

                if (haveTextures) {
                    if (geometry.uvBuf) {
                        src.push("varying vec2 vUVCoord;");
                    }
                    if (geometry.uvBuf2) {
                        src.push("varying vec2 vUVCoord2;");
                    }

                    for (var i = 0; i < textureLayers.length; i++) {
                        var layer = textureLayers[i];
                        src.push("uniform sampler2D uSampler" + i + ";");
                        if (layer.params.matrix) {
                            src.push("uniform mat4 uLayer" + i + "Matrix;");
                        }
                    }
                }

                src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
                src.push("uniform vec3  uMaterialBaseColor;");
                src.push("uniform float uMaterialEmit;");
                src.push("uniform float uMaterialAlpha;");

                if (haveLights) {
                    src.push("uniform vec3  uMaterialSpecularColor;");
                    src.push("uniform float uMaterialSpecular;");
                    src.push("uniform float uMaterialShine;");

                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];
                        src.push("uniform vec3  uLightColor" + i + ";");
                        if (light.type == "point") {
                            src.push("uniform vec4   uLightPos" + i + ";");
                        }
                        if (light.type == "dir") {
                            src.push("uniform vec3   uLightDir" + i + ";");
                        }
                        if (light.type == "spot") {
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
                src.push("  vec3    ambientValue=uAmbient;");
                src.push("  vec3    color   = uMaterialBaseColor;");
                src.push("  float   emit    = uMaterialEmit;");
                src.push("  float   alpha   = uMaterialAlpha;");

                src.push("  vec4    normalmap = vec4(vNormal,0.0);");

                if (haveLights) {
                    src.push("  float   specular=uMaterialSpecular;");
                    src.push("  vec3    specularColor=uMaterialSpecularColor;");
                    src.push("  float   shine=uMaterialShine;");
                    src.push("  float   attenuation = 1.0;");
                }

                if (haveTextures) {
                    src.push("  vec4    texturePos;");
                    src.push("  vec2    textureCoord=vec2(0.0,0.0);");

                    for (var i = 0; i < textureLayers.length; i++) {
                        var layer = textureLayers[i];

                        /* Texture input
                         */
                        if (layer.params.applyFrom == "normal") {
                            if (geometry.normalBuf) {
                                src.push("texturePos=vec4(vNormal.xyz, 1.0);");
                            } else {
                                ctx.logging.warn("Texture layer applyFrom='normal' but geometry has no normal vectors");
                                continue;
                            }
                        }
                        if (layer.params.applyFrom == "uv") {
                            if (geometry.uvBuf) {
                                src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                            } else {
                                ctx.logging.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                                continue;
                            }
                        }
                        if (layer.params.applyFrom == "uv2") {
                            if (geometry.uvBuf2) {
                                src.push("texturePos = vec4(vUVCoord2.s, vUVCoord2.t, 1.0, 1.0);");
                            } else {
                                ctx.logging.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                                continue;
                            }
                        }

                        /* Texture matrix
                         */
                        if (layer.params.matrixAsArray) {
                            src.push("textureCoord=(uLayer" + i + "Matrix * texturePos).xy;");
                        } else {
                            src.push("textureCoord=texturePos.xy;");
                        }

                        /* Texture output
                         */
                        if (layer.params.applyTo == "baseColor") {
                            if (layer.params.blendMode == "multiply") {
                                src.push("color  = color * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                            } else {
                                src.push("color  = color + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                            }
                        }
                    }
                }

                src.push("  vec3    lightValue      = uAmbient;");
                src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");

                if (haveLights) {
                    src.push("  vec3    lightVec;");
                    src.push("  float   dotN;");
                    src.push("  float   spotFactor;");
                    src.push("  float   pf;");

                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];
                        src.push("lightVec = normalize(vLightVec" + i + ");");

                        /* Point Light
                         */
                        if (light.type == "point") {
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
                        if (light.type == "dir") {
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
                        if (light.type == "spot") {
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
                            if (lights[i].specular) {
                                src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                         " * specular  * pow(max(dot(reflect(normalize(lightVec), vNormal),normalize(vEyeVec)),0.0), shine);");
                            }

                            src.push("      }");
                            src.push("}");
                        }
                    }
                }
                src.push("if (emit>0.0) lightValue = vec3(1.0, 1.0, 1.0);");

                src.push("vec4 fragColor = vec4(specularValue.rgb + color.rgb * (emit+1.0) * lightValue.rgb, alpha);");

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

                //  src.push("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
                src.push("}");

                //  ctx.logging.info(getShaderLoggingSource(src));
                return src.join("\n");
            }
        });