## SceneJS 3.0

**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
articulated and pickable objects as required for high-detail visualisation applications.

![Tron Tank Demo](http://scenejs.org/images/tron-tank.jpg)

## Table of Contents
* [Downloads](#downloads)
* [Resources](#resources)
* [Plugin System](#plugin-system)
* [Building](#building)

## Downloads
Hotlink to these binaries and they will dynamically load SceneJS plugins on-demand from this repository as
required (see [Plugins System](#plugin-system) below for more info on plugins).
* **[scenejs.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.js)**
* **[scenejs.min.js](http://xeolabs.github.com/scenejs/build/latest/scenejs.min.js)**

Also hotlinkable are a bunch of helper utilities:
* **[OrbitControl](http://xeolabs.github.com/scenejs/build/latest/extras/orbitControl.js)** -
Mouse camera orbit helper
* **[PickControl](http://xeolabs.github.com/scenejs/build/latest/extras/pickControl.js)** -
Scene picking helper

## Resources
 * [SceneJS.org](http://scenejs.org)
 * [Examples](http://xeolabs.github.com/scenejs/examples/index.html)
 * [Sourcecode](https://github.com/xeolabs/scenejs)
 * [Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)
 * [License](http://scenejs.org/license/index.html)
 * [Facebook Page](http://www.facebook.com/group.php?gid=350488973712)
 * [Issues](https://github.com/xeolabs/scenejs/issues?sort=created&direction=desc&state=open)

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



