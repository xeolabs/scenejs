SceneJS.Services.addService(
        SceneJS.Services.COMMAND_SERVICE_ID,
        (function() {
            var commands = {};
            return {

                addCommand: function(commandId, command) {
                    if (!command.execute) {
                        throw "SceneJS Command Service (ID '"
                                + SceneJS.Services.COMMAND_SERVICE_ID
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
                },

                executeCommand : function (params) {
                    if (!params) {
                        throw "sendMessage param 'message' null or undefined";
                    }
                    var commandId = params.command;
                    if (!commandId) {
                        throw "Message element expected: 'command'";
                    }
                    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
                    var command = commandService.getCommand(commandId);

                    if (!command) {
                        throw "Message command not supported: '" + commandId + "' - perhaps this command needs to be added to the SceneJS Command Service?";
                    }
                    command.execute(params);
                }
            };
        })());

SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID).addCommand("create",
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
    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

    commandService.addCommand("update", {
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
                    commandService.executeCommand(messages[i]);
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

