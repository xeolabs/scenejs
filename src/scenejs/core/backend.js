/**
 * Backend for a scene node.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'scene';

            var ctx;
            var processCount = 0;

            this.install = function(_ctx) {
                ctx = _ctx;
                ctx.processes = {

                    /** Called by backend when it has started a new process
                     */
                    processStarted: function() {
                        processCount++;
                    },

                    /** Called by backend when a process has stopped
                     */
                    processStopped: function() {
                        processCount--;
                    },

                    /** Returns count of active processes
                     */
                    getNumProcesses : function() {
                        return processCount;
                    },

                    /** Resets all processes
                     */
                    reset : function() {
                        processCount = 0;
                    }
                };
            };
        })());



