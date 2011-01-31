# SceneJS

SceneJS is a concise, fast and flexible scene graph framework for WebGL, targeted to be a browser interface
for model and data visualisation systems.

Some key features:

 * flexible JSON API for scene graph create/update/query
 * messaging system for peer-to-peer commands to the JSON API
 * automatic GLSL generation - fully encapsulated
 * IoC container
 * GL state sorting
 * bounding boxes
 * LOD
 * flexible data flows
 * interpolated animation
 * branching
 * instancing
 * animated textures
 * multimaterials
 * debugging modes
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

