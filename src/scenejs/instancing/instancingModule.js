/**
 * Backend that manages symbol instantiation.
 *
 * Mediates client Instance nodes' acquisition and release of target of nodes.
 *
 * Maintains a flag that indicates if traversal is currently within an instance.
 *
 * Ensures that no cycles are created within instantiation paths.
 *
 *  @private
 */
var SceneJS_instancingModule = new function() {
    var sceneId;
    var idStack = [];
    var countInstances = 0;
    var instances = {}; // Maps ID of each current node instance

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                idStack = [];
                countInstances = 0;
                instances = {};
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                sceneId = params.sceneId;
                idStack = [];
                countInstances = 0;
                instances = {};
            });

    this.acquireInstance = function(id, node) {
        //        if (instances[nodeID]) {
        //            SceneJS_errorModule.error(
        //                    SceneJS.errors.INSTANCE_CYCLE,
        //                    "SceneJS.Instance attempted to create cyclic instantiation: " + nodeID);
        //            return null;
        //        }
        //        var node = SceneJS_sceneModule.scenes[sceneId].scene.nodeMap.items[nodeID];
        //        if (!node) {
        //            var nodeStore = SceneJS.Services.getService(SceneJS.Services.NODE_LOADER_SERVICE_ID);
        //            if (nodeStore) {
        //                node = nodeStore.loadNode(nodeID);
        //            }
        //        }
        //        if (node) {
        //            instances[nodeID] = nodeID;
        idStack.push(id);
        countInstances++;

        /* We set the instance node's ID on the render module, so that it may
         * internally form state IDs prefixed by the instance
         */
        SceneJS_renderModule.setIDPrefix(idStack.join(""));
        //        }
        //        return node;
    };

    /**
     * Query if any Nodes are currently being instanced - useful
     * for determining if certain memoisation tricks can be done safely by nodes
     */
    this.instancing = function() {
        return countInstances > 0;
    };

    this.releaseInstance = function(nodeID) {
        instances[nodeID] = null;
        idStack.pop();
        countInstances--;
        SceneJS_renderModule.setIDPrefix((countInstances > 0) ? idStack[countInstances - 1] : null);
    };

//    SceneJS._compilationStates.setSupplier("instances", {
//        get: function() {
//            return countInstances > 0;
//        }
//    });

}();