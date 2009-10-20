SceneJs.node = function() {

    var cfg = SceneJs.getConfig(arguments);

    var children = cfg.children || [];
    var childListeners = cfg.childListeners || {};
    var parentListeners = cfg.parentListeners || {};

    return new (function() {
        this.reset = cfg.reset;
        this.preVisit = cfg.preVisit;
        this.postVisit = cfg.postVisit;

        this.addChild = function(child) {
            this.children.push(child);
            return this;
        };

        this.getNumChildren = function() {
            return children.length;
        };

        this.getChild = function(i) {
            return children[i];
        };

        this.spliceChildren = function() {
            return children.splice(arguments);
        };

        this.mapChildren = function(callback, scope) {
            for (var i = 0; i < children.length; i++) {
                callback.call(children[i], scope || this);
            }
        };

        this.visit = function(ec) {
            var sc = ec.getGraphContext();
            if (sc.reset && sc.reset == true) {
                if (this.reset) {
                    this.reset(ec);
                }
            }
            for (var name in parentListeners) {
                var event = ec.getParentEvent(name);
                if (event) {
                    var l = parentListeners[name];
                    l.fn.call(l.scope || this, ec, event);
                }
            }
            if (this.preVisit) {
                this.preVisit(ec);
            }
            do {
                for (var i = 0; i < children.length; i++) {

                    /* Callback "filters out" child when it returns false for child's index
                     */
                    if (cfg.filterChild && !cfg.filterChild(i)) {
                        continue;
                    } else {
                        var child = children[i];
                        child.visit(
                                new SceneJs.NodeContext(
                                        null, // Graph context is supplied in parent node context for non-root node context
                                        ec,
                                        child,
                                        childListeners));
                    }
                }
            } while (this.postVisit && this.postVisit(ec) == true);
        };
    })();
};