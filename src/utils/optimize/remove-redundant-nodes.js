if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which removes nodes that have no user-assigned IDs and do nothing
 *  @constructor
 * Create a new SceneJS.utils.optimize.RemoveRedundantNodes
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.RemoveRedundantNodes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.RemoveRedundantNodes.prototype.execute = function(params, completed) {
    if (completed) {
        completed(this);
    }
    return this;
};

SceneJS.utils.optimize.RemoveRedundantNodes.prototype.setConfigs = function(cfg) {
};

SceneJS.utils.optimize.RemoveRedundantNodes.prototype.getResults = function() {
    return {};
};