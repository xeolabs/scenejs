function ProximityEngine(cfg) {

    this._center = [0, 0, 0];
    this._radii = [200, 700, 1200];

    this._bodies = {};
    this._bodyList = [];
    this._numBodies = 0;

    this._bodyListDirty = false;

    this._updatedBodies = [];

    if (cfg) {
        this.setConfigs(cfg);
    }
}

/**
 * Configure this proximity engine
 * @param cfg
 */
ProximityEngine.prototype.setConfigs = function (cfg) {
    if (cfg.center) {
        var center = cfg.center;
        this._center[0] = center[0];
        this._center[1] = center[1];
        this._center[2] = center[2];
    }
    if (cfg.radii != undefined) {
        this._radii = cfg.radii;
        // Body statuses now redundant because radii now changed
        for (var i = 0; i < this._numBodies; i++) {
            this._bodyList[i].status = null;
        }
    }
};

/**
 * Add a body
 * @param bodyId Unique body ID
 * @param cfg Body properties
 */
ProximityEngine.prototype.addBody = function (bodyId, cfg) {
    if (this._bodies[bodyId]) {
        throw "Body with this ID already added: " + bodyId;
    }
    this._bodies[bodyId] = new ProximityBody(bodyId, cfg.pos, cfg.radius);
    this._bodyListDirty = true;
};

/**
 * Remove a body that was added with {@link #addBody}.
 * @param bodyId
 */
ProximityEngine.prototype.removeBody = function (bodyId) {
    delete this._bodies[bodyId];
    this._bodyListDirty = true;
};

/**
 * Find updates in proximity status for bodies,
 * return an array of the updated bodies in a callback
 * @param {Function(Array,Number)} callback Returns array of {@link ProximityBody}s that have changed status,
 * plus length of the array
 */
ProximityEngine.prototype.integrate = function (callback) {
    if (this._bodyListDirty) {
        this._rebuildBodyList();
    }
    var numUpdatedBodies = 0;
    var body;
    var dist;
    var status;
    var outerRadiusIdx = this._radii.length - 1;
    for (var i = 0; i < this._numBodies; i++) {
        body = this._bodyList[i];
        dist = Math.abs(this._lenVec3(this._subVec3(this._center, body.pos, []))); // TODO: optimise - inline this
        status = -1;
        for (var j = outerRadiusIdx; j >= 0; j--) {
            if (dist > this._radii[j]) {
                if (j < outerRadiusIdx) {
                    status = j + 1;
                }
                break;
            }
            status = j;
        }
        if (status !== body.status) {
            body.status = status;
            this._updatedBodies[numUpdatedBodies++] = body;
        }
    }
    callback(this._updatedBodies, numUpdatedBodies);
};

ProximityEngine.prototype._rebuildBodyList = function () {
    this._numBodies = 0;
    for (var bodyId in this._bodies) {
        if (this._bodies.hasOwnProperty(bodyId)) {
            this._bodyList[this._numBodies++] = this._bodies[bodyId];
        }
    }
    this._bodyListDirty = false;
};

ProximityEngine.prototype._subVec3 = function (u, v, dest) {
    if (!dest) {
        dest = u;
    }
    dest[0] = u[0] - v[0];
    dest[1] = u[1] - v[1];
    dest[2] = u[2] - v[2];
    return dest;
};

ProximityEngine.prototype._lenVec3 = function (v) {
    return Math.sqrt(this._sqLenVec3(v));
};

ProximityEngine.prototype._sqLenVec3 = function (v) {
    return this._dotVector3(v, v);
};

ProximityEngine.prototype._dotVector3 = function (u, v) {
    return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
};


/**
 * A spherical body within a {@link ProximityEngine}
 * @param bodyId Body ID
 * @param pos Center of the body
 * @param radius radius of body
 * @constructor
 */
function ProximityBody(bodyId, pos, radius) {
    this.bodyId = bodyId;
    this.pos = pos;
    this.radius = radius;
    this.status = null;
}