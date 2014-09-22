/**
 Reflection map of a holodeck

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 someNode.addNode({
       type: "reflect/holodeck",
       intensity: 0.2,

       nodes: [

            // Box, implemented by plugin at
            // http://scenejs.org/api/latest/plugins/node/geometry/box.js
            {
                type: "geometry/box",
                width: 600
            }
        ]
   });
 </pre>
 */
SceneJS.Types.addType("reflect/holodeck", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/holodeck/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "east.jpg",
                path + "west.jpg",
                path + "top.jpg",
                path + "bottom.jpg",
                path + "north.jpg",
                path + "south.jpg"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
