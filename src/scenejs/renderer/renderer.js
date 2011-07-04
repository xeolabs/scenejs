new (function() {

    var canvas;         // Currently active canvas
    var idStack =[];
    var propStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {
                stackLen = 0;
                dirty = true;
                canvas = params.canvas;
                stackLen = 0;
                var props = createProps({  // Dont set props - just define for restoring to on props pop
                    clear: {
                        depth : true,
                        color : true
                    },
                    // clearColor: {r: 0, g : 0, b : 0 },
                    clearDepth: 1.0,
                    enableDepthTest:true,
                    enableCullFace: false,
                    frontFace: "ccw",
                    cullFace: "back",
                    depthFunc: "less",
                    depthRange: {
                        zNear: 0,
                        zFar: 1
                    },
                    enableScissorTest: false,
                    viewport:{
                        x : 1,
                        y : 1,
                        width: canvas.canvas.width,
                        height: canvas.canvas.height
                    },
                    wireframe: false,
                    highlight: false,
                    enableClip: undefined,
                    enableBlend: false,
                    blendFunc: {
                        sfactor: "srcAlpha",
                        dfactor: "one"
                    }
                });


                // Not sure if needed:
                setProperties(canvas.context, props);

                pushProps("__scenejs_default_props", props);
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setRenderer(idStack[stackLen - 1], propStack[stackLen - 1]);
                    } else  {
                        SceneJS_renderModule.setRenderer();
                    }
                    dirty = false;
                }
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
        props = processProps(props);

        return {

            props: props,

            setProps: function(context) {
                setProperties(context, props);
            },

            restoreProps : function(context) {
                if (restore) {
                    restoreProperties(context, restore);
                }
            }
        };
    };

    var getSuperProperty = function(name) {
        var props;
        var prop;
        for (var i = stackLen - 1; i >= 0; i--) {
            props = propStack[i].props;
            prop = props[name];
            if (prop != undefined && prop != null) {
                return props[name];
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
        return props;
    }

    var setProperties = function(context, props) {
        for (var key in props) {        // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                var setter = glModeSetters[key];
                if (setter) {
                    setter(context, props[key]);
                }
            }
        }
        if (props.viewport) {           // Set order-sensitive properties (states)
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }
        if (props.clear) {
            glStateSetters.clear(context, props.clear);
        }
    };

    /**
     * Restores previous renderer properties, except for clear - that's the reason we
     * have a seperate set and restore semantic - we don't want to keep clearing the buffer.
     */
    var restoreProperties = function(context, props) {
        var value;
        for (var key in props) {            // Set order-insensitive properties (modes)
            if (props.hasOwnProperty(key)) {
                value = props[key];
                if (value != undefined && value != null) {
                    var setter = glModeSetters[key];
                    if (setter) {
                        setter(context, value);
                    }
                }
            }
        }
        if (props.viewport) {               //  Set order-sensitive properties (states)
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }
    };

    function pushProps(id, props) {
        idStack[stackLen] = id;
        propStack[stackLen] = props;

        stackLen++;

        if (props.props.viewport) {
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEWPORT_UPDATED, props.props.viewport);
        }
        dirty = true;
    };

    /**
     * Maps renderer node properties to WebGL context enums
     * @private
     */
    var glEnum = function(context, name) {
        if (!name) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Null SceneJS.renderer node config: \"" + name + "\"");
        }
        var result = SceneJS_webgl_enumMap[name];
        if (!result) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\"");
        }
        var value = context[result];
        if (!value) {
            throw SceneJS_errorModule.fatalError(
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
     * Each of these wrap a state-setter function on the WebGL context. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * When called with undefined/null context, will condition and return the value given
     * ie. set it to default if value is undefined. When called with a context, will
     * set the value on the context using the wrapped function.
     *
     * @private
     */
    var glModeSetters = {

        enableBlend: function(context, flag) {
            if (!context) {
                if (flag == null || flag == undefined) {
                    flag = false;
                }
                return flag;
            }
            if (flag) {
                context.enable(context.BLEND);
            } else {
                context.disable(context.BLEND);
            }
        },

        blendColor: function(context, color) {
            if (!context) {
                color = color || {};
                return {
                    r: color.r || 0,
                    g: color.g || 0,
                    b: color.b || 0,
                    a: (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            context.blendColor(color.r, color.g, color.b, color.a);
        },

        blendEquation: function(context, eqn) {
            if (!context) {
                return eqn || "funcAdd";
            }
            context.blendEquation(context, glEnum(context, eqn));
        },

        /** Sets the RGB blend equation and the alpha blend equation separately
         */
        blendEquationSeparate: function(context, eqn) {
            if (!context) {
                eqn = eqn || {};
                return {
                    rgb : eqn.rgb || "funcAdd",
                    alpha : eqn.alpha || "funcAdd"
                };
            }
            context.blendEquation(glEnum(context, eqn.rgb), glEnum(context, eqn.alpha));
        },

        blendFunc: function(context, funcs) {
            if (!context) {
                funcs = funcs || {};
                return  {
                    sfactor : funcs.sfactor || "srcAlpha",
                    dfactor : funcs.dfactor || "oneMinusSrcAlpha"
                };
            }
            context.blendFunc(glEnum(context, funcs.sfactor || "srcAlpha"), glEnum(context, funcs.dfactor || "oneMinusSrcAlpha"));
        },

        blendFuncSeparate: function(context, func) {
            if (!context) {
                func = func || {};
                return {
                    srcRGB : func.srcRGB || "zero",
                    dstRGB : func.dstRGB || "zero",
                    srcAlpha : func.srcAlpha || "zero",
                    dstAlpha :  func.dstAlpha || "zero"
                };
            }
            context.blendFuncSeparate(
                    glEnum(context, func.srcRGB || "zero"),
                    glEnum(context, func.dstRGB || "zero"),
                    glEnum(context, func.srcAlpha || "zero"),
                    glEnum(context, func.dstAlpha || "zero"));
        },

        clearColor: function(context, color) {
            if (!context) {
                color = color || {};
                return {
                    r : color.r || 0,
                    g : color.g || 0,
                    b : color.b || 0,
                    a : (color.a == undefined || color.a == null) ? 1 : color.a
                };
            }
            context.clearColor(color.r, color.g, color.b, color.a);
        },

        clearDepth: function(context, depth) {
            if (!context) {
                return (depth == null || depth == undefined) ? 1 : depth;
            }
            context.clearDepth(depth);
        },

        clearStencil: function(context, clearValue) {
            if (!context) {
                return  clearValue || 0;
            }
            context.clearStencil(clearValue);
        },

        colorMask: function(context, color) {
            if (!context) {
                color = color || {};
                return {
                    r : color.r || 0,
                    g : color.g || 0,
                    b : color.b || 0,
                    a : (color.a == undefined || color.a == null) ? 1 : color.a
                };

            }
            context.colorMask(color.r, color.g, color.b, color.a);
        },

        enableCullFace: function(context, flag) {
            if (!context) {
                return flag;
            }
            if (flag) {
                context.enable(context.CULL_FACE);
            } else {
                context.disable(context.CULL_FACE);
            }
        },

        cullFace: function(context, mode) {
            if (!context) {
                return mode || "back";
            }
            context.cullFace(glEnum(context, mode));
        },

        enableDepthTest: function(context, flag) {
            if (!context) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            if (flag) {
                context.enable(context.DEPTH_TEST);
            } else {
                context.disable(context.DEPTH_TEST);
            }
        },

        depthFunc: function(context, func) {
            if (!context) {
                return func || "less";
            }
            context.depthFunc(glEnum(context, func));
        },

        enableDepthMask: function(context, flag) {
            if (!context) {
                if (flag == null || flag == undefined) {
                    flag = true;
                }
                return flag;
            }
            context.depthMask(flag);
        },

        depthRange: function(context, range) {
            if (!context) {
                range = range || {};
                return {
                    zNear : (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
                    zFar : (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
                };
            }
            context.depthRange(range.zNear, range.zFar);
        } ,

        frontFace: function(context, mode) {
            if (!context) {
                return mode || "ccw";
            }
            context.frontFace(glEnum(context, mode));
        },

        lineWidth: function(context, width) {
            if (!context) {
                return width || 1;
            }
            context.lineWidth(width);
        },

        enableScissorTest: function(context, flag) {
            if (!context) {
                return flag;
            }
            if (flag) {
                context.enable(context.SCISSOR_TEST);
            } else {
                flag = false;
                context.disable(context.SCISSOR_TEST);
            }
        }
    };

    /**
     * Order-sensitive functions that immediately effect WebGL state change.
     *
     * These map to renderer properties and are called in a particular order since they
     * affect one another.
     *
     * Each of these wrap a state-setter function on the WebGL context. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * @private
     */
    var glStateSetters = {

        /** Set viewport on the given context
         */
        viewport: function(context, v) {
            if (!context) {
                v = v || {};
                return {
                    x : v.x || 1,
                    y : v.y || 1,
                    width: v.width || canvas.canvas.width,
                    height: v.height || canvas.canvas.height
                };
            }
            context.viewport(v.x, v.y, v.width, v.height);
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEWPORT_UPDATED, v);
        },

        /** Sets scissor region on the given context
         */
        scissor: function(context, s) {
            if (!context) {
                s = s || {};
                return {
                    x : s.x || 0,
                    y : s.y || 0,
                    width: s.width || 1.0,
                    height: s.height || 1.0
                };
            }
            context.scissor(s.x, s.y, s.width, s.height);
        },

        /** Clears buffers on the given context as specified in mask
         */
        clear:function(context, mask) {
            if (!context) {
                mask = mask || {};
                return mask;
            }
            var m;
            if (mask.color) {
                m = context.COLOR_BUFFER_BIT;
            }
            if (mask.depth) {
                m = m | context.DEPTH_BUFFER_BIT;
            }
            if (mask.stencil) {
                m = m | context.STENCIL_BUFFER_BIT;
            }

            if (m) {
                context.clear(m);
            }
        }
    };

    function popProps() {
        var oldProps = propStack[stackLen - 1];
        stackLen--;
        var newProps = propStack[stackLen - 1];
        if (oldProps.props.viewport) {
            SceneJS_eventModule.fireEvent(
                    SceneJS_eventModule.VIEWPORT_UPDATED,
                    newProps.props.viewport);
        }
        dirty = true;
    };

    /** @class A scene node that sets WebGL state for nodes in its subtree.
     * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
     * (TODO: more comments here!)

     * @extends SceneJS_node
     */
    var Renderer = SceneJS.createNodeType("renderer");


    // @private
    Renderer.prototype._init = function(params) {
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                this.attr[key] = params[key];
            }
        }
    };

    Renderer.prototype.setViewport = function(viewport) {
        this.attr.viewport = viewport ? {
            x : viewport.x || 1,
            y : viewport.y || 1,
            width: viewport.width || 1000,
            height: viewport.height || 1000
        } : undefined;
    };

    Renderer.prototype.getViewport = function() {
        return this.attr.viewport ? {
            x : this.attr.viewport.x,
            y : this.attr.viewport.y,
            width: this.attr.viewport.width,
            height: this.attr.viewport.height
        } : undefined;
    };

    Renderer.prototype.setScissor = function(scissor) {
        this.attr.scissor = scissor ? {
            x : scissor.x || 1,
            y : scissor.y || 1,
            width: scissor.width || 1000,
            height: scissor.height || 1000
        } : undefined;
    };

    Renderer.prototype.getScissor = function() {
        return this.attr.scissor ? {
            x : this.attr.scissor.x,
            y : this.attr.scissor.y,
            width: this.attr.scissor.width,
            height: this.attr.scissor.height
        } : undefined;
    };

    Renderer.prototype.setClear = function(clear) {
        this.attr.clear = clear ? {
            r : clear.r || 0,
            g : clear.g || 0,
            b : clear.b || 0
        } : undefined;
    };

    Renderer.prototype.getClear = function() {
        return this.attr.clear ? {
            r : this.attr.clear.r,
            g : this.attr.clear.g,
            b : this.attr.clear.b
        } : null;
    };

    Renderer.prototype.setEnableBlend = function(enableBlend) {
        this.attr.enableBlend = enableBlend;
    };

    Renderer.prototype.getEnableBlend = function() {
        return this.attr.enableBlend;
    };

    Renderer.prototype.setBlendColor = function(color) {
        this.attr.blendColor = color ? {
            r : color.r || 0,
            g : color.g || 0,
            b : color.b || 0,
            a : (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
    };

    Renderer.prototype.getBlendColor = function() {
        return this.attr.blendColor ? {
            r : this.attr.blendColor.r,
            g : this.attr.blendColor.g,
            b : this.attr.blendColor.b,
            a : this.attr.blendColor.a
        } : undefined;
    };

    Renderer.prototype.setBlendEquation = function(eqn) {
        this.attr.blendEquation = eqn;
    };

    Renderer.prototype.getBlendEquation = function() {
        return this.attr.blendEquation;
    };

    Renderer.prototype.setBlendEquationSeparate = function(eqn) {
        this.attr.blendEquationSeparate = eqn ? {
            rgb : eqn.rgb || "funcAdd",
            alpha : eqn.alpha || "funcAdd"
        } : undefined;
    };

    Renderer.prototype.getBlendEquationSeparate = function() {
        return this.attr.blendEquationSeparate ? {
            rgb : this.attr.rgb,
            alpha : this.attr.alpha
        } : undefined;
    };

    Renderer.prototype.setBlendFunc = function(funcs) {
        this.attr.blendFunc = funcs ? {
            sfactor : funcs.sfactor || "srcAlpha",
            dfactor : funcs.dfactor || "one"
        } : undefined;
    };

    Renderer.prototype.getBlendFunc = function() {
        return this.attr.blendFunc ? {
            sfactor : this.attr.sfactor,
            dfactor : this.attr.dfactor
        } : undefined;
    };

    Renderer.prototype.setBlendFuncSeparate = function(eqn) {
        this.attr.blendFuncSeparate = eqn ? {
            srcRGB : eqn.srcRGB || "zero",
            dstRGB : eqn.dstRGB || "zero",
            srcAlpha : eqn.srcAlpha || "zero",
            dstAlpha : eqn.dstAlpha || "zero"
        } : undefined;
    };

    Renderer.prototype.getBlendFuncSeparate = function() {
        return this.attr.blendFuncSeparate ? {
            srcRGB : this.attr.blendFuncSeparate.srcRGB,
            dstRGB : this.attr.blendFuncSeparate.dstRGB,
            srcAlpha : this.attr.blendFuncSeparate.srcAlpha,
            dstAlpha : this.attr.blendFuncSeparate.dstAlpha
        } : undefined;
    };

    Renderer.prototype.setEnableCullFace = function(enableCullFace) {
        this.attr.enableCullFace = enableCullFace;
    };

    Renderer.prototype.getEnableCullFace = function() {
        return this.attr.enableCullFace;
    };


    Renderer.prototype.setCullFace = function(cullFace) {
        this.attr.cullFace = cullFace;
    };

    Renderer.prototype.getCullFace = function() {
        return this.attr.cullFace;
    };

    Renderer.prototype.setEnableDepthTest = function(enableDepthTest) {
        this.attr.enableDepthTest = enableDepthTest;
    };

    Renderer.prototype.getEnableDepthTest = function() {
        return this.attr.enableDepthTest;
    };

    Renderer.prototype.setDepthFunc = function(depthFunc) {
        this.attr.depthFunc = depthFunc;
    };

    Renderer.prototype.getDepthFunc = function() {
        return this.attr.depthFunc;
    };

    Renderer.prototype.setEnableDepthMask = function(enableDepthMask) {
        this.attr.enableDepthMask = enableDepthMask;
    };

    Renderer.prototype.getEnableDepthMask = function() {
        return this.attr.enableDepthMask;
    };

    Renderer.prototype.setClearDepth = function(clearDepth) {
        this.attr.clearDepth = clearDepth;
    };

    Renderer.prototype.getClearDepth = function() {
        return this.attr.clearDepth;
    };

    Renderer.prototype.setDepthRange = function(range) {
        this.attr.depthRange = range ? {
            zNear : (range.zNear == undefined || range.zNear == null) ? 0 : range.zNear,
            zFar : (range.zFar == undefined || range.zFar == null) ? 1 : range.zFar
        } : undefined;
    };

    Renderer.prototype.getDepthRange = function() {
        return this.attr.depthRange ? {
            zNear : this.attr.depthRange.zNear,
            zFar : this.attr.depthRange.zFar
        } : undefined;
    };

    Renderer.prototype.setFrontFace = function(frontFace) {
        this.attr.frontFace = frontFace;
    };

    Renderer.prototype.getFrontFace = function() {
        return this.attr.frontFace;
    };

    Renderer.prototype.setLineWidth = function(lineWidth) {
        this.attr.lineWidth = lineWidth;
    };

    Renderer.prototype.getLineWidth = function() {
        return this.attr.lineWidth;
    };

    Renderer.prototype.setEnableScissorTest = function(enableScissorTest) {
        this.attr.enableScissorTest = enableScissorTest;
    };

    Renderer.prototype.getEnableScissorTest = function() {
        return this.attr.enableScissorTest;
    };

    Renderer.prototype.setClearStencil = function(clearStencil) {
        this.attr.clearStencil = clearStencil;
    };

    Renderer.prototype.getClearStencil = function() {
        return this.attr.clearStencil;
    };

    Renderer.prototype.setColorMask = function(color) {
        this.attr.colorMask = color ? {
            r : color.r || 0,
            g : color.g || 0,
            b : color.b || 0,
            a : (color.a == undefined || color.a == null) ? 1 : color.a
        } : undefined;
    };

    Renderer.prototype.getColorMask = function() {
        return this.attr.colorMask ? {
            r : this.attr.colorMask.r,
            g : this.attr.colorMask.g,
            b : this.attr.colorMask.b,
            a : this.attr.colorMask.a
        } : undefined;
    };

    Renderer.prototype.setWireframe = function(wireframe) {
        this.attr.wireframe = wireframe;
    };

    Renderer.prototype.getWireframe = function() {
        return this.attr.wireframe;
    };

    Renderer.prototype.setHighlight = function(highlight) {
        this.attr.highlight = highlight;
    };

    Renderer.prototype.getHighlight = function() {
        return this.attr.highlight;
    };

    Renderer.prototype.setEnableClip = function(enableClip) {
        this.attr.enableClip = enableClip;
    };

    Renderer.prototype.getEnableClip = function() {
        return this.attr.enableClip;
    };

    Renderer.prototype.setEnableFog = function(enableFog) {
        this.attr.enableFog = enableFog;
    };

    Renderer.prototype.getEnableFog = function() {
        return this.attr.enableFog;
    };

    // @private
    Renderer.prototype._compile = function(traversalContext) {
        this._preCompile(traversalContext);
        this._compileNodes(traversalContext);
        this._postCompile(traversalContext);
    };


    // @private
    Renderer.prototype._preCompile = function(traversalContext) {
        if (this._compileMemoLevel == 0) {
            this._props = createProps(this.attr);
            this._compileMemoLevel = 1;
        }
        pushProps(this.attr.id, this._props);
    };


    // @private
    Renderer.prototype._postCompile = function(traversalContext) {
        popProps();
    };


})();