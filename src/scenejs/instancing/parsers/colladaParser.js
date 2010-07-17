/**
 * Installs a Collada parser into the SceneJS._loadModule, to be parse files that that have the ".dae" extension.
 *
 * @private
 */
(function() {
    var debugCfg = {};
    var rootSID = null;
    var sidMap = {}; // Map of all IDs generated to ensure their uniqueness
    var xmlDoc; // Holds DOM parsed from XML string
    var uri;    // URI at which Collada document resides
    var dirURI; // Path to directory containing the Collada document
    var idMap = {}; // Maps every DOM element by ID
    var sources = {};
    var options = {};
    var nextSID = 0; // Next random ID


    /**
     * Entry point for the parser; parses the XML in the given config
     * and returns a scene subgraph
     * @param cfg
     */
    SceneJS._loadModule.registerParser("dae", {

        serverParams: {
            format: "xml"
        },

        parse: function(cfg) {
            reset();
            debugCfg = SceneJS._debugModule.getConfigs("instancing.collada") || {};
            uri = cfg.uri;
            rootSID = uri;
            dirURI = cfg.uri.substring(0, cfg.uri.lastIndexOf("/") + 1);
            options = cfg.options;
            loadDocument(cfg.data); // XML
            buildIdMap();
            return parseDocument();
        }
    });

    /**
     * Resets parser state
     */
    function reset() {
        debugCfg = {};
        rootSID = null;
        sidMap = {};
        xmlDoc = null;
        idMap = {};
        sources = {};
        options = {};
        nextSID = 0;
    }

    /**
     * Returns a random ID that will be unique within the generated subgraph
     */
    function randomSID() {
        return "sid" + nextSID;
    }

    /** Logs that the given tag is parsed
     */
    function logTag(tag) {
        if (debugCfg.logTags) {
            var id = tag.getAttribute("id");
            var sid = tag.getAttribute("sid");
            SceneJS._loggingModule.info("Parsing <" + tag.tagName + " id: '" + id + "' sid: '" + sid + "'>");
        }
    }

    /**
     * Parses the given XML string into the xmlDoc
     */
    function loadDocument(xml) {
        //try {
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        }
        else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xml);
        }
        //        } catch (e) {
        //throw new SceneJS.ParseException("Failed to parse res")
        //        }
    }

    /**
     * Finds every element in the xmlDoc and maps the by IDs into the idMap
     * @private
     */
    function buildIdMap() {
        idMap = {};
        var elements = xmlDoc.getElementsByTagName("*");
        var id;
        for (var i = elements.length - 1; i >= 0; i--) {
            id = elements[i].getAttribute("id");
            if (id != "") {
                idMap[id] = elements[i];
            }
        }
    }

    function parseDocument() {
        var root = new SceneJS.Node({
            sid: rootSID,
            info : "COLLADA model from " + uri
        });
        root.addNode(parseLibraryCameras());
        root.addNode(parseLibraryLights());
        root.addNode(parseLibraryEffects());
        root.addNode(parseLibraryMaterials());    // Instances effects
        root.addNode(parseLibraryGeometries());   // Instances materials
        root.addNode(parseLibraryNodes());        // Instances geometries
        root.addNode(parseLibraryVisualScenes());
        root.addNode(parseScene());
        return root;
    }

    //==================================================================================================================
    // Cameras library
    //==================================================================================================================

    function parseLibraryCameras() {
        return parseLibrary("library_cameras", "camera", parseCamera);
    }

    /** Generic library_xxx parser which creates nodes through callback
     *
     * @param libraryTagName eg. "library_cameras"
     * @param symbolTagName eg. "camera"
     * @param parseTag Callback that creates SceneJS node from symbol tag
     * @private
     */
    function parseLibrary(libraryTagName, symbolTagName, parseTag) {
        var library = new SceneJS.Node({ info: libraryTagName});
        var libraryTags = xmlDoc.getElementsByTagName(libraryTagName);
        var i, j, symbolTags, symbolTag, symbol, libraryTag;
        for (i = 0; i < libraryTags.length; i++) {
            libraryTag = libraryTags[i];

            logTag(libraryTag);

            symbolTags = libraryTag.getElementsByTagName(symbolTagName);
            for (j = 0; j < symbolTags.length; j++) {
                symbolTag = symbolTags[j];
                logTag(symbolTag);
                symbol = new SceneJS.Symbol({
                    info: "symbol_" + symbolTagName,
                    sid: symbolTag.getAttribute("id")
                });
                symbol.addNode(parseTag(symbolTag));
                library.addNode(symbol);
            }
        }
        return library;
    }

    // @private
    function parseCamera(cameraTag) {
        logTag(cameraTag);
        var optics = cameraTag.getElementsByTagName("optics")[0];
        var techniqueCommon = optics.getElementsByTagName("technique_common")[0];
        var perspectiveTag = techniqueCommon.getElementsByTagName("perspective")[0];
        if (perspectiveTag) {
            var yfov = perspectiveTag.getElementsByTagName("yfov")[0];
            var aspectRatio = perspectiveTag.getElementsByTagName("aspect_ratio")[0];
            var znear = perspectiveTag.getElementsByTagName("znear")[0];
            var zfar = perspectiveTag.getElementsByTagName("zfar")[0];

            return new SceneJS.Camera({
                info: "camera",
                sid: cameraTag.getAttribute("id"),
                optics: {
                    type: "perspective",
                    fovy: yfov ? parseFloat(yfov.textContent) : 60.0,
                    aspect: aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0,
                    near: znear ? parseFloat(znear.textContent) : 0.1,
                    far: zfar ? parseFloat(zfar.textContent) : 20000.0
                }
            });
        } else {
            var orthographic = techniqueCommon.getElementsByTagName("orthographic")[0];
            if (orthographic) {
                return new SceneJS.Node(); // TODO: ortho camera
            }
        }
        SceneJS._loggingModule.warn("camera.technique_common.optics - neither perspective nor perspective found");
        return new SceneJS.Node();   // Fallback - a "null" camera
    }

    //==================================================================================================================
    // Lights library
    //==================================================================================================================

    function parseLibraryLights() {
        return parseLibrary("library_lights", "light", parseLight);
    }

    function parseLight(lightTag) {
        logTag(lightTag);
        var techniqueCommonTag = lightTag.getElementsByTagName("technique_common")[0];
        var directionalTag = techniqueCommonTag.getElementsByTagName("directional")[0];
        if (directionalTag) {
            return new SceneJS.Lights({
                info: "light",
                sid: lightTag.getAttribute("id"),
                sources : [
                    {
                        type: "dir",
                        dir: { x: 0, y: 0, z: -1.0 },
                        color: parseFloatArray(directionalTag.getElementsByTagName("color")[0])
                    }
                ]});
        }
        var pointTag = techniqueCommonTag.getElementsByTagName("point")[0];
        if (pointTag) {
            var constantAttenuation = pointTag.getElementsByTagName("constant_attenuation")[0];
            var linearAttenuation = pointTag.getElementsByTagName("linear_attenuation")[0];
            var quadraticAttenuation = pointTag.getElementsByTagName("quadratic_attenuation")[0];
            return new SceneJS.Lights({
                info: "light",
                sid: lightTag.getAttribute("id"),
                sources : [
                    {
                        type: "point",
                        pos: { x: 0, y: 0, z: 0},
                        color: parseFloatArray(pointTag.getElementsByTagName("color")[0]),
                        constantAttenuation : constantAttenuation ? parseFloat(constantAttenuation) : 1.0,
                        linearAttenuation : linearAttenuation ? parseFloat(linearAttenuation) : 0.0,
                        quadraticAttenuation : quadraticAttenuation ? parseFloat(quadraticAttenuation) : 0.0
                    }
                ]});
        }
        var spot = techniqueCommonTag.getElementsByTagName("spot")[0];
        if (spot) {
            var constantAttenuation = spot.getElementsByTagName("constant_attenuation")[0];
            var linearAttenuation = spot.getElementsByTagName("linear_attenuation")[0];
            var quadraticAttenuation = spot.getElementsByTagName("quadratic_attenuation")[0];
            var falloffAngle = spot.getElementsByTagName("falloff_angle")[0];
            var falloffExponent = spot.getElementsByTagName("falloff_exponent")[0];
            return new SceneJS.Lights({
                info: "light",
                sid: lightTag.getAttribute("id"),
                sources : [
                    {
                        type: "spot",
                        // TODO: position & dir?
                        color: parseFloatArray(spot.getElementsByTagName("color")[0]) ,
                        constantAttenuation : constantAttenuation ? parseFloat(constantAttenuation) : 1.0,
                        linearAttenuation : linearAttenuation ? parseFloat(linearAttenuation) : 0.0,
                        quadraticAttenuation : quadraticAttenuation ? parseFloat(quadraticAttenuation) : 0.0,
                        falloffAngle : falloffAngle ? parseFloat(falloffAngle) : 180.0,
                        falloffExponent : falloffExponent ? parseFloat(falloffExponent) : 0.0
                    }
                ]});
        }
        SceneJS._loggingModule.warn("light.technique_common - neither dir, point nor spot found");
        return new SceneJS.Node(); // Fallback - a "null" light
    }

    //==================================================================================================================
    // Effects library
    //==================================================================================================================

    // @private
    function parseLibraryEffects() {
        return parseLibrary("library_effects", "effect", parseEffect);
    }

    //    var effectParamMaps = {
    //
    //    };

    // @private
    function parseEffect(effectTag) {
        var profileCommonTag = effectTag.getElementsByTagName("profile_COMMON")[0];
        var techniqueTag = profileCommonTag.getElementsByTagName("technique")[0];
        var materialData = {
            texturesData : []
        };
        getDiffuseMaterialData(profileCommonTag, techniqueTag, materialData);
        getSpecularColorMaterialData(profileCommonTag, techniqueTag, materialData);
        getShininessMaterialData(profileCommonTag, techniqueTag, materialData);
        getBumpMapMaterialData(profileCommonTag, techniqueTag, materialData);

        var effectId = effectTag.getAttribute("id");

        //        var paramMap = {};
        //        effectParamMaps[effectId] = paramMap;
        //        var newParamTags = techniqueTag.getElementsByTagName("newparam");
        //        var newParamTag;
        //        for (var i = 0; i < newParamTags.length; i++) {
        //            newParamTag = newParamTags[i];
        //            var newParamSID = newParamTag.getAttribute("sid");
        //            paramMap[newParamSID] =
        //        }

        var material = new SceneJS.Material({  // Static node configuration object
            info: "material",
            sid: effectId,
            baseColor:     materialData.baseColor,
            specularColor: materialData.specularColor ,
            shine:         10.0,  // TODO: parse from shininess?
            specular: 1
        });

        /* Add SceneJS.Texture child for textures data
         */
        var textureLayers = materialData.texturesData;
        if (textureLayers.length > 0) {
            var layers = [];
            for (var j = 0; j < textureLayers.length; j++) {
                layers.push({
                    uri : textureLayers[j].uri,
                    applyTo: textureLayers[j].applyTo,
                    flipY : false,
                    blendMode: textureLayers[j].blendMode,
                    wrapS: "repeat",
                    wrapT: "repeat" ,
                    minFilter: "linearMipMapLinear",
                    magFilter: "linear"
                });
            }
            material.addNode(new SceneJS.Texture({ sid: "texture", layers: layers }));
        }
        return material;
    }

    // @private
    function getDiffuseMaterialData(profileCommonTag, techniqueTag, materialData) {
        var diffuseTag = techniqueTag.getElementsByTagName("diffuse");
        if (diffuseTag.length > 0) {
            var child = diffuseTag[0].firstChild;
            do{
                switch (child.tagName) {
                    case "color":
                        var color = child.firstChild.nodeValue.split(" ");
                        materialData.baseColor = { r:parseFloat(color[0]), g:parseFloat(color[1]), b:parseFloat(color[2]) };
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommonTag, child, "baseColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getSpecularColorMaterialData(profileCommonTag, techniqueTag, materialData) {
        var specular = techniqueTag.getElementsByTagName("specular");
        if (specular.length > 0) {
            var child = specular[0].firstChild;
            do{
                switch (child.tagName) {
                    case "color":
                        var color = child.firstChild.nodeValue.split(" ");
                        materialData.specularColor = { r:parseFloat(color[0]), g:parseFloat(color[1]), b:parseFloat(color[2]),a: 1 };
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommonTag, child, "specularColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getShininessMaterialData(profileCommonTag, techniqueTag, materialData) {
        var shininess = techniqueTag.getElementsByTagName("shininess");
        if (shininess.length > 0) {
            var child = shininess[0].firstChild;
            do{
                switch (child.tagName) {
                    case "float":
                        materialData.shine = parseFloat(child.firstChild.nodeValue);
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommonTag, child, "shine"));

                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getBumpMapMaterialData(profileCommonTag, techniqueTag, materialData) {
        var bump = techniqueTag.getElementsByTagName("bump");
        if (bump.length > 0) {
            var child = bump[0].firstChild;
            do{
                switch (child.tagName) {
                    case "texture":
                        SceneJS._loggingModule.warn("Collada bump mapping not supported yet");
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getTextureData(profileCommonTag, textureTag, applyTo) {
        var source = getSamplerSource(profileCommonTag, textureTag.getAttribute("texture"));
        var imageId = getImageId(profileCommonTag, source);
        var image = idMap[imageId];
        var imageFileName = image.getElementsByTagName("init_from")[0].firstChild.nodeValue;
        var blendMode = textureTag.getElementsByTagName("blend_mode")[0];               // TODO: should be nodeValue?
        return {
            uri : dirURI + imageFileName,
            applyTo: applyTo,
            blendMode: (blendMode == "MULTIPLY") ? "multiply" : "add"
        };
    }

    // @private
    function getSamplerSource(profileTag, sid) {
        var params = profileTag.getElementsByTagName("newparam");
        for (var i = 0; i < params.length; i++) {
            if (params[i].getAttribute("sid") == sid) {
                return params[i]
                        .getElementsByTagName("sampler2D")[0]
                        .getElementsByTagName("source")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        throw SceneJS._errorModule.fatalError(
                new SceneJS.ParseException
                        ("COLLADA element expected: "
                                + profileTag.tagName
                                + "/newparam[sid == '"
                                + sid + "']/sampler2D[0]/source[0]"));
    }

    // @private
    function getImageId(profileTag, sid) {
        var newParamTags = profileTag.getElementsByTagName("newparam");
        for (var i = 0; i < newParamTags.length; i++) {
            if (newParamTags[i].getAttribute("sid") == sid) {
                var surfaceTag = newParamTags[i].getElementsByTagName("surface")[0];
                return surfaceTag
                        .getElementsByTagName("init_from")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        throw SceneJS._errorModule.fatalError(new SceneJS.ParseException
                ("COLLADA element expected: "
                        + profileTag.tagName
                        + "/newparam[sid == '"
                        + sid + "']/surface[0]/init_from[0]"));
    }

    //==================================================================================================================
    // Materials library
    //
    // A Material is a parameterised instance of an effect
    //==================================================================================================================

    // @private
    function parseLibraryMaterials() {
        return parseLibrary("library_materials", "material", parseMaterial);
    }

    // @private
    function parseMaterial(materialTag) {
        var effectId = materialTag.getElementsByTagName("instance_effect")[0].getAttribute("url").substr(1);
        //        return new SceneJS.WithData({
        //            specularColor: { r: 1, g: 0 }
        //        },
        return new SceneJS.Instance({
            info: "instance_effect",
            uri: effectId
        }
            //)
                );
    }

    //==================================================================================================================
    // Geometries library
    //==================================================================================================================

    // @private
    function parseLibraryGeometries() {
        return parseLibrary("library_geometries", "geometry", parseGeometry);
    }

    // @private
    function parseGeometry(geometryTag) {
        logTag(geometryTag);
        var node = new SceneJS.Node({ sid: geometryTag.getAttribute("id") });
        var trianglesList = getTrianglesList(geometryTag);
        for (var it = 0; it < trianglesList.length; it++) {
            var triangle = trianglesList [it];
            var inputs = triangle.getElementsByTagName("input");
            var inputArray = [];
            var outputData = {};
            for (var n = 0; n < inputs.length; n++) {
                inputs[n].data = getSource(inputs[n].getAttribute("source").substr(1));
                var group = inputs[n].getAttribute("semantic");
                if (group == "TEXCOORD") {
                    group = group + inputs[n].getAttribute("set") || 0;
                }
                inputs[n].group = group;
                inputArray[inputs[n].getAttribute("offset")] = inputs[n];
                outputData[group] = [];
            }
            var faces;
            if (triangle.getElementsByTagName("p")[0].data) {
                faces = triangle.getElementsByTagName("p")[0].data;
            }
            else {
                faces = parseFloatArray(triangle.getElementsByTagName("p")[0]);
            }
            for (var i = 0; i < faces.length; i = i + inputArray.length) {
                for (var n = 0; n < inputArray.length; n++) {
                    var group = inputArray[n].group;
                    var pCount = 0;
                    for (var j = 0; j < inputArray[n].data.stride; j++) {
                        if (inputArray[n].data.typeMask[j]) {
                            outputData[group].push(
                                    parseFloat(inputArray[n].data.array[faces[i + n]
                                            * inputArray[n].data.stride + j
                                            + inputArray[n].data.offset]));
                            pCount++;
                        }
                    }
                    if (group == "VERTEX" && pCount == 1) { // 1D
                        outputData[group].push(0);
                    }
                    if (group == "VERTEX" && pCount == 2) { // 2D
                        outputData[group].push(0);
                    }
                    if (group == "TEXCOORD0" && pCount == 3) { // 2D textures
                        outputData[group].pop();
                    }
                    if (group == "TEXCOORD1" && pCount == 3) {
                        outputData[group].pop();
                    }
                }
            }
            faces = [];
            for (n = 0; n < outputData.VERTEX.length / 3; n++) {
                faces.push(n);
            }

            var geometry = new SceneJS.Geometry({
                info: "geometry",
                positions: outputData.VERTEX,
                normals: outputData.NORMAL,
                uv : outputData.TEXCOORD0,
                uv2 : outputData.TEXCOORD1,
                indices: faces
            });
            var materialName = triangle.getAttribute("material");
            if (materialName) {

                /* Geometry tag has a "material" attribute which identifies an abstract material it is to
                 * be bound to when instantiated. The Geometry node is then wrapped in a Instance,
                 * which will dynamically receive a URL of a Symbol that wraps a Material.
                 */
                (function() {
                    var _materialName = materialName; // In closure to get value snapshot
                    node.addNode(
                            new SceneJS.Instance(function(data) {
                                return { uri: data.get(_materialName) };
                            }, geometry));
                })();

            } else {
                node.addNode(geometry);
            }
        }
        return node;
    }

    // @private
    function getTrianglesList(geometryTag) {
        var trianglesList = [];
        var meshNode = geometryTag.getElementsByTagName("mesh")[0];
        var polyLists = meshNode.getElementsByTagName("polylist"); // Extract polylist children
        for (var i = 0; i < polyLists.length; i++) {
            var polyList = polyLists[i];
            polyList.getElementsByTagName("p")[0].data = getTrianglesFromPolyList(polyList);
            trianglesList.push(polyList);
        }
        var tris = meshNode.getElementsByTagName("triangles");
        for (i = 0; i < tris.length; i++) {
            trianglesList.push(tris[i]);
        }
        return trianglesList;
    }

    // @private
    function getTrianglesFromPolyList(polyList) {
        var i, j, k;
        var inputs = polyList.getElementsByTagName("input");
        var maxOffset = getMaxOffset(inputs);
        var vcount = parseFloatArray(polyList.getElementsByTagName("vcount")[0]);
        var faces = parseFloatArray(polyList.getElementsByTagName("p")[0]);         // TODO: parseInt
        var triangles = [];
        var base = 0;
        for (i = 0; i < vcount.length; i++) {
            for (j = 0; j < vcount[i] - 2; j++) { // For each vertex
                for (k = 0; k <= maxOffset; k++) { // A
                    triangles.push(faces[base + k]);
                }
                for (k = 0; k <= maxOffset; k++) { // B
                    triangles.push(faces[base + (maxOffset + 1) * (j + 1) + k]);
                }
                for (k = 0; k <= maxOffset; k++) { // C
                    triangles.push(faces[base + (maxOffset + 1) * (j + 2) + k]);
                }
            }
            base = base + (maxOffset + 1) * vcount[i];
        }
        return triangles;
    }

    // @private
    function getMaxOffset(inputs) {
        var maxOffset = 0;
        for (var n = 0; n < inputs.length; n++) {
            var offset = inputs[n].getAttribute("offset");
            if (offset > maxOffset) {
                maxOffset = offset;
            }
        }
        return maxOffset;
    }

    // @private
    function getSource(id) {
        var source = sources[id];
        if (source) {
            return source;
        }
        var element = idMap[id];
        if (element.tagName == "vertices") {
            source = getSource(// Recurse to child <source> element
                    element
                            .getElementsByTagName("input")[0]
                            .getAttribute("source")
                            .substr(1));
        } else {
            var accessor = element// <source>
                    .getElementsByTagName("technique_common")[0]
                    .getElementsByTagName("accessor")[0];

            var stride = parseInt(accessor.getAttribute("stride"));         // Number of values per unit
            var offset = parseInt(accessor.getAttribute("offset")) || 0;    // Index of first value
            var count = parseInt(accessor.getAttribute("count"));           // Number of units

            /* Create mask that indicates what data types are in the
             * source - int, float, Name, bool and IDREF.
             *
             * The number and type of the <param> elements define the
             * output of the <accessor>. Parameters are bound to values
             * in the order in which both are specified. A <param> wtihout
             * a name attribute indicates that the value is not part of the
             * input.
             */
            var params = accessor.getElementsByTagName("param");
            var typeMask = [];
            for (var i = 0; i < params.length; i++) {
                if (params[i].hasAttribute("name")) {
                    typeMask.push(true);
                } else {
                    typeMask.push(false);
                }
            }
            source = {
                array:parseFloatArray(idMap[accessor.getAttribute("source").substr(1)]),
                stride:stride,
                offset:offset,
                count:count,
                typeMask: typeMask
            };
        }
        sources[id] = source;
        return source;
    }

    // @private
    function parseFloatArray(node) {
        var result = [];
        var prev = "";
        var child = node.firstChild;
        var currArray;
        while (child) {
            currArray = (prev + child.nodeValue).replace(/\s+/g, " ").replace(/^\s+/g, "").split(" ");
            child = child.nextSibling;
            if (currArray[0] == "") {
                currArray.unshift();
            }
            if (child) {
                prev = currArray.pop();
            }
            for (var i = 0; i < currArray.length; i++) {
                result.push(parseFloat(currArray[i]));
            }
        }
        return result;
    }


    //==================================================================================================================
    // Nodes library
    //==================================================================================================================

    // @private
    function parseLibraryNodes() {
        return parseLibrary("library_nodes", "node", function(nodeTag) {
            return parseNode(nodeTag, "", {});
        });
    }

    //==================================================================================================================
    // Visual scenes library
    //==================================================================================================================

    // @private
    function parseLibraryVisualScenes() {
        var libraryVisualScenesTag = new SceneJS.Node({ info: "library_visual_scenes" });
        var libraryTags = xmlDoc.getElementsByTagName("library_visual_scenes");
        var i, j, symbolTags, symbolTag, symbol, libraryTag;
        for (i = 0; i < libraryTags.length; i++) {
            libraryTag = libraryTags[i];
            logTag(libraryTag);
            symbolTags = libraryTag.getElementsByTagName("visual_scene");
            for (j = 0; j < symbolTags.length; j++) {
                symbolTag = symbolTags[j];
                logTag(symbolTag);
                symbol = new SceneJS.Symbol({
                    info : "symbol_visual_scene",
                    sid: symbolTag.getAttribute("id")
                });
                libraryVisualScenesTag.addNode(parseVisualScene(symbolTag));
            }
        }
        return libraryVisualScenesTag;
    }

    /**
     * @private
     */

    function parseVisualScene(visualSceneTag) {
        logTag(visualSceneTag);

        var root = new SceneJS.Node({ info: "visual_scene" }); // Root of subgraph created by this method

        /* Attach to root a Symbol subgraph that contains the model proper, which client may instance explicitly
         * when they want to provide their own camera. This Symbol subgraph will also be instanced within each
         * of the Symbol subgraphs we'll create for <camera> nodes, which the client may instead instance to
         * obtain a view of the model via those cameras.
         */
        var visualSceneID = visualSceneTag.getAttribute("id");
        var visualSceneSymbol = new SceneJS.Symbol({ // Symbol for <visual_scene>
            sid: visualSceneID,
            info: "Symbol defining " + visualSceneID
        });
        root.addNode(visualSceneSymbol);

        var childTag = visualSceneTag.firstChild;
        var subNode;
        var meta;

        /**
         * Load and attach the subgraphs that instance cameras and lights for this scene. For sach camera subgraph, we'll
         * walk down the tree and attach an Instance of the model Symbol subgraph (defined above), and we'll wrap
         * the camera subgraph in a Symbol which may be instanced by the client to obtain a view of the model through
         * that camera.
         *
         * As we parse each subgraph, we'll track whether we find a camera or light in each one through a "meta" object.
         */
        do{
            if (childTag.tagName) {
                meta = {};
                subNode = parseNode(childTag, "", meta);

                if (meta.containsCamera) {

                    /* Attach to root a camera Symbol subgraph
                     */
                    var cameraId = childTag.getAttribute("id");
                    root.addNode(
                            new SceneJS.Symbol({
                                sid: visualSceneID + "/" + childTag.getAttribute("id"),
                                info: "View of model via camera " + cameraId
                            },
                                    appendSceneInstanceToCameraSubgraph(subNode, visualSceneID)));

                } else if (meta.containsLight) {

                    /* Attach to root a light subgraph, in front of all other subgraphs on the root
                     * so that it will illuminate them
                     */
                    visualSceneSymbol.insertNode(subNode, 0);
                } else {

                    /* Subgraph has no camera or light, append it to model subgraph
                     */
                    visualSceneSymbol.addNode(subNode, 0);
                }
            }
        } while (childTag = childTag.nextSibling);
        return root;
    }

    /**
     *
     * @param subNode
     * @param sceneSymbolName
     */
    function appendSceneInstanceToCameraSubgraph(subNode, sceneSymbolName) {
        var leaf = subNode;
        while (leaf.getNumNodes() > 0) {
            leaf = leaf.getNodeAt(leaf.getNumNodes() - 1);
        }

        /* Note on Instance URI - The URIs of Instance nodes that are children of Symbols will always be relative to the
         * SID path of the Symbol within its defined place in the scene hierarchy, regardless of where the Symbol has been
         * instanced from. Since our Symbol is of a camera in <library_cameras>, and the appended Instance points to a
         * Symbol of a visual scene in <library_visual_scenes>, the URI only has to back up one level - "../"
         */
        leaf.addNode(new SceneJS.Instance({
            info: "Instance of " + sceneSymbolName,
            uri : "../" + sceneSymbolName
        }));
        return subNode;
    }

    // @private
    function parseNode(nodeTag, path, meta) {
        logTag(nodeTag);
        var id = nodeTag.getAttribute("id");
        var node;
        if (id) {
            node = new SceneJS.Node({
                info: "<node id='" + id + "'>",
                sid: id });
            path = "../" + path;
        } else {
            node = new SceneJS.Node();
        }
        var xformNode = null;
        var xformHeadNode = null;
        var leafNode = node;
        var childTag = nodeTag.firstChild;
        do{
            xformNode = null;
            switch (childTag.tagName) {

                case "matrix":
                    xformNode = parseMatrix(childTag);
                    break;

                case "translate":
                    xformNode = parseTranslate(childTag);
                    break;

                case "rotate":
                    xformNode = parseRotate(childTag);
                    break;

                case "scale":
                    xformNode = parseScale(childTag);
                    break;

                case "lookat":
                    xformNode = parseLookat(childTag);
                    break;

                case "node":
                    leafNode.addNode(parseNode(childTag, path, meta));
                    break;

                case "instance_node":
                    leafNode.addNode(new SceneJS.Instance({
                        info: "<instance_node>",
                        uri : path + childTag.getAttribute("url").substr(1) }));
                    break;

                case "instance_visual_scene":
                    leafNode.addNode(new SceneJS.Instance({
                        info: "<instance_visual_scene>",
                        uri : path + childTag.getAttribute("url").substr(1) }));
                    break;

                case "instance_geometry":
                    leafNode.addNode(parseInstanceGeometry(path, childTag));
                    break;

                case "instance_camera":
                    leafNode.addNode(new SceneJS.Instance({
                        info: "<instance_camera>",
                        uri : path + childTag.getAttribute("url").substr(1) }));
                    meta.containsCamera = true;
                    break;

                case "instance_light":
                    leafNode.addNode(new SceneJS.Instance({
                        info: "<instance_light>",
                        uri : path + childTag.getAttribute("url").substr(1) }));
                    meta.containsLight = true;
                    break;
            }
            if (xformNode) {
                if (xformHeadNode) {
                    xformNode.addNode(xformHeadNode);
                } else {
                    leafNode = xformNode;
                }
                xformHeadNode = xformNode;
                if (xformNode.getSID()) {
                    path = "../" + path;
                }
            }
        } while (childTag = childTag.nextSibling);
        if (xformHeadNode) {
            node.addNode(xformHeadNode);
        }
        return node;
    }

    function parseRotate(rotateTag) {
        logTag(rotateTag);
        var array = parseFloatArray(rotateTag);
        var sid = rotateTag.getAttribute("sid") || randomSID();
        return new SceneJS.Rotate({
            info: "<rotate>",
            sid: sid,
            x: array[0],
            y: array[1],
            z: array[2],
            angle: array[3]
        });
    }

    // @private
    function parseMatrix(matrixTag) {
        logTag(matrixTag);
        var sid = matrixTag.getAttribute("sid") || randomSID();
        var array = parseFloatArray(matrixTag);
        return new SceneJS.Matrix({
            info: "<matrix>",
            sid: sid,
            elements: [
                array[0],array[4],array[8],array[12],
                array[1],array[5],array[9],array[13],
                array[2],array[6],array[10],array[14],
                array[3],array[7],array[11],array[15]] });
    }

    // @private
    function parseTranslate(translateTag) {
        logTag(translateTag);
        var sid = translateTag.getAttribute("sid") || randomSID();
        var array = parseFloatArray(translateTag);
        return new SceneJS.Translate({
            info: "<translate>",
            sid: sid,
            x: array[0],
            y: array[1],
            z: array[2]

        });
    }

    // @private
    function parseScale(scaleTag) {
        logTag(scaleTag);
        var sid = scaleTag.getAttribute("sid") || randomSID();
        var array = parseFloatArray(scaleTag);
        return new SceneJS.Scale({
            info: "<scale>",
            sid: sid,
            x: array[0],
            y: array[1],
            z: array[2]
        });
    }

    // @private
    function parseLookat(lookatTag) {
        logTag(lookatTag);
        var sid = lookatTag.getAttribute("sid") || "lookat";
        var array = parseFloatArray(lookatTag);
        return new SceneJS.LookAt({
            info: "<lookat>",
            sid: sid,
            eye: {
                x: array[0],
                y: array[1],
                z:array[2]
            },
            look: {
                x: array[3],
                y: array[4],
                z: array[5]
            },
            up: {
                x: array[6],
                y: array[7],
                z: array[8]
            }
        });
    }

    function parseInstanceGeometry(path, instanceGeometryTag) {

        /* COLLADA geometry elements like <triangles> can have a "material" attribute which identifies an
         * abstract material it is to be bound to when instantiated. The Geometry node created in the parseGeometry()
         * method is then wrapped in a Instance, which will dynamically receive via a WithConfig the URLs of a Symbols
         * that each wrap a Material.
         */
        var params = null;
        var materials = instanceGeometryTag.getElementsByTagName("instance_material");
        var material;
        for (var i = 0; i < materials.length; i++) {
            if (!params) {
                params = {};
            }
            material = materials[i];
            params[material.getAttribute("symbol")] = "../" + material.getAttribute("target").substr(1);
        }
        var geometryInstance = new SceneJS.Instance({
            info: "instance_geometry",
            uri : path + instanceGeometryTag.getAttribute("url").substr(1)
        });
        if (params) {
            return new SceneJS.WithData(params, geometryInstance);
        } else {
            return geometryInstance;
        }
    }

    function parseScene() {
        var sceneTag = xmlDoc.getElementsByTagName("scene")[0];
        var scene = new SceneJS.Symbol({
            info: "scene-symbol",
            sid: "__SceneJS._default_scene"
        });
        var ivsTags = sceneTag.getElementsByTagName("instance_visual_scene");
        for (var i = 0; i < ivsTags.length; i++) {
            scene.addNode(parseInstanceVisualScene(ivsTags[i]));
        }
        return scene;
    }

    function parseInstanceVisualScene(instanceVisualSceneTag) {
        var sid = instanceVisualSceneTag.getAttribute("sid") || randomSID();
        var target = instanceVisualSceneTag.getAttribute("url").substr(1); // Non-null for instance tags
        return new SceneJS.Instance({
            info: "scene-instance",
            sid: sid,
            uri : "../" + target
        });

    }
})();