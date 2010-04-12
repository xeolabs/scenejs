var data = {

};
var params = {
    a: "alpha",
    b: "beta",
    c: "capa",
    d: { da: "da", db: "db"}

};

var defaults = {
    a: "alpha",
    b: "beta",
    c: "capa",
    d: { da: "da", db: "db"},
    e: { ea: function(data) {
        return "ea"
    }, eb: "db"}

};


var p = new NodeParams("TestNode", data);
var q = p.getParam("x", params, defaults);


alert(p.getParam("a", params, defaults));

alert(p.getParam("b", params, defaults));

alert(p.getParam("c", params, defaults));

p.getParam("d", params, defaults);