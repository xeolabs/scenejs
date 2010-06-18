/**
 * @class A scene node that defines a set of light sources for its subgraph.
 * <p>Multiple instances of this  node may appear at
 * any location in a scene graph, to define multiple sources of light, the number of which is only limited
 * by video memory.</p>
 * <p>note that SceneJS does not create any default light sources for you, so if you have non-emissive
 * {@link SceneJS.Material}s with no lights you may not see anything in your scene until you add a light.</p>
 * <p>Currently, two kinds of light are supported: point and directional. Point lights have a location, like a lightbulb,
 * while directional only have a vector that describes their direction, where they have no actual location since they
 * are an infinite distance away.</p>
 * <p>Therefore, each of these two light types have slightly different properties, as shown in the usage example below.</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-dir-lighting-example">Directional Lighting</a></li>
 * <li><a target = "other" href="http://bit.ly/scenejs-point-lighting-exam">Point Lighting</a></li>
 * </ul>
 * <p><b>Example Usage</b></p><p>This example defines a cube that is illuminated by two light sources, point and directional.
 * The cube has a {@link SceneJS.Material} that define how it reflects the light.</b></p><pre><code>
 *  var l = new SceneJS.Lights({
 *      sources: [
 *          {
 *              type: "point",
 *              pos: { x: 100.0, y: 30.0, z: -100.0 }, // Position
 *              color: { r: 0.0, g: 1.0, b: 1.0 },
 *              diffuse: true,   // Contribute to diffuse lighting
 *              specular: true,  // Contribute to specular lighting
 *
 *              // Since this light source has a position, it therefore has
 *              // a distance over which its intensity can attenuate.
 *              // Consult any OpenGL book for how to use these factors.
 *
 *              constantAttenuation: 1.0,
 *              quadraticAttenuation: 0.0,
 *              linearAttenuation: 0.0
 *          },
 *          {
 *              type: "dir",
 *              color: { r: 1.0, g: 1.0, b: 0.0 },
 *              diffuse: true,
 *              specular: true,
 *              dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction - default is { x: 0, y: 0, z: -1 }
 *          }
 *      ]
 *  },
 *
 *      new SceneJS.material({
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          new SceneJS.objects.cube()))
 *</pre></code>
 *
 *<p><b>Example 2:</b></p><p>Creates same content as Example 1.</b></p><pre><code>
 *  var lights = new SceneJS.Lights();
 *
 *  var pointSource = new SceneJS.LightSource({
 *      type: "point",
 *      pos: { x: 100.0, y: 30.0, z: -100.0 },
 *      color: { r: 0.0, g: 1.0, b: 1.0 },
 *      diffuse: true,
 *      specular: true,
 *      constantAttenuation: 1.0,
 *      quadraticAttenuation: 0.0,
 *      linearAttenuation: 0.0
 *  });
 *
 *  var dirSource = new SceneJS.LightSource({
 *      type: "dir",
 *      color: { r: 1.0, g: 1.0, b: 0.0 },
 *      diffuse: true,
 *      specular: true,
 *      dir: { x: 1.0, y: 2.0, z: 0.0 }
 *  });
 *
 *  lights.addSource(pointSource);
 *
 *  lights.addSource(dirSource);
 *
 *  var material = new SceneJS.Material({
 *          baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *          specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *          emit:           0.0,
 *          specular:       0.9,
 *          shine:          6.0
 *      });
 *
 *  lights.addChild(material);
 *
 *  material.addChild(new SceneJS.objects.Cube())
 *
 *  // Move the light back a bit just to show off a setter method
 *
 *  pointSource.setPos({ z: -150.0 });
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Lights
 * @param {Object} [cfg] Static configuration object (see class overview comments)
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 */
SceneJS.Lights = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "lights";
    this._sources = [];
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Lights, SceneJS.Node);

/**
 Adds a light source.
 @param {SceneJS.LightSource} source
 @returns {SceneJS.Lights} this
 */
SceneJS.Lights.prototype.addSource = function(source) {
    this._sources.push(source);
    return this;
};

/**
 Get sources
 @return {Array} Array of  SceneJS.LightSource objects
 */
SceneJS.Lights.prototype.getSources = function() {
    var list = [];
    for (var i = 0; i < this._sources.length; i++) {
        list.push(this._sources[i]);
    }
    return list;
};

/** Set sources
 @param {Array} Array of  SceneJS.LightSource objects
 @returns {SceneJS.Lights} this
 */
SceneJS.Lights.prototype.setSources = function(sources) {
    this._sources = [];
    for (var i = 0; i < sources.length; i++) {
        this._sources.push(sources[i]);
    }
    return this;
};

/** Get number of sources
 @return {int}
 */
SceneJS.Lights.prototype.getNumSources = function() {
    return this._sources.length;
};

/** Get light source at given index
 * @return {SceneJS.lightSource} Light source
 */
SceneJS.Lights.prototype.getSourceAt = function(index) {
    return this._sources[index];
};

/**
 Removes and returns the light source at the given index. Returns null if no such source.
 @param {int} index Light source index
 @returns {SceneJS.LightSource}
 */
SceneJS.Lights.prototype.removeSourceAt = function(index) {
    var r = this._sources.splice(index, 1);
    if (r.length > 0) {
        return r[0];
    } else {
        return null;
    }
};

// @private
SceneJS.Lights.prototype._init = function(params) {
    if (params.sources) {
        this._sources = [];
        for (var i = 0; i < params.sources.length; i++) {
            this._sources.push(new SceneJS.LightSource(params.sources[i])); // TODO: allow either config or object
        }
    }
};

// @private
SceneJS.Lights.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }
        SceneJS_lightingModule.pushLightSources(this._sources);
        this._renderNodes(traversalContext, data);
       // SceneJS_lightingModule.popLightSources(this._sources.length);
    }
};

/** Factory function that returns a new {@link SceneJS.Lights} instance
 * @param {Object} [cfg] Static configuration object (see class overview comments)
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Lights}
 */
SceneJS.lights = function() {
    var n = new SceneJS.Lights();
    SceneJS.Lights.prototype.constructor.apply(n, arguments);
    return n;
};
