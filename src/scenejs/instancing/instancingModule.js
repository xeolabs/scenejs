/**
 * Backend module that services the SceneJS.Symbol and SceneJS.Instance nodes to manage instancing of scene
 * fragments called "symbols".
 *  @private
 */
var SceneJS_instancingModule = new (function() {

    var _symbols = {};
    var _nameStack = [];
    var _namePath = null;
    var _countInstances = 0;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                _symbols = {};
                _nameStack = [];
                _namePath = null;
                _countInstances = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                _symbols = {};
                _nameStack = [];
                _namePath = null;
                _countInstances = 0;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.NAME_UPDATED,
            function(params) {
                _nameStack = params.stack;
                _namePath = params.path;
            });

    /** @private */
    this.createSymbol = function(name, symbol) {
        _symbols[_namePath ? _namePath + "/" + name : name] = symbol;
    };

    /**
     * Returns concatenation of base and relative paths
     * following simplified UNIX-style format
     *
     * getPath(null, "../alpha") == "alpha"
     * getPath("bla", "../alpha") == "alpha"
     * getPath("boo/baa", "../alpha") == "boo/alpha"
     * getPath("boo/baa/foo", "../alpha") == "boo/baa/alpha"
     * getPath("boo/baa/foo", "../../alpha") == "boo/alpha"
     * getPath("boo/baa/foo", "/alpha") == "alpha"
     * getPath("boo/baa/foo", "alpha") == "boo/baa/foo/alpha"
     *
     * @private
     */
    function getPath(path, name) {
        if (name.charAt(0) == "/") {      // absolute path begins with "/" - remove it
            return name.substr(1);
        } else if (name.substr(0, 3) == "../") {
            name = name.substr(3);
            if (path) {
                var i = path.lastIndexOf("/");
                if (i == 0 || i == -1) {
                    return name;
                }
                return getPath(path.substr(0, i), name);
            } else {
                return name;
            }
        } else if (path) {
            return path + "/" + name;
        } else {
            return name;
        }
    }   

    /** @private */
    this.acquireInstance = function(name) {
  
        var symbol = _symbols[getPath(_namePath, name)];
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