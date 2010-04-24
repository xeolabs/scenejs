/**
 * @class SceneJS.material
 * @extends SceneJS.node
 * <p>A scene node that defines how light is reflected by the geometry within its subgraph. These may be defined anywhere within
 * a scene graph and may be nested. When nested, the properties on an inner material node will override
 * those on outer material nodes for the inner node's subgraph. These nodes are to be defined either above or below
 * {@link SceneJS.lights} nodes, which provide light for geometry to reflect.</p>
 * node,
 * <p><b>Example 1:</b></p><p>A cube illuminated by a directional light source and wrapped
 * with material properties that define how it reflects the light.</b></p><pre><code>
 * SceneJS.lights({
 *          sources: [
 *              {
 *                  type: "dir",
 *                  color: { r: 1.0, g: 1.0, b: 0.0 },
 *                  diffuse: true,
 *                  specular: true,
 *                  dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction of light from coordinate space origin
 *              }
 *          ]
 *      },
 *
 *      SceneJS.material({
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          SceneJS.objects.cube()
 *     )
 * )
 * </pre></code>
 *
 * <p><b>Example 2 (object composition style):</b></p><pre><code>
 *
 * var m = SceneJS.material();
 * m.setBaseColor({ r: 0.9, g: 0.2, b: 0.2 });
 * m.setSpecularColor({ r: 0.9, g: 0.9, b: 0.2 });
 * m.setEmit(0.0);
 * m.setSpecular(0.9);
 * m.setShine(6.0);
 * </pre></code>
 *
 * @constructor
 * Create a new SceneJS.material
 * @param {Object} The config object or function, followed by zero or more child nodes
 *
 */
SceneJS.material = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {

        var _material = {
            baseColor : [ 0.0, 0.0, 0.0 ],
            specularColor: [ 0.0,  0.0,  0.0 ],
            specular : 0,
            shine : 0,
            reflect : 0,
            alpha : 1.0,
            emit : 0.0,
            blendMode : "multiply"
        };

        $.setBaseColor = function(color) {
            _material.baseColor = [
                color.r != undefined ? color.r : 0.0,
                color.g != undefined ? color.g : 0.0,
                color.b != undefined ? color.b : 0.0
            ];
            return $;
        };

        $.getBaseColor = function() {
            return {
                r: _material.baseColor,
                g: _material.baseColor,
                b: _material.baseColor
            };
        };

        $.setSpecularColor = function(color) {
            _material.specularColor = [
                color.r != undefined ? color.r : 0.5,
                color.g != undefined ? color.g : 0.5,
                color.b != undefined ? color.b : 0.5
            ];
            return $;
        };

        $.getSpecularColor = function() {
            return {
                r: _material.specularColor[0],
                g: _material.specularColor[1],
                b: _material.specularColor[2]
            };
        };

        $.setSpecular = function(specular) {
            _material.specular = specular || 0;
            return $;
        };

        $.getSpecular = function() {
            return _material.specular;
        };

        $.setShine = function(shine) {
            _material.shine = shine || 0;
            return $;
        };

        $.getShine = function() {
            return _material.shine;
        };

        $.setReflect = function(reflect) {
            _material.reflect = reflect || 0;
            return $;
        };

        $.getReflect = function() {
            return _material.reflect;
        };

        $.setEmit = function(emit) {
            _material.emit = emit || 0;
            return $;
        };

        $.getEmit = function() {
            return _material.emit;
        };

        $.setAlpha = function(alpha) {
            _material.alpha = alpha == undefined ? 1.0 : alpha;
            return $;
        };

        $.getAlpha = function() {
            return _material.alpha;
        };

        $.setBlendMode = function(mode) {
            if (mode != "add" && mode != "multiply") {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException(
                        "SceneJS.material blendMode of unsupported type: '" + mode + "' - should be 'add' or 'multiply'"));
            }
            _material.blendMode = mode;
            return $;
        };

        $.getBlendMode = function() {
            return _material.blendMode;
        };

        function init(params) {
            if (params.baseColor) {
                $.setBaseColor(params.baseColor);
            }
            if (params.specularColor) {
                $.setSpecularColor(params.specularColor);
            }
            if (params.specular) {
                $.setSpecular(params.specular);
            }
            if (params.shine) {
                $.setShine(params.shine);
            }
            if (params.reflect) {
                $.setReflect(params.reflect);
            }
            if (params.emit) {
                $.setEmit(params.emit);
            }
            if (params.alpha) {
                $.setAlpha(params.alpha);
            }
            if (params.blendMode) {
                $.setAlpha(params.blendMode);
            }
        }
        
        if (cfg.fixed) {
            init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                $._renderChildren(traversalContext, data);
            } else {
                if (!cfg.fixed) {
                    init(cfg.getParams(data));
                }
                var saveMaterial = SceneJS_materialModule.getMaterial();
                SceneJS_materialModule.setMaterial(_material);
                $._renderChildren(traversalContext, data);
                SceneJS_materialModule.setMaterial(saveMaterial);
            }
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
