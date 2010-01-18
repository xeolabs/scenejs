/**
 * Backend for a lights node, provides ability to set lights on the current shader. The lights are held in a stack,
 * which can be pushed to and popped from. Each time after it is pushed or popped, the stack is loaded into the
 * shader. Note that the current shader may have a limit on how many lights it will recognise, in which case only
 * that many lights from the top of the stack downwards will be effectively active within the shader.
 */

SceneJs.backends.installBackend(
        new (function() {

            this.type = 'lights';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.lights = (function() {
                    var lightStack = [];

                    var loaded = false;

                    /** When a new program is activated we will need to lazy-load our lights
                     */
                    ctx.programs.onProgramActivate(function() {
                        loaded = false;
                    });

                    /**
                     * When geometry is about to draw we load our lights if not loaded already
                     */
                    ctx.geometry.onDraw(function() {
                        if (!loaded) {
                            ctx.programs.setVar('scene_Lights', lightStack);
                            loaded = true;
                        }
                    });

                    return {

                        /** Pushes view-space lights to stack
                         */
                        pushLights : function(lights) {
                            for (var i = 0; i < lights.length; i++) {
                                lightStack.push(lights[i]);
                            }
                            loaded = false;
                        },

                        /** Pops view-space lights from stack
                         */
                        popLights : function(numLights) {
                            for (var i = 0; i < numLights; i++) {
                                lightStack.pop();
                            }
                            loaded = false;
                        },

                        reset: function() {
                            lightStack = [];
                            loaded = false;
                        }
                    };
                })();
            };


            var cloneVec = function(v) {
                return v ? {x:v.x || 0, y:v.y || 0, z:v.z || 0} : { x:0, y:0, z:0 };
            };

            /** Transforms a light by the current view and modelling matrices
             */
            var transform = function(l) {
                return {
                    pos : ctx.modelTransform.transformPoint3(cloneVec(l.pos)),
                    ambient : l.ambient,
                    diffuse : l.diffuse,
                    specular : l.specular,
                    dir: ctx.modelTransform.transformVector(cloneVec(l.dir)),
                    constantAttenuation: l.constantAttenuation,
                    linearAttenuation: l.linearAttenuation,
                    quadraticAttenuation: l.quadraticAttenuation
                };
            };

            /**
             * For client node to transform its lights from model to view-space before it pushes them onto the stack.
             * This allows the node to memoize the lights after transformation in cases when the coordinate space is
             * fixed; the client node should not memoize, however, if getSafeToCache() returns true;
             */
            this.transformLights = function(lights) {
                var lights2 = [];
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    lights2.push(transform(light));
                }
                return lights2;
            };

            /** Returns true if the coordinate space defined by the current view matrices is
             * fixed, ie. not animated, at this level of scene traversal. If not, then it is not safe
             * for the client node to memoize its lights once they are transformed, because the transformation
             * is therefore likely to vary, causing the lights to move around.
             */
            this.getSafeToCache = function() {
                return ctx.modelTransform.isFixed();
            };

            this.pushLights = function(lights) {
                ctx.lights.pushLights(lights);
            };

            this.popLights = function(numLights) {
                ctx.lights.popLights(numLights);
            };

            this.reset = function() {
                ctx.lights.reset();
            };
        })());