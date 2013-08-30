/**
 * Web worker containing a ProximityEngine
 *
 * This worker accepts various commands to configure the engine, add or
 * remove bodies, and integrate, which means find proximity status changes for bodies.
 *
 * After each integration, this worker posts back an array buffer containing
 * an updated status for each body that has changed status.
 *
 * Input Commands
 * --------------------------------------------------------------------------
 *
 * Configure the engine:
 * {
 *      cmd: "setConfigs",
 *      center: [Number, Number, Number,
 *      radii: [Number,Number, ...]
 * }
 *
 * Create a body:
 * {
 *      cmd: "createBody",
 *      bodyId: Number,
 *      bodyCfg: {
 *          pos: [Number, Number, Number],
 *          radii: [Number,Number, ...]
 *      }
 *  }
 *
 * Remove a body:
 * {
 *      cmd: "removeBody",
 *      bodyId: Number
 * }
 *
 * Update a body:
 * {
 *      cmd: "updateBody",
 *      bodyId: Number,
 *      bodyCfg: {
 *          pos: [Number, Number, Number],
 *          radii: [Number,Number, ...]
 *      }
 * }
 *
 * Integrate the engine:
 * {
 *      cmd: "integrate"
 * }
 *
 * Output Buffer
 * --------------------------------------------------------------------------
 *
 * The output buffer contains a 2-element portion for each proximity body, each of
 * which contains the body ID and its proximity status:
 *
 * [
 *      bodyId, status,
 *      bodyId, status,
 *      ...
 * ]
 *
 */
importScripts("proximityEngine.js");

// Array in which this worker posts back
// an updated position and direction for each body
var output;

// Proximity engine engine
var engine = new ProximityEngine();

// Set initial default configuration for proximity engine
engine.setConfigs({
    center:[0, 0, 0],
    radii:[200, 700, 1200]
});

// Handle command from worker owner
addEventListener("message",
    function (e) {

        var data = e.data;

        switch (data.cmd) {

            // Configure the proximity engine
            case "setConfigs":
                engine.setConfigs(data.configs);
                break;

            // Create a proximity body
            case "createBody":
                engine.addBody(data.bodyId, data.bodyCfg);
                break;

            // Update a proximity body
            case "updateBody":
                engine.updateBody(data.bodyId, data.bodyCfg);
                break;

            // Remove a proximity body
            case "removeBody":
                engine.removeBody(data.bodyId);
                break;

            // Integrate the proximity engine and post back the body updates
            case "integrate":
                var output = new Int16Array(data.buffer);
                var body;
                var ibuf = 0;
                engine.integrate(
                    function (updatedBodies, numUpdated) {
                        for (var i = 0; i < numUpdated; i++) {
                            body = updatedBodies[i];
                            output[ibuf++] = body.bodyId;
                            output[ibuf++] = body.status;
                        }
                        // Post the output
                        var response = {
                            buffer:output.buffer,
                            lenOutput:ibuf
                        };
                        self.postMessage(response, [response.buffer]);
                    });
                break;

            default:
                break;
        }
    }, false);

