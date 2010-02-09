/** Memory management backend; Backends that cache things (ie. in video RAM) register themselves against this
 * as "cachers". Then, when a cacher needs to allocate memory for something, it will make the attempt through
 * this backend, which will try to ensure the attempt succeeds; when the attempt fails due to lack of memory, this
 * backend will poll the registered cachers to evict something and retry the attempt, repeating these steps until success.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'memory';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.memory = (function() {

                    var cachers = [];
                    var icacher = 0;  // Fair eviction policy - don't keep starting eviction polling at first cacher

                    /** Polls each registered cacher backend to evict something. Stops on the first one to
                     * comply. When called again, resumes at the next in sequence to ensure fairness.
                     */
                    var evict = function() {
                        if (cachers.length == 0) {
                            return true;
                        }
                        var tries = 0;
                        while (true) {
                            if (icacher > cachers.length) {
                                icacher = 0;
                            }
                            if (cachers[icacher++].evict()) {
                                return true;
                            } else {
                                tries++;
                                if (tries == cachers.length) {
                                    return false;
                                }
                            }
                        }
                    };

                    return {
                        /** Register a caching backend
                         */
                        registerCacher: function(cacherBackend) {
                            cachers.push(cacherBackend);
                        },

                        /** Request allocation of some memory via a callback; the callback will be repeatedly called
                         * as long as it results in an out-of-memory error condition. Each time this happens one of the
                         * registered cachers will be asked to evict something, then this method will try the callback
                         * again.
                         */
                        allocate:function(description, callback) {
                            var maxTries = 10; // TODO: heuristic to calculate this?
                            var context = ctx.renderer.canvas.context;
                            if (context.getError() == context.OUT_OF_MEMORY) {
                                throw "Unhandled out-of-memory error"; // Already out of memory - should have handled this
                            }
                            var tries = 0;
                            while (true) {
                                try {
                                    callback();
                                    return; // No errors, must have worked
                                } catch (e) {
                                    if (context.getError() != context.OUT_OF_MEMORY) {
                                        throw e; // We only handle out-of-memory error here
                                    }
                                    if (++tries > maxTries || !evict()) { // Too many tries or no cacher wants to evict
                                        throw new SceneJs.exceptions.OutOfMemoryException(
                                                "Out of memory - failed to allocate memory for " + description);

                                    }
                                }
                            }
                        }
                    }
                })();

            };


        })());



