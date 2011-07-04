if (!SceneJS.utils) {
    SceneJS.utils = {};
}

if (!SceneJS.utils.query) {
    SceneJS.utils.query = {};
}

/**
 * @class SceneJS utility for querying the World, View and Projection matrices at a selected node
 *
 * Given a selected node, this utility uses the SceneJS JSON API to walk the nodes up the path to
 * the root while building the required matrices. The result will be a single matrix of each type
 * required - for example, if we require the modelling matrix, we'll get the post-multiplied product of all
 * model matrices on the path from the root node.
 *
 * Read more in general about the Utility API at: http://scenejs.wikispaces.com/SceneJS.utils
 *
 * <p><b>Example usage</b>
 *
 *  // Create the query - we want all matrix types
 *
 *  var query = new SceneJS.utils.query.QueryNodeMats({
 *      model: true,
 *      view:  true,
 *      proj:  true
 *  });
 *
 *  // Execute the query:
 *
 *  query.execute({
 *         nodeId: "my-node"
 *      },
 *
 *      function(_query) {                         // Query successfully completed
 *
 *          var result = _query.getResults();      // Now get results from query
 *
 *          var modelMat  = result.modelMat;
 *          var viewMat   = result.viewMat;
 *          var projMat   = result.projMat;
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
 *  // about the projection matrix any more:
 *
 *  query.setConfigs({
 *      model: true,
 *      view:  true,
 *      proj:  false
 *  });
 *
 * // Re-execute the query:
 *
 *  query.execute({ nodeId: "my-node" },
 *
 *      function(_query) {                        // Query successfully completed
 *
 *          var result = _query.getResult();      // Now get results from the query - note that
 *                                                // we don't expect the projection matrix this time
 *          var modelMat  = result.modelMat;
 *          var viewMat   = result.viewMat;
 *
 *          //...
 *      });
 *
 * This constructor accepts the same configs as given to {@link #setConfigs}.
 * @constructor
 * Create a new SceneJS.utils.query.QueryNodeMats
 * @param {Object} cfg Configuration for the query - see {@link #setConfigs}
 */
SceneJS.utils.query.QueryNodeMats = function(cfg) {
    this.setConfigs(cfg);
};

/**
 * Configures the query.
 *
 * @param {Object} cfg Configuration object
 * @param {Boolean} cfg.model True when we want the model matrix - set undefined or false when otherwise
 * @param {Boolean} cfg.view  True when we want the model view - set undefined or false when otherwise
 * @param {Boolean} cfg.proj  True when we want the projection matrix - set undefined or false when otherwise
 * @returns {this}
 */
SceneJS.utils.query.QueryNodeMats.prototype.setConfigs = function(cfg) {
    if (!this._cfg) {
        this._cfg = {};
    }
    if (!cfg) {
        cfg = {};
    }
    if (!cfg.model && !cfg.proj && !cfg.view) {
        throw  SceneJS_errorModule.fatalError("SceneJS.utils.query.QueryNodeMats misconfigured - need one or more of model, view and proj");
    }
    this._cfg = {
        model : cfg.model,
        view : cfg.view,
        proj : cfg.proj
    };
    return this;
};

/**
 * Executes this query, returning the results in the given callback
 * @function {SceneJS.utils.query.QueryNodeMats.execute} execute
 * @param {Object} params Execution parameters
 * @param {String} params.nodeId ID of node for which to obtain matrices
 * @returns {this}
 */
SceneJS.utils.query.QueryNodeMats.prototype.execute = function(params, completed) {
    if (!params.nodeId) {
        throw  SceneJS_errorModule.fatalError("SceneJS.utils.query.QueryNodeMats.execute expects params.nodeId");
    }
    var node = SceneJS.withNode(params.nodeId);
    this._queryResult = this._walkUpBranch(node, null);

    if (this._cfg.model && (!this._queryResult.modelMat)) {
        this._queryResult.modelMat = this._identityMat4();
    }
    if (this._cfg.view && (!this._queryResult.viewMat)) {
        this._queryResult.viewMat = this._identityMat4();
    }
    if (this._cfg.proj && (!this._queryResult.projMat)) {
        this._queryResult.projMat = this._identityMat4();
    }
    if (completed) {
        completed(this);
    }
    return this;
};

/** Get result of the last execution of this query
 */
SceneJS.utils.query.QueryNodeMats.prototype.getResults = function() {
    return this._queryResult;
};

/**
 * Recursively walks up a parent path of node selectors and returns the matrices requested
 * @private
 */
SceneJS.utils.query.QueryNodeMats.prototype._walkUpBranch = function(node, data) {
    if (!data) {
        data = {};
    }
    var mat;
    var type = node.get("type");
    switch (type) {
        case "rotate":
        case "translate":
        case "scale":
        case "matrix":
        case "quaternion":
            if (this._cfg.model) {
                mat = node.get("matrix");
                data.modelMat = data.modelMat ? this._mulMat4(data.modelMat, mat) : mat;
            }
            break;

        case "lookAt":
            if (this._cfg.view) {
                mat = node.get("matrix");
                data.viewMat = data.viewMat ? this._mulMat4(data.viewMat, mat) : mat;
            }
            break;

        case "camera":
            if (this._cfg.proj) {
                mat = node.get("matrix");
                data.projMat = data.projMat ? this._mulMat4(data.projMat, mat) : mat;
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


/** @private */
SceneJS.utils.query.QueryNodeMats._mulMat4 = function(a, b) {
    var r = new Array(16);
    var i = 0;
    var j = 0;
    var k = 0;
    var s = 0.0;
    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
            s = 0.0;
            for (k = 0; k < 4; ++k) {
                s += a[i + k * 4] * b[k + j * 4];
            }
            r[i + j * 4] = s;
        }
    }
    return r;
};

/** @private */
SceneJS.utils.query.QueryNodeMats._identityMat4 = function() {
    return [
        1, 0.0, 0.0, 0.0,
        0.0,1, 0.0, 0.0,
        0.0, 0.0, 1,0.0,
        0.0, 0.0, 0.0, 1
    ];
};