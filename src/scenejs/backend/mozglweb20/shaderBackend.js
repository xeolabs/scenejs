/**
 * Base class for WebGL shader backends.
 *
 */
SceneJs.shaderBackend = function(program) {

    if (!program.nodeType) {
        throw 'SceneJs.ShaderBackendBase mandatory config missing: \'nodeType\'';
    }

    return new (function() {
        this.canvasType = 'moz-glweb20';
        this.nodeType = program.nodeType;

        var ctx;
        var cfg;
        var context;

        /** Installation hook, lazy-creates registry of loaded programs on plugin context.
         *
         * @param _ctx Backend context
         */
        this.install = function(_ctx) {
            ctx = _ctx;

            if (!ctx.programs) {  // Lazy-create program registry

                /** Utility function, loads a shader script into GL context
                 */
                var loadShader = function(context, script, shaderType) {
                    var shader = context.createShader(shaderType);
                    context.shaderSource(shader, script);
                    context.compileShader(shader);
                    if (context.getShaderParameter(shader, 0x8B81 /*gl.COMPILE_STATUS*/) != 1) {
                        alert(context.getShaderInfoLog(shader));
                        return null;
                    }
                    return shader;
                };

                ctx.programs = new function() {
                    var programs = {};
                    var programStack = [];
                    var activeProgram = null;

                    var varStack = [];

                    /** Loads a program into the registry. Does nothing if program of same name already loaded.
                     *
                     * @param context GL context
                     * @param program Program object
                     */
                    this.loadProgram = function(context, program) {
                        if (programs[program.nodeType]) {
                            return;  // Already loaded
                        }
                        program.program = context.createProgram();  // create program
                        for (var i = 0; i < program.fragmentShaders.length; i++) {       // Load fragment shaders
                            var shader = loadShader(context, program.fragmentShaders[i], context.FRAGMENT_SHADER);
                            program.fragmentShaders[i] = {
                                shader: shader
                            };
                            context.attachShader(program.program, shader);
                        }
                        for (var i = 0; i < program.vertexShaders.length; i++) {  // Load vertex shaders
                            var shader = loadShader(context, program.vertexShaders[i], context.VERTEX_SHADER);
                            program.vertexShaders[i] = {
                                shader: shader
                            };
                            context.attachShader(program.program, shader);
                        }
                        context.linkProgram(program.program); // Link

                        /* Delete program on link failure
                         */
                        if (context.getProgramParameter(program.program, 0x8B82 /*gl.LINK_STATUS*/) != 1) {
                            context.deleteProgram(program.program);
                            for (var i = 0; i < program.fragmentShaders.length; i++) {
                                var fs = program.fragmentShaders[i];
                                context.deleteProgram(fs.shader);
                                fs.shader = undefined;
                            }
                            for (var i = 0; i < program.vertexShaders.length; i++) {
                                var vs = program.vertexShaders[i];
                                context.deleteProgram(vs.shader);
                                vs.shader = undefined;
                            }
                            throw 'Failed to load program: ' + context.getProgramInfoLog(program.program);
                        }

                        /* Create variable location map on program
                         */
                        program.varLocationMap = new function() {
                            var attribLocations = {};
                            this.getVarLocation = function(context, name) {
                                var loc = attribLocations[name];
                                if (loc == undefined) {
                                    loc = context.getAttribLocation(activeProgram.program, name);
                                    if (loc == -1) {
                                        loc = context.getUniformLocation(activeProgram.program, name);
                                        if (loc == -1) {
                                            throw 'Shader script attribute not found: \'' + name + '\'';
                                        }
                                    }
                                    attribLocations[name] = loc;
                                }

                                return loc;
                            };
                        };

                        programs[program.nodeType] = program; // Successfully loaded
                    };

                    /**
                     * Activates loaded program of given name. Previously active program is stacked to reactivate when
                     * given program is later deactivated.
                     *
                     * @param context GL context
                     * @param name Name of program to activate
                     */
                    this.activateProgram = function(context, nodeType) {
                        var program = programs[nodeType];
                        context.useProgram(program.program);
                        activeProgram = program;
                        programStack.push(activeProgram);
                    };

                    /** Returns name of currently active program, or null if none active
                     */
                    this.getActiveProgramName = function() {
                        return activeProgram ? activeProgram.nodeType : null;
                    };

                    var _setVars = function(context, vars) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        for (var key in activeProgram.setters) {
                            activeProgram.setters[key].call(this, context,
                                    activeProgram.varLocationMap.getVarLocation, vars[key]); // Defaults on null
                        }
                    };

                    /** Calls the specified setter, if it exists, on the active program
                     */
                    this.setVar = function(context, name, value) {
                        if (activeProgram.setters[name]) {
                            activeProgram.setters[name].call(this, context,
                                    activeProgram.varLocationMap.getVarLocation, value);
                        }
                    };

                    /**
                     * Sets vars on the active program; for each element in the vars, the setter of the
                     * same name is called if it exists, passing the element's value into it.
                     */
                    this.setVars = function(context, vars) {
                        _setVars(context, vars);
                    };

                    this.pushVars = function(context, vars) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        varStack.push(vars);
                        _setVars(context, vars);
                    };

                    this.popVars = function(context) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        varStack.pop();
                        if (varStack.length > 0) {
                            _setVars(context, varStack[varStack.length - 1]);
                        }
                    };

                    /* Pushes vars - new entry becomes clone of top with overrides and is written to script
                     */
                    this.pushVarOverrides = function(context, vars) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        if (varStack.length > 0) {
                            vars = SceneJs.applyIf(SceneJs.shallowClone(vars), varStack[varStack.length - 1]);
                        }
                        varStack.push(vars);
                        _setVars(context, vars);
                    };

                    /* Pops vars - script is then reset to default vars and previous top is written to script
                     */
                    this.popVarOverrides = function(context) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        varStack.pop();
                        if (varStack.length > 0) {
                            _setVars(context, varStack[varStack.length - 1]);
                        }
                    };

                    /** Deactivates the current active program. Reactivates the program (if any) that was active prior to the
                     * active one. Does nothing if no program active.
                     *
                     * @param context  GL context
                     */
                    this.deactivateProgram = function(context) {
                        context.useProgram(0); // Switch GL to use fixed-function paths
                        if (programStack.length > 0) {
                            activeProgram = programStack[programStack.length - 1];
                            programStack.pop();
                        } else {
                            activeProgram = null;
                        }
                    };
                };
            }
        };

        /** Configuration hook, called each time a node acquires this plugin from the SceneJs.Backend.
         *
         * Lazy-loads the program that this plugin has been configured with - only does that
         * if the program is not yet loaded.
         *
         * @param _cfg
         */
        this.configure = function(_cfg) {
            cfg = _cfg;
            context = _cfg.context;
            ctx.programs.loadProgram(context, program);
        };

        /**
         * Activates loaded program of given name. Previously active program is stacked to reactivate when
         * given program is later deactivated.
         *
         * @param name Name of program to activate
         */
        this.activateProgram = function(nodeType) {
            ctx.programs.activateProgram(context, nodeType);
        };

        /** Pushes vars onto the var stack, then for each var if a setter is defined on the
         * shader backend, that setter is invoked with the var. Vars for which setters are
         * not found are ignored.
         */
        this.pushVars = function(vars) {
            ctx.programs.pushVars(cfg.context, vars);
        };

        /** Pops the given number of vars off the var stack, then for each var remaining on the
         * stack. if a setter is defined on the shader backend, that setter is invoked with the var.
         * Vars for which setters are not found are ignored.
         */
        this.popVars = function() {
            ctx.programs.popVars(cfg.context);
        };

        /** Deactivates the current active program. Reactivates the program (if any) that was active prior to the
         * active one. Does nothing if no program active.
         */
        this.deactivateProgram = function() {
            ctx.programs.deactivateProgram(context);
        };
    })();
};