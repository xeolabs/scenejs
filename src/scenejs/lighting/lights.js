/**
 * Defines a set of lights in a scene. These may appear at multiple points, anywhere in a scene graph, to define
 * multiple sources of light. The number of lights is only limited by memory available to the GPU.
 *
 * TODO: comment
 */
SceneJS.lights = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('lights');
    return SceneJS._utils.createNode(
            function(scope) {
                var lights = cfg.getParams(scope).lights;
                backend.pushLights(lights);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.popLights(lights.length);
            });
};

