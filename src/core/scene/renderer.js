new (function () {

    /**
     * The default state core singleton for {@link SceneJS.Renderer} nodes
     */
    var defaultCore = {
        type: "renderer",
        stateId: SceneJS._baseStateId++,
        props: null
    };

    var canvas;         // Currently active canvas
    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {

            canvas = params.engine.canvas;

//                // TODO: Below is a HACK
//
//                defaultCore.props = createProps({  // Dont set props - just define for restoring to on props pop
//                    clear: {
//                        depth : true,
//                        color : true
//                    },
//                    // clearColor: {r: 0, g : 0, b : 0 },
//                    clearDepth: 1.0,
//                    enableDepthTest:true,
//                    enableCullFace: false,
//                    frontFace: "ccw",
//                    cullFace: "back",
//                    depthFunc: "less",
//                    depthRange: {
//                        zNear: 0,
//                        zFar: 1
//                    },
//                    enableScissorTest: false,
//                    viewport:{
//                        x : 1,
//                        y : 1,
//                        width: canvas.canvas.width,
//                        height: canvas.canvas.height
//                    },
//                    enableClip: undefined,
//                    enableBlend: false,
//                    blendFunc: {
//                        sfactor: "srcAlpha",
//                        dfactor: "one"
//                    }
//                });

            stackLen = 0;

            params.engine.display.renderer = coreStack[stackLen++] = defaultCore;
        });

    function createProps(props) {

        var restore;
        if (stackLen > 0) {  // can't restore when no previous props set
            restore = {};
            for (var name in props) {
                if (props.hasOwnProperty(name)) {
                    if (!(props[name] == undefined)) {
                        restore[name] = getSuperProperty(name);
                    }
                }
            }
        }

        processProps(props.props);

        return {

            props: props,

            setProps: function (gl) {
                setProperties(gl, props);
            },

            restoreProps: function (gl) {
                if (restore) {
                    restoreProperties(gl, restore);
                }
            }
        };
    }

    var getSuperProperty = function (name) {
        var props;
        var prop;
        for (var i = stackLen - 1; i >= 0; i--) {
            props = coreStack[i].props;
            if (props) {
                prop = props[name];
                if (prop != undefined && prop != null) {
                    return props[name];
                }
            }
        }
        return null; // Cause default to be set
    };

    function processProps(props) {
        var prop;
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                prop = props[name];
                if (prop != undefined && prop != null) {
                    if (glModeSetters[name]) {
                        props[name] = glModeSetters[name](null, prop);
                    } else if (glStateSetters[name]) {
                        props[name] = glStateSetters[name](null, prop);
                    }
                }
            }
        }
    }

    var setProperties = function (gl, props) {

        for (var key in props) {        // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                var setter = glModeSetters[key];
                if (setter) {
                    setter(gl, props[key]);
                }
            }
        }

        if (props.viewport) {           // Set order-sensitive properties (states)
            glStateSetters.viewport(gl, props.viewport);
        }

        if (props.scissor) {
            glStateSetters.clear(gl, props.scissor);
        }

        if (props.clear) {
            glStateSetters.clear(gl, props.clear);
        }
    };

    /**
     * Restores previous renderer properties, except for clear - that's the reason we
     * have a seperate set and restore semantic - we don't want to keep clearing the buffer.
     */
    var restoreProperties = function (gl, props) {

        var value;

        for (var key in props) {            // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                value = props[key];
                if (value != undefined && value != null) {
                    var setter = glModeSetters[key];
                    if (setter) {
                        setter(gl, value);
                    }
                }
            }
        }

        if (props.viewport) {               //  Set order-sensitive properties (states)
            glStateSetters.viewport(gl, props.viewport);
        }

        if (props.scissor) {
            glStateSetters.clear(gl, props.scissor);
        }
    };


    /**
     * Maps renderer node properties to WebGL gl enums
     * @private
     */
    var glEnum = function (gl, name) {
        if (!name) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Null SceneJS.State node config: \"" + name + "\"");
        }
        var result = SceneJS._webgl.enumMap[name];
        if (!result) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Unrecognised SceneJS.State node config value: \"" + name + "\"");
        }
        var value = gl[result];
        if (!value) {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
        }
        return value;
    };


    /**
     * Order-insensitive functions that set WebGL modes ie. not actually causing an
     * immediate change.
     *
     * These map to renderer properties and are called in whatever order their
     * property is found on the renderer config.
     *
     * Each of these wrap a state-setter function on the WebGL gl. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * When called with undefined/null gl, will condition and return the value given
     * ie. set it to default if value is undefined. When called with a gl, will
     * set the value on the gl using the wrapped function.
     *
     * @private
     */
    var glModeSetters = {

        enableBlend: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = false;
                }
                return flag;
            }
            if (flag) {
                gl.enable(gl.BLEND);
            } else {
                gl.disable(gl.BLEND);
            }
        },

        blendColor: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            gl.blendColor(color.r, color.g, color.b, color.a);
        },

        blendEquation: function (gl, eqn) {
            if (!gl) {
                return eqn || "funcAdd";
            }
            gl.blendEquation(gl, glEnum(gl, eqn));
        },

        /** Sets the RGB blend equation and the alpha blend equation separately
         */
        blendEquationSeparate: function (gl, eqn) {
            if (!gl) {
                eqn = eqn || {};
                return {
                    rgb: eqn.rgb || "funcAdd",
                    alpha: eqn.alpha || "funcAdd"
                };
            }
            gl.blendEquation(glEnum(gl, eqn.rgb), glEnum(gl, eqn.alpha));
        },

        blendFunc: function (gl, funcs) {
            if (!gl) {
                funcs = funcs || {};
                return  {
                    sfactor: funcs.sfactor || "srcAlpha",
                    dfactor: funcs.dfactor || "oneMinusSrcAlpha"
                };
            }
            gl.blendFunc(glEnum(gl, funcs.sfactor || "srcAlpha"), glEnum(gl, funcs.dfactor || "oneMinusSrcAlpha"));
        },

        blendFuncSeparate: function (gl, func) {
            if (!gl) {
                func = func || {};
                return {
                    srcRGB: func.srcRGB || "zero",
                    dstRGB: func.dstRGB || "zero",
                    srcAlpha: func.srcAlpha || "zero",
                    dstAlpha: func.dstAlpha || "zero"
                };
            }
            gl.blendFuncSeparate(
                glEnum(gl, func.srcRGB || "zero"),
                glEnum(gl, func.dstRGB || "zero"),
                glEnum(gl, func.srcAlpha || "zero"),
                glEnum(gl, func.dstAlpha || "zero"));
        },

        clearColor: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            gl.clearColor(color.r, color.g, color.b, color.a);
        },

        clearDepth: function (gl, depth) {
            if (!gl) {
                return (depth == null || depth == undefined) ? 1 : depth;
            }
            gl.clearDepth(depth);
        },

        clearStencil: function (gl, clearValue) {
            if (!gl) {
                return  clearValue || 0;
            }
            gl.clearStencil(clearValue);
        },

        colorMask: function (gl, color) {
            if (!gl) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };

            }
            gl.colorMask(color.r, color.g, color.b, color.a);
        },

        enableCullFace: function (gl, flag) {
            if (!gl) {
                return flag;
            }
            if (flag) {
                gl.enable(gl.CULL_FACE);
            } else {
                gl.disable(gl.CULL_FACE);
            }
        },

        cullFace: function (gl, mode) {
            if (!gl) {
                return mode || "back";
            }
            gl.cullFace(glEnum(gl, mode));
        },

        enableDepthTest: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            if (flag) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
        },

        depthFunc: function (gl, func) {
            if (!gl) {
                return func || "less";
            }
            gl.depthFunc(glEnum(gl, func));
        },

        enableDepthMask: function (gl, flag) {
            if (!gl) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            gl.depthMask(flag);
        },

        depthRange: function (gl, range) {
            if (!gl) {
                range = range || {};
                return {
                    zNear: (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
                    zFar: (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
                };
            }
            gl.depthRange(range.zNear, range.zFar);
        },

        frontFace: function (gl, mode) {
            if (!gl) {
                return mode || "ccw";
            }
            gl.frontFace(glEnum(gl, mode));
        },

        lineWidth: function (gl, width) {
            if (!gl) {
                return width || 1;
            }
            gl.lineWidth(width);
        },

        enableScissorTest: function (gl, flag) {
            if (!gl) {
                return flag;
            }
            if (flag) {
                gl.enable(gl.SCISSOR_TEST);
            } else {
                flag = false;
                gl.disable(gl.SCISSOR_TEST);
            }
        }
    };

    /**
     * Order-sensitive functions that immediately effect WebGL state change.
     *
     * These map to renderer properties and are called in a particular order since they
     * affect one another.
     *
     * Each of these wrap a state-setter function on the WebGL gl. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * @private
     */
    var glStateSetters = {

        /** Set viewport on the given gl
         */
        viewport: function (gl, v) {
            if (!gl) {
                v = v || {};
                return {
                    x: v.x || 1,
                    y: v.y || 1,
                    width: v.width || canvas.canvas.width,
                    height: v.height || canvas.canvas.height
                };
            }
            gl.viewport(v.x, v.y, v.width, v.height);
        },

        /** Sets scissor region on the given gl
         */
        scissor: function (gl, s) {
            if (!gl) {
                s = s || {};
                return {
                    x: s.x || 0,
                    y: s.y || 0,
                    width: s.width || 1.0,
                    height: s.height || 1.0
                };
            }
            gl.scissor(s.x, s.y, s.width, s.height);
        },

        /** Clears buffers on the given gl as specified in mask
         */
        clear: function (gl, mask) {
            if (!gl) {
                mask = mask || {};
                return mask;
            }
            var m;
            if (mask.color) {
                m = gl.COLOR_BUFFER_BIT;
            }
            if (mask.depth) {
                m = m | gl.DEPTH_BUFFER_BIT;
            }
            if (mask.stencil) {
                m = m | gl.STENCIL_BUFFER_BIT;
            }
            if (m) {
               //     gl.clear(m);
            }
        }
    };

    SceneJS.Renderer = SceneJS_NodeFactory.createNodeType("renderer");

    SceneJS.Renderer.prototype._init = function (params) {
        if (this._core.useCount == 1) { // This node defines the resource
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    this._core[key] = params[key];
                }
            }
            this._core.dirty = true;
        }
    };

    SceneJS.Renderer.prototype.setViewport = function (viewport) {
        this._core.viewport = viewport ? {
            x: viewport.x || 1,
            y: viewport.y || 1,
            width: viewport.width || 1000,
            height: viewport.height || 1000
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getViewport = function () {
        return this._core.viewport ? {
            x: this._core.viewport.x,
            y: this._core.viewport.y,
            width: this._core.viewport.width,
            height: this._core.viewport.height
        } : undefined;
    };

    SceneJS.Renderer.prototype.setScissor = function (scissor) {
        this._core.scissor = scissor ? {
            x: scissor.x || 1,
            y: scissor.y || 1,
            width: scissor.width || 1000,
            height: scissor.height || 1000
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getScissor = function () {
        return this._core.scissor ? {
            x: this._core.scissor.x,
            y: this._core.scissor.y,
            width: this._core.scissor.width,
            height: this._core.scissor.height
        } : undefined;
    };

    SceneJS.Renderer.prototype.setClear = function (clear) {
        this._core.clear = clear ? {
            r: clear.r || 0,
            g: clear.g || 0,
            b: clear.b || 0
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getClear = function () {
        return this._core.clear ? {
            r: this._core.clear.r,
            g: this._core.clear.g,
            b: this._core.clear.b
        } : null;
    };

    SceneJS.Renderer.prototype.setEnableBlend = function (enableBlend) {
        this._core.enableBlend = enableBlend;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getEnableBlend = function () {
        return this._core.enableBlend;
    };

    SceneJS.Renderer.prototype.setBlendColor = function (color) {
        this._core.blendColor = color ? {
            r: color.r || 0,
            g: color.g || 0,
            b: color.b || 0,
            a: (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendColor = function () {
        return this._core.blendColor ? {
            r: this._core.blendColor.r,
            g: this._core.blendColor.g,
            b: this._core.blendColor.b,
            a: this._core.blendColor.a
        } : undefined;
    };

    SceneJS.Renderer.prototype.setBlendEquation = function (eqn) {
        this._core.blendEquation = eqn;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendEquation = function () {
        return this._core.blendEquation;
    };

    SceneJS.Renderer.prototype.setBlendEquationSeparate = function (eqn) {
        this._core.blendEquationSeparate = eqn ? {
            rgb: eqn.rgb || "funcAdd",
            alpha: eqn.alpha || "funcAdd"
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendEquationSeparate = function () {
        return this._core.blendEquationSeparate ? {
            rgb: this._core.rgb,
            alpha: this._core.alpha
        } : undefined;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.setBlendFunc = function (funcs) {
        this._core.blendFunc = funcs ? {
            sfactor: funcs.sfactor || "srcAlpha",
            dfactor: funcs.dfactor || "one"
        } : undefined;
        this._core.dirty = true;
        this._engine.display.imageDirty = true;
    };

    SceneJS.Renderer.prototype.getBlendFunc = function () {
        return this._core.blendFunc ? {
            sfactor: this._core.sfactor,
            dfactor: this._core.dfactor
        } : undefined;
    };

    SceneJS.Renderer.prototype.setBlendFuncSeparate = function (eqn) {
        this._core.blendFuncSeparate = eqn ? {
            srcRGB: eqn.srcRGB || "zero",
            dstRGB: eqn.dstRGB || "zero",
            srcAlpha: eqn.srcAlpha || "zero",
            dstAlpha: eqn.dstAlpha || "zero"
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getBlendFuncSeparate = function () {
        return this._core.blendFuncSeparate ? {
            srcRGB: this._core.blendFuncSeparate.srcRGB,
            dstRGB: this._core.blendFuncSeparate.dstRGB,
            srcAlpha: this._core.blendFuncSeparate.srcAlpha,
            dstAlpha: this._core.blendFuncSeparate.dstAlpha
        } : undefined;
    };

    SceneJS.Renderer.prototype.setEnableCullFace = function (enableCullFace) {
        this._core.enableCullFace = enableCullFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableCullFace = function () {
        return this._core.enableCullFace;
    };


    SceneJS.Renderer.prototype.setCullFace = function (cullFace) {
        this._core.cullFace = cullFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getCullFace = function () {
        return this._core.cullFace;
    };

    SceneJS.Renderer.prototype.setEnableDepthTest = function (enableDepthTest) {
        this._core.enableDepthTest = enableDepthTest;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableDepthTest = function () {
        return this._core.enableDepthTest;
    };

    SceneJS.Renderer.prototype.setDepthFunc = function (depthFunc) {
        this._core.depthFunc = depthFunc;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getDepthFunc = function () {
        return this._core.depthFunc;
    };

    SceneJS.Renderer.prototype.setEnableDepthMask = function (enableDepthMask) {
        this._core.enableDepthMask = enableDepthMask;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableDepthMask = function () {
        return this._core.enableDepthMask;
    };

    SceneJS.Renderer.prototype.setClearDepth = function (clearDepth) {
        this._core.clearDepth = clearDepth;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getClearDepth = function () {
        return this._core.clearDepth;
    };

    SceneJS.Renderer.prototype.setDepthRange = function (range) {
        this._core.depthRange = range ? {
            zNear: (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
            zFar: (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getDepthRange = function () {
        return this._core.depthRange ? {
            zNear: this._core.depthRange.zNear,
            zFar: this._core.depthRange.zFar
        } : undefined;
    };

    SceneJS.Renderer.prototype.setFrontFace = function (frontFace) {
        this._core.frontFace = frontFace;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getFrontFace = function () {
        return this._core.frontFace;
    };

    SceneJS.Renderer.prototype.setLineWidth = function (lineWidth) {
        this._core.lineWidth = lineWidth;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getLineWidth = function () {
        return this._core.lineWidth;
    };

    SceneJS.Renderer.prototype.setEnableScissorTest = function (enableScissorTest) {
        this._core.enableScissorTest = enableScissorTest;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getEnableScissorTest = function () {
        return this._core.enableScissorTest;
    };

    SceneJS.Renderer.prototype.setClearStencil = function (clearStencil) {
        this._core.clearStencil = clearStencil;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getClearStencil = function () {
        return this._core.clearStencil;
    };

    SceneJS.Renderer.prototype.setColorMask = function (color) {
        this._core.colorMask = color ? {
            r: color.r || 0,
            g: color.g || 0,
            b: color.b || 0,
            a: (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
        this._core.dirty = true;
    };

    SceneJS.Renderer.prototype.getColorMask = function () {
        return this._core.colorMask ? {
            r: this._core.colorMask.r,
            g: this._core.colorMask.g,
            b: this._core.colorMask.b,
            a: this._core.colorMask.a
        } : undefined;
    };

    SceneJS.Renderer.prototype._compile = function (ctx) {
        if (this._core.dirty) {
            this._core.props = createProps(this._core);
            this._core.dirty = false;
        }
        this._engine.display.renderer = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.renderer = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };
})();