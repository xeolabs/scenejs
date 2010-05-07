/**
 * Backend module that services the SceneJS.Symbol and SceneJS.Instance nodes to manage instancing of scene
 * fragments called "symbols".
 *  @private
 */
var SceneJS_instancingModule = new (function() {

    var _symbols = {};
    var _nameSpace = null;
    var _countInstances = 0;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                _symbols = {};
                _nameSpace = null;
                _countInstances = 0;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                _symbols = {};
                _nameSpace = null;
                _countInstances = 0;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.NAME_UPDATED,
            function(params) {
                _nameSpace = params.path;
            });

    /** @private */
    this.createSymbol = function(name, symbol) {
        _symbols[_nameSpace ? _nameSpace + "/" + name : name] = symbol;
    };

    /** @private */
    this.acquireInstance = function(name) {
        if (name.charAt(0) != "/") {
            if (_nameSpace) {
                name = _nameSpace + "/" + name;
            }
        } else {
            name = name.substr(1); // remove '/'
        }
        var symbol = _symbols[name];
        if (symbol) {
            _countInstances++;
        }
        return symbol;
    };

    /** @private */
    this.instancing = function() {
        return _countInstances > 0;
    };

    /** @private */
    this.releaseInstance = function() {
        _countInstances--;
    };
})();