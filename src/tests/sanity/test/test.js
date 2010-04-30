SceneJS.onEvent("error", function(e) {
    alert(e.exception.message ? e.exception.message : e.exception);
});


var args = [ SceneJS.node(), SceneJS.node() ];

var node = SceneJS.node.apply(this, args);




