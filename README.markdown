**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
arcticulated and pickable objects as required for high-detail visualisation applications.

* [Downloads](#downloads)
* [Documentation](#documentation)
* [Links](#links)
* [Features](#features)
* [Plugin System](#plugin-system)
* [Building](#building)

## Downloads

You can hotlink to these binaries and they will dynamically load SceneJS plugins on-demand from this repository as
required (see [Plugins section](#plugin-system) below for more info on plugins).

* **[scenejs.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.js)**
* **[scenejs.min.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.min.js)**

Also hotlinkable are a bunch of helper utilities:

* **[OrbitControl](http://xeolabs.github.com/scenejs/build/latest/extras/orbitControl.js)** -
Mouse camera orbit helper
* **[PickControl](http://xeolabs.github.com/scenejs/build/latest/extras/pickControl.js)** -
Scene picking helper

## Links

 * [SceneJS.org](http://scenejs.org)
 * [Sourcecode](https://github.com/xeolabs/scenejs)
 * [License](http://scenejs.org/license/index.html)
 * [Facebook](http://www.facebook.com/group.php?gid=350488973712)
 * [Twitter](http://twitter.com/xeolabs)
 * [Issues](https://github.com/xeolabs/scenejs/issues?sort=created&direction=desc&state=open)

## Documentation

* **[Examples](http://xeolabs.github.com/scenejs/examples/index.html)** -
Live examples are now the main usage documentation. In the examples page, select topic tags and you'll get a list of examples
   that have those tags. Most of them are not particularly exciting, but aim to show particular use cases. Many of them do
   the same things, but in slightly different ways. [Log an issue](https://github.com/xeolabs/scenejs/issues) if there's something missing there.

* **[Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)** -
Documentation in progress for the SceneJS class API, which is the core implementation beneath the JSON API. You can use this
to build scenes programmatically, instead of declaratively with JSON as shown in the examples. You would also use this API when
   when manipulating nodes (even they were defined with JSON).

## Features

### API

* **[JSON API](https://github.com/xeolabs/scenejs/wiki/JSON-API)** - SceneJS provides an almost pure JSON-based
API that plays well with the rest of the application stack. JSON content is nice to export, store in a database
(like CouchDB), transport across a network, transform, and read by humans.

* **[Plugins](https://github.com/xeolabs/scenejs/wiki/Service-Container)** - Customise key functionality by plugging
your own strategies into the Inversion-of-Control container. Great for implementing your own compressed/obfuscated content loading strategies.
* **[Messaging System](https://github.com/xeolabs/scenejs/wiki/Messaging System)** - Create and update your scene graphs
remotely using the Messaging System

### Functionality

* **Generated Shaders** - SceneJS automatically generates the shaders required to render the scene objects. For each
geometry, SceneJS composes a shader program from the nodes that are defined above it in the scene graph, reusing shaders
wherever possible.

* **[Custom Shaders](https://github.com/xeolabs/scenejs/wiki/shader)** - For custom effects, define your own GLSL
shader nodes within your scene graph, or hook custom functions into SceneJS' automatically generated shaders. All
parameterisable via the JSON API.

* **[Geometry Morphing](https://github.com/xeolabs/scenejs/wiki/morphGeometry)** - SceneJS allows you to define key
frames for morphing of positions, normals, colors, and/or UV coordinates of geometry. As many frames may be defined
as your video RAM will contain.

* **[Multitexturing](https://github.com/xeolabs/scenejs/wiki/texture)** - Layer multiple textures to combine colour,
specular, glow, transparency and bump maps.

* **[Texture Animation](https://github.com/xeolabs/scenejs/wiki/texture)** - Rotate, scale, translate, blending

* **[Video Textures](https://github.com/xeolabs/scenejs/wiki/video)** - Movie files can be applied as textures -
 useful for complex animated textures, animated bump maps, moving clouds etc.

* **[Layer Bins](https://github.com/xeolabs/scenejs/wiki/layer)** - Scene nodes can be organised into ordered layer
bins to control their rendering order. This is useful for doing transparency correctly; when we have multiple transparent
objects in a scene, we can assign them to ordered layers to ensure that they are alpha-blended in the correct order,
ensuring that the pixels of far objects exist in the framebuffer ready for near objects to blend with.

* **[Multiple Scenes](https://github.com/xeolabs/scenejs/wiki/)** - Multiple scene graphs can be created within the same
JavaScript runtime environment, allowing us to update them concurrently and share JSON content between them.

..and more..

### Efficiency

* **GPU Optimisation** - to reduce work done by the CPU within the render loop, SceneJS dynamically recompiles the
scene graph to a lean internal draw list, which is state-sorted to minimise the work done by the GPU. By ordering the
objects by shader, texture, VBOs etc. it can avoid redundantly re-binding state to the GPU. Though SceneJS does a pretty
good job of sorting, if you program your scene to share plenty of state between your objects, you can achieve some very
fast results.

* **[Shared Node Cores](https://github.com/xeolabs/scenejs/wiki/Node-Cores)** - Traditionally, re-use within a scene
graph is done by attaching nodes to multiple parents. For dynamically updated scenes this can have a performance impact
when the engine must process multiple parent paths, so SceneJS takes an alternative approach with "node cores", a concept
borrowed from OpenSG.

* **[Fast Picking](https://github.com/xeolabs/scenejs/wiki/name)** - SceneJS optimises picking for fast mouseover effects
such as highlight and tooltips, which are also common requirements in visualisation systems. It does this by retaining
pick buffers for re-reading, rewriting them only when the view changes.

## Plugin System

SceneJS now uses plugins for non-core things like geometry primitives (box, teapot, text etc.), fancy texture functionality
(video etc) and so on.

Plugins are used from within node definitions, as shown below:

```javascript
 myNode.addNode({
    type:"geometry",
    id: "myGeometry",
    source:{
        type:"sphere",
        latitudeBands : 30,
        longitudeBands : 30,
        radius : 2
    }
 });
```

This geometry node will create its sphere geometry with the help of the ["sphere" plugin](./build/latest/plugins/geometry/sphere.js).
Geometry (and texture) plugins function as factories, hence the "source" attribute on the geometry node definition.

By default, SceneJS is hardwired to automatically download plugins from [a directory in this repository](build/latest/plugins). This means you can
 just hotlink to the SceneJS core library downloads and they will download the plugins automatically as you need them. That's
 nice for putting SceneJS examples on code sharing sites like jsFiddle.

If you'd rather serve the plugins yourself, instead of relying on the avialability of this repo, then grab a copy of the
plugins and configure SceneJS to load them from your location:

 ```javascript
 SceneJS.configure({
     pluginPath: "./foo/myPluginsDir"
 });
 ```

## Building

SceneJS requires nodejs. To build, simply:

```node build.js```

Then the binaries will appear in ```./build```.



