var SceneJS_State = function(cfg) {
    this.core = cfg.core || {};
    this.state = cfg.state || {};
    if (cfg.parent) {
        cfg.parent.addChild(this);
    }
    this.children = [];
    this.dirty = true;
    this._cleanFunc = cfg.cleanFunc;
};

SceneJS_State.prototype.addChild = function(state) {
    state.parent = this;
    this.children.push(state);
};

SceneJS_State.prototype.setDirty = function() {
    if (this.dirty) {
        return;
    }
    this.dirty = true;
    if (this.children.length > 0) {
        var child;
        for (var i = 0, len = this.children.length; i < len; i++) {
            child = this.children[i];
            if (!child.dirty) {
                child.setDirty();
            }
        }
    }
};

SceneJS_State.prototype._cleanStack = [];
SceneJS_State.prototype._cleanStackLen = 0;

SceneJS_State.prototype.setClean = function() {
    if (!this.dirty) {
        return;
    }
    if (!this._cleanFunc) {
        return;
    }
    if (!this.parent) {
        this._cleanFunc(this.parent ? this.parent : null, this);
        this.dirty = false;
        return;
    }

    this._cleanStackLen = 0;

    /* Stack dirty states on path to root
     */
    var state = this;
    while (state && state.dirty) {
        this._cleanStack[this._cleanStackLen++] = state;
        state = state.parent;
    }

    /* Stack last clean state if existing
     */
    if (state && state.parent) {
        this._cleanStack[this._cleanStackLen++] = state.parent;
    }

    /* Clean states down the path
     */
    var parentState;
    for (var i = this._cleanStackLen - 1; i > 0; i--) {
        parentState = this._cleanStack[i - 1];
        state = this._cleanStack[i];
        this._cleanFunc(parentState, state);
        parentState.dirty = false;
        state.dirty = false;
    }
};

SceneJS_State.prototype.reset = function() {
    this.children = [];
    this.dirty = true;
};
