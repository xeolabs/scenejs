(function(root, factory) {

  // Set up SceneJS appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global SceneJS.
      root.SceneJS = factory(root, exports);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

  // Finally, as a browser global.
  } else {
    root.SceneJS = factory(root, {});
  }
  
}(this, function(root, SceneJS) {

