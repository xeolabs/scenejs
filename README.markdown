**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
arcticulated and pickable objects as required for high-detail visualisation applications.

V3.0 is a major rewrite of V2.0

## Examples

### Basic

SceneJS is based on the [convention over configuration](http://en.wikipedia.org/wiki/Convention_over_configuration)
paradigm, automatically providing defaults, which allows you to get started quickly then
override them where you need specialised functionality.

Though this first example has a few nodes (camera, lights and material) that could be omitted to fall back on defaults,
it shows just to give a sense of what nodes play a part in a scene.

* **[Newell Teapot](http://xeolabs.github.com/scenejs/examples/basic/teapot.html)** - [[source]](examples/basic/teapot.html)

### Geometry

* **[Custom Mesh](http://xeolabs.github.com/scenejs/examples/ex/geometry/geometry-custom.html)** - [[source]](examples/ex/geometry/geometry-custom.html)
* **[Vertex Colouring](http://xeolabs.github.com/scenejs/examples/ex/geometry/geometry-custom-vertex-colors.html)** - [[source]](examples/ex/geometry/geometry-vertex-colors.html)

### Texture

* **[Bump Mapping](http://xeolabs.github.com/scenejs/examples/ex/texture/texture-bump-map.html)** - [[source]](examples/ex/texture/texture-bump-mapp.html)
* **[Video Texture](http://xeolabs.github.com/scenejs/examples/ex/texture/texture-video.html)** - [[source]](examples/ex/texture/texture-video.html)
* **[Multitexturing](http://xeolabs.github.com/scenejs/examples/ex/texture/texture-layers.html)** - [[source]](examples/ex/texture/texture-layers.html)
* **[Texture Animation](http://xeolabs.github.com/scenejs/examples/ex/texture/texture-animation.html)** - [[source]](examples/ex/texture/texture-animation.html)

### Supported Scene Optimisation Techniques

* **[Texture Atlas](http://xeolabs.github.com/scenejs/examples/ex/optimization/texture-atlas.html)** - [[source]](examples/ex/optimization/texture-atlas.html)
 A texture atlas is a large image that contains many sub-images, each of which is used as a texture for a different geometry,
or different parts of the same geometry. The sub-textures are applied by mapping the geometries' texture coordinates to
different regions of the atlas. So long as each of the geometry nodes inherit the same configuration of parent node states,
and can therefore share the same shader, SceneJS will bind the texture once for all the geometries as they are rendered.
Another important benefit of texture atlases is that they reduce the number of HTTP requests for texture images.

* **[Vertex Sharing](http://xeolabs.github.com/scenejs/examples/ex/optimization/geometry-custom-vertex-sharing.html)** - [[source]](examples/ex/optimization/geometry-vertex-sharing.html)
 Vertex sharing is a technique in which a parent geometry node defines vertices (consisting of position, normal and UV arrays)
that are inherited by child geometry nodes, which supply their own index arrays pointing into different portions of the
vertices. The VBOs for the parent vertex arrays are then bound once across the draw calls for all the children. Each child is a seperate object,
which can be wrapped by different texture or materials etc. This is efficient to render as long as each child geometry
inherits a similar combination of states and thus avoids needing to switch shaders.

* **[Shared Node Cores](http://xeolabs.github.com/scenejs/examples/ex/optimization/shared-node-cores.html)** - [[source]](examples/ex/optimization/shared-node-cores.html)
Traditionally, re-use within a scene graph is done by attaching nodes to multiple parents. For dynamically updated
scenes this can have a performance impact when the engine must traverse multiple parent paths in the scene graph,
so SceneJS takes an alternative approach with "node cores", a concept borrowed from OpenSG.