/**
 * Backend for projection nodes, creates context that holds the current
 * scene projection state
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'projection';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.projection = (function() {

                    var projection;
                    var loaded;
                    var planes;

                    ctx.events.onEvent("scene-activated", function() {
                        projection = {
                            matrix : SceneJs.math.identityMat4(),
                            volume : null,
                            fixed: true
                        };
                        loaded = false;
                    });

                    /** When a new program is activated we will need to lazy-load our current matrix
                     */
                    ctx.events.onEvent("program-activated", function() {
                        loaded = false;
                    });

                    /** When a program is deactivated we may need to re-load into the previously active program
                     */
                    ctx.events.onEvent("program-deactivated", function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our matrix if not loaded already
                     */
                    ctx.events.onEvent("geo-drawing", function() {
                        if (!loaded) {

                            /* Lazy-compute WebGL array
                             */
                            if (!projection.matrixAsArray) {
                                projection.matrixAsArray = new WebGLFloatArray(projection.matrix);
                            }

                            ctx.programs.setVar('scene_ProjectionMatrix', projection.matrixAsArray);

                            loaded = true;
                        }
                    });

                    return {

                        setProjection: function(t) {
                            projection = t;
                            planes = SceneJs.math.extractPlanes(projection.matrix, true); // Normalised planes
                            loaded = false;
                        },

                        getProjection: function() {
                            return projection;
                        },

                        transformPoint3: function(v) {
                            return SceneJs.math.transformPoint3(projection.matrix, v);
                        }
                    };
                })();
            };

            this.setProjection = function(projection) {
                ctx.projection.setProjection(projection);
            };

            this.getProjection = function() {
                return ctx.projection.getProjection();
            };

        })());