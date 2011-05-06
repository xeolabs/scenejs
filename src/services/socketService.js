SceneJS.Services.WEBSOCKET_SERVICE_ID = "websocket";

SceneJS.Services.addService(

        SceneJS.Services.WEBSOCKET_SERVICE_ID,

        new (function() {

            var sockets = null;

            SceneJS.bind("reset",
                    function() {
                        this.closeAll();
                    });

            SceneJS.bind("scene-rendering",
                    function() {
                        updateSockets();
                    });

            SceneJS.bind("scene-rendered",
                    function() {
                        updateSockets();
                    });

            function updateSockets() {
                var socket;
                var inQueue;
                for (var socketId in sockets) {
                    if (sockets.hasOwnProperty(socketId)) {
                        socket = sockets[socketId].socket;
                        inQueue = socket.messages.inQueue;
                        if (inQueue.length > 0) {
                            var messageStr = inQueue[inQueue.length - 1];
                            if (messageStr) {
                                try {
                                    var messageObj = eval('(' + messageStr + ')');
                                    inQueue.pop();              // Evaled OK, can pop now
                                    if (socket.onmessage) {
                                        socket.onmessage(messageObj);
                                    }
                                } catch (e) {
                                    throw "WebSocket error reading message (from server at URI: '" + socket.uri + "') : ";
                                }
                            }
                        }
                    }
                }
            }

            this.open = function(params, handlers) {
                if (!("WebSocket" in window)) {
                    throw "WebSocket cannot be used - WebSockets are not supported by this browser";
                }
                params = params || {};
                if (!params.url) {
                    throw "WebSocket param expected: url";
                }
                var socketId = nextSocketId();
                var webSocket;
                try {
                    webSocket = new WebSocket(params.uri);  // W3C WebSocket
                } catch (e) {
                    throw "WebSocket error (URI: '" + params.uri + "') : " + e.message || e;
                }
                var socket = {
                    id : socketId,
                    uri: params.uri,
                    socket: webSocket,
                    messages : {
                        inQueue : []
                    }
                };
                sockets[socketId] = socket;
                webSocket.onmessage = function (evt) {
                    socket.messages.inQueue.unshift(evt.data);
                };
                if (handlers) {
                    this.bind(socketId, handlers);
                }
                return socketId;
            };

            function nextSocketId() {
                var i = 0;
                while (true) {
                    var key = "socket" + i++;
                    if (!sockets[key]) {
                        return key;
                    }
                }
            }

            this.send = function(socketId, message) {
                var socket = getSocket(socketId);
                if (socket.socket.readyState != 1) {
                    throw "Socket not open: " + socketId;
                }
                var messageStr = JSON.stringify(message);
                try {
                    socket.socket.send(messageStr);
                } catch (e) {
                    throw "WebSocket error sending message to server at URI: '" + socket.uri + "' : " + e;
                }
            };

            this.bind = function(socketId, handlers) {
                var socket = getSocket(socketId);
                if (handlers) {
                    if (handlers.opened) {
                        socket.socket.onopen = function() {
                            handlers.opened({ socketid: socketId });
                        };
                    }
                    if (handlers.message) {
                        socket.onmessage = function (message) {
                            handlers.message({ socketid: socketId, message: message });
                        };
                    }
                    if (handlers.error) {
                        sockets.socket.onerror = function(e) {
                            sockets[socketId] = null;
                            var msg = "WebSocket error (URI: '" + socket.uri + "') : " + e;
                            handlers.error({socketId: socketId, error: msg });
                        };
                    }
                    if (handlers.closed) {
                        sockets.socket.onclose = function() {
                            sockets[socketId] = null;
                            handlers.error({ socketId: socketId });
                        };
                    }
                }
            };

            this.each = function(fn) {
                var temp = sockets.slice(0);
                for (var i = 0; i < temp.length; i++) {
                    fn(temp[i].id);
                }
            };

            this.status = function(socketId) {
                var socket = sockets[socketId];
                if (!socket) {
                    return null;
                }
                return socket.socket.readyState;

            };

            this.close = function(socketId) {
                var socket = getSocket(socketId);
                if (socket.readyState != 2 && socket.readyState != 3) { // Only when not already closed or closing
                    socket.close();
                    sockets[socketId] = null;
                }
            };

            this.closeAll = function() {
                var socket;
                for (var socketId in sockets) {
                    if (sockets.hasOwnProperty(socketId)) {
                        socket = sockets[socketId].socket;
                        if (socket.readyState != 2 && socket.readyState != 3) { // Only when not already closed or closing
                            socket.close();
                        }
                    }
                }
                sockets = {};
            };

            function getSocket(socketId) {
                var socket = sockets[socketId];
                if (!socket) {
                    throw "Socket not found: " + socketId;
                }
                return socket;
            }
        })());

