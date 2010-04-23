/**
 *
 */
SceneJS.perspective = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var projectionBackend = SceneJS._backends.getBackend('projection');

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing matrix

    return SceneJS._utils.createNode(
            "perspective",
            cfg.children,

            new (function() {
                var _memoLevel = NO_MEMO;

                var _fovy = 60.0;
                var _aspect = 1.0;
                var _near = 0.1;
                var _far = 400.0;

                var _transform;

                this.setFovY = function(fovy) {
                    _fovy = fovy;
                    _memoLevel = NO_MEMO;
                };

                this.getFovyY = function() {
                    return _fovy;
                };

                this.setAspect = function(aspect) {
                    _aspect = aspect;
                    _memoLevel = NO_MEMO;
                };

                this.getAspect = function() {
                    return _aspect;
                };

                this.setNear = function(near) {
                    _near = near;
                    _memoLevel = NO_MEMO;
                };

                this.getNear = function() {
                    return _near;
                };

                this.setFar = function(far) {
                    _far = far;
                    _memoLevel = NO_MEMO;
                };

                this.getFar = function() {
                    return _far;
                };

                this._init = function(params) {
                    if (params.fovy) {
                        this.setFovY(params.fovy);
                    }
                    if (params.aspect) {
                        this.setAspect(params.aspect);
                    }
                    if (params.near) {
                        this.setNear(params.near);
                    }
                    if (params.far) {
                        this.setFar(params.far);
                    }
                };

                if (cfg.fixed) {
                    this._init(cfg.getParams());
                }

                this._render = function(traversalContext, data) {
                    if (_memoLevel == NO_MEMO) {
                        if (!cfg.fixed) {
                            this._init(cfg.getParams(data));
                        } else {
                            _memoLevel = FIXED_CONFIG;
                        }
                        var tempMat = SceneJS_math_perspectiveMatrix4(
                                _fovy * Math.PI / 180.0,
                                _aspect,
                                _near,
                                _far);
                        _transform = {
                            type: "perspective",
                            matrix:tempMat
                        };
                    }
                    var prevTransform = projectionBackend.getTransform();
                    projectionBackend.setTransform(_transform);
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                    projectionBackend.setTransform(prevTransform);
                };
            })());
};

