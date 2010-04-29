/**
 * @class SceneJS.scalarInterpolator
 * @extends SceneJS.Node
 * <p>A scene node that interpolates within a sequence of key values, taking an <i>alpha</i> value
 * from the current data scope and writing the output to a child data scope for nodes in its subgraph to
 * configure themselves with.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-scalarinterpolator-example">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>This example defines a cube with rotation that is animated by a SceneJS.ScalarInterpolator, which is
 * in turn driven by an alpha value supplied by a higher SceneJS.WithData. If we thought of <em>alpha</em> as
 * elapsed seconds, then this cube will rotate 360 degrees over one second, then rotate 180 in the reverse direction
 * over the next 0.5 seconds. In this example however, the alpha is actually fixed, where the cube is stuck at
 * 180 degrees - you would need to vary the "alpha" property on the WithData node to actually animate it.</p><pre><code>
 * var wd = new SceneJS.WithData({ "alpha" : 0.5 }, // Interpolates the rotation to 180 degrees
 *
 *      new SceneJS.ScalarInterpolator({
 *              type:"linear",   // or 'cosine', 'cubic' or 'constant'
 *              input:"alpha",
 *              output:"angle",
 *              keys: [0.0, 1.0, 1.5],
 *              values: [0.0, 360.0, 180.0]
 *          },
 *
 *          new SceneJS.Rotate(function(data) {
 *                 return { angle : data.get("angle"), y: 1.0 };
 *              },
 *
 *                  new SceneJS.objects.Cube()
 *              )
 *          )
 *      )
 *
 *  // Bump the rotation along a notch:
 *
 *  wd.setProperty("alpha", 0.6);
 *
 *  </pre></code>
 *
 * @constructor
 * Create a new SceneJS.ScalarInterpolator
 * @param {Object} config The config object, followed by zero or more child nodes
 *
 */
SceneJS.ScalarInterpolator = function() {
    SceneJS.Node.apply(this, arguments);
    this._input = null;
    this._output = null;
    this._outputValue = null;
    this._keys = null;
    this._values = null;
    this._key1 = 0;
    this._key2 = 0;
    this._type = null;
};

SceneJS._utils.inherit(SceneJS.ScalarInterpolator, SceneJS.Node);

/* ScalarInterpolator attempts to track the pair of keys that enclose the current alpha value -
 * these are the node's current states with regard to that:
 */
SceneJS.ScalarInterpolator.prototype._NOT_FOUND = 0;        // Alpha outside of key sequence
SceneJS.ScalarInterpolator.prototype._BEFORE_FIRST = 1;     // Alpha before first key
SceneJS.ScalarInterpolator.prototype._AFTER_LAST = 2;       // Alpha after last key
SceneJS.ScalarInterpolator.prototype._FOUND = 3;            // Found keys before and after alpha

SceneJS.ScalarInterpolator.prototype._linearInterpolate = function(k) {
    var u = this._keys[this._key2] - this._keys[this._key1];
    var v = k - this._keys[this._key1];
    var w = this._values[this._key2] - this._values[this._key1];
    return this._values[this._key1] + ((v / u) * w);
};

SceneJS.ScalarInterpolator.prototype._constantInterpolate = function(k) {
    if (Math.abs((k - this._keys[this._key1])) < Math.abs((k - this._keys[this._key2]))) {
        return this._keys[this._key1];
    } else {
        return this._keys[this._key2];
    }
};

SceneJS.ScalarInterpolator.prototype._cosineInterpolate = function(k) {
    var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
    return (this._keys[this._key1] * (1 - mu2) + this._keys[this._key2] * mu2);
};

SceneJS.ScalarInterpolator.prototype._cubicInterpolate = function(k) {
    if (this._key1 == 0 || this._key2 == (this._keys.length - 1)) {

        /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
         */
        return this._cosineInterpolate(k);
    }
    var y0 = this._keys[this._key1 - 1];
    var y1 = this._keys[this._key1];
    var y2 = this._keys[this._key2];
    var y3 = this._keys[this._key2 + 1];
    var mu2 = k * k;
    var a0 = y3 - y2 - y0 + y1;
    var a1 = y0 - y1 - a0;
    var a2 = y2 - y0;
    var a3 = y1;
    return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
};

