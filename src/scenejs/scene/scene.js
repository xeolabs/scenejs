new (function() {

    var initialised = false; // True as soon as first scene registered
    var scenes = {};
    var nScenes = 0;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.RESET,
            function() {
                scenes = {};
                nScenes = 0;
            });

    function findLoggingElement(loggingElementId) {
        var element;
        if (!loggingElementId) {
            element = document.getElementById(Scene.DEFAULT_LOGGING_ELEMENT_ID);
            if (!element) {
                SceneJS_loggingModule.info("SceneJS.Scene config 'loggingElementId' omitted and failed to find default logging element with ID '"
                        + Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - that's OK, logging to browser console instead");
            }
        } else {
            element = document.getElementById(loggingElementId);
            if (!element) {
                element = document.getElementById(Scene.DEFAULT_LOGGING_ELEMENT_ID);
                if (!element) {
                    SceneJS_loggingModule.info("SceneJS.Scene config 'loggingElementId' unresolved and failed to find default logging element with ID '"
                            + Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - that's OK, logging to browser console instead");
                } else {
                    SceneJS_loggingModule.info("SceneJS.Scene config 'loggingElementId' unresolved - found default logging element with ID '"
                            + Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - logging to browser console also");
                }
            } else {
                SceneJS_loggingModule.info("SceneJS.Scene logging to element with ID '"
                        + loggingElementId + "' - logging to browser console also");
            }
        }
        return element;
    }

    /** Locates canvas in DOM, finds WebGL context on it, sets some default state on the context, then returns
     *  canvas, canvas ID and context wrapped up in an object.
     *
     * If canvasId is null, will fall back on Scene.DEFAULT_CANVAS_ID
     */
    function findCanvas(canvasId, contextAttr) {
        var canvas;
        if (!canvasId) {
            SceneJS_loggingModule.info("Scene attribute 'canvasId' omitted - looking for default canvas with ID '"
                    + Scene.DEFAULT_CANVAS_ID + "'");
            canvasId = Scene.DEFAULT_CANVAS_ID;
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                throw SceneJS_errorModule.fatalError(
                        SceneJS.errors.CANVAS_NOT_FOUND,
                        "Scene failed to find default canvas with ID '"
                                + Scene.DEFAULT_CANVAS_ID + "'");
            }
        } else {
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                SceneJS_loggingModule.warn("Scene config 'canvasId' unresolved - looking for default canvas with " +
                                           "ID '" + Scene.DEFAULT_CANVAS_ID + "'");
                canvasId = Scene.DEFAULT_CANVAS_ID;
                canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw SceneJS_errorModule.fatalError(SceneJS.errors.CANVAS_NOT_FOUND,
                            "Scene attribute 'canvasId' does not match any elements in the page and no " +
                            "default canvas found with ID '" + Scene.DEFAULT_CANVAS_ID + "'");
                }
            }
        }

        // If the canvas uses css styles to specify the sizes make sure the basic
        // width and height attributes match or the WebGL context will use 300 x 150
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        var context;
        var contextNames = SceneJS.SUPPORTED_WEBGL_CONTEXT_NAMES;
        for (var i = 0; (!context) && i < contextNames.length; i++) {
            try {
                if (SceneJS_debugModule.getConfigs("webgl.logTrace") == true) {
                    context = canvas.getContext(contextNames[i] /*, { antialias: true} */, contextAttr);
                    if (context) {
                        context = WebGLDebugUtils.makeDebugContext(
                                context,
                                function(err, functionName, args) {
                                    SceneJS_loggingModule.error(
                                            "WebGL error calling " + functionName +
                                            " on WebGL canvas context - see console log for details");
                                });
                        context.setTracing(true);
                    }
                } else {
                    context = canvas.getContext(contextNames[i], contextAttr);
                }
            } catch (e) {
            }
        }
        if (!context) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.WEBGL_NOT_SUPPORTED,
                    'Canvas document element with ID \''
                            + canvasId
                            + '\' failed to provide a supported WebGL context');
        }
        try {
            context.clearColor(0.0, 0.0, 0.0, 1.0);
            context.clearDepth(1.0);
            context.enable(context.DEPTH_TEST);
            context.disable(context.CULL_FACE);
            context.depthRange(0, 1);
            context.disable(context.SCISSOR_TEST);
        } catch (e) {
            throw SceneJS_errorModule.fatalError(// Just in case we get a context but can't get any functionson it
                    SceneJS.errors.WEBGL_NOT_SUPPORTED,
                    'Canvas document element with ID \''
                            + canvasId
                            + '\' provided a supported WebGL context, but functions appear to be missing');
        }
        return {
            canvas: canvas,
            context: context,
            canvasId : canvasId
        };
    }

    function getSceneContext(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS_errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        return scene.canvas.context;
    }

    function getAllScenes() {
        var list = [];
        for (var id in scenes) {
            var scene = scenes[id];
            if (scene) {
                list.push(scene.scene);
            }
        }
        return list;
    }

    function deactivateScene() {

    }

    var Scene = SceneJS.createNodeType("scene");

    Scene.prototype._init = function(params) {

        if (!params.canvasId) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.ILLEGAL_NODE_CONFIG, "Scene canvasId expected");
        }

        this._loggingElementId = params.loggingElementId;
        this._destroyed = false;
        this.scene = this;
        this.nodeMap = new SceneJS_Map(); // Can auto-generate IDs when not supplied
        this._layers = params.layers || {};

        this.canvas = findCanvas(params.canvasId, params.contextAttr); // canvasId can be null

        var sceneId = this.attr.id;
        scenes[sceneId] = {
            sceneId: sceneId,
            scene: this,
            canvas: this.canvas,
            loggingElement: findLoggingElement(this._loggingElementId) // loggingElementId can be null
        };
        nScenes++;

        if (!initialised) {
            SceneJS_loggingModule.info("SceneJS V" + SceneJS.VERSION + " initialised");
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.INIT);
            initialised = true;
        }

        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_CREATED, { sceneId : sceneId, canvas: this.canvas });
        SceneJS_loggingModule.info("Scene defined: " + sceneId);
        SceneJS_compileModule.nodeUpdated(this, "created");
    };

    /** ID of canvas SceneJS looks for when {@link Scene} node does not supply one
     */
    Scene.DEFAULT_CANVAS_ID = "_scenejs-default-canvas";

    /** ID ("_scenejs-default-logging") of default element to which {@link Scene} node will log to, if found.
     */
    Scene.DEFAULT_LOGGING_ELEMENT_ID = "_scenejs-default-logging";

    /** Returns the Z-buffer depth in bits of the webgl context that this scene is to bound to.
     */
    Scene.prototype.getZBufferDepth = function() {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        var context = this.canvas.context;
        return context.getParameter(context.DEPTH_BITS)
    };

    /**
     Sets which layers are included in the each render of the scene, along with their priorities (default priority is 0)
     */
    Scene.prototype.setLayers = function(layers) {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        this._layers = layers || {};
    };

    /**
     Gets which layers are included in the each render of this scene, along with their priorities (default priority is 0)
     */
    Scene.prototype.getLayers = function() {
        return this._layers;
    };

    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    /**
     * Starts the render loop for this scene
     */
    Scene.prototype.start = function(cfg) {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }

        var getFPS = this._setupFps();

        if (!this._running || this._paused) {
            cfg = cfg || {};

            this._running = true;
            this._paused = false;

            var self = this;
            var fnName = "__scenejs_sceneLoop" + this.attr.id;

            var sleeping = false;

            SceneJS_compileModule.nodeUpdated(this, "start");

            window[fnName] = function() {
                if (self._running && !self._paused) { // idleFunc may have stopped render loop
                    if (cfg.idleFunc) {
                        cfg.idleFunc();
                    }
                    var compileFlags = SceneJS_compileModule.beginSceneCompile(self.attr.id);
                    if (compileFlags.level != SceneJS_compileModule.COMPILE_NOTHING) {          // level could be REDRAW
                        SceneJS_DrawList.bindScene({ sceneId: self.attr.id }, {
                            compileMode: compileFlags.level == SceneJS_compileModule.COMPILE_EVERYTHING ?
                                         SceneJS_DrawList.COMPILE_SCENE : SceneJS_DrawList.COMPILE_NODES,
                            resort: compileFlags.resort });
                        self._compileWithEvents();
                        sleeping = false;
                        SceneJS_compileModule.finishSceneCompile();
                        SceneJS_layerModule.setActiveLayers(self._layers);   // TODO: needed for display list redraw when scene node not compiled - need to tidy up placementof this

                        SceneJS_DrawList.renderFrame({ profileFunc: cfg.profileFunc });

                        if (cfg.frameFunc) {
                            cfg.frameFunc({
                                fps: getFPS()
                            });
                        }

                        requestAnimFrame(window[fnName]);
                    } else {
                        if (!sleeping && cfg.sleepFunc) {
                            cfg.sleepFunc();
                        }
                        sleeping = true;
                        requestAnimFrame(window[fnName]);
                    }
                } else {
                    requestAnimFrame(window[fnName]);
                }
            };
            this._startCfg = cfg;
            requestAnimFrame(window[fnName]); // Push one frame immediately
        }
    };

    Scene.prototype._setupFps = function() {
        var lastTime = new Date();
        var hits = 0;
        var fps = 0;
        return function() {
            hits++;
            var nowTime = new Date();
            if ((nowTime.getTime() - lastTime.getTime()) > 1000) {
                var dt = nowTime.getTime() - lastTime.getTime();
                fps = Math.round(hits * 1000 / dt);
                hits = 0;
                lastTime = nowTime;
            }
            return fps;
        };
    };

    /** Pauses/unpauses current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
     */
    Scene.prototype.pause = function(doPause) {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        if (this._running && this._created) {
            this._paused = doPause;
        }
    };

    /** Returns true if the scene is currently rendering repeatedly in a loop after being started with {@link #start}.
     */
    Scene.prototype.isRunning = function() {
        return this._running;
    };

    /**
     * Picks whatever geometry will be rendered at the given canvas coordinates.
     */
    Scene.prototype.pick = function(canvasX, canvasY, options) {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        if (!SceneJS_DrawList.pick({
            sceneId: this.attr.id,
            canvasX : canvasX,
            canvasY : canvasY }, options)) {
            this._fireEvent("notpicked", { }, options);
        }
    };

    Scene.prototype._compile = function() {
        SceneJS._actionNodeDestroys();                          // Do first to avoid clobbering allocations by node compiles

        var sceneId = this.attr.id;
        var scene = scenes[sceneId];

        SceneJS_eventModule.fireEvent(SceneJS_eventModule.LOGGING_ELEMENT_ACTIVATED, { loggingElement: scene.loggingElement });
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_COMPILING, { sceneId: sceneId, nodeId: sceneId, canvas : scene.canvas });

        if (SceneJS_compileModule.preVisitNode(this)) {
            SceneJS_layerModule.setActiveLayers(this._layers);  // Activate selected layers - all layers active when undefined
            this._compileNodes();
        }
        SceneJS_compileModule.postVisitNode(this);
        deactivateScene();
    };

    /**
     * Scene node's destroy handler, called by {@link SceneJS_node#destroy}
     * @private
     */
    Scene.prototype._destroy = function() {
        if (!this._destroyed) {
            this.stop();

            this._destroyed = true;

            var sceneId = this.attr.id;
            scenes[sceneId] = null;
            nScenes--;

            SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_DESTROYED, {sceneId : sceneId });
            SceneJS_loggingModule.info("Scene destroyed: " + sceneId);

            if (nScenes == 0) {
                SceneJS_loggingModule.info("SceneJS reset");
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.RESET);
            }
        }
    };

    /** Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
     * when you render it.
     */
    Scene.prototype.isActive = function() {
        return !this._destroyed;
    };

    /** Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
     */
    Scene.prototype.stop = function() {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        if (this._running) {
            this._running = false;
            window["__scenejs_compileScene" + this.attr.id] = null;
            if (!this._startCfg.requestAnimFrame) {
                window.clearInterval(this._pInterval);
            }
        }
    };

    /** Determines if node exists in this scene
     */
    Scene.prototype.containsNode = function(nodeId) {
        if (this._destroyed) {
            throw SceneJS_errorModule.fatalError(SceneJS.errors.NODE_ILLEGAL_STATE, "Scene has been destroyed");
        }
        var node = this.nodeMap.items[nodeId];
        return (node) ? true : false;
    };

    Scene.prototype.findNode = function(nodeId) {
        //    if (!this._created) {
        //        throw SceneJS_errorModule.fatalError(
        //                SceneJS.errors.NODE_ILLEGAL_STATE,
        //                "Scene has been destroyed");
        //    }
        var node = this.nodeMap.items[nodeId];
        //    if (!node) {
        //        throw SceneJS_errorModule.fatalError(
        //                SceneJS.errors.NODE_ILLEGAL_STATE,
        //                "Node '" + nodeId + "' not found in scene '" + this.attr.id + "'");
        //    }
        return node ? SceneJS._selectNode(node) : null;
    };

    SceneJS.reset = function() {
        var scenes = getAllScenes();
        var temp = [];
        for (var i = 0; i < scenes.length; i++) {
            temp.push(scenes[i]);
        }
        while (temp.length > 0) {

            /* Destroy each scene individually so it they can mark itself as destroyed.
             * A RESET command will be fired after the last one is destroyed.
             */
            temp.pop().destroy();
        }
    };
})();