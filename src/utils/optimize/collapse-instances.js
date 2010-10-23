if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

SceneJS.utils.optimize.CollapseInstances = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CollapseInstances.prototype.execute = function(params, completed) {
    if (completed) {
        completed(this);
    }
    return this;
};

SceneJS.utils.optimize.CollapseInstances.prototype.setConfigs = function(cfg) {
};

SceneJS.utils.optimize.CollapseInstances.prototype.getResults = function() {
    return {};
};