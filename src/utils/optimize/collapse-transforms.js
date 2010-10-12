if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

SceneJS.utils.optimize.CollapseTransforms = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CollapseTransforms.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.CollapseTransforms.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.CollapseTransforms.execute expects callback";
    }
};