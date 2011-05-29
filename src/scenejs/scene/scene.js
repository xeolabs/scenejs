/**
 *@class Root node of a SceneJS scene graph.
 *@extends SceneJS.Node
 */
SceneJS.Scene = SceneJS.createNodeType("scene");

// @private
SceneJS.Scene.prototype._init = function(params) {
    if (params.canvasId) {
        this._canvasId = document.getElementById(params.canvasId) ? params.canvasId : SceneJS.Scene.DEFAULT_CANVAS_ID;
    } else {
        this._canvasId = SceneJS.Scene.DEFAULT_CANVAS_ID;
    }
    this._loggingElementId = params.loggingElementId;
    this.setLayers(params.layers);
    this._destroyed = false;
    this._scene = this;
};

/** ID of canvas SceneJS looks for when {@link SceneJS.Scene} node does not supply one
 */
SceneJS.Scene.DEFAULT_CANVAS_ID = "_scenejs-default-canvas";

/** ID ("_scenejs-default-logging") of default element to which {@link SceneJS.Scene} node will log to, if found.
 */
SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID = "_scenejs-default-logging";

/** Returns the ID of the canvas element that this scene is to bind to. When no canvasId was configured, it will be the
 * the default ID of "_scenejs-default-canvas".
 */
SceneJS.Scene.prototype.getCanvasId = function() {
    return this._canvasId;
};

/** Returns the Z-buffer depth in bits of the webgl context that this scene is to bound to.
 */
SceneJS.Scene.prototype.getZBufferDepth = function() {
    var context;
    if (this._created) {
        context = SceneJS_sceneModule.getSceneContext(this._attr.id);
        return context.getParameter(context.DEPTH_BITS)
    }
    return context;
};

/**
 Sets which layers are included in the each render of the scene, along with their priorities (default priority is 0)
 */
SceneJS.Scene.prototype.setLayers = function(layers) {
    this._layers = layers || {};
};

/**
 Gets which layers are included in the each render of this scene, along with their priorities (default priority is 0)
 */
SceneJS.Scene.prototype.getLayers = function() {
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
 * Starts the scene rendering repeatedly in a loop.
 */
SceneJS.Scene.prototype.start = function(cfg) {
    if (this._destroyed) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_ILLEGAL_STATE,
                "Attempted start on Scene that has been destroyed");
    }

    /*
     * Lazy scene creation
     */
    if (!this._created) {
        SceneJS_sceneModule.createScene(this, {
            canvasId: this._canvasId,
            loggingElementId: this._loggingElementId,
            sceneId: this._attr.id
        });
        this._created = true;
    }

    if (!this._running || this._paused) {
        cfg = cfg || {};

        this._running = true;
        this._paused = false;

        var self = this;
        var fnName = "__scenejs_compileScene" + this._attr.id;

        /* Render loop
         */
        var sleeping = false;

        SceneJS_compileModule.nodeUpdated(this, "start");

        window[fnName] = function() {

            if (self._running && !self._paused) { // idleFunc may have stopped render loop

                if (cfg.idleFunc) {
                    cfg.idleFunc();
                }

                if (SceneJS_compileModule.scheduleCompilations(self._attr.id)) {

                    self._compileWithEvents();

                    sleeping = false;

                } else {
                    if (!sleeping && cfg.sleepFunc) {
                        cfg.sleepFunc();
                    }
                    sleeping = true;
                }
            }
        };

        if (cfg.requestAnimationFrame === true) {
            (function animloop() {
                if (window[fnName]) {
                    window[fnName]();
                    requestAnimFrame(animloop);
                }
            })();
        } else {
            this._pInterval = setInterval("window['" + fnName + "']()", 1000.0 / (cfg.fps || 60));
        }

        this._startCfg = cfg;

        /* Push one frame immediately        
         */
        window[fnName]();
    }
};

