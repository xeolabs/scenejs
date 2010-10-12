if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which removes nodes that have no user-assigned IDs and do nothing
 *  @constructor
 * Create a new SceneJS.utils.optimize.MergeGeometry
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.RemoveRedundantNodes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.RemoveRedundantNodes.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.RemoveRedundantNodes.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.RemoveRedundantNodes.execute expects callback";
    }
    callback();
};