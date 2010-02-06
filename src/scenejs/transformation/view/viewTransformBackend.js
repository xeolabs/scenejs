/**
 * Manages the current view transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'view-transform';

            var ctx;

            var init = function() {

                ctx.viewTransform = (function() {
                    var transform = {
                        matrix : SceneJs.math.identityMat4(),
                        fixed: true
                    };

                    var loaded = false;

                    /** When a new program is activated we will need to lazy-load our current matrix
                     */
                    ctx.scenes.onEvent("program-activated", function() {
                        loaded = false;
                    });

                    /** When a program is deactivated we may need to re-load into the previously active program
                     */
                    ctx.scenes.onEvent("program-deactivated", function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our matrix if not loaded already
                     */
                    ctx.scenes.onEvent("geo-drawing", function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL array
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            ctx.programs.setVar('scene_ViewMatrix', transform.matrixAsArray);

                            loaded = true;
                        }
                    });

                    return {
                        setTransform: function(t) {
                            transform = t;
                            loaded = false;
                        },

                        getTransform: function() {
                            return transform;
                        },

                        transformPoint3: function(v) {
                            return SceneJs.math.transformPoint3(transform.matrix, v);
                        }
                    };
                })();
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.setTransform = function(transform) {
                ctx.viewTransform.setTransform(transform);
            };

            this.getTransform = function() {
                return ctx.viewTransform.getTransform();
            };

            this.reset = function() {
                init();
            };
        })());