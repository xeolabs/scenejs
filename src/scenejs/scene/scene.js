/**
 * Root node of a scene graph. Like all nodes, its arguments are an optional config object followed by
 * zero or more child nodes. The members of the config object are set on the root data scope when rendered.
 *
 */

(function() {

    var backend = SceneJS._backends.getBackend('scene');
    var processesBackend = SceneJS._backends.getBackend('processes');   // For process queries through scene object

    /** Creates a new scene
     */
    SceneJS.scene = function() {

        /* Check that backend modules installed OK
         */
        if (SceneJS._backends.getStatus().error) {
            throw SceneJS._backends.getStatus().error;
        }

        var cfg = SceneJS._utils.getNodeConfig(arguments);
        if (!cfg.fixed) {
            throw new SceneJS.exceptions.UnsupportedOperationException
                    ("Dynamic configuration of SceneJS.scene nodes is not supported");
        }
        var params = cfg.getParams();
        if (!params.canvasId) {
            throw new SceneJS.exceptions.NodeConfigExpectedException("Mandatory SceneJS.scene node parameter missing: canvasId");
        }

        var sceneId = null; // Unique ID for this scene graph - null again as soon as scene destroyed

        /* Create, register and return the scene graph
         */
        var _scene = {

            /**
             * Renders the scene, passing in the given parameters to override any node parameters
             * that were set on the config.
             */
            render : function(paramOverrides) {
                if (sceneId) {
                    backend.activateScene(sceneId);
                    var scope = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed scope for cacheing??
                    var params = cfg.getParams();
                    for (var key in params) {    // Push scene params into scope
                        scope.put(key, params[key]);
                    }
                    if (paramOverrides) {        // Override with traversal params
                        for (var key in paramOverrides) {
                            scope.put(key, paramOverrides[key]);
                        }
                    }
                    SceneJS._utils.visitChildren(cfg, scope);
                    backend.deactivateScene();
                }
            },

            pick : function(paramOverrides, canvasX, canvasY) {
                if (sceneId) {
                    try {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_PICKING;
                        backend.activateScene(sceneId);
                        var scope = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed scope for cacheing??
                        var params = cfg.getParams();
                        for (var key in params) {    // Push scene params into scope
                            scope.put(key, params[key]);
                        }
                        if (paramOverrides) {        // Override with traversal params
                            for (var key in paramOverrides) {
                                scope.put(key, paramOverrides[key]);
                            }
                        }
                        SceneJS._utils.visitChildren(cfg, scope);
                        backend.deactivateScene();
                    } finally {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    }
                }
            },


            /**
             * Returns count of active processes. A non-zero count indicates that the scene should be rendered
             * at least one more time to allow asynchronous processes to complete - since processes are
             * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
             * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
             * a race condition.
             */
            getNumProcesses : function() {
                return (sceneId) ? processesBackend.getNumProcesses(sceneId) : 0;
            },

            /** Destroys this scene, after which it cannot be rendered any more. You should destroy
             * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
             * resources for it (eg. shaders, VBOs etc) that are no longer in use.
             */
            destroy : function() {
                if (sceneId) {
                    backend.deregisterScene(sceneId); // Last one fires RESET command
                    sceneId = null;
                }
            },

            /** Returns true if scene active, ie. not destroyed
             */
            isActive: function() {
                return (sceneId != null);
            }
        };

        /* Register scene - fires a SCENE_CREATED event
         */
        sceneId = backend.registerScene(_scene, params);

        return _scene;
    };

    /** Total SceneJS reset - destroys all scenes and cached resources.
     */
    SceneJS.reset = function() {
        var scenes = backend.getAllScenes();
        var temp = [];
        for (var i = 0; i < scenes.length; i++) {
            temp.push(scenes[i]);
        }
        while (temp.length > 0) {

            /* Destroy each scene individually so it they can mark itself as destroyed.
             * A RESET command will be fired after the last one is destroyed.
             */
            temp.pop().destroy();
        }
    };
})();
