/**
 * Configures a proximity culling system
 *
 *  myNode.addNode({
 *      type: "proximity/system",
 *      id: "mySystem",
 *      radii: [1000, 2000, 4000]
 *  });
 *
 *  myScene.getNode("mySystem",
 *      function(mySystem) {
 *          mySystem.setRadii([1000,3000,5000]);
 *      });
 *
 *  TODO:
 *
 *  Handle load/unload for nodes that are added with #addNode and #addNodes etc
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/proximity/proximitySystemPool"
],
    function (pool) {

        SceneJS.Types.addType("proximity/system", {

            init:function (params) {

                // We'll create the system on pre-compile, where we can find the parent lookat

                this._radii = params.radii || [1000, 2000, 4000];
                this._systemId = params.systemId;

               if (params.nodes) {
                   this.addNodes(params.nodes);
               }
            },

            preCompile:function () {
                this._build();
            },

            _build:function () {
                this._putSystem();
                var lookat = this.getParentOfType("lookAt");
                if (!lookat) {
                    console.log("Failed to create 'proximity/system' node ID '" + this.getId()
                        + "' : mandatory parent 'lookat' node not found");
                } else {
                    this._system = pool.getSystem(this.getScene(), lookat, this._systemId);
                    this._system.setConfigs({
                        radii:this._radii
                    });
                }
            },

            _putSystem:function () {
                if (this._bodyId) {
                    this._system.removeBody(this._bodyId);
                    this._bodyId = null;
                }
                if (this._systemId) {
                    pool.putSystem(this._system);
                    this._systemId = null;
                }
            },

            setRadii:function (radii) {
                this._radii = radii;
                if (this._system) {
                    this._system.setConfigs({
                        radii:this._radii
                    });
                }
            },

            getRadii:function () {
                return this._radii;
            },

            postCompile:function () {
                // Not used
            },

            destroy:function () {
                this._putSystem();
            }
        });
    });
