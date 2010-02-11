/**
 * Backend module for asynchronous process management
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'processes';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.processes = (function() {
                    var groups = {};
                    var activeSceneId;

                    var time = (new Date()).getTime();

                    ctx.events.onEvent("scene-created",
                            function(params) {
                                groups[params.sceneId] = {
                                    sceneId : params.sceneId,
                                    processes: {}
                                };
                            });

                    ctx.events.onEvent("scene-activated",
                            function(params) {
                                time = (new Date()).getTime();
                                activeSceneId = params.sceneId;
                            });

                    ctx.events.onEvent("scene-deactivated",
                            function() {

                                /* Reap timed out and inactive processes
                                 */
                                var group = groups[activeSceneId];
                                var processes = group.processes;
                                for (var pid in processes) {
                                    var process = processes[pid];
                                    if (process) {
                                        if (process.destroyed) {
                                            processes[pid] = undefined;
                                            group.numProcesses--;
                                        } else {
                                            var elapsed = time - process.timeStarted;
                                            if (elapsed > process.timeout) {
                                                process.destroyed = true;
                                                processes[pid] = undefined;
                                                group.numProcesses--;
                                                if (process.onTimeout) {
                                                    process.onTimeout();
                                                }
                                            } else {
                                                process.timeRunning = elapsed;
                                            }
                                        }
                                    }
                                }
                                activeSceneId = undefined;
                            });

                    ctx.events.onEvent("scene-destroyed",
                            function(params) {
                                groups[params.sceneId] = undefined;
                            });

                    return {

                        createProcess: function(cfg) {
                            var group = groups[activeSceneId];
                            var i = 0;
                            while (true) {
                                var pid = "p" + i++;
                                if (!group.processes[pid]) {
                                    var process = {
                                        id: pid,
                                        timeStarted : time,
                                        timeRunning: 0,
                                        description : cfg.description || "",
                                        timeout : cfg.timeout || 30000, // Thirty second default timout
                                        onTimeout : cfg.onTimeout
                                    };
                                    group.processes[pid] = process;
                                    group.numProcesses++;
                                    return process;
                                }
                            }
                        },

                        destroyProcess: function(process) {
                            if (process) {
                                process.destroyed = true;
                            }
                        },

                        /** Returns the number of currently active processes in a scene, which is the currently active one by default
                         */
                        getNumProcesses : function(sceneId) {
                            return sceneId ? groups[sceneId].numProcesses : (activeSceneId ? groups[activeSceneId].numProcesses : 0);
                        },

                        /** Returns all running processes for the scene of the given ID.
                         */
                        getProcesses : function(sceneId) {
                            return groups[sceneId].processes;
                        }
                    };
                })();
            };

            this.createProcess = function(cfg) {
                ctx.processes.createProcess(cfg);
            };

            this.destroyProcess = function(process) {
                ctx.processes.destroyProcess(process);
            };

            this.getNumProcesses = function(sceneId) {
                ctx.processes.getNumProcesses(sceneId);
            };

            this.getProcesses = function(sceneId) {
                ctx.processes.getProcesses(sceneId);
            };
        })());
