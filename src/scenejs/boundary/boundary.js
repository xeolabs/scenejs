SceneJs.boundary = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('boundary');
    var created = false;


    return function(scope) {
        if (!created) {
            var params = cfg.getParams(scope);
            if (!cfg.fixed) {
            }
            if (params.xmin || params.ymin || params.zmin || params.xmax || params.ymax || params.zmax) {

            }
        }
    };
}


