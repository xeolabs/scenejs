/**
 * Container of proximity systems
 */
define([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/proximity/proximitySystem"
],
    function (ProximitySystem) {

        // Proximity systems
        var items = {};

        return  {

            /**
             * Acquire a ProximitySystem for the given SceneJS scene and lookat node, creating first if not existing
             * @param {SceneJS.Scene} scene
             * @param {SceneJS.Lookat} lookat node
             * @param {String} [systemId] Optional systemId
             * @return {ProximitySystem} The system
             */
            getSystem:function (scene, lookat, systemId) {
                systemId = systemId
                    ? scene.getId() + "." + lookat.getId() + "." + systemId // Custom system for scene and lookat
                    : scene.getId() + "." + lookat.getId(); // Default system for scene and lookat
                var item = items[systemId];
                if (item) {
                    item.useCount++;
                    return item.system;
                }
                var system = new ProximitySystem(systemId);
                items[systemId] = {
                    useCount:1,
                    system:system,
                    scene:scene,
                    tick:scene.on("tick", // Start integrating the system on scene tick
                        function () {
                            var eye = lookat.getEye();
                            system.setConfigs({ center: [eye.x, eye.y, eye.z ] });
                            system.integrate();
                        })
                };
                return system;
            },

            /**
             * Release a proximity system, destroying it if no more users
             * @param {ProximitySystem} system
             */
            putSystem:function (system) {
                var item = items[system.systemId];
                if (item) {
                    if (item.useCount-- <= 0) {
                        item.system.destroy();
                        item.scene.off(item.tick); // Stop integrating the system
                        delete items[system.systemId];
                    }
                }
            }
        };
    });