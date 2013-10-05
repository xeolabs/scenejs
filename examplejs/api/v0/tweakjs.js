/*
 * ExampleJS
 * http://examplejs.org/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://examplejs.org/license
 * Copyright 2013, Lindsay Kay
 * lindsay.kay@xeolabs.com
 *
 * htmleditor
 * http://www.mrdoob.com/projects/htmleditor/
 * The MIT License
 * Copyright (c) 2012 Mr.doob
 *//**
 * @class Generic map of IDs to items - can generate own IDs or accept given IDs. IDs should be strings in order to not
 * clash with internally generated IDs, which are numbers.
 * @private
 */
var ExampleJS_Map = function (items, _baseId) {

    /**
     * @property Items in this map
     */
    this.items = items || [];
    var baseId = _baseId || 0;
    var lastUniqueId = baseId + 1;

    /**
     * Adds an item to the map and returns the ID of the item in the map. If an ID is given, the item is
     * mapped to that ID. Otherwise, the map automatically generates the ID and maps to that.
     *
     * id = myMap.addItem("foo") // ID internally generated
     *
     * id = myMap.addItem("foo", "bar") // ID is "foo"
     *
     */
    this.addItem = function () {
        var item;
        if (arguments.length == 2) {
            var id = arguments[0];
            item = arguments[1];
            if (this.items[id]) { // Won't happen if given ID is string
                throw "ID clash: '" + id + "'";
            }
            this.items[id] = item;
            return id;
        } else {
            while (true) {
                item = arguments[0];
                var findId = lastUniqueId++;
                if (!this.items[findId]) {
                    this.items[findId] = item;
                    return findId;
                }
            }
        }
    };

    /**
     * Removes the item of the given ID from the map and returns it
     */
    this.removeItem = function (id) {
        var item = this.items[id];
        delete this.items[id];
        return item;
    };
};/**
 * @private
 * @type {Object}
 */
var ExampleJSAPI = {
};

// Tests if the given object is an array
 ExampleJSAPI._isArray = function (testObject) {
    return testObject && !(testObject.propertyIsEnumerable('length'))
        && typeof testObject === 'object' && typeof testObject.length === 'number';
};

// Inheritance helper
ExampleJSAPI._extend = function (childObj, parentObj) {
    var tmpObj = function () {
    };
    tmpObj.prototype = parentObj.prototype;
    childObj.prototype = new tmpObj();
    childObj.prototype.constructor = childObj;
};

// Add properties of o to o2, overwriting them on o2 if already there
ExampleJSAPI._apply = function (o, o2) {
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            o2[name] = o[name];
        }
    }
    return o2;
};

// Add properties of o to o2 where undefined or null on o2
 ExampleJSAPI._applyIf = function (o, o2) {
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            if (o2[name] == undefined || o2[name] == null) {
                o2[name] = o[name];
            }
        }
    }
    return o2;
};/**
 * @class Base class for ExampleJS API components.
 * <p>Provides methods for listening to data changes on components: {@link #on} is used to listen for
 * data changes at a particular location, while {@link #off} is used to stop receiving updates.</p>
 * @constructor
 */
ExampleJSAPI.Component = function () {
};

ExampleJSAPI.Component.prototype = {

    _init:function () {
        this._handleMap = new ExampleJS_Map(); // Subscription handle pool
        this._locSubs = {}; // A [handle -> callback] map for each location name
        this._handleLocs = {}; // Maps handles to loc names
        this._locPubs = {}; // Maps locations to publications
    },

    /**
     * Publishes data to a location.
     *
     * <p>Immediately notifies existing subscriptions to that location, retains the publication to give to
     * any subsequent notifications on that location as they are made.</p>
     *
     * <p>This is called internally by proxies. Only they create publications, which are subscribed
     * to by client code.</p>
     *
     * @param {String} location Publication location
     * @param {*} pub The publication
     * @private
     */
    _publish:function (location, pub) {
        this._locPubs[location] = pub; // Save notification
        var subsForLoc = this._locSubs[location];
        if (subsForLoc) { // Notify subscriptions
            for (var handle in subsForLoc) {
                if (subsForLoc.hasOwnProperty(handle)) {
                    subsForLoc[handle].call(this, pub);
                }
            }
        }
    },

    /**
     * Listen for data changes at a particular location.
     *
     * <p>This is the primary way to read data from ExampleJS. Your callback will be triggered for
     * the initial data and again whenever the data changes. Use {@link #off} to stop receiving updates.</p>
     *
     * <p>The callback is be called with this Component as scope.</p>
     *
     * @param {String} location Publication location
     * @param {Function(data)} callback Called when fresh data is available at the location
     * @return {String} Handle to the subscription, which may be used to unsubscribe with {@link #off}.
     */
    on:function (location, callback) {
        var subsForLoc = this._locSubs[location];
        if (!subsForLoc) {
            subsForLoc = {};
            this._locSubs[location] = subsForLoc;
        }
        var handle = this._handleMap.addItem(); // Create unique handle
        subsForLoc[handle] = callback;
        this._handleLocs[handle] = location;
        var pub = this._locPubs[location];
        if (pub) { // A publication exists, notify callback immediately
            callback.call(this, pub);
        }
        return handle;
    },

    /**
     * Unsubscribes from a publication that was previously made with {@link #on}.
     * @param {String} handle Publication handle
     */
    off:function (handle) {
        var location = this._handleLocs[handle];
        if (location) {
            delete this._handleLocs[handle];
            var locSubs = this._locSubs[location];
            if (locSubs) {
                delete locSubs[handle];
            }
            this._handleMap.removeItem(handle); // Release handle
        }
    },

    /**
     * Listens for exactly one data update at the specified location, and then stops listening.
     * <p>This is equivalent to calling {@link #on}, and then calling {@link #off} inside the callback function.</p>
     * @param {String} location Data location to listen to
     * @param {Function(data)} callback Called when fresh data is available at the location
     */
    once:function (location, callback) {
        var self = this;
        var handle = this.on(location,
            function (pub) {
                self.off(handle);
                callback(pub);
            });
    },

    /**
     * Logs a message in the context of this Component.
     * @private
     * @param {String} msg The message to log
     */
    log:function (msg) {
        console.log(msg); // TODO: log with Component path
    }
};/**
 *
 * @param cfg
 * @constructor
 */
