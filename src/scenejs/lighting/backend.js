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

            var init = function() {
                ctx.lightStack = [];
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
            };

            var cloneVec = function(v) {
                return v ? {x:v.x || 0, y:v.y || 0, z:v.z || 0} : { x:0, y:0, z:0 };
            };

            /** Transforms a light by the current view and modelling matrices
             */
            var transform = function(l) {
                return {
                    pos : ctx.mvTransform.matrix.transformVector3(cloneVec(l.pos)),
                    ambient : l.ambient,
                    diffuse : l.diffuse,
                    specular : l.specular,
                    dir: ctx.mvTransform.matrix.transformVector3(cloneVec(l.dir)),
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
                return ctx.mvTransform.fixed;
            };

            /** Pushes view-space lights to stack, and then inserts stack into shader.
             */
            this.pushLights = function(lights) {
                if (!ctx.programs.getActiveProgramId()) {
                     throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                }
                for (var i = 0; i < lights.length; i++) {
                    ctx.lightStack.push(lights[i]);
                }
                ctx.programs.setVar('scene_Lights', ctx.lightStack);
            };

            /** Pops view-space lights from stack, and then re-inserts stack into shader.
             *
             */
            this.popLights = function(numLights) {
                for (var i = 0; i < numLights; i++) {
                    ctx.lightStack.pop();
                }
                ctx.programs.setVar('scene_Lights', ctx.lightStack);
            };

            this.reset = function() {
                init();
            };
        })());