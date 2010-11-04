(function() {

    if (SceneJS.Services.hasService("_message_scheduler")) {
        return;
    }

    SceneJS.Services.addService(

            "_message_scheduler",

            (function() {

                var commandService;
                var time;

                /* triggers in which which messages can run
                 */
                var triggers = {
                    "interval": {},           // At timed intervals
                    "init": {},               // When SceneJS initilises
                    "error": {},              // On error
                    "reset": {},              // When SceneJS resets
                    "scene-rendering": {},    // When a scene begins a rendering traversal
                    "scene-rendered": {},     // When a scene finishes a rendering traversal

                    "node-created": {         // When a node instance is created
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes thia event occurs on
                    },

                    "node-destroyed": {       // When a node instance is destroyed
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes thia event occurs on
                    },

                    "node-updated": {       // When a node instance is updated
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes thia event occurs on
                    },

                    "node-rendering": {       // When a node is about to render
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes thia event occurs on
                    },

                    "node-rendered": {        // When a node has finished rendering
                        nodeJobs: {},         //    Jobs for particular target nodes
                        jobs: {}              //    Jobs for any nodes thia event occurs on
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
                            runJobsForTarget("scene-rendering", {
                                nodeId: params.nodeId,
                                canvas: params.canvas
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.SCENE_RENDERED,
                        function(params) {
                            runJobsForTarget("scene-rendered", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_CREATED,
                        function(params) {
                            runJobsForTarget("node-created", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_UPDATED,
                        function(params) {
                            runJobsForTarget("node-updated", {
                                nodeId: params.nodeId
                            });
                        });

                SceneJS._eventModule.addListener(
                        SceneJS._eventModule.NODE_DESTROYED,
                        function(params) {
                            runJobsForTarget("node-destroyed", {
                                nodeId: params.nodeId
                            });
                        });


                /** Run jobs that execute at timed intervals
                 */
                function runIntervalJobs() {
                    var trigger = triggers["interval"];
                    var job;
                    var interval;
                    var elapsed;
                    for (var id in trigger) {
                        if (trigger.hasOwnProperty(id)) {
                            job = trigger[id];
                            interval = job.triggers.interval;
                            if (job.interval._startAt == 0) {
                                commandService.executeCommand(job.message);
                                if (interval.once) {
                                    this.unschedule(job);
                                }
                            } else {
                                if (!interval._started) {              // Starting this job now
                                    interval._started = time;
                                } else {
                                    elapsed = interval._started - time;
                                    if (elapsed > interval._startAt) {              // At execution interval
                                        commandService.executeCommand(job.message); // execute job
                                        if (interval.once) {
                                            this.unschedule(job);                   // one-shot - unschedule for this trigger
                                        } else {
                                            interval._started = time;               // repeating, ready to go again
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                /* Run jobs in the given trigger
                 */
                function runJobs(triggerName) {
                    var trigger = triggers[triggerName];
                    var job;
                    for (var jobId in trigger) {
                        if (trigger.hasOwnProperty(jobId)) {
                            job = trigger[jobId];
                            commandService.executeCommand(job.message);
                            if (job.triggers[triggerName].once) {
                                trigger[jobId] = undefined;
                            }
                        }
                    }
                }

                /*
                 */
                function runJobsForTarget(triggerName, params) {
                    var trigger = triggers[triggerName];
                    var jobTrigger;
                    var job;
                    for (var jobId in trigger) {
                        if (trigger.hasOwnProperty(jobId)) {
                            job = trigger[jobId];
                            jobTrigger = job.triggers[triggerName];
                            if (jobTrigger.nodeId) {
                                if (!job.message.trigger) {
                                    job.message.trigger = {
                                        trigger: triggerName,
                                        nodeId: params.nodeId
                                    };
                                }
                                commandService.executeCommand(job.message);
                            }
                            if (jobTrigger.once) {
                                trigger[jobId] = undefined;
                            }
                        }
                    }
                }

                return {

                    schedule: function(job) {

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
                            if (job.triggers.hasOwnProperty(trigger)) {
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

                                    case "node-created":
                                    case "node-destroyed":
                                    case "node-updated":
                                    case "node-rendering":
                                    case "node-rendered":
                                    case "scene-rendering":
                                    case "scene-rendered":
                                        addJobForTarget(triggerName, job);
                                        break;
                                    default:
                                }
                            }
                        }
                    },

                    unschedule: function(job) {
                        for (var trigger in job.triggers) {
                            if (job.triggers.hasOwnProperty(trigger)) {
                                triggers[triggers][job.id] = undefined;
                            }
                        }
                    }
                };

                function addJobForTarget(triggerName, job) {
                    var trigger = job.triggers[triggerName];
                    var target = trigger.target;
                    if (target) {
                        triggers[triggerName].nodeJobs[target] = job;
                    } else {
                        triggers[triggerName].jobs[target] = job;
                    }
                }

            })());

    SceneJS.Services
            .getService(SceneJS.Services.COMMAND_SERVICE_ID)
            .addCommand("schedule",
            (function() {
                var scheduleService = SceneJS.Services.getService(SceneJS.Services.SCHEDULE_SERVICE_ID);
                return {
                    execute: function(params) {
                        scheduleService.schedule.schedule(params);

                        /* Further jobs
                         */
                        var jobs = params.jobs;
                        if (jobs) {
                            for (var i = 0; i < jobs.length; i++) {
                                scheduleService.schedule(jobs[i]);
                            }
                        }
                    }
                };
            })());

    SceneJS.Services
            .getService(SceneJS.Services.COMMAND_SERVICE_ID)
            .addCommand("unschedule",
            (function() {
                var scheduleService = SceneJS.Services.getService(SceneJS.Services.SCHEDULE_SERVICE_ID);
                return {
                    execute: function(params) {
                        SceneJS.Services
                                .getService(SceneJS.Services.SCHEDULE_SERVICE_ID)
                                .unschedule(params);

                        /* Further jobs
                         */
                        var jobs = params.jobs;
                        if (jobs) {
                            for (var i = 0; i < jobs.length; i++) {
                                scheduleService.unschedule(jobs[i]);
                            }
                        }
                    }
                };
            })());

})();