/**
 *  @private
 */
var SceneJS_eventManager = function() {

    this._handlerIds = new SceneJS_Map();

    this.typeHandlers = {};
};

/**
 *
 */
SceneJS_eventManager.prototype.createEvent = function(type) {

    if (this.typeHandlers[type]) {
        return;
    }

    this.typeHandlers[type] = {
        handlers: {},
        numSubs: 0
    };
};

/**
 * Subscribes to an event defined on this event manager
 *
 * @param {String} type Event type one of the values in SceneJS_events
 * @param {Function} callback Handler function that will accept whatever parameter object accompanies the event
 * @return {String} handle Handle to the event binding
 */
SceneJS_eventManager.prototype.onEvent = function(type, callback) {

    var handlersForType = this.typeHandlers[type];

    if (!handlersForType) {
        throw "event type not supported: '" + type + "'";
    }

    var handlerId = this._handlerIds.addItem(type);

    var handlers = handlersForType.handlers;
    handlers[handlerId] = callback;
    handlersForType.numSubs++;

    return handlerId;
};

/**
 *
 */
SceneJS_eventManager.prototype.fireEvent = function(type, params) {

    var handlersForType = this.typeHandlers[type];

    if (!handlersForType) {
        throw "event not supported: '" + type + "'";
    }

    if (handlersForType.numSubs > 0) {

        var handlers = handlersForType.handlers;

        for (var handlerId in handlers) {
            if (handlers.hasOwnProperty(handlerId)) {
                handlers[handlerId](params);
            }
        }
    }
};

/**
 * Unsubscribes to an event previously subscribed to on this manager
 *
 * @param {String} handlerId Subscription handle
 */
SceneJS_eventManager.prototype.unEvent = function(handlerId) {

    var type = this._handlerIds.items[handlerId];
    if (!type) {
        return;
    }

    this._handlerIds.removeItem(handlerId);

    var handlers = this.typeHandlers[type];

    if (!handlers) {
        return;
    }

    delete handlers[handlerId];
    this.typeHandlers[type].numSubs--;
};
