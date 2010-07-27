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

    /** Set current SID path
     */
    this.setName = function(restore) {
        this._nameStack = restore.nameStack.slice(0);
        this._namePath = restore.namePath;

        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.NAME_UPDATED,
                this._nameStack);
    };

    /** Push node SID to current path
     */
    this.pushName = function(name) {
        this._nameStack.push(name);
        this._namePath = null;

        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.NAME_UPDATED,
                this._nameStack);
    };

    /** Get current SID path
     */
    this.getName = function() {
        return {
            nameStack : this._nameStack.slice(0),
            namePath : this._namePath
        };
    };

    /** Register Symbol against given SID path
     */
    this.createSymbol = function(name, symbol) {
        if (!this._namePath) {
            this._namePath = this._nameStack.join("/");
        }
        this._symbols[this._namePath ? this._namePath + "/" + name : name] = symbol;
    };

    /** Get Symbol registered against given SID path
     */
    this.getSymbol = function(name) {
        if (!this._namePath) {
            this._namePath = this._nameStack.join("/");
        }
        return this._symbols[getPath(this._namePath, name)];
    };

    /** Acquire instance of Symbol on given SID path
     */
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

    /**
     * Query if any Symbols are currently being instanced - useful
     * for determining if certain memoisation tricks can be done safely by nodes
     */
    this.instancing = function() {
        return countInstances > 0;
    };

    /**
     * Release current Symbol instance, effectively reacquires any
     * previously acquired
     */
    this.releaseInstance = function() {
        countInstances--;
    };

    /** Pop node SID off current path
     */
    this.popName = function() {
        this._nameStack.pop();
        this._namePath = null;

        /* Broadcast new current SID path. Not amazingly efficient since we'd do this alot,
         * but potentially there are many other modules that might be interested in it and SID
         * path should be managed in one place (module) - perhaps not instancing module's job,
         * should be factored out into a "SID path module" maybe.
         */
        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.NAME_UPDATED,
                this._nameStack);
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