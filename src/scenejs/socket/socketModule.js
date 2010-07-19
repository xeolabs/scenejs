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
            socket.messages.inQueue.push(evt.data);  // Message ready to be collected by node
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

    this.acquireSocket = function(socketId) {
        if (activeSocket) {
            socketStack.push(activeSocket);
        }
        if (activeSceneSockets.sockets[socketId]) {
            activeSocket = activeSceneSockets.sockets[socketId];
            return true;
        } else {
            log(socketId, "has been freed");
            return false;
        }
    };

    this.sendMessages = function(messages, onError, onSuccess) {
        //  activeSocket.messages.outQueue.push(messages);
        var message;
        var messageStr;
        try {
            while (messages.length > 0 && activeSocket.socket.readyState == 1) {
                message = messages[messages.length - 1];
                messageStr = JSON.stringify(message);
                log(activeSocket.socketId, "sending message: '" + messageStr + "");
                activeSocket.socket.send(messageStr);
                messages.pop();
            }
        } catch(e) {
            onError(new SceneJS.errors.SocketErrorException("SceneJS.Socket error (URI: '" + activeSocket.uri + "') : " + e));
            return;
        }
        onSuccess();
    };

    this.getNextMessage = function(onError) {
        var inQueue = activeSocket.messages.inQueue;
        if (inQueue.length > 0) {
            var messageStr = inQueue.pop();
            try {
                log(activeSocket.socketId, "received message: '" + messageStr + "");
                eval("SceneJS.__socketJSON = " + messageStr); // Parse JSON in Window scope to resolve SceneJS
                var message = SceneJS.__socketJSON;
                if (message.format == "json") {
                    eval("SceneJS.__socketJSON = " + message.body);
                    message.body = SceneJS.__socketJSON;
                }
                return message;
            } catch (e) {
                onError(new SceneJS.errors.SocketErrorException("SceneJS.Socket error (URI: '" + activeSocket.uri + "') : " + e));
            }
        }
        return null;
    };

    this.releaseSocket = function() {
        if (socketStack.length > 0) {
            activeSocket = socketStack.pop();
        } else {
            activeSocket = null;
        }
    };

})();

