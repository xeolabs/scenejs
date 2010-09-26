/**
 *
 *
 * @private
 */
SceneJS._nodeEventsModule = new (function() {
    var nodeStack = [];

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                nodeStack = [];
            });

    this.pushNode = function(node) {
        nodeStack.push(node);
    };

    this.popNode = function() {
        nodeStack.pop();
    };

    this.fireEvent = function(event) {

    };

})();
