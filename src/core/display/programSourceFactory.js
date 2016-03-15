/**
 * @class Manages creation, sharing and recycle of {@link SceneJS_ProgramSource} instances
 * @private
 */
var SceneJS_ProgramSourceFactory = new (function () {

    var cache = {}; // Source codes are shared across all scenes

    var states; // Cache rendering state
    var decal;
    var diffuseFresnel;
    var specularFresnel;
    var alphaFresnel;
    var reflectFresnel;
    var emitFresnel;
    var fragmentFresnel;
    var fresnel;
    var texturing;// True when rendering state contains textures
    var cubeMapping;
    var normals;// True when rendering state contains normals
    var solid;
    var skybox;  // True when object should be treated as a skybox
    var billboard;
    var tangents;
    var clipping;
    var morphing;
    var regionMapping;
    var regionInteraction;
    var depthTargeting;

    var src = ""; // Accumulates source code as it's being built

    /**
     * Get sourcecode for a program to render the given states
     */
    this.getSource = function (hash, _states) {

        var source = cache[hash];
        if (source) {
            source.useCount++;
            return source;
        }

        states = _states;

        decal = states.decal && states.decal.texture;
        diffuseFresnel = states.fresnel.diffuse;
        specularFresnel = states.fresnel.specular;
        alphaFresnel = states.fresnel.alpha;
        reflectFresnel = states.fresnel.reflect;
        emitFresnel = states.fresnel.emit;
        fragmentFresnel = states.fresnel.fragment;
        fresnel = diffuseFresnel || specularFresnel || alphaFresnel || reflectFresnel || emitFresnel || fragmentFresnel;
        texturing = hasTextures(states);
        cubeMapping = hasCubemap(states);
        normals = hasNormals(states);
        solid = states.flags.solid;
        skybox = states.flags.skybox;
        billboard = !states.billboard.empty;
        tangents = hasTangents(states);
        clipping = states.clips.clips.length > 0;
        morphing = !!states.morphGeometry.targets;
        regionMapping = hasRegionMap();
        regionInteraction = regionMapping && states.regionMap.mode !== "info";
        depthTargeting = hasDepthTarget();

        source = new SceneJS_ProgramSource(
            hash,

            vertexPicking(states),
            fragmentPicking(states),

            vertexRendering(states),
            fragmentRendering(states)
        );

        cache[hash] = source;

        return source;
    };

    /**
     * Releases program source code
     */
    this.putSource = function (hash) {
        var source = cache[hash];
        if (source) {
            if (--source.useCount == 0) {
                cache[source.hash] = null;
            }
        }
    };

    function vertexPicking() {

        begin();

        add("attribute vec3 SCENEJS_aVertex;");
        add("attribute vec4 SCENEJS_aColor;");
        add("uniform mat4 SCENEJS_uMMatrix;");
        add("uniform mat4 SCENEJS_uVMatrix;");
        add("uniform mat4 SCENEJS_uVNMatrix;");
        add("uniform mat4 SCENEJS_uPMatrix;");

        add("varying vec4 SCENEJS_vWorldVertex;");

        if (regionMapping) {
            add("attribute vec2 SCENEJS_aRegionMapUV;");
            add("varying vec2 SCENEJS_vRegionMapUV;");
        }

        if (morphing) {
            add("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (states.morphGeometry.targets[0].vertexBuf) {      // target2 has these arrays also
                add("attribute vec3 SCENEJS_aMorphVertex;");
            }
        }

        add("varying vec4 SCENEJS_vColor;");

        add("void main(void) {");

        add("   vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        if (morphing) {
            if (states.morphGeometry.targets[0].vertexBuf) {
                add("  tmpVertex = vec4(mix(tmpVertex.xyz, SCENEJS_aMorphVertex, SCENEJS_uMorphFactor), 1.0); ");
            }
        }
        add("  SCENEJS_vWorldVertex = SCENEJS_uMMatrix * tmpVertex; ");

        add("mat4 vPosMatrix = SCENEJS_uVMatrix;");

        if (skybox) {
            add("vPosMatrix[3].xyz = vec3(0.0);");
        }

        add("  gl_Position =  SCENEJS_uPMatrix * (vPosMatrix * SCENEJS_vWorldVertex);");

        if (regionMapping) {
            add("SCENEJS_vRegionMapUV = SCENEJS_aRegionMapUV;");
        }

        add("SCENEJS_vColor = SCENEJS_aColor;");

        add("}");

        return end();
    }

    function fragmentPicking() {

        begin();

        add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

        add("varying vec4 SCENEJS_vWorldVertex;");
        add("varying vec4  SCENEJS_vColor;");

        add("uniform float  SCENEJS_uPickMode;");                   // Z-pick mode when true else colour-pick
        add("uniform vec4  SCENEJS_uPickColor;");                   // Used in colour-pick mode
        add("uniform bool  SCENEJS_uClipping;");

        if (clipping) {
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("uniform float SCENEJS_uClipMode" + i + ";");
                add("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }

        if (regionMapping) {
            add("varying vec2 SCENEJS_vRegionMapUV;");
            add("uniform sampler2D SCENEJS_uRegionMapSampler;");
        }

        add("void main(void) {");

        if (clipping) {
            add("if (SCENEJS_uClipping) {");
            add("  float dist = 0.0;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
                add("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                add("  }");
            }
            add("  if (dist > 0.0) { discard; }");
            add("}");
        }

        add("    if  (SCENEJS_uPickMode == 0.0) {");  // Pick object
        add("          gl_FragColor = SCENEJS_uPickColor;  ");

        add("    } else if (SCENEJS_uPickMode == 1.0) {"); // Pick triangle
        add("          gl_FragColor = SCENEJS_vColor;  ");

        add("    } else {"); // Pick region
        if (regionMapping) {
            add("          gl_FragColor = texture2D(SCENEJS_uRegionMapSampler, vec2(SCENEJS_vRegionMapUV.s, 1.0 - SCENEJS_vRegionMapUV.t));");
        } else {
            add("          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        }
        add("    }");
        add("}");

        return end();
    }

    function hasRegionMap() {
        if (!states.regionMap.empty) {
            return hasUVs();
        }
        return false;
    }

    function hasTextures() {
        if (states.texture.layers && states.texture.layers.length > 0) {
            return hasUVs();
        }
        return false;
    }

    function hasUVs() {
        if (states.geometry.uvBufs) { // TODO only if there is at least one defined member in this array
            return true;
        }
        if (states.morphGeometry.targets && (states.morphGeometry.targets[0].uvBuf || states.morphGeometry.targets[0].uvBuf2)) {
            return true;
        }
        return false;
    }

    function hasCubemap(states) {
        return (states.flags.reflective && states.cubemap.layers && states.cubemap.layers.length > 0 && states.geometry.normalBuf);
    }

    function hasNormals(states) {
        if (states.geometry.normalBuf) {
            return true;
        }
        if (states.morphGeometry.targets && states.morphGeometry.targets[0].normalBuf) {
            return true;
        }
        return false;
    }

    function hasTangents(states) {
        if (states.texture) {
            var layers = states.texture.layers;
            if (!layers) {
                return false;
            }
            for (var i = 0, len = layers.length; i < len; i++) {
                if (layers[i].applyTo == "normals") {
                    return true;
                }
            }
        }
        return false;
    }

    function hasDepthTarget() {
        if (states.renderTarget && states.renderTarget.targets) {
            var targets = states.renderTarget.targets;
            for (var i = 0, len = targets.length; i < len; i++) {
                if (targets[i].bufType === "depth") {
                    return true;
                }
            }
        }
        return false;
    }

    function vertexRendering() {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.vertex
            && customShaders.vertex.code
            && customShaders.vertex.code != ""
            && SceneJS._isEmpty(customShaders.vertex.hooks)) {
            return [customShaders.vertex.code];
        }

        var customVertexShader = customShaders.vertex || {};
        var vertexHooks = customVertexShader.hooks || {};

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};

        var i;
        var uvBufs;

        begin();

        add("uniform mat4 SCENEJS_uMMatrix;");             // Model matrix
        add("uniform mat4 SCENEJS_uVMatrix;");             // View matrix
        add("uniform mat4 SCENEJS_uPMatrix;");             // Projection matrix

        add("attribute vec3 SCENEJS_aVertex;");            // Model coordinates

        add("uniform vec3 SCENEJS_uWorldEye;");            // World-space eye position

        add("varying vec3 SCENEJS_vViewEyeVec;");          // View-space vector from origin to eye

        if (normals) {

            add("attribute vec3 SCENEJS_aNormal;");        // Normal vectors
            add("uniform   mat4 SCENEJS_uMNMatrix;");      // Model normal matrix
            add("uniform   mat4 SCENEJS_uVNMatrix;");      // View normal matrix

            add("varying   vec3 SCENEJS_vViewNormal;");    // Output view-space vertex normal

            if (fresnel) {
                add("varying   vec3 SCENEJS_vWorldNormal;");    // Output view-space vertex normal
            }

            if (tangents) {
                add("attribute vec4 SCENEJS_aTangent;");
                add("varying   vec3 SCENEJS_vTangent;");
            }
        }

        if (decal || texturing) {

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("attribute vec2 SCENEJS_aUVCoord" + i + ";");
                    }
                }
            }
        }

        if (states.geometry.colorBuf) {
            add("attribute vec4 SCENEJS_aVertexColor;");
            add("varying vec4 SCENEJS_vColor;");               // Varying for fragment texturing
        }

        if (clipping || normals) {
            add("varying vec4 SCENEJS_vWorldVertex;");         // Varying for fragment clip or world pos hook
        }

        add("varying vec4 SCENEJS_vViewVertex;");              // Varying for fragment view clip hook

        if (decal || texturing) {                                            // Varyings for fragment texturing

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("varying vec2 SCENEJS_vUVCoord" + i + ";");
                    }
                }
            }
        }

        if (regionInteraction) {
            add("attribute vec2 SCENEJS_aRegionMapUV;");
            add("varying vec2 SCENEJS_vRegionMapUV;");
        }

        if (morphing) {
            add("uniform float SCENEJS_uMorphFactor;");       // LERP factor for morph
            if (states.morphGeometry.targets[0].vertexBuf) {      // target2 has these arrays also
                add("attribute vec3 SCENEJS_aMorphVertex;");
            }
            if (normals) {
                if (states.morphGeometry.targets[0].normalBuf) {
                    add("attribute vec3 SCENEJS_aMorphNormal;");
                }
            }
        }

        if (customVertexShader.code) {
            add("\n" + customVertexShader.code + "\n");
        }

        if (billboard) {

            // Billboarding function which modifies the rotation
            // elements of the given matrix

            add("void billboard(inout mat4 mat) {");
            add("   mat[0][0] = -1.0;");
            add("   mat[0][1] = 0.0;");
            add("   mat[0][2] = 0.0;");
            if (states.billboard.spherical) {
                add("   mat[1][0] = 0.0;");
                add("   mat[1][1] = 1.0;");
                add("   mat[1][2] = 0.0;");
            }
            add("   mat[2][0] = 0.0;");
            add("   mat[2][1] = 0.0;");
            add("   mat[2][2] =1.0;");
            add("}");
        }

        add("void main(void) {");

        add("  vec4 tmpVertex=vec4(SCENEJS_aVertex, 1.0); ");

        add("  vec4 modelVertex = tmpVertex; ");

        if (normals) {
            add("  vec4 modelNormal = vec4(SCENEJS_aNormal, 0.0); ");
        }

        // Morphing - morph targets are in same model space as the geometry
        if (morphing) {
            if (states.morphGeometry.targets[0].vertexBuf) {
                add("  vec4 vMorphVertex = vec4(SCENEJS_aMorphVertex, 1.0); ");
                add("  modelVertex = vec4(mix(modelVertex.xyz, vMorphVertex.xyz, SCENEJS_uMorphFactor), 1.0); ");
            }
            if (normals) {
                if (states.morphGeometry.targets[0].normalBuf) {
                    add("  vec4 vMorphNormal = vec4(SCENEJS_aMorphNormal, 1.0); ");
                    add("  modelNormal = vec4( mix(modelNormal.xyz, vMorphNormal.xyz, SCENEJS_uMorphFactor), 1.0); ");
                }
            }
        }

        add("mat4 modelMatrix = SCENEJS_uMMatrix;");
        add("mat4 viewMatrix = SCENEJS_uVMatrix;");

        if (normals) {
            add("mat4 modelNormalMatrix = SCENEJS_uMNMatrix;");
            add("mat4 viewNormalMatrix = SCENEJS_uVNMatrix;");
        }

        add("vec4 worldVertex;");
        add("vec4 viewVertex;");

        if (skybox) {
            add("viewMatrix[3].xyz = vec3(0.0);");
        }

        if (billboard) {

            // Since billboard effect is not preserved
            // in the product of two billboarded matrices,
            // we need to get the product of the model and
            // view matrices and billboard that

            add("   mat4 modelViewMatrix =  viewMatrix * modelMatrix;");

            add("   billboard(modelMatrix);");
            add("   billboard(viewMatrix);");
            add("   billboard(modelViewMatrix);");

            if (normals) {

                add("   mat4 modelViewNormalMatrix = viewNormalMatrix * modelNormalMatrix;");

                add("   billboard(modelNormalMatrix);");
                add("   billboard(viewNormalMatrix);");
                add("   billboard(modelViewNormalMatrix);");
            }

            if (vertexHooks.viewMatrix) {
                add("viewMatrix = " + vertexHooks.viewMatrix + "(viewMatrix);");
            }

            add("   worldVertex = modelMatrix * modelVertex;");
            add("   viewVertex = modelViewMatrix * modelVertex;");

        } else {

            if (vertexHooks.viewMatrix) {
                add("viewMatrix = " + vertexHooks.viewMatrix + "(viewMatrix);");
            }

            add("  worldVertex = modelMatrix * modelVertex;");
            add("  viewVertex  = viewMatrix * worldVertex; ");
        }

        if (vertexHooks.viewPos) {
            add("viewVertex=" + vertexHooks.viewPos + "(viewVertex);");    // Vertex hook function
        }

        if (normals) {
            add("  vec3 worldNormal = (modelNormalMatrix * modelNormal).xyz; ");
            add("  SCENEJS_vViewNormal = (viewNormalMatrix * vec4(worldNormal, 1.0)).xyz;");

            if (fresnel) {
                add("  SCENEJS_vWorldNormal = worldNormal;");
            }
        }

        if (clipping || normals || fragmentHooks.worldPos) {
            add("  SCENEJS_vWorldVertex = worldVertex;");                  // Varying for fragment world clip or hooks
        }

        add("  SCENEJS_vViewVertex = viewVertex;");                    // Varying for fragment hooks

        if (vertexHooks.projMatrix) {
            add("gl_Position = " + vertexHooks.projMatrix + "(SCENEJS_uPMatrix) * viewVertex;");
        } else {
            add("  gl_Position = SCENEJS_uPMatrix * viewVertex;");
        }

        if (tangents) {

            // Compute tangent-bitangent-normal matrix

            add("vec3 tangent = normalize((viewNormalMatrix * modelNormalMatrix * SCENEJS_aTangent).xyz);");
            add("vec3 bitangent = cross(SCENEJS_vViewNormal, tangent);");
            add("mat3 TBM = mat3(tangent, bitangent, SCENEJS_vViewNormal);");

            add("SCENEJS_vTangent = tangent;");
        }

        add("SCENEJS_vViewEyeVec = ((viewMatrix * vec4(SCENEJS_uWorldEye, 0.0)).xyz  - viewVertex.xyz);");

        if (tangents) {

            add("SCENEJS_vViewEyeVec *= TBM;");
        }

        if (decal || texturing) {

            uvBufs = states.geometry.uvBufs;

            if (uvBufs) {
                for (i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("SCENEJS_vUVCoord" + i + " = SCENEJS_aUVCoord" + i + ";");
                    }
                }
            }
        }

        if (states.geometry.colorBuf) {
            add("SCENEJS_vColor = SCENEJS_aVertexColor;");
        }

        if (regionInteraction) {
            add("SCENEJS_vRegionMapUV = SCENEJS_aRegionMapUV;");
        }

        add("gl_PointSize = 3.0;");

        add("}");

        return end();
    }


    /*-----------------------------------------------------------------------------------------------------------------
     * Rendering Fragment shader
     *---------------------------------------------------------------------------------------------------------------*/

    function fragmentRendering() {

        var customShaders = states.shader.shaders || {};

        // Do a full custom shader replacement if code supplied without hooks
        if (customShaders.fragment
            && customShaders.fragment.code
            && customShaders.fragment.code != ""
            && SceneJS._isEmpty(customShaders.fragment.hooks)) {
            return [customShaders.fragment.code];
        }

        var customFragmentShader = customShaders.fragment || {};
        var fragmentHooks = customFragmentShader.hooks || {};


        var diffuseFresnel = states.fresnel.diffuse;
        var specularFresnel = states.fresnel.specular;
        var alphaFresnel = states.fresnel.alpha;
        var reflectFresnel = states.fresnel.reflect;
        var emitFresnel = states.fresnel.emit;
        var fragmentFresnel = states.fresnel.fragment;

        begin();

        add("precision " + getFSFloatPrecision(states._canvas.gl) + " float;");

        add("uniform mat4 SCENEJS_uVMatrix;");

        if (clipping || normals) {
            add("varying vec4 SCENEJS_vWorldVertex;");             // World-space vertex
        }

        //  if (fragmentHooks.viewPos) {
        add("varying vec4 SCENEJS_vViewVertex;");              // View-space vertex
        //  }

        add("uniform float SCENEJS_uZNear;");                      // Used in Z-pick mode
        add("uniform float SCENEJS_uZFar;");                       // Used in Z-pick mode

        add("uniform vec3 SCENEJS_uWorldEye;");


        /*-----------------------------------------------------------------------------------
         * Variables
         *----------------------------------------------------------------------------------*/

        if (clipping) {
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("uniform float SCENEJS_uClipMode" + i + ";");
                add("uniform vec4  SCENEJS_uClipNormalAndDist" + i + ";");
            }
        }

        if (decal || texturing) {
            var uvBufs = states.geometry.uvBufs;
            if (uvBufs) {
                for (var i = 0, len = uvBufs.length; i < len; i++) {
                    if (uvBufs[i]) {
                        add("varying vec2  SCENEJS_vUVCoord" + i + ";");
                    }
                }
            }

            if (decal) {
                add("uniform sampler2D SCENEJS_uDecalSampler;");
                if (states.decal.matrix) {
                    add("uniform mat4 SCENEJS_uDecalMatrix;");
                }
                add("uniform float SCENEJS_uDecalBlendFactor;");
            }
            if (texturing) {
                var layer;
                for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                    layer = states.texture.layers[i];
                    add("uniform sampler2D SCENEJS_uSampler" + i + ";");
                    if (layer.matrix) {
                        add("uniform mat4 SCENEJS_uLayer" + i + "Matrix;");
                    }
                    add("uniform float SCENEJS_uLayer" + i + "BlendFactor;");
                }
            }
        }

        if (normals && cubeMapping) {

            var layer;
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                add("uniform samplerCube SCENEJS_uCubeMapSampler" + i + ";");
                add("uniform float SCENEJS_uCubeMapIntensity" + i + ";");
            }
        }

        if (regionInteraction) {
            add("varying vec2 SCENEJS_vRegionMapUV;");
            add("uniform sampler2D SCENEJS_uRegionMapSampler;");
            add("uniform vec3 SCENEJS_uRegionMapRegionColor;");
            add("uniform vec3 SCENEJS_uRegionMapHighlightFactor;");
            add("uniform float SCENEJS_uRegionMapHideAlpha;");
        }

        // True when lighting
        add("uniform bool  SCENEJS_uClipping;");

        if (solid) {
            add("uniform vec3  SCENEJS_uSolidColor;");
        }

        // Added in v4.0 to support depth targets
        add("uniform bool  SCENEJS_uDepthMode;");

        /* True when rendering transparency
         */
        add("uniform bool  SCENEJS_uTransparent;");

        /* Vertex color variable
         */
        if (states.geometry.colorBuf) {
            add("varying vec4 SCENEJS_vColor;");
        }

        add("uniform vec3  SCENEJS_uAmbientColor;");                         // Scene ambient colour - taken from clear colour

        add("uniform vec3  SCENEJS_uMaterialColor;");
        add("uniform vec3  SCENEJS_uMaterialSpecularColor;");
        add("uniform vec3  SCENEJS_uMaterialEmitColor;");

        add("uniform float SCENEJS_uMaterialSpecular;");
        add("uniform float SCENEJS_uMaterialShine;");
        add("uniform float SCENEJS_uMaterialAlpha;");
        add("uniform float SCENEJS_uMaterialEmit;");

        if (diffuseFresnel) {
            add("uniform float SCENEJS_uDiffuseFresnelCenterBias;");
            add("uniform float SCENEJS_uDiffuseFresnelEdgeBias;");
            add("uniform float SCENEJS_uDiffuseFresnelPower;");
            add("uniform vec3 SCENEJS_uDiffuseFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uDiffuseFresnelEdgeColor;");
        }

        if (specularFresnel) {
            add("uniform float SCENEJS_uSpecularFresnelCenterBias;");
            add("uniform float SCENEJS_uSpecularFresnelEdgeBias;");
            add("uniform float SCENEJS_uSpecularFresnelPower;");
            add("uniform vec3 SCENEJS_uSpecularFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uSpecularFresnelEdgeColor;");
        }

        if (alphaFresnel) {
            add("uniform float SCENEJS_uAlphaFresnelCenterBias;");
            add("uniform float SCENEJS_uAlphaFresnelEdgeBias;");
            add("uniform float SCENEJS_uAlphaFresnelPower;");
            add("uniform vec3 SCENEJS_uAlphaFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uAlphaFresnelEdgeColor;");
        }

        if (reflectFresnel) {
            add("uniform float SCENEJS_uReflectFresnelCenterBias;");
            add("uniform float SCENEJS_uReflectFresnelEdgeBias;");
            add("uniform float SCENEJS_uReflectFresnelPower;");
            add("uniform vec3 SCENEJS_uReflectFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uReflectFresnelEdgeColor;");
        }

        if (emitFresnel) {
            add("uniform float SCENEJS_uEmitFresnelCenterBias;");
            add("uniform float SCENEJS_uEmitFresnelEdgeBias;");
            add("uniform float SCENEJS_uEmitFresnelPower;");
            add("uniform vec3 SCENEJS_uEmitFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uEmitFresnelEdgeColor;");
        }

        if (fragmentFresnel) {
            add("uniform float SCENEJS_uFragmentFresnelCenterBias;");
            add("uniform float SCENEJS_uFragmentFresnelEdgeBias;");
            add("uniform float SCENEJS_uFragmentFresnelPower;");
            add("uniform vec3 SCENEJS_uFragmentFresnelCenterColor;");
            add("uniform vec3 SCENEJS_uFragmentFresnelEdgeColor;");
        }

        add("varying vec3 SCENEJS_vViewEyeVec;");                          // Direction of world-space vertex from eye

        if (normals) {

            add("uniform mat4 SCENEJS_uVNMatrix;");
            add("varying vec3 SCENEJS_vViewNormal;");

            if (fresnel) {
                add("varying vec3 SCENEJS_vWorldNormal;");
            }

            if (tangents) {
                add("varying vec3 SCENEJS_vTangent;");
            }
            var light;
            for (var i = 0; i < states.lights.lights.length; i++) {
                light = states.lights.lights[i];
                if (light.mode == "ambient") {
                    continue;
                }
                add("uniform vec3  SCENEJS_uLightColor" + i + ";");

                if (light.mode == "dir") {
                    add("uniform vec3 SCENEJS_uLightDir" + i + ";");
                }

                if (light.mode == "point") {
                    add("uniform vec3  SCENEJS_uLightAttenuation" + i + ";");
                    add("uniform vec3 SCENEJS_uLightPos" + i + ";");
                }

            }
        }

        if (customFragmentShader.code) {
            add("\n" + customFragmentShader.code + "\n");
        }

        if (diffuseFresnel || specularFresnel || alphaFresnel || reflectFresnel || emitFresnel || fragmentFresnel) {
            add("float fresnel(vec3 viewDirection, vec3 worldNormal, float edgeBias, float centerBias, float power) {");
            add("    float fr = abs(dot(viewDirection, worldNormal));");
            add("    float finalFr = clamp((fr - edgeBias) / (centerBias - edgeBias), 0.0, 1.0);");
            add("    return pow(finalFr, power);");
            add("}");
        }

        add("void main(void) {");

        // World-space arbitrary clipping planes

        if (clipping) {
            add("if (SCENEJS_uClipping) {");
            add("  float dist = 0.0;");
            for (var i = 0; i < states.clips.clips.length; i++) {
                add("  if (SCENEJS_uClipMode" + i + " != 0.0) {");
                add("      dist += clamp(dot(SCENEJS_vWorldVertex.xyz, SCENEJS_uClipNormalAndDist" + i + ".xyz) - SCENEJS_uClipNormalAndDist" + i + ".w, 0.0, 1000.0);");
                add("  }");
            }
            add("  if (dist > 0.0) { discard; }");
            add("}");
        }

        if (normals) {
            add("vec3 worldEyeVec = normalize(SCENEJS_uWorldEye - SCENEJS_vWorldVertex.xyz);");            // World-space eye position

            if (fresnel) {
                add("vec3 worldNormal = normalize(SCENEJS_vWorldNormal); ")
            }

            if (solid) {

                add("  if (gl_FrontFacing == false) {");
                add("     gl_FragColor = vec4(SCENEJS_uSolidColor.xyz, 1.0);");
                add("     return;");
                add("  }");
            }
        }

        add("  vec3 ambient= SCENEJS_uAmbientColor;");

        //if (texturing && states.geometry.uvBuf && fragmentHooks.texturePos) {
        //    add(fragmentHooks.texturePos + "(SCENEJS_vUVCoord);");
        //}

        if (fragmentHooks.viewPos) {
            add(fragmentHooks.viewPos + "(SCENEJS_vViewVertex);");
        }

        if (normals && fragmentHooks.viewNormal) {
            add(fragmentHooks.viewNormal + "(SCENEJS_vViewNormal);");
        }

        if (states.geometry.colorBuf) {
            add("  vec3    color   = SCENEJS_vColor.rgb;");
            add("  float   colorA  = SCENEJS_vColor.a;");
        } else {
            add("  vec3    color   = SCENEJS_uMaterialColor;")
        }

        add("  float alpha         = SCENEJS_uMaterialAlpha;");
        add("  float emit          = SCENEJS_uMaterialEmit;");
        add("  float specular      = SCENEJS_uMaterialSpecular;");
        add("  vec3  specularColor = SCENEJS_uMaterialSpecularColor;");
        add("  vec3  emitColor     = SCENEJS_uMaterialEmitColor;");
        add("  float shine         = SCENEJS_uMaterialShine;");

        if (fragmentHooks.materialBaseColor) {
            add("color=" + fragmentHooks.materialBaseColor + "(color);");
        }
        if (fragmentHooks.materialAlpha) {
            add("alpha=" + fragmentHooks.materialAlpha + "(alpha);");
        }
        if (fragmentHooks.materialEmit) {
            add("emit=" + fragmentHooks.materialEmit + "(emit);");
        }
        if (fragmentHooks.materialSpecular) {
            add("specular=" + fragmentHooks.materialSpecular + "(specular);");
        }
        if (fragmentHooks.materialSpecularColor) {
            add("specularColor=" + fragmentHooks.materialSpecularColor + "(specularColor);");
        }
        if (fragmentHooks.materialShine) {
            add("shine=" + fragmentHooks.materialShine + "(shine);");
        }

        if (normals) {
            add("  float   attenuation = 1.0;");
            if (tangents) {
                add("  vec3    viewNormalVec = vec3(0.0, 1.0, 0.0);");
            } else {

                // Normalize the interpolated normals in the per-fragment-fragment-shader,
                // because if we linear interpolated two nonparallel normalized vectors, the resulting vector won’t be of length 1
                add("  vec3    viewNormalVec = normalize(SCENEJS_vViewNormal);");
            }
            add("vec3 viewEyeVec = normalize(SCENEJS_vViewEyeVec);");
        }

        var layer;
        if (decal || texturing) {

            add("  vec4    texturePos;");
            add("  vec2    textureCoord=vec2(0.0,0.0);");

            // ------------ Texture maps ------------------------------------

            if (texturing) {
                for (var i = 0, len = states.texture.layers.length; i < len; i++) {
                    layer = states.texture.layers[i];

                    var applyFrom = layer.applyFrom;

                    // Texture input

                    if (applyFrom == "normal" && normals) {

                        if (states.geometry.normalBuf) {
                            add("texturePos=vec4(viewNormalVec.xyz, 1.0);");
                        } else {
                            SceneJS.log.warn("Texture layer applyFrom='normal' but geo has no normal vectors");
                            continue;
                        }

                    } else {

                        // Apply from UV layers

                        var matches = applyFrom.match(/\d+$/);
                        var uvLayerIndex = matches ? parseInt(matches[0]) : 0;

                        var uvBufs = states.geometry.uvBufs;

                        if (uvBufs[uvLayerIndex]) {
                            add("texturePos = vec4(SCENEJS_vUVCoord" + uvLayerIndex + ".s, SCENEJS_vUVCoord" + uvLayerIndex + ".t, 1.0, 1.0);");
                        } else {
                            SceneJS.log.warn("Texture layer applyTo='uv' but geometry has no UV coordinates for layer " + uvLayerIndex);
                            continue;
                        }
                    }

                    /* Texture matrix
                     */
                    if (layer.matrix) {
                        add("textureCoord=(SCENEJS_uLayer" + i + "Matrix * texturePos).xy;");
                    } else {
                        add("textureCoord=texturePos.xy;");
                    }

                    /* Alpha from Texture
                     */
                    if (layer.applyTo == "alpha") {
                        if (layer.blendMode == "multiply") {
                            add("alpha = alpha * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        } else if (layer.blendMode == "add") {
                            add("alpha = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * alpha) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                        }
                    }

                    /* Texture output
                     */
                    if (layer.applyTo == "baseColor") {
                        if (layer.blendMode == "multiply") {
                            add("color = color * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        } else {
                            add("color = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * color) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                        }
                    }

                    if (layer.applyTo == "emit") {
                        if (layer.blendMode == "multiply") {
                            add("emit  = emit * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("emit = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * emit) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "specular" && normals) {
                        if (layer.blendMode == "multiply") {
                            add("specular  = specular * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("specular = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * specular) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "shine") {
                        if (layer.blendMode == "multiply") {
                            add("shine  = shine * (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        } else {
                            add("shine = ((1.0 - SCENEJS_uLayer" + i + "BlendFactor) * shine) + (SCENEJS_uLayer" + i + "BlendFactor * texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                        }
                    }

                    if (layer.applyTo == "normals" && normals) {
                        add("viewNormalVec = normalize(texture2D(SCENEJS_uSampler" + i + ", vec2(textureCoord.x, -textureCoord.y)).xyz * 2.0 - 1.0);");
                    }
                }
            }

            // ------------ Decal texture ------------------------------------

            if (decal) {

                if (states.decal.applyFrom == "normal" && normals) {
                    if (states.geometry.normalBuf) {
                        add("texturePos=vec4(viewNormalVec.xyz, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture decal applyFrom='normal' but geo has no normal vectors");
                    }
                }

                if (states.decal.applyFrom == "uv") {
                    if (states.geometry.uvBuf) {
                        add("texturePos = vec4(SCENEJS_vUVCoord.s, SCENEJS_vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture decal applyTo='uv' but geometry has no UV coordinates");
                    }
                }

                if (states.decal.applyFrom == "uv2") {
                    if (states.geometry.uvBuf2) {
                        add("texturePos = vec4(SCENEJS_vUVCoord2.s, SCENEJS_vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture decal applyTo='uv2' but geometry has no UV2 coordinates");
                    }
                }

                if (states.decal.applyFrom == "uv3") {
                    if (states.geometry.uvBuf3) {
                        add("texturePos = vec4(SCENEJS_vUVCoord3.s, SCENEJS_vUVCoord3.t, 1.0, 1.0);");
                    } else {
                        SceneJS.log.warn("Texture decal applyTo='uv3' but geometry has no UV3 coordinates");
                    }
                }

                // Decal texture matrix

                if (states.decal.matrix) {
                    add("textureCoord=(SCENEJS_uDecalMatrix * texturePos).xy;");
                } else {
                    add("textureCoord=texturePos.xy;");
                }

                // Alpha from Texture

                if (states.decal.applyTo == "alpha") {
                    if (states.decal.blendMode == "multiply") {
                        add("alpha = alpha * (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    } else if (states.decal.blendMode == "add") {
                        add("alpha = ((1.0 - SCENEJS_uDecalBlendFactor) * alpha) + (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).b);");
                    }
                }

                // Texture output

                if (states.decal.applyTo == "baseColor") {
                    if (states.decal.blendMode == "multiply") {
                        add("color = color * (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    } else {
                        add("color = ((1.0 - SCENEJS_uDecalBlendFactor) * color) + (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb);");
                    }
                }

                if (states.decal.applyTo == "emit") {
                    if (states.decal.blendMode == "multiply") {
                        add("emit  = emit * (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        add("emit = ((1.0 - SCENEJS_uDecalBlendFactor) * emit) + (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (states.decal.applyTo == "specular" && normals) {
                    if (states.decal.blendMode == "multiply") {
                        add("specular  = specular * (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        add("specular = ((1.0 - SCENEJS_uDecalBlendFactor) * specular) + (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (states.decal.applyTo == "shine") {
                    if (states.decal.blendMode == "multiply") {
                        add("shine  = shine * (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    } else {
                        add("shine = ((1.0 - SCENEJS_uDecalBlendFactor) * shine) + (SCENEJS_uDecalBlendFactor * texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, 1.0 - textureCoord.y)).r);");
                    }
                }

                if (states.decal.applyTo == "normals" && normals) {
                    add("viewNormalVec = normalize(texture2D(SCENEJS_uDecalSampler, vec2(textureCoord.x, -textureCoord.y)).xyz * 2.0 - 1.0);");
                }
            }
        }

        if (normals && cubeMapping) {
            add("float reflectFactor = 1.0;");

            if (reflectFresnel) {
                add("float reflectFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uReflectFresnelEdgeBias,  SCENEJS_uReflectFresnelCenterBias, SCENEJS_uReflectFresnelPower);");
                add("reflectFactor *= mix(SCENEJS_uReflectFresnelEdgeColor.b, SCENEJS_uReflectFresnelCenterColor.b, reflectFresnel);");
            }

            add("vec4 v = SCENEJS_uVNMatrix * vec4(SCENEJS_vViewEyeVec, 1.0);");
            add("vec3 v1 = v.xyz;");

            add("v = SCENEJS_uVNMatrix * vec4(viewNormalVec, 1.0);");
            add("vec3 v2 = v.xyz;");

            add("vec3 envLookup = reflect(v1, v2);");

            add("envLookup.y = envLookup.y * -1.0;"); // Need to flip textures on Y-axis for some reason
            add("vec4 envColor;");
            for (var i = 0, len = states.cubemap.layers.length; i < len; i++) {
                layer = states.cubemap.layers[i];
                add("envColor = textureCube(SCENEJS_uCubeMapSampler" + i + ", envLookup);");
                add("color = mix(color, envColor.rgb, reflectFactor * specular * SCENEJS_uCubeMapIntensity" + i + ");");
            }
        }

        add("  vec4    fragColor;");

        if (normals) {

            add("  vec3    lightValue      = vec3(0.0, 0.0, 0.0);");
            add("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");
            add("  vec3    viewLightVec;");
            add("  float   dotN;");
            add("  float   lightDist;");

            if (tangents) {

                // Compute tangent-bitangent-normal matrix

                add("vec3 tangent = normalize(SCENEJS_vTangent);");
                add("vec3 bitangent = cross(SCENEJS_vViewNormal, tangent);");
                add("mat3 TBM = mat3(tangent, bitangent, SCENEJS_vViewNormal);");
            }

            var light;

            for (var i = 0, len = states.lights.lights.length; i < len; i++) {
                light = states.lights.lights[i];

                if (light.mode == "ambient") {
                    continue;
                }

                if (light.mode == "point") {

                    if (light.space == "world") {

                        // World space

                        add("viewLightVec = SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz;"); // Vector from World coordinate to light pos

                        // Transform to View space
                        add("viewLightVec = vec3(SCENEJS_uVMatrix * vec4(viewLightVec, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }

                    } else {

                        // View space

                        add("viewLightVec = SCENEJS_uLightPos" + i + ".xyz - SCENEJS_vViewVertex.xyz;"); // Vector from View coordinate to light pos

                        if (tangents) {

                            // Transform to tangent space
                            add("viewLightVec *= TBM;");
                        }
                    }

                    add("dotN = max(dot(viewNormalVec, normalize(viewLightVec)), 0.0);");

                    add("lightDist = length( SCENEJS_uLightPos" + i + " - SCENEJS_vWorldVertex.xyz);");

                    add("attenuation = 1.0 - (" +
                        "  SCENEJS_uLightAttenuation" + i + "[0] + " +
                        "  SCENEJS_uLightAttenuation" + i + "[1] * lightDist + " +
                        "  SCENEJS_uLightAttenuation" + i + "[2] * lightDist * lightDist);");

                    if (light.diffuse) {
                        add("      lightValue += dotN * SCENEJS_uLightColor" + i + " * attenuation;");
                    }

                    if (light.specular) {
                        add("    specularValue += specularColor * SCENEJS_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-SCENEJS_vViewVertex.xyz)), 0.0), shine) * attenuation;");
                    }
                }

                if (light.mode == "dir") {

                    if (light.space == "world") {

                        // World space light

                        add("viewLightVec = normalize(SCENEJS_uLightDir" + i + ");");

                        // Transform to View space
                        add("viewLightVec = vec3(SCENEJS_uVMatrix * vec4(viewLightVec, 0.0)).xyz;");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }

                    } else {

                        // View space light

                        add("viewLightVec = normalize(SCENEJS_uLightDir" + i + ");");

                        if (tangents) {

                            // Transform to Tangent space
                            add("viewLightVec *= TBM;");
                        }
                    }

                    add("viewLightVec = -viewLightVec;");

                    add("dotN = max(dot(viewNormalVec, normalize(viewLightVec)), 0.0);");

                    if (light.diffuse) {
                        add("lightValue += dotN * SCENEJS_uLightColor" + i + ";");
                    }

                    if (light.specular) {
                        add("specularValue += specularColor * SCENEJS_uLightColor" + i +
                            " * specular * pow(max(dot(reflect(normalize(-viewLightVec), normalize(-viewNormalVec)), normalize(-SCENEJS_vViewVertex.xyz)), 0.0), shine);");
                    }
                }
            }

            if (states.geometry.colorBuf) {
                add("alpha *= colorA;");
            }

            if (diffuseFresnel || specularFresnel || alphaFresnel || emitFresnel) {

                if (diffuseFresnel) {
                    add("float diffuseFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uDiffuseFresnelEdgeBias, SCENEJS_uDiffuseFresnelCenterBias, SCENEJS_uDiffuseFresnelPower);");
                    add("color.rgb *= mix(SCENEJS_uDiffuseFresnelEdgeColor.rgb, SCENEJS_uDiffuseFresnelCenterColor.rgb, diffuseFresnel);");
                }

                if (specularFresnel) {
                    add("float specFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uSpecularFresnelEdgeBias, SCENEJS_uSpecularFresnelCenterBias, SCENEJS_uSpecularFresnelPower);");
                    add("specularValue *= mix(SCENEJS_uSpecularFresnelEdgeColor.rgb, SCENEJS_uSpecularFresnelCenterColor.rgb, specFresnel);");
                }

                if (alphaFresnel) {
                    add("float alphaFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uAlphaFresnelEdgeBias, SCENEJS_uAlphaFresnelCenterBias, SCENEJS_uAlphaFresnelPower);");
                    add("alpha *= mix(SCENEJS_uAlphaFresnelEdgeColor.r, SCENEJS_uAlphaFresnelCenterColor.r, alphaFresnel);");
                }

                if (emitFresnel) {
                    add("float emitFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uEmitFresnelEdgeBias, SCENEJS_uEmitFresnelCenterBias, SCENEJS_uEmitFresnelPower);");
                    add("emitColor.rgb *= mix(SCENEJS_uEmitFresnelEdgeColor.rgb, SCENEJS_uEmitFresnelCenterColor.rgb, emitFresnel);");
                }
            }

            add("fragColor = vec4((specularValue.rgb + color.rgb * (lightValue.rgb + ambient.rgb)) + (emit * emitColor.rgb), alpha);");

        } else { // No normals
            add("fragColor = vec4((color.rgb + (emit * color.rgb)) *  (vec3(1.0, 1.0, 1.0) + ambient.rgb), alpha);");
        }

        if (regionInteraction) {

            // Region map highlighting

            add("vec3 regionColor = texture2D(SCENEJS_uRegionMapSampler, vec2(SCENEJS_vRegionMapUV.s, 1.0 - SCENEJS_vRegionMapUV.t)).rgb;");
            add("float tolerance = 0.01;");
            add("vec3 colorDelta = abs(SCENEJS_uRegionMapRegionColor - regionColor);");
            if (states.regionMap.mode === "highlight" || states.regionMap.mode === "hide") {
                add("if (max(colorDelta.x, max(colorDelta.y, colorDelta.z)) < tolerance) {");
                if (states.regionMap.mode === "highlight") {
                    add("  fragColor.rgb *= SCENEJS_uRegionMapHighlightFactor;");
                } else {
                    // mode = "hide"
                    add("  fragColor.a = SCENEJS_uRegionMapHideAlpha;");
                }
                add("}");
            } else {
                // mode = "isolate"
                add("if (max(colorDelta.x, max(colorDelta.y, colorDelta.z)) > tolerance) {");
                add("  fragColor.a = SCENEJS_uRegionMapHideAlpha;");
                add("}");
            }
        }

        if (fragmentHooks.pixelColor) {
            add("fragColor=" + fragmentHooks.pixelColor + "(fragColor);");
        }
        if (false && debugCfg.whitewash === true) {

            add("    fragColor = vec4(1.0, 1.0, 1.0, 1.0);");

        } else {

            if (depthTargeting) {

                // Only compile in depth mode support if a depth render target is present

                add("    if (SCENEJS_uDepthMode) {");
                add("          float depth = length(SCENEJS_vViewVertex) / (SCENEJS_uZFar - SCENEJS_uZNear);");
                add("          const vec4 bias = vec4(1.0 / 255.0,");
                add("          1.0 / 255.0,");
                add("          1.0 / 255.0,");
                add("          0.0);");
                add("          float r = depth;");
                add("          float g = fract(r * 255.0);");
                add("          float b = fract(g * 255.0);");
                add("          float a = fract(b * 255.0);");
                add("          vec4 colour = vec4(r, g, b, a);");
                add("          fragColor = colour - (colour.yzww * bias);");
                add("    }");
            }
        }

        if (fragmentFresnel) {
            add("float fragmentFresnel = fresnel(worldEyeVec, worldNormal, SCENEJS_uFragmentFresnelEdgeBias, SCENEJS_uFragmentFresnelCenterBias, SCENEJS_uFragmentFresnelPower);");
            add("fragColor.rgb *= mix(SCENEJS_uFragmentFresnelEdgeColor.rgb, SCENEJS_uFragmentFresnelCenterColor.rgb, fragmentFresnel);");
        }

        if (!depthTargeting) {
            add("fragColor.rgb *= fragColor.a;");
        }

        add("gl_FragColor = fragColor;");

        add("}");

//        console.log(src.join("\n"));
        return end();
    }

    // Start fresh program source
    function begin() {
        src = [];
    }

    // Append to program source
    function add(txt) {
        src.push(txt || "");
    }

    // Finish building program source
    function end() {
        return src;
    }

    function getFSFloatPrecision(gl) {
        if (!gl.getShaderPrecisionFormat) {
            return "mediump";
        }

        if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
            return "highp";
        }

        if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
            return "mediump";
        }

        return "lowp";
    }

})
();