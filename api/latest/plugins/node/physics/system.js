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
                // When params.systemId is undefined, get the default system for this scene
                this._system = physics.getSystem(this.getScene(), params.systemId);

                this.setConfigs(params);
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
