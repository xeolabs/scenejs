if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.optimize) {
    SceneJS.utils.optimize = {};
}

/**
 * @class Utility which inserts boundingbox nodes around geometry nodes to accellerate its traversal through visibility culling
 *  @constructor
 * Create a new SceneJS.utils.optimize.CreateBoundingBoxes
 * @param {Object} cfg Configuration for this utility
 */

SceneJS.utils.optimize.CreateBoundingBoxes = function(cfg) {
    this._cfg = cfg;
};

SceneJS.utils.optimize.CreateBoundingBoxes.prototype.execute = function(params, completed) {
    if (completed) {
        completed(this);
    }
    return this;
};

SceneJS.utils.optimize.CreateBoundingBoxes.prototype.setConfigs = function(cfg) {
};

SceneJS.utils.optimize.CreateBoundingBoxes.prototype.getResults = function() {
    return {};
};