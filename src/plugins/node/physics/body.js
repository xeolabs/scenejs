/**
 * Physics rigid-body
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/physics/physics"
],
    function (physics) {

        SceneJS.Types.addType("physics/body", {

            init:function (params) {

                var translate = this.addNode({
                    type:"translate"
                    // TODO: set pos
                });

                var rotate = translate.addNode({
                    type:"matrix",
                    nodes:params.nodes // Plugin node is responsible for attaching specified child nodes
                });

                // Check params
                var shape = params.shape;
                if (!shape) {
                    console.log("Failed to create 'physics/body' node ID '"
                        + this.getId() + "' - param missing: 'shape'");
                    return;
                }

                // Get physics system for this scene
                this._system = physics.getSystem(this.getScene());

                try {
                    this._bodyId = this._system.createBody({
                            shape:shape
                        },
                        function (pos, dir) { // Body update handler
                            translate.setXYZ({ x:pos[0], y:pos[1], z:pos[2] });
                            //  rotate.setElements(dir);
                        });
                } catch (e) {
                    console.log("Failed to create 'physics/body' node ID '" + this.getId() + "' : " + e);
                }
            },

            destroy:function () {
                if (this._bodyId) {
                    this._system.removeBody(this._bodyId);
                }
                if (this._system) {
                    physics.putSystem(this._system);
                }
            }
        });
    });
