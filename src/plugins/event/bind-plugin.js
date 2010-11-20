(function() {

    const SHEDULE_SERVICE_ID = "_message_scheduler";

    if (SceneJS.Services.hasService(SHEDULE_SERVICE_ID)) {
        return;
    }

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
    var scheduleService;

    SceneJS.Services.addService(

            SHEDULE_SERVICE_ID,

            scheduleService = (function() {

                var commandService;
                var time;

                /* triggers in which which messages can run
                 */
                var triggers = {
                    "interval": {           // At timed intervals
                        jobs: {}
                    },
                    "init": {               // When SceneJS initilises
                        jobs: {}
                    },
                    "error": {              // On error
                        jobs: {}
                    },
                    "reset": {              // When SceneJS resets
                        jobs: {}
                    },
                    "scene-rendering": {    // When a scene begins a rendering traversal
                        jobs: {},
                        nodeJobs: {}
                    },
                    "scene-rendered": {     // When a scene finishes a rendering traversal
                        job: {}
                    },

                    "node-created": {       // When a node instance is created
                        nodeJobs: {},       //    Jobs for particular target nodes
                        jobs: {}            //    Jobs for any nodes this event occurs on
                    },

                    "node-destroyed": {     // When a node instance is destroyed
                        nodeJobs: {},       //    Jobs for particular target nodes
                        jobs: {}            //    Jobs for any nodes this event occurs on
                    },

                    "node-updated": {       // When a node instance is updated
                        nodeJobs: {},       //    Jobs for particular target nodes
                        jobs: {}            //    Jobs for any nodes this event occurs on
                    },

                    "node-rendering": {       // When a node is about to render
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes this event occurs on
                    },

                    "node-rendered": {        // When a node has finished rendering
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes this event occurs on
                    }
                    //                    ,
                    //
                    //                    "node-state-changed": {   // When a node declares an explicit state change
                    //                        nodeJobs: {},         //    Jobs for particular target nodes
                    //                        jobs: {}              //    Jobs for any nodes thia event occurs on
                    //                    }
                };


                /* Receive time update
                 */
                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.TIME_UPDATED,
                        function(t) {
                            time = t;
                        });

                /* When SceneJS initialised, get the command service and
                 * execute commands for this trigger
                 */
                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.INIT,
                        function() {
                            commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);
                            runJobs("init");
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.RESET,
                        function() {
                            runJobs("reset");
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.ERROR,
                        function(params) {
                            runJobs("error");
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.SCENE_RENDERING,
                        function(params) {
                            runIntervalJobs();
                            runJobs("scene-rendering", {
                                nodeId: params.nodeId,
                                canvas: params.canvas
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.SCENE_RENDERED,
                        function(params) {
                            runJobs("scene-rendered", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_CREATED,
                        function(params) {
                            runJobs("node-created", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_UPDATED,
                        function(params) {
                            runJobs("node-updated", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_DESTROYED,
                        function(params) {
                            runJobs("node-destroyed", {
                                nodeId: params.nodeId
                            });
                        });


                /** Run jobs that execute at timed intervals
                 */
                function runIntervalJobs() {
                    //                    var trigger = triggers["interval"];
                    //                    var job;
                    //                    var interval;
                    //                    var elapsed;
                    //                    for (var id in trigger) {
                    //                        if (trigger.hasOwnProperty(id)) {
                    //                            job = trigger[id];
                    //                            interval = job.triggers.interval;
                    //                            if (job.interval._startAt == 0) {
                    //                                commandService.executeCommand(job.message);
                    //                                if (interval.once) {
                    //                                    this.unbind(job);
                    //                                }
                    //                            } else {
                    //                                if (!interval._started) {              // Starting this job now
                    //                                    interval._started = time;
                    //                                } else {
                    //                                    elapsed = interval._started - time;
                    //                                    if (elapsed > interval._startAt) {              // At execution interval
                    //                                        commandService.executeCommand(job.message); // execute job
                    //                                        if (interval.once) {
                    //                                            this.unbind(job);                   // one-shot - unschedule for this trigger
                    //                                        } else {
                    //                                            interval._started = time;               // repeating, ready to go again
                    //                                        }
                    //                                    }
                    //                                }
                    //                            }
                    //                        }
                    //                    }
                }


                /*
                 */
                function runJobs(triggerName, params) {
                    if (params && params.nodeId) {
                        var nodeJobs = triggers[triggerName].nodeJobs;
                        var job = nodeJobs[params.nodeId];
                        if (job) {
                            if (!job.message.trigger) {
                                job.message.trigger = {
                                    trigger: triggerName,
                                    nodeId: params.nodeId
                                };
                            }
                            commandService.executeCommand(job.message);
                            //                            if (job.trigger.once) {
                            //                                nodeJobs[params.nodeId] = undefined;
                            //                                jobs[job.jobId] = undefined;
                            //                            }
                            return;
                        }
                    }
                    var jobs = triggers[triggerName].jobs;
                    for (var jobId in jobs) {
                        if (jobs.hasOwnProperty(jobId)) {
                            var job = jobs[jobId];
                            if (!job.message.trigger) {
                                job.message.trigger = {
                                    trigger: triggerName
                                };
                            }
                            commandService.executeCommand(job.message);
                            //                            if (job.trigger.once) {
                            //                                jobs[jobId] = undefined;
                            //                            }
                        }
                    }
                }

                return {

                    bind: function(job) {
                        if (!job.jobId) {
                            throw "job element missing: jobId";
                        }
                        if (!job.triggers) {
                            throw "job '" + job.jobId + "' element missing: triggers";
                        }
                        if (!job.message) {
                            throw "job '" + job.jobId + "' element missing: message";
                        }
                        var trigger;
                        for (var triggerName in job.triggers) {
                            if (job.triggers.hasOwnProperty(triggerName)) {
                                if (!triggers[triggerName]) {
                                    throw "job '" + job.jobId + "' trigger not supported: '" + triggerName + "'";
                                }
                                trigger = job.triggers[triggerName];
                                switch (triggerName) {
                                    case "interval":
                                        var startAt = 0;
                                        if (trigger.interval.hours) {
                                            startAt += trigger.interval.hours * 3600000;
                                        }
                                        if (trigger.interval.minutes) {
                                            startAt += trigger.interval.minutes * 60000;
                                        }
                                        if (trigger.interval.seconds) {
                                            startAt += trigger.interval.minutes * 1000;
                                        }
                                        trigger.interval._startAt = startAt;
                                        triggers[triggerName] = job;
                                        break;

                                    case "interval":
                                    case "init":
                                    case "error":
                                    case "reset":
                                        addJob(triggerName, job);
                                        break;

                                    case "scene-rendering":
                                    case "scene-rendered":
                                    case "node-created":
                                    case "node-destroyed":
                                    case "node-updated":
                                    case "node-rendering":
                                    case "node-rendered":
                                        addJobForTarget(triggerName, job);
                                        break;
                                }
                            }
                        }
                    },

                    unbind: function(job) {
                        for (var trigger in job.triggers) {
                            if (job.triggers.hasOwnProperty(trigger)) {
                                triggers[triggers][job.id] = undefined;
                            }
                        }
                    }
                };

                function addJob(triggerName, job) {
                    var trigger = job.triggers[triggerName];
                    triggers[triggerName].jobs[job.jobId] = job;
                }

                function addJobForTarget(triggerName, job) {
                    var trigger = job.triggers[triggerName];
                    var nodeId = trigger.nodeId;
                    if (nodeId) {
                        triggers[triggerName].nodeJobs[nodeId] = job;
                    }
                    triggers[triggerName].jobs[job.jobId] = job;
                }
            }

                    )
                    ()
            )
            ;

    commandService.addCommand("bind",
            (function() {
                return {
                    execute: function(params) {
                        scheduleService.bind(params);
                    }
                };
            })());

    commandService.addCommand("unbind",
            (function() {
                return {
                    execute: function(params) {
                        scheduleService.unbind(params);
                    }
                };
            })());

})();