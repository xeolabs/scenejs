var config = {
     preVisit: function() {
          // Do something
     }
};
var myNode1 = new SceneJs.node(config);

config.preVisit = function() {  // Don't do this!!
     // Do something different
}
var myNode2 = new SceneJs.node(config);
