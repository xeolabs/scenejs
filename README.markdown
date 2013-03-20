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

* **[Newell teapot](http://xeolabs.github.com/scenejs/examples/teapot.html)** - [[source]](examples/teapot.html)

### Geometry

* **[Custom mesh](http://xeolabs.github.com/scenejs/examples/geometry-custom.html)** - [[source]](examples/geometry-custom.html)

* **[Vertex colouring](http://xeolabs.github.com/scenejs/examples/geometry-custom-vertex-colors.html)** - [[source]](examples/geometry-custom-vertex-colors.html)

* **[Vertex sharing](http://xeolabs.github.com/scenejs/examples/geometry-custom-vertex-sharing.html)** - [[source]](examples/geometry-custom-vertex-sharing.html)
Vertex sharing is a technique in which a parent geometry node defines vertices (consisting of position, normal and UV arrays)
that are inherited by child geometry nodes, which supply their own index arrays pointing into different portions of the
vertices. The VBOs for the parent vertex arrays are then bound once across the draw calls for all the children. Each child is a seperate object,
which can be wrapped by different texture or materials etc. This is efficient to render as long as each child geometry
inherits a similar combination of states and thus avoids needing to switch shaders.