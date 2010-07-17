/**
 * Backend that parses a .MTL files into a SceneJS.Material nodes
 * @private
 */
(function() {

    var uri;
    var dirURI;
    var options;
    var debugCfg;
    var materialData;
    var node = null;
    var tokens;
    var line;
    var lineNum;


    SceneJS._loadModule.registerParser("mtl", {

        serverParams: {
            format: "xml" // IE. text
        },

        parse: function(cfg) {
            reset();
            uri = cfg.uri;
            dirURI = cfg.uri.substring(0, cfg.uri.lastIndexOf("/") + 1);
            options = cfg.options;
            debugCfg = SceneJS._debugModule.getConfigs("instancing.mtl") || {};
            return _parse(cfg.data);
        }
    });

    function reset() {
        materialData = null;
    }

    /**
     * Handler mapped to first token on each line. Each of these read the tokens
     * that have been parsed from the current line.
     */
    var handlers = {

        /**
         *
         */
        "newmtl" : openMaterial,

        /**
         * Phong specular component. Ranges from 0 to 1000.
         */
        "Ns" : function() {
            materialData.cfg.specular = parseFloat(tokens[1]);
        },

        /**
         * Diffuse color weighted by the diffuse coefficient.
         */
        "Kd" : function() {
            materialData.cfg.baseColor = parseColor(tokens);
        },

        /**
         * Ambient color weighted by the ambient coefficient.
         */
        "Ka" : function() {
            if (tokens[1] = "spectral") {
                unsupported("Ka spectral");
            } else {
                //materialData.color = parseColor(tokens);
            }
        },

        /**
         * Specular color weighted by the specular coefficient.
         */
        "Ks" : function() {
            materialData.cfg.specularColor = parseColor(tokens);
        },

        /**
         * Dissolve factor (pseudo-transparency).
         * Values are from 0-1. 0 is completely transparent, 1 is opaque.
         */
        "d" : function() {
            unsupported(tokens[0] + " (dissolve factor / pseudo-transparency)");
        },

        /**
         * Ni = Refraction index. Values range from 1 upwards.
         * A value of 1 will cause no refraction. A higher value implies refraction.
         */
        "Ni" : function() {
            unsupported(tokens[0] + " (refraction index)");
        },

        /**
         * Select which lighting types enabled - (0, 1, or 2) 0 to disable lighting, 1 for ambient & diffuse only
         * (specular color set to black), 2 for full lighting
         */
        "illum" : function() {
            unsupported(tokens[0] + " (lighting mode)");
        },

        /**
         *
         */
        "sharpness" : function() {
            unsupported(tokens[0]);
        },

        /**
         * Reflection type and filename
         */
        "refl" : function() {
            unsupported(tokens[0] + " (reflection)");
        },

        /**
         * Ambient color texture map
         */
        "map_Ka" : function() {
            unsupported(tokens[0] + " (ambient color texture map)");
        },

        /**
         * Diffuse color texture map
         */
        "map_Kd" : function() {
            parseTexture("diffuse");
        },

        /**
         * Specular color texture map
         */
        "map_Ks" : function() {
            parseTexture("specular");
        },

        /**
         * Bump texture map
         */
        "map_Bump" : function() {
            unsupported(tokens[0] + " (bump texture map)");
        },

        /**
         * Opacity texture map
         */
        "map_d" : function() {
            unsupported(tokens[0] + " (opacity texture map)");
        },

        /**
         * Comment
         */
        "#" : function() {

        }
    };

    function parseColor(tokens) {
        return { r: parseFloat(tokens[1]), g: parseFloat(tokens[2]), b: parseFloat(tokens[3]) };
    }

    function unsupported(msg) {
        SceneJS._loggingModule.warn("Unsupported .MTL file feature on line " + lineNum + ": " + msg);
    }

    function openMaterial() {
        if (materialData) {
            closeMaterial();
        }
        materialData = {
            symbolSID: tokens[1],
            cfg : {
            },
            textureLayers: []
        };
    }

    function parseTexture(applyTo) {
        var textureLayer = {
            uri: dirURI + tokens[tokens.length - 1] ,
            applyto: applyTo
        };
        var tok;
        for (var i = 1; i < tokens.length - 1; i++) {
            tok = tokens[i];
            if (tok.charAt(0) == "-") {

                /* Texture option
                 */
                if (tok == "-blendu") {

                } else if (tok == "-blendv") {

                } else if (tok == "-blendu") {

                } else if (tok == "-cc") {

                } else if (tok == "-clamp") {

                } else if (tok == "-mm") {

                } else if (tok == "-o") {

                } else if (tok == "-s") {

                } else if (tok == "-t") {

                } else if (tok == "-texres") {

                } else {
                    unsupported(tokens[0] + " option '" + tok + "'");
                }
            }
        }
        materialData.textureLayers.push(textureLayer);
    }

    function closeMaterial() {
        var symbol = new SceneJS.Symbol({
            info: "symbol_material",
            sid: materialData.symbolSID
        });
        materialData.cfg.info = "material";
        var material = new SceneJS.Material(materialData.cfg);
        if (materialData.textureLayers.length > 0) {
            material.addNode(new SceneJS.Texture({
                info: "texture",
                layers: materialData.textureLayers
            }));
        }
        symbol.addNode(material);
        node.addNode(symbol);
        materialData = null;
    }

    function _parse(text) {
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
    }
})();