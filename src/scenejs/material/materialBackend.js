/**
 * Backend that manages the current material properties.
 *
 * Services the SceneJS.material scene node, providing it with methods to set and get the current material.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MATERIAL_EXPORTED to pass the material properties to the shading backend.
 *
 * Avoids redundant export of the material properties with a dirty flag; they are only exported when that is set, which
 * occurs when material is set by the SceneJS.material node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Sets the properties to defaults on SCENE_ACTIVATED.
 *
 * Whenever a SceneJS.material sets the material properties, this backend publishes it with a MATERIAL_UPDATED to allow
 * other dependent backends to synchronise their resources. One such backend is the shader backend, which taylors the
 * active shader according to the material properties.
 */
SceneJS._backends.installBackend(

        "material",

        function(ctx) {

            var material;
            var dirty;

            function colour4ToArray(v, fallback) {
                return v ?
                       [
                           v.r != undefined ? v.r : fallback[0],
                           v.g != undefined ? v.g : fallback[1],
                           v.b != undefined ? v.b : fallback[2],
                           v.a != undefined ? v.a : fallback[3]
                       ] : fallback;
            }

            function colour3ToArray(v, fallback) {
                return v ?
                       [
                           v.r != undefined ? v.r : fallback[0],
                           v.g != undefined ? v.g : fallback[1],
                           v.b != undefined ? v.b : fallback[2]
                       ] : fallback;
            }

            function _createMaterial(m) {
                return {
                    baseColor: colour4ToArray(m.baseColor, [ 0.2,  0.2,  0.2, 0.0]),       // IE. diffuse colour
                    specularColor: colour3ToArray(m.specularColor, [ 0.8,  0.8,  0.8]),
                    specular: m.specular || 0.0,
                    shine: m.shine || 0.0,
                    reflect: m.reflect || 0.0,
                    alpha: (m.alpha == undefined) ? 1.0 : m.alpha,
                    emit: m.emit || 0.0,
                    blendMode: m.blendMode || "multiply"
                };
            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        material = _createMaterial({});
                        dirty = true;
                    });


            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.MATERIAL_EXPORTED,
                                    material);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });


            /* Node-facing API
             */
            return {

                createMaterial: _createMaterial,

                setMaterial : function(m) {
                    material = m;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.MATERIAL_UPDATED,
                            material);
                    dirty = true;
                },

                getMaterial : function() {
                    return material;
                }
            };
        });