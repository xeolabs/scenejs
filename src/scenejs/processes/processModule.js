/**
 * Backend module for asynchronous process management.
 *
 * This module provides creation, destruction and query of SceneJS processes.
 *
 * This module maintains a separate group of processes for each active scene. When a scene is defined, it
 * will create a group for it, then whenever it is deactivated it will automatically reap all processes
 * in its group that have timed out.
 *
 *  @private
 */
SceneJS._processModule = new (function() {

    var time = (new Date()).getTime();          // System time
    var groups = {};                            // A process group for each existing scene
    var activeSceneId;                          // ID of currently-active scene

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS._eventModule.addListener(// Scene defined, create new process group for it
            SceneJS._eventModule.SCENE_CREATED,
            function(params) {
                var group = {   // IDEA like this
                    sceneId : params.sceneId,
                    processes: {} ,
                    numProcesses : 0
                };
                groups[params.sceneId] = group;
            });

    SceneJS._eventModule.addListener(// Scene traversal begins
            SceneJS._eventModule.SCENE_COMPILING,
            function(params) {
                activeSceneId = params.sceneId;
            });

    SceneJS._eventModule.addListener(// Scene traversed - reap its dead and timed-out processes
            SceneJS._eventModule.SCENE_COMPILED,
            function() {
                var group = groups[activeSceneId];
                var processes = group.processes;
                for (var pid in processes) {
                    var process = processes[pid];
                    if (process) {
                        if (process.destroyed) {
                            processes[pid] = undefined;
                            group.numProcesses--;
                        } else {
                            var elapsed = time - process.timeStarted;
                            if ((process.timeoutSecs > -1) && (elapsed > (process.timeoutSecs * 1000))) {

                                SceneJS._loggingModule.warn("Process timed out after " +
                                                            process.timeoutSecs +
                                                            " seconds: " + process.description);

                                /* Process timed out - notify listeners
                                 */
                                SceneJS._eventModule.fireEvent(SceneJS._eventModule.PROCESS_TIMED_OUT, {
                                    sceneId: activeSceneId,
                                    process: {
                                        id: process.id,
                                        timeStarted : process.timeStarted,
                                        description: process.description,
                                        timeoutSecs: process.timeoutSecs
                                    }
                                });

                                process.destroyed = true;
                                processes[pid] = undefined;
                                group.numProcesses--;
                                if (process.onTimeout) {
                                    process.onTimeout();
                                }
                            } else {
                                process.timeRunning = elapsed;
                            }
                        }
                    }
                }
                activeSceneId = null;
            });

    SceneJS._eventModule.addListener(// Scene destroyed - destroy its process group
            SceneJS._eventModule.SCENE_DESTROYED,
            function(params) {
                groups[params.sceneId] = undefined;
            });

    SceneJS._eventModule.addListener(// Framework reset - destroy all process groups
            SceneJS._eventModule.RESET,
            function(params) {
                groups = {};
                activeSceneId = null;
            });


    /**
     *
     * Creates a new asynchronous process for the currently active scene and returns a handle to it.
     * The handle is actually an object containing live information on the process, which must
     * not be modified.
     *
     * Example:
     *
     * createProcess({
     *      description: "loading texture image",
     *      timeoutSecs: 30,                         // 30 Seconds
     *      onTimeout(function() {
     *              alert("arrrg!!");
     *          });
     *
     * @private
     */
    this.createProcess = function(cfg) {
        if (!activeSceneId) {
            throw SceneJS._errorModule.fatalError(new SceneJS.errors.NoSceneActiveException("No scene active - can't create process"));
        }
        var group = groups[activeSceneId];
        var i = 0;
        while (true) {
            var pid = activeSceneId + i++;
            if (!group.processes[pid]) {

                /* Register process
                 */
                var process = {
                    sceneId: activeSceneId,
                    id: pid,
                    timeStarted : time,
                    timeRunning: 0,
                    description : cfg.description || "",
                    type: cfg.type,
                    info: cfg.info,
                    timeoutSecs : cfg.timeoutSecs || 30, // Thirty second default timout
                    onTimeout : cfg.onTimeout
                };
                group.processes[pid] = process;
                group.numProcesses++;

                /* Notify listeners
                 */
                SceneJS._eventModule.fireEvent(SceneJS._eventModule.PROCESS_CREATED, {
                    sceneId: activeSceneId,
                    process: {
                        id: process.id,
                        timeStarted : process.timeStarted,
                        description: process.description,
                        type: process.type,
                        info: process.info,
                        timeoutSecs: process.timeoutSecs
                    }
                });

                return process;
            }
        }
    };

    /**
     * Destroys the given process, which is the object returned by the previous call to createProcess.
     * Does not care if no scene is active, or if the process no longer exists or is dead.
     *
     * @private
     */
    this.killProcess = function(process) {
        if (process) {
            process.destroyed = true;

            /* Notify listeners
             */
            SceneJS._eventModule.fireEvent(SceneJS._eventModule.PROCESS_KILLED, {
                sceneId: activeSceneId,
                process: {
                    id: process.id,
                    timeStarted : process.timeStarted,
                    description: process.description,
                    type: process.type,
                    info: process.info,
                    timeoutSecs: process.timeoutSecs
                }
            });
        }
    };

    /**
     * Returns the number of living processes for either the scene of the given ID, or if
     * no ID supplied, the active scene. If no scene is active, returns zero.
     *
     * @private
     */
    this.getNumProcesses = function(sceneId) {
        var group = groups[sceneId];
        if (!group) {
            return 0;
        }
        return sceneId ? group.numProcesses : (activeSceneId ? groups[activeSceneId].numProcesses : 0);
    };

    /**
     * Returns all living processes for the given scene, which may be null, in which case this
     * method will return the living processes for the currently active scene by default. An empty map
     * will be returned if there is no scene active.
     *
     * Process info looks like this:
     *
     *      {   id: "xx",
     *          timeStarted :   65765765765765,             // System time in milliseconds
     *          timeRunning:    876870,                     // Elapsed time in milliseconds
     *          description :   "loading texture image",
     *          timeoutSecs :       30,                      // Timeout in milliseconds
     *          onTimeout :     <function>                  // Function that will fire on timeoutSecs
     *
     * @private
     */
    this.getProcesses = function(sceneId) {
        var group = groups[sceneId];
        if (!group) {
            return {};
        }
        return sceneId ? group.processes : (activeSceneId ? groups[activeSceneId].processes : {});
    };
})();
