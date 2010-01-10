/** Root node of a scene graph. Like all nodes, its arguments are a config object followed by
 * zero or more child nodes. The members of the config object are set on the root data scope when rendered.
 *
 */

(function() {

    var nScenes = 0;
    var scenes = [];

    /** Registers scene with SceneJS and returns it's ID.
     */
    var registerScene = function(scene) {
        var i = 0;
        while (true) {
            var id = "scene" + i++;
            if (!scenes[id]) {
                scenes[id] = scene;
                nScenes++;
                return id;
            }
        }
    };

    /** Creates a new scene
     */
    SceneJs.scene = function() {
        var cfg = SceneJs.utils.getNodeConfig(arguments);
        var destroyed = false;
        var _scene = {

            /**
             * Renders the scene scene, passing in the given parameters to override node parameters
             * set on the root data scope
             */
            render : function(paramOverrides) {
                if (!destroyed) {
                    var scope = SceneJs.utils.newScope(null, false); // TODO: how to determine fixed scope for cacheing??
                    var params = cfg.getParams();
                    for (var key in params) {    // Push scene params into scope
                        scope.put(key, params[key]);
                    }
                    if (paramOverrides) {        // Override with traversal params
                        for (var key in paramOverrides) {
                            scope.put(key, paramOverrides[key]);
                        }
                    }
                    SceneJs.utils.visitChildren(cfg, scope);
                }
            },

            /** Destroys this scene, after which it cannot be rendered any more. You should destroy
             * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
             * resources for it (eg. shaders, VBOs etc) that are no longer in use.
             */
            destroy : function() {
                if (!destroyed) {
                    destroyed = true;
                    scenes[this.id] = null;
                    nScenes--;
                    if (nScenes == 0) {
                        SceneJs.backends.reset();
                    }
                }
            },

            play : function(cfg, idleFunc) {
                var p = setInterval(function() {
                    this.render(cfg.params);
                    if (idleFunc) {
                        cfg = idleFunc(cfg);
                        if (!cfg) {
                            clearInterval(p);
                            this.destroy();
                        }
                    }
                }, cfg.fps || 5);
            }
        };
        _scene.id = registerScene(_scene);
        return _scene;
    };

    /** Destroys all scenes and causes SceneJS to release all resources it is currently holding for them.
     */
    SceneJs.reset = function() {
        for (var id in scenes) {
            var scene = scenes[id];
            if (scene) {
                scene.destroy();
            }
        }
        scenes = {};
    };
})();
