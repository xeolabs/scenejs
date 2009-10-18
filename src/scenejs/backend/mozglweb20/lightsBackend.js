/**
 * WebGL backend for SceneJs.Lights node
 */

SceneJs.Backend.installNodeBackend(
        new (function() {

            this.canvasType = 'moz-glweb20';
            this.nodeType = 'lights';

            var ctx;
            var cfg;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.lightStack) {
                    ctx.lightStack = new function() {
                        var stack = [];

                        var clonePos = function(v) {
                            return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
                        };

                        var cloneVec = function(v) {
                            return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
                        };

                        var partialCloneLight = function(l) {
                            return {
                                pos : clonePos(l.pos),
                                ambient : l.ambient,
                                diffuse : l.diffuse,
                                specular : l.specular,
                                dir: cloneVec(l.dir),
                                constantAttenuation: l.constantAttenuation,
                                linearAttenuation: l.linearAttenuation,
                                quadraticAttenuation: l.quadraticAttenuation
                            };
                        };

                        var transform = function(mat, v) {
                            var v2 = mat.x($V([v.x, v.y, v.z, 1.0]));
                            return { x : v2.elements[0], y: v2.elements[1], z: v2.elements[2], w: 1 };
                        };

                        this.pushLights = function(context, lights) {
                            if (!ctx.programs.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            var mat = ctx.mvMatrixStack.peek();
                            for (var i = 0; i < lights.length; i++) {
                                var light = lights[i];
                                if (mat) {
                                    light = partialCloneLight(light);   // Dont modify the light
                                    light.pos = transform(mat, light.pos);
                                    light.dir = transform(mat, light.dir);
                                }
                                stack.push(light);
                            }
                             ctx.programs.setVar(context, 'scene_Lights', stack);
                        };

                        this.popLights = function(context, numLights) {
                            if (!ctx.programs.getActiveProgramName()) {
                                throw 'No program active';
                            }
                            for (var i = 0; i < numLights; i++) {
                                stack.pop();
                            }
                            ctx.programs.setVar(context, 'scene_Lights', stack);
                        };
                    };
                }
            };

            this.configure = function(_cfg) {
                cfg = _cfg;
            };

            /**
             * Transforms given world-space lights to view-space, pushes those onto the lights stack,
             * then loads the stack into scripts of current shader program.
             */
            this.pushLights = function(lights) {
                ctx.lightStack.pushLights(cfg.context, lights);
            };

            /**
             * Pops the given number of lights off the lights stack then loads the stack into
             * scripts of current shaderprogram
             */
            this.popLights = function(numLights) {
                ctx.lightStack.popLights(cfg.context, numLights);
            };
        })());