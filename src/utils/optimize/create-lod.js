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

SceneJS.utils.optimize.CreateLOD.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.CreateLOD.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.CreateLOD.execute expects callback";
    }
    callback();
};