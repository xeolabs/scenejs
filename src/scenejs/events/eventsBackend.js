/**
 * Types of events that occur among backend modules. These are given values by the
 * events backend module when it is installed. When you add your own, just give them
 * a zero value like these ones.
 */
SceneJS._eventTypes = {
    RESET : 0,                          // SceneJS framework global reset
    TIME_UPDATED : 0,                   // System time updated
    SCENE_CREATED : 0,                  // Scene defined
    SCENE_DESTROYED : 0,                // Scene destroyed
    SCENE_ACTIVATED : 0,                // Scene traversal begun
    SCENE_DEACTIVATED : 0,              // Scene traversal complete
    CANVAS_ACTIVATED : 0,               // Canvas activated after renderer scene node visited
    CANVAS_DEACTIVATED : 0,             // Canvas deactivated after renderer scene node visited
    SHADER_ACTIVATED : 0,               // Shader activated after shading node visited
    SHADER_DEACTIVATED : 0,             // Program deactivated after a shader scene node departed from
    GEOMETRY_RENDERING : 0,             // Geometry is about to render, shader elements are implicitly requested
    MODEL_TRANSFORM_UPDATED : 0,        // Modelling transform updated after a modelling transform scene node visited
    PROJECTION_TRANSFORM_UPDATED : 0,   // View transform updated after a projection transform scene node visited
    VIEW_TRANSFORM_UPDATED : 0,         // View transform updated after a view transform node visited
    LIGHTS_UPDATED : 0,                 // Light sources updated after a lights node visited
    TEXTURE_ACTIVATED : 0,              // Texture activated after a texture node visited
    TEXTURE_ENABLED : 0,                // Texturing enabled (allows default texturing shader to be selected)
    TEXTURE_DISABLED : 0,               // Texturing disabled (allows default non-texturing shader to be selected)
    SHADER_SAMPLER_BIND : 0,            // Response to GEOMETRY_RENDERING, provides texture for loading into shader
    VARS_UPDATED : 0,                   // Shader vars updated after a vars node visited
    SHADER_UNIFORM_SET : 0 ,            // Load a value into a target uniform within the active shader
    SHADER_ARRAY_BUFFER_BIND : 0        // Bind an ARRAY_BUFFER VBO to an attribute within the active shader

};

/**
 * Backend module to route events between backend modules
 */
SceneJS._backends.installBackend(

        "events",

        function(ctx) {

            /* Initialise event types list
             */
            var nevents = 0;
            for (var key in SceneJS._eventTypes) {
                SceneJS._eventTypes[key] = nevents;
                nevents++;
            }
            var events = new Array(nevents);

            /* Node-facing API
             */
            ctx.events = {

                onEvent: function(type, command) {
                    var list = events[type];
                    if (!list) {
                        list = [];
                        events[type] = list;
                    }
                    list.push(command);
                },

                fireEvent: function(type, params) {
                 
                    var list = events[type];
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            list[i](params || {});
                        }
                    }
                }
            };
        });