SceneJs.scalarInterpolator = function() {
    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var NOT_FOUND = 0;
    var BEFORE_FIRST = 1;
    var AFTER_LAST = 2;
    var FOUND = 3;

    return function(scope) {
        var params = cfg.getParams(scope);

        // Validate

        if (!params.input) {
            throw 'scalarInterpolator input parameter missing';
        }
        if (typeof(params.input) != 'function') {
            throw 'scalarInterpolator input parameter should be a function';
        }

        if (!params.output) {
            throw 'scalarInterpolator output parameter missing';
        }
        if (typeof(params.output) != 'function') {
            throw 'scalarInterpolator apply parameter should be a function';
        }
        if (params.keys) {
            if (!params.values) {
                throw 'scalarInterpolator keys supplied but no values - must supply a value for each key';
            }
        } else if (params.values) {
            throw 'scalarInterpolator values supplied but no keys - must supply a key for each value';
        }
        for (var i = 1; i < params.keys.length; i++) {
            if (params.keys[i - 1] >= params.keys[i]) {
                throw 'two invalid scalarInterpolator keys found (' + i - 1 + ' and ' + i + ') - key list should contain distinct values in ascending order';
            }
        }

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
                    throw 'Minimum of four keyframes required for cubic scalarInterpolation - only '
                            + params.keys.length
                            + ' are specified';
                }
                break;
            default:
                throw 'scalarInterpolator type not supported - only "linear", "cosine", "cubic" and "constant" are supported';
            /*


             case 'hermite':
             break;
             */

        }

        var key;
        try {
            key = params.input.call(this, scope);
        } catch (e) {
            throw 'Error calling scalarInterpolator input function - is the fuction correct?';
        }

        var key1 = params.keys[0];
        var key2 = params.keys[1];

        var linearInterpolate = function(k) {
            var u = params.keys[key2] - params.keys[key1];
            var v = k - params.keys[key1];
            var w = params.values[key2] - params.values[key1];
            return params.values[key1] + ((v / u) * w);
        } ;

        var constantInterpolate = function(k) {
            if (Math.abs((k - params.keys[key1])) < Math.abs((k - params.keys[key2]))) {
                return params.keys[key1];
            } else
            {
                return params.keys[key2];
            }
        };

        var cosineInterpolate = function(k) {
            var mu2 = (1 - Math.cos(k * Math.PI()) / 2.0);
            return (params.keys[key1] * (1 - mu2) + params.keys[key2] * mu2);
        };

        var cubicInterpolate = function(k) {
            if (key1 == 0 || key2 == (params.keys.length - 1)) {
                /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
                 */
                return cosineInterpolate(k);
            }
            var y0 = params.keys[key1 - 1];
            var y1 = params.keys[key1];
            var y2 = params.keys[key2];
            var y3 = params.keys[key2 + 1];
            var mu2 = k * k;
            var a0 = y3 - y2 - y0 + y1;
            var a1 = y0 - y1 - a0;
            var a2 = y2 - y0;
            var a3 = y1;
            return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
        };

        var findEnclosingFrame = function(key) {
            if (params.keys.length == 0) {
                return NOT_FOUND;
            }
            if (key < params.keys[0]) {
                return BEFORE_FIRST;
            }
            if (key > params.keys[params.keys.length - 1]) {
                return AFTER_LAST;
            }
            while (params.keys[key1] > key) {
                key1--;
                key2--;
            }
            while (params.keys[key2] < key) {
                key1++;
                key2++;
            }
            return FOUND;
        } ;

        var interpolate = function(k) {
            switch (params.type) {
                case 'linear':
                    return linearInterpolate(k);
                case 'cosine':
                    return cosineInterpolate(k);
                case 'cubic':
                    return cubicInterpolate(k);
                case 'constant':
                    return constantInterpolate(k);
                default:
                    throw 'internal error - interpolation type not switched: "' + params.type + "'";
            }
        };

        var outputValue = function(v) {
            try {
              params.output.call(this, scope, v);    // TODO : scope should be subscope for child nodes!
            } catch (e) {
                throw 'Error calling scalarInterpolator output function - is the function correct?';
            }
        };

        var update = function() {
            switch (findEnclosingFrame(key)) {
                case NOT_FOUND:
                    break;
                case BEFORE_FIRST:
                    break; // time delay before interpolation begins
                case AFTER_LAST:
                    outputValue(params.values[params.values.length - 1]);
                    break;
                case FOUND:
                    outputValue(interpolate((key)));
                    break;
                default:
                    break;
            }
        };

        update();

        SceneJs.utils.visitChildren(cfg, scope, true); // Create new scopes for children
    };
};