SceneJS.ScalarInterpolator.prototype._findEnclosingFrame = function(key) {
    if (this._keys.length == 0) {
        return this._NOT_FOUND;
    }
    if (key < this._keys[0]) {
        return this._BEFORE_FIRST;
    }
    if (key > this._keys[this._keys.length - 1]) {
        return this._AFTER_LAST;
    }
    while (this._keys[this._key1] > key) {
        this._key1--;
        this._key2--;
    }
    while (this._keys[this._key2] < key) {
        this._key1++;
        this._key2++;
    }
    return this._FOUND;
};

SceneJS.ScalarInterpolator.prototype._interpolate = function(k) {
    switch (this._type) {
        case 'linear':
            return this._linearInterpolate(k);
        case 'cosine':
            return this._cosineInterpolate(k);
        case 'cubic':
            return this._cubicInterpolate(k);
        case 'constant':
            return this._constantInterpolate(k);
        default:
            SceneJS_errorModule.fatalError(
                    "SceneJS.ScalarInterpolator internal error - interpolation type not switched: '"
                            + this._type + "'");
    }
};

SceneJS.ScalarInterpolator.prototype._update = function(key) {
    switch (this._findEnclosingFrame(key)) {
        case this._NOT_FOUND:
            break;
        case this._BEFORE_FIRST:
            break; // time delay before interpolation begins
        case this._AFTER_LAST:
            this._outputValue = this._values[this._values.length - 1];
            break;
        case this._FOUND:
            this._outputValue = this._interpolate((key));
            break;
        default:
            break;
    }
};

SceneJS.ScalarInterpolator.prototype._init = function(params) {

    /* Name of input property in data scope
     */
    if (!params.input) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.NodeConfigExpectedException(
                        "SceneJS.ScalarInterpolator config property expected: input"));
    }
    this._input = params.input;

    /* Name of output property on child data scope
     */
    if (!params.output) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.NodeConfigExpectedException(
                        "SceneJS.ScalarInterpolator config property expected: output"));
    }
    this._output = params.output;
    this._outputValue = null;

    /* Keys and values
     */
    if (params.keys) {
        if (!params.values) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration incomplete: " +
                            "keys supplied but no values - must supply a value for each key"));
        }
    } else if (params.values) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.InvalidNodeConfigException(
                        "SceneJS.ScalarInterpolator configuration incomplete: " +
                        "values supplied but no keys - must supply a key for each value"));
    }
    for (var i = 1; i < params.keys.length; i++) {
        if (params.keys[i - 1] >= params.keys[i]) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration invalid: " +
                            "two invalid keys found ("
                                    + i - 1 + " and " + i + ") - key list should contain distinct values in ascending order"));
        }
    }
    this._keys = params.keys;
    this._values = params.values;
    this._key1 = 0;
    this._key2 = 1;

    /* Interpolation type
     */
    params.type = params.type || 'linear';
    switch (params.type) {
        case 'linear':
            break;
        case 'constant':
            break;
        case 'cosine':
            break;
        case 'cubic':
            if (params.keys.length < 4) {
                SceneJS_errorModule.fatalError(
                        new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.ScalarInterpolator configuration invalid: minimum of four keyframes " +
                                "required for cubic - only "
                                        + params.keys.length
                                        + " are specified"));
            }
            break;
        default:
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration invalid:  type not supported - " +
                            "only 'linear', 'cosine', 'cubic' and 'constant' are supported"));
        /*


         case 'hermite':
         break;
         */
    }
    this._type = params.type;
};

SceneJS.ScalarInterpolator.prototype._render = function(traversalContext, data) {
    if (!this.type) {
        /* Allow one-shot dynamic config
         */
        this._init(this._getParams(data));
    }
    var key = data.get(this._input);
    if (key == undefined || key == null) {
        SceneJS_errorModule.fatalError(
                new SceneJS.exceptions.DataExpectedException(
                        "SceneJS.ScalarInterpolator failed to find input on data: '" + params.input + "'"));
    }
    this._update(key);
    var isFixed = true;
    var childData = SceneJS._utils.newScope(data, isFixed);
    childData.put(this._output, this._outputValue);
    this._renderNodes(traversalContext, childData);
};


/** Function wrapper to support functional scene definition
 */
SceneJS.scalarInterpolator = function() {
    var n = new SceneJS.ScalarInterpolator();
    SceneJS.ScalarInterpolator.prototype.constructor.apply(n, arguments);
    return n;
};





