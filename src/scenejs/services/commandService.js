SceneJS.Services.addService(
        SceneJS.Services.COMMAND_SERVICE_ID,
        (function() {
            var commands = {};
            return {

                addCommand: function(commandId, command) {
                    if (!command.execute) {
                        throw  SceneJS_errorModule.fatalError("SceneJS Command Service (ID '"
                                + SceneJS.Services.COMMAND_SERVICE_ID
                                + ") requires an 'execute' method on your '" + commandId + " command implementation");
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

                executeCommand : function (ctx, params) {
                    if (!params) {
                        throw  SceneJS_errorModule.fatalError("sendMessage param 'message' null or undefined");
                    }
                    var commandId = params.command;
                    if (!commandId) {
                        throw  SceneJS_errorModule.fatalError("Message element expected: 'command'");
                    }
                    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
                    var command = commandService.getCommand(commandId);

                    if (!command) {
                        throw  SceneJS_errorModule.fatalError("Message command not supported: '" + commandId + "' - perhaps this command needs to be added to the SceneJS Command Service?");
                    }
                    command.execute(ctx, params);
                }
            };
        })());


(function() {
    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

    function createNodes(scene, target, nodes) {
        var node;
        var targetNode;
        for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            if (target) {
                targetNode = scene.findNode(target);
                if (!targetNode) {
                    continue;
                }
                targetNode.add("node", nodes[i]);
            } else {
                scene.addNode(nodes[i]);
            }
        }
    }

    commandService.addCommand("create",
            (function() {
                return {
                    execute: function(ctx, params) {
                        var nodes = params.nodes;

                        if (nodes) {

                            var target = params.target;
                            var scenes;
                            var scene;

                            if (ctx.scenes) {
                                scenes = ctx.scenes;
                                for (var i = 0, len = scenes.length; i < len; i++) {
                                    scene = scenes[i];
                                    if (scene) { // Scene might have been blown away by some other command
                                        createNodes(scene, target, nodes);
                                    }
                                }

                            } else {
                                scenes = SceneJS._scenes;
                                for (var sceneId in scenes) {
                                    if (scenes.hasOwnProperty(sceneId)) {
                                        scene = scenes[sceneId];
                                        if (scene) { // Scene might have been blown away by some other command
                                            createNodes(scene, target, nodes);
                                        }
                                    }
                                }
                            }

                        }
                    }
                };
            })());

    function updateNode(scene, target, params) {
        var targetNode = scene.findNode(target);
        if (!targetNode) { // Node might have been blown away by some other command
            return;
        }
        var sett = params["set"];
        if (sett) {
            callNodeMethods("set", sett, targetNode);
        }
        if (params.insert) {
            callNodeMethods("insert", params.insert, targetNode);
        }
        if (params.inc) {
            callNodeMethods("inc", params.inc, targetNode);
        }
        if (params.dec) {
            callNodeMethods("dec", params.dec, targetNode);
        }
        if (params.add) {
            callNodeMethods("add", params.add, targetNode);
        }
        if (params.remove) {
            callNodeMethods("remove", params.remove, targetNode);
        }
    }

    commandService.addCommand("update", {
        execute: function(ctx, params) {

            var i, len;
            var scenes;
            var target = params.target;
            var scene;

            if (ctx.scenes) {
                scenes = ctx.scenes;
                for (i = 0, len = scenes.length; i < len; i++) {
                    scene = scenes[i];
                    if (scene) { // Scene might have been blown away by some other command
                        updateNode(scene, target, params);
                    }
                }

            } else {

                scenes = SceneJS._scenes;
                for (var sceneId in scenes) {
                    if (scenes.hasOwnProperty(sceneId)) {
                        scene = scenes[sceneId];
                        if (scene) { // Scene might have been blown away by some other command
                            updateNode(scene, target, params);
                        }
                    }
                }
            }

            /* Further messages
             */
            var messages = params.messages;
            if (messages && messages.length > 0) {
                for (i = 0; i < messages.length; i++) {
                    commandService.executeCommand(ctx, messages[i]);
                }
            }
        }
    });

    commandService.addCommand("selectScenes", {
        execute: function(ctx, params) {

            var i, len;
            var scenes = params.scenes;
            if (scenes) {

                /* Filter out the scenes that actually exist so sub-commands don't have to check
                 */
                var existingScenes = [];
                var sceneId;
                var scene;
                for (i = 0, len = scenes.length; i < len; i++) {
                    sceneId = scenes[i];
                    if (SceneJS._scenes[sceneId]) {
                        existingScenes.push(SceneJS.scene(sceneId));
                    }
                }
                ctx = SceneJS._shallowClone(ctx);   // Feed scenes into command context for sub-messages
                ctx.scenes = existingScenes;
            }

            /* Further messages
             */
            var messages = params.messages;
            if (messages) {
                for (i = 0; i < messages.length; i++) {
                    commandService.executeCommand(ctx, messages[i]);
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

