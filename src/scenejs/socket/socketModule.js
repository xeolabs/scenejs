/**
 * Backend that manages socket interaction.
 *
 * @private
 */
SceneJS._SocketModule = new (function() {

    var debugCfg;
    var sceneMap = {};              // Socket set for each scene
    var activeSceneSockets = null;  // Socket set for the currently-rendering scene
    var socketStack = [];           // Stack of open sockets for current scene
    var activeSocket = null;        // Socket for currently-rendering Socket node, not in stack

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                sceneMap = {};
                activeSceneSockets = null;
                socketStack = [];
                activeSocket = null;
            });

    SceneJS._eventModule.addListener(// When scene defined, create a socket map for it
            SceneJS._eventModule.SCENE_RENDERING,
            function(params) {
                debugCfg = SceneJS._debugModule.getConfigs("sockets") || {};
                activeSceneSockets = sceneMap[params.sceneId];
                if (!activeSceneSockets) {
                    activeSceneSockets = {
                        sceneId: params.sceneId,
                        sockets : {}
                    };
                    sceneMap[params.sceneId] = activeSceneSockets;
                }
            });

    SceneJS._eventModule.addListener(// When scene destroyed, close all its sockets
            SceneJS._eventModule.SCENE_DESTROYED,
            function(params) {
                var ss = sceneMap[params.sceneId];
                if (ss) {
                    var socket;
                    for (var socketId in ss.sockets) {
                        if (ss.sockets.hasOwnProperty(socketId)) {
                            socket = ss.sockets[socketId].socket;
                            if (socket.readyState != 2 && socket.readyState != 3) { // Only when not already closed or closing
                                socket.close();
                            }
                        }
                    }
                    sceneMap[params.sceneId] = null;
                }
            });

    function log(socketId, message) {
        if (debugCfg.trace) {
            SceneJS._loggingModule.info("Socket " + socketId + ": " + message);
        }
    }

    /** Open a fresh WebSocket, attach callbacks and make it the active one
     */
    this.openSocket = function(params, onOpen, onClose, onError) {
        if (!("WebSocket" in window)) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.SocketNotSupportedException("SceneJS.Socket cannot be used - WebSockets not supported by this browser"));
        }
        var socketId = SceneJS._createKeyForMap(activeSceneSockets.sockets, "socket");
        var webSocket;
        try {
            webSocket = new WebSocket(params.uri);  // W3C WebSocket
        } catch (e) {
            onError(new SceneJS.errors.SocketErrorException("SceneJS.Socket error (URI: '" + params.uri + "') : " + e.message || e));
            return;
        }
        var socket = {
            id : socketId,
            uri: params.uri,
            socket: webSocket,
            messages : {
                inQueue : []
            }
        };
        activeSceneSockets.sockets[socketId] = socket;
        webSocket.onopen = function() {
            onOpen(socketId);
            log(socketId, "opened");
        };
        webSocket.onmessage = function (evt) {
            log(socketId, "received message: '" + evt.data + "");
            socket.messages.inQueue.unshift(evt.data);  // Message ready to be collected by node

        };
        webSocket.onerror = function(e) {
            activeSceneSockets.sockets[socketId] = null;
            var msg = "SceneJS.Socket error (URI: '" + socket.uri + "') : " + e;
            onError(new SceneJS.errors.SocketErrorException(msg));
            log(socketId, msg);
        };
        webSocket.onclose = function() {
            activeSceneSockets.sockets[socketId] = null;
            onClose();
            log(socketId, "closed");
        };

        //testCreateMessages(activeSceneSockets.sockets[socketId]);
    };

    /** Attempt to activate a currently-open open WebSocket
     */
    this.acquireSocket = function(socketId) {
        if (activeSocket) {
            socketStack.push(activeSocket);
        }
        if (activeSceneSockets.sockets[socketId]) {
            activeSocket = activeSceneSockets.sockets[socketId];
            return true;
        } else {
            log(socketId, "has been freed");  /// Socket node must re-open
            return false;
        }
    };

    /** Flushes given message queue out the active socket. Messages are sent as they are popped off the end.
     */
    this.sendMessages = function(messages, onError, onSuccess) {
        var message;
        var messageStr;
        try {
            while (messages.length > 0 && activeSocket.socket.readyState == 1) {
                message = messages[messages.length - 1]; // Dont deqeue yet for debug in case of error
                messageStr = JSON.stringify(message);
                if (debugCfg.trace) {
                    log(activeSocket.id, "sending message: '" + messageStr + "");
                }
                activeSocket.socket.send(messageStr);
                messages.pop();                       // Sent OK, can pop now
            }
        } catch(e) {
            onError(new SceneJS.errors.SocketErrorException
                    ("SceneJS.Socket error sending message (to server at URI: '" + activeSocket.uri + "') : " + e));
            return;
        }
        onSuccess();
    };

    /**
     * Fetches next message from the end of the incoming queue.
     *
     * Incoming messages look like this:
     *
     * { error: 404, body: "Not found!" }
     *
     * { body: < body object/string> }
     *
     * The onError will return an exception object, while the onSuccess handler will return the message body JSON object.
     */
    this.getNextMessage = function(onError, onSuccess) {
        var inQueue = activeSocket.messages.inQueue;
        var messageStr = inQueue[inQueue.length - 1]; // Dont deqeue yet for debug in case of error
        if (messageStr) {
            try {
                if (debugCfg.trace) {
                    log(activeSocket.id, "processing message: '" + messageStr + "");
                }
                var messageObj = eval('(' + messageStr + ')');
                if (messageObj.error) {

                    /* Server reports an error
                     */
                    onError(new SceneJS.errors.SocketServerErrorException(
                            "SceneJS.Socket server error - server reports error (server URI: '"
                                    + activeSocket.uri + "'): " + messageObj.error + ", " + messageObj.body));

                } else if (!messageObj.body) {

                    /* Badly-formed response - body missing
                     */
                    onError(new SceneJS.errors.SocketErrorException("SceneJS.Socket error - bad message from server (server URI: '"
                            + activeSocket.uri + "'): body is missing in message:" + messageStr));
                } else {
                    inQueue.pop();                        // Evaled OK, can pop now
                    onSuccess(messageObj.body);
                }
            } catch (e) {
                onError(new SceneJS.errors.SocketErrorException
                        ("SceneJS.Socket error reading message (from server at URI: '" + activeSocket.uri + "') : " + e));
            }
        }
    };


    /** Deactivates the current socket, reactivates the previously activated one (belonging to a higher Socket node if any)
     */
    this.releaseSocket = function() {
        if (socketStack.length > 0) {
            activeSocket = socketStack.pop();
        } else {
            activeSocket = null;
        }
    };

})();

