SceneJs.Selector = function(cfg) {
    cfg = cfg || {};
    var selection = [];
    this.reset = function() {
        selection = [];
    };
    this.reset();

    this.selectChild = function(childIndex) {
        selection['' + childIndex] = true;
    };

    this.deselectChild = function(childIndex) {
        return selection['' + childIndex] = false;
    };

    this.isChildSelected = function(childIndex) {
        return selection['' + childIndex];
    };

    this.deselectAllChildren = function() {
        selection = [];
    };

    this.selectAllChildren = function() {
        this.deselectAllChildren();
        var numChildren = this.getNumChildren();
        for (var i = 0; i < numChildren; i++) {
            this.selectChild(i);
        }
    };

    SceneJs.Selector.superclass.constructor.call(this,
            SceneJs.apply(cfg, {
                filterChild : function(childIndex) {
                    return selection['' + childIndex];
                }
            }));
};

SceneJs.extend(SceneJs.Selector, SceneJs.Node, {
    getType: function() {
        return 'selector';
    }
});
