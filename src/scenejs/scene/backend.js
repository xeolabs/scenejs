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

                    return {

                        /** Registers a scene and returns the ID under which it is registered
                         */
                        registerScene : function(scene) {
                            var i = 0;
                            while (true) {
                                var sceneId = "scene" + i++;
                                if (!scenes[sceneId]) {
                                    scenes[sceneId] = {
                                        sceneId: sceneId,
                                        scene:scene,
                                        numProcesses: 0
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
                        setActiveScene : function(sceneId) {
                            activeSceneId = sceneId;
                        },

                        /** Returns all registered scenes
                         */
                        getAllScenes:function() {
                            var s = [];
                            for (var id in scenes) {
                                s.push(scenes[id].scene);
                            }
                            return s;
                        },

                        /** Notifies backend that the currently active scene has started an asynchronous process
                         */
                        processStarted: function() {
                            scenes[activeSceneId].numProcesses++;
                        },

                        /**  Notifies backend that the currently active scene has completed an asynchronous process
                         */
                        processStopped: function() {
                            scenes[activeSceneId].numProcesses--;
                        },

                        /** Returns the number of currently active processes in a scene, which is the currently active one by default
                         */
                        getNumProcesses : function(sceneId) {
                            return sceneId ? scenes[sceneId].numProcesses : (activeSceneId ? scenes[activeSceneId].numProcesses : 0);
                        },

                        /** Finds a registered scene
                         */
                        getScene : function(sceneId) {
                            return scenes[sceneId].scene;
                        }
                    };
                })();
            };

            this.registerScene = function(scene) {
                return ctx.scenes.registerScene(scene);
            };

            this.deregisterScene = function(sceneId) {
                return ctx.scenes.deregisterScene(sceneId);
            };

            this.setActiveScene = function(sceneId) {
                return ctx.scenes.setActiveScene(sceneId);
            };

            this.getNumProcesses = function(sceneId) {
                return ctx.scenes.getNumProcesses(sceneId);
            };
        })());
