/**
 * The SceneJS object.
 */
var SceneJS = new (function () {

    /**
     * This SceneJS version
     */
    this.VERSION = '3.0.0.0';


    this._baseStateId = 0;

    /**
     * @property {SceneJS_Engine} Engines currently in existance
     */
    this._engines = {};

    /**
     * Creates a new scene from the given JSON description
     *
     * @param {String} json JSON scene description
     * @param options Optional options
     * @param options.simulateWebGLContextLost Optional options
     * @returns {SceneJS.Scene} New scene
     */
    this.createScene = function (json, options) {

        if (!json) {
            throw SceneJS_error.fatalError("param 'json' is null or undefined");
        }

        if (!json.id) { // TODO: make optional
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "'id' is mandatory for the Scene node");
        }

        if (this._engines[json.id]) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Scene already exists with this ID: '" + json.id + "'");
        }

        var engine = new SceneJS_Engine(json, options);

        this._engines[json.id] = engine;

        SceneJS_events.fireEvent(SceneJS_events.SCENE_CREATED, {    // Notify modules that need to know about new scene
            engine:engine
        });

        return engine.scene;
    };

    /**
     * Gets an existing scene
     *
     * @param {String} sceneId ID of target scene
     * @deprecated
     * @returns {SceneJS.Scene} The selected scene
     */
    this.scene = function (sceneId) {

        var engine = this._engines[sceneId];

        return engine ? engine.scene : null;
    };

    /**
     * Gets an existing scene
     *
     * @param {String} sceneId ID of target scene
     * @returns {SceneJS.Scene} The selected scene
     */
    this.getScene = function (sceneId) {

        var engine = this._engines[sceneId];

        return engine ? engine.scene : null;
    };

    /**
     * Gets existing scenes
     *
     * @returns  Existing scenes, mapped to their IDs
     */
    this.getScenes = function () {

        var scenes = {};

        for (var sceneId in this._engines) {
            if (this._engines.hasOwnProperty(sceneId)) {
                scenes[sceneId] = this._engines[sceneId].scene;
            }
        }

        return scenes;
    };

//    var fnName = "__scenejs_sceneLoop";
//
//    window[fnName] = function () {
//
//        var engine;
//
//        for (var engineId in this._engines) {
//            if (this._engines.hasOwnProperty(this._engines)) {
//                engine = this._engines[engineId];
//                engine.renderFrame();
//            }
//        }
//
//        window.requestAnimationFrame(window[fnName]);
//    };

    /**
     * Tests if the given object is an array
     * @private
     */
    this._isArray = function (testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length'))
            && typeof testObject === 'object' && typeof testObject.length === 'number';
    };

    /**
     *
     */
    this._shallowClone = function (o) {
        var o2 = {};
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name];
            }
        }
        return o2;
    };

    /**
     * Add properties of o to o2 where undefined or null on o2
     * @private
     */
    this._applyIf = function (o, o2) {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                if (o2[name] == undefined || o2[name] == null) {
                    o2[name] = o[name];
                }
            }
        }
        return o2;
    };

    /**
     * Add properties of o to o2, overwriting them on o2 if already there.
     * The optional clear flag causes properties on o2 to be cleared first
     * @private
     */
    this._apply = function (o, o2, clear) {
        var name;
        if (clear) {
            for (name in o2) {
                if (o2.hasOwnProperty(name)) {
                    delete o2[name];
                }
            }
        }
        for (name in o) {
            if (o.hasOwnProperty(name)) {
                o2[name] = o[name];
            }
        }
        return o2;
    };


    /**
     * Resets SceneJS, destroying all existing scenes
     */
    this.reset = function () {

        var temp = [];

        for (var id in this._engines) { // Collect engines to destroy
            if (this._engines.hasOwnProperty(id)) {

                temp.push(this._engines[id]);

                delete this._engines[id];
            }
        }

        while (temp.length > 0) { // Destroy the engines
            temp.pop().destroy();
        }

        SceneJS_events.fireEvent(SceneJS_events.RESET);
    };

})();
