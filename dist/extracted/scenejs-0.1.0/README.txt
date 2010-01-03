SceneJS - A JavaScript framework for building scene graphs on the WebGL canvas
==============================================================================

January 2, 2010

Author: Lindsay Kay, lindsay.stanley.kay AT gmail.com
Project home: http://www.scenejs.com
GitHub: http://github.com/xeolabs/scenejs

Contents
--------
This is a first rough cut of SceneJS, with some basic features to get the
ball rolling, such as:

    - basic Phong shading
    - scene data scopes
    - procedural scene generation
    - multiple canvases, viewports and views per scene
    - a couple of pre-rolled geometry primitives, eg. cube and teapot

You'll also find a few basic examples in here that will show you the core
essentials.

Enabling WebGL
--------------
You must have a WebGL-enabled browser to use SceneJS. WebGL is currently under
development, and is supported in the latest builds of several browsers. You can
find instructions on how to obtain a copy of a browser supporting the provisional
WebGL specification at:

http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation

Pretty soon, browsers will have WebGL built in and you won't have to manually
enable it.

Notes on Efficiency
-------------------
All matrix math in this release is done with the bundled Sylvester Vector and
Matrix Math Library. Although it's very elegant, Sylvester is not fast so it's
only going to be in there for these early development versions. Future versions
of SceneJS will contain an optimised native matrix math module, so expect a HUGE
efficiency increase then.

Find Sylvester at: http://sylvester.jcoglan.com/

SceneJS will also get faster as more intelligent memoisation strategies are
discovered - stay tuned!

Drop me a line if you find any bugs, or have some ideas for cool features.


