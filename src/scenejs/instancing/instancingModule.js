/**
 * Backend module that services the SceneJS.Symbol and SceneJS.Instance nodes to manage instancing of scene
 * fragments called "symbols".
 *  @private
 */
SceneJS._instancingModule = new function() {
    this._symbols = {};
    this._nameStack = [];
    this._namePath = null;
    var countInstances = 0;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                this._symbols = {};
                this._nameStack = [];
                this._namePath = null;
                countInstances = 0;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                this._symbols = {};
                this._nameStack = [];
                this._namePath = null;
                countInstances = 0;
            });

    this.setName = function(restore) {
         this._nameStack = restore.nameStack.slice(0);
        this._namePath = restore.namePath;
    };

    this.pushName = function(name, node) {
        this._nameStack.push(name);
        this._namePath = null;
    };

    this.getName = function() {
        return {
            nameStack : this._nameStack.slice(0),
            namePath : this._namePath
        };
    };

    this.createSymbol = function(name, symbol) {
        if (!this._namePath) {
            this._namePath = this._nameStack.join("/");
        }
        this._symbols[this._namePath ? this._namePath + "/" + name : name] = symbol;
    };

    this.getSymbol = function(name) {
        if (!this._namePath) {
            this._namePath = this._nameStack.join("/");
        }
        return this._symbols[getPath(this._namePath, name)];
    };

    this.acquireInstance = function(name) {
        if (!this._namePath) {
            this._namePath = this._nameStack.join("/");
        }
        var symbol = this._symbols[getPath(this._namePath, name)];
        if (symbol) {
            countInstances++;
        }
        return symbol;
    };

    this.instancing = function() {
        return countInstances > 0;
    };

    this.releaseInstance = function() {
        countInstances--;
    };

    this.popName = function() {
        this._nameStack.pop();
        this._namePath = null;
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
}();