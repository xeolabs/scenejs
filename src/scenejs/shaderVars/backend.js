/**
 * Backend for scene vars node, sets variables on the active shader and retains them.
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'vars';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.shaderVars = (function() {
                    var vars = {
                        vars : {
                        },
                        fixed: true
                    };

                    var loaded = false;

                    return {
                        setVars: function(v) {
                            vars = v;
                            loaded = false;
                        },

                        getVars: function() {
                            return vars;
                        },

                        load: function() {
                            if (!loaded) {

                                
                                loaded = true;
                            }
                        },

                        needLoad: function() {
                            loaded = false;
                        }
                    };
                })();
            };

            this.setVars = function(v) {
                ctx.programs.setVars(ctx.canvas.context, v);
            };

            this.getVars = function() {
                ctx.programs.getVars(ctx.canvas.context);
            };
        })());