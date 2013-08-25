/**
 * Web worker containing a JigLibJS rigid-body physics system.
 *
 * This worker accepts various commands to setConfigs the system, add or
 * remove bodies, and integrate (which means run the system for one frame).
 *
 * After each integration, this worker posts back an array buffer containing
 * an updated position and direction for each body.
 *
 *
 * Input Commands
 * --------------------------------------------------------------------------
 *
 * Configure the system:
 * {
 *      cmd: "setConfigs",
 *      //..configs
 * }
 *
 * Create a body:
 * {
 *      cmd: "createBody",
 *      bodyId: Number,
 *      bodyCfg: {
 *          shape: "plane" | "box" | "sphere",
 *          movable: true | false,
 *          pos: [Number, Number, Number],
 *          mass: Number,
 *          restitution: Number,
 *          friction: Number,
 *          velocity: [Number, Number, Number]
 *      }
 *  }
 *
 * Remove a body:
 * {
 *      cmd: "removeBody",
 *      bodyId: Number
 * }
 *
 * Integrate the phsycis system:
 * {
 *      cmd: "integrate"
 * }
 *
 *
 * For efficiency, the physics system manages bodies in an array. The "bodyId"
 * parameter on the "createBody" command is the index for that body in the array.
 *
 * The "removeBody" command will delete a body from the array, leaving a hole.
 *
 * The worker can handle holes in the array OK, but in order to keep the array
 * from getting too sparse, it's the reponsibility of the worker client to make
 * its next "createBody" command specify a "bodyId" that indexes that hole, to plug
 * the gap with the next new body.
 *
 *
 * Output Buffer
 * --------------------------------------------------------------------------
 *
 * The output buffer contains a 20-element portion for each physics body, each of
 * which contains the body ID, a new position, and a 16-element rotation matrix:
 *
 * [
 *      bodyId, xPos, yPos, zPos, mat0, ... mat15,
 *      bodyId, xPos, yPos, zPos, mat0, ... mat15,
 *      ...
 * ]
 *
 */
importScripts("jiglib.all.min.js");

var bodies = [];
var numBodies = 0;

// Buffer in which this worker posts back
// an updated position and direction for each body
var updates = [];

var system = jigLib.PhysicsSystem.getInstance();

// Set initial default configuration for physics system
setConfigs();

/** Configures JigLibJS
 */
function setConfigs(params) {
    params = params || {};
    system.setGravity(params.gravity || [0, -9.8, 0, 0]); //-120
    system.setSolverType(params.solver || 'ACCUMULATED'); //FAST, NORMAL, ACCUMULATED
}

// System starts immediately
var then = (new Date()).getTime();

// Handle command from worker owner
addEventListener("message",
    function (e) {

        var data = e.data;

        switch (data.cmd) {

            // Configure the physics system
            case "setConfigs":
                setConfigs(data.configs);
                break;

            // Create a physics body
            case "createBody":

                var bodyId = data.bodyId;
                var bodyCfg = data.bodyCfg;
                var shape = bodyCfg.shape;
                var body;

                switch (shape) {

                    case "plane":
                        body = new jigLib.JPlane(null, bodyCfg.dir || [0, 1, 0]);
                        break;

                    case "box":
                        body = new jigLib.JBox(null, bodyCfg.width || 1.0, bodyCfg.depth || 1.0, bodyCfg.height || 1.0);
                        break;

                    case "sphere":
                        body = new jigLib.JSphere(null, bodyCfg.radius || 1.0);
                        break;

                    default:
                        // Unsupported body type
                        return;
                }

                bodies[bodyId] = body;

                system.addBody(body);

                if (bodyCfg.movable != undefined) {
                    body.set_movable(!!bodyCfg.movable);
                }

                if (bodyCfg.pos) {
                    body.moveTo(bodyCfg.pos);
                }

                if (bodyCfg.mass != undefined) {
                    body.set_mass(bodyCfg.mass);
                }

                if (bodyCfg.restitution != undefined) {
                    body.set_restitution(bodyCfg.restitution);
                }

                if (bodyCfg.friction != undefined) {
                    body.set_friction(bodyCfg.friction);
                }

                if (bodyCfg.velocity != undefined) {
                    body.setVelocity(bodyCfg.velocity);
                }

                numBodies++;

                break;

            // Remove a physics body
            case "removeBody":
                var body = bodies[data.bodyId];
                if (!body) {
                    return;
                }
                bodies[data.bodyId] = null;
                system.removeBody(body);
                numBodies--;
                break;

            // Integrate the physics system and post back the body updates
            case "integrate":

                var now = (new Date()).getTime();

                if (numBodies > 0) { // Only integrate and post if there are bodies

                    var secs = (now - then) / 1000;
                    var body;
                    var state;
                    var pos;
                    var dir;

                    system.integrate(secs);

                    for (var bodyId = 0, ibuf = 0, ibody = 0; ibody < numBodies; bodyId++) {

                        body = bodies[bodyId];

                        if (!body) { // Deleted
                            continue;
                        }

                        state = body.get_currentState();
                        pos = state.position;
                        dir = state.get_orientation().glmatrix;

                        // Body ID
                        updates[ibuf] = bodyId;

                        // New position
                        updates[ibuf + 1] = pos[0];
                        updates[ibuf + 2] = pos[1];
                        updates[ibuf + 3] = pos[2];

                        // New rotation matrix
                        updates[ibuf + 4] = dir[0];
                        updates[ibuf + 5] = dir[1];
                        updates[ibuf + 6] = dir[2];
                        updates[ibuf + 7] = dir[3];
                        updates[ibuf + 8] = dir[4];
                        updates[ibuf + 9] = dir[5];
                        updates[ibuf + 10] = dir[6];
                        updates[ibuf + 11] = dir[7];
                        updates[ibuf + 12] = dir[8];
                        updates[ibuf + 13] = dir[9];
                        updates[ibuf + 14] = dir[10];
                        updates[ibuf + 15] = dir[11];
                        updates[ibuf + 16] = dir[12];
                        updates[ibuf + 17] = dir[13];
                        updates[ibuf + 18] = dir[14];
                        updates[ibuf + 19] = dir[15];

                        ibuf += 20; // Next buffer portion
                        ibody++; // Next body;
                    }

                    // Post the updates
                    self.postMessage(updates);
                }

                then = now;

                break;

            default:
                // Unknown command
                break;
        }
    }, false);

