/**
 Reflection map of a London street scene

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 someNode.addNode({
       type: "reflect/london",
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
SceneJS.Types.addType("reflect/london", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/london/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "pos-x.png",
                path + "neg-x.png",
                path + "pos-y.png",
                path + "neg-y.png",
                path + "pos-z.png",
                path + "neg-z.png"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
