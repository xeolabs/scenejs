# SceneJS Version 2

SceneJS is a lean and fast scene graph framework for WebGL, designed to be a browser interface for model and data
visualisation systems.

Essentially, SceneJS is an optimised draw list of WebGL calls with a simple scene graph layered on top. As updates are
made to the scene graph, SceneJS dynamically rebuilds the affected portions of the draw list, while taking care of
various WebGL things like GLSL shader generation.

The SceneJS V2 API deliberately leaves out things like animation, physics and visibility culling, opting instead to
provide a lean kernel that takes care of fast rendering (and picking). This way, SceneJS is able to concentrate on
 doing that efficiently, leaving you to bolt on your own application-level code to do the rest.

Some key features:

 * JSON API
 * fast
 * automatic shader generation
 * GPU state change minimisation
 * sharable OpenSG-style node cores
 * geometry morphing
 * text
 * texture animation
 * render-to-texture
 * color, specular, glow, transparency and bump mapping
 * arbitrarily-aligned clipping planes
 * multi-layered textures
 * texture atlas support
 * render-order layers, useful for correct transparency
 * debugging modes
 * messaging system
 * IoC container
 * and more..


# Building

To build SceneJS, you'll need Java and ANT. Then at the same level as build.xml, type:

ant all

Create the "dist" directory, which will contain all the SceneJS libraries, JSDocs and examples.

If you are modifying the source code and testing it with a new example or your own project the following 
ant tasks which complete in just a couple of seconds may be helpful. These tasks do not clean the dist 
directory so previously-generated JSDocs will still available

ant package-lib

Create the "dist" directory and populate the lib directory with scenejs.js, scenejs.min.js, and the plugins and utils directories.

ant packge-examples

Create the "dist" directory and populate the lib directory and the examples directory.


# Resources

Website:
http://scenejs.org

Contributors:
http://scenejs.wikispaces.com/Contributors

Live examples:
http://scenejs.org/dist/curr/extr/examples/index.html

Wiki:
http://scenejs.wikispaces.com/

Facebook Group:
http://www.facebook.com/group.php?gid=350488973712

YouTube channel:
http://www.youtube.com/user/xeolabs

Twitter:
http://twitter.com/xeolabs

Google group:
http://groups.google.co.nz/group/scenejs?lnk=gcimh

Issue tracker:
http://bit.ly/9Cpzi0

