/**
  @class SceneJS.scalarInterpolator
  @extends SceneJS.node
  <p>A scene node that interpolates within a sequence of key values, taking the <i>alpha</i> value
 from the current data scope and writing the output to a child data scope for nodes in its subgraph to
 configure themselves with.</p>
  <p><b>Example 1:</b></p><p>A cube whose rotation is animated by a SceneJS.scalarInterpolator, which is
 in turn driven by an alpha value supplied by a higher SceneJS.withData:</b></p><pre><code>
     SceneJS.withData({ alpha: 0.4 },

        SceneJS.scalarInterpolator({
            type:"linear",   // or 'cosine', 'cubic' or 'constant'
            input:"alpha",
            output:"angle",
            keys: [0.0, 0.2, 0.5, 0.7, 0.9, 1.0],
            values: [0.0, 0.0, -50.0, -50.0, 0.0, 0.0]
        },

                SceneJS.rotate(function(data) {
                    return { angle : data.get("angle"), y: 1.0 };
                },

                        SceneJS.objects.cube()
                        )
                )
        )
  </pre></code>

  @constructor
  Create a new SceneJS.scalarInterpolator
  @param {Object} config The config object, followed by zero or more child nodes

 */
SceneJS.scalarInterpolator = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {

        /* Can only configure this node type statically with an object, not with a callback
         */
        new SceneJS.exceptions.InvalidNodeConfigException(
                "SceneJS.scalarInterpolator does not support dynamic configuration with a callback");
    }

    const NOT_FOUND = 0;
    const BEFORE_FIRST = 1;
    const AFTER_LAST = 2;
    const FOUND = 3;

    return (function($) {

        /* ===========================================================================
         * Initialise
         * ==========================================================================*/

        var params = cfg.getParams();

        /* input
         */
        if (!params.input) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.NodeConfigExpectedException(
                            "SceneJS.scalarInterpolator config property expected: input"));
        }
        $._input = params.input;

        /* output
         */
        if (!params.output) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.NodeConfigExpectedException(
                            "SceneJS.scalarInterpolator config property expected: output"));
        }
        $._output = params.output;
        $._outputValue = null;

        /* keys and values
         */
        if (params.keys) {
            if (!params.values) {
                SceneJS_errorModule.fatalError(
                        new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.scalarInterpolator configuration incomplete: " +
                                "keys supplied but no values - must supply a value for each key"));
            }
        } else if (params.values) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.scalarInterpolator configuration incomplete: " +
                            "values supplied but no keys - must supply a key for each value"));
        }
        for (var i = 1; i < params.keys.length; i++) {
            if (params.keys[i - 1] >= params.keys[i]) {
                SceneJS_errorModule.fatalError(
                        new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.scalarInterpolator configuration invalid: " +
                                "two invalid keys found ("
                                        + i - 1 + " and " + i + ") - key list should contain distinct values in ascending order"));
            }
        }
        $._keys = params.keys;
        $._values = params.values;
        $._key1 = 0;
        $._key2 = 1;

        /* type
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
                                    "SceneJS.scalarInterpolator configuration invalid: minimum of four keyframes " +
                                    "required for cubic - only "
                                            + params.keys.length
                                            + " are specified"));
                }
                break;
            default:
                SceneJS_errorModule.fatalError(
                        new SceneJS.exceptions.InvalidNodeConfigException(
                                "SceneJS.scalarInterpolator configuration invalid:  type not supported - " +
                                "only 'linear', 'cosine', 'cubic' and 'constant' are supported"));
            /*


             case 'hermite':
             break;
             */
        }
        $._type = params.type;

        $._linearInterpolate = function(k) {
            var u = $._keys[$._key2] - $._keys[$._key1];
            var v = k - $._keys[$._key1];
            var w = $._values[$._key2] - $._values[$._key1];
            return $._values[$._key1] + ((v / u) * w);
        };

        $._constantInterpolate = function(k) {
            if (Math.abs((k - $._keys[$._key1])) < Math.abs((k - $._keys[$._key2]))) {
                return $._keys[$._key1];
            } else
            {
                return $._keys[$._key2];
            }
        };

        $._cosineInterpolate = function(k) {
            var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
            return ($._keys[$._key1] * (1 - mu2) + $._keys[$._key2] * mu2);
        };

        $._cubicInterpolate = function(k) {
            if ($._key1 == 0 || $._key2 == ($._keys.length - 1)) {

                /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
                 */
                return $._cosineInterpolate(k);
            }
            var y0 = $._keys[$._key1 - 1];
            var y1 = $._keys[$._key1];
            var y2 = $._keys[$._key2];
            var y3 = $._keys[$._key2 + 1];
            var mu2 = k * k;
            var a0 = y3 - y2 - y0 + y1;
            var a1 = y0 - y1 - a0;
            var a2 = y2 - y0;
            var a3 = y1;
            return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
        };

        $._findEnclosingFrame = function(key) {
            if ($._keys.length == 0) {
                return NOT_FOUND;
            }
            if (key < $._keys[0]) {
                return BEFORE_FIRST;
            }
            if (key > $._keys[$._keys.length - 1]) {
                return AFTER_LAST;
            }
            while ($._keys[$._key1] > key) {
                $._key1--;
                $._key2--;
            }
            while ($._keys[$._key2] < key) {
                $._key1++;
                $._key2++;
            }
            return FOUND;
        };

        $._interpolate = function(k) {
            switch ($._type) {
                case 'linear':
                    return $._linearInterpolate(k);
                case 'cosine':
                    return $._cosineInterpolate(k);
                case 'cubic':
                    return $._cubicInterpolate(k);
                case 'constant':
                    return $._constantInterpolate(k);
                default:
                    SceneJS_errorModule.fatalError(
                            "SceneJS.scalarInterpolator internal error - interpolation type not switched: '"
                                    + $._type + "'");
            }
        };

        $._update = function(key) {
            switch ($._findEnclosingFrame(key)) {
                case NOT_FOUND:
                    break;
                case BEFORE_FIRST:
                    break; // time delay before interpolation begins
                case AFTER_LAST:
                    $._outputValue = $._values[$._values.length - 1];
                    break;
                case FOUND:
                    $._outputValue = $._interpolate((key));
                    break;
                default:
                    break;
            }
        };

        $._render = function(traversalContext, data) {
            var key = data.get($._input);
            if (key == undefined || key == null) {
                SceneJS_errorModule.fatalError(
                        new SceneJS.exceptions.DataExpectedException(
                                "SceneJS.scalarInterpolator failed to find input on data: '" + params.input + "'"));
            }
            $._update(key);

            var childData = SceneJS._utils.newScope(data, cfg.fixed);
            childData.put(params.output, $._outputValue);

            $._renderChildren(traversalContext, childData);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};




