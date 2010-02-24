/** Backend for renderer nodes.
 */
SceneJS._backends.installBackend(

        "renderer",

        function(ctx) {

            /** IDs of supported WebGL canvas contexts
             */

            var stateStack;   // Stack of renderer properties
            var currentProps; // Selection of current renderer properties used as fallbacks
            var renderer;

            var defaultProps = {
                clearColor: {r: 0, g : 0, b : 0, a: 1.0},
                clearDepth: 1.0,
                enableDepthTest:true,
                enableCullFace: false,
                enableTexture2D: false,
                depthRange: { zNear: 0, zFar: 1},
                enableScissorTest: false,
                viewport: {} // will default to canvas extents
            };

            /** Initialises backend - sets up a renderer state stack with an
             *  initial set of essential default properties. The first renderer
             *  state created by a client renderer node will fall back on these
             *  where it fails to provide them. Also prepares a map of current
             *  properties that will internally keep track of state.
             */
            ctx.events.onEvent(// Scene traversal begun - init renderer state stack
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        stateStack = [
                            {
                                props: defaultProps
                            }
                        ];
                        currentProps = {};
                        renderer = {};
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

            /** Functions, mapped to renderer properties, that each wrap a state-setter
             *  function on the WebGL context. Each function also uses the glEnum map to
             *  convert its renderer node property argument to the WebGL enum constant
             *  required by its context function.
             */
            var glSetters = {

                enableBlend: function(context, flag) {
                    context.enable(context.BLEND, flag);
                },

                blendColor: function(context, color) {
                    color = {
                        r:color.r || 0,
                        g: color.g || 0,
                        b: color.b || 0,
                        a: color.a || 1
                    };
                    context.blendColor(color.r, color.g, color.b, color.a);
                },

                blendEquation: function(context, eqn) {
                    context.blendEquation(context, eqn);
                },

                /** Sets the RGB blend equation and the alpha blend equation separately
                 */
                blendEquationSeparate: function(context, eqn) {
                    eqn = {
                        rgb : glEnum(context, eqn.rgb || "func_add"),
                        alpha : glEnum(context, eqn.alpha || "func_add")
                    };
                    context.blendEquation(eqn.rgb, eqn.alpha);
                },

                blendFunc: function(context, funcs) {
                    funcs = {
                        sfactor : glEnum(context, funcs.sfactor || "one"),
                        dfactor : glEnum(context, funcs.dfactor || "zero")
                    };
                    context.blendFunc(funcs.sfactor, funcs.dfactor);
                },

                blendFuncSeparate: function(context, func) {
                    func = {
                        srcRGB : glEnum(context, func.srcRGB || "zero"),
                        dstRGB : glEnum(context, func.dstRGB || "zero"),
                        srcAlpha : glEnum(context, func.srcAlpha || "zero"),
                        dstAlpha :  glEnum(context, func.dstAlpha || "zero")
                    };
                    context.blendFuncSeparate(func.srcRGB, func.dstRGB, func.srcAlpha, func.dstAlpha);
                },

                clearColor: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
                    context.clearColor(color.r, color.g, color.b, color.a);
                },

                clearDepth: function(context, depth) {
                    context.clearDepth(depth);
                },

                clearStencil: function(context, clearValue) {
                    context.clearStencil(clearValue);
                },

                colorMask: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
                    context.colorMask(color.r, color.g, color.b, color.a);
                },

                enableCullFace: function(context, flag) {
                    if (flag) {
                        context.enable(context.CULL_FACE);
                    } else {
                        context.disable(context.CULL_FACE);
                    }
                },

                cullFace: function(context, mode) {
                    mode = glEnum(context, mode);
                    context.cullFace(mode);
                },

                enableDepthTest: function(context, flag) {
                    if (flag === false) {
                        context.disable(context.DEPTH_TEST);
                    } else {
                        context.enable(context.DEPTH_TEST);
                    }
                },

                depthFunc: function(context, func) {
                    func = glEnum(context, func);
                    context.depthFunc(glEnum(context, func));
                },

                enableDepthMask: function(context, flag) {
                    context.depthMask(flag);
                },

                depthRange: function(context, range) {
                    range = {
                        zNear : range.zNear || 0,
                        zFar : range.zFar || 1
                    };
                    context.depthRange(range.zNear, range.zFar);
                },

                frontFace: function(context, mode) {
                    mode = glEnum(context, mode);
                    context.frontFace(mode);
                },

                lineWidth: function(context, width) {
                    context.lineWidth(width);
                },

                enableTexture2D: function(context, flag) {
                    if (flag) {
                        context.enable(context.TEXTURE_2D);
                    } else {
                        context.disable(context.TEXTURE_2D);
                    }
                },

                enableScissorTest: function(context, flag) {
                    if (flag) {
                        context.enable(context.SCISSOR_TEST);
                    } else {
                        context.disable(context.SCISSOR_TEST);
                    }
                }
            };

            /**
             * Functions to change renderer state, in reverse order
             * of their possible dependency on each other. State is
             * carried between them in the currentProps object.
             */
            var funcs = {

                /** Set viewport on the given context
                 */
                viewport: function(context, v) {
                    v = {
                        x : v.x || 1,
                        y : v.y || 1,
                        width: v.width || renderer.canvas.width,
                        height: v.height || renderer.canvas.renderer.height
                    };
                    currentProps.viewport = v;
                    context.viewport(v.x, v.y, v.width, v.height);
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

            /** Sets current renderer properties on the given WebGL context
             */
            var setProperties = function(context, props) {

                /* Set state variables that map to properties
                 */
                for (var key in props) {
                    var setter = glSetters[key];
                    if (setter) {
                        setter(context, props[key], renderer);
                    }
                }
                if (props.viewport) {
                    funcs.viewport(context, props.viewport);
                }
                if (props.scissor) {
                    funcs.clear(context, props.scissor);
                }
                if (props.clear) {
                    funcs.clear(context, props.clear);
                }
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

            function fireEventIfTextureModeUpdated(state, lastState) {
                var enableTexture2D = state.props.enableTexture2D;
                if (enableTexture2D != undefined) {
                    if (enableTexture2D != lastState.enableTexture2D) {
                        ctx.events.fireEvent(
                                enableTexture2D
                                        ? SceneJS._eventTypes.TEXTURE_ENABLED
                                        : SceneJS._eventTypes.TEXTURE_DISABLED);
                    }
                }
            }

            return {// Node-facing API

                /**
                 * Returns a new renderer state to the caller, without making it active.
                 */
                createRendererState : function(props) {

                    /* Select a canvas if specified
                     */
                    var canvas;
                    if (props.canvasId) {                      // Canvas specified
                        if (renderer.canvas) {                 //  - but canvas already active
                            throw new SceneJS.exceptions.CanvasAlreadyActiveException
                                    ("A canvas is already activated by a higher renderer node");
                        }
                        canvas = findCanvas(props.canvasId);

                    } else if (renderer.canvas) {               // No canvas specified, but canvas already active
                        canvas = renderer.canvas;               //  - continue using active canvas

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

                    return {
                        canvas: canvas,
                        props : props,
                        restore : restore,
                        prevCanvas: renderer.canvas // To restore null when no higher state
                    };
                },

                /** Activates the given renderer state. If no state is active, then it must specify a canvas to activate,
                 * in which case the default simple shader will be activated as well
                 */
                setRendererState : function(state) {

                    var prevCanvas = renderer.canvas;

                    renderer.canvas = state.canvas;
                    var lastState = stateStack[stateStack.length - 1];
                    stateStack.push(state);
                    setProperties(renderer.canvas.context, state.props);

                    fireEventIfTextureModeUpdated(state, lastState);

                    if (!prevCanvas) {
                        ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, renderer.canvas);
                    }
                },

                /** Restores previous renderer state, if any.
                 */
                restoreRendererState : function(state) {
                    stateStack.pop();
                    if (state.prevCanvas) {
                        setProperties(renderer.canvas.context, state.restore); // Undo property settings
                    } else {
                        renderer.canvas = null;
                        ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED);
                    }
                }
            };
        });



