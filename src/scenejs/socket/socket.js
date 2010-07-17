/**
 * @class Binds its subgraph to a WebSocket, providing a server with the ability to add, remove and manipulate content within the subgraph
 *
 * <p>The SceneJS.Socket node enables a server to dynamically participate in the construction, destruction and
 * configuration of its subgraph. It binds the subgraph to a WebSocket through which it exchanges JSON message objects
 * with a server, sending messages on events within its subgraph, while receiving messages containing updates to apply
 * to its subnodes.</p>
 * <p>When a SceneJS.Socket processes incoming messages, it works in a similar manner to a {@link SceneJS.WithConfigs}
 * node, pushing configurations from the message body down into the setter methods of identified nodes in the subgraph.</p>
 *
 * <p>While the format of incoming messages must be a {@link SceneJS.WithConfigs} configuration object, <b>the outgoing
 * message format is not part of the SceneJS specification</b> and can be whatever JSON objects the server on the other
 * end expects. As for when messages are sent by the scene, that can be triggered by SceneJS node listeners, eg. where a
 * Socket node can be configured to send messages as it transitions through the various stages of its life cycle.</p>
 *
 * <p>You can have multiple Sockets scattered through a scene graph, and may even nest them. This enables you to do some
 * fancy things, like have "live assets" that are controlled by the servers that they are downloaded from. Imagine a
 * subgraph defining an airplane, that relies on its server to manage its complex physics computations, for example.</p>
 *
 * <h2>Message Protocol</h2>
 *
 * <pre><code>
 * {
 *     error : {String} or undefined when no error,
 *     body  : {
 *         /* Response from server - either a JSON SceneJS subgraph or a configuration map
 *     }
 * }
 * </code></pre>
 */
SceneJS.Socket = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "socket";
    this._uri = null;
    this._autoOpen = true;
    this._socketId = null;
    this._outMessages = [];
    this._state = SceneJS.Socket.STATE_INITIAL;
    this._configsModes = {
        strictProperties : true,
        strictNodes : false
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Socket, SceneJS.Node);

/**
 */
SceneJS.Socket.STATE_INITIAL = 0;

/**
 */
SceneJS.Socket.STATE_CONNECTING = 2;

/**
 */
SceneJS.Socket.STATE_OPEN = 3;

/**
 * State of Socket in which it re-open is pending after it has been closed by SceneJS or server, perhaps due to
 * lack of recent use. When next rendered, the Socket will then attempt to reopen and transition to
 * {@link #STATE_CONNECTING}.
 * @const
 */
SceneJS.Socket.STATE_CLOSED = 4;

/**
 */
SceneJS.Socket.STATE_ERROR = -1;


/** Enqeues an outgoing message to send when the Socket is next rendered.
 *
 * @param message
 * @returns {this}
 */
SceneJS.Socket.prototype.addMessage = function(message) {
    this._outMessages.push(message);
    return this;
};

/** Clears outgoing message queue.
 * @returns {this}
 */
SceneJS.Socket.prototype.removeMessages = function() {
    this._outMessages = [];
    return this;
};

// @private
SceneJS.Socket.prototype._init = function(params) {
    this._uri = params.uri;
    if (params.messages) {
        this._outMessages = params.messages;
    }
};

// @private
SceneJS.Socket.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (!this._uri) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException("SceneJS.Socket uri property not defined"));
    }

    /* Socket can close after lack of use, in which case
     * the node would have to re-open it
     */
    if (this._state == SceneJS.Socket.STATE_OPEN) {
        if (!SceneJS._SocketModule.acquireSocket(this._socketId)) {
            this._changeState(SceneJS.Socket.STATE_CLOSED);
        }
    }

    if (this._state == SceneJS.Socket.STATE_OPEN) { // Still open, and socket was acquired above

        /* Process next incoming message then send pending outgoing messages
         */
        var _self = this;
        var message = SceneJS._SocketModule.getNextMessage(
                function(exception) { // onerror
                    _self._changeState(SceneJS.Socket.STATE_ERROR, { exception: exception });
                    SceneJS._errorModule.error(exception);
                });
        if (message) {
            if (message.error) {
                SceneJS._errorModule.error(
                        new SceneJS.SocketServerErrorException(
                                "SceneJS.Socket server responded with error: " + message.error + ", " + message.body));
            } else if (message.body) {
                // alert(message.body);
                traversalContext = {
                    appendix : traversalContext.appendix,
                    insideRightFringe: this._children.length > 1,
                    configs : message.body,
                    configsModes : this._configsModes // TODO configsModes in message?
                };
                data = new SceneJS.Data(data, this._fixedParams, this._data);
            }
        }
        this._sendMessages();
        this._renderNodes(traversalContext, data);
        SceneJS._SocketModule.releaseSocket();
    } else {
        if (this._state == SceneJS.Socket.STATE_INITIAL || this._state == SceneJS.Socket.STATE_CLOSED) {

            this._changeState(SceneJS.Socket.STATE_CONNECTING);
            (function(_self) { // Closure allows this node to receive results
                SceneJS._SocketModule.openSocket({ uri: _self._uri },
                        function(socketId) { // onopen
                            _self._socketId = socketId;
                            _self._changeState(SceneJS.Socket.STATE_OPEN);
                        },
                        function() { // onclose
                            _self._changeState(SceneJS.Socket.STATE_CLOSED);
                        },
                        function(exception) { // onerror
                            _self._changeState(SceneJS.Socket.STATE_ERROR, { exception: exception });
                            SceneJS._errorModule.error(exception);
                        });
            })(this);
        }
        if (this._state == this._STATE_ERROR) { // Socket disabled - TODO: retry?
        }
        this._renderNodes(traversalContext, data); // We're assuming socket wont open instantly, ie. during this node visit
    }
};

// @private
SceneJS.Socket.prototype._changeState = function(newState, params) {
    params = params || {};
    params.oldState = this._state;
    params.newState = newState;
    this._state = newState;
    if (this._listeners["state-changed"]) { // Optimisation
        this._fireEvent("state-changed", params);
    }
};

// @private
SceneJS.Socket.prototype._sendMessages = function() {
    if (this._outMessages.length > 0) {
        var _self = this;
        SceneJS._SocketModule.sendMessages(
                this._outMessages,
                function(exception) { // onerror
                    _self._changeState(SceneJS.Socket.STATE_ERROR, { exception: exception });
                },
                function() {  // onsuccess
                    this._outMessages = [];
                });

    }
};

/** Factory function that returns a new {@link SceneJS.Socket} instance
 * @param {Object} [cfg] Static configuration object

 * @returns {SceneJS.Socket}
 * @since Version 0.7.6
 */
SceneJS.socket = function() {
    var n = new SceneJS.Socket();
    SceneJS.Socket.prototype.constructor.apply(n, arguments);
    return n;
};