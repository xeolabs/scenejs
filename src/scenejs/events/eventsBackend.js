/**
 * Backend module that defines SceneJS events and provides an interface on the backend context through which
 * backend modules can fire and subscribe to them.
 *
 * Events are actually somewhat more like commands; they are always synchronous, and are often used to decouple the
 * transfer of data between backends, request events in response, and generally trigger some immediate action.
 *
 * Event subscription can optionally be prioritised, to control the order in which the subscriber will be notified of
 * a given event relative to other suscribers. This is useful, for example, when a backend must be the first to handle
 * an INIT, or the last to handle a RESET.
 *
 */

/**
 * Types of events that occur among backend modules. These are given values by the
 * events backend module when it is installed. When you add your own, just give them
 * a zero value like these ones.
 */
SceneJS._eventTypes = {
    ERROR : 0,

    INIT : 0,                           // SceneJS framework initialised
    RESET : 0,                          // SceneJS framework reset

    TIME_UPDATED : 0,                   // System time updated

    SCENE_CREATED : 0,                  // Scene has just been created
    SCENE_ACTIVATED : 0,                // Scene about to be traversed
    SCENE_DEACTIVATED : 0,              // Scene just been completely traversed
    SCENE_DESTROYED : 0,                // Scene just been destroyed

    RENDERER_UPDATED: 0,                // Current WebGL context has been updated to the given state
    RENDERER_EXPORTED: 0,               // Export of the current WebGL context state

    CANVAS_ACTIVATED : 0,
    CANVAS_DEACTIVATED : 0,

    VIEWPORT_UPDATED : 0,               // Viewport updated

    GEOMETRY_EXPORTED : 0,              // Export of geometry for rendering

    MODEL_TRANSFORM_UPDATED : 0,        // Model transform matrix updated
    MODEL_TRANSFORM_EXPORTED : 0,       // Export transform matrix for rendering

    PROJECTION_TRANSFORM_UPDATED : 0,   // 
    PROJECTION_TRANSFORM_EXPORTED : 0,

    VIEW_TRANSFORM_UPDATED : 0,
    VIEW_TRANSFORM_EXPORTED : 0,

    LIGHTS_UPDATED : 0,
    LIGHTS_EXPORTED : 0,

    MATERIAL_UPDATED : 0,
    MATERIAL_EXPORTED : 0,

    TEXTURES_UPDATED : 0,              // Texture activated after a texture node visited
    TEXTURES_EXPORTED : 0,

    SHADER_ACTIVATE : 0,

    SHADER_ACTIVATED : 0,
    SHADER_RENDERING : 0,
    SHADER_DEACTIVATED : 0 ,

    FOG_UPDATED: 0,
    FOG_EXPORTED: 0,

    NAME_UPDATED: 0,

    PROCESS_CREATED: 0,
    PROCESS_KILLED: 0,
    PROCESS_TIMED_OUT: 0

};

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
            function onEvent(type, command, priority) {
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
            }

            function fireEvent(type, params) {
                var list = events[type];
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        list[i].command(params || {});
                    }
                }
            }

            /* Backend-facing API
             */
            ctx.events = {
                onEvent : onEvent,
                fireEvent : fireEvent
            };

            /* Node-facing API            
             */
            return {
                onEvent : onEvent,
                fireEvent : fireEvent
            };
        });