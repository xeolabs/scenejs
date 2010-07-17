/**
 * Backend that parses .BVH files
 * @private
 */
(function() {

    var uri;
    var dirURI;
    var options;
    var debugCfg;
    var tokens;
    var lines;
    var line;
    var lineNum;
    var lineIdx;
    var channelCount;
    var symbolUriStack;

    SceneJS._loadModule.registerParser("bvh", {
        serverParams: {
            format: "xml" // IE. text
        },
        parse: function(cfg) {
            uri = cfg.uri;
            dirURI = cfg.uri.substring(0, cfg.uri.lastIndexOf("/") + 1);
            options = cfg.options;
            debugCfg = SceneJS._debugModule.getConfigs("instancing.bvh") || {};
            return _parse(cfg.data);
        }
    });

    function _parse(text) {
        var node = new SceneJS.Node();
        lines = text.split("\n");
        lineIdx = 0;
        lineNum = 0;
        channelCount = 0;
        symbolUriStack = [];
        nextLine(node);
        return node;
    }

    var handlers = {

        "HIERARCHY" : function(node) {
            nextLine(node);
        },

        "ROOT" : function(node) {
            nextLine(node.addNode(new SceneJS.Instance({ info: "ROOT", uri: tokens[1] })));
        },

        "OFFSET" : function(node) {
            nextLine(node.addNode(new SceneJS.Translate({ info: "OFFSET", x: tokens[1], y: tokens[2], z: tokens[3] })));
        },

        "CHANNELS" : function(node) {
            var nChannels = tokens[1];
            var channel;
            for (var i = 0; i < nChannels; i++) {
                channel = tokens[i + 2];
                switch (channel) {
                    case "Xposition":
                        node = node.addNode(new SceneJS.Translate({ info: "Xposition" }, getCallback("x")));
                        break;
                    case "Yposition":
                        node = node.addNode(new SceneJS.Translate({ info: "Yposition" }, getCallback("y")));
                        break;
                    case "Zposition":
                        node = node.addNode(new SceneJS.Translate({ info: "Zposition" }, getCallback("z")));
                        break;
                    case "Zrotation":
                        node = node.addNode(new SceneJS.Rotate({ info: "Zrotation", z : 1 }, getCallback("angle")));
                        break;
                    case "Xrotation":
                        node = node.addNode(new SceneJS.Rotate({ info: "Xrotation", x : 1 }, getCallback("angle")));
                        break;
                    case "Yrotation":
                        node = node.addNode(new SceneJS.Rotate({ info: "Yrotation", y : 1 }, getCallback("angle")));
                        break;
                    default:
                        SceneJS._loggingModule.warn("Unsupported .BVH channel on line " + lineNum + ": " + channel);
                }
            }
            nextLine(node);
        },

        "JOINT" : function(node) {
            symbolUriStack.push(tokens[1]);
            nextLine(node.addNode(new SceneJS.Node({ info: "JOINT" })));
        },

        "{" : function(node) {
            nextLine(node);
        },

        "End" : function(node) {
            nextLine(node.addNode(new SceneJS.Instance({ info: "END", uri: tokens[1] })));
        },

        "}" : function(node) {
            if (symbolUriStack.length > 0) {
                node = node.addNode(new SceneJS.Instance({ info: "INSTANCE_BONE", uri: symbolUriStack.pop() }));
            }
        },

        "MOTION": function(node) {

        }
    };

    function getCallback(key) {
        var _channel = "" + channelCount++;
        return function(data) {
            var cfg = {};
            cfg[key] = data.get(_channel);
            return cfg;
        };
    }

    function nextLine(node) {
        if (lineIdx < lines.length) {
            lineNum++;
            line = lines[lineIdx++];
            if (line.length > 0) {
                line = line.replace(/^\s+|\s+$/g, "").replace(/^\s+|\t|\s+$/g, ' ');
                tokens = line.split(" ");
                if (tokens.length > 0) {
                    var handler = handlers[tokens[0]];
                    if (handler) {
                        handler(node);
                    } else {
                        SceneJS._loggingModule.warn("Unrecognised .BVH token '" + tokens[0] + "' on line : " + lineNum);
                        nextLine(node);
                    }
                }
            }
        }
    }

})();