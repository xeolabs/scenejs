
// This is the reponsibility of the programmer to initialize SoundManager2
soundManager.consoleOnly = true;
soundManager.debugMode = false;
soundManager.flashVersion = 9;
soundManager.url = 'SoundManager2/';

SceneJS.createScene({
	type: "scene",
	id: "theScene",
	canvasId: "theCanvas",
	nodes: [
		{
			type: "lookAt",
			id: "myLookAt",
			eye : { x: 0, y: 120, z: 30 },
			look : { x: 0, y: 0, z: 0 },
			up : { y: 1.0 },

			nodes: [
				{
					type: "camera",
					optics: {
						type: "perspective",
						fovy : 25.0,
						aspect : 1.47,
						near : 0.10,
						far : 300.0
					},
					nodes: [
						{
							type: "light",
							mode: "dir",
							color: { r: 1, g: 1, b: 1 },
							dir: {x:0, y:-1, z:-1},
							diffuse: true,
							specular: false
						},
						{
							type: "material",
							baseColor: { r: 1.0, g: 1.0, b: 1.0 },
							nodes: [
								{
									type: "box",
									ySize: 2
								},
								{
									type: "rotate",
									id: "yaw",
									y: 1,
									nodes: [
										{
											type: "translate",
											id: "distance",
											x: 0, y: 0, z: 10,
											nodes: [
												{
													type: "sphere"
												},
												{
													type: "sound",
													id: "mySound",
													position: {x: 0, y:0, z: 0},
													soundParams: { id: 'dl', url: 'Deshmy_laggio.mp3', autoPlay: true }
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
});

SceneJS.withNode("theScene").start({
	fps: 60,
	idleFunc: function(e) {
		var addAngle = 20 / 60;
		SceneJS.withNode("yaw").set({angle: SceneJS.withNode("yaw").get("angle") + addAngle});
		if (SceneJS.withNode("mySound").get("sound"))
			document.getElementById('infos').innerHTML =
					'Sound Volume: ' + (Math.round(SceneJS.withNode("mySound").get("volume") * 100) / 100) + '<br />'
				+	'Real Volume: ' + (Math.round(SceneJS.withNode("mySound").get("sound").volume * 100) / 100) + '<br />'
				+	'Pan: ' + (Math.round(SceneJS.withNode("mySound").get("sound").pan * 100) / 100) + '<br />'
			;
	}
});

document.addEventListener('keypress', function(e) {
	switch (e.charCode)
	{
	case 43: // +
		SceneJS.withNode("distance").set("z", SceneJS.withNode("distance").get("z") + 0.5);
		break;
	case 45: // -
		SceneJS.withNode("distance").set("z", SceneJS.withNode("distance").get("z") - 0.5);
		break;
	}
}, false);

