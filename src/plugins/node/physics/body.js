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

                // Check params
                var shape = params.shape;
                if (!shape) {
                    console.log("import/obj param missing: shape - won't create body");
                    this.addNodes(params.nodes); // Add child nodes nonetheless
                    return;
                }

                // Get physics system for this scene
                // TODO: support multiple systems per scene with an optional "systemId" param
                this._system = physics.getSystem(this.getScene());

                var translate = this.addNode({
                    type:"translate"
                });

                var rotate = translate.addNode({
                    type:"matrix",
                    nodes:params.nodes // Plugin node is responsible for attaching specified child nodes
                });

                this._bodyId = this._system.createBody({
                        shape:shape
                    },
                    function (pos, dir) { // Body update handler
                        translate.setXYZ({ x:pos[0], y:pos[1], z:pos[2] });
                        //  rotate.setElements(dir);
                    });
            },

            destroy:function () {
                if (this._system) {
                    this._system.removeBody(this._bodyId);
                    physics.putSystem(this._system);
                }
            }
        });
    });
