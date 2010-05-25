/**
 * Backend that parses a COLLADA files into a SceneJS nodes.
 *
 *
 * @private
 *
 */
var SceneJS_colladaParserModule = new (function() {

    var xmlDoc; // Holds DOM parsed from XML string
    var uri;    // URI at which Collada document resides
    var dirURI; // Path to directory containing the Collada document
    var idMap = {}; // Maps every DOM element by ID
    var sources = {};
    var modes = {};
    var meta;

    /** Resets parser state
     * @private
     */
    function reset() {
        xmlDoc = null;
        idMap = {};
        sources = {};
        meta = {
            contributor: {
                author : "",
                authoringTool :"",
                comments : "",
                copyright : "",
                sourceData : ""
            },
            cameras: [],
            lights: []  ,
            volume : newExtents()
        };

        modes = {};
    }

    /**
     * Parses the given XML string into the xmlDoc
     * @private
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

    /**
     * Parses the xmlDoc, optionally constrained to the subtree identified by rootId
     * @private
     */
    function parseDoc(rootId) {

        /* Parse contributor info
         */
        var contributor = xmlDoc.getElementsByTagName("contributor");
        if (contributor.length > 0) {
            meta.contributor = parseContributor(contributor[0]);
        }

        if (rootId) {

            /* Parse target node
             */
            SceneJS_loggingModule.info("Parsing Collada asset '" + rootId + "'");
            var root = idMap[rootId];
            if (root) {
                return parseNode(root);
            } else {
                SceneJS_errorModule.error(new SceneJS.ColladaRootNotFoundException(
                        "SceneJS.assets.collada root not found in COLLADA document: '" + rootId + "'"));
            }
        } else {

            /* Parse default node
             */
            SceneJS_loggingModule.info("Parsing Collada scene. Asset: " + rootId ? "'" + rootId + "'" : "default");
            var scene = xmlDoc.getElementsByTagName("scene");
            if (scene.length > 0) {
                return parseNode(scene[0]);
            } else {
                SceneJS_errorModule.error(new SceneJS.ColladaRootRequiredException(
                        "SceneJS.assets.collada root needs to be specified for COLLADA document: " + uri));
            }
        }
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


    /**
     * Returns the data for either a <vertices> or a <source>
     *
     * A <source> declares a data repository that provides values according
     * to the semantics of an <input> element that refers to it.
     * @private
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

    /** Extracts list of triangles from the given <mesh>, merged from both the
     * <triangles> and <polylist> child nodes of the <mesh>.
     * @private
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
            trianglesList.push(tris[i]);
        }
        return trianglesList;
    }


    /** Parses a <geometry> and returns an array containing a SceneJS.geometry node for
     * each <mesh> child
     * @private
     * @param id
     */
    function getGeometriesData(geometryNode) {
        var geometriesData = [];
        var trianglesList = getTrianglesList(geometryNode);

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
     * @private
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
        throw SceneJS_errorModule.fatalError(
                new SceneJS.ColladaParseException
                        ("COLLADA element expected: "
                                + profile.tagName
                                + "/newparam[sid == '"
                                + sid + "']/sampler2D[0]/source[0]"));
    }

    /**
     * Returns profile/newparam[sid="<sid>"]/surface[0]/init_from[0].nodeValue
     * @private
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
        throw SceneJS_errorModule.fatalError(new SceneJS.ColladaParseException
                ("COLLADA element expected: "
                        + profile.tagName
                        + "/newparam[sid == '"
                        + sid + "']/surface[0]/init_from[0]"));
    }

    // @private
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

    // @private
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

    // @private
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

    // @private
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

    // @private
    function getBumpMapMaterialData(profileCommon, technique, materialData) {
        var bump = technique.getElementsByTagName("bump");
        if (bump.length > 0) {
            var child = bump[0].firstChild;
            do{
                switch (child.tagName) {
                    case "texture":
                        SceneJS_loggingModule.warn("Collada bump mapping not supported yet");
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
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

    // @private
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


    // @private
    function wrapWithBoundingBox(e, child) {
        if (modes.showBoundingBoxes) {
            return SceneJS.boundingBox(e, SceneJS.renderer({
                lineWidth:2,
                enableTexture2D: false
            }, SceneJS.material({baseColor: { r: 1, g: 0, b: 0 }},
                    SceneJS.geometry({
                        primitive: "lines",
                        positions : [
                            e.xmax, e.ymax, e.zmax,
                            e.xmax, e.ymin, e.zmax,
                            e.xmin, e.ymin, e.zmax,
                            e.xmin, e.ymax, e.zmax,
                            e.xmax, e.ymax, e.zmin,
                            e.xmax, e.ymin, e.zmin,
                            e.xmin, e.ymin, e.zmin,
                            e.xmin, e.ymax, e.zmin
                        ],
                        indices : [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1,5, 2, 6,3,7 ]
                    }))), child);
        } else {
            return SceneJS.boundingBox(e, child);
        }
    }

    // @private
    function newExtents() {
        const hugeNum = 9999999; // TODO: Guarantee this is max
        return {
            xmin : hugeNum, ymin : hugeNum, zmin : hugeNum,
            xmax : -hugeNum, ymax : -hugeNum, zmax : -hugeNum
        };
    }

    // @private
    function expandExtentsByPositions(e, positions) {
        for (var i = 0; i < positions.length - 2; i += 3) {
            var x = positions[i];
            var y = positions[i + 1];
            var z = positions[i + 2];
            if (x < e.xmin) e.xmin = x;
            if (y < e.ymin) e.ymin = y;
            if (z < e.zmin) e.zmin = z;
            if (x > e.xmax) e.xmax = x;
            if (y > e.ymax) e.ymax = y;
            if (z > e.zmax) e.zmax = z;
        }
        return e;
    }

    // @private
    function expandExtentsByExtents(e, e2) {
        if (e2.xmin < e.xmin) e.xmin = e2.xmin;
        if (e2.ymin < e.ymin) e.ymin = e2.ymin;
        if (e2.zmin < e.zmin) e.zmin = e2.zmin;
        if (e2.xmax > e.xmax) e.xmax = e2.xmax;
        if (e2.ymax > e.ymax) e.ymax = e2.ymax;
        if (e2.zmax > e.zmax) e.zmax = e2.zmax;
        return e;
    }

    // @private
    function parseInstanceGeometry(instanceGeometryNode) {
        var geoUrl = instanceGeometryNode.getAttribute("url").substr(1);
        var geometryNode = idMap[geoUrl];
        var geometriesData = getGeometriesData(geometryNode);
        var materialsData = getMaterialsData(instanceGeometryNode);

        var nodeArgList = []; // Args for SceneJS node result

        var extents = newExtents();

        for (var i = 0; i < geometriesData.length; i++) {
            var geoData = geometriesData[i];
            var geoType = uri + ":" + geoUrl + i;
            var sceneNode = SceneJS.geometry({
                type: geoType,
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
                if (materialData) {
                    sceneNode = SceneJS.material({
                        // baseColor: {r:.1, g:.1,b:.1},
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
                        sceneNode = SceneJS.texture({ layers: layers }, sceneNode);
                    }
                }
            }
            nodeArgList.push(wrapWithBoundingBox(
                    expandExtentsByPositions(newExtents(), geoData.positions),
                    sceneNode));
        }
        return SceneJS.node.apply(this, nodeArgList);
    }

    // @private
    function parseMatrix(node) {
        var data = parseFloatArray(node);
        return data;
    }

    // @private
    function parseTranslate(node) {
        var data = parseFloatArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
        return SceneJS_math_translationMat4c(x, y, z);
    }

    // @private
    function parseRotate(node) {
        var data = parseFloatArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
        var angle = data[3];
        return SceneJS_math_rotationMat4c(angle * 0.017453278, x, y, z);
    }

    function parseContributor(contributor) {
        var author = contributor.getElementsByTagName("author")[0];
        var authoringTool = contributor.getElementsByTagName("authoring_tool")[0];
        var comments = contributor.getElementsByTagName("comments")[0];
        var copyright = contributor.getElementsByTagName("copyright")[0];
        var sourceData = contributor.getElementsByTagName("source_data")[0];
        return {
            author : author ? author.textContent : null,
            authoringTool : authoringTool ? authoringTool.textContent : null,
            comments : comments ? comments.textContent.split(";").join("\n") : null,
            copyright : copyright ? copyright.textContent : null,
            sourceData : sourceData ? sourceData.textContent : null
        };
    }

    /** Parses data from camera node
     * @private
     */
    function parseCamera(camera) {
        var optics = camera.getElementsByTagName("optics")[0];
        var techniqueCommon = optics.getElementsByTagName("technique_common")[0];
        var perspective = techniqueCommon.getElementsByTagName("perspective")[0];

        var cameraData = {};

        if (perspective) {
            var yfov = perspective.getElementsByTagName("yfov")[0];
            var aspectRatio = perspective.getElementsByTagName("aspect_ratio")[0];
            var znear = perspective.getElementsByTagName("znear")[0];
            var zfar = perspective.getElementsByTagName("zfar")[0];

            cameraData = {
                optics: {
                    type: "perspective",
                    fovy: yfov ? parseFloat(yfov.textContent) : 60.0,
                    aspect: aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0,
                    near: znear ? parseFloat(znear.textContent) : 0.1,
                    far: zfar ? parseFloat(zfar.textContent) : 20000.0
                }
            };
            return cameraData;

        } else {
            var orthographic = techniqueCommon.getElementsByTagName("orthographic")[0];
            if (orthographic) {

                cameraData = {
                    optics: {
                        type: "ortho",
                        left: -1,
                        right: 1,
                        bottom: -1,
                        top: 1,
                        near: .1,
                        far: 10000
                    }
                };

                var xmag = perspective.getElementsByTagName("xmag")[0];
                var ymag = perspective.getElementsByTagName("ymag")[0];
                var aspectRatio = perspective.getElementsByTagName("aspect_ratio")[0];
                var znear = perspective.getElementsByTagName("znear")[0];
                var zfar = perspective.getElementsByTagName("zfar")[0];

                var xmagVal;
                var ymagVal;
                var aspect;
                var near = znear ? parseFloat(znear.textContent) : 0.1;
                var far = zfar ? parseFloat(zfar.textContent) : 50000.0;

                if (xmag && ymag) { // Ignore aspect

                    xmagVal = xmag ? parseFloat(xmag.textContent) : 1.0;
                    ymagVal = ymag ? parseFloat(ymag.textContent) : 1.0;
                    cameraData = {
                        optics: {
                            type: "ortho",
                            left: -xmagVal,
                            right: xmagVal,
                            bottom: -ymagVal,
                            top: ymagVal,
                            near: near,
                            far: far
                        }
                    };


                } else if (xmag) {
                    xmagVal = xmag ? parseFloat(xmag.textContent) : 1.0;
                    aspect = aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0;
                    cameraData = {
                        optics: {
                            type: "ortho",
                            left: -xmagVal,
                            right: xmagVal,
                            bottom: -xmagVal * aspect,
                            top: xmagVal * aspect,
                            near: near,
                            far: far
                        }
                    };

                } else if (ymag) {
                    ymagVal = ymag ? parseFloat(ymag.textContent) : 1.0;
                    aspect = aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0;
                    cameraData = {
                        optics: {
                            type: "ortho",
                            left: -ymagVal * aspect,
                            right: ymagVal * aspect,
                            bottom: -ymagVal,
                            top: ymagVal,
                            near: near,
                            far: far
                        }
                    };
                } else {
                    SceneJS_loggingModule.warn("camera.technique_common.optics.orthographic - insufficient data found, falling back on defaults");
                }
            } else {
                SceneJS_loggingModule.warn("camera.technique_common.optics - neither perspective nor perspective found");
            }
        }
        return cameraData;
    }

    function parseLookat(lookat) {
        var data = parseFloatArray(lookat);
        return {
            eye: { x: data[0], y: data[1], z: data[2] },
            look: { x: data[3], y: data[4], z: data[5] },
            up: { x: data[6], y: data[7], z: data[8] }
        };
    }

    function parseLight(light) {
        var techniqueCommon = light.getElementsByTagName("technique_common")[0];
        var directional = techniqueCommon.getElementsByTagName("directional")[0];
        if (directional) {
            return {
                type: "dir",
                dir: { x: 0, y: 0, z: -1.0 },
                color: parseFloatArray(directional.getElementsByTagName("color")[0])
            };
        }
        var point = techniqueCommon.getElementsByTagName("point")[0];
        if (point) {
            var constantAttenuation = point.getElementsByTagName("constant_attenuation")[0];
            var linearAttenuation = point.getElementsByTagName("linear_attenuation")[0];
            var quadraticAttenuation = point.getElementsByTagName("quadratic_attenuation")[0];
            return {
                type: "point",
                pos: { x: 0, y: 0, z: 0},
                color: parseFloatArray(point.getElementsByTagName("color")[0]),
                constantAttenuation : constantAttenuation ? parseFloat(constantAttenuation) : 1.0,
                linearAttenuation : linearAttenuation ? parseFloat(linearAttenuation) : 0.0,
                quadraticAttenuation : quadraticAttenuation ? parseFloat(quadraticAttenuation) : 0.0
            };
        }
        var spot = techniqueCommon.getElementsByTagName("spot")[0];
        if (spot) {
            var constantAttenuation = spot.getElementsByTagName("constant_attenuation")[0];
            var linearAttenuation = spot.getElementsByTagName("linear_attenuation")[0];
            var quadraticAttenuation = spot.getElementsByTagName("quadratic_attenuation")[0];
            var falloffAngle = spot.getElementsByTagName("falloff_angle")[0];
            var falloffExponent = spot.getElementsByTagName("falloff_exponent")[0];
            return {
                type: "spot",
                // TODO: position & dir?
                color: parseFloatArray(spot.getElementsByTagName("color")[0]) ,
                constantAttenuation : constantAttenuation ? parseFloat(constantAttenuation) : 1.0,
                linearAttenuation : linearAttenuation ? parseFloat(linearAttenuation) : 0.0,
                quadraticAttenuation : quadraticAttenuation ? parseFloat(quadraticAttenuation) : 0.0,
                falloffAngle : falloffAngle ? parseFloat(falloffAngle) : 180.0,
                falloffExponent : falloffExponent ? parseFloat(falloffExponent) : 0.0
            };
        }
        return null;
    }


    /**
     * Returns a SceneJS node created from the given DOM node.
     * @private
     */
    function parseNode(node) {

        /* Builds params for our scene node
         */
        var sceneNodeParams = [];

        var cameraData = null;
        var lightData = null;
        var lookatData = null;

        /* Matrix created from any transforms found
         */
        var matrix = null;

        var child = node.firstChild;

        do{
            /* Traverse child nodes
             */
            switch (child.tagName) {

                case "node":
                    sceneNodeParams.push(parseNode(child));
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

                case "lookat":
                    if (modes.loadCameras) {
                        lookatData = parseLookat(child);
                    }
                    break;

                case "instance_node":
                    sceneNodeParams.push(parseNode(idMap[child.getAttribute("url").substr(1)]));
                    break;

                case "instance_visual_scene":
                    sceneNodeParams.push(parseNode(idMap[child.getAttribute("url").substr(1)]));
                    break;

                case "instance_geometry":
                    sceneNodeParams.push(parseInstanceGeometry(child));
                    break;

                case "instance_camera":
                    if (modes.loadCameras) {
                        cameraData = parseCamera(idMap[child.getAttribute("url").substr(1)]);
                    }
                    break;

                case "instance_light":
                    if (modes.loadLights) {
                        lightData = parseLight(idMap[child.getAttribute("url").substr(1)]);
                    }
                    break;
            }
        } while (child = child.nextSibling);

        var sceneNode = SceneJS.node.apply(this, sceneNodeParams);

        if (cameraData) {
            meta.cameras.push({
                id: node.getAttribute("id"),
                optics: cameraData.optics,
                lookat : lookatData,
                matrix : matrix ? SceneJS_math_inverseMat4(matrix) : null // Get view transform
            });

        } else {

            /* Modelling transform
             */
            if (matrix) {
                sceneNode = SceneJS.matrix({ elements: matrix }, sceneNode);
            }
        }

        if (lightData) {

            lightData.id = node.getAttribute("id");
            lightData.enabled = true;

            if (matrix) {

                lightData.matrix = matrix;

                /* Transform lights
                 */
                if (lightData.type == "point") {
                    var pos = SceneJS_math_transformPoint3(matrix, [0,0,0]);
                    lightData.pos = { x: pos[0], y: pos[1], z: pos[2] };
                } else if (lightData.type == "dir") {
                    var dir = SceneJS_math_transformVector3(matrix, [0,0,-1]);
                    lightData.dir = { x: dir[0], y: dir[1], z: dir[2] };
                }
            }
            meta.lights.push(lightData);
        }

        return sceneNode;
    }

    /**
     * @param _uri Path to the Collada document (used for texture image paths etc)
     * @param xml Collada document string
     * @param rootId Optional ID of particular asset we want from Collada document
     * @private
     */
    this.parse = function(_uri, xml, rootId, _modes) {

        reset();
        uri = _uri;
        dirURI = _uri.substring(0, _uri.lastIndexOf("/") + 1);
        modes = _modes;

        loadDoc(xml);
        buildIdMap();

        var root = parseDoc(rootId);

        var result = {
            meta:  meta
        };

        if (result.meta.cameras.length > 0) {
            result.meta.activeCamera = null;
            result.meta.defaultCamera = {
                lookat: {
                    eye: { x: 0, y: 0, z: 1},
                    look: { x: 0, y: 0, z: 0 },
                    up: { x: 0, y: 1, z: 0}
                },
                optics: {
                    type: "perspective",
                    fovy : 60.0,
                    aspect : 1.0,
                    near : 0.10,
                    far : 10000.0
                }
            };
        }

        //--------------------------------------------------------------------
        // If any cameras were parsed then factor the content root out into
        // a symbol, create a selector that switches between cameras that
        // instance the symbol
        //--------------------------------------------------------------------

        if (result.meta.cameras.length > 0) {

            /* Create map of indices to camera IDs, add each ID to result.metadata
             */
            var cameraNameMap = { };
            for (var i = 0; i < result.meta.cameras.length; i++) {
                cameraNameMap[result.meta.cameras[i].id] = i;
            }

            /* Define selector that activates subgraph corresponding to
             * given camera ID
             */
            var selector = SceneJS.selector(
                    function() {
                        if (result.meta.activeCamera) {
                            var index = cameraNameMap[result.meta.activeCamera] + 1;
                            if (index) {
                                return {
                                    selection: [index]
                                };
                            }
                        }
                        return {

                            /* Select default camera when none specified
                             */
                            selection: [0]
                        };
                    },

                /* Default camera
                 */
                    SceneJS.lookAt(function() {
                        return result.meta.defaultCamera.lookat;
                    },
                            SceneJS.camera(function() {
                                return { optics: result.meta.defaultCamera.optics };
                            },
                                    SceneJS.instance({ name: "content" }))));


            /* For each camera, define an instance child of the selector
             * to instance the model
             */

            for (var i = 0; i < result.meta.cameras.length; i++) {
                var camera = result.meta.cameras[i];

                var node = SceneJS.instance({
                    name: "content"
                });

                node = SceneJS.camera({
                    optics: camera.optics
                }, node);

                if (camera.matrix) {
                    node = SceneJS.matrix({
                        elements: camera.matrix
                    }, node);
                }
                if (camera.lookat) {
                    node = SceneJS.lookAt(
                            function() {
                                return {
                                    eye: camera.lookat.eye,
                                    look: camera.lookat.look,
                                    up: camera.lookat.up
                                };
                            }, node);
                }

                selector.addNode(node);
            }

            root = SceneJS.node(
                    SceneJS.symbol({
                        name: "content"
                    }, root), selector);
        }

        //--------------------------------------------------------------------
        // If any lights were parsed then wrap the content root with
        // some light sources
        //--------------------------------------------------------------------

        if (result.meta.lights.length > 0) {
            root = SceneJS.lights(function() {
                var sources = [];
                for (var i = 0; i < result.meta.lights.length; i++) {
                    var light = result.meta.lights[i];
                    if (light.enabled) {
                        sources.push(light);
                    }
                }
                return {
                    sources: sources
                };
            }, root);
        }

        reset();

        result.root = root;
        return result;
    };
}

        )
        ();