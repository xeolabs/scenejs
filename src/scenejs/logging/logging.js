/** Specifies logging for its sub-nodes
 */
SceneJS.logging = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('logging');
    var logging;
    return SceneJS._utils.createNode(
            function(scope) {
                var prevLogger = backend.getLogger();
                if (!logging || !cfg.fixed) {
                    logging = cfg.getParams(scope);
                    logging.warn = logging.warn || prevLogger.warn;
                    logging.error = logging.error || prevLogger.error;
                    logging.debug = logging.debug || prevLogger.debug;
                    logging.info = logging.info || prevLogger.info;
                }
                backend.setLogger(logging);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setLogger(prevLogger);
            });
};




