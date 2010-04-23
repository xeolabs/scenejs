/**
 * Scene node that accumulates a model-space transform for the nodes within its subgraph, accumulated with higher
 * modelling transform nodes.
 *
 * @class SceneJS.rotate
 * @extends SceneJS.node
 */
SceneJS.modelMatrix = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_TRANSFORM = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    return SceneJS._utils.createNode(
            "modelMatrix",
            cfg.children,

            new (function() {
                var _memoLevel = NO_MEMO;
                var _mat = new Array(16);
                var _xform;

                this.setElements = function(elements) {
                    if (!elements) {
                        SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.modelMatrix elements undefined"));
                    }
                    if (elements.length != 16) {
                        SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException("SceneJS.modelMatrix elements should number 16"));
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
                    var superXform = SceneJS_modelTransformModule.getTransform();
                    if (_memoLevel < FIXED_TRANSFORM) {
                        var tempMat = SceneJS_math_mulMat4(superXform.matrix, _mat);
                        _xform = {
                            localMatrix: _mat,
                            matrix: tempMat,
                            fixed: superXform.fixed && cfg.fixed
                        };
                        if (_memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                            _memoLevel = FIXED_TRANSFORM;
                        }
                    }
                    SceneJS_modelTransformModule.setTransform(_xform);
                     this._renderChildren(traversalContext, data);
                    SceneJS_modelTransformModule.setTransform(superXform);
                };
            })());
};
