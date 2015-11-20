/**
 * A physics body
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Documentation at: http://xeolabs.com/articles/scenejs-physics/</p>
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/physics/physics"
],
    function (physics) {

        SceneJS.Types.addType("physics/body", {

            construct:function (params) {

                // Don't need to provide initial attributes for our scene nodes
                // because that will will happen via an update from the physics
                // system once we have created the physics body.

                var translate;
                var rotate;

                if (params.shape == "sphere") {

                    // No point in rotating a sphere
                    translate = this.addNode({
                        type:"translate",
                        nodes:params.nodes
                    });

                } else {

                    translate = this.addNode({
                        type:"translate"
                    });

                    rotate = translate.addNode({
                        type:"matrix",
                        nodes:params.nodes // Plugin node is responsible for attaching specified child nodes
                    });
                }

                // Get physics system for this scene
                // When params.systemId is undefined, get the default system for this scene
                this._system = physics.getSystem(this.getScene(), params.systemId);

                try {

                    // There must be no overlap in params for SceneJS and the physics system
                    // because we are just passing those params straight through to the system.

                    this._bodyId = this._system.createBody(params,
                        function (pos, dir) { // Body update handler
			    var tmp = pos.slice(3, 19);
			    translate.setXYZ({ x:pos[0], y:pos[1], z:pos[2] });
                            if (rotate) {
				dir = SceneJS_math_transposeMat4(tmp);
				rotate.setMatrix(dir);
                            }
                        });
                } catch (e) {
                    this.log("error", e);
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

            destruct:function () {
                if (this._bodyId) {
                    this._system.removeBody(this._bodyId);
                }
                physics.putSystem(this._system);
            }
        });
    });
