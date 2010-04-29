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
var SceneJS_materialModule = new (function() {

    var material;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                material = {
                    baseColor : [ 0.5, 0.5, 0.5 ],
                    specularColor: [ 0.0,  0.0,  0.0 ],
                    specular : 0,
                    shine : 0,
                    reflect : 0,
                    alpha : 1.0,
                    emit : 0.0
                };
                dirty = true;
            });


    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.MATERIAL_EXPORTED,
                            material);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setMaterial = function(m) {
        material = m;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.MATERIAL_UPDATED,
                material);
        dirty = true;
    };

    this.getMaterial = function() {
        return material;
    };
})();