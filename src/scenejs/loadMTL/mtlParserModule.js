/**
 * Backend that parses a .MTL files into a SceneJS.Material nodes
 * @private
 */
var SceneJS_mtlParserModule = new (function() {
    var materialData;
    var node = null;
    var tokens;
    var line;
    var lineNum;

    function reset() {
        materialData = null;
    }

    function parseColor(tokens) {
        return { r: parseFloat(tokens[1]), g: parseFloat(tokens[2]), b: parseFloat(tokens[3]) };
    }

    function unsupported(msg) {
        SceneJS_loggingModule.warn("Unsupported MTL file token(s): " + msg + " - ignoring line " + lineNum);
    }

    function openMaterial() {
        if (materialData) {
            closeMaterial();
        }
        materialData = {
            name: tokens[1]
        };
    }

    function closeMaterial() {
        alert(materialData.name)
        var symbol = new SceneJS.Symbol({
            name: materialData.name
        });
        var material = new SceneJS.Material({
              baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                                    specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                                    specular:       0.9,
                                    shine:          6.0
        });
        if (materialData.hasTexture) {
            material.addNode(new SceneJS.Texture({

            }));
        }
        symbol.addNode(material);
        node.addNode(symbol);
        materialData = null;
    }

    var handlers = {
        "newmtl" : openMaterial,

        "Ka" : function() {
            if (tokens[1] = "spectral") {
                unsupported("Ka spectral");
            } else {
                materialData.color = parseColor(tokens);
            }
        },

        "Kd" : function() {
            materialData.color = parseColor(tokens);
        },

        "Ks" : function() {
            materialData.specularColor = parseColor(tokens);
        },

        "Ns" : function() {
            materialData.specular = tokens[1];
        },

        "map_Ka" : function() {

        }
    };

    /**
     * @param text File content
     * @private
     */
    this.parse = function(text) {

        reset();

        node = new SceneJS.Node();
        var lines = text.split("\n");
        var handler;

        for (var i in lines) {
            lineNum = i + 1;
            line = lines[i];
            if (line.length > 0) {
                line = lines[i].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
                tokens = line.split(" ");
                if (tokens.length > 0) {
                    handler = handlers[tokens[0]];
                    if (handler) {
                        handler();
                    } else {
                        unsupported(tokens[0]);
                    }
                }
            }
        }

        if (materialData) {
            closeMaterial();
        }

        return node;
    };
})();