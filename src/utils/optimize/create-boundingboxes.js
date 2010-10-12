if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

SceneJS.utils.optimize.CreateBoundingBoxes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CreateBoundingBoxes.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimise.CollapseInstances.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimise.CollapseInstances.execute expects callback";
    }
};