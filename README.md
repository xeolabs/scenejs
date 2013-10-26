## SceneJS

An extensible WebGL-based engine for high-detail 3D visualisation.

 * [SceneJS.org](http://scenejs.org)
 * [Tutorials](http://xeolabs.com/articles/)
 * [Facebook group](http://www.facebook.com/group.php?gid=350488973712)
 * [Issues](https://github.com/xeolabs/scenejs/issues)

##This fork

This fork by Lucas Doyle basically applied modern javascript development practices to the old scenejs repository. More specifically, here is what is different in this fork: 
* [Sematic Versioning](http://semver.org/) for more consistency and to play nice with other JS package managers ([bower](http://bower.io/) and [npm](https://npmjs.org/))
* A proper [package.json](https://npmjs.org/doc/json.html)
* [Grunt](http://gruntjs.com/) based builds with several build targets, including an AMD build
* A bunch of other grunt shortcuts to help development, including automated builds and browser refreshes whenever a source file changes
* SceneJS website and examples compiled with [jekyll](http://jekyllrb.com/) that play nice with [github pages](http://pages.github.com/)... it cut down ~4000 lines (see the website for this repo at [http://stonelinks.github.io/scenejs/](http://stonelinks.github.io/scenejs/))
* Website dependencies managed with [bower](http://bower.io/)
* A [Vagrant](http://www.vagrantup.com/) dev environment for developing everything above

## Downloads

 * [http://scenejs.org/api/latest/scenejs.js](http://scenejs.org/api/latest/scenejs.js)
 * [ZIP archive of plugins](http://scenejs.org/api/latest/plugins.zip)

### Using the Plugins

To keep the core library small, SceneJS dynamically loads it’s non-core functionality from a directory of plugins,
 which it loads on-demand from the plugins directory within this GitHub repository.

You can hotlink to this library if you're OK with using the plugins from this repo and don't need any plugins that
provide textures, (because those textures won't load cross-domain).

If not, then just do this:

1. get a copy of the library
2. get the [ZIP archive of plugins](http://scenejs.org/api/latest/plugins.zip)
3. unzip that archive, say to directory ```myDir```
4. configure SceneJS to load the plugins from there, like this:

``` javascript
SceneJS.setConfigs({
    pluginPath: "./myDir/plugins"
});
```

Then off you go, start building a scene:

```javascript
var myScene = SceneJS.createScene({
    // ...
});
```

Read more in the [Quick Start tutorial](http://xeolabs.com/articles/scenejs-quick-start).

## Building
SceneJS requires nodejs and ncp. To build, simply:

```npm install ncp```

```node build.js``

Then the binaries will appear in ```./api```.



