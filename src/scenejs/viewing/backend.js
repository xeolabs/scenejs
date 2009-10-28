SceneJs.private.backendModules.installBackend(
        new (function() {

            this.type = 'viewtransform';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;
                if (!ctx.viewTransform) {
                    ctx.viewTransform = {
                        matrix :  new SceneJs.utils.Matrix4(),
                        cacheSafe: true
                    };
                }
            };

            this.setViewTransform = function(transform) {
                if (!ctx.programs.getActiveProgramId()) {
                    throw 'No shader active';
                }
                ctx.viewTransform = transform;
                ctx.programs.setVar(cfg.context, 'scene_ViewMatrix', transform.matrix);
            };

            this.getViewTransform = function() {
                return ctx.viewTransform;
            };
        })());