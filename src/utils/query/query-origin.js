if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.query) {
    SceneJS.utils.query = {};
}

/**
 * @class Utility which finds the origin of the selected node in World, View, Camera and Canvas-space.
 *  @constructor
 * Create a new SceneJS.utils.query.QueryNodeOrigin
 * @param {Object} cfg Configuration for the query
 */
SceneJS.utils.query.QueryNodeOrigin = function(cfg) {
    this._cfg = cfg || {};
};

/**
 * Executes this query, returning the results in the given callback
 * @function {SceneJS.utils.query.QueryNodeOrigin.execute} execute
 * @param {Object} params Execution parameters
 * @param {String} params.nodeId ID of node from which to obtain origin
 * @returns {} Origin info (TODO)
 */
SceneJS.utils.query.QueryNodeOrigin.execute = function(params, callback) {
    if (!params.nodeId) {
        throw "SceneJS.utils.query.QueryNodeOrigin.execute expects params.nodeId";
    }
    if (!callback) {
        throw "SceneJS.utils.query.QueryNodeOrigin.execute expects callback";
    }
    var node = SceneJS.withNode(params.nodeId);
    var info = walkUpBranch(node, null);
    callback(info);
};

/**
 * Recursively walks up a parent path of node selectors
 * and returns the world-space position of the starting (leaf) node
 * as soon as the path encounters a "library" node or the scene root
 * @private
 */
SceneJS.utils.query.QueryNodeOrigin._walkUpBranch = function(node, info) {
    if (!info) {
        info = {
            worldPos : [0,0,0]
        };
    }
    var mat;
    var type = node.get("type");
    switch (type) {
        case "rotate":
        case "translate":
        case "scale":
        case "matrix":
        case "quaternion":
            mat = node.get("matrix");
            info.worldPos = transformPoint3(mat, info.worldPos);
            break;

        case "lookAt":
            var viewMat = node.get("matrix");

            info.viewMat = viewMat;
            info.viewPos = transformPoint3(viewMat, info.worldPos);

            if (info.projMat) {
                info.projPos = transformPoint3(info.projMat, info.viewPos);
            } else {
                info.projPos = info.viewPos;
            }
            break;

        case "camera":
            mat = node.get("matrix");
            info.projMat = mat;
            break;

        case "scene":

            /* Get canvas extents
             */
            var canvas = document.getElementById(node.get("canvasId"));
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            var projPos = info.projPos;

            /* Projection division
             */
            var x = projPos[0] / projPos[3];
            var y = projPos[1] / projPos[3];

            /* Map to canvas
             */
            x *= width;
            y *= height;

            info.canvasPos = [x, y];
            break;

        case "library":

            /* Just to illustrate the case in which the query target
             * node is within a library subtree, in which case we
             * are only interested in whatever origins we can get relative
             *  to the library node
             */
            return info;
    }

    var parent = node.parent();
    if (parent) {
        info = walkUpBranch(parent, info);
    }
    return info;
}

SceneJS.utils.query.QueryNodeOrigin.transformPoint3 = function(mat, p) {
    return [
        (mat[0] * p[0]) + (mat[4] * p[1]) + (mat[8] * p[2]) + mat[12],
        (mat[1] * p[0]) + (mat[5] * p[1]) + (mat[9] * p[2]) + mat[13],
        (mat[2] * p[0]) + (mat[6] * p[1]) + (mat[10] * p[2]) + mat[14],
        (mat[3] * p[0]) + (mat[7] * p[1]) + (mat[11] * p[2]) + mat[15]
    ];
}