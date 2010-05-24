/**
 * Backend that parses a .OBJ files into a SceneJS nodes.
 * @private
 */
var SceneJS_objParserModule = new (function() {
    var node = null;
    var positions = [];
    var uv = [];
    var normals = [];
    var group = null;
    var index = 0;
    var indexMap = [];

    function openGroup(name, textureGroup) {
        group = {
            name: name,
            textureGroup : textureGroup,
            positions: [],
            uv: [],
            normals: [],
            indices : []

        };
        //  indexMap = [];
        index = 0;
    }

    function closeGroup() {
        if (group) {

            /* Create a geometry node, wrapped in a name node corresponding to the group
             */
            var name = new SceneJS.Name({
                name: group.name
            });

            name.addNode(new SceneJS.Geometry({
                primitive: "triangles",
                positions: group.positions,
                normals: group.normals,
                indices: group.indices,
                uv: group.uv
            }));
            node.addNode(name);
        }
    }

    function getLines(text) {
        var tokens = text.split("\n");
        var n = tokens.length;
        var line = null;
        var lines = [ ];
        for (var i = 0; i < n; ++i) {
            line = tokens[i].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
            if (line.length > 0) {
                lines.push(line);
            }
        }
        return lines;
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

    /**
     * @param text File content
     * @private
     */
    this.parse = function(text) {
        node = new SceneJS.Node();
        //var lines = getLines(text);
        var lines = text.split("\n");
        var tokens;

        for (var i in lines) {
            var line = lines[i];
            if (line.length > 0) {
                line = lines[i].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
                tokens = line.split(" ");
                if (tokens.length > 0) {
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
                            openGroup(null, null); // Default group - no name or texture group
                        }
                        parseFace(tokens);
                    }
                }
            }
        }

        closeGroup();
        return node;
    };
})();