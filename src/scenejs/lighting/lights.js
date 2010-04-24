/**
 * @class SceneJS.lights
 * @extends SceneJS.node
 * <p>A scene node that defines a set of light sources. This node may appear at multiple locations in a scene graph, to
 * define multiple sources of light, the number of which is only limited by video memory.</p>
 * <p>Currently, two kinds of light are supported: point and directional. Point lights have a location, like a lightbulb,
 * while directional only have a vector that describes their direction, where they have no actual location since they
 * are an infinite distance away.</p>
 * <p>Therefore, each of these two light types have slightly different properties, as shown in the exaples below.</p>
 * <p><b>Example:</b></p><p>A cube illuminated by two light sources, point and directional.
 * The cube has material properties that define how it reflects the light.</b></p><pre><code>
 * SceneJS.lights({
 *          sources: [
 *              {
 *                  type: "point",
 *                  pos: { x: 100.0, y: 30.0, z: -100.0 }, // Position
 *                  color: { r: 0.0, g: 1.0, b: 1.0 },
 *                  diffuse: true,   // Contribute to diffuse lighting
 *                  specular: true,  // Contribute to specular lighting
 *
 *                  // Since this light source has a position, it therefore has
 *                  // a distance over which its intensity can attenuate.
 *                  // Consult any OpenGL book for how to use these factors.
 *
 *                  constantAttenuation: 1.0,
 *                  quadraticAttenuation: 0.0,
 *                  linearAttenuation: 0.0
 *              },
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
 * @constructor
 * Create a new SceneJS.lights
 * @param {Object} The config object or function, followed by zero or more child nodes
 *
 */
SceneJS.lights = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    return SceneJS._utils.createNode(
            "lights",
            cfg.children,

            new (function() {

                this._render = function(traversalContext, data) {
                    if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                        this._renderChildren(traversalContext, data);
                    } else {
                        var sources = cfg.getParams(data).sources;
                        SceneJS_lightingModule.pushLights(sources);
                        this._renderChildren(traversalContext, data);
                        SceneJS_lightingModule.popLights(sources.length);
                    }
                };
            })());
};

