var NodeParams = function(nodeName, data) {

    this.getParam = function(name, object, fallback) {
        var _this = this;
        alert("param " + name);
        var param = object[name];
        if (param instanceof Function) {
            alert("param is function, calling..");
            var property = param(data);
            if (property instanceof Function) {   // Dynamic config functions cannot be nested
                alert("..result is function, returning.");
                return property;
            }
            if (property) {
                alert("param is defined, traversing..");
                var result;
                for (var key in property) {
                    alert("..found sub-property: \"" + key + "\"");
                    if (!result) {
                        result = {};
                    }
                    result[key] = _this.getParam(key, property, fallback ? fallback[key] : null);
                }
                if (result)
                    alert("returning " + result);
                else
                    alert("returning " + property);
                return result ? result : property;
            }
            if (fallback) {
                return fallback;
            }
            throw SceneJS.NodeConfigExpectedException(
                    nodeName + " property expected: \"" + name + "\"");
        } else if (!param) {
            alert("returning fallback");
            return fallback;
        } else {


            var result;
            if (!(param instanceof String)) {
                for (var key in param) {
                    alert("..found sub-property: \"" + key + "\"");
                    if (!result) {
                        result = {};
                    }
                    result[key] = _this.getParam(key, param, fallback ? fallback[key] : null);
                }
            }
            if (result)
                alert("returning " + result);
            else
                alert("returning " + param);
            return result ? result : param;
        }
    };

};