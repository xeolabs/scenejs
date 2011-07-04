(function() {

    const BIND_SERVICE_ID = "_bind_service";

    if (SceneJS.Services.hasService(BIND_SERVICE_ID)) {
        return;
    }

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

    var bindService;

    SceneJS.Services.addService(

            BIND_SERVICE_ID,

            bindService = (function() {

                var time;

                /* triggers in which which messages can run
                 */
                var triggers = {
                    "interval": {           // At timed intervals
                        bindings: {}
                    },
                    "init": {               // When SceneJS initilises
                        bindings: {}
                    },
                    "error": {              // On error
                        bindings: {}
                    },
                    "reset": {              // When SceneJS resets
                        bindings: {}
                    },
                    "scene-rendering": {    // When a scene begins a rendering traversal
                        bindings: {},
                        nodeBindings: {}
                    },
                    "scene-rendered": {     // When a scene finishes a rendering traversal
                        binding: {}
                    },

                    "node-created": {       // When a node instance is created
                        nodeBindings: {},       //    Bindings for particular target nodes
                        bindings: {}            //    Bindings for any nodes this event occurs on
                    },

                    "node-destroyed": {     // When a node instance is destroyed
                        nodeBindings: {},       //    Bindings for particular target nodes
                        bindings: {}            //    Bindings for any nodes this event occurs on
                    },

                    "node-updated": {       // When a node instance is updated
                        nodeBindings: {},       //    Bindings for particular target nodes
                        bindings: {}            //    Bindings for any nodes this event occurs on
                    },

                    "node-rendering": {       // When a node is about to render
                        nodeBindings: {},         //    Bindings for particular target nodes
                        bindings: {}              //    Bindings for any nodes this event occurs on
                    },

                    "node-rendered": {        // When a node has finished rendering
                        nodeBindings: {},         //    Bindings for particular target nodes
                        bindings: {}              //    Bindings for any nodes this event occurs on
                    }
                    //                    ,
                    //
                    //                    "node-state-changed": {   // When a node declares an explicit state change
                    //                        nodeBindings: {},         //    Bindings for particular target nodes
                    //                        bindings: {}              //    Bindings for any nodes thia event occurs on
                    //                    }
                };


                /* Receive time update
                 */
                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.TIME_UPDATED,
                        function(t) {
                            time = t;
                        });

                /* When SceneJS initialised, get the command service and
                 * execute commands for this trigger
                 */
                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.INIT,
                        function() {
                            commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
                            runBindings("init");
                        });

                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.RESET,
                        function() {
                            runBindings("reset");
                        });

                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.ERROR,
                        function(params) {
                            runBindings("error");
                        });

                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.SCENE_COMPILING,
                        function(params) {
                            runIntervalBindings();
                            runBindings("scene-rendering", {
                                nodeId: params.nodeId,
                                canvas: params.canvas
                            });
                        });
              
                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.NODE_CREATED,
                        function(params) {
                            runBindings("node-created", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.NODE_UPDATED,
                        function(params) {
                            runBindings("node-updated", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS_eventModule.addListener(
                        SceneJS_eventModule.NODE_DESTROYED,
                        function(params) {
                            runBindings("node-destroyed", {
                                nodeId: params.nodeId
                            });
                        });


                /** Run bindings that execute at timed intervals
                 */
                function runIntervalBindings() {
                    //                    var trigger = triggers["interval"];
                    //                    var binding;
                    //                    var interval;
                    //                    var elapsed;
                    //                    for (var id in trigger) {
                    //                        if (trigger.hasOwnProperty(id)) {
                    //                            binding = trigger[id];
                    //                            interval = binding.triggers.interval;
                    //                            if (binding.interval._startAt == 0) {
                    //                                commandService.executeCommand(binding.message);
                    //                                if (interval.once) {
                    //                                    this.unbind(binding);
                    //                                }
                    //                            } else {
                    //                                if (!interval._started) {              // Starting this binding now
                    //                                    interval._started = time;
                    //                                } else {
                    //                                    elapsed = interval._started - time;
                    //                                    if (elapsed > interval._startAt) {              // At execution interval
                    //                                        commandService.executeCommand(binding.message); // execute binding
                    //                                        if (interval.once) {
                    //                                            this.unbind(binding);                   // one-shot - unschedule for this trigger
                    //                                        } else {
                    //                                            interval._started = time;               // repeating, ready to go again
                    //                                        }
                    //                                    }
                    //                                }
                    //                            }
                    //                        }
                    //                    }
                }


                /*
                 */
                function runBindings(triggerName, params) {
                    if (params && params.nodeId) {
                        var nodeBindings = triggers[triggerName].nodeBindings;
                        var binding = nodeBindings[params.nodeId];
                        if (binding) {
                            if (!binding.message.trigger) {
                                binding.message.trigger = {
                                    trigger: triggerName,
                                    nodeId: params.nodeId
                                };
                            }
                            commandService.executeCommand({}, binding.message);
                            //                            if (binding.trigger.once) {
                            //                                nodeBindings[params.nodeId] = undefined;
                            //                                bindings[binding.bindId] = undefined;
                            //                            }
                            return;
                        }
                    }
                    var bindings = triggers[triggerName].bindings;
                    for (var bindId in bindings) {
                        if (bindings.hasOwnProperty(bindId)) {
                            var binding = bindings[bindId];
                            if (!binding.message.trigger) {
                                binding.message.trigger = {
                                    trigger: triggerName
                                };
                            }
                            commandService.executeCommand(binding.message);
                            //                            if (binding.trigger.once) {
                            //                                bindings[bindId] = undefined;
                            //                            }
                        }
                    }
                }

                return {

                    bind: function(binding) {
                        if (!binding.bindId) {
                            throw "binding element missing: bindId";
                        }
                        if (!binding.triggers) {
                            throw "binding '" + binding.bindId + "' element missing: triggers";
                        }
                        if (!binding.message) {
                            throw "binding '" + binding.bindId + "' element missing: message";
                        }
                        var trigger;
                        for (var triggerName in binding.triggers) {
                            if (binding.triggers.hasOwnProperty(triggerName)) {
                                if (!triggers[triggerName]) {
                                    throw "binding '" + binding.bindId + "' trigger not supported: '" + triggerName + "'";
                                }
                                trigger = binding.triggers[triggerName];
                                switch (triggerName) {
                                    case "interval":
                                        var startAt = 0;
                                        if (trigger.interval.hours) {
                                            startAt += trigger.interval.hours * 3600000;
                                        }
                                        if (trigger.interval.minutes) {
                                            startAt += trigger.interval.minutes * 60000;
                                        }
                                        if (trigger.interval.seconds) {
                                            startAt += trigger.interval.minutes * 1000;
                                        }
                                        trigger.interval._startAt = startAt;
                                        triggers[triggerName] = binding;
                                        break;

                                    case "interval":
                                    case "init":
                                    case "error":
                                    case "reset":
                                        addBinding(triggerName, binding);
                                        break;

                                    case "scene-rendering":
                                    case "scene-rendered":
                                    case "node-created":
                                    case "node-destroyed":
                                    case "node-updated":
                                    case "node-rendering":
                                    case "node-rendered":
                                        addBindingForTarget(triggerName, binding);
                                        break;
                                }
                            }
                        }
                    },

                    unbind: function(binding) {
                        for (var trigger in binding.triggers) {
                            if (binding.triggers.hasOwnProperty(trigger)) {
                                triggers[triggers][binding.id] = undefined;
                            }
                        }
                    }
                };

                function addBinding(triggerName, binding) {
                    var trigger = binding.triggers[triggerName];
                    triggers[triggerName].bindings[binding.bindId] = binding;
                }

                function addBindingForTarget(triggerName, binding) {
                    var trigger = binding.triggers[triggerName];
                    var nodeId = trigger.nodeId;
                    if (nodeId) {
                        triggers[triggerName].nodeBindings[nodeId] = binding;
                    }
                    triggers[triggerName].bindings[binding.bindId] = binding;
                }
            })());

    commandService.addCommand("bind",
            (function() {
                return {
                    execute: function(params) {
                        bindService.bind(params);
                    }
                };
            })());

    commandService.addCommand("unbind",
            (function() {
                return {
                    execute: function(params) {
                        bindService.unbind(params);
                    }
                };
            })());

})();