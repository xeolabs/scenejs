/**
 * Manages the current modelling transformation
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'model-transform';

            var ctx;

            var init = function() {

                ctx.modelTransform = (function() {
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
                     * When geometry is about to drawn we load our matrix if not loaded already
                     */
                   ctx.scenes.onEvent("geo-drawing", function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL arrays
                             */
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            /* Lazy compute normal matrix
                             */
                            if (!transform.normalMatrixAsArray) {
                                transform.normalMatrixAsArray = new WebGLFloatArray(SceneJs.math.mat4To3(SceneJs.math.transposeMat4(SceneJs.math.inverseMat4(transform.matrix))));
                            }

                            ctx.programs.setVar('scene_ModelMatrix', transform.matrixAsArray);
                            ctx.programs.setVar('scene_NormalMatrix', transform.normalMatrixAsArray);

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
                        } ,

                        transformVector: function(v) {
                            return SceneJs.math.transformVector3(transform.matrix, v);
                        } ,

                        isFixed: function() {
                            return transform.fixed;
                        }
                    };
                })();
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.setTransform = function(transform) {
                ctx.modelTransform.setTransform(transform);
            };

            this.getTransform = function() {
                return ctx.modelTransform.getTransform();
            };

            this.reset = function() {
                init();
            };
        })());