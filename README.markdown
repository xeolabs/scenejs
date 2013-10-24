## SceneJS

An extensible WebGL-based engine for high-detail 3D visualisation.

 * [SceneJS.org](http://scenejs.org)
 * [Tutorials](http://xeolabs.com/articles/)
 * [Facebook group](http://www.facebook.com/group.php?gid=350488973712)
 * [Issues](https://github.com/xeolabs/scenejs/issues)


## Downloads

 * [http://scenejs.org/api/latest/scenejs.js](http://scenejs.org/api/latest/scenejs.js)

To keep the core library small, SceneJS dynamically loads it’s non-core functionality from a directory of plugins,
 which it loads on-demand from the plugins directory within this GitHub repository.

You can hotlink to this library if you're OK with using the plugins from this repo, however you'll probably want to
serve the library and the plugins yourself.

If that's the case, then

1. get a copy of the library
2. get the [ZIP archive of plugins](http://scenejs.org/api/latest/scenejs.plugins.zip)
3. unzip that archive
4. configure SceneJS to load the plugins from those unzipped plugins, like this:

``` javascript
SceneJS.setConfigs({
    pluginPath: "./foo/myPluginsDir"
});
```

Read more in the [Quick Start tutorial](http://xeolabs.com/articles/scenejs-quick-start).

## Building
SceneJS requires nodejs, ncp and adm-zip (for Zipping the plugins directory). To build, simply:

```npm install ncp```

```npm install adm-zip```

```node build.js``

Then the binaries will appear in ```./api```.



