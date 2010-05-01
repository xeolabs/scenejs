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
 * @private
 */
var SceneJS_eventModule = new (function() {

    this.ERROR = 0;
    this.INIT = 1;                           // SceneJS framework initialised
    this.RESET = 2;                          // SceneJS framework reset
    this.TIME_UPDATED = 3;                   // System time updated
    this.SCENE_CREATED = 4;                  // Scene has just been created
    this.SCENE_ACTIVATED = 5;                // Scene about to be traversed
    this.SCENE_DEACTIVATED = 6;              // Scene just been completely traversed
    this.SCENE_DESTROYED = 7;                // Scene just been destroyed
    this.RENDERER_UPDATED = 8;                // Current WebGL context has been updated to the given state
    this.RENDERER_EXPORTED = 9;               // Export of the current WebGL context state
    this.CANVAS_ACTIVATED = 10;
    this.CANVAS_DEACTIVATED = 11;
    this.VIEWPORT_UPDATED = 12;
    this.GEOMETRY_UPDATED = 13;
    this.GEOMETRY_EXPORTED = 14;
    this.MODEL_TRANSFORM_UPDATED = 15;
    this.MODEL_TRANSFORM_EXPORTED = 16;
    this.PROJECTION_TRANSFORM_UPDATED = 17;
    this.PROJECTION_TRANSFORM_EXPORTED = 18;
    this.VIEW_TRANSFORM_UPDATED = 19;
    this.VIEW_TRANSFORM_EXPORTED = 20;
    this.LIGHTS_UPDATED = 21;
    this.LIGHTS_EXPORTED = 22;
    this.MATERIAL_UPDATED = 23;
    this.MATERIAL_EXPORTED = 24;
    this.TEXTURES_UPDATED = 25;
    this.TEXTURES_EXPORTED = 26;
    this.SHADER_ACTIVATE = 27;
    this.SHADER_ACTIVATED = 28;
    this.SHADER_RENDERING = 29;
    this.SHADER_DEACTIVATED = 30;
    this.FOG_UPDATED = 31;
    this.FOG_EXPORTED = 32;
    this.NAME_UPDATED = 33;
    this.PROCESS_CREATED = 34;
    this.PROCESS_KILLED = 35;
    this.PROCESS_TIMED_OUT = 36;

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
     * @param type Event type - one of the values in SceneJS_eventModule
     * @param command - Handler function that will accept whatever parameter object accompanies the event
     * @param priority - Optional priority number (see above)
     */
    this.onEvent = function(type, command, priority) {
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


/** <p>Adds a listener to be notified when a given event occurs within SceneJS.</p>
 * <p><b>Supported events</b></p>
 * <p><b><em>error</em></b></p><p>An error has occurred either while defining or rendering a scene. These can be either fatal,
 * or errors that SceneJS can recover from.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "error",
 *      function(e) {
 *          var exception = e.exception;
 *          if (e.fatal) {
 *               alert("Fatal error: " + e.exception.message || e.exception);
 *          } else {
 *               alert("Recovered from error: " + e.exception.message || e.exception);
 *          }
 *      });
 * </pre></code>
 *
 * <p><b><em>reset</em></b></p><p>The SceneJS framework has been reset, where all SceneJS.Scene instances are destroyed and resources
 * held for them freed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "reset",
 *      function(e) {
 *          alert("SceneJS has been reset");
 *      });
 * </pre></code>

 * <p><b><em>scene-created</em></b></p><p>A SceneJS.Scene has been defined.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-created",
 *      function(e) {
 *          alert("A new Scene has been created - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-activated</em></b></p><p>Traversal (render) of a SceneJS.Scene has just begun.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-activated",
 *      function(e) {
 *          alert("Rendering of a new Scene has just begun - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>canvas-activated</em></b></p><p>A canvas has just been activated for a Scene, where the Scene is about to start
 * rendering to it. This will come right after a "scene-activated" event, which will indicate which Scene is the one
 * about to do the rendering.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "canvas-activated",
 *      function(e) {
 *          var canvas = e.canvas;
 *          var context = e.context;
 *          var canvasId = e.canvasId;
 *          alert("Canvas is about to be rendered to : " + canvasId);
 *      });
 * </pre></code>
 *
 * <p><b><em>process-created</em></b></p><p>An asynchronous process has started within a Scene. Processes track the progress of
 * tasks such as the loading of remotely-stored content by SceneJS.Load and SceneJS.LoadCollada nodes. This event is
 * paticularly useful to monitor for content loading. Since loads are triggered in one scene traversal, and then loaded
 * content is integrated during a subsequent traversal, you might listen for this along with "process-killed" on a
 * non-animated scene to ensure that a final scene image is rendered once all loads have completed and content
 * integrated.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-created",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>process-timed-out</em></b></p><p>An asynchronous process has timed out. This will be followed by a "process-killed" event.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-timed-out",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>process-killed</em></b></p><p>An asynchronous process has finished.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-killed",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-deactivated</em></b></p><p>A SceneJS.Scene traversal has completed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-created",
 *      function(e) {
 *          alert("Traversal completed for Scene - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-destroyed</em></b></b></p><p>A SceneJS.Scene traversal has been destroyed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-destroyed",
 *      function(e) {
 *          alert("Scene has been destroyed - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 * @param name Event name
 * @param func Callback function
 */
SceneJS.onEvent = function(name, func) {
    switch (name) {

        /**
         * @event error
         * Fires when the data cache has changed in a bulk manner (e.g., it has been sorted, filtered, etc.) and a
         * widget that is using this Store as a Record cache should refresh its view.
         * @param {Store} this
         */
        case "error" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.ERROR,
                function(params) {
                    func({
                        exception: params.exception,
                        fatal: params.fatal
                    });
                });
            break;

        case "reset" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.RESET,
                function() {
                    func();
                });
            break;

        case "scene-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_CREATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_ACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "canvas-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.CANVAS_ACTIVATED,
                function(params) {
                    func({
                        canvas: params.canvas
                    });
                });
            break;

        case "process-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_CREATED,
                function(params) {
                    func(params);
                });
            break;

        case "process-timed-out" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_TIMED_OUT,
                function(params) {
                    func(params);
                });
            break;

        case "process-killed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_KILLED,
                function(params) {
                    func(params);
                });
            break;

        case "scene-deactivated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DEACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-destroyed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DESTROYED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        default:
            throw "SceneJS.onEvent - this event type not supported: '" + name + "'";
    }
};

