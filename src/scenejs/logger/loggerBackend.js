/**
 * Logging backend.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'logger';

            var ctx;

            var defaultLogger = {
                error:function(msg) {
                    alert(msg);
                } ,
                warn:function(msg) {
                    alert(msg);
                }
            };

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.logger = (function() {

                    var logger;

                    ctx.scenes.onEvent("scene-activated", function() {
                        logger = defaultLogger;
                    });

                    return {

                        getLogger: function() {
                            return logger;
                        },

                        setLogger: function(_logger) {
                            logger = _logger;
                        },

                        debug : function(msg) {
                            if (logger.debug) {
                                logger.debug(msg);
                            }
                        },

                        warn : function(msg) {
                            if (logger.warn) {
                                logger.warn(msg);
                            }
                        },

                        info : function(msg) {
                            if (logger.info) {
                                logger.info(msg);
                            }
                        } ,

                        error : function(msg) {
                            if (logger.error) {
                                logger.error(msg);
                            }
                        }
                    };
                })();

            };

            this.getLogger = function() {
                return ctx.logger.getLogger();
            }

            this.setLogger = function(logger) {
                ctx.logger.setLogger(logger);
            };

        })());