if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.query) {
    SceneJS.utils.query = {};
}

/**
 * @class SceneJS utility for querying the World, View and Canvas-space coordinate origins of scene nodes
 *
 * Given a selected node, this utility uses the SceneJS JSON API to walk the nodes up the path to
 * the root while gathering the various modelling and viewing matrices we find along the way.
 *
 * As we do that, we're able to determine the center of  target node in World, View and Canvas space.
 *
 * See the Utility API documentation at: http://scenejs.wikispaces.com/SceneJS.utils
 *
 * See how we can specify a <b>localPos</b>, which is an optional position within the node's local coordinate system.
 *
 * <p><b>Example usage</b>: querying the
 *
 *  // Create the query - we want the canvas position,
 *  // so we must supply the canvas extents:
 *
 *  var query = new SceneJS.utils.query.QueryNodePos({
 *      canvasWidth : canvas.clientWidth,
 *      canvasHeight : canvas.clientHeight
 *  });
 *
 *  // Execute the query:
 *
 *  query.execute({
 *         nodeId: "my-node",
 *         localPos: { x: 0, y: 0, z: 0 }          // Optional offset with node's local coordinate space
 *      },
 *
 *      function(_query) {                         // Query successfully completed
 *
 *          var result = _query.getResults();      // Now get results from query
 *
 *          var canvasPos = result.canvasPos;
 *          var projPos   = result.projPos;
 *          var cameraPos = result.cameraPos;
 *          var viewPos   = result.viewPos;
 *          var worldPos  = result.worldPos;
 *
 *          //...
 *      });
 *
 *  // Since our query is synchronous, we can count on the results being
 *  // available immediately after execution, so we don't really need to
 *  // use a callback - we could have done this:
 *
 *  var results = query.getResults();
 *
 *  // Reconfigure the query - let's say we don't care
 *  // about the canvas position any more:
 *
 *  query.setConfigs({
 *      canvasWidth : null,
 *      canvasHeight : null
 *  });
 *
 * // Re-execute the query:
 *
 *  query.execute({ nodeId: "my-node" },
 *
 *      function(_query) {                        // Query successfully completed
 *
 *          var result = _query.getResult();      // Now get results from the query - note that
 *                                                // we don't expect the canvas position this time
 *          var projPos   = result.projPos;
 *          var cameraPos = result.cameraPos;
 *          var viewPos   = result.viewPos;
 *          var worldPos  = result.worldPos;
 *
 *          //...
 *      });
 *
 * This constructor accepts the same configs as may be given to {@link #setConfigs}.
 * @constructor
 * Create a new SceneJS.utils.query.QueryNodePos
 * @param {Object} cfg Configuration for the query - see {@link #setConfigs}
 */
SceneJS.utils.query.QueryNodePos = function(cfg) {
    this.setConfigs(cfg);
};

/**
 * Configures the query.
 *
 * <p>When a canvasHeight and canvasWidth is given, then the query will find the canvas-space
 * position of the target scene node. Note that the query execution will throw an exception if
 * only one of this pair is given, since it will not be able to map to canvas properly.</p>
 *
 * @param {Object} cfg Configuration object
 * @param {Number} cfg.canvasWidth Optional canvas element height
 * @param {Number} cfg.canvasheight Optional canvas element width
 * @returns {this}
 */
SceneJS.utils.query.QueryNodePos.prototype.setConfigs = function(cfg) {
    if (!this._cfg) {
        this._cfg = {};
    }
    if (!cfg) {
        cfg = {};
    }
    if (cfg.canvasWidth) {
        this._cfg.canvasWidth = cfg.canvasWidth;
    }
    if (cfg.canvasHeight) {
        this._cfg.canvasHeight = cfg.canvasHeight;
    }
    return this;
};