var ExampleJS = function (cfg) {

    this._init(); // Super constructor

    // Create iframe
    this._iframe = document.createElement('iframe');
    this._iframe.style.height = "100%";
    this._iframe.style.width = "100%";
    document.body.appendChild(this._iframe);

//    this._iframe.src = "http://xeolabs.github.io/examplejs/index.html";
    this._iframe.src = "/home/lindsay/xeolabs/projects/examplejs/index.html";

    // True once connected
    this._connected = false;

    // Calls buffered while not connected
    this._callBuffer = [];

    // Buffer initial config call
    this.set(cfg);

    // Request connection
    this._connect();
};

// Extends framework base component
ExampleJSAPI._extend(ExampleJS, ExampleJSAPI.Component);

/**
 * Updates this example portal
 * @param params
 */
ExampleJS.prototype.set = function (params) {
    var call = this._apply({ call:"configure" }, params);
    if (!this._connected) {
        // Buffer until ready
        this._callBuffer.unshift(call);
        return;
    }
    this._send(call);
};

/**
 * Sends a call to the page
 * @param params
 * @private
 */
ExampleJS.prototype._send = function (params) {
    this._iframe.contentWindow.postMessage(JSON.stringify(params), "*");
};

/**
 * Merges objects
 * @private
 */
ExampleJS.prototype._apply = function (o, o2) {
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            o2[name] = o[name];
        }
    }
    return o2;
};

/**
 * Requests connection with page
 * @private
 */
ExampleJS.prototype._connect = function () {

    var self = this;

    // Periodically request connection with examples page
    var pConnect = setInterval(function () {
        self._send({
            call:"connect"
        });
    }, 200);

    // Message from page
    addEventListener("message",
        function (event) {
            var data = JSON.parse(event.data);
            switch (data.call) {

                case "connected":
                    // Stop sending connection requests
                    clearInterval(pConnect);
                    self._sendBufferedCalls();
                    self._connected = true;
                    self._publish("connection", { connected: true });
                    break;

                case "home":
                    // Home link clicked
                    self._publish("home");
                    break;

                case "tags":
                    // Tag selection updated
                    self._publish("tags", data.tags);
                    break;

                case "filter":
                    // Tag filter operator updated
                    self._publish("filter", data.filter);
                    break;

                case "page":
                    // Page selected
                    self._publish("page", data.page);
                    break;
            }
        });
};

/**
 * Sends calls that were buffered while not connected
 * @private
 */
ExampleJS.prototype._sendBufferedCalls = function () {
    while (this._callBuffer.length > 0) {
        this._send(this._callBuffer.pop());
    }
};




//// Gets tags off location hash
//function getRequestTags() {
//    var tags = request.getHashParam("tags");
//    if (tags) {
//        var map = {};
//        tags = tags.split(",");
//        for (var i = 0, len = tags.length; i < len; i++) {
//            map[tags[i]] = true;
//        }
//        tags = map;
//    }
//    return tags || {};
//}
//
//// Sets tags on location hash and rebuilds the hash
//function setRequestTags(tags) {
//    var list = [];
//    for (var tag in tags) {
//        if (tags.hasOwnProperty(tag) && tags[tag] === true) {
//            list.push(tag);
//        }
//    }
//    requestTags = list.length > 0 ? "tags=" + list.join(",") : null;
//    rebuildRequestHash();
//}
//
//// Rebuilds location hash
//function rebuildRequestHash() {
//    var list = [];
//    if (selectedTags) {
//        list.push(selectedTags);
//    }
//    if (requestExample) {
//        list.push(requestExample);
//    }
//    window.location.hash = list.join("|");
//}
//
//// Sets example path on location hash
//function setRequestExample(path) {
//    requestExample = "ex=" + path;
//    rebuildRequestHash();
//}
