/**
 *  @private
 */
var SceneJS_events = new (function() {

    this.ERROR = 0;
    this.RESET = 1;                         // SceneJS framework reset

    this.SCENE_CREATED = 2;                 // Scene has just been created
    this.SCENE_COMPILING = 3;               // Scene about to be compiled and drawn
    this.SCENE_DESTROYED = 4;               // Scene just been destroyed
    this.OBJECT_COMPILING = 5;
    this.WEBGL_CONTEXT_LOST = 6;
    this.WEBGL_CONTEXT_RESTORED = 7;


    /* Priority queue for each type of event
     */
    var events = new Array(37);

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
     * @private
     * @param type Event type - one of the values in SceneJS_events
     * @param command - Handler function that will accept whatever parameter object accompanies the event
     * @param priority - Optional priority number (see above)
     */
    this.addListener = function(type, command, priority) {
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
    };

    /**
     * @private
     */
    this.fireEvent = function(type, params) {
        var list = events[type];
        if (list) {
            if (!params) {
                params = {};
            }
            for (var i = 0; i < list.length; i++) {
                list[i].command(params);
            }
        }
    };
        
})();

/**
 * Subscribe to SceneJS events
 * @deprecated
 */
SceneJS.bind = function(name, func) {
    switch (name) {

        case "error" : SceneJS_events.addListener(SceneJS_events.ERROR, func);
            break;

        case "reset" : SceneJS_events.addListener(
                SceneJS_events.RESET,
                function() {
                    func();
                });
            break;

     case "webglcontextlost" : SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_LOST,
                function(params) {
                    func(params);
                });
            break;

    case "webglcontextrestored" : SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_RESTORED,
                function(params) {
                    func(params);
                });
            break;

        default:
            throw SceneJS_error.fatalError("SceneJS.bind - this event type not supported: '" + name + "'");
    }
};

/* Subscribe to SceneJS events
 * @deprecated
 */
SceneJS.onEvent = SceneJS.bind;

SceneJS.addListener = SceneJS.onEvent = SceneJS.bind;