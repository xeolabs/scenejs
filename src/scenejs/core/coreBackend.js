/**
 *
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'core';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                var time = (new Date()).getTime();

                ctx.core = (function() {
                    return {
                        getTime: function() {
                            return time;
                        }

                    };
                })();
            };

            this.getTime = function() {
                return ctx.core.getTime();
            };
        })());
