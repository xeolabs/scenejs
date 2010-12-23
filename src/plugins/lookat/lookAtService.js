(function() {

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

	function _getLookatInfos(node, params) {
		var ret = {};
	
		var eye = params.eye || node.get('eye');
		eye = [eye.x, eye.y, eye.z];

		var look = params.look || node.get('look');
		look = [look.x, look.y, look.z];
		
		var dir = [];
		SceneJS._math_subVec3(look, eye, dir);
		dir = [
			(params.ignoreX ? 0 : dir[0]),
			(params.ignoreY ? 0 : dir[1]),
			(params.ignoreZ ? 0 : dir[2]),
		];
		ret.dirLen = SceneJS._math_lenVec3(dir);

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

		ret.mat = [
			XX[0], XX[1], XX[2], 0,
			YY[0], YY[1], YY[2], 0,
			ZZ[0], ZZ[1], ZZ[2], 0,
			0,     0,     0,     1
		];
		
		return ret;
	}
	
	function _checkParamsValues(params, node, def) {
		params.x = (params.x != undefined && params.x != null) ? params.x : def.x;
		params.y = (params.y != undefined && params.y != null) ? params.y : def.y;
		params.z = (params.z != undefined && params.z != null) ? params.z : def.z;
		
		params.eye = params.eye || node.get('eye');
		params.look = params.look || node.get('look');
		params.up = params.up || node.get('up');
	}

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
				
				_checkParamsValues(params, node, {x: 0, y: 0, z: 0});

				var infos = _getLookatInfos(node, params);
				
				if (params.ignoreX)
					infos.mat[0] = infos.mat[4] = infos.mat[8] = 0;
				if (params.ignoreY)
					infos.mat[1] = infos.mat[5] = infos.mat[9] = 0;
				if (params.ignoreZ)
					infos.mat[2] = infos.mat[6] = infos.mat[10] = 0;
					
				var addVector = [0, 0, 0];
				if (params.x)
					SceneJS._math_addVec3(addVector, SceneJS._math_mulVec3Scalar(infos.mat.slice(0, 3), params.x));
				if (params.y)
					SceneJS._math_addVec3(addVector, SceneJS._math_mulVec3Scalar(infos.mat.slice(4, 7), params.y));
				if (params.z)
					SceneJS._math_addVec3(addVector, SceneJS._math_mulVec3Scalar(infos.mat.slice(8, 11), params.z));
				
				var newEye = [];
				SceneJS._math_addVec3([params.eye.x, params.eye.y, params.eye.z], addVector, newEye);

				var newLook = [];
				SceneJS._math_addVec3([params.look.x, params.look.y, params.look.z], addVector, newLook);

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
				
				_checkParamsValues(params, node, {x: 0, y: 1, z: 0});

				var saves = {
					x: (params.ignoreX ? params.look.x : 0),
					y: (params.ignoreY ? params.look.y : 0),
					z: (params.ignoreZ ? params.look.z : 0),
				};

				var infos = _getLookatInfos(node, params);
				
				var rot = SceneJS._math_rotationMat4c(
					(params.angle / 180.0) * Math.PI,
					params.x,
					params.y,
					params.z
				);
				
				SceneJS._math_mulMat4(infos.mat, rot, infos.mat);
				
				var curEye = node.get('eye');
				var newLook = {
					x: (params.ignoreX ? saves.x : (infos.mat[8]  * infos.dirLen + curEye.x)),
					y: (params.ignoreY ? saves.y : (infos.mat[9]  * infos.dirLen + curEye.y)),
					z: (params.ignoreZ ? saves.z : (infos.mat[10] * infos.dirLen + curEye.z)),
				};
				var newUp = {x: infos.mat[4], y: infos.mat[5], z: infos.mat[6]};

				node.set({
					look: newLook,
					up: newUp
				});
			}
		});
	})();
})();

