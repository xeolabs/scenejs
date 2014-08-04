new (function() {

    /**
     * The default state core singleton for {@link SceneJS.Shader} nodes
     */
    var defaultCore = {
        type: "shader",
        stateId: SceneJS._baseStateId++,
        hash: "",
        empty: true,
        shader : {}
    };

    var idStack = [];
    var shaderVertexCodeStack = [];
    var shaderVertexHooksStack = [];
    var shaderFragmentCodeStack = [];
    var shaderFragmentHooksStack = [];
    var shaderParamsStack = [];

    var stackLen = 0;

    var dirty = true;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {

                params.engine.display.shader = defaultCore;

                stackLen = 0;

                dirty = true;
            });

    SceneJS_events.addListener(
            SceneJS_events.OBJECT_COMPILING,
            function(params) {
                if (dirty) {

                    if (stackLen > 0) {

                        var core = {
                            type: "shader",
                            stateId: idStack[stackLen - 1],
                            hash: idStack.slice(0, stackLen).join("."),

                            shaders: {
                                fragment: {
                                    code: shaderFragmentCodeStack.slice(0, stackLen).join(""),
                                    hooks: combineMapStack(shaderFragmentHooksStack)
                                },
                                vertex: {
                                    code: shaderVertexCodeStack.slice(0, stackLen).join(""),
                                    hooks: combineMapStack(shaderVertexHooksStack)
                                }
                            },

                            paramsStack: shaderParamsStack.slice(0, stackLen)
                        };

                        params.display.shader = core;

                    } else {

                        params.display.shader = defaultCore;
                    }

                    dirty = false;
                }
            });

    function combineMapStack(maps) {
        var map1;
        var map2 = {};
        var name;
        for (var i = 0; i < stackLen; i++) {
            map1 = maps[i];
            for (name in map1) {
                if (map1.hasOwnProperty(name)) {
                    map2[name] = map1[name];
                }
            }
        }
        return map2;
    }

    function pushHooks(hooks, hookStacks) {
        var stack;
        for (var key in hooks) {
            if (hooks.hasOwnProperty(key)) {
                stack = hookStacks[key];
                if (!stack) {
                    stack = hookStacks[key] = [];
                }
                stack.push(hooks[key]);
            }
        }
    }

    SceneJS.Shader = SceneJS_NodeFactory.createNodeType("shader");

    SceneJS.Shader.prototype._init = function(params) {
        if (this._core.useCount == 1) { // This node is the resource definer
            this._setShaders(params.shaders);
            this.setParams(params.params);
        }
    };

    SceneJS.Shader.prototype._setShaders = function(shaders) {
        shaders = shaders || [];
        this._core.shaders = {};
        var shader;

        for (var i = 0, len = shaders.length; i < len; i++) {
            shader = shaders[i];

            if (!shader.stage) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.ILLEGAL_NODE_CONFIG,
                        "shader 'stage' attribute expected");
            }

            var code;
            if (shader.code) {
                if (SceneJS._isArray(shader.code)) {
                    code = shader.code.join("");
                } else {
                    code = shader.code;
                }
            }

            this._core.shaders[shader.stage] = {
                code: code,
                hooks: shader.hooks
            };
        }
    };

    SceneJS.Shader.prototype.setParams = function(params) {
        params = params || {};
        var coreParams = this._core.params;
        if (!coreParams) {
            coreParams = this._core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                coreParams[name] = params[name];
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Shader.prototype.getParams = function() {
        var coreParams = this._core.params;
        if (!coreParams) {
            return {};
        }
        var params = {};
        for (var name in coreParams) {
            if (coreParams.hasOwnProperty(name)) {
                params[name] = coreParams[name];
            }
        }
        return params;
    };

    SceneJS.Shader.prototype._compile = function(ctx) {

        idStack[stackLen] = this._core.coreId; // Draw list node tied to core, not node

        var shaders = this._core.shaders;

        var fragment = shaders.fragment || {};
        var vertex = shaders.vertex || {};

        shaderFragmentCodeStack[stackLen] = fragment.code || "";
        shaderFragmentHooksStack[stackLen] = fragment.hooks || {};

        shaderVertexCodeStack[stackLen] = vertex.code || "";
        shaderVertexHooksStack[stackLen] = vertex.hooks || {};

        shaderParamsStack[stackLen] = this._core.params || {};

        stackLen++;
        dirty = true;

        this._compileNodes(ctx);

        stackLen--;
        dirty = true;
    };

})();