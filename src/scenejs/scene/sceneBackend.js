/**
 * Backend for a scene node.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'scene';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                /* Scene backend context provides a registry of existing scenes, and which scene
                 * is the one that is currently active, ie. being rendered.
                 */
                ctx.scenes = (function() {
                    var scenes = {};
                    var nScenes = 0;
                    var activeSceneId = null;

                    var time = (new Date()).getTime();

                    return {

                        /** Gets current time
                         *
                         */
                        getTime: function() {
                            return time;
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
                                        scene:scene
                                    };
                                    ctx.events.fireEvent("scene-created", {sceneId : sceneId });
                                    nScenes++;
                                    return sceneId;
                                }
                            }
                        },

                        /** Deregisters scene
                         */
                        deregisterScene :function(sceneId) {
                            scenes[sceneId] = null;
                            ctx.events.fireEvent("scene-destroyed", {sceneId : sceneId });
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
                            ctx.events.fireEvent("scene-activated", { sceneId: sceneId });
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
                            var scene = scenes[activeSceneId];
                            activeSceneId = null;
                            ctx.events.fireEvent("scene-deactivated");
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
                ctx.events.fireEvent("scene-flushed");
                return ctx.scenes.activateScene(null);
            };

            this.reset = function() {

            };
        })());
