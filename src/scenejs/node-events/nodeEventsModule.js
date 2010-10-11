/**
 *
 *
 * @private
 */
SceneJS._nodeEventsModule = new (function() {
    var sceneId;
    var scenes = {};
    var scene;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function(params) {
                sceneId = params.sceneId;
                scene = scenes[params.sceneId];
                if (!scene) {
                    scenes[params.sceneId] = {
                        nodes: {}
                    };
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_DESTROYED,
            function(params) {
                sceneId = params.sceneId;
                scene = scenes[params.sceneId];
                if (scene) {
                    scenes[params.sceneId] = undefined;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.NODE_DESTROYED,
            function(params) {
                var nodeId = params.nodeId;
                for (var sceneId in scenes) {
                    if (scenes.hasOwnProperty(sceneId)) {
                        scene = scenes[sceneId];
                        if (scene.nodes[nodeId]) {
                            scene.nodes[nodeId] = undefined;
                        }
                    }
                }
            });

    this.preVisitNode = function(node) {
        scene.nodes[node.getId()] = node;
    };

    this.postVisitNode = function() {

    };

    this.fireEvent = function(event) {

    };

    this.getSceneUpdated = function(nodeId) {
        for (var sceneId in scenes) {
            if (scenes.hasOwnProperty(sceneId)) {
                scene = scenes[sceneId];
                if (scene.nodes[nodeId]) {
                    scene.updated = undefined;
                }
            }
        }
    };

})();
