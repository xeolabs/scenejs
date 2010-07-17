/**
 * Backend that manages the current material properties.
 *
 * Services the SceneJS.material scene node, providing it with methods to set and get the current material.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MATERIAL_EXPORTED to pass the material properties to the shading backend.
 *
 * Avoids redundant export of the material properties with a dirty flag; they are only exported when that is set, which
 * occurs when material is set by the SceneJS.material node, or on SCENE_RENDERING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Sets the properties to defaults on SCENE_RENDERING.
 *
 * Whenever a SceneJS.material sets the material properties, this backend publishes it with a MATERIAL_UPDATED to allow
 * other dependent backends to synchronise their resources. One such backend is the shader backend, which taylors the
 * active shader according to the material properties.
 *
 *  @private
 */
SceneJS._materialModule = new (function() {

    var material;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                material = {
                    baseColor : [ 0.5, 0.5, 0.5 ],
                    specularColor: [ 0.9,  0.9,  0.9 ],
                    specular : 200,
                    shine : 1,
                    reflect : 0,
                    alpha : 1.0,
                    emit : 0.7
                };
                dirty = true;
            });


    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.MATERIAL_EXPORTED,
                            material);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    // @private
    this.setMaterial = function(m) {
        material = m;
        SceneJS._eventModule.fireEvent(
                SceneJS._eventModule.MATERIAL_UPDATED,
                material);
        dirty = true;
    };

    // @private
    this.getMaterial = function() {
        return material;
    };
})();