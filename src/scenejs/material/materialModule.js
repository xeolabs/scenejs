/**
 * Backend that manages the current material properties.
 *
 * Services the SceneJS.material scene node, providing it with methods to set and get the current material.
 *
 * Interacts with the shading backend through events; on a SCENE_RENDERING event it will respond with a
 * MATERIAL_EXPORTED to pass the material properties to the shading backend.
 *
 * Avoids redundant export of the material properties with a dirty flag; they are only exported when that is set, which
 * occurs when material is set by the SceneJS.material node, or on SCENE_COMPILING, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Sets the properties to defaults on SCENE_COMPILING.
 *
 * Whenever a SceneJS.material sets the material properties, this backend publishes it with a MATERIAL_UPDATED to allow
 * other dependent backends to synchronise their resources. One such backend is the shader backend, which taylors the
 * active shader according to the material properties.
 *
 *  @private
 */
var SceneJS_materialModule = new (function() {

    var idStack = new Array(255);
    var materialStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setMaterial(idStack[stackLen - 1], materialStack[stackLen - 1]);
                    } else {
                        SceneJS_renderModule.setMaterial();
                    }
                    dirty = false;
                }
            });

    this.pushMaterial = function(id, m) {
        var top;
        if (stackLen > 0) {
            top = materialStack[stackLen - 1];
        } else {
            top = {
                override : false
            };
        }

        idStack[stackLen] = id;

        /* Copy the material because the Material node might be
         * mutated during the rest of the traversal
         */
        materialStack[stackLen] = {
            highlightBaseColor : (m.highlightBaseColor != undefined && !(top.override && top.highlightBaseColor != undefined)) ? [ m.highlightBaseColor.r, m.highlightBaseColor.g, m.highlightBaseColor.b ] : top.baseColor,
            baseColor : (m.baseColor != undefined && !(top.override && top.baseColor != undefined)) ? [ m.baseColor.r, m.baseColor.g, m.baseColor.b ] : top.baseColor,
            specularColor: (m.specularColor != undefined && !(top.override && top.specularColor != undefined)) ? [ m.specularColor.r, m.specularColor.g, m.specularColor.b ] : top.specularColor,
            specular : (m.specular != undefined && !(top.override && top.specular != undefined)) ? m.specular : top.specular,
            shine : (m.shine != undefined && !(top.override && top.shine != undefined)) ? m.shine : top.shine,
            reflect : (m.reflect != undefined && !(top.override && top.reflect != undefined )) ? m.reflect : top.reflect,
            alpha : (m.alpha != undefined && !(top.override && top.alpha != undefined )) ? m.alpha : top.alpha,
            emit : (m.emit != undefined && !(top.override && top.emit != undefined)) ? m.emit : top.emit,
            opacity : (m.opacity != undefined && !(top.override && top.opacity != undefined)) ? m.opacity : top.opacity
        };

        stackLen++;
        dirty = true;
    };

    this.popMaterial = function() {
        stackLen--;
        dirty = true;
    };

})();
