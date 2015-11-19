/**
 * Web worker containing a Cannon physics system. A part of SceneJS.
 *
 * @author oyvinht / http://www.pvv.ntnu.no/~oyvinht
 *
 * For implementation details see worker.js
 *
 */

importScripts("cannon.min.js");

var system = new CANNON.World(), // Cannon physics system
    sph, // Smoothed Particle Hydrodynamics
    then = (new Date()).getTime(),
    setConfigs = function (params) {
	p = params || {};
	system.broadphase = new CANNON.NaiveBroadphase();
	if (p.gravity && p.gravity.length > 2) {
	    system.gravity.set.call(p.gravity);
	} else {
	    system.gravity.set(0, -9.8, 0);
	}
	system.allowSleep = true;
	system.quatNormalizeFast = false;
	system.solver.iterations = 10;
	system.quatNormalizeSkip = 0.1;
    },
    ensureSph = function () {
	if (!system.subsystems.find(function (subsystem) {
	    return subsystem instanceof CANNON.SPHSystem;
	})) {
	    sph = new CANNON.SPHSystem();
	    sph.smoothingRadius = p.sphSmoothingRadius || 1.0;
	    sph.density = p.sphDensity || 0.3;
	    sph.viscosity = p.sphViscosity || 0.03;
	    system.subsystems.push(sph);
	}
    };

setConfigs({
    sphDensity: 1,
    sphSmoothingRadius: 0.1,
    sphViscosity: 1
});

addEventListener(
    "message",
    function (e) {
	"use strict";
	var data = e.data, bodyId, bodyCfg, body;
	switch (data.cmd) {
	case "setConfigs":
	    setConfigs(data.configs);
	    break;
        case "createBody":
	    bodyCfg = data.bodyCfg;
            body = new CANNON.Body({
		mass: bodyCfg.movable === false ? 0 : bodyCfg.mass,
		material: { friction: bodyCfg.friction,
			    restitution: bodyCfg.restitution},
		position: (bodyCfg.pos && bodyCfg.pos.length === 3) ? {
		    x: bodyCfg.pos[0],
		    y: bodyCfg.pos[1],
		    z: bodyCfg.pos[2] } : {
			x: 0, y: 0, z: 0 },
		velocity: (bodyCfg.velocity && bodyCfg.velocity.length == 3) ? {
		    x: bodyCfg.velocity[0],
		    y: bodyCfg.velocity[1],
		    z: bodyCfg.velocity[2] } : {
			x: 0, y: 0, z: 0 }
	    });
//	    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 4);
	    switch (bodyCfg.shape) {
            case "plane":
		body.addShape(new CANNON.Plane());
		// Cannon and SceneJS have different y/z-axes
		body.quaternion.setFromAxisAngle(
		    new CANNON.Vec3(1, 0, 0), Math.PI/-2);
                break;
            case "box":
		body.addShape(new CANNON.Box(new CANNON.Vec3(
		    bodyCfg.width / 2 || 0.5,
		    bodyCfg.height / 2 || 0.5,
		    bodyCfg.depth / 2 || 0.5)));
                break;
	    case "particle":
		body.addShape(new CANNON.Particle());
		if (bodyCfg.sphEnabled) {
		    ensureSph();
		    sph.add(body);
		}
		break;
            case "sphere":
                body.addShape(new CANNON.Sphere(bodyCfg.radius || 1.0));
                break;
            default:
		throw ("Unsupported body type");
            }
            system.addBody(body);
            break;
        case "updateBody":
	    bodyCfg = data.bodyCfg;
	    bodyId = data.bodyId;
            body = system.bodies.find(function (b) {
		return b.id === bodyId;
	    });
            if (!body) {
                return;
            }
            if (bodyCfg.pos) {
		body.position.set(bodyCfg.pos);
            }
            if (bodyCfg.mass !== undefined) {
                body.mass = bodyCfg.mass;
		body.updateMassProperties();
            }
            if (bodyCfg.restitution !== undefined) {
                body.material.restitution = bodyCfg.restitution;
            }
	    if (bodyCfg.friction !== undefined) {
                body.material.friction = bodyCfg.friction;
            }
            if (bodyCfg.velocity !== undefined) {
                body.velocity = bodyCfg.velocity;
            }
            break;
        case "removeBody":
            body = system.bodies.find(function (b) {
		return b.id === data.bodyId;
	    });
            if (!body) {
                return;
            }
	    system.removeBody(body);
            break;
	case "integrate":
	    var output = new Float32Array(data.buffer),
	    now = (new Date()).getTime(),
            secs = (now - then) / 1000,
            ibuf = 0, idx, c, r;
	    system.step(secs);
	    for (idx = 0; idx < system.bodies.length; idx += 1) {
		body = system.bodies[idx];
		output[ibuf++] = body.id;
                output[ibuf++] = body.position.x;
                output[ibuf++] = body.position.y;
                output[ibuf++] = body.position.z;
		if (body.shapes.length === 1 &&
		    (//body.shapes[0] instanceof CANNON.Particle ||
		     body.shapes[0] instanceof CANNON.Sphere)){
		    ibuf += 16;
		} else {
		    // Make GL-matrix from quaternion
		    var mtx = new CANNON.Mat3();
		    mtx.setRotationFromQuaternion(body.quaternion);
		    output[ibuf++] = mtx.elements[0];
		    output[ibuf++] = mtx.elements[1];
		    output[ibuf++] = mtx.elements[2];
		    output[ibuf++] = 0;
		    output[ibuf++] = mtx.elements[3];
		    output[ibuf++] = mtx.elements[4];
		    output[ibuf++] = mtx.elements[5];
		    output[ibuf++] = 0;
		    output[ibuf++] = mtx.elements[6];
		    output[ibuf++] = mtx.elements[7];
		    output[ibuf++] = mtx.elements[8];
		    output[ibuf++] = 0;
		    output[ibuf++] = 0;
		    output[ibuf++] = 0;
		    output[ibuf++] = 0;
		    output[ibuf++] = 1;
		}
	    }
            // Post the output
	    var response = {
                buffer: output.buffer,
                lenOutput: ibuf - 20
            };
	    self.postMessage(response, [response.buffer]);
	    then = now;
            break;
	default:
	    console.log("Shouldn't get here");
            break;
        }
    }, false);


