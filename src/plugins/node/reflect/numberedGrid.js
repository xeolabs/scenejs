/**
 Reflection map of a grid-patterned box

 @author xeolabs / http://xeolabs.com

 <p>Usage example:</p>

 <pre>
 someNode.addNode({
       type: "reflect/numberedGrid",
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
SceneJS.Types.addType("reflect/numberedGrid", {

    construct: function (params) {

        var src = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/numberedGrid.jpg";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [ src, src, src, src, src, src ],

            nodes: params.nodes
        })
    }
});
