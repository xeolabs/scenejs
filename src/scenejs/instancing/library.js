/**
 * @class A scene node that marks its subgraph as a library, causing traversal to bypass it.
 *
 * <p>Use these to hold nodes that are to be instanced with {@link SceneJS.Instance}.</p>

 * <p><b>Example Usage</b></p><p>Here we're defining some nodes within a {@link SceneJS.Library}, then instantiating
 * them. Note that the nodes don't neccessarily have to be within a {@link SceneJS.Library}, but this way we ensure that
 * they are only rendered when instantiated:</b></p><pre><code>
 * var scene = new SceneJS.Scene(
 *
 *      // ...
 *
 *      new SceneJS.Library(
 *
 *          new SceneJS.Material({
 *                  id: "red-rotated-teapot",
 *                  baseColor: { r: 1.0 }
 *              },
 *              new SceneJS.Rotate({
 *                      id: "rotated-teapot",
 *                      angle: 45,
 *                      y: 1.0
 *                  },
 *                  new SceneJS.Teapot({
 *                           id: "teapot"
 *                       })))),
 *
 *      // Instantiate each library node:
 *
 *      new SceneJS.Instance({ target: "red-rotated-teapot" });
 *      new SceneJS.Instance({ target: "rotated-teapot" });
 *      new SceneJS.Instance({ target: "teapot" });
 *
 *      // ...
 * );
 * </pre></code>
 *  @extends SceneJS.Node
 * @since Version 0.7.4
 * @constructor
 * Create a new SceneJS.Library
 * @param {Object} [cfg] Static configuration object
 * @param {String} [cfg.name="unnamed"]
 * @param {function(SceneJS.Data):Object} [fn] Dynamic configuration function
 * @param {...SceneJS.Node} [childNodes] Child nodes
 * @returns {SceneJS.Instance}
 */
SceneJS.Library = SceneJS.createNodeType("library");

// @private
SceneJS.Library.prototype._compile = function() {

    /* Bypass child nodes
     */
};

