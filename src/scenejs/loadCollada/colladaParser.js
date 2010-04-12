/**
 * Parses a COLLADA files into a SceneJS nodes.
 *
 * This is an experimental parser constructed using techniques poached from other examples out there, most notably
 * that of GLGE, which you can find at http://github.com/supereggbert/GLGE
 *
 * Parsing large Collada documents client-side is not encouraged however, and is not likely to be seriously
 * supported by SceneJS.
 *
 * The recommended way to load Collada is to use SceneJS.assets.scenejs nodes to pull SceneJS fragments from a
 * server-side proxy that parses Collada.
 */
SceneJS._utils.__ColladaParser = (function() {
    var logger;
    var xmlDoc; // Holds DOM parsed from XML string
    var uri;    // URI at which Collada document resides
    var dirURI; // Path to directory containing the Collada document
    var idMap = {}; // Maps every DOM element by ID
    var sources = {};

    /** Frees scratch memory
     */
    function cleanup() {
        xmlDoc = null;
        idMap = {};
        sources = {};
    }

    /**
     * Parses the given XML string into the xmlDoc
     */
    function loadDoc(xml) {
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        }
        else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xml);
        }
    }

    /**
     * Finds every element in the xmlDoc and maps the by IDs into the idMap
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

    /**
     * Parses the xmlDoc, optionally constrained to the subtree identified by rootId
     */
    function parseDoc(rootId) {
        if (rootId) {
            //  logger.info("Parsing Collada asset '" + rootId + "'");
            var root = idMap[rootId];
            if (root) {
                return parseNode(root);
            } else {
                throw new SceneJS.exceptions.ColladaRootNotFoundException(
                        "SceneJS.assets.collada root not found in COLLADA document: '" + rootId + "'");
            }
        } else {
            logger.info("Parsing Collada scene. Asset: " + rootId ? "'" + rootId + "'" : "default");
            var scene = xmlDoc.getElementsByTagName("scene");
            if (scene.length > 0) {
                return parseNode(scene[0]);
            } else {
                throw new SceneJS.exceptions.ColladaRootRequiredException(
                        "SceneJS.assets.collada root needs to be specified for COLLADA document: " + uri);
            }
        }
    }

    function parseArray(node) {
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
                result.push(currArray[i]);
            }
        }
        return result;
    }

    /**
     * Returns the data for either a <vertices> or a <source>
     *
     * A <source> declares a data repository that provides values according
     * to the semantics of an <input> element that refers to it.
     */
    function getSource(id) {
        var source = sources[id];
        if (source) {
            return source;
        }
        var element = idMap[id];
        if (element.tagName == "vertices") {

            /* Recurse to child <source> element
             */
            source = getSource(
                    element
                            .getElementsByTagName("input")[0]
                            .getAttribute("source")
                            .substr(1));
        } else {

            /* Element is a <source>
             */
            var accessor = element
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
                array:parseArray(idMap[accessor.getAttribute("source").substr(1)]),
                stride:stride,
                offset:offset,
                count:count,
                typeMask: typeMask
            };
        }
        sources[id] = source;
        return source;
    }

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

    function getTrianglesFromPolyList(polyList) {
        var i, j, k;
        var inputs = polyList.getElementsByTagName("input");
        var maxOffset = getMaxOffset(inputs);
        var vcount = parseArray(polyList.getElementsByTagName("vcount")[0]);
        var faces = parseArray(polyList.getElementsByTagName("p")[0]);
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

    /** Extracts list of triangles from the given <mesh>, merged from both the
     * <triangles> and <polylist> child nodes of the <mesh>.
     */
    function getTrianglesList(geometryNode) {
        var trianglesList = [];
        var meshNode = geometryNode.getElementsByTagName("mesh")[0];

        /* Extract <polylist> children
         */
        var polyLists = meshNode.getElementsByTagName("polylist");
        for (var i = 0; i < polyLists.length; i++) {
            var polyList = polyLists[i];
            polyList.getElementsByTagName("p")[0].data = getTrianglesFromPolyList(polyList);
            trianglesList.push(polyList);
        }

        var tris = meshNode.getElementsByTagName("triangles");
        for (i = 0; i < tris.length; i++) {
            //  logger.info("Parsing &lt;triangle&gt; " + i);
            trianglesList.push(tris[i]);
        }
        return trianglesList;
    }

    var x = 0;

    /** Parses a <geometry> and returns an array containing a SceneJS.geometry node for
     * each <mesh> child
     *
     * @param id
     */
    function getGeometriesData(geometryNode) {
        var geometriesData = [];
        var trianglesList = getTrianglesList(geometryNode);

        for (it = 0; it < trianglesList.length; it++) {
            // logger.info("Parsing &lt;triangle&gt; " + it);
            var triangle = trianglesList [it];
            var inputs = triangle.getElementsByTagName("input");
            var inputArray = [];
            var outputData = {};

            for (var n = 0; n < inputs.length; n++) {
                // logger.info("Parsing &lt;input&gt; " + n);
                inputs[n].data = getSource(inputs[n].getAttribute("source").substr(1));
                var group = inputs[n].getAttribute("semantic");
                if (group == "TEXCOORD") {
                    //   logger.info("Parsing TEXCOORD" + i);
                    group = group + inputs[n].getAttribute("set") || 0;
                }
                inputs[n].group = group;
                inputArray[inputs[n].getAttribute("offset")] = inputs[n];
                outputData[group] = [];
            }

            //   logger.info("Parsing &lt;face&gt;s..");
            var faces;
            if (triangle.getElementsByTagName("p")[0].data) {
                faces = triangle.getElementsByTagName("p")[0].data;
            }
            else {
                faces = parseArray(triangle.getElementsByTagName("p")[0]);
            }

            //  logger.info("Parsed &lt;face&gt; count =  " + faces.length);

            for (var i = 0; i < faces.length; i = i + inputArray.length) {
                for (var n = 0; n < inputArray.length; n++) {
                    var group = inputArray[n].group;
                    var pCount = 0;
                    for (var j = 0; j < inputArray[n].data.stride; j++) {
                        if (inputArray[n].data.typeMask[j]) {
                            outputData[group].push(
                                    inputArray[n].data.array[faces[i + n]
                                            * inputArray[n].data.stride + j
                                            + inputArray[n].data.offset]);
                            pCount++;
                        }
                    }

                    /* 1D
                     */
                    if (group == "VERTEX" && pCount == 1) {
                        outputData[group].push(0);
                    }

                    /* 2D
                     */
                    if (group == "VERTEX" && pCount == 2) {
                        outputData[group].push(0);
                    }

                    /* 2D textures
                     */
                    if (group == "TEXCOORD0" && pCount == 3) {
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


            geometriesData.push({
                materialName : triangle.getAttribute("material"),
                positions: outputData.VERTEX,
                normals: outputData.NORMAL,
                uv : outputData.TEXCOORD0,
                uv2 : outputData.TEXCOORD1,
                indices: faces
            });
        }
        return geometriesData;
    }

    /**
     * Returns profile/newparam[sid="<sid>"]/sampler2D[0]/source[0].nodeValue
     */
    function getSamplerSource(profile, sid) {
        var params = profile.getElementsByTagName("newparam");
        for (var i = 0; i < params.length; i++) {
            if (params[i].getAttribute("sid") == sid) {
                return params[i]
                        .getElementsByTagName("sampler2D")[0]
                        .getElementsByTagName("source")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        throw new SceneJS.exceptions.ColladaParseException
                ("Element expected: "
                        + profile.tagName
                        + "/newparam[sid == '"
                        + sid + "']/sampler2D[0]/source[0]");
    }

    /**
     * Returns profile/newparam[sid="<sid>"]/surface[0]/init_from[0].nodeValue
     */
    function getImageId(profile, sid) {
        var newparams = profile.getElementsByTagName("newparam");
        for (var i = 0; i < newparams.length; i++) {
            if (newparams[i].getAttribute("sid") == sid) {
                var surface = newparams[i].getElementsByTagName("surface")[0];
                return surface
                        .getElementsByTagName("init_from")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        throw new SceneJS.exceptions.ColladaParseException
                ("Element expected: "
                        + profile.tagName
                        + "/newparam[sid == '"
                        + sid + "']/surface[0]/init_from[0]");
    }

    function getTextureData(profileCommon, texture, applyTo) {
        var source = getSamplerSource(profileCommon, texture.getAttribute("texture"));
        var imageId = getImageId(profileCommon, source);
        var image = idMap[imageId];
        var imageFileName = image.getElementsByTagName("init_from")[0].firstChild.nodeValue;
        var blendMode = texture.getElementsByTagName("blend_mode")[0];
        return {
            uri : dirURI + imageFileName,
            applyTo: applyTo,
            blendMode: (blendMode == "MULTIPLY") ? "multiply" : "add"
        };
    }

    function getDiffuseMaterialData(profileCommon, technique, materialData) {
        var diffuse = technique.getElementsByTagName("diffuse");
        if (diffuse.length > 0) {
            var child = diffuse[0].firstChild;
            do{
                switch (child.tagName) {
                    case "color":
                        var color = child.firstChild.nodeValue.split(" ");
                        materialData.baseColor = { r:parseFloat(color[0]), g:parseFloat(color[1]), b:parseFloat(color[2]) };
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommon, child, "baseColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    function getSpecularColorMaterialData(profileCommon, technique, materialData) {
        var specular = technique.getElementsByTagName("specular");
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
                                getTextureData(profileCommon, child, "specularColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    function getShininessMaterialData(profileCommon, technique, materialData) {
        var shininess = technique.getElementsByTagName("shininess");
        if (shininess.length > 0) {
            var child = shininess[0].firstChild;
            do{
                switch (child.tagName) {
                    case "float":
                        materialData.shine = parseFloat(child.firstChild.nodeValue);
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommon, child, "shine"));

                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    function getBumpMapMaterialData(profileCommon, technique, materialData) {
        var bump = technique.getElementsByTagName("bump");
        if (bump.length > 0) {
            var child = bump[0].firstChild;
            do{
                switch (child.tagName) {
                    case "texture":
                        logger.warn("Collada bump mapping not supported yet");
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    function getMaterialData(id) {
        var materialNode = idMap[id];
        var effectId = materialNode
                .getElementsByTagName("instance_effect")[0]
                .getAttribute("url")
                .substr(1);
        var effect = idMap[effectId];
        var profileCommon = effect.getElementsByTagName("profile_COMMON")[0];
        var technique = profileCommon.getElementsByTagName("technique")[0];
        var materialData = {
            texturesData : []
        };
        getDiffuseMaterialData(profileCommon, technique, materialData);
        getSpecularColorMaterialData(profileCommon, technique, materialData);
        getShininessMaterialData(profileCommon, technique, materialData);
        getBumpMapMaterialData(profileCommon, technique, materialData);
        return materialData;
    }

    function getMaterialsData(instanceGeometryNode) {
        var materialsData = {};
        var materials = instanceGeometryNode.getElementsByTagName("instance_material");
        var material;
        var materialId;
        var symbolId;
        for (var i = 0; i < materials.length; i++) {
            material = materials[i];
            materialId = material.getAttribute("target").substr(1);
            symbolId = material.getAttribute("symbol");
            materialsData[symbolId] = getMaterialData(materialId);
        }
        return materialsData;
    }

    function parseInstanceGeometry(instanceGeometryNode) {
        var geometryNode = idMap[instanceGeometryNode.getAttribute("url").substr(1)];
        var geometriesData = getGeometriesData(geometryNode);
        var materialsData = getMaterialsData(instanceGeometryNode);

        var geometries = [];

        for (var i = 0; i < geometriesData.length; i++) {

            var geoData = geometriesData[i];



            var sceneNode = SceneJS.geometry({
                type: "xxx" + x++,
                primitive: "triangles",
                positions: geoData.positions,
                normals: geoData.normals,
                uv : geoData.uv,
                uv2 : geoData.uv2,
                indices: geoData.indices
            });

            if (geoData.materialName) {
                var materialData = materialsData[geoData.materialName];

                /* Wrap in SceneJS.material
                 */
                sceneNode = SceneJS.material({
                    baseColor: materialData.baseColor,
                    specularColor: materialData.specularColor ,
                    shine: 10.0,
                    specular: 1
                }, sceneNode);


                /* Wrap in SceneJS.texture
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
                    sceneNode = SceneJS.texture({
                        layers: layers
                    }, sceneNode);
                }
            }
            geometries.push(sceneNode);
        }


        /* Group SceneJS.geometries in a SceneJS.node
         */
        return SceneJS.node.apply(this, geometries);
    }

    function parseMatrix(node) {
        var data = parseArray(node);
        // logger.info("Parsing matrix (" + data.length + "): [" + data.join(", ") + "]");
        return data;
    }

    function parseTranslate(node) {
        var data = parseArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
        return SceneJS_math_translationMat4v(data);
    }

    function parseRotate(node) {
        var data = parseArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
        var angle = data[3];
        return SceneJS_math_rotationMat4c(angle * 0.017453278, x, y, z);
    }

    /**
     * Returns a SceneJS node created from the given DOM node.
     *
     * We're loading only geometry, transforms and material for SceneJS assets, ignoring nodes like cameras and lights.
     */
    function parseNode(node, level) {
        level = level || 0;
        logger.setIndent(level);
        level++;

        /* Builds params for our scene node
         */
        var sceneNodeParams = [];

        /* Matrix created from any transforms found
         */
        var matrix = SceneJS_math_identityMat4();

        var child = node.firstChild;

        do{
            /* Traverse child nodes
             */
            switch (child.tagName) {

                case "node":
                    sceneNodeParams.push(parseNode(child, level + 1));
                    break;

                case "matrix":
                    var array = parseMatrix(child);

                    /* Convert row-major to SceneJS column-major
                     */
                    matrix = [
                        array[0],array[4],array[8],array[12],
                        array[1],array[5],array[9],array[13],
                        array[2],array[6],array[10],array[14],
                        array[3],array[7],array[11],array[15]];
                    break;

                case "translate":
                    matrix = matrix
                            ? SceneJS_math_mulMat4(matrix, parseTranslate(child))
                            : parseTranslate(child);
                    break;

                case "rotate":
                    matrix = matrix
                            ? SceneJS_math_mulMat4(matrix, parseRotate(child))
                            : parseRotate(child);
                    break;

                case "instance_node":
                    // logger.info("Parsing Collada instance_node");
                    sceneNodeParams.push(parseNode(idMap[child.getAttribute("url").substr(1)], level));
                    break;

                case "instance_visual_scene":

                    /* Root node of the new SceneJS subtree
                     */

                    var visualSceneNode = idMap[child.getAttribute("url").substr(1)];

                    /* Recurse to visual_scene node
                     */
                    sceneNodeParams.push(parseNode(visualSceneNode, level));
                    break;

                case "instance_geometry":

                    sceneNodeParams.push(parseInstanceGeometry(child));
                    break;
            }
        } while (child = child.nextSibling);

        if (matrix) {
            sceneNodeParams.unshift({
                elements: matrix });
            return SceneJS.modellingMatrix.apply(this, sceneNodeParams);
        } else {
            return SceneJS.node.apply(this, sceneNodeParams);
        }


    }

    return {
        /**
         *
         * @param _logger Logger to output progress with
         * @param _uri Path to the Collada document (used for texture image paths etc)
         * @param xml Collada document string
         * @param rootId Optional ID of particular asset we want from Collada document
         */
        parse : function(_logger, _uri, xml, rootId) {
            logger = _logger;
            uri = _uri;
            dirURI = _uri.substring(0, _uri.lastIndexOf("/") + 1);

            loadDoc(xml);
            buildIdMap();
            var node = parseDoc(rootId);
            cleanup();

            return node;
        }
    };
})();
