/*
 Testing the SceneJS.Socket node

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 */

SceneJS.setDebugConfigs({
    webgl: {
        trace: true
    }
});
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
                                    //
                                    //-------------------------------------------------------------------------------------

                                        SceneJS.socket({
                                            uri: "ws://localhost:8080/server",  // Should transition to STATE_CONNECTING then STATE_OPEN
                                            // uri: "ws://google.com",          // Should transition to STATE_CONNECTING then STATE_CLOSED since no WebSocket there
                                            // uri: "bad URL",                  // Should transition to STATE_CONNECTING then STATE_ERROR with "SYNTAX_ERR"

                                            listeners: {
                                                //                                                "rendering" : {
                                                //                                                    fn: function(theNode) {
                                                //                                                        theNode.addMessage({
                                                //                                                            body: {
                                                //                                                                cmd: "ready" // Message contents are application-specific -
                                                //                                                            }                // "cmd" is what our particular server expects
                                                //                                                        });
                                                //                                                    },
                                                //                                                    once: true
                                                //                                                },
                                                "state-changed" : {
                                                    fn: function(theNode, params) {
                                                        switch (params.newState) {

                                                            case SceneJS.Socket.STATE_CONNECTING:
                                                                alert("STATE_CONNECTING");
                                                                break;

                                                            case SceneJS.Socket.STATE_OPEN:
                                                                alert("STATE_OPEN");

                                                                /* Once socket is open, send an initial message
                                                                 * to the server to get the ball rolling
                                                                 */
                                                                theNode.addMessage({
                                                                    body: {
                                                                        cmd: "ready" // Message contents are application-specific -
                                                                    }                // "cmd" is what our particular server expects
                                                                });
                                                                break;

                                                            case SceneJS.Socket.STATE_CLOSED:
                                                                alert("STATE_CLOSED");
                                                                break;

                                                            case SceneJS.Socket.STATE_ERROR:
                                                                alert("STATE_ERROR: " + params.exception.message);
                                                                break;
                                                        }
                                                    }
                                                }
                                            }
                                        },

                                                SceneJS.rotate({
                                                    sid: "pitch",
                                                    angle: 0,
                                                    x : 1.0
                                                },
                                                        SceneJS.rotate({
                                                            sid: "yaw",
                                                            angle: 0,
                                                            y : 1.0
                                                        },
                                                                SceneJS.objects.teapot()
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var pInterval;

//exampleScene.render();
//
window.render = function() {

    exampleScene.render();
};

SceneJS.addListener("error", function(e) {
    window.clearInterval(pInterval);
    alert(e.exception.message ? e.exception.message : e.exception);
});

pInterval = setInterval("window.render()", 10);



