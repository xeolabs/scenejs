/**
 * Manages a stack of WebGL state frames that may be pushed and popped by SceneJS.renderer nodes.
 *  @private
 */
var SceneJS_rendererModule = new (function() {

    var canvas;  // Currently active canvas
    var stateStack;     // Stack of WebGL state frames
    var currentProps;   // Current map of set WebGL modes and states
    var loaded;         // True when current state exported

    /**
     * Maps renderer node properties to WebGL context enums
     * @private
     */
    var glEnum = function(context, name) {
        if (!name) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Null SceneJS.renderer node config: \"" + name + "\""));
        }
        var result = SceneJS_webgl_enumMap[name];
        if (!result) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\""));
        }
        var value = context[result];
        if (!value) {
            SceneJS_errorModule.fatalError(new SceneJS.WebGLUnsupportedNodeConfigException(
                    "This browser's WebGL does not support renderer node config value: \"" + name + "\""));
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
     * @private
     */
    var glModeSetters = {

        enableBlend: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = false;
            }
            context.enable(context.BLEND, flag);
            currentProps.enableBlend = flag;
        },

        blendColor: function(context, color) {
            color = color || {};
            color = {
                r: color.r || 0,
                g: color.g || 0,
                b: color.b || 0,
                a: (color.a == undefined || color.a == null) ? 1 : color.a
            };
            context.blendColor(color.r, color.g, color.b, color.a);
            currentProps.blendColor = color;
        },

        blendEquation: function(context, eqn) {
            eqn = eqn || "funcAdd";
            context.blendEquation(context, glEnum(context, eqn));
            currentProps.blendEquation = eqn;
        },

        /** Sets the RGB blend equation and the alpha blend equation separately
         */
        blendEquationSeparate: function(context, eqn) {
            eqn = eqn || {};
            eqn = {
                rgb : eqn.rgb || "funcAdd",
                alpha : eqn.alpha || "funcAdd"
            };
            context.blendEquation(glEnum(context, eqn.rgb), glEnum(context, eqn.alpha));
            currentProps.blendEquationSeperate = eqn;
        },

        blendFunc: function(context, funcs) {
            blendFunc = blendFunc || {};
            funcs = {
                sfactor : funcs.sfactor || "one",
                dfactor : funcs.dfactor || "zero"
            };
            context.blendFunc(glEnum(context, funcs.sfactor || "one"), glEnum(context, funcs.dfactor || "zero"));
            currentProps.blendFunc = funcs;
        },

        blendFuncSeparate: function(context, func) {
            func = func || {};
            func = {
                srcRGB : func.srcRGB || "zero",
                dstRGB : func.dstRGB || "zero",
                srcAlpha : func.srcAlpha || "zero",
                dstAlpha :  func.dstAlpha || "zero"
            };
            context.blendFuncSeparate(
                    glEnum(context, func.srcRGB || "zero"),
                    glEnum(context, func.dstRGB || "zero"),
                    glEnum(context, func.srcAlpha || "zero"),
                    glEnum(context, func.dstAlpha || "zero"));
            currentProps.blendFuncSeparate = func;
        },

        clearColor: function(context, color) {
            color = color || {};
            color.r = color.r || 0;
            color.g = color.g || 0;
            color.b = color.b || 0;
            color.a = (color.a == undefined || color.a == null) ? 1 : color.a;
            context.clearColor(color.r, color.g, color.b, color.a);
            currentProps.clearColor = color;
        },

        clearDepth: function(context, depth) {
            if (depth == null || depth == undefined) {
                depth = 1;
            }
            context.clearDepth(depth);
            currentProps.clearDepth = depth;
        },

        clearStencil: function(context, clearValue) {
            clearValue = clearValue || 0;
            context.clearStencil(clearValue);
            currentProps.clearStencil = clearValue;
        },

        colorMask: function(context, color) {
            color = color || {};
            color.r = color.r || 0;
            color.g = color.g || 0;
            color.b = color.b || 0;
            color.a = (color.a == undefined || color.a == null) ? 1 : color.a;
            context.colorMask(color.r, color.g, color.b, color.a);
            currentProps.colorMask = color;
        },

        enableCullFace: function(context, flag) {
            if (flag) {
                context.enable(context.CULL_FACE);
            } else {
                flag = false;
                context.disable(context.CULL_FACE);
            }
            currentProps.enableCullFace = flag;
        },

        cullFace: function(context, mode) {
            mode = mode || "back";
            context.cullFace(glEnum(context, mode));
            currentProps.cullFace = mode;
        },

        enableDepthTest: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = true;
            }
            if (flag) {
                context.enable(context.DEPTH_TEST);
            } else {
                context.disable(context.DEPTH_TEST);
            }
            currentProps.enableDepthTest = flag;
        },

        depthFunc: function(context, func) {
            func = func || "less";
            context.depthFunc(glEnum(context, func));
            currentProps.depthFunc = func;
        },

        enableDepthMask: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = true;
            }
            context.depthMask(flag);
            currentProps.enableDepthMask = flag;
        },

        depthRange: function(context, range) {
            range = range || {};
            range = {
                zNear : range.zNear || 0,
                zFar : range.zFar || 1
            };
            context.depthRange(range.zNear, range.zFar);
            currentProps.depthRange = range;
        },

        frontFace: function(context, mode) {
            mode = mode || "ccw";
            context.frontFace(glEnum(context, mode));
            currentProps.frontFace = mode;
        },

        lineWidth: function(context, width) {
            width = width || 1;
            context.lineWidth(width);
            currentProps.lineWidth = width;
        },

        enableTexture2D: function(context, flag) {
            if (flag) {
                context.enable(context.TEXTURE_2D);
            } else {
                flag = false;
                context.disable(context.TEXTURE_2D);
            }
            currentProps.enableTexture2D = flag;
        },

        enableScissorTest: function(context, flag) {
            if (flag) {
                context.enable(context.SCISSOR_TEST);
            } else {
                flag = false;
                context.disable(context.SCISSOR_TEST);
            }
            currentProps.enableScissorTest = flag;
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
            v = v || {};
            v = {
                x : v.x || 1,
                y : v.y || 1,
                width: v.width || canvas.width,
                height: v.height || canvas.height
            };
            currentProps.viewport = v;
            context.viewport(v.x, v.y, v.width, v.height);
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEWPORT_UPDATED, v);
        },

        /** Sets scissor region on the given context
         */
        scissor: function(context, s) {
            s = s || {};
            s = {
                x : s.x || currentProps.viewport.x,
                y : s.y || currentProps.viewport.y,
                width: s.width || currentProps.viewport.width,
                height: s.height || currentProps.viewport.height
            };
            currentProps.scissor = s;
            context.scissor(s.x, s.y, s.width, s.height);
        },

        /** Clears buffers on the given context as specified in mask
         */
        clear:function(context, mask) {
            mask = mask || {};
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

    /**
     * Sets current renderer properties.
     * @private
     */
    var setProperties = function(context, props) {

        /* Set order-insensitive properties (modes)
         */
        for (var key in props) {
            var setter = glModeSetters[key];
            if (setter) {
                setter(context, props[key]);
            }
        }

        /* Set order-sensitive properties (states)
         */
        if (props.viewport) {
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }
        if (props.clear) {
            glStateSetters.clear(context, props.clear);
        }

        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.RENDERER_UPDATED,
                currentProps);

        loaded = false;
    };

    /**
     * Restores previous renderer properties, except for clear - that's the reason we
     * have a seperate set and restore semantic - we don't want to keep clearing the buffers
     * @private
     */
    var undoProperties = function(context, props) {

        /* Set order-insensitive properties (modes)
         */
        for (var key in props) {
            var setter = glModeSetters[key];
            if (setter) {
                setter(context, props[key]);
            }
        }

        /* Set order-sensitive properties (states)
         */
        if (props.viewport) {
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }

        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.RENDERER_UPDATED,
                currentProps);

        loaded = false;
    };


    /** Gets value of the given property on the first higher renderer state that has it
     * @private
     */
    var getSuperProperty = function(name) {
        for (var i = stateStack.length - 1; i >= 0; i--) {
            var state = stateStack[i];
            if (!(state.props[name] == undefined)) {
                return state.props[name];
            }
        }
        return null; // Cause default to be set
    };

    /* Activate initial defaults
     */
    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                currentProps = {
                    clear: { depth : true, color : true},
                    //  clearColor: {r: 0, g : 0, b : 0 },
                    clearDepth: 1.0,
                    enableDepthTest:true,
                    enableCullFace: false,
                    enableTexture2D: true,
                    depthRange: { zNear: 0, zFar: 1},
                    enableScissorTest: false,
                    viewport:{ x : 1, y : 1, width: c.canvas.width, height: canvas.canvas.height}
                };
                stateStack = [
                    {
                        props: currentProps,
                        restore : null          // WebGL properties to set for reverting to previous state
                    }
                ];
                loaded = false;

                setProperties(canvas.context, currentProps);

                SceneJS_eventModule.fireEvent(
                        SceneJS_eventModule.RENDERER_UPDATED,
                        currentProps);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                loaded = false;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                loaded = false;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (!loaded) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.RENDERER_EXPORTED,
                            currentProps);
                    loaded = true;
                }
            });

    /**
     * Returns a new WebGL state object to the caller, without making it active.
     * @private
     */
    this.createRendererState = function(props) {

        /* For each property supplied, find the previous value to restore it to
         */
        var restore = {};
        for (var name in props) {
            if (!(props[name] == undefined)) {
                restore[name] = getSuperProperty(name);
            }
        }

        var state = {
            props : props,
            restore : restore
        };
        return state;
    };

    /** Activates the given WebGL state. If no state is active, then it must specify a canvas to activate,
     * in which case the default simple shader will be activated as well
     * @private
     */
    this.setRendererState = function(state) {
        stateStack.push(state);
        setProperties(canvas.context, state.props);
    };

    /**
     * Restores previous WebGL state, if any. We do a seperate restore operation because some "properties",
     * like clear, are actually operations that we don't want to undo, so we don't redo those in a restore.
     * @private
     */
    this.undoRendererState = function(state) {
        stateStack.pop();
        undoProperties(canvas.context, state.restore); // Undo property settings
    };

})();



