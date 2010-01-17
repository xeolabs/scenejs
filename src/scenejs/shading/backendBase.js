/**
 * Backend for shader scene nodes.
 *
 */
SceneJs.shaderBackend = function(cfg) {

    if (!cfg.type) {
        throw new SceneJs.exceptions.NodeConfigExpectedException("SceneJs.ShaderBackendBase mandatory config missing: \'type\'");
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

                    /** Other backends who want to know when a different program is activated; Eg. transform backends
                     * who need to reload their matrices into it.
                     */
                    var programActivationObservers = [];

                    var notifyProgramActivation = function() {
                        for (var i = 0; i < programActivationObservers.length; i++) {
                            programActivationObservers[i]();
                        }
                    };

                    /** Deletes a program and its shaders
                     */
                    var deleteProgram = function(program) {
                        if (document.getElementById(program.canvas.canvasId)) {  // Context can't exist if canvas not in DOM
                            while (program.fragmentShaders.length > 0) {
                                program.context.deleteShader(program.fragmentShaders.pop());
                            }
                            while (program.vertexShaders.length > 0) {
                                program.context.deleteShader(program.vertexShaders.pop());
                            }
                            program.context.deleteProgram(program.program);
                        }
                    };

                    /** Creates a program on the context of the given canvas, loads the configured
                     * shaders into it, links the shaders, then returns the ID of the program. If the
                     * program (one of the configured type on the given canvas) already exists, will just
                     * return the ID of the program.
                     *
                     * @param _cfg Config from backend extention, provides program for lazy-load
                     */
                    this.loadProgram = function(_cfg) {
                        if (!ctx.canvas) {
                            throw new SceneJs.exceptions.NoCanvasActiveException("No canvas active");
                        }
                        var programId = ctx.canvas.canvasId + ":" + _cfg.type;

                        /* Try to reuse cached program
                         */
                        var program = programs[programId];
                        if (program) {
                            return programId;
                        }

                        var context = ctx.canvas.context;

                        /* Create program on context
                         */
                        program = {
                            canvas : ctx.canvas,
                            context : context,
                            programId : programId,
                            program : context.createProgram(),
                            fragmentShaders: [],
                            vertexShaders: [],
                            setters: _cfg.setters,
                            binders: _cfg.binders
                        };

                        /* Load fragment shaders into context
                         */
                        for (var i = 0; i < _cfg.fragmentShaders.length; i++) {
                            var shader = loadShader(context, _cfg.fragmentShaders[i], context.FRAGMENT_SHADER);
                            context.attachShader(program.program, shader);
                            program.fragmentShaders.push(shader);
                        }

                        /* Load vertex shaders into context
                         */
                        for (var i = 0; i < _cfg.vertexShaders.length; i++) {
                            var shader = loadShader(context, _cfg.vertexShaders[i], context.VERTEX_SHADER);
                            context.attachShader(program.program, shader);
                            program.vertexShaders.push(shader);
                        }

                        /* Link program                        
                         */
                        context.linkProgram(program.program);

                        /* On link failure, delete program and shaders then throw exception
                         */
                        if (context.getProgramParameter(program.program, 0x8B82 /*gl.LINK_STATUS*/) != 1) {
                            deleteProgram(program);
                            throw new SceneJs.exceptions.ShaderLinkFailureException("Failed to link shader program: " + context.getProgramInfoLog(program.program));
                        }

                        /* Create variable location map on program
                         */
                        program.getVarLocation = (function() {
                            var locations = {};
                            return function(context, name) {
                                var loc = locations[name];
                                if (!loc) {
                                    loc = context.getAttribLocation(activeProgram.program, name);
                                    if (loc == -1) {
                                        loc = context.getUniformLocation(activeProgram.program, name);
                                        if (loc == -1) {
                                            throw new SceneJs.exceptions.ShaderVariableNotFoundException("Variable not found in active shader: \'" + name + "\'");
                                        }
                                    }
                                    locations[name] = loc;
                                }
                                return loc;
                            };
                        })();

                        /* Register the newly-created program
                         */
                        programs[programId] = program;
                        return programId;
                    };

                    /** Calls each setter on the active program, passing a null value to each. Each setter is responsible for
                     * injecting a default value into the scripts when null is given, safeguarding against them never
                     * being set a value.
                     */
                    var setVarDefaults = function() {
                        for (var key in activeProgram.setters) {
                            activeProgram.setters[key].call(this, ctx.canvas.context, activeProgram.getVarLocation, null);
                        }
                    };

                    /** Activates the loaded program of the given ID
                     */
                    this.activateProgram = function(programId) {
                        if (!ctx.canvas) {
                            throw new SceneJs.exceptions.NoCanvasActiveException("No canvas active");
                        }
                        activeProgram = programs[programId];
                        ctx.canvas.context.useProgram(activeProgram.program);
                        setVarDefaults();
                        vars = {
                            vars: {},
                            fixed: true // Cacheable vars by default 
                        };
                        notifyProgramActivation();
                    };

                    /** Returns the ID of the currently active program
                     */
                    this.getActiveProgramId = function() {
                        return activeProgram ? activeProgram.programId : null;
                    };

                    this.setVar = function(name, value) {
                        if (!activeProgram) {
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        var setter = activeProgram.setters[name];
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
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        for (var key in activeProgram.setters) {
                            activeProgram.setters[key].call(this, ctx.canvas.context,
                                    activeProgram.getVarLocation, v.vars[key]); // Defaults on null
                        }
                        vars = v;
                    };

                    /** Loads all set vars into the currently active program if they arent loaded already. This is
                     * called just before geometry is rendered to save inserting vars that might just get replaced
                     * before they are used.
                     */
                    this.loadVars = function() {
                        for (var key in activeProgram.setters) {
                            var v = vars.vars[key];
                            activeProgram.setters[key].call(this, ctx.canvas.context, activeProgram.getVarLocation, v); // Defaults on null
                        }
                    };

                    this.getVars = function() {
                        return vars;
                    };

                    /** Binds the given vertex buffer to be the vertex source for the active program
                     */
                    this.bindVertexBuffer = function(buffer) {
                        if (!activeProgram) {
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        activeProgram.binders.bindVertexBuffer.call(this, ctx.canvas.context, activeProgram.getVarLocation, buffer);
                    };

                    /** Binds the given normals buffer to be the normals source for the active program
                     */
                    this.bindNormalBuffer = function(buffer) {
                        if (!activeProgram) {
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        activeProgram.binders.bindNormalBuffer.call(this, ctx.canvas.context, activeProgram.getVarLocation, buffer);
                    };

                    /** Binds the given texture buffer to be the texture source for the active program
                     */
                    this.bindTextureBuffer = function(buffer) {
                        if (!activeProgram) {
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        if (activeProgram.binders.bindTextureBuffer) { // Texture support optional in shader
                            activeProgram.binders.bindTextureBuffer.call(this, ctx.canvas.context, activeProgram.getVarLocation, buffer);
                        }
                    };

                    /** Deactivates the currently active program
                     */
                    this.deactivateProgram = function() {
                        if (!activeProgram) {
                            throw new SceneJs.exceptions.NoShaderActiveException("No shader active");
                        }
                        ctx.canvas.context.flush();
                        activeProgram = null;
                        ctx.canvas.context.useProgram(null); // Switch GL to use fixed-function paths
                    };

                    /** Deletes all programs
                     */
                    this.deletePrograms = function() {
                        for (var programId in programs) {
                            deleteProgram(programs[programId]);
                        }
                        programs = {};
                        activeProgram = null;
                        vars = {};
                    };

                    /** Register an observer to notify when a new program is activated
                     */
                    this.onProgramActivate = function(f) {
                        programActivationObservers.push(f);
                    };
                };
            }
        };

        /* Methods for client shader node.
         */

        this.loadProgram = function() {
            return ctx.programs.loadProgram(cfg); // Backend extension config is used when lazy-creating program
        };

        this.activateProgram = function(programId) {
            ctx.programs.activateProgram(programId);
        };

        /* Shader node needs to know to release its program if the super canvas node
         * has dynamically switched to some other canvas.
         */
        this.getActiveCanvasId = function() {
            return ctx.canvas.canvasId;
        };

        this.getActiveProgramId = function() {
            return ctx.programs.getActiveProgramId();
        };

        this.setVars = function(vars) {
            ctx.programs.setVars(vars);
        };

        this.getVars = function() {
            return ctx.programs.getVars();
        };

        this.deactivateProgram = function() {
            ctx.programs.deactivateProgram();
        };

        /** Frees resources (programs and their shaders) held by this backend
         */
        this.reset = function() {
            ctx.programs.deletePrograms();
        };
    })();
};