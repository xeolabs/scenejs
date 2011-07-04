if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.query) {
    SceneJS.utils.query = {};
}

/**
 * @class SceneJS utility for synchronously querying the World-space boundaries of scene nodes
 *
 * This utility starts off with an inverse boundary. Then this utility uses the SceneJS JSON API to walk
 * the nodes in the sub-tree of the selected node; it transforms each geometry node's vertices by the
 * modelling transforms on the path from the geometry to the selected node, then expands the boundary
 * by those vertices.
 *
 * This utility traverses all instance links, but only if they are resolved at the time
 * that the query visits them.
 *
 * See the Utility API documentation at: http://scenejs.wikispaces.com/SceneJS.utils
 *
 * <p><b>Example usage</b>:
 *
 *  // Create the query - no parameters required
 *
 *  var query = new SceneJS.utils.query.QueryNodeBoundary();
 *
 *  // Execute the query:
 *
 *  var boundary = query.execute({ nodeId: "my-node" });
 *
 * @constructor
 * Create a new SceneJS.utils.query.QueryNodeBoundary
 * @param {Object} cfg Configuration for the query - nothing yet
 */
SceneJS.utils.query.QueryNodeBoundary = function() {
    this.setConfigs(cfg);
};

/**
 * Configures the query.
 *
 * @param {Object} cfg Configuration object
 * @returns {this}
 */
SceneJS.utils.query.QueryNodeBoundary.prototype.setConfigs = function(cfg) {
    if (!this._cfg) {
        this._cfg = {};
    }
    return this;
};

/**
 * Executes this query, returning the results in the given callback
 * @function {SceneJS.utils.query.QueryNodeBoundary.execute} execute
 * @param {Object} params Execution parameters
 * @param {String} params.nodeId ID of node from which to obtain boundary
 * @returns {this}
 */
SceneJS.utils.query.QueryNodeBoundary.prototype.execute = function(params, completed) {
    if (!params.nodeId) {
        throw  SceneJS_errorModule.fatalError("SceneJS.utils.query.QueryNodeBoundary.execute expects params.nodeId");
    }
    var node = SceneJS.withNode(params.nodeId);

    this._queryResult = {
        boundary : this._getInitialBoundary()
    };

    
    if (completed) {
        completed(this);
    }
    return this;
};

/** Get result of the last execution of this query
 */
SceneJS.utils.query.QueryNodeBoundary.prototype.getResults = function() {
    return this._queryResult;
};

/**
 * Recursively walks up a parent path of node selectors
 * and returns the world-space position of the starting (leaf) node
 * as soon as the path encounters a "library" node or the scene root
 * @private
 */
SceneJS.utils.query.QueryNodeBoundary.prototype._walkUpBranch = function(node, data) {
    if (!data) {
        data = {
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
            data.worldPos = this._transformPoint3(mat, data.worldPos);
            break;

        case "lookAt":
            var viewMat = node.get("matrix");

            data.viewMat = viewMat;
            data.viewPos = this._transformPoint3(viewMat, data.worldPos);

            if (data.projMat) {
                data.projPos = this._transformPoint3(data.projMat, data.viewPos);
            } else {
                data.projPos = data.viewPos;
            }
            break;

        case "camera":
            mat = node.get("matrix");
            data.projMat = mat;
            break;

        case "scene":

            /* Get camera pos
             */
            var v = this._normalizeVec2(data.projPos);
            data.cameraPos = v;

            /* Get canvas pos if canvas extents configured
             */
            if (this._cfg.canvasWidth) {

                var projPos = data.projPos;

                /* Projection division
                 */
                var x = projPos[0] / projPos[3];
                var y = projPos[1] / projPos[3];

                /* Map to canvas
                 */
                data.canvasPos = [
                    x * this._cfg.canvasWidth * 0.5,
                    y * this._cfg.canvasHeight * 0.5
                ];
            }
            break;

        case "library":

            /* Just to illustrate the case in which the query target
             * node is within a library subtree, in which case we
             * are only interested in whatever origins we can get relative
             *  to the library node
             */
            return data;
    }
    var parent = node.parent();
    if (parent) {
        data = this._walkUpBranch(parent, data);
    }
    return data;
};

// @private
SceneJS.utils.query.QueryNodeBoundary.prototype._getInitialBoundary = function() {
    return {
        xmin : Number.MAX_VALUE,
        ymin : Number.MAX_VALUE,
        zmin : Number.MAX_VALUE,
        xmax : Number.MIN_VALUE,
        ymax : Number.MIN_VALUE,
        zmax : Number.MIN_VALUE
    };
};

// @private
SceneJS.utils.query.QueryNodeBoundary.prototype._expandBoundary = function(boundary, positions) {
    var x, y, z;
    for (var i = 0, len = positions.length - 3; i < len; i += 3) {
        x = this._geo.positions[i];
        y = this._geo.positions[i + 1];
        z = this._geo.positions[i + 2];
        if (x < boundary.xmin) {
            boundary.xmin = x;
        }
        if (y < boundary.ymin) {
            boundary.ymin = y;
        }
        if (z < boundary.zmin) {
            boundary.zmin = z;
        }
        if (x > boundary.xmax) {
            boundary.xmax = x;
        }
        if (y > boundary.ymax) {
            boundary.ymax = y;
        }
        if (z > boundary.zmax) {
            boundary.zmax = z;
        }
    }
    return boundary;
};

// @private
SceneJS.utils.query.QueryNodeBoundary.prototype._transformPoints3 = function(mat, positions) {
    var x, y, z;
    for (var i = 0, len = positions.length - 3; i < len; i += 3) {
        x = positions[i];
        y = positions[i + 1];
        z = positions[i + 2];
        positions[i + 0] = (mat[0] * x) + (mat[4] * y) + (mat[8] * z) + mat[12];
        positions[i + 1] = (mat[1] * x) + (mat[5] * y) + (mat[9] * z) + mat[13];
        positions[i + 2] = (mat[2] * x) + (mat[6] * y) + (mat[10] * z) + mat[14];
    }
};

