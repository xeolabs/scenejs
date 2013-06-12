## SceneJS 3.0

**SceneJS 3.0** is an open-source 3D engine on WebGL that's geared towards rendering large numbers of individually
articulated and pickable objects as required for high-detail visualisation applications.

![Tron Tank Demo](http://scenejs.org/images/tron-tank.jpg)

## Table of Contents
* [Downloads](#downloads)
* [Resources](#resources)
* [Plugin API](#plugin-api)
 * [Geometry Plugins](#geometry-plugins)
 * [Texture Plugins](#texture-plugins)
 * [Custom Node Types](#custom-node-types)
 * [Serving plugins yourself](#serving-plugins-yourself)
* [Building](#building)

## Downloads
Hotlink to these binaries and they'll dynamically load SceneJS plugins on-demand from this repository as
required. That's OK for playing around, but for production you'll probably want to serve the plugins yourself -
see [Plugin API](#plugin-api) below for how to do that.
* **[scenejs.js](http://xeolabs.github.com/scenejs/api/latest/scenejs.js)**

Also hotlinkable are a bunch of helper utilities:
* **[OrbitControl](http://xeolabs.github.com/scenejs/api/latest/extras/orbitControl.js)** -
Mouse camera orbit helper
* **[PickControl](http://xeolabs.github.com/scenejs/api/latest/extras/pickControl.js)** -
Scene picking helper

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

### Custom Node Types
Non-core node types are provided as a special type of plugin. This is a powerful extension mechanism that allows you to create your
own high-level scene components that just slot straight into the graph as nodes which you can access as usual via the JSON API.

Shown below is the [redTeapot plugin](build/latest/plugins/node/demos/redTeapot.js), which defines a scene node type that is a
red teapot which can be translated and scaled. This node type exposes setters to update the position and scale of the teapot.

```javascript
SceneJS.Types.addType("demos/redTeapot", {

    // Constructor
    init:function (params) {

        this._translate = this.addNode({
            type:"translate"
        });

        this._scale = this._translate.addNode({
            type:"scale",
            x:1, y:1, z:1,
            nodes:[
                {
                    type:"material",
                    color:{ r:1.0, g:0.6, b:0.6 },
                    nodes:[
                        {
                            type:"geometry",
                            source:{
                                type:"teapot"
                            }
                        }
                    ]
                }
            ]
        });

        if (params.pos) {
            this.setPos(params.pos);
        }

        if (params.size) {
            this.setSize(params.size);
        }
    },

    // Setter for teapot position
    setPos:function (pos) {
        this._translate.setXYZ(pos);
    },

    // Setter for teapot scale
    setSize:function (size) {
        this._scale.setXYZ(size);
    }
});
```

The scene below contains an instance of our "redTeapot" node. See how we just reference the type
with ```type:"demos/redTeapot"```, which causes SceneJS to dynamically load the plugin script shown above,
 which installs the node type into SceneJS when it executes.

```javascript
var scene = SceneJS.createScene({
        nodes:[
            {
                type:"rotate",
                y: 1,
                angle: 45,
                nodes:[

                    // Instance our custom node type
                    // The optional size and pos attributes are fed into the node's setters
                    {
                        type:"demos/redTeapot",
                        id:"myRedTeapot",
                        size:{
                            x:0.4,
                            y:1.0,
                            z:0.5
                        },
                        pos:{
                            x:-1
                        }
                    }
                ]
            }
        ]
    });

// Subscribe to the redTeapot - the plugin which defines the redTeapot node
// may still be loading, so we get the node instance asynchronously

scene.on("nodes.myRedTeapot",
    function(redTeapot) {

          // Call a setter on our node (see the setter definitions in the plugin script above)
          redTeapot.setSize({ x: 1.2 });
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

## Building
SceneJS requires nodejs. To build, simply:
```node build.js```
Then the binaries will appear in ```./build```.



