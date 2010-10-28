SceneJS.Services.addService(
        SceneJS.Services.COMMAND_SERVICE,
        (function() {
            var commands = {};
            return {

                addCommand: function(commandId, command) {
                    if (!command.execute) {
                        throw "SceneJS Command Service (ID '"
                                + SceneJS.Services.COMMAND_SERVICE
                                + ") requires an 'execute' method on your '" + commandId + " command implementation";
                    }
                    commands[commandId] = command;
                },

                hasCommand: function(commandId) {
                    var command = commands[commandId];
                    return (command != null && command != undefined);
                },

                getCommand: function(commandId) {
                    return commands[commandId];
                }
            };
        })());

SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE).addCommand("create",
        (function() {
            return {
                execute: function(params) {
                    var nodes = params.nodes;
                    if (nodes) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (!nodes[i].id) {
                                throw "Message 'create' must have ID for new node";
                            }
                            SceneJS.createNode(nodes[i]);
                        }
                    }
                }
            };
        })());

(function() {
    SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE).addCommand("update", {
        execute: function(params) {
            var target = params.target;
            if (target) {
                if (!SceneJS.nodeExists(target)) {
                    throw "Message 'update' target node not found: " + target;
                }
                var targetNode = SceneJS.withNode(target);
                var sett = params["set"];
                if (sett) {
                    callNodeMethods("set", sett, targetNode);
                }
                if (params.insert) {
                    callNodeMethods("insert", params.insert, targetNode);
                }
                if (params.add) {
                    callNodeMethods("add", params.add, targetNode);
                }
                if (params.remove) {
                    callNodeMethods("remove", params.remove, targetNode);
                }
            }

            SceneJS._nodeIDMap[params.target]._fireEvent("updated", { }); // TODO: only if listener exists; and buffer events

            /* Further messages
             */
            var messages = params.messages;
            if (messages) {
                for (var i = 0; i < messages.length; i++) {
                    SceneJS.sendMessage(messages[i]);
                }
            }
        }
    });

    function callNodeMethods(prefix, attr, targetNode) {
        for (var key in attr) {
            if (attr.hasOwnProperty(key)) {
                targetNode[prefix](attr);
            }
        }
    }
})();

