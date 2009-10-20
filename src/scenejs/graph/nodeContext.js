SceneJs.NodeContext = function(_graphContext, _parent, _node, _childListeners, _parentEvents) {
    var graphContext = _graphContext;
    var parent = _parent;
    var node = _node;
    var parentEvents = _parentEvents || {};
    var childListeners = _childListeners;

    this.getGraphContext = function() {
        return graphContext || parent.getGraphContext();
    };

    this.getElement = function() {
        return node;
    };

    this.getParent = function() {
        return parent;
    };

    /** Fires parent event, replacing any parent event of same name already existing, to be handled by children
     * who are listening for it when they are visited
     */
    this.fireParentEvent = function(name, params) {
        parentEvents[name] = new SceneJs.Event(name, params);
    };

    /** Returns given parent event from this context, or from first higher context up the parent chain
     * that has the given parent event. Result is undefined if no such parent event found.
     */
    this.getParentEvent = function(name) {
        var event = parentEvents[name];
        if (event && !event.consumed) {
            return event;
        }
        return parent ? parent.getParentEvent(name) : undefined;
    };

    this.getChildListeners = function() {
        return childListeners;
    };

    /** Fires a child event, which is handled immediately by the parent node if the parent is listening for it.
     * If it is was consumed, it stops there, otherwise it is fired at the parent node context, recursively.
     *
     */
    this.fireChildEvent = function(name, params) {
        var event = new SceneJs.Event(name, params);
        var listener = childListeners[name];
        if (listener != undefined) {
                listener.fn.call(listener.scope || this, parent, event);  // Child listeners belong to parent - use that context         
        }
        if (!event.consumed) {
            if (parent) {
                parent.fireChildEvent(name, params);
            }
        }
    };
};
