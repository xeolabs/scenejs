/**
 * Backend for a scene node.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'scene';

            var ctx;


            this.install = function(_ctx) {
                ctx = _ctx;

                /* Scene backend context provides a registry of existing scenes, some info on
                 * aynchronous processes that are currently active within them, and which scene
                 * is the one that is currently active, ie. being rendered.
                 */
                ctx.scenes = (function() {
                    var scenes = {};
                    var nScenes = 0;
                    var activeSceneId = null;
                    var commands = {};

                    var time = (new Date()).getTime();

                    var _fireEvent = function(name, params) {
                        var list = commands[name];
                        if (list) {
                            for (var i = 0; i < list.length; i++) {
                                list[i](params);
                            }
                        }
                    };

                    return {

                        /** Gets current time
                         *
                         */
                        getTime: function() {
                            return time;
                        },


                        /** Registers listener for a backend-generated event. These are set by backends
                         * on installation to set up permanent triggers for them to synchronise themselves
                         * with each other. An example: when geometry backend fires "geo-drawing" event
                         * the view transform backend then lazy-computes the current view matrix and loads it
                         * into the current shader.
                         */
                        onEvent: function(name, command) {
                            var list = commands[name];
                            if (!list) {
                                list = [];
                                commands[name] = list;
                            }
                            list.push(command);
                        },

                        /** Fires backend event
                         */
                        fireEvent: function(name, params) {
                            _fireEvent(name, params);
                        },

                        /** Registers a scene and returns the ID under which it is registered
                         */
                        registerScene : function(scene) {
                            var i = 0;
                            var j = Math.random() * 10;
                            while (true) {
                                var sceneId = "scene" + i;
                                i += j;
                                if (!scenes[sceneId]) {
                                    scenes[sceneId] = {
                                        sceneId: sceneId,
                                        scene:scene,
                                        processes: {},
                                        numProcesses : 0
                                    };
                                    nScenes++;
                                    return sceneId;
                                }
                            }
                        },

                        /** Deregisters scene
                         */
                        deregisterScene :function(sceneId) {
                            scenes[sceneId] = null;
                            nScenes--;
                            if (nScenes == 0) {
                                SceneJs.backends.reset();
                            }
                            if (activeSceneId == sceneId) {
                                activeSceneId = null;
                            }
                            return null;
                        },

                        /** Specifies which registered scene is the currently active one
                         */
                        activateScene : function(sceneId) {
                            activeSceneId = sceneId;
                            time = (new Date()).getTime();
                            _fireEvent("scene-activated");
                        },

                        /** Returns all registered scenes
                         */
                        getAllScenes:function() {
                            var list = [];
                            for (var id in scenes) {
                                var s = scenes[id];
                                if (s) {           // sparse array
                                    list.push(s.scene);
                                }
                            }
                            return list;
                        },

                        /** Notifies backend that the currently active scene has started an asynchronous process
                         */
                        createProcess: function(cfg) {
                            var scene = scenes[activeSceneId];
                            var i = 0;
                            while (true) {
                                var pid = "p" + i++;
                                if (!scene.processes[pid]) {
                                    var process = {
                                        id: pid,
                                        scene:scene,
                                        timeStarted : time,
                                        timeRunning: 0,
                                        description : cfg.description || "",
                                        timeout : cfg.timeout || 30000, // Thirty second default timout
                                        onTimeout : cfg.onTimeout
                                    };
                                    scene.processes[pid] = process;
                                    scene.numProcesses++;
                                    return process;
                                }
                            }
                        },

                        /**  Notifies backend that the currently active scene has completed an asynchronous process
                         */
                        destroyProcess: function(process) {
                            if (process) {
                                process.destroyed = true;
                            }
                        },

                        /** Returns the number of currently active processes in a scene, which is the currently active one by default
                         */
                        getNumProcesses : function(sceneId) {
                            return sceneId ? scenes[sceneId].numProcesses : (activeSceneId ? scenes[activeSceneId].numProcesses : 0);
                        },

                        /** Returns map of all running processes for the scene of the given ID.
                         */
                        getProcesses : function(sceneId) {
                            return scenes[sceneId].processes;
                        },

                        /** Finds a registered scene
                         */
                        getScene : function(sceneId) {
                            return scenes[sceneId].scene;
                        },

                        getActiveSceneID : function() {
                            return activeSceneId;
                        },

                        /** Deactivates the currently active scene and reaps destroyed and timed out processes
                         */
                        deactivateScene : function() {
                            /* Reap destroyed and timed-out processes
                             */
                            var scene = scenes[activeSceneId];
                            var processes = scene.processes;
                            for (var pid in processes) {
                                var process = processes[pid];
                                if (process) {
                                    if (process.destroyed) {
                                        processes[pid] = undefined;
                                        scene.numProcesses--;
                                    } else {
                                        var elapsed = time - process.timeStarted;
                                        if (elapsed > process.timeout) {
                                            process.destroyed = true;
                                            processes[pid] = undefined;
                                            scene.numProcesses--;
                                            if (process.onTimeout) {
                                                process.onTimeout();
                                            }
                                        } else {
                                            process.timeRunning = elapsed;
                                        }
                                    }
                                }
                            }
                            activeSceneId = null;
                        },

                        reset: function() {

                        }
                    };
                })();
            };

            this.getAllScenes = function() {
                return ctx.scenes.getAllScenes();
            };

            this.registerScene = function(scene) {
                return ctx.scenes.registerScene(scene);
            };

            this.deregisterScene = function(sceneId) {
                return ctx.scenes.deregisterScene(sceneId);
            };

            this.activateScene = function(sceneId) {
                return ctx.scenes.activateScene(sceneId);
            };

            this.deactivateScene = function() {
                return ctx.scenes.deactivateScene();
            };

            this.flush = function() {
                ctx.scenes.fireEvent("scene-flushed");
                return ctx.scenes.activateScene(null);
            };

            this.getNumProcesses = function(sceneId) {
                return ctx.scenes.getNumProcesses(sceneId);
            };

            this.getProcesses = function(sceneId) {
                return ctx.scenes.getProcesses(sceneId);
            };

            this.reset = function() {

            };
        })());
