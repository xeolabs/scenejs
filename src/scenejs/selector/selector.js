(function() {

    var Selector = SceneJS.createNodeType("selector");

    Selector.prototype._init = function(params) {
        this.setSelection(params.selection);
    };

    /**
     Sets the indices of selected children. When the value is undefined or an empty array, then no children will be selected.
     @function setSelection
     @param {int []} selection
     @returns {Selector} This Selector node
     */
    Selector.prototype.setSelection = function(selection) {
        this.attr.selection = selection || [];
        this._resetCompilationMemos();
        return this;
    };

    /**
     * Returns the indices of the selected child. The result will be an empty array if none are currently selected.
     * @function {int []} getSelection
     * @returns {int []} Array containing indices of selected children.
     */
    Selector.prototype.getSelection = function() {
        var selection = new Array(this.attr.selection.length);
        for (var i = 0; i < this.attr.selection.length; i++) {
            selection[i] = this.attr.selection[i];
        }
        return selection;
    };

    Selector.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };

    Selector.prototype._preCompile = function(traversalContext) {
        if (this.attr.selection.length > 0) {
            this._selectedChildren = [];
            for (var i = 0, len = this.attr.selection.length; i < len; i++) {
                var j = this.attr.selection[i];
                if (0 <= j && j < this.children.length) {
                    this._selectedChildren.push(this.children[j]);
                }
            }
        } else {
            this._selectedChildren = null;
        }
        return {
            children: this._selectedChildren
        };
    };

    Selector.prototype._compileNodes = function(traversalContext) {
        SceneJS._Node.prototype._compileNodes.call(this, traversalContext, this._selectedChildren);
    };

    Selector.prototype._postCompile = function(traversalContext) {
    };

})();