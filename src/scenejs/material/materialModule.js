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
    var materialStack = [];
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                materialStack = [
                    {
                        override : false
                    }
                ];
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
                            materialStack[materialStack.length - 1]);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushMaterial = function(m) {
        var top = materialStack[materialStack.length - 1];

        /* Copy the material because the Material node might be
         * mutated during the rest of the traversal
         */
        materialStack.push({
            highlightBaseColor : (m.highlightBaseColor != undefined && !(top.override && top.highlightBaseColor != undefined)) ? [ m.highlightBaseColor.r, m.highlightBaseColor.g, m.highlightBaseColor.b ] : top.baseColor,
            baseColor : (m.baseColor != undefined && !(top.override && top.baseColor != undefined)) ? [ m.baseColor.r, m.baseColor.g, m.baseColor.b ] : top.baseColor,
            specularColor: (m.specularColor != undefined && !(top.override && top.specularColor != undefined)) ? [ m.specularColor.r, m.specularColor.g, m.specularColor.b ] : top.specularColor,
            specular : (m.specular != undefined && !(top.override && top.specular != undefined)) ? m.specular : top.specular,
            shine : (m.shine != undefined && !(top.override && top.shine != undefined)) ? m.shine : top.shine,
            reflect : (m.reflect != undefined && !(top.override && top.reflect != undefined )) ? m.reflect : top.reflect,
            alpha : (m.alpha != undefined && !(top.override && top.alpha != undefined )) ? m.alpha : top.alpha,
            emit : (m.emit != undefined && !(top.override && top.emit != undefined)) ? m.emit : top.emit,
            opacity : (m.opacity != undefined && !(top.override && top.opacity != undefined)) ? m.opacity : top.opacity
        });
        dirty = true;
    };

    this.popMaterial = function() {
        materialStack.pop();
        dirty = true;
    };

})();
