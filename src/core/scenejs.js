/**
 * The SceneJS object.
 */
var SceneJS = new (function () {

    /**
     * This SceneJS version
     */
    this.VERSION = '3.2';

    this._baseStateId = 0;

    // Pub/sub support
    this._handleMap = new SceneJS_Map(); // Subscription handle pool
    this._topicSubs = {}; // A [handle -> callback] map for each topic name
    this._handleTopics = {}; // Maps handles to topic names
    this._topicPubs = {}; // Maps topics to publications

    /**
     * @property {SceneJS_Engine} Engines currently in existance
     */
    this._engines = {};

    this._engineIds = new SceneJS_Map();

    this.WEBGL_INFO = (function() {
        var info = {
            WEBGL: false
        };

        var canvas = document.createElement("canvas");

        if (!canvas) {
            return info;
        }

        var gl = canvas.getContext("webgl", { antialias: true }) || document.getContext("experimental-webgl", { antialias: true });

        info.WEBGL = !!gl;

        if (!info.WEBGL) {
            return info;
        }

        info.ANTIALIAS = gl.getContextAttributes().antialias;

        if (gl.getShaderPrecisionFormat) {
            if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
                info.FS_MAX_FLOAT_PRECISION = "highp";
            } else if (gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
                info.FS_MAX_FLOAT_PRECISION = "mediump";
            } else {
                info.FS_MAX_FLOAT_PRECISION = "lowp";
            }
        } else {
            info.FS_MAX_FLOAT_PRECISION = "mediump";
        }

        info.DEPTH_BUFFER_BITS = gl.getParameter(gl.DEPTH_BITS);
        info.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        info.MAX_CUBE_MAP_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        info.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        info.MAX_TEXTURE_UNITS =  gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        info.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        info.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        info.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        info.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);

        info.SUPPORTED_EXTENSIONS = {};

        gl.getSupportedExtensions().forEach(function(ext) {
            info.SUPPORTED_EXTENSIONS[ext] = true;
        });

        return info;
    })();


    /**
     * Publishes to a topic.
     *
     * Immediately notifies existing subscriptions to that topic, retains the publication to give to
     * any subsequent notifications on that topic as they are made.
     *
     * @param {String} topic Publication topic
     * @param {Object} pub The publication
     * @param {Boolean} [forget] When true, the publication will be sent to subscribers then forgotten, so that any
     * subsequent subscribers will not receive it
     * @private
     */
    this.publish = function (topic, pub, forget) {
        if (!forget) {
            this._topicPubs[topic] = pub; // Save notification
        }
        var subsForTopic = this._topicSubs[topic];
        if (subsForTopic) { // Notify subscriptions
            for (var handle in subsForTopic) {
                if (subsForTopic.hasOwnProperty(handle)) {
                    subsForTopic[handle].call(this, pub);
                }
            }
        }
    };

    /**
     * Removes a topic publication
     *
     * Immediately notifies existing subscriptions to that topic, sending them each a null publication.
     *
     * @param topic Publication topic
     * @private
     */
    this.unpublish = function (topic) {
        var subsForTopic = this._topicSubs[topic];
        if (subsForTopic) { // Notify subscriptions
            for (var handle in subsForTopic) {
                if (subsForTopic.hasOwnProperty(handle)) {
                    subsForTopic[handle].call(this, null);
                }
            }
        }
        delete this._topicPubs[topic];
    };


    /**
     * Listen for data changes at a particular location
     *
     * <p>Your callback will be triggered for
     * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
     *
     * <p>The callback is be called with SceneJS as scope.</p>
     *
     * @param {String} location Publication location
     * @param {Function(data)} callback Called when fresh data is available at the location
     * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
     */
    this.on = function (topic, callback) {
        var subsForTopic = this._topicSubs[topic];
        if (!subsForTopic) {
            subsForTopic = {};
            this._topicSubs[topic] = subsForTopic;
        }
        var handle = this._handleMap.addItem(); // Create unique handle
        subsForTopic[handle] = callback;
        this._handleTopics[handle] = topic;
        var pub = this._topicPubs[topic];
        if (pub) { // A publication exists, notify callback immediately
            callback.call(this, pub);
        }
        return handle;
    };

    /**
     * Unsubscribes from a publication that was previously made with {@link #on}.
     * @param handle Publication handle
     */
    this.off = function (handle) {
        var topic = this._handleTopics[handle];
        if (topic) {
            delete this._handleTopics[handle];
            var topicSubs = this._topicSubs[topic];
            if (topicSubs) {
                delete topicSubs[handle];
            }
            this._handleMap.removeItem(handle); // Release handle
            if (topic == "rendered") {
                this._engine.branchDirty(this);
            }
        }
    };

    /**
     * Listens for exactly one data update at the specified location, and then stops listening.
     * <p>This is equivalent to calling {@link #on}, and then calling {@link #off} inside the callback function.</p>
     * @param {String} location Data location to listen to
     * @param {Function(data)} callback Called when fresh data is available at the location
     */
    this.once = function (topic, callback) {
        var self = this;
        var sub = this.on(topic,
            function (pub) {
                self.off(sub);
                callback(pub);
            });
    };

    /**
     * Creates a new scene from the given JSON description and begins rendering it
     *
     * @param {String} json JSON scene description
     * @param {*} options Optional options
     * @param {Boolean} options.simulateWebGLContextLost Set true to enable simulation of lost WebGL context (has performance impact)
     * @returns {SceneJS.Scene} New scene
     */
    this.createScene = function (json, options) {

       json = json || {};

        if (json.id) {
            if (this._engines[json.id]) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Scene already exists with this ID: '" + json.id + "'");
            }
            this._engineIds.addItem(json.id, {});
        } else {
            json.id = this._engineIds.addItem({});
        }

        var engine = new SceneJS_Engine(json, options);

        this._engines[json.id] = engine;

        SceneJS_events.fireEvent(SceneJS_events.SCENE_CREATED, {    // Notify modules that need to know about new scene
            engine:engine
        });

        engine.scene.start(options);

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
     * Gets an existing scene.
     *
     * When no scene ID is given, the first scene found is returned. This is a shorthand convenience for
     * easy scripting when only one scene is defined.
     *
     * @param {String} [sceneId] ID of target scene
     * @returns {SceneJS.Scene} The selected scene
     */
    this.getScene = function (sceneId) {

        if (!sceneId) {
            for (var sceneId in this._engines) {
                if (this._engines.hasOwnProperty(sceneId)) {
                    return this._engines[sceneId].scene;
                }
            }
        }

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
            if (o.hasOwnProperty(name) && o[name] != undefined) {
                o2[name] = o[name];
            }
        }
        return o2;
    };

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * Tests is an object is empty
     * @param obj
     * @returns {boolean}
     * @private
     */
    this._isEmpty =function(obj) {
        // null and undefined are "empty"
        if (obj == null) return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
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

                this._engineIds.removeItem(id);
            }
        }

        while (temp.length > 0) { // Destroy the engines
            temp.pop().destroy();
        }

        SceneJS_events.fireEvent(SceneJS_events.RESET);
    };

})();
