var graph = SceneJs.graph( 

        SceneJs.node({
                childListeners: {
                    'alpha': {
                        fn: function(nodeContext, event) {

                            // Event 'alpha' has bubbled up and is handled here again at step 3.

                            alert('Event name ' + event.name + ' handled with params '
                                    + event.foo + " and " + event.bar);
                        }
                    }
                }
            },

            SceneJs.node({
                    childListeners: {
                        'alpha': {
                            fn: function(nodeContext, event) {

                                // Event 'alpha' is handled here at step 2.
                            }
                        },
                        'beta': {
                            fn: function(nodeContext, event) {

                                // Event 'beta' is handled here at step 4.
                                // Consume it so it doesnt bubble up to parent.

                                event.consumed = true;
                            }
                        }
                    }
                },

                SceneJs.node({
                        preVisit : function(nodeContext) {

                            // Events alpha' and 'beta' are fired from here at step 1.

                            nodeContext.fireChildEvent('alpha', {
                                foo: 'foo value',
                                bar: 'bar value'
                            });

                            nodeContext.fireChildEvent('beta', {
                                foo: 'foo value',
                                bar: 'bar value'
                            });
                        }
                }) // SceneJs.node
            ) // SceneJs.node
        ) // SceneJs.node
    ); // SceneJs.frontend

graph.render();
