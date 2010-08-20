/**
 * @class Binds its subgraph to a WebSocket, providing a scene with the ability to interact with a server.
 *
 * <p>The SceneJS.Socket node enables a server to dynamically participate in the construction, destruction and
 * configuration of its subgraph. It binds the subgraph to a WebSocket through which it exchanges JSON message objects
 * with a server.</p>
 *
 * <p>Messages are just JSON objects - it's up to the server and the Socket to agree on their structure and protocol.</p>
 *
 * <h2>Message Queues</h2>
 * <p>Messages can be configured on the Socket to send when the connection first opens, or enqueued at any
 * time with {@link #addMessage} to send when the socket is next rendered while a connection is open.</p>
 *
 * <p>Incoming messages are also queued - each time the Socket is rendered while a connection is open, it dequeues and
 * processes the next incoming message before sending all queued outgoing messages.</p>
 *
 * <p>You can have multiple Sockets scattered throughout a scene graph, and may even nest them. This enables you to do some
 * fancy things, like have "live assets" that are controlled by the servers that they are downloaded from. Imagine a
 * subgraph defining an airplane, that relies on its server to manage its complex physics computations, for example.</p>
 *
 *  <p><b>Example Usage</b></p><p>Below is a Socket that connects to a server on the local host. The Socket starts off
 * in {@link #STATE_INITIAL}. Then as soon as it is rendered, it transitions to {@link #STATE_CONNECTING} and tries to
 * open the connection. When successful, it sends the optional specified messages and transitions to {@link #STATE_OPENED}.
 * The server may respond with an error (described further below) or a configuration map. If the response is a
 * configuration map, the Socket would then apply that to its sub-nodes.
 * On error, the Socket will transition to {@link #STATE_ERROR} and remain in that state, with connection closed. If
 * the connection ever closes, the Socket will attempt to re-open it when next rendered. When the server asks
 * "whatsYourFavouriteColor", we'll reply "green".</p>
 * <pre><code>
 * new SceneJS.Socket({
 *
 *       // Location of server
 *
 *       uri: "ws://127.0.0.1:8888/",
 *
 *       // Optional messages to send as soon as the socket is first opened
 *
 *       messages: [
 *          {
 *               foo: "hi server",
 *               favouriteAnimals: {
 *                   animal1: "Kakapo",
 *                   animal2: "Tuatara"
 *               }
 *          },
 *
 *          // Next message ...
 *
 *      ],
 *
 *      listeners: {
 *         "state-changed" : {
 *              fn: function(event) {
 *                  switch (event.params.newState) {
 *                      case SceneJS.Socket.STATE_CONNECTING:
 *
 *                          // Socket attempting to open connection with server at specified URI
 *
 *                          alert("STATE_CONNECTING");
 *                          break;
 *
 *                      case SceneJS.Socket.STATE_OPEN:
 *
 *                          // Server connection opened, messages sent
 *
 *                          alert("STATE_OPEN");
 *                          break;
 *
 *                      case SceneJS.Socket.STATE_CLOSED:
 *
 *                          // Connection closed OK
 *
 *                          alert("STATE_CLOSED");
 *                          break;
 *
 *                      case SceneJS.Socket.STATE_ERROR:
 *
 *                          // Error opening connection, or server error response
 *
 *                          alert("STATE_ERROR: " + params.exception.message);
 *                          break;
 *                   }
 *               }
 *           },
 *
 *           // Reply to "whatsYouFavouriteColour" messages
 *
 *           "msg-received" : function(event) {  // Can optionally just provide a function
 *               var message = event.params.message;
 *               if (message.bar == "whatsYouFavouriteColour") {
 *                     this.addMessage({ foo: "favouriteColourIs", color: "green" });
 *               }
 *           }
 *       },
 *
 *       // Child nodes
 *)
 *
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

/** Initial state of Socket when not rendered yet.
 */
SceneJS.Socket.STATE_INITIAL = 0;

/** State of Socket when it has attempted to open a connection with a server and awaiting response. Socket tries to open
 * the connection as soon as it is rendered and enters this state.
 */
SceneJS.Socket.STATE_CONNECTING = 2;

/** State of Socket when connection is open with server.
 */
SceneJS.Socket.STATE_OPEN = 3;

/**
 * State of Socket in which connection is closed. From here it will attempt to r-open when next rendered.
 */
SceneJS.Socket.STATE_CLOSED = 4;

/** State of Socket in which an error occured, either due to failure to open connection, or as signalled by the server.
 */
SceneJS.Socket.STATE_ERROR = -1;

/** Enqeues an outgoing message to send when the Socket is next rendered while a connection is open.
 *
 * @param message
 * @returns {this}
 */
SceneJS.Socket.prototype.addMessage = function(message) {
    this._outMessages.unshift(message);
    return this;
};

/** Clears outgoing message queue - messages are not sent.
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
        this._outMessages = params.messages.reverse();
    }
};

// @private
SceneJS.Socket.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (!this._uri) {
        throw SceneJS._errorModule.fatalError(
                new SceneJS.errors.InvalidNodeConfigException("SceneJS.Socket uri property not defined"));
    }

    /* Socket can close after lack of use, in which case the node must to re-open it
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
        SceneJS._SocketModule.getNextMessage(

            /* Error
             */
                function(exception) { // onerror
                    _self._changeState(SceneJS.Socket.STATE_ERROR, { exception: exception });
                    SceneJS._errorModule.error(exception);
                },

            /* Message got
             */
                function(message) {
                    _self.addEvent({ name: "msg-received", params: { message: message } });
                });

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
        if (this._state == SceneJS.Socket.STATE_ERROR) { // Socket disabled - TODO: retry?
        }
        this._renderNodes(traversalContext, data); // No socket acquired yet
    }

};

// @private
SceneJS.Socket.prototype._changeState = function(newState, params) {
    params = params || {};
    params.oldState = this._state;
    params.newState = newState;
    this._state = newState;
    if (this._listeners["state-changed"]) {
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

SceneJS.registerNodeType("socket", SceneJS.socket);
