**SceneJS 2.0** is an open-source 3D engine on WebGL that is geared towards rendering large numbers of individually pickable and articulated objects as required for engineering and data visualisation applications.

On the inside, SceneJS is a fast draw list that's optimised for things like fast redraw and picking, while on the outside it's a convenient JSON-based scene graph API that easy to hook into the rest of the application stack.

SceneJS is a lean rendering kernel which omits functionality such as physics and visibility culling. However, since it's very efficient to update the states of objects, it's therefore practical to integrate your choice of third-party toolkits for these tasks, such as [TweenJS](https://github.com/gskinner/TweenJS), [JSBullet](https://github.com/CasperPas/JSBullet) and [jsBVH](https://github.com/imbcmdth/jsBVH).

![Tron Tank Demo](http://scenejs.org/images/tron-tank.jpg)

## Who's using SceneJS

 * http://biodigitalhuman.com
 * http://mybimshare.com

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

* **[scenejs-pycollada](https://github.com/xeolabs/scenejs-pycollada)** - a Python-based COLLADA importer

## Features
(Not a complete list)

* **[Logical JSON API](JSON API)** - SceneJS provides an almost pure JSON-based API that plays well with the rest of the application stack. JSON content is nice to export, store in a database (like CouchDB), transport across a network, transform, and read by humans.

* **Automatic Shader Generation** - SceneJS automatically generates the shaders required to render the scene objects. For each geometry, SceneJS composes a shader program from the nodes that are defined above it in the scene graph, reusing shaders wherever possible. While this means that you don't have to think about GLSL, you can customise the shaders by injecting custom GLSL functions.

* **GPU Optimisation** - SceneJS sorts its internal draw list to minimise the work done by the GPU. By ordering the objects by shader, texture, VBOs etc. it can avoid redundantly re-binding state to the GPU. Though SceneJS does a pretty good job of sorting, if you program your scene to share plenty of state between your objects, you can achieve some very fast results.

* **[Fast Picking](https://github.com/xeolabs/scenejs/wiki/Picking)** - SceneJS optimises picking for fast mouseover effects such as highlight and tooltips, which are also common requirements in visualisation systems. It does this by retaining pick buffers for re-reading, rewriting them only when the view changes.

* **[Shared Node Cores](https://github.com/xeolabs/scenejs/wiki/Node-Cores)** - Traditionally, re-use within a scene graph is done by attaching nodes to multiple parents. For dynamically updated scenes this can have a performance impact when the engine must process multiple parent paths, so SceneJS takes an alternative approach with "node cores", a concept borrowed from OpenSG.

* **[Layer Bins](https://github.com/xeolabs/scenejs/wiki/layer)** - Scene nodes can be organised into ordered layer bins to control their rendering order. This is useful for doing transparency correctly; when we have multiple transparent objects in a scene, we can assign them to ordered layers to ensure that they are alpha-blended in the correct order, ensuring that the pixels of far objects exist in the framebuffer ready for near objects to blend with.

* **[Geometry Morphing](https://github.com/xeolabs/scenejs/wiki/morphGeometry)** - SceneJS allows you to define key frames for morphing of positions, normals, colors, and/or UV coordinates of geometry. As many frames may be defined as your video RAM will contain.

* **[Render-to-Texture](https://github.com/xeolabs/scenejs/wiki/imageBuf)** - Scene subgraphs can be dynamically captured to an image buffer, which can be applied as textures within other parts of the scene. This is useful for approximating reflection and can also be used in conjunction with SceneJS extensible shaders to apply post-processing effects.

* **[Multiple Scenes](https://github.com/xeolabs/scenejs/wiki/)** - Multiple scene graphs can be created within the same JavaScript runtime environment, allowing us to update them concurrently and share JSON content between them.

* **[Texture Animation](https://github.com/xeolabs/scenejs/wiki/texture)** - Rotate, scale, translate, blending

* **[Render-to-Texture](https://github.com/xeolabs/scenejs/wiki/imageBuf)** - Render live portions of your scene to textures

* **[Texture Layers](https://github.com/xeolabs/scenejs/wiki/imageBuf)** - Multi-layer textures with color, specular, glow transparency and bump mapping layers

* **[IoC Container](https://github.com/xeolabs/scenejs/wiki/Service-Container)** - Customise key functionality by plugging your own strategies into the Inversion-of-Control container. Great for implementing your own compressed/obfuscated content loading strategies.

* **[Messaging System](https://github.com/xeolabs/scenejs/wiki/Messaging System)** - Create and update your scene graphs remotely using the Messaging System

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
