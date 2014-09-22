/**
  Reflection map of blue sky and white clouds

  @author xeolabs / http://xeolabs.com

  <p>Usage example:</p>

  <pre>
  someNode.addNode({
        type: "reflect/clouds",
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
SceneJS.Types.addType("reflect/clouds", {

    construct: function (params) {

        var path = SceneJS.getConfigs("pluginPath") + "/node/reflect/textures/clouds/";

        this.addNode({
            type: "reflect",
            intensity: params.intensity,
            src: [
                path + "a.png",
                path + "b.png",
                path + "top.png",
                path + "bottom.png",
                path + "c.png",
                path + "d.png"
            ],

            // Attach given child nodes
            nodes: params.nodes
        })
    }
});