/**
 * Executes this query, returning the results in the given callback
 * @function {SceneJS.utils.query.QueryNodePos.execute} execute
 * @param {Object} params Execution parameters
 * @param {String} params.nodeId ID of node from which to obtain origin
 * @param {{x: Number, y: Number, z: Number}} params.localPos Optional offset within the node's local space
 * @returns {this}
 */
SceneJS.utils.query.QueryNodePos.prototype.execute = function(params, completed) {
    if (!params.nodeId) {
        throw "SceneJS.utils.query.QueryNodePos.execute expects params.nodeId";
    }
    if (this._cfg.canvasWidth || this._cfg.canvasHeight) {
        if (!this._cfg.canvasWidth) {
            throw "SceneJS.utils.query.QueryNodePos misconfigured - canvasHeight given, but canvasWidth omitted";
        } else if (!this._cfg.canvasHeight) {
            throw "SceneJS.utils.query.QueryNodePos misconfigured - canvasWidth given, but canvasHeight omitted";
        }
    }
    var node = SceneJS.withNode(params.nodeId);

    var localPos = params.localPos || {};
    localPos.x = localPos.x || 0;
    localPos.y = localPos.y || 0;
    localPos.z = localPos.z || 0;

    var data = this._walkUpBranch({ localPos : [localPos.x, localPos.y, localPos.z] }, node, null);

    this._queryResult = {
        localPos: localPos,
        worldPos : {
            x: data.worldPos[0],
            y: data.worldPos[1],
            z: data.worldPos[2]
        },
        viewPos : {
            x: data.viewPos[0],
            y: data.viewPos[1],
            z: data.viewPos[2]
        },
        cameraPos : {
            x: data.cameraPos[0],
            y: data.cameraPos[1],
            z: data.cameraPos[2]
        },
        projPos : {
            x: data.projPos[0],
            y: data.projPos[1]
        }
    };

    /* Map to canvas physical coordinates
     */
    if (this._cfg.canvasWidth) {
        this._queryResult.canvasPos = {
            x: data.canvasPos[0] + (this._cfg.canvasWidth * 0.5),
            y: this._cfg.canvasHeight - data.canvasPos[1] - (this._cfg.canvasHeight * 0.5)
        };
    }
    if (completed) {
        completed(this);
    }
    return this;
};

/** Get result of the last execution of this query
 */
SceneJS.utils.query.QueryNodePos.prototype.getResults = function() {
    return this._queryResult;
};

/**
 * Recursively walks up a parent path of node selectors
 * and returns the world-space position of the starting (leaf) node
 * as soon as the path encounters a "library" node or the scene root
 * @private
 */
SceneJS.utils.query.QueryNodePos.prototype._walkUpBranch = function(params, node, data) {
    if (!data) {
        data = {
            localPos : params.localPos,
            worldPos : params.localPos
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
        data = this._walkUpBranch(params, parent, data);
    }
    return data;
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._transformPoint3 = function(mat, p) {
    return [
        (mat[0] * p[0]) + (mat[4] * p[1]) + (mat[8] * p[2]) + mat[12],
        (mat[1] * p[0]) + (mat[5] * p[1]) + (mat[9] * p[2]) + mat[13],
        (mat[2] * p[0]) + (mat[6] * p[1]) + (mat[10] * p[2]) + mat[14],
        (mat[3] * p[0]) + (mat[7] * p[1]) + (mat[11] * p[2]) + mat[15]
    ];
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._normalizeVec2 = function(v) {
    var f = 1.0 / SceneJS_math_lenVec2(v);
    return this._mulVec2Scalar(v, f);
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._lenVec2 = function(v) {
    return Math.sqrt(this._sqLenVec2(v));
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._sqLenVec2 = function(v) {
    return this._dotVector2(v, v);
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._dotVector2 = function(u, v) {
    return (u[0] * v[0] + u[1] * v[1]);
};

// @private
SceneJS.utils.query.QueryNodePos.prototype._mulVec2Scalar = function(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
};
