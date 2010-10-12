if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}


/**
 * @class Utility which inserts boundingbox nodes around geometry nodes to accellerate its traversal through visibility culling
 *  @constructor
 * Create a new SceneJS.utils.optimize.MergeGeometry
 * @param {Object} cfg Configuration for this utility
 */
SceneJS.utils.optimize.CreateBoundingBoxes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CreateBoundingBoxes.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.optimize.CollapseInstances.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.optimize.CollapseInstances.execute expects callback";
    }
    callback();
};