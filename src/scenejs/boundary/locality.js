/**

 */
SceneJS.locality = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return SceneJS._utils.createNode(
            "locality",
            cfg.children,

            new (function() {

                var _radii = {
                    inner : 1000,
                    outer : 1500
                };

                this.setInner = function(inner) {
                    _radii.inner = inner;
                };

                this.getInner = function() {
                    return _radii.inner;
                };

                this.setOuter = function(outer) {
                    _radii.outer = outer;
                };

                this.getOuter = function() {
                    return _radii.outer;
                };

                this._init = function(params) {
                    if (params.inner) {
                        this.setInner(params.inner);
                    }
                    if (params.outer) {
                        this.setOuter(params.outer);
                    }
                };

                if (cfg.fixed) {
                    this._init(cfg.getParams());
                }

                this._render = function(traversalContext, data) {
                    if (!cfg.fixed) {
                        _radii.inner = params.inner || 1000;
                        _radii.outer = params.outer || _radii.inner + 500.0;
                    }
                    var prevRadii = SceneJS._localityModule.getRadii();
                    SceneJS._localityModule.setRadii(_radii);
                    SceneJS._utils.visitChildren(cfg, traversalContext, data);
                    SceneJS._localityModule.setRadii(prevRadii);
                };
            })());
};

