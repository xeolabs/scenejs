/** 
 */
(function() {
    var RayPick;
    RayPick = function() {
        function RayPick(cfg) {
            this.setConfigs(cfg);
        }

        RayPick.prototype.setConfigs = function(cfg) {
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
            if (cfg.lookAtNode) {
                this._cfg.lookAtNode = cfg.lookAtNode;
            }
            if (cfg.cameraNode) {
                this._cfg.cameraNode = cfg.cameraNode;
            }
            return this;
        };

        RayPick.prototype.execute = function(params, completed) {
            var inViewMat, nx, ny, projMat, rayDirection, rayOrigin, viewMat;
            viewMat = SceneJS.withNode(this._cfg.lookAtNode).get("matrix");
            projMat = SceneJS.withNode(this._cfg.cameraNode).get("matrix");
            nx = -((2.0 * (params.x / this._cfg.canvasWidth)) - 1.0) / projMat[0];
            ny = -((-2.0 * (params.y / this._cfg.canvasHeight)) + 1.0) / projMat[5];
            inViewMat = this._inverseMat4(viewMat);
            rayOrigin = [0, 0, 0, 1];
            rayDirection = [nx, ny, 1, 0];
            rayOrigin = this._mulMat4v4(inViewMat, rayOrigin);
            rayDirection = this._mulMat4v4(inViewMat, rayDirection);
            this._result = {
                rayOrigin: rayOrigin,
                rayDirection: rayDirection
            };
            if (completed) {
                completed(this);
            }
            return this;
        };

        RayPick.prototype._mulMat4v4 = function(m, v) {
            return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3], m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]];
        };

        RayPick.prototype._inverseMat4 = function(m) {
            var i, m0, m1, m10, m11, m12, m13, m14, m15, m2, m3, m4, m5, m6, m7, m8, m9, n, s;
            m0 = m[0];
            m1 = m[1];
            m2 = m[2];
            m3 = m[3];
            m4 = m[4];
            m5 = m[5];
            m6 = m[6];
            m7 = m[7];
            m8 = m[8];
            m9 = m[9];
            m10 = m[10];
            m11 = m[11];
            m12 = m[12];
            m13 = m[13];
            m14 = m[14];
            m15 = m[15];
            n = this._identityMat4();
            n[0] = m9 * m14 * m7 - m13 * m10 * m7 + m13 * m6 * m11 - m5 * m14 * m11 - m9 * m6 * m15 + m5 * m10 * m15;
            n[1] = m13 * m10 * m3 - m9 * m14 * m3 - m13 * m2 * m11 + m1 * m14 * m11 + m9 * m2 * m15 - m1 * m10 * m15;
            n[2] = m5 * m14 * m3 - m13 * m6 * m3 + m13 * m2 * m7 - m1 * m14 * m7 - m5 * m2 * m15 + m1 * m6 * m15;
            n[3] = m9 * m6 * m3 - m5 * m10 * m3 - m9 * m2 * m7 + m1 * m10 * m7 + m5 * m2 * m11 - m1 * m6 * m11;
            n[4] = m12 * m10 * m7 - m8 * m14 * m7 - m12 * m6 * m11 + m4 * m14 * m11 + m8 * m6 * m15 - m4 * m10 * m15;
            n[5] = m8 * m14 * m3 - m12 * m10 * m3 + m12 * m2 * m11 - m0 * m14 * m11 - m8 * m2 * m15 + m0 * m10 * m15;
            n[6] = m12 * m6 * m3 - m4 * m14 * m3 - m12 * m2 * m7 + m0 * m14 * m7 + m4 * m2 * m15 - m0 * m6 * m15;
            n[7] = m4 * m10 * m3 - m8 * m6 * m3 + m8 * m2 * m7 - m0 * m10 * m7 - m4 * m2 * m11 + m0 * m6 * m11;
            n[8] = m8 * m13 * m7 - m12 * m9 * m7 + m12 * m5 * m11 - m4 * m13 * m11 - m8 * m5 * m15 + m4 * m9 * m15;
            n[9] = m12 * m9 * m3 - m8 * m13 * m3 - m12 * m1 * m11 + m0 * m13 * m11 + m8 * m1 * m15 - m0 * m9 * m15;
            n[10] = m4 * m13 * m3 - m12 * m5 * m3 + m12 * m1 * m7 - m0 * m13 * m7 - m4 * m1 * m15 + m0 * m5 * m15;
            n[11] = m8 * m5 * m3 - m4 * m9 * m3 - m8 * m1 * m7 + m0 * m9 * m7 + m4 * m1 * m11 - m0 * m5 * m11;
            n[12] = m12 * m9 * m6 - m8 * m13 * m6 - m12 * m5 * m10 + m4 * m13 * m10 + m8 * m5 * m14 - m4 * m9 * m14;
            n[13] = m8 * m13 * m2 - m12 * m9 * m2 + m12 * m1 * m10 - m0 * m13 * m10 - m8 * m1 * m14 + m0 * m9 * m14;
            n[14] = m12 * m5 * m2 - m4 * m13 * m2 - m12 * m1 * m6 + m0 * m13 * m6 + m4 * m1 * m14 - m0 * m5 * m14;
            n[15] = m4 * m9 * m2 - m8 * m5 * m2 + m8 * m1 * m6 - m0 * m9 * m6 - m4 * m1 * m10 + m0 * m5 * m10;
            s = 1.0 / (m12 * m9 * m6 * m3 - m8 * m13 * m6 * m3 - m12 * m5 * m10 * m3 + m4 * m13 * m10 * m3 + m8 * m5 * m14 * m3 - m4 * m9 * m14 * m3 - m12 * m9 * m2 * m7 + m8 * m13 * m2 * m7 + m12 * m1 * m10 * m7 - m0 * m13 * m10 * m7 - m8 * m1 * m14 * m7 + m0 * m9 * m14 * m7 + m12 * m5 * m2 * m11 - m4 * m13 * m2 * m11 - m12 * m1 * m6 * m11 + m0 * m13 * m6 * m11 + m4 * m1 * m14 * m11 - m0 * m5 * m14 * m11 - m8 * m5 * m2 * m15 + m4 * m9 * m2 * m15 + m8 * m1 * m6 * m15 - m0 * m9 * m6 * m15 - m4 * m1 * m10 * m15 + m0 * m5 * m10 * m15);
            for (i = 0; i <= 15; i++) {
                n[i] *= s;
            }
            return n;
        };

        RayPick.prototype._diagonalMat4v = function(v) {
            return [v[0], 0.0, 0.0, 0.0, 0.0, v[1], 0.0, 0.0, 0.0, 0.0, v[2], 0.0, 0.0, 0.0, 0.0, v[3]];
        };

        RayPick.prototype._diagonalMat4c = function(x, y, z, w) {
            return this._diagonalMat4v([x, y, z, w]);
        };

        RayPick.prototype._diagonalMat4s = function(s) {
            return this._diagonalMat4c(s, s, s, s);
        };

        RayPick.prototype._identityMat4 = function() {
            return this._diagonalMat4s(1.0);
        };

        RayPick.prototype.getResults = function() {
            return this._result;
        };

        return RayPick;
    }();

    if (!SceneJS.utils) {
        SceneJS.utils = {};
    }

    if (!SceneJS.raycasting) {
        SceneJS.utils.raycasting = {};
    }

    SceneJS.utils.raycasting.RayPick = RayPick;

}).call(this);