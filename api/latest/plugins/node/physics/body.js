/**
 * Physics rigid-body
 *
 * Documentation: https://github.com/xeolabs/scenejs/wiki/Physics
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/physics/physics"
],
    function (physics) {

        SceneJS.Types.addType("physics/body", {

            init:function (params) {

                // Don't need to set the pos and direction on our scene nodes
                // because that will will happen via an update from the physics
                // system once we have created the physics body.

                var translate = this.addNode({
                    type:"translate"
                });

                var rotate = translate.addNode({
                    type:"matrix",
                    nodes:params.nodes // Plugin node is responsible for attaching specified child nodes
                });

                // Get physics system for this scene
                // When params.systemId is undefined, get the default system for this scene
                this._system = physics.getSystem(this.getScene(), params.systemId);

                try {

                    // There must be no overlap in params for SceneJS and the physics system
                    // because we are just passing those params straight through to the system.

                    this._bodyId = this._system.createBody(params,
                        function (pos, dir) { // Body update handler
                            translate.setXYZ({ x:pos[0], y:pos[1], z:pos[2] });
                            rotate.setElements(dir);
                        });
                } catch (e) {
                    console.log("Failed to create 'physics/body' node ID '" + this.getId() + "' : " + e);
                }
            },

            preCompile:function () {
                if (this._bodyId != undefined) {
                    var material = window._sceneJSPhysicsMaterial;
                    if (material) {
                        // Inherit state from parent "physics/material" node
                        this._system.updateBody(this._bodyId, material);
                    }
                }
            },

            postCompile:function () {
                // Not used
            },

            destroy:function () {
                if (this._bodyId) {
                    this._system.removeBody(this._bodyId);
                }
                physics.putSystem(this._system);
            }
        });
    });
