# SceneJS Version 2

SceneJS is a WebGL-based 3D engine geared for engineering and data visualisation, where the
priority requirement is high frame rates for thousands of individually pickable and articulated objects.

## Leaner and Meaner

To efficiently support these core requirements, SceneJS omits features such as animation, physics and
visibility culling. However, since the result is a lean kernel through which it's very efficient to update
the states of objects, it's therefore practical to integrate your choice of third-party toolkits for these tasks,
such as TweenJS, JSBullet and jsBVH.

Under the hood, SceneJS is essentially an state-optimised draw list of WebGL calls with a simple scene
graph layered on top. As updates are made to the scene graph, SceneJS dynamically rebuilds the affected
portions of the draw list, while taking care of such things as shader generation, state minimisation and
depth ordering for transparency.

## Picking Enhancements

SceneJS optimises picking for fast mouseover effects such as highlight and tooltips, which are also
common requirements in visualisation systems. It does this by retaining pick buffers for re-reading,
rewriting them only when the view changes.

SceneJS also has a fast GPU-based ray-intersect picking mode, which finds the 3D coordinates of
each mouse-object intersection, useful for user annotation of models (work in progress).

## Shared Node Cores

The *instance* nodes have been replaced with "node cores", a concept borrowed from OpenSG in which we can
define a node as having a "state core" that may be shared by other nodes of the same type. Updates to such
nodes will immediately take effect on other nodes that share the same core.

````javascript
{
    type: "library",  // Prevents traversal into children
    nodes: [

        {
            type: "geometry",
            coreId : "my-geometry-core",
            positions: [..],
            normals: [.,],
            indices: [..],
            primitive: "triangles"
        },
        {
            type: "material",
            coreId : "my-material-core",
            baseColor: { r: 1.0 }
        }
   ]
},
{
   type: "rotate",
   id: "my-rotate",
   angle: 30,
   y: 1.0,

   nodes: [
      {
         type: "material",
         id: "my-material",
         coreId: "my-material-core",
         nodes: [
            {
               type: "geometry",
               coreId: "my-geometry-core"
            }
         ]
      }
   ]
}
```

## Layer Bins

Scene nodes can be organised into layers, which are are useful for doing transparency correctly - when we have
multiple transparent objects in a scene, we can assign them to ordered layers to ensure that they are alpha-blended
in the correct order. This is to ensure that the pixels for farthest/innermost objects exist in the framebuffer,
ready for the pixels of nearer/outermost outer objects to blend with.

## Multiple Scene Graphs

Multiple scene graphs can be created within the same JavaScript runtime environment, where the nodes within each scene
can have the same IDs as nodes in the other scenes.

This makes it easy to create/update/destroy nodes across multiple scenes in parallel. For example, we could have a
different view of a model in each scene, then to animate parts of the model we can "broadcast" updates to target nodes
(eg. transform nodes) that share the same ID across the different scenes.


For an example of what can be done with SceneJS, take a look at http://biodigitalhuman.com

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

