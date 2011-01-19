/**
 * @class A scene node that enables/diables features for nodes in its sub graph.
 * An important point to note about these is that they never cause SceneJS to generate
 * or switch shaders - flags are designed to quickly switch things on/of with minimal overhead.
 */
SceneJS.Flags = SceneJS.createNodeType("flags");

// @private
SceneJS.Flags.prototype._init = function(params) {
    this.setFlags(params.flags);
};

/**
 Sets the flags.
 @param {{String:Boolean}} flags Map of flag booleans
 @since Version 0.8
 */
SceneJS.Flags.prototype.setFlags = function(flags) {
    this._attr.flags = SceneJS._shallowClone(flags);
};

/**
 Returns the flags
 @param {{String:Boolean}} Map of flag booleans
 @since Version 0.8
 */
SceneJS.Flags.prototype.getFlags = function() {
    return SceneJS._shallowClone(this._attr.flags);
};

// @private
SceneJS.Flags.prototype._compile = function(traversalContext) {
    this._preCompile(traversalContext);
    this._compileNodes(traversalContext);
    this._postCompile(traversalContext);
};


SceneJS.Flags.prototype._preCompile = function(traversalContext) {
  //  SceneJS._flagsModule.pushFlags(this._attr.id, this._attr.flags);
};



SceneJS.Flags.prototype._postCompile = function(traversalContext) {
  //  SceneJS._flagsModule.popFlags();
};