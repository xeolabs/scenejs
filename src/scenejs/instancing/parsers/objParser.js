

    /**
     * Backend that parses an .OBJ file into a SceneJS subgraph.
     *
     * @private
     */
        (function() {

            var uri;
            var dirURI;
            var node = null;
            var rootSID;
            var options;
            var debugCfg;

            var positions = [];
            var uv = [];
            var normals = [];
            var group = null;
            var index = 0;
            var indexMap = [];
            var mtllib;         // Name of auxiliary MTL file
            var groupNames = [];
            var nodesOpen;
            var propertiesInNode;
            var json = [];

            var warningsGiven = {};

            SceneJS._loadModule.registerParser("obj", {

                serverParams: {
                    format: "xml" // IE. text
                },

                parse: function(cfg) {
                    reset();
                    uri = cfg.uri;
                    rootSID = uri;
                    dirURI = cfg.uri.substring(0, cfg.uri.lastIndexOf("/") + 1);
                    options = cfg.options;
                    debugCfg = SceneJS._debugModule.getConfigs("instancing.obj") || {};
                    return _parse(cfg.data);
                }
            });

            function reset() {
                node = null;
                positions = [];
                uv = [];
                normals = [];
                group = null;
                index = 0;
                indexMap = [];
                mtllib = null;
                warningsGiven = {};
                groupNames = [];
                json = [];
                nodesOpen = 0;
            }

            function out(str) {
                json.push(str);
            }

            /**
             * @param text File content
             * @private
             */
            function _parse(text) {
                openNode("node");
                var lines = text.split("\n");
                var tokens;
                for (var i in lines) {
                    var line = lines[i];
                    if (line.length > 0) {
                        line = lines[i].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
                        tokens = line.split(" ");
                        if (tokens.length > 0) {

                            if (tokens[0] == "mtllib") { // Name of auxiliary MTL file
                                mtllib = tokens[1];
                            }
                            if (tokens[0] == "usemtl") { // Name of auxiliary MTL file
                                if (!group) {
                                    openGroup(null, null); // Default group - no name or texture group
                                }
                                group.materialName = tokens[1];
                            }
                            if (tokens[0] == "v") { // vertex
                                positions.push(parseFloat(tokens[1]));
                                positions.push(parseFloat(tokens[2]));
                                positions.push(parseFloat(tokens[3]));
                            }
                            if (tokens[0] == "vt") {
                                uv.push(parseFloat(tokens[1]));
                                uv.push(parseFloat(tokens[2]));
                            }

                            if (tokens[0] == "vn") {
                                normals.push(parseFloat(tokens[1]));
                                normals.push(parseFloat(tokens[2]));
                                normals.push(parseFloat(tokens[3]));
                            }

                            if (tokens[0] == "g") {
                                closeGroup();
                                var name = tokens[1];
                                var textureGroup = tokens[2];
                                openGroup(name, textureGroup);
                            }

                            if (tokens[0] == "f") {
                                if (!group) {
                                    openGroup("default", null); // Default group - default name, no texture group
                                }
                                parseFace(tokens);
                            }
                        }
                    }
                }
                closeGroup();

                /* Add to root a sibling "model" Symbol to all the group Symbol nodes that
                 * instantiates all the groups collectively
                 */
                openNode("symbol");
                addSID("model");
                for (var i = 0; i < groupNames.length; i++) {
                    openNode("instance")
                    modelSymbol.addNode(new SceneJS.Instance({ uri: groupNames[i] }));
                }

                if (mtllib) {

                    /* If an MTL file is referenced, then add an Instance node to the result subgraph,
                     * to load the material file. Attach a handler to the Instance to attach the
                     * OBJ subgraph as its next sibling when the Instance has finished loading.
                     * This is neccessary to ensure that the Instance nodes in the OBJ subgraph
                     * don't try to reference Symbols in the MTL subgraph before they are defined.
                     */
                    var root = new SceneJS.Node({
                        info: "obj"
                    });
                    root.addNode(new SceneJS.Instance({
                        info: "instance-mtl",
                        uri: dirURI + mtllib,             // Path to MTL
                        listeners: {
                            "state-changed" : {
                                fn: (function() {
                                    var added = false;
                                    var _node = node;
                                    var _root = root;
                                    return function(loadMTL) {
                                        if (loadMTL.getState() == SceneJS.Instance.STATE_READY && !added) {
                                            _root.addNode(_node);
                                            added = true;
                                        }
                                    };
                                })()
                            }
                        }
                    }));
                    return root;
                } else {
                    return node;
                }
                out(")");
            }

            function openGroup(name, textureGroup) {
                group = {
                    name: name,
                    textureGroup : textureGroup,
                    positions: [],
                    uv: [],
                    normals: [],
                    indices : [],
                    materialName : null
                };
                //  indexMap = [];
                index = 0;
            }

            /**
             * Closes group if open; adds a subgraph to the output, containing
             * a geometry wrapped in a Symbol. If the group has a material, then
             * the geometry is also wrapped in an instance that refers to the
             * material.
             */
            function closeGroup() {
                if (group) {
                    openNode("symbol");
                    writeStringProperty("info", "library_group");
                    writeStringProperty("sid", group.name);
                    if (group.materialName) {

                        /* If group has material then, assuming that an MTL file has been loaded,
                         * define geometry within an instance of the corresponding Material node
                         * that will (should) have been defined (within a Symbol node) when the
                         * MTL file was parsed.
                         */
                        openNode("instance");
                        writeStringProperty("info", "instance_material");
                        writeStringProperty("uri", "../" + group.materialName);
                    }
                    openNode("geometry");
                    writeStringProperty("info", "geometry");
                    writeStringProperty("primitive", "triangles");
                    writeArrayProperty("positions", group.positions);
                    writeArrayProperty("normals", group.normals);
                    writeArrayProperty("indices", group.indices);
                    writeArrayProperty("uv", group.uv);
                    closeNode();
                    if (group.materialName) {
                        closeNode();
                    }
                    closeNode();
                    groupNames.push(group.name);
                }
            }


            function parseFace(tokens) {
                var vert = null;             // Array of refs to pos/tex/normal for a vertex
                var pos = 0;
                var tex = 0;
                var nor = 0;
                var x = 0.0;
                var y = 0.0;
                var z = 0.0;

                var indices = [];
                for (var i = 1; i < tokens.length; ++i) {
                    if (!(tokens[i] in indexMap)) {
                        vert = tokens[i].split("/");

                        if (vert.length == 1) {
                            pos = parseInt(vert[0]) - 1;
                            tex = pos;
                            nor = pos;
                        }
                        else if (vert.length == 3) {
                            pos = parseInt(vert[0]) - 1;
                            tex = parseInt(vert[1]) - 1;
                            nor = parseInt(vert[2]) - 1;
                        }
                        else {
                            return;
                        }

                        x = 0.0;
                        y = 0.0;
                        z = 0.0;
                        if ((pos * 3 + 2) < positions.length) {
                            x = positions[pos * 3];
                            y = positions[pos * 3 + 1];
                            z = positions[pos * 3 + 2];
                        }
                        group.positions.push(x);
                        group.positions.push(y);
                        group.positions.push(z);

                        x = 0.0;
                        y = 0.0;
                        if ((tex * 2 + 1) < uv.length) {
                            x = uv[tex * 2];
                            y = uv[tex * 2 + 1];
                        }
                        group.uv.push(x);
                        group.uv.push(y);

                        x = 0.0;
                        y = 0.0;
                        z = 1.0;
                        if ((nor * 3 + 2) < normals.length) {
                            x = normals[nor * 3];
                            y = normals[nor * 3 + 1];
                            z = normals[nor * 3 + 2];
                        }
                        group.normals.push(x);
                        group.normals.push(y);
                        group.normals.push(z);

                        indexMap[tokens[i]] = index++;
                    }
                    indices.push(indexMap[tokens[i]]);
                }

                if (indices.length == 3) {

                    /* Triangle
                     */
                    group.indices.push(indices[0]);
                    group.indices.push(indices[1]);
                    group.indices.push(indices[2]);

                } else if (indices.length == 4) {

                    // TODO: Triangulate quads
                }
            }

            function openNode(name) {
                if (nodesOpen > 0) {
                    out("},");
                }
                out("SceneJS." + name + "({");
                nodesOpen++;
                propertiesInNode = 0;
            }

            function writeNumberProperty(name, value) {
                if (propertiesInNode > 0) {
                    out(",");
                }
                out(name + " : " + value);
                propertiesInNode++;
            }

            function addSID(value) {
                writeStringProperty("sid", value);
            }

            function writeStringProperty(name, value) {
                if (propertiesInNode > 0) {
                    out(",");
                }
                out(name + " : \"" + value + "\"");
                propertiesInNode++;
            }

            function writeArrayProperty(arrayName, array) {
                if (propertiesInNode > 0) {
                    out(",");
                }
                out(arrayName + " : [");
                for (var i = 0; i < array.length; i++) {
                    out(array[i]);
                }
                out("]");
                propertiesInNode++;
            }

            function closeNode() {
                if (nodesOpen > 0) {
                    out("}");
                    nodesOpen--;
                }
            }
        })();