/** Pauses/unpauses current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.pause = function(doPause) {
    if (this._running && this._created) {
        this._paused = doPause;
    }
};

/** Returns true if the scene is currently rendering repeatedly in a loop after being started with {@link #start}.
 */
SceneJS.Scene.prototype.isRunning = function() {
    return this._running;
};

/**
 * Renders one frame of the scene. If started, schedules a frame to be rendered on next interval,
 * otherwise immediately renders a frame.
 */
SceneJS.Scene.prototype.render = function() {
    if (this._destroyed) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_ILLEGAL_STATE,
                "Attempted render on Scene that has been destroyed");
    }

    /*
     * Lazy scene creation
     */
    if (!this._created) {
        SceneJS_sceneModule.createScene(this, {
            canvasId: this._canvasId,
            loggingElementId: this._loggingElementId,
            sceneId: this._attr.id
        });
        this._created = true;
    }

    if (!this._running) {
        this._compileWithEvents();
    }
};


/**
 * Picks whatever geometry will be rendered at the given canvas coordinates.
 */
SceneJS.Scene.prototype.pick = function(canvasX, canvasY, options) {
    if (this._destroyed) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_ILLEGAL_STATE,
                "Attempted pick on Scene that has been destroyed");
    }
    if (!this._created) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_ILLEGAL_STATE,
                "Attempted pick on Scene that has not been rendered");
    }

    if (!SceneJS_renderModule.pick({
        sceneId: this._attr.id,
        canvasX : canvasX,
        canvasY : canvasY }, options)) {

        this._fireEvent("notpicked", { }, options);
    }
};

SceneJS.Scene.prototype._compile = function() {
    SceneJS._actionNodeDestroys();                          // Do first to avoid clobbering allocations by node compiles                     
    SceneJS_sceneModule.activateScene(this._attr.id);
    if (SceneJS_compileModule.preVisitNode(this)) {
        SceneJS_layerModule.setActiveLayers(this._layers);  // Activate selected layers - all layers active when undefined
        var traversalContext = {};
        this._compileNodes(traversalContext);
    }
    SceneJS_compileModule.postVisitNode(this);
    SceneJS_sceneModule.deactivateScene();
};

/**
 * Returns count of active processes.
 */
SceneJS.Scene.prototype.getNumProcesses = function() {
    return this._created ? SceneJS_processModule.getNumProcesses(this._attr.id) : 0;
};

/**
 * Scene node's destroy handler, called by {@link SceneJS.Node#destroy}
 * @private
 */
SceneJS.Scene.prototype._destroy = function() {
    if (this._created) {
        this.stop();
        SceneJS_sceneModule.destroyScene(this._attr.id); // Last one fires RESET command
        this._created = false;
        this._destroyed = true;
    }
};

/** Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function() {
    return this._created;
};

/** Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.stop = function() {
    if (this._running && this._created) {
        this._running = false;
        window["__scenejs_compileScene" + this._attr.id] = null;
        if (!this._startCfg.requestAnimFrame) {
            window.clearInterval(this._pInterval);
        }
    }
};

/** Determines if node exists in this scene
 */
SceneJS.Scene.prototype.containsNode = function(nodeId) {
    if (!this._created) {
        return null;
    }
    var scene = SceneJS_sceneModule.scenes[this._attr.id];
    if (!scene) {
        return false;
    }
    var node = scene.nodeMap.items[nodeId]
    return node != null && node != undefined;
};

/** Finds a node within this scene
 */
SceneJS.Scene.prototype.findNode = function(nodeId) {
    if (!this._created) {
        throw SceneJS_errorModule.fatalError(
                SceneJS.errors.NODE_ILLEGAL_STATE,
                "Scene has been destroyed");
    }
    var scene = SceneJS_sceneModule.scenes[this._attr.id];
    return scene.nodeMap.items[nodeId];
};

/** Total SceneJS reset - destroys all scenes and cached resources.
 */
SceneJS.reset = function() {
    var scenes = SceneJS_sceneModule.getAllScenes();
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

