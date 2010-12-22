/**
 * SceneJS Example - Switchable Geometry using the Selector Node.
 *
 * A Selector node is a branch node that selects which among its children are currently active.
 *
 * In this example, a Selector contains four Teapot nodes, of which it initially selects the first,
 * second and fourth. By editing its "selection" property, you can change which of the Teapots
 * are rendered.
 *
 * Lindsay Kay
 * lindsay.kay@xeolabs.com
 * January 2010
 */
SceneJS.createNode({
    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [
        {
            type: "lookAt",
            eye : { x: -30.0, y: 0.0, z: 35.0},
            look : { x : 15.0, y : 0.0, z : 0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [
                {
                    type: "camera",
                    optics: {
                        type: "perspective",
                        fovy : 65.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 1.0, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: 1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.8, g: 0.8, b: 0.8 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -2.0, y: -1.0, z: 0.0 }
                        },
                        {
                            type: "material",
                            baseColor:      { r: 0.6, g: 0.9, b: 0.6 },
                            specularColor:  { r: 0.6, g: 0.9, b: 0.6 },
                            specular:       0.9,
                            shine:          6.0,

							nodes: [
								{
									type:"translate",
									y : 15,
									nodes: [
										{
											type: "text",
											size: 80,
											text: "     Text 1"
										}
									]
								},
								{
									type: "translate",
									y : 5,
									nodes: [
										{
											type: "text",
											size: 80,
											text: "     Red Text",
											color: [1,0,0,1]
										}
									]
								},
								{
									type: "translate",
									y : -5,
									nodes: [
										{
											type: "text",
											size: 80,
											text: "     Blue Text",
											color: [0,0,1,1]
										}
									]
								},
								{
									type: "translate",
									y : -15,
									nodes: [
										{
											type: "text",
											id: "textToUpdate",
											size: 80,
											text: "     Old Text"
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

SceneJS.withNode("theScene").render();

function updateText() {
		var newText = document.getElementById("textinput_id").value;
		SceneJS.withNode("textToUpdate").set("text",
			{
				text: newText
			});
		
		SceneJS.withNode("theScene").render();
	}
