/**

 */
SceneJS.locality = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

        var _radii = {
            inner : 1000,
            outer : 1500
        };

        $.setInner = function(inner) {
            _radii.inner = inner;
        };

        $.getInner = function() {
            return _radii.inner;
        };

        $.setOuter = function(outer) {
            _radii.outer = outer;
        };

        $.getOuter = function() {
            return _radii.outer;
        };

        $._init = function(params) {
            if (params.inner) {
                $.setInner(params.inner);
            }
            if (params.outer) {
                $.setOuter(params.outer);
            }
        };

        if (cfg.fixed) {
            $._init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if (!cfg.fixed) {
                _radii.inner = params.inner || 1000;
                _radii.outer = params.outer || _radii.inner + 500.0;
            }
            var prevRadii = SceneJS._localityModule.getRadii();
            SceneJS._localityModule.setRadii(_radii);
            $._renderChildren(traversalContext, data);
            SceneJS._localityModule.setRadii(prevRadii);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
