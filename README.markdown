**SceneJS 2.0** is an open-source 3D engine on WebGL that is geared towards rendering large numbers of individually pickable and articulated objects as required for engineering and data visualisation applications.

On the inside, SceneJS is a fast draw list that's optimised for things like fast redraw and picking, while on the outside it's a convenient JSON-based scene graph API that easy to hook into the rest of the application stack.

SceneJS is a lean rendering kernel which omits functionality such as physics and visibility culling. However, since it's very efficient to update the states of objects, it's therefore practical to integrate your choice of third-party toolkits for these tasks, such as [TweenJS](https://github.com/gskinner/TweenJS), [JSBullet](https://github.com/CasperPas/JSBullet) and [jsBVH](https://github.com/imbcmdth/jsBVH).

![Tron Tank Demo](http://scenejs.org/images/tron-tank.jpg)

## Who's using SceneJS

* **[BioDigital Human](http://biodigitalhuman.com)** - a 3D platform for visualisation of anatomy, disease and 
treatments. The Human provides interactive tools for exploring, dissecting, and sharing custom views, plus detailed
medical descriptions.

* **[BIMShare](http://mybimshare.com)** - an online viewing and sharing service for IFC 2x3 TC1 architectural models

* **[BIMSurfer](http://bimsurfer.org)** - the first open source WebGL based IFC / BIMviewer

* **[ShapeSmith](http://shapesmith.net/)** - a free and open source 3D modelling project which aims to make designing 3D
printable models accessible to anyone with a modern browser - draw shapes using primitives, perform boolean operations,
do transformations, and export your models to STL format

* **[Ammo JS Demos](https://github.com/schteppe/ammo.js-demos)** integration of SceneJS with the Ammo physics engine

## Links

 * [SceneJS.org](http://scenejs.org)
 * [Sourcecode](https://github.com/xeolabs/scenejs)
 * [License](http://scenejs.org/license/index.html)
 * [Wiki - V0.8](http://scenejs.wikispaces.com/)
 * [Wiki - V2.0](https://github.com/xeolabs/scenejs/wiki/Home)
 * [Facebook](http://www.facebook.com/group.php?gid=350488973712)
 * [YouTube](http://www.youtube.com/user/xeolabs)
 * [Twitter](http://twitter.com/xeolabs)
 * [Google Group](http://groups.google.co.nz/group/scenejs?lnk=gcimh)
 * [Issues](https://github.com/xeolabs/scenejs/issues?sort=created&direction=desc&state=open)

## Tools

* **[scenejs-pycollada](https://github.com/xeolabs/scenejs-pycollada)** - Python-based COLLADA import library

* **[obj2scenejs](http://www.sist.ac.jp/~iigura/en/obj2SceneJS.html)** - .NET-based Wavefront OBJ importer (for SceneJS V0.8)

## Features

### API

* **[Logical JSON API](https://github.com/xeolabs/scenejs/wiki/JSON-API)** - SceneJS provides an almost pure JSON-based
API that plays well with the rest of the application stack. JSON content is nice to export, store in a database
(like CouchDB), transport across a network, transform, and read by humans.

* **[IoC Container](https://github.com/xeolabs/scenejs/wiki/Service-Container)** - Customise key functionality by plugging
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

* **[Render-to-Texture](https://github.com/xeolabs/scenejs/wiki/frameBuf)** - Scene subgraphs can be dynamically
captured to an image buffer, which can be applied as textures within other parts of the scene. This is useful for
approximating reflection and can also be used in conjunction with SceneJS extensible shaders to apply post-processing
effects.

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


## Building

To build SceneJS, you'll need Java and ANT. Then at the same level as build.xml, type:

`ant all`

Create the "dist" directory, which will contain all the SceneJS libraries, JSDocs and examples.

If you are modifying the source code and testing it with a new example or your own project the following
ant tasks which complete in just a couple of seconds may be helpful. These tasks do not clean the dist
directory so previously-generated JSDocs will still available

`ant package-lib`

Create the "dist" directory and populate the lib directory with scenejs.js, scenejs.min.js, and the plugins and utils directories.

`ant packge-examples`

Create the "dist" directory and populate the lib directory and the examples directory.
