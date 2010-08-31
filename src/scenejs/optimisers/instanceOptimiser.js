if (!SceneJS.filters) {
    SceneJS.filters = {};
}
SceneJS.filters.OptimizeInstances = new (function() {

    this._nodeMap = {};
    this.filter = function(node) {
        this._nodeMap = this._buildNodeMap(node);

    };

    this._buildNodeMap = function(node, nodeMap) {
        if (nodeMap == null) {
            nodeMap = {};
        }
        if (node.id) {
            nodeMap[node.id] = node;
        }
        for (var i = node.nodes.length - 1; i >= 0; i--) {
            this._buildNodeMap(node.nodes[i], nodeMap);
        }
        return nodeMap;
    };

    this._glueInstances = function(node) {
        if (node.type == "instance") {
            var target = this._nodeMap[node.cfg.target];
            
        }
        for (var i = node.nodes.length - 1; i >= 0; i--) {
            this._glueInstances(node.nodes[i]);
        }
    };
})();

