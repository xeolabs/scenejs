/**
 */
(function() {

    /**
     Defines fog within a scene.
     @class SceneJS.fog
     @extends SceneJS.node
     */
    SceneJS.fog = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        return SceneJS._utils.createNode(
                "fog",
                cfg.children,

                new (function() {
                    this._errorBackend = SceneJS._backends.getBackend('error');
                    this._fogBackend = SceneJS._backends.getBackend('fog');

                    this._mode = "linear";
                    this._color = { r: 0.5, g: 0.5, b: 0.5 };
                    this._density = 1.0;
                    this._start = 0;
                    this._end = 0;

                    /**
                     Sets the fogging mode
                     @function setMode
                     @param {string} mode - "disabled", "exp", "exp2" or "linear"
                     @returns {SceneJS.fog} This fog node
                     */
                    this.setMode = function(mode) {
                        if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
                            this._errorBackend.fatalError(new SceneJS.exceptions.InvalidNodeConfigException(
                                    "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'none', 'exp', 'exp2' or 'linear'"));
                        }
                        this._mode = mode;
                        return this;
                    };

                    /**
                     Returns fogging mode
                     @function {string} getMode
                     @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
                     */
                    this.getMode = function() {
                        return this._mode;
                    };

                    /**
                     Sets the fog color
                     @function setColor
                     @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
                     @returns {SceneJS.fog} This fog node
                     */
                    this.setColor = function(color) {
                        this._color.r = color.r != undefined ? color.r : 0.5;
                        this._color.g = color.g != undefined ? color.g : 0.5;
                        this._color.b = color.b != undefined ? color.b : 0.5;
                        return this;
                    };

                    /**
                     Returns the fog color
                     @function getColor
                     @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
                     */
                    this.getColor = function() {
                        return {
                            r: this._color.r,
                            g: this._color.g,
                            b: this._color.b
                        };
                    };

                    /**
                     Sets the fog density
                     @function setDensity
                     @param {int} density - density factor
                     @returns {SceneJS.fog} This fog node
                     */
                    this.setDensity = function(density) {
                        this._density = density || 1.0;
                        return this;
                    };

                    /**
                     Returns the fog density
                     @function {double} getDensity
                     @returns {double} Fog density factor
                     */
                    this.getDensity = function() {
                        return this._density;
                    };

                    /**
                     Sets the near point on the Z view-axis at which fog begins
                     @function setStart
                     @param {double} start - location on Z-axis
                     @returns {SceneJS.fog} This fog node
                     */
                    this.setStart = function(start) {
                        this._start = start || 0;
                        return this;
                    };

                    /**
                     Returns the near point on the Z view-axis at which fog begins
                     @function {double} getStart
                     @returns {double} Position on Z view axis
                     */
                    this.getStart = function() {
                        return this._start;
                    };

                    /**
                     Sets the farr point on the Z view-axis at which fog ends
                     @function setEnd
                     @param {double} end - location on Z-axis
                     @returns {SceneJS.fog} This fog node
                     */
                    this.setEnd = function(end) {
                        this._end = end || 0;
                        return this;
                    };

                    /**
                     Returns the far point on the Z view-axis at which fog ends
                     @function {double} getEnd
                     @returns {double} Position on Z view axis
                     */
                    this.getEnd = function() {
                        return this._end;
                    };

                    this._init = function(params) {
                        if (params.mode) {
                            this.setMode(params.mode);
                        }
                        if (params.color) {
                            this.setColor(params.color);
                        }
                        if (params.density) {
                            this.setDensity(params.density);
                        }
                        if (params.start) {
                            this.setStart(params.start);
                        }
                        if (params.end) {
                            this.setEnd(params.end);
                        }
                    };

                    if (cfg.fixed) {
                        this._init(cfg.getParams());
                    }

                    this._render = function(traversalContext, data) {
                        if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                            SceneJS._utils.visitChildren(cfg, traversalContext, data);
                        } else {
                            if (!cfg.fixed) {
                                this._init(cfg.getParams(data));
                            }
                            var f = this._fogBackend.getFog();
                            this._fogBackend.setFog({
                                mode: this._mode,
                                color: this._color,
                                density: this._density,
                                start: this._start,
                                end: this._end
                            });
                            this._renderChildren(traversalContext, data);
                            this._fogBackend.setFog(f);
                        }
                    };
                })());
    };
})();
