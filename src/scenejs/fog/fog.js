/**
 * @class SceneJS.fog
 * @extends SceneJS.node
 * <p>Defines fog within a scene. Fog is effectively a region on the Z-axis of the view coordinate system within which
 * the colour of elements will blend with the scene ambient colour in proportion to their depth. You can define the
 * points on the Z axis at which the fog region starts and ends, along with the proportion as a linear, exponential
 * or quadratic mode. Scene content falling in front of the start point will have no fog applied, while content
 * after the end point will be invisible, having blended completely into the ambient colour.</p>
 * <p><b>Example 1 (functionally composed style):</b></p><p>Defining light-gray linear fog for sub-nodes,
 * starting at Z=50, extending until Z=400. Objects beyond Z=400 will be entirely merged into the background.</b></p><pre><code>
 *   SceneJS.fog({
 *        mode:"linear",
 *        color: { r: 0.6, g: 0.6, b: 0.6 },
 *        start: 50,
 *        end: 400
 *   },
 *         //...child nodes
 * </pre></code>
 *
 * @constructor
 * Create a new SceneJS.fog
 * @param {Object} The config object or function, followed by zero or more child nodes
 */
SceneJS.fog = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Augment the basic node type
     */
    return (function($) {
        $._mode = "linear";
        $._color = { r: 0.5, g: 0.5, b: 0.5 };
        $._density = 1.0;
        $._start = 0;
        $._end = 0;

        /**
         Sets the fogging mode
         @function setMode
         @param {string} mode - "disabled", "exp", "exp2" or "linear"
         @returns {SceneJS.fog} This fog node
         */
        $.setMode = function(mode) {
            if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException(
                        "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'none', 'exp', 'exp2' or 'linear'"));
            }
            $._mode = mode;
            return $;
        };

        /**
         Returns fogging mode
         @function {string} getMode
         @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
         */
        $.getMode = function() {
            return $._mode;
        };

        /**
         Sets the fog color
         @function setColor
         @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
         @returns {SceneJS.fog} This fog node
         */
        $.setColor = function(color) {
            $._color.r = color.r != undefined ? color.r : 0.5;
            $._color.g = color.g != undefined ? color.g : 0.5;
            $._color.b = color.b != undefined ? color.b : 0.5;
            return $;
        };

        /**
         Returns the fog color
         @function getColor
         @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
         */
        $.getColor = function() {
            return {
                r: $._color.r,
                g: $._color.g,
                b: $._color.b
            };
        };

        /**
         Sets the fog density
         @function setDensity
         @param {int} density - density factor
         @returns {SceneJS.fog} This fog node
         */
        $.setDensity = function(density) {
            $._density = density || 1.0;
            return $;
        };

        /**
         Returns the fog density
         @function {double} getDensity
         @returns {double} Fog density factor
         */
        $.getDensity = function() {
            return $._density;
        };

        /**
         Sets the near point on the Z view-axis at which fog begins
         @function setStart
         @param {double} start - location on Z-axis
         @returns {SceneJS.fog} This fog node
         */
        $.setStart = function(start) {
            $._start = start || 0;
            return $;
        };

        /**
         Returns the near point on the Z view-axis at which fog begins
         @function {double} getStart
         @returns {double} Position on Z view axis
         */
        $.getStart = function() {
            return $._start;
        };

        /**
         Sets the farr point on the Z view-axis at which fog ends
         @function setEnd
         @param {double} end - location on Z-axis
         @returns {SceneJS.fog} This fog node
         */
        $.setEnd = function(end) {
            $._end = end || 0;
            return $;
        };

        /**
         Returns the far point on the Z view-axis at which fog ends
         @function {double} getEnd
         @returns {double} Position on Z view axis
         */
        $.getEnd = function() {
            return $._end;
        };

        $._init = function(params) {
            if (params.mode) {
                $.setMode(params.mode);
            }
            if (params.color) {
                $.setColor(params.color);
            }
            if (params.density) {
                $.setDensity(params.density);
            }
            if (params.start) {
                $.setStart(params.start);
            }
            if (params.end) {
                $.setEnd(params.end);
            }
        };

        if (cfg.fixed) {
            $._init(cfg.getParams());
        }

        $._render = function(traversalContext, data) {
            if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                $._renderChildren(traversalContext, data);
            } else {
                if (!cfg.fixed) {
                    $._init(cfg.getParams(data));
                }
                var f = SceneJS_fogModule.getFog();
                SceneJS_fogModule.setFog({
                    mode: $._mode,
                    color: $._color,
                    density: $._density,
                    start: $._start,
                    end: $._end
                });
                $._renderChildren(traversalContext, data);
                SceneJS_fogModule.setFog(f);
            }
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};
