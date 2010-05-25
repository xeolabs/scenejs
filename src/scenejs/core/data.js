/**
 * @class Data scope that is passed as the single argument to the callback function that many scene node classes may be
 * dynamically configured through.
 * <p>These are created whenever data is generated within a scene graph, to transport the data down to sub-nodes.</p>
 * <p>Methods and nodes that create instances of these include {@link SceneJS.Scene#render}, {@link SceneJS.WithData} and
 * {@link SceneJS.ScalarInterpolator}.</p>.
 * <p><b>Example:</b></p><p>The example below shows how nested creation of these will form a linked chain of data scopes.
 * The outer {@link SceneJS.WithData} node creates one SceneJS.Data with "sizeX" and "sizeY" properties, then the inner
 * {@link SceneJS.WithData} chains another SceneJS.Data to that, containing a "sizeZ" property. The dynamic config
 * callback on the {@link SceneJS.Scale} node then hunts up the chain to get each of the properties for the
 * configuration object it generates.</b></p><pre><code>
 *
 * var wd new SceneJS.WithData({
 *          sizeX: 5,
 *          sizeY: 6
 *      },
 *      new SceneJS.Translate({ x: 100 },
 *
 *          var wd new SceneJS.WithData({
 *              sizeZ: 2
 *          },
 *          new SceneJS.Scale(function(data) {        // Here's our SceneJS.Data object
 *                   return {
 *                       x: data.get("sizeX"),
 *                       y: data.get("sizeY"),
 *                       z: data.get("sizeZ")
 *                   }
 *          },
 *
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 * </code></pre>
 *
 */
SceneJS.Data = function(_parent, _fixed, _data) {
    this._parent = _parent;
    this._data = _data || {};
    this._fixed = _fixed || (_parent ? _parent._fixed : false);

    /** Hunts up the data scope chain to get the property with the given key, getting it off the
     * first data scope that has it.
     * @param {String} key Name of property
     * @returns {Object} The property
     */
    this.get = function(key) {
        var value = this._data[key];
        if ((value == 0) || value) {
            return value;
        }
        if (!this._parent) {
            return null;
        }
        return this._parent.get(key);
    };

    /**
     * Returns true if all data on the scope chain is fixed, ie. will not change between scene graph traversals.
     * @returns {boolean}
     */
    this.isFixed = function() {
        return this._fixed;
    };
};
