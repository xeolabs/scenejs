var graph = SceneJs.graph(
        new SceneJs.node({
                preVisit: function(nodeContext) {
		    		var graphContext = nodeContext.getGraphContext();
                			graphContext.counter++;
                    }
             }
        )
    );

var graphContext = { counter: 0 };

while (graphContext.counter < 10) {
   	graph.traverse(graphContext);
}
