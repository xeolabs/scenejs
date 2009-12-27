/**
 * Scene node that constructs a 'lookat' view transformation matrix and sets it on the current shader.
 */
SceneJs.lookAt = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var backend = SceneJs.backends.getBackend('viewtransform');

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var mat;

    return function(scope) {

        if (!mat || !cfg.fixed) { // Memoize matrix if node config is constant
            var params = cfg.getParams(scope);

            params.eye = params.eye ? cloneVec(params.eye) : { x: 0.0, y: 0.0, z: 0.0 };
            params.look = params.look ? cloneVec(params.look) : { x: 0.0, y: 0.0, z: 0.0 };
            params.up = params.up ? cloneVec(params.up) : { x: 0.0, y: 1.0, z: 0.0 };

            if (params.eye.x == params.look.x && params.eye.y == params.look.y && params.eye.z == params.look.z) {
                throw new SceneJs.exceptions.InvalidLookAtParametersException("Invald lookAt parameters: eye and look cannot be identical");
            }
            if (params.up.x == 0 && params.up.y == 0 && params.up.z == 0) {
                throw new SceneJs.exceptions.InvalidLookAtParametersException("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
            }
            mat = SceneJs.utils.Matrix4.createLookAt(params.eye, params.look, params.up);
        }

        var xform = backend.getViewTransform();

        backend.setViewTransform({ matrix: mat, fixed: cfg.fixed });
        SceneJs.utils.visitChildren(cfg, scope);
        backend.setViewTransform(xform);
    };
};