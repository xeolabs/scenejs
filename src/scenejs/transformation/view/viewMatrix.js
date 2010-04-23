/**
 * Node that defines a view transform matrix for its subgraph.
 */
SceneJS.viewMatrix = function() {
    var errorBackend = SceneJS._backends.getBackend('error');
    var transformBackend = SceneJS._backends.getBackend('view-transform');

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_TRANSFORM = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    return SceneJS._utils.createNode(
            "viewMatrix",
            cfg.children,

            new (function() {
                var _memoLevel = NO_MEMO;
                var _mat = new Array(16);
                var _xform;

                this.setElements = function(elements) {
                    if (!elements) {
                        errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.modelMatrix elements undefined"));
                    }
                    if (elements.length != 16) {
                        errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.modelMatrix elements should number 16"));
                    }
                    for (var i = 0; i < 16; i++) {
                        _mat[i] = elements[i];
                    }
                    _memoLevel = NO_MEMO;
                };

                this.getElements = function() {
                    var elements = new Array(16);
                    for (var i = 0; i < 16; i++) {
                        elements[i] = _mat[i];
                    }
                    return elements;
                };

                this.setIdentity = function() {
                    _mat = SceneJS_math_identityMat4();
                };

                this._init = function(params) {
                    this.setElements(params.elements);
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
                    }
                    var superXform = transformBackend.getTransform();
                    if (_memoLevel < FIXED_TRANSFORM) {
                        var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                        _xform = {
                            localMatrix: _mat,
                            matrix: tempMat,
                            fixed: superXform.fixed && cfg.fixed
                        };
                        if (_memoLevel == FIXED_CONFIG && superXform.fixed) {
                            _memoLevel = FIXED_TRANSFORM;
                        }
                    }
                    transformBackend.setTransform(_xform);
                    this._renderChildren(cfg, traversalContext, data);
                    transformBackend.setTransform(superXform);
                };
            })());
};
