
// This is the reponsibility of the programmer to initialize SoundManager2
soundManager.consoleOnly = true;
soundManager.debugMode = false;
soundManager.flashVersion = 9;
soundManager.url = 'SoundManager2/';

// The tiled floor
SceneJS.createScene({
	type: "material",
	
	id: "tiled-floor",

	baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
	specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
	specular:       0.9,
	shine:          6.0,
	nodes: [
		{
			type: "texture",
			layers: [
				{
					uri: "Stone45l.jpg",
					minFilter: "linearMipMapLinear",
					magFilter: "linear",
					wrapS: "repeat",
					wrapT: "repeat",
					isDepth: false,
					depthMode:"luminance",
					depthCompareMode: "compareRToTexture",
					depthCompareFunc: "lequal",
					flipY: false,
					width: 1,
					height: 1,
					internalFormat:"lequal",
					sourceFormat:"alpha",
					sourceType: "unsignedByte",
					applyTo:"baseColor",
					blendMode: "multiply",
					scale : { x: 300, y: 300, z: 1.0 }
				}
			],
			nodes: [
				{
					type: "rotate",
					x: 1,
					angle: -90,
					nodes: [
						{
							type: "quad",
							xSize: 6400,
							ySize: 4800
						}
					]
				}
			]
		}
	]
});

// The Scene
SceneJS.createScene({
	type: "scene",
	id: "theScene",
	canvasId: "theCanvas",
	nodes: [
		{
			type: "lookAt",
			id: "myLookAt",
			eye : { x: 0, y: 0, z: 25 },
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
							dir: {x:0, y:-1, z:0},
							diffuse: true,
							specular: false
						},
						{
							type: "light",
							mode: "dir",
							color: { r: 1, g: 1, b: 1 },
							dir: {x:0, y:-1, z:-1},
							diffuse: true,
							specular: false
						},
						{
							type: "translate",
							y: -3,
							nodes: [
								{
									type: "instance",
									target: "tiled-floor"
								}
							]
						},
						{
							type: "material",
							baseColor: { r: 1.0, g: 1.0, b: 1.0 },
							nodes: [
								{
									type: "scale",
									y: 3,
									nodes: [
										{
											type: "sphere"
										}
									]
								},
								{
									type: "sound",
									id: "mySound",
									distAtt: 142,
									soundParams: { id: 'dl', url: 'Deshmy_laggio.mp3', autoPlay: true }
								}
							]
						}
					]
				}
			]
		}
	]
});

var canvas = document.getElementById("theCanvas");

var origin = null;
var speed = null;
canvas.addEventListener('mousedown', function(e) {
	origin = {x: e.clientX, y: e.clientY};
}, false);

canvas.addEventListener('mouseup', function(e) {
	origin = null;
	speed = null;
}, false);

canvas.addEventListener('mousemove', function(e) {
	if (origin)
		speed = {x: e.clientX - origin.x, y: e.clientY - origin.y};
}, false);

canvas.addEventListener('mousewheel', function(e) {
    var delta = 0;
    if (!event) event = window.event;
    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
    } else if (event.detail) {
        delta = -event.detail / 3;
    }
    if (delta) {
        if (delta < 0) {
            speed.y -= 0.2;
        } else {
            speed.y += 0.2;
        }
    }
    if (event.preventDefault)
        event.preventDefault();
    event.returnValue = false;
}, true);

SceneJS.withNode("theScene").start({
	fps: 60,
	idleFunc: function(e) {
		if (SceneJS.withNode("mySound").get("sound"))
			document.getElementById('infos').innerHTML =
					'Sound Volume: ' + (Math.round(SceneJS.withNode("mySound").get("volume") * 100) / 100) + '<br />'
				+	'Real Volume: ' + (Math.round(SceneJS.withNode("mySound").get("sound").volume * 100) / 100) + '<br />'
				+	'Pan: ' + (Math.round(SceneJS.withNode("mySound").get("sound").pan * 100) / 100) + '<br />'
			;

		if (speed && speed.y)
			SceneJS.Message.sendMessage({
				command: "lookAt.move",
				target: "myLookAt",
				z: -speed.y / 100,
				ignoreY: true
			});

		if (speed && speed.x)
			SceneJS.Message.sendMessage({
				command: "lookAt.rotate",
				target: "myLookAt",
				angle: -speed.x / 420,
				ignoreY: true
			});
	}
});
