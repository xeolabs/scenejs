/**
 */
SceneJs.GraphContext = function(cfg) {
    cfg = (cfg) ? cfg : {};

    /** Will cause each node to reset - this is set false after each graph traversal
     */
    this.reset = true;

    /** Logs messages
     */
    if (cfg.logger) {
        this.logger = cfg.logger;
    }

    /** Handles errors
     */
    if (cfg.onError) {
        this.onError = cfg.onError;
    }

    this.time = {
        started: new Date().getTime(),
        elapsed:  0
    };
}
