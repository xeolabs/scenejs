/**
 * Backend for shader scene nodes.
 *
 */
SceneJS._backends.installBackend(

        "shader",

        function(ctx) {

            var time = (new Date()).getTime();      // For LRU caching
            var canvas;                             // Currently active canvas
            var programs = {};                      // Buffered programs for all existing canvases
            var activeProgram = null;               // Currently active program
            var textureEnabled = false;             // Tracks whether scene texture enabled or not

            var vars = {                            // Vars on currently active program
                vars: {},
                fixed: true
            };

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        activeProgram = null;
                        vars = {
                            vars: {},
                            fixed: true
                        };
                        textureEnabled = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        activeProgram = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        activeProgram = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        for (var programId in programs) {
                            programs[programId].destroy();
                        }
                        canvas = null;
                        programs = {};
                        activeProgram = null;
                        vars = {
                            vars: {},
                            fixed: true
                        };
                        textureEnabled = false;
                    });

            /* Texturing has been disabled - if we're currently using the default shader,
             * switch to the default texturing shader
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURE_ENABLED,
                    function() {
                        textureEnabled = true;
                    });

            /* Texturing has been disabled - if we're currently using the default shader,
             * switch to the default non-texturing shader
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURE_DISABLED,
                    function() {
                        textureEnabled = false;
                    });

            /**
             * Registers this backend module with the memory management module as willing
             * to attempt to destroy a shader when asked, in order to free up memory. Eviction
             * is done on a least-recently-used basis, where a shader may be evicted if the
             * time that it was last used is the earliest among all shaders, and after the current
             * system time. Since system time is updated just before scene traversal, this ensures that
             * shaders previously or currently active during this traversal are not suddenly evicted.
             */
            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time; // Dont evict programs that we have traversed into
                        var programToEvict;
                        for (var id in programs) {
                            if (id) {
                                var program = programs[id];
                                if (program.lastUsed < earliest) {
                                    programToEvict = program;
                                    earliest = programToEvict.lastUsed;
                                }
                            }
                        }
                        if (programToEvict) { // Delete LRU program's shaders and deregister program
                            ctx.logging.info("Evicting shader: " + id);
                            programToEvict.destroy();
                            programs[programToEvict.programId] = undefined;
                            return true;
                        }
                        return false;   // Couldnt find suitable program to delete
                    });

            /**
             * If geometry about to render and no shader active, then we had better load a
             * default one, with or without texture support, depending on whether texturing is
             * enabled and a texture is currently active.
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_RENDERING,
                    function() {
                        if (!activeProgram) {

                        }
                    });

            /** Handle a uniform load request
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_UNIFORM_SET,
                    function(params) {
                        if (!activeProgram) { // Not likely since geometry backend prompted this event
                            throw new SceneJS.exceptions.NoShaderActiveException("No shader active");
                        }
                        activeProgram.setUniform(params[0], params[1]); // name, value                        
                    });


            /** Handle texture sampler bind request
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_SAMPLER_BIND,
                    function(params) {
                        if (!activeProgram) {
                            throw new SceneJS.exceptions.NoShaderActiveException("No shader active");
                        }
                        activeProgram.bindTexture(params[0], params[1]); // name, texture
                    });

            /** Handle a vertex array buffer bind request
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ARRAY_BUFFER_BIND,
                    function(params) {
                        if (!activeProgram) {
                            throw new SceneJS.exceptions.NoShaderActiveException("No shader active");
                        }
                        activeProgram.bindArrayBuffer(params[0], params[1]); // name, buffer
                    });

            return { // Node-facing API

                /** Creates a shader program, if it doesn't exist already, from the given vertex and fragment shader
                 * sources and returns its ID. The type uniquely identifies the program on the current canvas.
                 */
                createProgram : function(type, vertexShaders, fragmentShaders) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var programId = canvas.canvasId + ":" + type;
                    if (!programs[programId]) {
                        ctx.memory.allocate(
                                "shader",
                                function() {
                                    programs[programId] = new SceneJS._webgl.Program(
                                            type,
                                            programId,
                                            time,
                                            canvas.context,
                                            vertexShaders,
                                            fragmentShaders,
                                            ctx.logging);
                                });
                    }
                    return programId;
                },

                /** Activates the shader program of the given ID
                 */
                activateProgram : function(programId) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    activeProgram = programs[programId];
                    activeProgram.lastUsed = time;
                    activeProgram.bind();
                    ctx.events.fireEvent(SceneJS._eventTypes.SHADER_ACTIVATED, {});
                },

                /** Returns the ID of the currently active shader program
                 */
                getActiveProgramId : function() {
                    return activeProgram ? activeProgram.programId : null;
                },

                /** Deactivates the currently active shader program
                 */
                deactivateProgram : function() {
                    if (activeProgram) {
                        canvas.context.flush();
                        activeProgram.unbind();
                        activeProgram = null;
                        ctx.events.fireEvent(SceneJS._eventTypes.SHADER_DEACTIVATED, {});
                    }
                }
            };
        });
