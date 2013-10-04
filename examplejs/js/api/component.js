/**
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
};