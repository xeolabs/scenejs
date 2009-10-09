/**
 */
SceneJs.GraphContext = function(cfg) {
    cfg = (cfg) ? cfg : {};

//    /** Partitions for persistence scope - GUAVA-18
//     */
//    var frame = {}; // Set back to {} after Scene node post-visited
//
//    var scene = {}; // Perists indefinitely

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

//    this.getFrame = new function() {
//        return frame;
//    }
//
//    this.clearFrame = new function() {
//        frame = {};
//    }
//
//    this.getScene = new function() {
//        return scene;
//    }
//
//    this.clearScene = new function() {
//        scene = {};
//    }
}
