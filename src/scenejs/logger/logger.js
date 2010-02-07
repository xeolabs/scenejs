/** Sets vars on the current shader, temporarily overriding vars set by higher vars nodes.
 */
SceneJs.logger = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);
    var backend = SceneJs.backends.getBackend('logger');
    var logger;
    return function(scope) {
        var prevLogger = backend.getLogger();
        if (!logger || !cfg.fixed) {
            logger = cfg.getParams(scope);
            logger.warn = logger.warn || prevLogger.warn;
            logger.error = logger.error || prevLogger.error;
            logger.debug = logger.debug || prevLogger.debug;
            logger.info = logger.info || prevLogger.info;
        }
        backend.setLogger(logger);
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setLogger(prevLogger);
    };
};




