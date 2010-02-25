/**
 * Backend module for material properties. Enables material node to set and get the current material,
 * handles lazy-load into shader whenever geometry about to render.
 */
SceneJS._backends.installBackend(

        "material",

        function(ctx) {

            var material;
            var loaded = false;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,        // Scene traversal begun - default material load pending
                    function() {
                        material = {
                            ambient:  [ 0.3, 0.3, 0.3 ], // R,G,B
                            diffuse:  [ 1,   1,   1   ],
                            specular: [ 1,   1,   1   ],
                            shininess:[ 0,   0,   1   ]
                        };
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,       // Shader activated - material load pending
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,     // Shader deactivated - material load pending
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING,     // Geometry about to render - do pending material load
                    function() {
                        if (!loaded) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [SceneJS._webgl.shaderVarNames.MATERIAL_AMBIENT, material.ambient]);

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [SceneJS._webgl.shaderVarNames.MATERIAL_DIFFUSE, material.diffuse]);

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [SceneJS._webgl.shaderVarNames.MATERIAL_SPECULAR, material.specular]);

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                                    [SceneJS._webgl.shaderVarNames.MATERIAL_SHININESS, material.shininess]);

                            loaded = true;
                        }
                    });

            return {   // Node-facing API

                setMaterial : function(m) {
                    material = m;
                    loaded = false;
                },

                getMaterial : function() {
                    return material;
                }
            };
        });