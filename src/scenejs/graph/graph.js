SceneJs.graph = function() {

    var cfg = SceneJs.getConfig(arguments);

    var node = SceneJs.node(cfg);

    return SceneJs.apply(node, {
        traverse : function(cfg) {

            cfg = cfg || {};
            
            var graphContext = cfg.graphContext || new SceneJs.GraphContext({
                logger : cfg.logger,
                onError : cfg.onError,
                beforePreVisitElement : cfg.beforePreVisitElement,
                onPostVisitNode : cfg.onPostVisitNode
            });

            this.visit(new SceneJs.NodeContext(
                    graphContext,
                    null, // parentNodeContext
                    this, // node
                    [],   // childListeners
                    cfg.events)); // parentEvents

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
