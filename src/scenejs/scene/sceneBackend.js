/**
 * Backend for a scene node.
 */
SceneJS._backends.installBackend(

        "scene",

        function(ctx) {

            var scenes = {};
            var nScenes = 0;
            var activeSceneId;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene) {
                    var sceneId = SceneJS._utils.createKeyForMap(scenes);
                    scenes[sceneId] = {
                        sceneId: sceneId,
                        scene:scene
                    };
                    nScenes++;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_CREATED, {sceneId : sceneId });
                    return sceneId;
                },

                /** Deregisters scene
                 */
                deregisterScene :function(sceneId) {
                    scenes[sceneId] = null;
                    nScenes--;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DESTROYED, {sceneId : sceneId });
                    if (activeSceneId == sceneId) {
                        activeSceneId = null;
                    }
                    if (nScenes == 0) {
                        ctx.events.fireEvent(SceneJS._eventTypes.RESET);
                    }
                },

                /** Specifies which registered scene is the currently active one
                 */
                activateScene : function(sceneId) {
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });
                },

                /** Returns all registered scenes
                 */
                getAllScenes:function() {
                    var list = [];
                    for (var id in scenes) {
                        var scene = scenes[id];
                        if (scene) {
                            list.push(scene.scene);
                        }
                    }
                    return list;
                },

                /** Finds a registered scene
                 */
                getScene : function(sceneId) {
                    return scenes[sceneId].scene;
                },

                /** Deactivates the currently active scene and reaps destroyed and timed out processes
                 */
                deactivateScene : function() {
                    if (!activeSceneId) {
                        throw "Internal error: no scene active";
                    }
                    var sceneId = activeSceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    activeSceneId = null;
                }
            };
        });
