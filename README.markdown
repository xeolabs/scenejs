**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
arcticulated and pickable objects as required for high-detail visualisation applications.

## Downloads

### Latest Build

You can hotlink to these binaries and they will dynamically load SceneJS plugins on-demand from this repository as
required (see [Plugins section](#plugin-system) below for more info on plugins).

* **[scenejs.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.js)**
* **[scenejs.min.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.min.js)**

### Extras

Also hotlinkable are a bunch of helper utilities:

* **[OrbitControl](http://xeolabs.github.com/scenejs/build/latest/extras/orbitControl.html)** -
Mouse camera orbit helper
* **[PickControl](http://xeolabs.github.com/scenejs/build/latest/extras/pickControl.html)** -
Scene picking helper

## Documentation

* **[Examples](http://xeolabs.github.com/scenejs/examples/index.html)** -
Live examples are now the main usage documentation. In the examples page, select topic tags and you'll get a list of examples
   that have those tags. Most of them are not particularly exciting, but aim to show particular use cases. Many of them do
   the same things, but in slightly different ways. [Log an issue](https://github.com/xeolabs/scenejs/issues) if there's something missing there.

Some examples for various topic tags:
* [optimization](http://xeolabs.github.com/scenejs/examples/index.html?tags=optimization) - Optimization
* [texturing](http://xeolabs.github.com/scenejs/examples/index.html?tags=texturing) - Texturing
* [lighting](http://xeolabs.github.com/scenejs/examples/index.html?tags=lighting) - Lighting
* [geometry](http://xeolabs.github.com/scenejs/examples/index.html?tags=geometry) - Geometry
* [modelTransform, viewTransform, projectionTransform](http://xeolabs.github.com/scenejs/examples/index.html?tags=modelTransform,viewTransform,projectionTransform) - Transformation


* **[Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)** -
Documentation in progress for the SceneJS class API, which is the core implementation beneath the JSON API. You can use this
to build scenes programmatically, instead of declaratively with JSON as shown in the examples. You would also use this API when
   when manipulating nodes (even they were defined with JSON).

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



