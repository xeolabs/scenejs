/**
 *
 * @param cfg
 */
SceneJs.Viewport = function(cfg) {
    cfg = cfg || {};

    var init = function() {
        this.x = cfg.x || 0;
        this.y = cfg.x || 0;
        this.width = cfg.width || 100;
        this.height = cfg.height || 100;
    };

    init.call(this);
    
    this.reset = function() {
        init();
    };  

    this.preVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.setViewport(this.x, this.y, this.width, this.height);
        }
        nodeContext.getGraphContext().viewport = { x : this.x, y: this.y, width: this.width, height : this.height };
    };

    this.postVisit = function(nodeContext) {
        var backend = SceneJs.Backend.getNodeBackend(this.getType());
        if (backend) {
            backend.destroyViewport();
        }
        nodeContext.getGraphContext().viewport = undefined;
    };

    SceneJs.Viewport.superclass.constructor.call(this,
            SceneJs.apply(cfg, {  getType : function() {
                return 'viewport';
            }}));
};

SceneJs.extend(SceneJs.Viewport, SceneJs.Node, {
});




