/** Backend for renderer nodes
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'renderer';

            /** IDs of supported WebGL canvas contexts
             */
            var CONTEXT_TYPES = ["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"];
            var ctx;
            var stateStack;   // Stack of renderer properties
            var glEnumMap;    // Maps renderer props to WebGL enums - lazy created when first GL context available
            var currentProps; // Selection of current renderer properties used as fallbacks

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             */
            var findCanvas = function(canvasId) {
                var canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw new SceneJs.exceptions.CanvasNotFoundException
                            ('Could not find canvas document element with id \'' + canvasId + '\'');
                }
                var context;
                for (var i = 0; (!context) && i < CONTEXT_TYPES.length; i++) {
                    try {
                        context = canvas.getContext(CONTEXT_TYPES[i]);
                    } catch (e) {

                    }
                }
                if (!context) {
                    throw new SceneJs.exceptions.WebGLNotSupportedException
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
                if (!glEnumMap) {   // Lazy-create from context
                    glEnumMap = {
                        "funcAdd": context.FUNC_ADD,
                        "funcSubtract": context.FUNC_SUBTRACT,
                        "funcReverseSubtract": context.FUNC_REVERSE_SUBTRACT,
                        "zero" : context.ZERO,
                        "one" : context.ONE,
                        "srcColor":context.SRC_COLOR,
                        "oneMinusSrcColor":context.ONE_MINUS_SRC_COLOR,
                        "dstColor":context.DST_COLOR,
                        "oneMinusDstColor":context.ONE_MINUS_DST_COLOR,
                        "srcAlpha":context.SRC_ALPHA,
                        "oneMinusSrcAlpha":context.ONE_MINUS_SRC_ALPHA,
                        "dstAlpha":context.DST_ALPHA,
                        "oneMinusDstAlpha":context.ONE_MINUS_DST_ALPHA,
                        "contantColor":context.CONSTANT_COLOR,
                        "oneMinusConstantColor":context.ONE_MINUS_CONSTANT_COLOR,
                        "constantAlpha":context.CONSTANT_ALPHA,
                        "oneMinusConstantAlpha":context.ONE_MINUS_CONSTANT_ALPHA,
                        "srcAlphaSaturate":context.SRC_ALPHA_SATURATE    ,
                        "front": context.FRONT,
                        "back": context.BACK,
                        "frontAndBack": context.FRONT_AND_BACK ,
                        "never":   context.NEVER,
                        "less":context.LESS,
                        "equal":context.EQUAL,
                        "lequal":context.LEQUAL,
                        "greater":context.GREATER,
                        "notequal":context.NOTEQUAL,
                        "gequal":context.GEQUAL,
                        "always":context.ALWAYS  ,
                        "cw":context.CW,
                        "ccw":context.CCW
                    };
                }
                if (!name) {
                    throw new SceneJs.exceptions.InvalidNodeConfigException(
                            "Null renderer node config: \"" + name + "\"");
                }
                var result = glEnumMap[name];
                if (!result) {
                    throw new SceneJs.exceptions.InvalidNodeConfigException(
                            "Unknown renderer node config: \"" + name + "\"");
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
                        width: v.width || ctx.renderer.canvas.width,
                        height: v.height || ctx.renderer.canvas.renderer.height
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
            var setProperties = function(props) {
                var context = ctx.renderer.canvas.context;

                /* Set state variables that map to properties
                 */
                for (var key in props) {
                    var setter = glSetters[key];
                    if (setter) {
                        setter(context, props[key], ctx.renderer);
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

            /** Initialises backend - sets up a renderer state stack with an
             *  initial set of essential default properties. The first renderer
             *  state created by a client renderer node will fall back on these
             *  where it fails to provide them. Also prepares a map of current
             *  properties that will internally keep track of state.
             */
            var init = function() {
                stateStack = [
                    {
                        props: {
                            clearColor: {r: 0, g : 0, b : 0, a: 1.0},
                            clearDepth: 1.0,
                            enableDepthTest:true,
                            enableCullFace: false,
                            enableTexture2D: false,
                            depthRange: { zNear: 0, zFar: 1},
                            enableScissorTest: false,
                            viewport: {} // will default to canvas extents
                        }
                    }
                ];
                currentProps = {};
                ctx.renderer = {};
            };

            this.install = function(_ctx) {
                ctx = _ctx;
                init();
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

            /** Creates a new renderer state - does not set it yet
             */
            this.createRendererState = function(props) {

                /* Select a canvas
                 */
                var canvas;
                if (props.canvasId) {
                    canvas = findCanvas(props.canvasId);   // Activating a canvas
                } else if (ctx.renderer.canvas) {
                    canvas = ctx.renderer.canvas;          // Using current canvas
                } else {
                    throw new SceneJs.exceptions.NoCanvasActiveException(
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
                    prevCanvas: ctx.renderer.canvas // Canvas to restore as active
                };
                return state;
            };

            /** Activates the given renderer state
             */
            this.setRendererState = function(state) {
                ctx.renderer.canvas = state.canvas;
                stateStack.push(state);
                setProperties(state.props);
            };

            /** Restores previous renderer state
             */
            this.restoreRendererState = function(state) {
                ctx.renderer.canvas = state.prevCanvas;
                stateStack.pop();
                if (ctx.renderer.canvas) {
                    setProperties(state.restore);
                }
            };

            this.reset = function() {
                init();
            };
        })());



