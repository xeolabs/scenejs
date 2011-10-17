new (function() {

    var idStack = [];

    var shaderVertexCodeStack = [];
    var shaderVertexHooksStack = [];

    var shaderVertexHooksStacks = {};

    var shaderFragmentCodeStack = [];
    var shaderFragmentHooksStack = [];

    var shaderParamsStack = [];

    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        var shader = {
                            shaders: {
                                fragment: {
                                    code: shaderFragmentCodeStack.slice(0, stackLen).join("\n"),
                                    hooks: combineMapStack(shaderFragmentHooksStack)
                                },
                                vertex: {
                                    code: shaderVertexCodeStack.slice(0, stackLen).join("\n"),
                                    hooks: combineMapStack(shaderVertexHooksStack)
                                }
                            },
                            paramsStack: shaderParamsStack.slice(0, stackLen),
                            hash: idStack.slice(0, stackLen)
                        };

                        SceneJS_DrawList.setShader(idStack[stackLen - 1], shader);
                    } else {
                        SceneJS_DrawList.setShader();
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

    var Shader = SceneJS.createNodeType("shader");

    Shader.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node is the resource definer
            this._setShaders(params.shaders);
            this.setParams(params.params);
        }
    };

    Shader.prototype._setShaders = function(shaders) {
        shaders = shaders || [];
        this.core.shaders = {};
        var shader;
        for (var i = 0, len = shaders.length; i < len; i++) {
            shader = shaders[i];
            if (!shader.stage) {
                throw SceneJS_errorModule.fatalError(
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
            this.core.shaders[shader.stage] = {
                code: code,
                hooks: shader.hooks
            };
        }
    };

    Shader.prototype.setParams = function(params) {
        params = params || {};
        var coreParams = this.core.params;
        if (!coreParams) {
            coreParams = this.core.params = {};
        }
        for (var name in params) {
            if (params.hasOwnProperty(name)) {
                coreParams[name] = params[name];
            }
        }
    };

    Shader.prototype.getParams = function() {
        var coreParams = this.core.params;
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

    Shader.prototype._compile = function() {

        /* Push
         */
        idStack[stackLen] = this.core._coreId; // Draw list node tied to core, not node

        var shaders = this.core.shaders;

        var fragment = shaders.fragment || {};
        var vertex = shaders.vertex || {};

        shaderFragmentCodeStack[stackLen] = fragment.code || "";
        shaderFragmentHooksStack[stackLen] = fragment.hooks || {};

//        if (fragment.hooks) {
//            pushHooks(fragment.hooks, shaderFragmentHooksStack);
//        }

        shaderVertexCodeStack[stackLen] = vertex.code || "";
        shaderVertexHooksStack[stackLen] = vertex.hooks || {};

//        if (vertex.hooks) {
//            pushHooks(vertex.hooks, shaderVertexHooksStack);
//        }
        
        shaderParamsStack[stackLen] = this.core.params || {};

        stackLen++;
        dirty = true;

        this._compileNodes();

        /* Pop
         */
        stackLen--;
        dirty = true;
    };

})();