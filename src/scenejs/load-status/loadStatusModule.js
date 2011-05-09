/**
 * Backend that tracks statistics on loading states of nodes during scene traversal.
 *
 * This supports the "loading-status" events that we can listen for on scene nodes.
 *
 * When a node with that listener is pre-visited, it will call getStatus on this module to
 * save a copy of the status. Then when it is post-visited, it will call diffStatus on this
 * module to find the status for its sub-nodes, which it then reports through the "loading-status" event.
 *
 * @private
 */
var SceneJS_loadStatusModule = new (function() {

    this.status = {
        numNodesLoading : 0,
        numNodesLoaded : 0
    };

    /* Make fresh status counts for new render pass
     */
    var self = this;
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                self.status = {
                    numNodesLoading : 0,
                    numNodesLoaded : 0
                };
            });

    /**
     * Returns a copy of the status counts held by this module
     */
    this.getStatusSnapshot = function() {
        return {
            numNodesLoading : this.status.numNodesLoading,
            numNodesLoaded  : this.status.numNodesLoaded
        };
    };

    /**
     * Returns the difference between the given status counts snapshot
     * and the set held by this module.
     */
    this.diffStatus = function(statusSnapshot) {
        return {
            numNodesLoading : this.status.numNodesLoading - statusSnapshot.numNodesLoading,
            numNodesLoaded : this.status.numNodesLoaded - statusSnapshot.numNodesLoaded
        };
    };
})();

