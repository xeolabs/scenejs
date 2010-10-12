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

SceneJS.utils.optimize.MergeTransforms.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.MergeTransforms.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.MergeTransforms.execute expects callback";
    }
    callback();
};