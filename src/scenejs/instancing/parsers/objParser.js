/**
 * Backend that parses an .OBJ file into a SceneJS subgraph.
 *
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
    var mtllib;

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
     * a geometry wrapped in a name. If the group has a material, then
     * the geometry is also wrapped in an instance that refers to the
     * material.
     */
    function closeGroup() {
        if (group) {
            var name = new SceneJS.Name({
                name: group.name
            });
            var geometry = new SceneJS.Geometry({
                primitive: "triangles",
                positions: group.positions,
                normals: group.normals,
                indices: group.indices,
                uv: group.uv
            });
            if (group.materialName) {

                /* If group has material then, assuming that an MTL file has been loaded,
                 * define geometry within an instance of the corresponding Material node
                 * that will (should) have been defined (within a Symbol node) when the
                 * MTL file was parsed.
                 */
                name.addNode(
                        new SceneJS.Instance({
                            name: "../" + group.materialName },  // Back up a level out of group's Name 
                                geometry));
            } else {
                name.addNode(geometry);
            }
            node.addNode(name);
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

    /**
     * @param text File content
     * @private
     */
    this.parse = function(uri, text) {
        var dirURI = uri.substring(0, uri.lastIndexOf("/") + 1);

        node = new SceneJS.Node();
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
                            openGroup(null, null); // Default group - no name or texture group
                        }
                        parseFace(tokens);
                    }
                }
            }
        }

//        calculate_normals : function(verts) {
//202	    var norms = [];
//203	    for (var i=0; i<verts.length; i+=9) {
//204	      var normal = this.find_normal(
//205	        verts[i  ], verts[i+1], verts[i+2],
//206	        verts[i+3], verts[i+4], verts[i+5],
//207	        verts[i+6], verts[i+7], verts[i+8]);
//208	      for (var j=0; j<3; j++) {
//209	        norms.push(normal[0]);
//210	        norms.push(normal[1]);
//211	        norms.push(normal[2]);
//212	      }
//213	    }
//214	    return norms;
//215	  },
//216
//217	  find_normal : function(x0,y0,z0, x1,y1,z1, x2,y2,z2) {
//218	    var u = [x0-x1, y0-y1, z0-z1];
//219	    var v = [x1-x2, y1-y2, z1-z2];
//220	    var w = [x2-x0, y2-y0, z2-z0];
//221	    var n = Vec3.cross(u,v);
//222	    if (Vec3.lengthSquare(n) == 0)
//223	      n = Vec3.cross(v,w);
//224	    if (Vec3.lengthSquare(n) == 0)
//225	      n = Vec3.cross(w,u);
//226	    if (Vec3.lengthSquare(n) == 0)
//227	      n = [0,0,1];
//228	    return Vec3.normalize(n);
//229	  }
//230
        closeGroup();

        if (mtllib) {

            /* If an MTL file is referenced, then add a LoadMTL node to the result subgraph,
             * to load the material file. Attach a handler to the LoadMTL to attach the
             * OBJ subgraph as its next sibling when the LoadMTL has finished loading.
             * This is neccessary to ensure that the Instance nodes in the OBJ subgraph
             * don't try to reference Symbols in the MTL subgraph before they are defined.
             */

            //  alert(dirURI + mtllib)
            var root = new SceneJS.Node();

            root.addNode(new SceneJS.LoadMTL({
                uri: dirURI + mtllib, // Path to MTL
                listeners: {
                    "state-changed" : {
                        fn: (function() {
                            var added = false;
                            var _root = root;
                            var _node = node;
                            return function(loadMTL) {
                                if (loadMTL.getState() == SceneJS.Instance.STATE_RENDERED && !added) {
                                    _root.addNode(_node);
                                    added = true;
                                }
                            };
                        })()
                    }
                }
            })
                    );
            return root;
        } else {
            return node;
        }
    };
})();