if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which merges transform nodes that have no user-assigned IDs
 *  @constructor
 * Create a new SceneJS.utils.optimize.MergeTransforms
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.MergeTransforms = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.MergeTransforms.prototype.execute = function(params, completed) {
    if (completed) {
        completed(this);
    }
    return this;
};

SceneJS.utils.optimize.MergeTransforms.prototype.setConfigs = function(cfg) {
};

SceneJS.utils.optimize.MergeTransforms.prototype.getResults = function() {
    return {};
};