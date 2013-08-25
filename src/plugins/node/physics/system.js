/**
 * Configuration for a physics system
 *
 * Documentation: https://github.com/xeolabs/scenejs/wiki/Physics
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/physics/physics"
],
    function (physics) {

        SceneJS.Types.addType("physics/system", {

            init:function (params) {

                // Get physics system for this scene
                this._system = physics.getSystem(this.getScene(), params.systemId);

                try {

                    // There must be no overlap in params for SceneJS and the physics system
                    // because we are just passing those params straight through to the system

                    this.setConfigs(params);
                } catch (e) {
                    console.log("Failed to create 'physics/system' node ID '" + this.getId() + "' : " + e);
                }
            },

            /**
             * Configures the physics system
             * @param params
             */
            setConfigs:function (params) {
                this._system.setConfigs(params);
            },

            destroy:function () {
                physics.putSystem(this._system);
            }
        });
    });
