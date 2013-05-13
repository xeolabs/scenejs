**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
arcticulated and pickable objects as required for high-detail visualisation applications.

## Downloads

You can hotlink to these binaries and they will dynamically [load plugins on demand](plugin-system) from this repository as required.

### Latest Build

* **[scenejs.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.js)**
* **[scenejs.min.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.min.js)**

## Documentation

* **[Examples](http://xeolabs.github.com/scenejs/examples/index.html)** -
Live examples are now the canonical documentation.

* **[Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)** -
Documentation in progress for the SceneJS class API, which is the core implementation beneath the JSON API. You can use this
to build scenes programmatically, instead of declaratively with JSON as shown in the examples. You would also use this API when
   when manipulating nodes (even they were defined with JSON).

## What's New in V3

Though V2 was released a year prior, V3 has since been under active development in the context of several
apps currently in production. V3 has some major enhancements, including:

* many more defaults, resulting in simpler scene definitions
* seamless recovery from lost WebGL context
* an architecture review followed by an 80% rewrite
* lots of JS object pooling, to minimise the impact of garbage collection on FPS
* a swish new plugin system

Check out the [examples](http://xeolabs.github.com/scenejs/examples/index.html) for more info.

## Plugin System

SceneJS now uses plugins for non-core things like geometry primitives (box, teapot, text etc.) and fancy texture functionality
(video etc).

Plugins are used from within node definitions, such as in this geometry node for example:

```javascript
 myNode.addNode({
    type:"geometry",
    plugin:{
        type:"sphere",
        latitudeBands : 30,
        longitudeBands : 30,
        radius : 2
    }
 });
```

When SceneJS creates this node, it's going to dynamically load a plugin from [./build/latest/plugins/geometry/sphere.js](build/latest/plugins/geometry/sphere.js),
 which is a factory that creates sphere primitives.

 By default, SceneJS is hardwired to download plugins from [a directory in this repository](build/latest/plugins). This means you can
 just hotlink to the SceneJS core library downloads and they will download the plugins automatically as you need them. That's
 nice for putting SceneJS examples on code sharing sites like jsFiddle.

 However, if you'd rather load them off your own server, grab a copy of the plugins and configure SceneJS to load them
   from there:

 ```javascript
 SceneJS.configure({
     pluginPath: "./foo/myPluginsDir"
 });
 ```



