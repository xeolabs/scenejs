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
SceneJS._instancingModule = new function() {
    var countInstances = 0;
    var instances = {}; // Maps ID of each current node instance

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                countInstances = 0;
                instances = {};
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                countInstances = 0;
                instances = {};
            });

    /** Acquire instance of a node
     */
    this.acquireInstance = function(nodeID) {
        if (instances[nodeID]) {
            SceneJS._errorModule.error(
                    new SceneJS.errors.CyclicInstanceException(
                            "SceneJS.Instance attempted to create cyclic instantiation: " + nodeID));
            return null;
        }
        var node = SceneJS._nodeIDMap[nodeID];
        if (!node) {
            var nodeStore = SceneJS.Services.getService(SceneJS.Services.NODE_STORE_SERVICE_ID);
            if (nodeStore) {
                node = nodeStore.loadNode(nodeID);                
            }
        }
        if (node) {
            instances[nodeID] = nodeID;
            countInstances++;
        }
        return node;
    };

    /**
     * Query if any Nodes are currently being instanced - useful
     * for determining if certain memoisation tricks can be done safely by nodes
     */
    this.instancing = function() {
        return countInstances > 0;
    };

    /**
     * Release current Symbol instance, effectively reacquires any
     * previously acquired
     */
    this.releaseInstance = function(nodeID) {
        instances[nodeID] = undefined;
        countInstances--;
    };
}();