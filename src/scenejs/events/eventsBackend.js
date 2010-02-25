/**
 * Types of events that occur among backend modules. These are given values by the
 * events backend module when it is installed. When you add your own, just give them
 * a zero value like these ones.
 */
SceneJS._eventTypes = {
    INIT : 0,                           // SceneJS framework initialised 
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
    TEXTURE_DEACTIVATED : 0,            // Texture deactivated after a texture node departed from
    TEXTURE_ENABLED : 0,                // Texturing enabled (allows default texturing shader to be selected)
    TEXTURE_DISABLED : 0,               // Texturing disabled (allows default non-texturing shader to be selected)
    SHADER_SAMPLER_BIND : 0,            // Response to GEOMETRY_RENDERING, provides texture for loading into shader
    VARS_UPDATED : 0,                   // Shader vars updated after a vars node visited
    SHADER_UNIFORM_SET : 0 ,            // Load a value into a target uniform within the active shader
    SHADER_FLOAT_ARRAY_BUFFER : 0        // Bind an ARRAY_BUFFER VBO to an attribute within the active shader

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

                /**
                 * Registers a handler for the given event
                 *
                 * The handler can be registered with an optional priority number which specifies the order it is
                 * called among the other handler already registered for the event.
                 *
                 * So, with n being the number of commands registered for the given event:
                 *
                 * (priority <= 0)      - command will be the first called
                 * (priority >= n)      - command will be the last called
                 * (0 < priority < n)   - command will be called at the order given by the priority
                 *
                 * @param type Event type - one of the values in SceneJS._eventTypes
                 * @param command - Handler function that will accept whatever parameter object accompanies the event
                 * @param priority - Optional priority number (see above)
                 */
                onEvent: function(type, command, priority) {
                    var list = events[type];
                    if (!list) {
                        list = [];
                        events[type] = list;
                    }
                    var handler = {
                        command: command,
                        priority : (priority == undefined) ? list.length : priority
                    };
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].priority > handler.priority) {
                            list.splice(i, 0, handler);
                            return;
                        }
                    }
                    list.push(handler);
                },

                fireEvent: function(type, params) {
                    var list = events[type];
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            list[i].command(params || {});
                        }
                    }
                }
            };
        });