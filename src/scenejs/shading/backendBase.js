/**
 * Backend for shader scene nodes.
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
                    var vars = {
                        vars: {},
                        fixed: true
                    };

                    /** Creates a program on the context of the given canvas, loads the configured
                     * shaders into it, links the shaders, then returns the ID of the program. If the
                     * program (one of the configured type on the given canvas) already exists, will just
                     * return the ID of the program.
                     */
                    this.loadProgram = function() {
                        if (!ctx.canvas) {
                            throw 'No canvas active';
                        }
                        var programId = ctx.canvas.canvasId + cfg.type;

                        var program = programs[programId];
                        if (program) {
                            return programId;
                        }

                        var context = ctx.canvas.context;

                        program = {
                            programId : programId
                        };

                        /* Create program on canvas
                         */
                        program.program = context.createProgram();

                        /* Load fragment shaders
                         */
                        var fragmentShaders = [];
                        for (var i = 0; i < cfg.fragmentShaders.length; i++) {
                            var shader = loadShader(context, cfg.fragmentShaders[i], context.FRAGMENT_SHADER);
                            context.attachShader(program.program, shader);
                            fragmentShaders.push(shader);
                        }

                        /* Load vertex shaders
                         */
                        var vertexShaders = [];
                        for (var i = 0; i < cfg.vertexShaders.length; i++) {
                            var shader = loadShader(context, cfg.vertexShaders[i], context.VERTEX_SHADER);
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
                        program.getVarLocation = function() {
                            var locations = {};
                            return function(context, name) {
                                var loc = locations[name];
                                if (!loc) {
                                    loc = context.getAttribLocation(activeProgram.program, name);
                                    if (loc == -1) {
                                        loc = context.getUniformLocation(activeProgram.program, name);
                                        if (loc == -1) {
                                            throw 'Variable not found in active shader: \'' + name + '\'';
                                        }
                                    }
                                    locations[name] = loc;
                                }
                                return loc;
                            };
                        };

                        programs[programId] = program;
                        return programId;
                    };

                    /** Activates the loaded program of the given ID
                     */
                    this.activateProgram = function(programId) {
                        if (!ctx.canvas) {
                            throw 'No canvas active';
                        }
                        activeProgram = programs[programId];
                        ctx.canvas.context.useProgram(activeProgram.program);
                        vars = {
                            vars: {},
                            fixed: true
                        };
                    };

                    /** Returns the ID of the currently active program 
                     */
                    this.getActiveProgramId = function() {
                        return activeProgram ? activeProgram.programId : null;
                    };

                    this.setVar = function(name, value) {
                        if (!activeProgram) {
                            throw 'No shader active';
                        }
                        var setter = cfg.setters[name];
                        if (setter) {
                            setter.call(this, ctx.canvas.context, activeProgram.getVarLocation, value);
                        }
                    };

                    /**
                     * Sets vars on the active program; for each element in the vars, the setter of the
                     * same name is called if it exists, passing the element's value into it. The program will
                     * set defaults on itself where vars are not supplied.
                     */
                    this.setVars = function(v) {
                        if (!activeProgram) {
                            throw 'No shader active';
                        }
                        for (var key in cfg.setters) {
                            cfg.setters[key].call(this, ctx.canvas.context,
                                    activeProgram.getVarLocation, v.vars[key]); // Defaults on null
                        }
                        vars = v;
                    };

                    this.getVars = function() {
                        return vars;
                    };

                    /** Deactivates the currently active program
                     */
                    this.deactivateProgram = function() {
                        if (!activeProgram) {
                            throw 'No shader active';
                        }
                        ctx.canvas.context.flush();
                        //  cfg.context.swapBuffers();
                        activeProgram = null;
                        ctx.canvas.context.useProgram(0); // Switch GL to use fixed-function paths
                    };
                };
            }
        };

        this.loadProgram = function() {
            return ctx.programs.loadProgram();
        };

        this.activateProgram = function(programId) {
            ctx.programs.activateProgram(programId);
        };

        this.getActiveProgramId = function() {
            return ctx.programs.getActiveProgramId();
        };

        this.setVars = function(vars) {
            ctx.programs.setVars(vars);
        };

        this.deactivateProgram = function() {
            ctx.programs.deactivateProgram();
        };
    })();
};