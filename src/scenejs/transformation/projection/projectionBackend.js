/**
 * Backend for projection nodes, creates context that holds the current
 * scene projection state
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'projection';

            var ctx;

            var init = function() {
                ctx.projection = (function() {
                    var projection = {
                        matrix : SceneJs.math.identityMat4(),
                        volume : null,
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
                            loaded = false;
                        },

                        getProjection: function() {
                            return projection;
                        },

                        transformPoint3: function(v) {
                            return SceneJs.math.transformPoint3(projection.matrix, v);
                        },

                        /** Tests for intersection of the current view volume with the given
                         * coordinates
                         *
                         * @returns -1 if all outside, 0 if some inside, 1 if all inside
                         */
                        testVolumeCoordsIntersection: function(coords) {
                            var v = projection.volume;

                            var xminOut = 0;
                            var yminOut = 0;
                            var zminOut = 0;
                            var xmaxOut = 0;
                            var ymaxOut = 0;
                            var zmaxOut = 0;

                            for (var i = 0; i < coords.length; i++) {
                                var p = coords[i];

                                if ((v.xmin * p.w) > p.x) {
                                    xminOut++;
                                }
                                if ((v.xmax * p.w) < p.x) {
                                    xmaxOut++;
                                }
                                if ((v.ymin * p.w) > p.y) {
                                    yminOut++;
                                }
                                if ((v.ymax * p.w) < p.y) {
                                    ymaxOut++;
                                }
                                if (v.zmin  > p.z) {
                                    zminOut++;
                                }
//                                if ((v.zmin * p.w) < p.z) {
//                                    zmaxOut++;
//                                }
                            }
                            if (xminOut + yminOut + zminOut + xmaxOut + ymaxOut + zmaxOut == 0) {
                                return 1;
                            }
                            if (xminOut == coords.length ||
                                yminOut == coords.length ||
                                zminOut == coords.length ||
                                xmaxOut == coords.length ||
                                ymaxOut == coords.length ||
                                zmaxOut == coords.length) {
                                return -1;
                            }
                            return 0;
                        }
                    };
                })();
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            this.setProjection = function(projection) {
                ctx.projection.setProjection(projection);
            };

            this.getProjection = function() {
                return ctx.projection.getProjection();
            };

            this.reset = function() {
                init();
            };
        })());