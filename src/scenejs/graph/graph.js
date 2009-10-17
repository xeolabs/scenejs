SceneJs.graph = function() {

    var cfg = SceneJs.getConfig(arguments);

    return new SceneJs.apply(SceneJs.node(cfg), {
        traverse : function(graphContext) {

            if (!graphContext) {
                graphContext = new SceneJs.GraphContext({
                    logger : cfg.logger,
                    onError : cfg.onError,
                    beforePreVisitElement : cfg.beforePreVisitElement,
                    onPostVisitNode : cfg.onPostVisitNode
                });
            }

            this.visit(new SceneJs.NodeContext(
                    graphContext,
                    null, // parentNodeContext
                    this, // node
                    []));     // childListeners

            if (cfg.onFrame) {
                if (!cfg.onFrame.fn) {
                    throw 'onFrame fn not defined';
                }
                cfg.onFrame.fn.call(cfg.onFrame.scope || this, graphContext, this);
            }

            graphContext.reset = false;

            return graphContext;
        }
    });
};
