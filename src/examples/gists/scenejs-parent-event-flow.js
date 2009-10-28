var graph = SceneJs.graph(
    SceneJs.node({
            preVisit:function(nodeContext) {
                // Events 'alpha' and 'beta' are fired from here at Step 1.

			    nodeContext.fireParentEvent('alpha', {
				    foo: 'foo value',
				    bar: 'bar value'
			    });

			    nodeContext.fireParentEvent('beta', {
				    foo: 'foo value',
				    bar: 'bar value'
			    });
            }
        },

        SceneJs.node({
                parentListeners: {
                    'alpha': {
					    fn: function(nodeContext, event) {

						    // Event 'alpha' is handled here at step 2 and is consumed so that it stops here.
						    // Parent events are handled just prior to preVisit.

                            event.consumed = true;
					    }
				    },
				    'beta': {
					    fn: function(nodeContext, event) {

						    // Event 'beta' is handled here at step 3.
					    }
				    }
                }
            }), // SceneJs.node

            SceneJs.node({
                    parentListeners: {
				        'beta' : {
					        fn: function(nodeContext, event) {

						        // Event 'beta' is handled again here at step 4.
					        }
				        }
                    }
                },

                SceneJs.node(
                    SceneJs.Node({
                            parentListeners: {
                                'beta': {
						            fn: function(nodeContext, event) {

							            // Event 'beta' is handled yet again here at step 5.
						            }
                                }
                            }
                        })
                    ) // SceneJs.node
                ) // SceneJs.node
            ) // SceneJs.node
        ); // SceneJs.frontend

graph.render();
