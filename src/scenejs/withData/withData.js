/**
 * Scene node that creates a child data containing the elements of its configuration.
 */
SceneJS.withData = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing matrix
    const FIXED_DATA = 2;         // Node config is fixed, memoizing matrix

    return SceneJS._utils.createNode(
            "withData",
            cfg.children,

            new (function() {
                var _memoLevel = NO_MEMO;
                var _data = {};
                var _childData;

                this.setProperty = function(key, value) {
                    _data[key] = value;
                    _memoLevel = NO_MEMO;
                    return this;
                };

                this.getProperty = function(key) {
                    return data[key];
                };

                this.clearProperties = function() {
                    _data = {};
                    return this;
                };

                this._init = function(params) {
                    for (var key in params) {
                        _data[key] = params[key];
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
                    }
                    if (_memoLevel < FIXED_DATA) {
                        _childData = SceneJS._utils.newScope(data, cfg.fixed);
                        for (var key in _data) {
                            _childData.put(key, _data[key]);
                        }
                        if (_memoLevel == FIXED_CONFIG && data.isfixed()) {
                            _memoLevel = FIXED_DATA;
                        }
                    }
                    this._renderChildren(traversalContext, _childData);
                };
            })());
};


