SceneJS_NodeStateInheritance = new function () {

    var typesRules = {};
    var nodesBindings = {};

    this.addBinding = function (nodeType, topic, method) {
        (typesRules[nodeType] || (typesRules[nodeType] = [])).push([topic, method]);
    };

    this.bind = function (child) {
        if (!typesRules[child.type]) {
            return; // No bindings
        }
        this._unbind(child);
        var parent = child.getParentOfType(child.type);
        var rules = typesRules[child.type];
        var bindings = nodesBindings[child.id] ||
            (nodesBindings[child.id] = {
                parent:parent,
                handles:[],
                numHandles:0
            });
        for (var i = 0, len = rules.length; i < len; i++) {
            (function () {
                var _child = child;
                var topic = rules[i][0];
                var method = rules[i][1];
                bindings.handles[bindings.numHandles++] = parent.on(topic,
                    function (data) {
                        method.call(_child, data);
                    });
            })();
        }
    };

    this._unbind = function (child) {
        var bindings = nodesBindings[child.id];
        if (!bindings) {
            return;
        }
        var parent = bindings.parent;
        if (!parent) {
            return;
        }
        for (var i = 0, handles = bindings.handles, len = bindings.numHandles; i < len; i++) {
            parent.off(handles[i]);
        }
        bindings.parent = null;
        bindings.numHandles = 0;
    };

    this.nodeDestroyed = function (child) {
        if (nodesBindings[child.id]) {
            this._unbind(child);
            delete nodesBindings[child.id];
        }
    }
}();