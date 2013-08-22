## SceneJS 3.1

**SceneJS** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
articulated and pickable objects as required for high-detail visualisation applications.

![Tron Tank Demo](http://scenejs.org/images/tron-tank.jpg)

## Table of Contents
* [Downloads](#downloads)
* [Resources](#resources)
* [Plugin API](#plugin-api)
 * [Geometry Plugins](#geometry-plugins)
 * [Texture Plugins](#texture-plugins)
 * [Serving plugins yourself](#serving-plugins-yourself)
* [Custom Node Types](#custom-node-types)
 * [Defining a Custom Node Type](#defining-a-custom-node-type)
 * [Using a Custom Node Type](#using-a-custom-node-type)
 * [Loading Plugin Support Libraries with RequireJS](#loading-plugin-support-libraries-with-requirejs)
* [Building](#building-scenejs)

## Downloads
Get started fast by hotlinking to the latest library build:
* **[scenejs.js](http://xeolabs.github.com/scenejs/api/latest/scenejs.js)**

SceneJS uses plugins for many features, dynamically loading those as you need them. By default, the library will
load plugins from this repository. That's OK for playing around, but for production you'll probably want to serve the
plugins yourself - see the [Plugin API](#plugin-api) section below for how to do that.


## Resources
 * [SceneJS.org](http://scenejs.org)
 * [Examples](http://xeolabs.github.com/scenejs/examples.html)
 * [Sourcecode](https://github.com/xeolabs/scenejs)
 * [Class Docs](http://xeolabs.github.com/scenejs/docs/index.html)
 * [License](http://scenejs.org/license/index.html)
 * [Facebook Page](http://www.facebook.com/group.php?gid=350488973712)
 * [Issues](https://github.com/xeolabs/scenejs/issues?sort=created&direction=desc&state=open)

## Plugin API
As mentioned above, SceneJS now uses plugins for things like primitives (box, teapot, text etc.) and fancy
texture loading (video etc).

By default, SceneJS is hardwired to automatically download plugins from the [plugins directory](build/latest/plugins)
in this repository. This means you can just hotlink to the SceneJS core library downloads and they will download the
plugins automatically as you need them. That's nice for sharing SceneJS examples on jsFiddle etc, but in production
you would want to [serve them youself](#serving-plugins-yourself).

### Geometry Plugins
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

This ```geometry``` node will create its sphere geometry with the help of the [sphere](./api/latest/plugins/geometry/sphere.js) plugin.

Essentially, the plugin's code looks like the listing below. The plugin provides geometry factory objects (called "sources"), each with
a ```configure``` method to configure the sphere shape and a ```subscribe``` method to collect the generated geometry data. SceneJS plugins
are generally data sources.

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
can't reconfigure the plugin ```type```.

```javascript
// Reconfigure our sphere like this - make it bigger and smoother:
myGeometry.setSource({ latitudeBands : 60, longitudeBands : 60, radius : 3 });

// ..or do the same using the generic attribute setter:
myGeometry.set({ source:{ latitudeBands : 60, longitudeBands : 60, radius : 3 } });
myGeometry.set("source", { latitudeBands : 60, longitudeBands : 60, radius : 3 });
```

### Texture Plugins

Texture ```layers``` can load their textures via plugins, as shown on this example ```texture``` node:

```javascript
var myTexture = myNode.addNode({
    type:"texture",
    id: "myTexture",
    layers: [
        {
            source:{
                type:"image",
                src: "someImage.jpg"
            }
        }
    ],
    nodes: [
        //...
    ]
 });
```

This layer uses the [image plugin](build/latest/plugins/texture/image.js), which is shown below. This plugin simply
fetches an image file and tweaks its dimensions to be a power-of-two, as currently required by WebGL. It's actually
redundant because SceneJS does that anyway, but it makes a nice example:

```javascript
SceneJS.Plugins.addPlugin(

    "texture",
    "image",

    new (function () {

        this.getSource = function (params) {

            var gl = params.gl;
            var texture = gl.createTexture();
            var publish;

            return {
                subscribe:function (fn) {
                    publish = fn;
                },
                configure:function (cfg) {
                    if (!cfg.src) {
                        throw "Parameter expected: 'src'";
                    }
                    var image = new Image();
                    image.crossOrigin = "anonymous";
                    image.onload = function () {
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        var potImage = ensureImageSizePowerOfTwo(image); // WebGL hates NPOT images
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, potImage);
                        if (publish) {
                            publish(texture);
                        }
                    };
                    image.src = cfg.src;
                }
            };
        };

        function ensureImageSizePowerOfTwo(image) {
            if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
                var canvas = document.createElement("canvas");
                canvas.width = nextHighestPowerOfTwo(image.width);
                canvas.height = nextHighestPowerOfTwo(image.height);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image,
                    0, 0, image.width, image.height,
                    0, 0, canvas.width, canvas.height);
                image = canvas;
            }
            return image;
        }

        function isPowerOfTwo(x) {
            return (x & (x - 1)) == 0;
        }

        function nextHighestPowerOfTwo(x) {
            --x;
            for (var i = 1; i < 32; i <<= 1) {
                x = x | x >> i;
            }
            return x + 1;
        }

    })());
```

Then you can reconfigure the texture at any time through the ```texture``` node:

```javascript
// Load a different image:
myGeometry.setLayers({
    "0": {
        src: "someOtherImage.jpg"
     }
});
```

### Serving plugins yourself
If you'd rather serve the plugins yourself, instead of relying on the availability of this repository, then copy the
[plugins directory](build/latest/plugins) to your server and configure SceneJS to load them from there:

 ```javascript
 SceneJS.configure({
     pluginPath: "./foo/myPluginsDir"
 });
 ```

## Custom Node Types
Non-core node types are provided as a special type of plugin. This is a powerful extension mechanism which allows you to create your
own high-level scene components that just slot straight into the graph as nodes which you can access as usual via the JSON API.

In this section we'll see how to define a custom node type as a plugin, and how to use the node type within a scene graph.

The examples page also has [several examples](http://scenejs.org/examples.html?tags=customNodes) of custom node type definition and use.

### Defining a Custom Node Type

A class definition for a custom node type is provided to SceneJS as plugin script which it will dynamically load on-demand as soon as you try to instantiate it within your scene graph.

As shown in the trivial example below, custom nodes generally work as facades that create additional nodes within their subgraphs, while providing accessor methods which usually get or set state on those nodes:

```javascript
SceneJS.Types.addType("demos/color", {

        // Constructor
        // The params are the attributes which are specified
        // for instances of this node type within scene definitions
        init:function (params) {

            this._material = this.addNode({
                type:"material",

                // Custom node types are responsible for
                // attaching any child nodes that are
                // specified in their 'nodes' properties
                nodes:params.nodes
            });

            // Set initial color, if provided
            if (params.color) {
                this.setColor(params.color);
            }
        },

        // Setter on node to set its color
        setColor:function (color) {
            this._material.setColor(color);
        },

        // Getter on node to get its color
        getColor:function () {
            return this._material.getColor();
        },

        // Node destructor, not actually needed for this
        // example. Use these to clean up any resources
        // created by the node.
        //
        // Note that when the node is destroyed, SceneJS
        // will automatically destroy any child nodes
        // of our node, so there's no need to destroy them
        // manually with a destructor.
        destroy:function () {
        }
    });
```

This plugin happens to be deployed within the default SceneJS plugins directory, at this location:

[http://scenejs.org/api/latest/plugins/node/demos/color.js](http://scenejs.org/api/latest/plugins/node/demos/color.js)

Note that the plugin script installs the custom node type as "demos/color", and see how that type name maps to the script's location
within the ```http://scenejs.org/api/latest/plugins/node``` directory.

### Using a Custom Node Type

Let's assume that we've configured SceneJS to find our plugin (this is the default configuration by the way, so don't
bother doing this if you're hotlinking to the SceneJS lib and just want to use the plugins from this repo):

```javascript
SceneJS.configure({
     pluginPath: "http://scenejs.org/api/latest/plugins"
 });
```

Now we can create a scene that includes an instance of our custom node type.

```javascript
var scene = SceneJS.createScene({
        nodes:[
            {
                type:"lookAt",
                eye:{ x:8, y:8, z:8 },

                nodes:[

                    // Node type defined by plugin
                    // http://scenejs.org/api/latest/plugins/node/demos/color.js
                    {
                        type:"demos/color",
                        id: "myColor",
                        color: { r: 1, g: 0.3, b: 0.3 },

                        // Child nodes specified for custom nodes are
                        // expected to be created within the custom
                        // types' constructors (see this in the custom
                        // node type's constructor above)
                        nodes:[

                            // Geometry using a plugin loaded from
                            // /geometry/teapot
                            {
                                type:"geometry",
                                source:{
                                    type:"teapot"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    });
```
When SceneJS parses that instance of our ```demos/color``` node type, it's going to dynamically load our plugin script,
which will install the plugin type, which SceneJS will then instantiate to create the node.

See how in the scene we are providing a child geometry for our node. Within its constructor (the ```init``` method in
the node type definition plugin above) the custom node type is responsible for inserting  specified child node(s) into
the subgraph it creates under itself. That's because only the node type knows exactly where the child nodes should be located within its subgraph.

Now lets get the node instance and use one of its accessor methods to periodically switch its color property.

Note that since our node originates from a plugin that will be loaded on-demand, we need to get the node asynchronously
using a callback (instead of synchronously, like we can with instances of core node types):

```javascript
scene.getNode("myColor",
            function(myColor) {

                setInterval(function() {

                    myColor.setColor({
                        r: Math.random(),
                        g: Math.random(),
                        b: Math.random()
                    });
                }, 1000);
            });
```

See that setColor method, which is defined by our node type?

 [ [Run this example](http://scenejs.org/examples.html?page=customBundledNodeColor) ]


### Loading Plugin Support Libraries with RequireJS

SceneJS bundles RequireJS, so that plugins can dynamically load support libraries, such as those from 3rd-party vendors.

Support libraries used by custom node types are kept in a [lib directory inside the plugins directory](https://github.com/xeolabs/scenejs/tree/V3.1/api/latest/plugins/lib).

Custom node types can then require the dependencies using a *scenejsPluginDeps* prefix:

``` javascript
require([

      // This prefix routes to the 3rd-party libs directory
      // containing resources used by plugins
      "scenejsPluginDeps/someLibrary.js"
   ],
   function () {

      SceneJS.Types.addType("foo/myCustomNodeType", {

         init: function (params) {
            // Now we can use that library in our node
            // ...
         }
      });
   });
```

SceneJS synchronises that RequireJS ```scenejsPluginDeps``` path with the current ```pluginPath``` configuration setting.

As an example, the bundled [canvas/capture](https://github.com/xeolabs/scenejs/blob/V3.1/api/latest/plugins/node/canvas/capture.js) node type
 uses the 3rd-party ```canvas2image``` library to capture the canvas to an image. Run a demo of that node
 [here](http://scenejs.org/examples.html?page=canvasCapture).

## Building SceneJS
SceneJS requires nodejs and ncp. To build, simply:

```npm install ncp```
```node build.js```

Then the binaries will appear in ```./api```.



