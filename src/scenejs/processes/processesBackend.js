/**
 * Backend module for asynchronous process management.
 *
 * This module creates a "processes" object on the backend context through which other backend modules may
 * create, destroy and query the state of SceneJS processes.
 *
 * This module maintains a separate group of processes for each active scene. When a scene is defined, it
 * will create a group for it, then whenever it is deactivated it will automatically destroy all processes
 * in its group that have timed out.
 */
SceneJS._backends.installBackend(

        "processes",

        function(ctx) {

            var time = (new Date()).getTime();          // System time
            var groups = {};                            // A process group for each existing scene
            var activeSceneId;                          // ID of currently-active scene

            ctx.events.onEvent(// System time update
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(// Scene defined, create new process group for it
                    SceneJS._eventTypes.SCENE_CREATED,
                    function(params) {
                        var group = {   // IDEA like this
                            sceneId : params.sceneId,
                            processes: {} ,
                            numProcesses : 0
                        };
                        groups[params.sceneId] = group;
                    });

            ctx.events.onEvent(// Scene traversal begins
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        activeSceneId = params.sceneId;
                    });

            ctx.events.onEvent(// Scene traversed - reap its dead and timed-out processes
                    SceneJS._eventTypes.SCENE_DEACTIVATED,
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
                                    if (elapsed > process.timeout) {
                                        ctx.logging.warn("Process timed out after " +
                                                         (process.timeout / 1000) +
                                                         " seconds: " + process.description);
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

            ctx.events.onEvent(// Scene destroyed - destroy its process group
                    SceneJS._eventTypes.SCENE_DESTROYED,
                    function(params) {
                        groups[params.sceneId] = undefined;
                    });

            ctx.events.onEvent(// Framework reset - destroy all process groups
                    SceneJS._eventTypes.RESET,
                    function(params) {
                        groups = {};
                        activeSceneId = null;
                    });

            /**
             * Create object on backend context through which processes
             * may be created, destroyed and queried.
             */
            ctx.processes = {

                /**
                 * Creates a new asynchronous process for the currently active scene and returns a handle to it.
                 * The handle is actually an object containing live information on the process, which must
                 * not be modified.
                 *
                 * Example:
                 *
                 * createProcess({
                 *      description: "loading texture image",
                 *      timeout: 30000,                         // 30 Seconds
                 *      onTimeout(function() {
                 *              alert("arrrg!!");
                 *          });
                 */
                createProcess: function(cfg) {
                    if (!activeSceneId) {
                        throw new SceneJS.exceptions.NoSceneActiveException("No scene active - can't create process");
                    }
                    var group = groups[activeSceneId];
                    var i = 0;
                    while (true) {
                        var pid = activeSceneId + i++;
                        if (!group.processes[pid]) {
                            var process = {
                                sceneId: activeSceneId,
                                id: pid,
                                timeStarted : time,
                                timeRunning: 0,
                                description : cfg.description || "",
                                timeout : cfg.timeout || 30000, // Thirty second default timout
                                onTimeout : cfg.onTimeout
                            };
                            group.processes[pid] = process;
                            group.numProcesses++;
                            ctx.logging.debug("Created process: " + cfg.description);
                            return process;
                        }
                    }
                },

                /**
                 * Destroys the given process, which is the object returned by the previous call to createProcess.
                 * Does not care if no scene is active, or if the process no longer exists or is dead.
                 */
                destroyProcess: function(process) {
                    if (process) {
                        process.destroyed = true;
                        ctx.logging.debug("Destroyed process: " + process.description);
                    }
                },

                /**
                 * Returns the number of living processes for either the scene of the given ID, or if
                 * no ID supplied, the active scene. If no scene is active, returns zero.
                 */
                getNumProcesses : function(sceneId) {
                    var group = groups[sceneId];
                    if (!group) {
                        return 0;
                    }
                    return sceneId ? group.numProcesses : (activeSceneId ? groups[activeSceneId].numProcesses : 0);
                },

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
                 *          timeout :       30000,                      // Timeout in milliseconds
                 *          onTimeout :     <function>                  // Function that will fire on timeout
                 */
                getProcesses : function(sceneId) {
                    var group = groups[sceneId];
                    if (!group) {
                        return {};
                    }
                    return sceneId ? group.processes : (activeSceneId ? groups[activeSceneId].processes : {});
                }
            };

            /* Node-facing API            
             */
            return {

                getNumProcesses: ctx.processes.getNumProcesses,

                getProcesses: ctx.processes.getProcesses

            };
        });
