var exampleScene = SceneJS.scene({
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv" },

        SceneJS.lookAt({
            eye : { x: 0.0, y: 10.0, z: -15 },
            look : { y:1.0 },
            up : { y: 1.0 }
        },
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.0,
                        near : 0.10,
                        far : 300.0  }
                },
                        SceneJS.lights({
                            sources: [
                                {
                                    type:                   "dir",
                                    color:                  { r: 1.0, g: 0.5, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.5, g: 1.0, b: 0.5 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type:                   "dir",
                                    color:                  { r: 0.2, g: 0.2, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                                }
                            ]},
                                SceneJS.material({
                                    baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                    specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                    specular:       0.9,
                                    shine:          6.0
                                },

                                    //-------------------------------------------------------------------------------------
                                    // SceneJS Socket node, an abstraction on top of the W3C WebSocket
                                    // http://dev.w3.org/html5/websockets/#the-websocket-interface
                                    //-------------------------------------------------------------------------------------

                                        SceneJS.socket({
                                            uri: "ws://127.0.0.1:8888/",   // Should transition to STATE_CONNECTING then STATE_OPEN

                                            /* Messages to send as soon as the socket is first opened.
                                             */
                                            messages: [
                                                {
                                                    cmd: "createTeapot"
                                                }
                                                ,
                                                {
                                                    cmd: "rotateTeapot"
                                                }
//                                                ,
//                                                {
//                                                    cmd: "destroyTeapot"
//                                                }
                                            ],

                                            listeners: {

                                                "msg-sent" : {
                                                    fn: function(theNode, message) {
                                                        alert(JSON.stringify(message));
                                                    }
                                                },

                                                "msg-received" : {
                                                    fn: function(theNode, message) {
                                                        alert(JSON.stringify(message.body.configs));
                                                    }
                                                },

                                                "state-changed" : {
                                                    fn: function(theNode, params) {
                                                        switch (params.newState) {
                                                            case SceneJS.Socket.STATE_CONNECTING:
                                                                // alert("STATE_CONNECTING");
                                                                break;

                                                            case SceneJS.Socket.STATE_OPEN:
                                                                //  alert("STATE_OPEN");
                                                                break;

                                                            case SceneJS.Socket.STATE_CLOSED:
                                                                //  alert("STATE_CLOSED");
                                                                break;

                                                            case SceneJS.Socket.STATE_ERROR:
                                                                //  alert("STATE_ERROR: " + params.exception.message);
                                                                break;
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                                SceneJS.node({ sid: "world-root" })

                                                ) // Socket
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Debug configs
 *---------------------------------------------------------------------*/

SceneJS.setDebugConfigs({
    sockets: {
        trace: true
    }
});

/*----------------------------------------------------------------------
 * Scene rendering stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

window.render = function() {
    var x;
    exampleScene.render();
};

SceneJS.addListener("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 10);


