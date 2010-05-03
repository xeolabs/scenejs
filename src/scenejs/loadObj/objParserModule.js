/**
 * Backend that parses a .OBJ files into a SceneJS nodes.
 * @private
 */
var SceneJS_objParserModule = new (function() {
    var node = null;
    var positions = [];
    var uv = [];
    var normals = [];
    var objects = [];
    var indices = [];
    var group = null;

    function openGroup(name, textureGroup) {
        group = {
            name: name,
            textureGroup : textureGroup,
            positions: [],
            uv: [],
            normals: [],
            indices : []
        };
    }

    function closeGroup() {
        if (group) {

            /* Create a geometry node, wrapped in a name node corresponding to the group
             */
            var name = new SceneJS.Name({
                name: group.name
            });

            //            var rotate = new SceneJS.rotate({angle : 45, z: 1 });
            //
            //            name.addNode(rotate);

            //   alert(group.name);
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

    function parseArray(str) {
        return str.replace(/\s+/g, " ").replace(/^\s+/g, "").split(" ");
    }

    function faceNormal(ai, bi, ci) {

        var a = [group.positions[ai], group.positions[ai + 1], group.positions[ai + 2]];
        var b = [group.positions[bi], group.positions[bi + 1], group.positions[bi + 2]];
        var c = [group.positions[ci], group.positions[ci + 1], group.positions[ci + 2]];
        var dir = SceneJS_math_cross3Vec3(SceneJS_math_subVec3(b, a), SceneJS_math_subVec3(c, a));
        return SceneJS_math_normalizeVec3(dir);
    }

    function parseFace(tokens) {
        var verts = [];
        for (var i = 1; i < tokens.length; i++) {
            var triple = tokens[i].split("/");


            /* Position
             */
            var vertIndex = parseInt(triple[0]) - 1;
            group.positions.push(positions[vertIndex * 3]);
            group.positions.push(positions[(vertIndex * 3) + 1]);
            group.positions.push(positions[(vertIndex * 3) + 2]);

            verts.push((group.positions.length / 3) - 1);

            /* Normal
             */
            if (triple[2].length > 0) {
                var normalIndex = parseInt(triple[2]) - 1;
                var a = normals[normalIndex * 3];
                var b = normals[(normalIndex * 3) + 1];
                var c = normals[(normalIndex * 3) + 2];

//                group.normals.push(-a);
//                group.normals.push(-b);
//                group.normals.push(-c);
            }
            //
            //


            //            /* UV
            //             */
            //            if (triple[1].length > 0) {
            //                var uvIndex = parseInt(triple[1]) - 1;
            //                //  alert("UV: " + uvIndex);
            //                if (!group.uvMap[uvIndex]) {
            //                    //  alert("not indexed");
            //                    group.uv.push(uv[uvIndex*2]);
            //                    group.uv.push(uv[uvIndex*2 + 1]);
            //                    group.uvMap[uvIndex] = (group.uv.length / 2) - 1;
            //                } else {
            //                    //  alert("indexed");
            //                }
            //                vert.texture = group.uvMap[uvIndex];
            //            }
            //

            //            /* Normal
            //             */
            //            if (triple[2].length > 0) {
            //                var normalIndex = parseInt(triple[2]) - 1;
            //                if (!group.normalsMap[normalIndex]) {
            //                    group.normals.push(normals[normalIndex * 3]);
            //                    group.normals.push(normals[normalIndex * 3 + 1]);
            //                    group.normals.push(normals[normalIndex * 3 + 2]);
            //                    group.normalsMap[normalIndex] = (group.normals.length / 3) - 1;
            //                }
            //                vert.normal = group.normalsMap[normalIndex];
            //            }
        }


        if (verts.length == 3) {
            var normal = faceNormal(verts[0], verts[1], verts[2]);
            for (var i = 0; i < 3; i++) {
                //                group.normals.push(normal[2]);
                //                group.normals.push(normal[1]);
                //                group.normals.push(normal[0]);
            }

            group.indices.push(verts[2]);
            group.indices.push(verts[1]);
            group.indices.push(verts[0]);

        }
        else if (verts.length == 4) {
            var normal = faceNormal(verts[0], verts[1], verts[2]);
            for (var i = 0; i < 6; i++) {
                //                group.normals.push(normal[0]);
                //                group.normals.push(normal[1]);
                //                group.normals.push(normal[2]);
            }
            group.indices.push(verts[2]);
            group.indices.push(verts[1]);
            group.indices.push(verts[0]);
//            group.indices.push(verts[2]);
//            group.indices.push(verts[0]);
//            group.indices.push(verts[3]);
        }
    }

    /**
     * @param text File content
     * @private
     */
    this.parse = function(text) {
        node = new SceneJS.Node();
        var lines = getLines(text);
        var tokens;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.length > 0) {
                tokens = parseArray(line);
                if (tokens.length > 0) {
                    var token0 = tokens[0];

                    if (token0 == "v") { // vertex
                        positions.push(parseFloat(tokens[1]));
                        positions.push(parseFloat(tokens[2]));
                        positions.push(parseFloat(tokens[3]));
                    }
                    if (token0 == "vt") {
                        uv.push(parseFloat(tokens[1]));
                        uv.push(parseFloat(tokens[2]));
                    }

                    if (token0 == "vn") {
//                        normals.push(parseFloat(tokens[1]));
//                        normals.push(parseFloat(tokens[2]));
//                        normals.push(parseFloat(tokens[3]));
                    }

                    if (token0 == "g") {
                        closeGroup();
                        var name = tokens[1];
                        var textureGroup = tokens[2];
                        openGroup(name, textureGroup);
                    }

                    if (token0 == "f") { // TODO: Triangulate polygon in OBJ parser
                        parseFace(tokens);
                    }
                }
            }
        }

        closeGroup();
        return node;
    };
})();