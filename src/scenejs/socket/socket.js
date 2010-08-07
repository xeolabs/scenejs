/**
 * @class Binds its subgraph to a WebSocket, providing a server with the ability to add, remove and manipulate content within the subgraph
 *
 * <p>The SceneJS.Socket node enables a server to dynamically participate in the construction, destruction and
 * configuration of its subgraph. It binds the subgraph to a WebSocket through which it exchanges JSON message objects
 * with a server.</p>
 *
 * <h2>Message Format</h2>
 * <p>Incoming messages from a server are either error responses, like that shown below, or configuration maps
 * exactly like those specified with a {@link SceneJS.WithConfigs}. On receipt of a configuration map, a Socket
 * automatically applies the map to its subgraph in the same way that a {@link SceneJS.WithConfigs} does.</p>
 * <p>An error response object has two parts: the error code, either a string or number, and a message.</p>
 *
 * <p>Below is an example of an HTTP 404 error server response:</p>
 * <pre><code>
 * {
 *     error : 404,
 *     body  : "Could not find asset 'foobar'
 * }
 * </code></pre>
 *
 * <p>Below is an example of a server response containing subnode configurations:</p>
 * <pre><code>
 * {
 *     body : {
 *          configs: {
 *              // ...
 *          }
 *     }
 * }
 * </code></pre>
 *
 * <p>The outgoing message format is not part of the SceneJS specification and is whatever JSON objects the server on
 * the other end expects.</p>
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
 * the connection ever closes, the Socket will attempt to re-open it when next rendered.</p>
 * <pre><code>
 * new SceneJS.Socket({
 *
 *       // Location of server
 *
 *       uri: "ws://127.0.0.1:8888/",
 *
 *       // Messages to send as soon as the socket is first opened
 *
 *       messages: [
 *          {
 *               myParam  : "foo",
 *               myParam2 : "bar"
 *          },
 *
 *          // Next message ...
 *
 *      ],
 *
 *      listeners: {
 *         "state-changed" : {
 *              fn: function(params) {
 *                  switch (params.newState) {
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
 *           }
 *       },
 *
 *       // Child nodes that will receive configs returned by socket's server peer
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
        SceneJS._SocketModule.getNextMessage(

            /* Error
             */
                function(exception) { // onerror
                    _self._changeState(SceneJS.Socket.STATE_ERROR, { exception: exception });
                    SceneJS._errorModule.error(exception);
                },

            /* OK
             */
                function(messageBody) {

                    if (messageBody.configs) {

                        /* Configuration message
                         */
                        traversalContext = {                            
                            insideRightFringe: _self._children.length > 1,
                            callback : traversalContext.callback,
                            configs : _self._preprocessConfigs(messageBody.configs),
                            configsModes : _self._configsModes // TODO configsModes in message?
                        };
                        data = new SceneJS.Data(data, _self._fixedParams, this._data);

                    } else {

                        /* TODO: handle other message types
                         */
                        SceneJS._errorModule.error(
                                new SceneJS.errors.SocketServerErrorException(
                                        "SceneJS.Socket server responded with unrecognised message: " + JSON.stringify(messageBody)));
                    }
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
        if (this._state == this._STATE_ERROR) { // Socket disabled - TODO: retry?
        }
        this._renderNodes(traversalContext, data); // We're assuming socket wont open instantly, ie. during this node visit
    }
};

// TODO: factor out and share with SceneJS.WithConfigs - mutual feature envy smell ;)

SceneJS.Socket.prototype._preprocessConfigs = function(configs) {
    var configAction;
    var funcName;
    var newConfigs = {};
    for (var key in configs) {
        if (configs.hasOwnProperty(key)) {
            key = key.replace(/^\s*/, "").replace(/\s*$/, "");    // trim
            if (key.length > 0) {
                configAction = key.substr(0, 1);
                if (configAction != "#") {  // Property reference
                    if (configAction == "+") {
                        funcName = "add" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else if (configAction == "-") {
                        funcName = "remove" + key.substr(1, 1).toUpperCase() + key.substr(2);
                    } else {
                        funcName = "set" + key.substr(0, 1).toUpperCase() + key.substr(1);
                    }
                    newConfigs[funcName] = {
                        isFunc : true,
                        value : configs[key]
                    };

                } else {
                    newConfigs[key.substr(1)] = this._preprocessConfigs(configs[key]);
                }
            }
        }
    }
    return newConfigs;
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

SceneJS.Socket.prototype._onMessage = function(message) {
    if (this._listeners["msg-received"]) {
        this._fireEvent("msg-received", message);
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