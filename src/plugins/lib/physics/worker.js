importScripts("jiglib.all.min.js");

var bodies = [];
var numBodies = 0;

// Buffer in which this worker posts back
// an updated position and direction for each body
var updates = [];

var system = jigLib.PhysicsSystem.getInstance();

// Initial physics system configuration
configure();

/** Configures JigLibJS
 */
function configure(params) {
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
            case "configure":
                configure(data);
                break;

            // Create a physics body
            case "createBody":

                var bodyId = data.bodyId;
                var bodyCfg = data.bodyCfg;
                var shape = body.shape;
                var body;

                switch (shape) {

                    case "plane":
                        body = new jigLib.JPlane(null, bodyCfg.dir || [0,1,0]);
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
                    var pos;
                    var dir;

                    system.integrate(secs);

                    for (var bodyId = 0, ibuf = 0, ibody = 0; ibody < numBodies; bodyId++) {

                        body = bodies[bodyId];

                        if (!body) { // Deleted
                            continue;
                        }

                        pos = body.get_currentState().position;
                        dir = body.get_currentState().get_orientation().glmatrix;

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

                        ibuf += 20;

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

