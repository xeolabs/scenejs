/**
 * Logging backend.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'logger';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.logger = (function() {

                    return {

                        logError : function(msg) {
                            alert(msg);
                        },

                        logWarning : function(msg) {
                              alert(msg);
                        },

                        log : function(msg) {
                        }
                    };
                })();

            };

            this.logError = function(msg) {
                ctx.logError(msg);
            };

            this.logWarning = function(msg) {
                ctx.logWarning(msg);
            };

            this.log = function(msg) {
                ctx.log(msg);
            };

        })());