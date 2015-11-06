/**
 *  @private
 */
var SceneJS_events = new (function () {

    this.ERROR = 0;
    this.RESET = 1;                         // SceneJS framework reset
    this.NODE_CREATED = 2;                 // Scene has just been created
    this.SCENE_CREATED = 3;                 // Scene has just been created
    this.SCENE_COMPILING = 4;               // Scene about to be compiled and drawn
    this.SCENE_DESTROYED = 5;               // Scene just been destroyed
    this.OBJECT_COMPILING = 6;
    this.WEBGL_CONTEXT_LOST = 7;
    this.WEBGL_CONTEXT_RESTORED = 8;
    this.RENDER = 9;

    /* Priority queue for each type of event
     */
    var events = [];

    /**
     * Registers a handler for the given event and returns a subscription handle
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
     * @return {String} - Subscription handle
     */
    this.addListener = function (type, command, priority) {

        var list = events[type];

        if (!list) {
            list = [];
            events[type] = list;
        }

        var handler = {
            command:command,
            priority:(priority == undefined) ? list.length : priority
        };

        var index = -1;

        for (var i = 0, len = list.length; i < len; i++) {
            if (!list[i]) {
                index = i;
                break;
            }
        }

        if (index < 0) {
            list.push(handler);
            index = list.length - 1;
        }

//
//        for (var i = 0; i < list.length; i++) {
//            if (list[i].priority > handler.priority) {
//                list.splice(i, 0, handler);
//                return i;
//            }
//        }


        var handle = type + "." + index;

        return handle;
    };

    /**
     * Removes a listener
     * @param handle Subscription handle
     */
    this.removeListener = function (handle) {

        var lastIdx = handle.lastIndexOf(".");

        var type = parseInt(handle.substr(0, lastIdx));
        var index = parseInt(handle.substr(lastIdx + 1));

        var list = events[type];

        if (!list) {
            return;
        }

        delete list[index];
    };

    /**
     * @private
     */
    this.fireEvent = function (type, params) {

        var list = events[type];

        if (list) {
            params = params || {};
            for (var i = 0; i < list.length; i++) {
                if (list[i]) {
                    list[i].command(params);
                }
            }
        }
    };

})();


/**
 * Subscribe to SceneJS events
 * @deprecated
 */
SceneJS.bind = function (name, func) {
    switch (name) {

        case "error" :

            return SceneJS_events.addListener(SceneJS_events.ERROR, func);
            break;

        case "reset" :

            return SceneJS_events.addListener(
                SceneJS_events.RESET,
                function () {
                    func();
                });
            break;

        case "webglcontextlost" :

            return SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_LOST,
                function (params) {
                    func(params);
                });
            break;

        case "webglcontextrestored" :

            return SceneJS_events.addListener(
                SceneJS_events.WEBGL_CONTEXT_RESTORED,
                function (params) {
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

/* Unsubscribe from event
 */
SceneJS.unEvent = function (handle) {
    return SceneJS_events.removeListener(handle);
};

SceneJS.subscribe = SceneJS.addListener = SceneJS.onEvent = SceneJS.bind;

SceneJS.unsubscribe = SceneJS.unEvent;


SceneJS.on = SceneJS.onEvent;
SceneJS.off = SceneJS.unEvent;



