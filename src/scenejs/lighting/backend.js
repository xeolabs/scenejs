/**
 * WebGL backend for SceneJs.Lights node
 */

SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'lights';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.lightStack) {
                    ctx.lightStack = [];
                }
            };

            var cloneVec = function(v) {
                return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
            };

            var transform = function(l) {
                return {
                    pos : ctx.viewTransform.matrix.transformVector3(
                            ctx.modelTransform.matrix.transformVector3(cloneVec(l.pos))),
                    ambient : l.ambient,
                    diffuse : l.diffuse,
                    specular : l.specular,
                    dir: ctx.viewTransform.matrix.transformVector3(
                            ctx.modelTransform.matrix.transformVector3(cloneVec(l.dir))),
                    constantAttenuation: l.constantAttenuation,
                    linearAttenuation: l.linearAttenuation,
                    quadraticAttenuation: l.quadraticAttenuation
                };
            };

            this.transformLights = function(lights) {
                var lights2 = [];
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    lights2.push(transform(light));
                }
                return lights2;
            };

            this.pushLights = function(lights) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                for (var i = 0; i < lights.length; i++) {
                    ctx.lightStack.push(lights[i]);
                }
                ctx.programs.setVar(ctx.canvas.context, 'scene_Lights', ctx.lightStack);
            };

            this.popLights = function(numLights) {
                for (var i = 0; i < numLights; i++) {
                    ctx.lightStack.pop();
                }
                ctx.programs.setVar(ctx.canvas.context, 'scene_Lights', ctx.lightStack);
            };

            this.getSafeToCache = function() {
                return ctx.viewTransform.cachable && ctx.modelTransform.cacheSafe;
            };
        })());