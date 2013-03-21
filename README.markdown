**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
arcticulated and pickable objects as required for high-detail visualisation applications.


## Contents
* [Downloads](#downloads)
* [What's new in V3](#downloads)
* [Examples](#examples)
 * [Basic](#basic)
 * [Lighting](#lighting)
 * [Geometry](#geometry)
 * [Texture](#texture)
 * [Supported Scene Optimization Techniques]($supported-scene-optimization-techniques)
* [Plugin System](#plugin-system)

## Downloads

### Latest

* **[scenejs.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.js)**
* **[scenejs.min.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.min.js)**

## What's new in V3

Though V2 was released a year previously, V3 has since been under active development in the context of several
applications. V3 is an 80% rewrite that introduces some major enhancements:

* architecture review followed by rewrite of 80% of the codebase
* lots of JS object pooling to minimise the impact of garbage collection on FPS
* seamless recovery from lost WebGL context
* a swish new plugin system

Check out the examples below for info on the new features.

## Documentation

* **[Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)** -
Documentation in progress for the SceneJS class API, which is the core implementation beneath the JSON API. You can use this
to build scenes programmatically, instead of declaratively with JSON as shown in the examples. You would also use this API when
   when manipulating nodes (even they were defined with JSON).

## Examples

### Basic

SceneJS is based on the [convention over configuration](http://en.wikipedia.org/wiki/Convention_over_configuration)
paradigm, automatically providing defaults, which allows you to get started quickly then
override them where you need specialised functionality.

* **[Newell Teapot](http://xeolabs.github.com/scenejs/examples/ex/basic/teapot.html)** - [[source]](examples/ex/basic/teapot.html) -
A simple scene showing the ```lookat```, ```camera```, ```lights``` and ```material``` nodes that SceneJS will
provide by default.


### Lighting
SceneJS provides default ambient and directional lights, but you can override these with your own.

Directional and positional lights can be defined in either World space, where they move relative to changes in viewpoint,
 or in View space, where they are fixed in alignment with the view frustum as if they were moving with the viewpoint like
 lights on a helmet. The maximum number of lights is only limited by the number of ```vars``` supported by your GPU,
 and a modern one should support at least 4-6.

* **[Ambient Light](http://xeolabs.github.com/scenejs/examples/ex/lighting/ambient.html)** - [[source]](examples/ex/lighting/ambient.html)
* **[World-Space Directional Light](http://xeolabs.github.com/scenejs/examples/ex/lighting/directional-world.html)** - [[source]](examples/ex/lighting/directional-world.html)
* **[View-Space Directional Light](http://xeolabs.github.com/scenejs/examples/ex/lighting/directional-view.html)** - [[source]](examples/ex/lighting/directional-view.html)

### Geometry
Many of the examples here use plugins to create primitives like cubes and teapots, but you can also manually
 create your own meshes, line segments and points.
* **[Custom Mesh](http://xeolabs.github.com/scenejs/examples/ex/geometry/geometry-custom.html)** - [[source]](examples/ex/geometry/geometry-custom.html) -
A cube geometry complete with positions, normals, UVs and a texture.
* **[Vertex Colouring](http://xeolabs.github.com/scenejs/examples/ex/geometry/geometry-vertex-colors.html)** - [[source]](examples/ex/geometry/geometry-vertex-colors.html) -
Another cube geometry, but this time with vertex colors.

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

* **[Vertex Sharing](http://xeolabs.github.com/scenejs/examples/ex/optimization/geometry-vertex-sharing.html)** - [[source]](examples/ex/optimization/geometry-vertex-sharing.html)
 Vertex sharing is a technique in which a parent geometry node defines vertices (consisting of position, normal and UV arrays)
that are inherited by child geometry nodes, which supply their own index arrays pointing into different portions of the
vertices. The VBOs for the parent vertex arrays are then bound once across the draw calls for all the children. Each child is a seperate object,
which can be wrapped by different texture or materials etc. This is efficient to render as long as each child geometry
inherits a similar combination of states and thus avoids needing to switch shaders.

* **[Shared Node Cores](http://xeolabs.github.com/scenejs/examples/ex/optimization/shared-node-cores.html)** - [[source]](examples/ex/optimization/shared-node-cores.html)
Traditionally, re-use within a scene graph is done by attaching nodes to multiple parents. For dynamically updated
scenes this can have a performance impact when the engine must traverse multiple parent paths in the scene graph,
so SceneJS takes an alternative approach with "node cores", a concept borrowed from OpenSG.

