/**
 * Scene node that defines an element of geometry.
 *
 * @class SceneJS.geometry
 * @extends SceneJS.node
 */
SceneJS.geometry = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return SceneJS._utils.createNode(
            "geometry",
            cfg.children,

            new (function() {

                var params;
                var type;
                var create;
                var geo = {};

                this._render = function(traversalContext, data) {

                    /* Dynamic config only happens first time
                     */
                    if (!params) {
                        params = cfg.getParams(data);
                        if (params.create instanceof Function) {

                            /* Create must not be a dynamic config function!
                             */
                            create = params.create;
                        } else {
                            geo = {
                                positions : SceneJS._utils.getParam(params.positions, data) || [],
                                normals : SceneJS._utils.getParam(params.normals, data) || [],
                                colors : SceneJS._utils.getParam(params.colors, data) || [],
                                indices : SceneJS._utils.getParam(params.indices, data) || [],
                                uv : SceneJS._utils.getParam(params.uv, data) || [],
                                primitive : SceneJS._utils.getParam(params.primitive, data) || "triangles"
                            };
                        }
                    }

                    /* Check geometry not evicted
                     */
                    if (type) {
                        if (!SceneJS_geometryModule.testGeometryExists(type)) {
                            type = null;
                        }
                    }

                    /* type is null if geometry evicted or not yet defined
                     */
                    if (!type) {
                        if (create) {

                            /* Type generated if null
                             */
                            type = SceneJS_geometryModule.createGeometry(params.type, create()); // Lazy-create geometry through callback
                        } else {
                            type = SceneJS_geometryModule.createGeometry(params.type, geo);
                        }
                    }
                    SceneJS_geometryModule.drawGeometry(type);
                    this._renderChildren(traversalContext, data);
                };
            })());
};
