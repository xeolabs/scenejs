if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which automatically creates LOD versions for geometry nodes in scene subgraphs
 *  @constructor
 * Create a new SceneJS.utils.optimize.CreateLOD
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.CreateLOD = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CreateLOD.prototype.execute = function(params, completed) {
    if (completed) {
        completed(this);
    }
    return this;
};

SceneJS.utils.optimize.CreateLOD.prototype.setConfigs = function(cfg) {
};

SceneJS.utils.optimize.CreateLOD.prototype.getResults = function() {
    return {};
};