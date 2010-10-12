if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which merges geometry nodes that have no user-assigned IDs and share the same environment state, textures, materials etc.
 *  @constructor
 * Create a new SceneJS.utils.optimize.MergeGeometry
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.MergeGeometry = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.MergeGeometry.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.MergeGeometry.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.MergeGeometry.execute expects callback";
    }
    callback();
};