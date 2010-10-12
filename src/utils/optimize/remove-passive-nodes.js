if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

SceneJS.utils.optimize.RemovePassiveNodes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.RemovePassiveNodes.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.RemovePassiveNodes.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.RemovePassiveNodes.execute expects callback";
    }
};