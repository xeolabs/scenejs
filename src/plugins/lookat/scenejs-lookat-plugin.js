(function() {

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

	(function() {
		if (commandService.hasCommand("lookAt.move")) {
			return;
		}

		commandService.addCommand("lookAt.move", {
			execute: function(params) {
				if (!params.target) {
					throw "Attribute 'target' expected on command 'lookAt.move'";
				}
				var node = SceneJS.withNode(params.target);

				var eye = params.eye || node.get('eye');
				eye = [eye.x, eye.y, eye.z];
				var look = params.look || node.get('look');
				look = [look.x, look.y, look.z];

				var dir = [];
				SceneJS._math_subVec3(look, eye, dir);
				if (params.ignoreX)
					dir[0] = 0;
				if (params.ignoreY)
					dir[1] = 0;
				if (params.ignoreZ)
					dir[2] = 0;
				SceneJS._math_normalizeVec3(dir);
				
				var distance = params.distance || 1;
				SceneJS._math_mulVec3Scalar(dir, distance);

				var newEye = [];
				SceneJS._math_addVec3(eye, dir, newEye);

				var newLook = [];
				SceneJS._math_addVec3(look, dir, newLook);
				
				node.set({
					eye: {x: newEye[0], y: newEye[1], z: newEye[2]},
					look: {x: newLook[0], y: newLook[1], z: newLook[2]}
				});
			}
		});
	})();

	(function() {
		if (commandService.hasCommand("lookAt.rotate")) {
			return;
		}

		commandService.addCommand("lookAt.rotate", {
			execute: function(params) {
				if (!params.target) {
					throw "Attribute 'target' expected on command 'lookAt.rotate'";
				}
				var node = SceneJS.withNode(params.target);

				if (!params.angle) {
					throw "Attribute 'angle' expected on command 'lookAt.rotate'";
				}
				
				var eye = params.eye || node.get('eye');
				eye = [eye.x, eye.y, eye.z];

				var look = params.look || node.get('look');
				look = [look.x, look.y, look.z];
				
				var saves = [
					(params.ignoreX ? look[0] : 0),
					(params.ignoreY ? look[1] : 0),
					(params.ignoreZ ? look[2] : 0),
				];
					
				var dir = [];
				SceneJS._math_subVec3(look, eye, dir);
				dir = [
					(params.ignoreX ? 0 : dir[0]),
					(params.ignoreY ? 0 : dir[1]),
					(params.ignoreZ ? 0 : dir[2]),
				];
				var dirLen = SceneJS._math_lenVec3(dir);

				var up = params.up || node.get('up');
				up = [up.x, up.y, up.z];
				SceneJS._math_subVec3(up, dir, up);
				
				var ZZ = dir;
				SceneJS._math_normalizeVec3(ZZ);

				var XX = [];
				SceneJS._math_cross3Vec3(up, ZZ, XX);
				SceneJS._math_normalizeVec3(XX);

				var YY = [];
				SceneJS._math_cross3Vec3(ZZ, XX, YY);
				SceneJS._math_normalizeVec3(YY);

				var mat = [
					XX[0], XX[1], XX[2], 0,
					YY[0], YY[1], YY[2], 0,
					ZZ[0], ZZ[1], ZZ[2], 0,
					0,     0,     0,     1
				];
				
				var rot = SceneJS._math_rotationMat4c(
					(params.angle / 180.0) * Math.PI,
					(params.x != undefined && params.x != null) ? params.x : 0,
					(params.y != undefined && params.y != null) ? params.y : 1,
					(params.z != undefined && params.z != null) ? params.z : 0
				);
				SceneJS._math_mulMat4(mat, rot, mat);
				
				var curEye = node.get('eye');
				var newLook = {
					x: (params.ignoreX ? saves[0] : (mat[8]  * dirLen + curEye.x)),
					y: (params.ignoreY ? saves[1] : (mat[9]  * dirLen + curEye.y)),
					z: (params.ignoreZ ? saves[2] : (mat[10] * dirLen + curEye.z)),
				};
				var newUp = {x: mat[4], y: mat[5], z: mat[6]};

				node.set({
					look: newLook,
					up: newUp
				});
			}
		});
	})();
})();

