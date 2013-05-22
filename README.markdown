## SceneJS 3.0

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

* **JSON API - Build scenes quickly on a declarative JSON-based API that plays well with the rest of the application stack.
JSON is nice to export, database, transmit, transform and read.

* **[Plugins](http://xeolabs.github.io/scenejs/examples/index.html?page=pluginPullStream)** - Extend texture and geometry functionality through plugins, eg. to create primitives, load
compressed texture formats, and so on. All the geometry primitives, such as 'teapot' and 'sphere', are now plugins.
Plugins are unobtrusive, and are kept in a directory from where SceneJS loads them as required. Read more in the [plugins](#plugins) section below.

* **[Vertex](http://xeolabs.github.io/scenejs/examples/index.html?page=vertexDisplaceShader)** and
**[Fragment](http://xeolabs.github.io/scenejs/examples/index.html?page=xrayShader)** Shader Customization- Although SceneJS generates shaders automatically,
you can modify the shaders by injecting custom functions into them

* **[Color](http://xeolabs.github.io/scenejs/examples/index.html?page=colorMap), [Alpha](http://xeolabs.github.io/scenejs/examples/index.html?page=alphaMap),
[Specular](http://xeolabs.github.io/scenejs/examples/index.html?page=specularMap), [Glow](http://xeolabs.github.io/scenejs/examples/index.html?page=glowMap)**
 and **[Bump](http://xeolabs.github.io/scenejs/examples/index.html?page=bumpMap) Maps**

* **[Multitexturing](http://xeolabs.github.io/scenejs/examples/index.html?page=multitexturing)** - Layer multiple textures onto the same geometry

* **[Texture Atlasses](http://xeolabs.github.io/scenejs/examples/index.html?page=textureAtlas)** -  Define a large texture
containing an "atlas" of sub-textures to use individually on many geometries, each of which have UV coordinates that map
to a different region of the texture. In a scene where there are many small textures, this has the benefit of reducing
state changes on the graphics hardware by binding once, instead of for each individual texture..

* **[Texture Animation](http://xeolabs.github.io/scenejs/examples/index.html?page=colorMapAnimation)** - Animate textures by rotating, scaling,
translating and blending them.

* **Video Streaming to **[Color](http://xeolabs.github.io/scenejs/examples/index.html?page=videoColorMap), [Alpha](http://xeolabs.github.io/scenejs/examples/index.html?page=videoAlphaMap),
[Specular](http://xeolabs.github.io/scenejs/examples/index.html?page=videoSpecularMap), [Glow](http://xeolabs.github.io/scenejs/examples/index.html?page=videoGlowMap)**
 and **[Bump](http://xeolabs.github.io/scenejs/examples/index.html?page=videoBumpMap) Maps** - Stream a video into a texture in real time.

* **[Geometry Morphing](http://xeolabs.github.io/scenejs/examples/index.html?page=geometryMorphing)** - Animate geometry by interpolating its
positions, normals, colors and UVs within keyframes.

* **[Geometry Vertex Sharing](http://xeolabs.github.io/scenejs/examples/index.html?page=vertexSharing)** - Animate geometry by interpolating its
positions, normals, colors and UVs within keyframes.

* **[Layers](http://xeolabs.github.io/scenejs/examples/index.html?page=transparencySorting)** - Control rendering order of scene nodes by prioritizing them
in layers, which is useful for transparency sorting.

* **[Transform Hierachies](http://xeolabs.github.io/scenejs/examples/index.html?page=transformHierarchy)** - Articulate your scenes using hierarchies of
modelling transform nodes, a staple feature in scene graph APIs.

* **[Multiple Scenes](http://xeolabs.github.io/scenejs/examples/index.html?page=multipleScenes)** - Run multiple scenes simultaneously in the same page

* **[Shared Node Cores](http://xeolabs.github.io/scenejs/examples/index.html?page=sharedNodeCores)** - Traditionally, re-use within a scene
graph is done by attaching nodes to multiple parents. For dynamically updated scenes this can have a performance impact
when the engine must process multiple parent paths, so SceneJS takes an alternative approach with "node cores", a concept
borrowed from OpenSG.

* **GPU Optimisation** - to reduce work done by the CPU within the render loop, SceneJS dynamically recompiles the
scene graph to a lean internal draw list, which is state-sorted to minimise the work done by the GPU. By ordering the
objects by shader, texture, VBOs etc. it can avoid redundantly re-binding state to the GPU. Though SceneJS does a pretty
good job of sorting, if you program your scene to share plenty of state between your objects then you can achieve some very
fast results.

* **[Automatic Lost WebGL Context Recovery](http://xeolabs.github.io/scenejs/examples/index.html?page=webglContextLost)** -
SceneJS seamlessly recovers from Lost WebGL Context errors, which occur when the OS or browser resets
WebGL to regain control after a mishap. When a new context becomes available, SceneJS instanly rebuilds all its WebGL resources
from state held in the scene graph without reloading anything off the server.

* Sensible Defaults - SceneJS now provides defaults for all scene state, such
 as camera, lights and material, in a configuration that's ready to render whatever geometry you drop into the scene. That means you
 can create a more minimal scene definition, which turned out to be handy for creating clearer examples.

## Plugin System

As mentioned above, SceneJS now uses plugins for things like primitives (box, teapot, text etc.) and fancy
texture loading (video etc).

Plugins are used from within node definitions, as shown in this example for geometry:

```javascript
var myGeometry = myNode.addNode({
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

Essentially, the plugin's code looks like the listing below. The plugin provides geometry factory objects, each with
a ```configure``` method to configure the sphere shape and a ```subscribe``` method to collect created geometry data.

```javascript
SceneJS.Plugins.addPlugin(

    "geometry", // Node type
    "sphere", // Plugin type

    new (function () {
        this.getSource = function () {
            var publish;
            return {
                subscribe:function (fn) {
                    publish = fn;
                },
                configure:function (cfg) {
                    publish(build(cfg));
                }
            };
        };

        function build(cfg) {

            var latitudeBands = cfg.latitudeBands || 30;
            var longitudeBands = cfg.longitudeBands || 30;
            var radius = cfg.radius || 2;

            var positions = [/*...*/];
            var normals =  [/*...*/];
            var uv =  [/*...*/];
            var indices =  [/*...*/];

            return {
                primitive:"triangles",
                positions:new Float32Array(positions),
                normals:new Float32Array(normals),
                uv:new Float32Array(uv),
                indices:new Uint16Array(indices)
            };
        }

    })());
```

Then you can reconfigure the geometry at any time using setter methods on the node as shown below. Note however that we
can't reconfigure the plugin type we're using for our node.

```javascript
// Reconfigure our sphere like this - make it bigger and smoother:
myGeometry.setSource({ latitudeBands : 60, longitudeBands : 60, radius : 3 });

// ..or do the same using the generic attribute setter:
myGeometry.set({ source:{ latitudeBands : 60, longitudeBands : 60, radius : 3 } });
myGeometry.set("source", { latitudeBands : 60, longitudeBands : 60, radius : 3 });
```


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



