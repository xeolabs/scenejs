/**
 @class SceneJS.node
 <p>The basic scene node type, providing the ability to connect nodes into parent-child relationships to form scene graphs.</p>
 @constructor
 Create a new SceneJS.node
 @param {SceneJS.node, ...} arguments Zero or more child nodes
 */
SceneJS.node = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return new (function () {

        // private
        this._parent = null;

        // private
        this._children = cfg.children;

        /**
         * Returns the number of child nodes
         * @returns {int} Number of child nodes
         */
        this.getNumChildren = function() {
            return this._children.length;
        };

        /** Returns child nodes
         * @returns {Array} Child nodes
         */
        this.getChildren = function() {
            var list = new Array(this._children.length);
            var len = this._children.length;
            for (var i = 0; i < len; i++) {
                list[i] = this._children[i];
                child._parent = this;
            }
            return list;
        };

        /** Sets child nodes, removing those already present
         * @param {Array} children Array of child nodes
         */
        this.setChildren = function(children) {
            var temp = new Array(children.length);
            var len = children.length;
            var child;
            for (var i = 0; i < len; i++) {
                child = children[i];
                if (child._parent) {

                }
                temp[i] = child;
            }
            this._children = temp;
            return this;
        };

        /** Returns child node at given index
         * @returns {SceneJS.node} Child node
         */
        this.getChildAt = function(index) {
            return this._children[index];
        };

        /** Removes the child node at the given index
         * @param {int} index Child node index
         */
        this.removeChildAt = function(index) {
            var r = this._children.splice(index, 1);
            if (r.length > 0) {
                r[0]._parent = null;
                return r[0];
            } else {
                return null;
            }
        };

        this.addChild = function(node) {
            if (node._parent != null) {
            }
            this._children.push(node);
            node._parent = this;
            return node;
        };

        this.insertChild = function(node, i) {
            if (node._parent != null) {
            }
            if (i == undefined || i <= 0) {
                this._children.unshift(node);
            } else if (i >= this._children.length) {
                this._children.push(node);
            } else {
                this._children.splice(i, 0, node);
            }
            node._parent = this;
            return node;
        };

        this.getParent = function() {
            return this._parent;
        };

        // private
        this._renderChildren = function(traversalContext, data) {
            var child;
            var len = this._children.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    child = this._children[i];
                    child._render.call(child, { // Traversal context
                        appendix : traversalContext.appendix,
                        insideRightFringe: traversalContext.insideRightFringe || (i < len - 1)
                    }, data);
                }
            } else {

                /* Leaf node - if on right fringe of tree then
                 * render appended nodes
                 */
                if (traversalContext.appendix && (!traversalContext.insideRightFringe)) {
                    len = traversalContext.appendix.length;
                    for (var i = 0; i < len; i++) {
                        child = traversalContext.appendix[i];
                        child._render.call(child, { // Traversal context
                            appendix : null,
                            insideRightFringe: (i < len - 1)
                        }, data);
                    }
                }
            }
        };

        // private
        this._renderChild = function(index, traversalContext, data) {
            this._children[index]._render(traversalContext, data);
        };

        this._render = function(traversalContext, data) {
            var params = cfg.getParams();
            var childScope = SceneJS._utils.newScope(data, false);
            if (params) {
                for (var key in params) {
                    childScope.put(key, params[key]);
                }
            }
            this._renderChildren(traversalContext, childScope || data);
        };

    })();
};
