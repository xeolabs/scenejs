/**
 * Manages a stack of WebGL state frames that may be pushed and popped by SceneJS.renderer nodes.
 */
SceneJS._backends.installBackend(

        "renderer",

        function(ctx) {

            var currentCanvas;  // Currently active canvas
            var stateStack;     // Stack of WebGL state frames
            var currentProps;   // Current map of set WebGL modes and states
            var loaded;         // True when current state exported

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        currentCanvas = null;
                        currentProps = {
                            clearColor: {r: 0, g : 0, b : 0, a: 1.0},
                            clearDepth: 1.0,
                            enableDepthTest:true,
                            enableCullFace: false,
                            enableTexture2D: false,
                            depthRange: { zNear: 0, zFar: 1},
                            enableScissorTest: false,
                            viewport: {} // will default to canvas extents
                        };
                        stateStack = [
                            {
                                canvas: null,
                                // Current canvas
                                props: currentProps,
                                // WebGL properties set for this state
                                prevCanvas: null,
                                // Previous canvas
                                restore : null          // WebGL properties to set for reverting to previous state
                            }
                        ];
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            /* WebGL state is exported on demand to construct shaders as required
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (!loaded) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.RENDERER_EXPORTED,
                                    currentProps);
                            loaded = true;
                        }
                    });

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             */
            var findCanvas = function(canvasId) {
                var canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw new SceneJS.exceptions.CanvasNotFoundException
                            ('Could not find canvas document element with id \'' + canvasId + '\'');
                }
                var context;
                var contextNames = SceneJS._webgl.contextNames;
                for (var i = 0; (!context) && i < contextNames.length; i++) {
                    try {
                        context = canvas.getContext(contextNames[i]);
                    } catch (e) {

                    }
                }
                if (!context) {
                    throw new SceneJS.exceptions.WebGLNotSupportedException
                            ('Canvas document element with id \''
                                    + canvasId
                                    + '\' failed to provide a supported context');
                }
                context.clearColor(0.0, 0.0, 0.0, 1.0);
                context.clearDepth(1.0);
                context.enable(context.DEPTH_TEST);
                context.disable(context.CULL_FACE);
                context.disable(context.TEXTURE_2D);
                context.depthRange(0, 1);
                context.disable(context.SCISSOR_TEST);
                return {
                    canvas: canvas,
                    context: context,
                    canvasId : canvasId
                };
            };

            /**
             * Maps renderer node properties to WebGL context enums
             */
            var glEnum = function(context, name) {
                if (!name) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Null renderer node config: \"" + name + "\"");
                }
                var result = SceneJS._webgl.enumMap[name];
                if (!result) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Unrecognised renderer node config value: \"" + name + "\"");
                }
                return result;
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
             */
            var glModeSetters = {

                enableBlend: function(context, flag) {
                    context.enable(context.BLEND, flag);
                    currentProps.enableBlend = flag;
                },

                blendColor: function(context, color) {
                    color = {
                        r:color.r || 0,
                        g: color.g || 0,
                        b: color.b || 0,
                        a: color.a || 1
                    };
                    context.blendColor(color.r, color.g, color.b, color.a);
                    currentProps.blendColor = color;
                },

                blendEquation: function(context, eqn) {
                    context.blendEquation(context, eqn);
                    currentProps.blendEquation = eqn;
                },

                /** Sets the RGB blend equation and the alpha blend equation separately
                 */
                blendEquationSeparate: function(context, eqn) {
                    eqn = {
                        rgb : glEnum(context, eqn.rgb || "func_add"),
                        alpha : glEnum(context, eqn.alpha || "func_add")
                    };
                    context.blendEquation(eqn.rgb, eqn.alpha);
                    currentProps.blendEquationSeperate = eqn;
                },

                blendFunc: function(context, funcs) {
                    funcs = {
                        sfactor : glEnum(context, funcs.sfactor || "one"),
                        dfactor : glEnum(context, funcs.dfactor || "zero")
                    };
                    context.blendFunc(funcs.sfactor, funcs.dfactor);
                    currentProps.blendFunc = funcs;
                },

                blendFuncSeparate: function(context, func) {
                    func = {
                        srcRGB : glEnum(context, func.srcRGB || "zero"),
                        dstRGB : glEnum(context, func.dstRGB || "zero"),
                        srcAlpha : glEnum(context, func.srcAlpha || "zero"),
                        dstAlpha :  glEnum(context, func.dstAlpha || "zero")
                    };
                    context.blendFuncSeparate(func.srcRGB, func.dstRGB, func.srcAlpha, func.dstAlpha);
                    currentProps.blendFuncSeparate = func;
                },

                clearColor: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
                    context.clearColor(color.r, color.g, color.b, color.a);
                    currentProps.clearColor = color;
                },

                clearDepth: function(context, depth) {
                    context.clearDepth(depth);
                    currentProps.clearDepth = depth;
                },

                clearStencil: function(context, clearValue) {
                    context.clearStencil(clearValue);
                    currentProps.clearStencil = clearValue;
                },

                colorMask: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
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
                    mode = glEnum(context, mode);
                    context.cullFace(mode);
                    currentProps.cullFace = mode;
                },

                enableDepthTest: function(context, flag) {
                    if (flag === false) {
                        context.disable(context.DEPTH_TEST);
                    } else {
                        flag = true;
                        context.enable(context.DEPTH_TEST);
                    }
                    currentProps.enableDepthTest = flag;
                },

                depthFunc: function(context, func) {
                    func = glEnum(context, func);
                    context.depthFunc(glEnum(context, func));
                    currentProps.depthFunc = func;
                },

                enableDepthMask: function(context, flag) {
                    context.depthMask(flag);
                    currentProps.enableDepthMask = flag;
                },

                depthRange: function(context, range) {
                    range = {
                        zNear : range.zNear || 0,
                        zFar : range.zFar || 1
                    };
                    context.depthRange(range.zNear, range.zFar);
                    currentProps.depthRange = range;
                },

                frontFace: function(context, mode) {
                    mode = glEnum(context, mode);
                    context.frontFace(mode);
                    currentProps.frontFace = mode;
                },

                lineWidth: function(context, width) {
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
             */
            var glStateSetters = {

                /** Set viewport on the given context
                 */
                viewport: function(context, v) {
                    v = {
                        x : v.x || 1,
                        y : v.y || 1,
                        width: v.width || currentCanvas.width,
                        height: v.height || currentCanvas.height
                    };
                    currentProps.viewport = v;
                    context.viewport(v.x, v.y, v.width, v.height);
                    ctx.events.fireEvent(SceneJS._eventTypes.VIEWPORT_UPDATED, v);
                },

                /** Sets scissor region on the given context
                 */
                scissor: function(context, s) {
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
             * Sets current renderer properties on the given WebGL context. These will then
             * appear on currentProps.
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

                ctx.events.fireEvent(
                        SceneJS._eventTypes.RENDERER_UPDATED,
                        currentProps);

                loaded = false;
            };

            /** Gets value of the given property on the first higher renderer state that has it
             */
            var getSuperProperty = function(name) {
                for (var i = stateStack.length - 1; i >= 0; i--) {
                    var state = stateStack[i];
                    if (state.props[name] != null) {
                        return state.props[name];
                    }
                }
                throw "Internal error - renderer backend stateStack underflow!";
            };
            
            return {// Node-facing API

                /**
                 * Returns a new WebGL state object to the caller, without making it active.
                 */
                createRendererState : function(props) {

                    /* Select a canvas if specified
                     */
                    var canvas;
                    if (props.canvasId) {                       // Canvas specified
                        if (currentCanvas) {                    //  - but canvas already active
                            throw new SceneJS.exceptions.CanvasAlreadyActiveException
                                    ("A canvas is already activated by a higher renderer node");
                        }
                        canvas = findCanvas(props.canvasId);

                    } else if (currentCanvas) {                 // No canvas specified, but canvas already active
                        canvas = currentCanvas;                 //  - continue using active canvas

                    } else {                                    // No canvas specified, but none already active
                        throw new SceneJS.exceptions.NoCanvasActiveException(
                                'Outermost renderer node must have a canvasId');
                    }

                    /* For each property supplied, find the previous value to restore it to
                     */
                    var restore = {};
                    for (var name in props) {
                        if ((!props[name] === undefined)) {
                            restore[name] = getSuperProperty(name);
                        }
                    }

                    var state = {
                        canvas: canvas,
                        props : props,
                        restore : restore,
                        prevCanvas: currentCanvas // Will restore canvas to null when no higher state
                    };

                    return state;
                },

                /** Activates the given WebGL state. If no state is active, then it must specify a canvas to activate,
                 * in which case the default simple shader will be activated as well
                 */
                setRendererState : function(state) {
                    var prevCanvas = currentCanvas;
                    currentCanvas = state.canvas;
                    var lastState = stateStack[stateStack.length - 1];
                    stateStack.push(state);
                    setProperties(currentCanvas.context, state.props);
                    if (!prevCanvas) {
                        ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, currentCanvas);
                    }
                },

                /** Restores previous WebGL state, if any.
                 */
                restoreRendererState : function(state) {
                    stateStack.pop();
                    if (state.prevCanvas) {
                        setProperties(currentCanvas.context, state.restore); // Undo property settings
                    } else {
                        currentCanvas = null;
                        ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED);
                    }
                }
            };
        });



