/**
 * Base class for WebGL shader backends.
 *
 */
SceneJs.shaderBackend = function(cfg) {

    if (!cfg.type) {
        throw 'SceneJs.ShaderBackendBase mandatory config missing: \'type\'';
    }

    return new (function() {
        this.type = cfg.type;

        var ctx;

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
                    var activeProgram = null;
                    var vars = {};

                    this.loadProgram = function(canvas) {
                        var programId = ctx.canvas.canvasId + this.type;

                        var program = programs[programId];
                        if (program) {
                            return programId;
                        }

                        program = {};

                        /* Create program on canvas
                         */
                        program.program = context.createProgram();

                        /* Load fragment shaders
                         */
                        var fragmentShaders = [];
                        for (var i = 0; i < program.fragmentShaders.length; i++) {
                            var shader = loadShader(context, cfg.fragmentShaders[i], context.FRAGMENT_SHADER);
                            context.attachShader(program.program, shader);
                            fragmentShaders.push(shader);
                        }

                        /* Load vertex shaders
                         */
                        var vertexShaders = [];
                        for (var i = 0; i < program.vertexShaders.length; i++) {
                            var shader = loadShader(context, program.vertexShaders[i], context.VERTEX_SHADER);
                            context.attachShader(program.program, shader);
                            vertexShaders.push(shader);
                        }
                        context.linkProgram(program.program); // Link

                        /* Delete program and shaders on link failure
                         */
                        if (context.getProgramParameter(program.program, 0x8B82 /*gl.LINK_STATUS*/) != 1) {
                            context.deleteProgram(program.program);

                            while (fragmentShaders.length > 0) {
                                context.deleteProgram(fragmentShaders.pop());
                            }
                            while (vertexShaders.length > 0) {
                                context.deleteProgram(vertexShaders.pop());
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

                        programs[programId] = program;

                        return programId;
                    };

                    this.activateProgram = function(context, programId) {
                        activeProgram = programs[programId];
                        context.useProgram(activeProgram.program);
                        vars = {};
                    };

                    this.getActiveProgramId = function() {
                        return activeProgram ? activeProgram.type : null;
                    };                 

                    this.setVar = function(context, name, value) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        if (activeProgram.setters[name]) {
                            activeProgram.setters[name].call(this, context,
                                    activeProgram.varLocationMap.getVarLocation, value);
                        }
                    };

                    /**
                     * Sets vars on the active program; for each element in the vars, the setter of the
                     * same name is called if it exists, passing the element's value into it.
                     */
                    this.setVars = function(context, v) {
                        if (!activeProgram) {
                            throw 'No program active';
                        }
                        for (var key in activeProgram.setters) {
                            activeProgram.setters[key].call(this, context,
                                    activeProgram.varLocationMap.getVarLocation, v[key]); // Defaults on null
                        }
                        vars = v;
                    };

                    this.getVars = function(context) {
                        return vars;
                    };

                    this.deactivateProgram = function(context) {
                        activeProgram = null;
                        context.useProgram(0); // Switch GL to use fixed-function paths
                    };
                };
            }
        };

        this.loadProgram = function() {
            if (!ctx.canvas) {
                throw 'No canvas active';
            }
            return ctx.programs.loadProgram(ctx.canvas);
        };

        this.activateProgram = function(programId) {
            if (!ctx.canvas) {
                throw 'No canvas active';
            }
            ctx.programs.activateProgram(ctx.canvas.context, programId);
        };

        this.getActiveProgram = function() {
            return ctx.programs.getActiveProgram();
        };

        this.setVars = function(vars) {
            if (!ctx.canvas) {
                throw 'No canvas active';
            }
            ctx.programs.setVars(ctx.canvas.context, vars);
        };

        this.deactivateProgram = function() {
            if (!ctx.canvas) {
                throw 'No canvas active';
            }
            ctx.canvas.context.flush();
            //  cfg.context.swapBuffers();
            ctx.programs.deactivateProgram(ctx.canvas.context);
        };
    })();
};