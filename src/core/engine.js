/**
 * @class A container for a scene graph and its display
 *
 *
 * @private
 */
var SceneJS_Engine = function(json, options) {

    json.type = "scene"; // The type property supplied by user on the root JSON node is ignored - would always be 'scene'

    /**
     * ID of this engine, also the ID of this engine's {@link SceneJS.Scene}
     * @type String
     */
    this.id = json.id;

    /**
     * Canvas and GL context for this engine
     */
    this.canvas = new SceneJS_Canvas(this.id, json.canvasId, json.contextAttr, options);

    /**
     * Manages firing of and subscription to events
     */
    this.events = new SceneJS_eventManager();

    this.events.createEvent("started");
    this.events.createEvent("idle");
    this.events.createEvent("rendered");
    this.events.createEvent("sleep");
    this.events.createEvent("stopped");
    this.events.createEvent("loading");     // Loading processes now exist
    this.events.createEvent("loaded");      // No loading processes now exist
    this.events.createEvent("destroyed");

    /**
     * State core factory - creates, stores, shares and destroys cores
     */
    this._coreFactory = new SceneJS_CoreFactory();

    /**
     * Manages creation, recycle and destruction of {@link SceneJS.Node} instances for this engine's scene graph
     */
    this._nodeFactory = new SceneJS_NodeFactory();

    /**
     * The engine's scene renderer
     * @type SceneJS_Display
     */
    this.display = new SceneJS_Display({
        canvas:  this.canvas
    });

    /**
     * Flags the entirety of the scene graph as needing to be (re)compiled into the display
     */
    this.sceneDirty = false;

    /**
     * Flag set when at least one branch of the scene graph needs recompilation
     */
    this._sceneBranchesDirty = false;

    /**
     * List of nodes scheduled for destruction by #destroyNode
     * Destructions are done in a batch at the end of each render so as not to disrupt the render.
     */
    this._nodesToDestroy = [];

    /**
     * Number of nodes in destruction list
     */
    this._numNodesToDestroy = 0;

    /**
     * Flag which is set while this engine is running - set after call to #start, unset after #stop or #pause
     */
    this.running = false;

    /**
     * Flag which is set while this engine is paused - set after call to #pause, unset after #stop or #start
     */
    this.paused = false;

    /**
     * Flag set once this engine has been destroyed
     */
    this.destroyed = false;

    /**
     * The current scene graph status
     */
    this.sceneStatus = {
        nodes: {},          // Status for each node 
        numLoading: 0       // Number of loads currently in progress
    };

    /**
     * The engine's scene graph
     * @type SceneJS.Scene
     */
    this.scene = this.createNode(json); // Scene back-references this engine, so is defined after other engine members

    var self = this;

    this.canvas.canvas.addEventListener(// WebGL context lost
            "webglcontextlost",
            function(event) {

                event.preventDefault();

                SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_LOST, { scene: self.scene });

            },
            false);

    this.canvas.canvas.addEventListener(// WebGL context recovered
            "webglcontextrestored",
            function(event) {

                event.preventDefault();

                self.canvas.initWebGL();

                self._coreFactory.webglRestored();  // Reallocate WebGL resources for node state cores

                self.display.webglRestored(); // Reallocate shaders and re-cache shader var locations for display state chunks

                SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_RESTORED, { scene: self.scene });
            },
            false);
};


/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the engine's constructor.
 */
SceneJS_Engine.prototype.loseWebGLContext = function() {
    this.canvas.loseWebGLContext();
};

/**
 * Recursively parse the given JSON scene graph representation and return a scene (sub)graph.
 *
 * @param {Object} json JSON definition of a scene graph or subgraph
 * @returns {SceneJS.Node} Root of the new (sub)graph
 */
SceneJS_Engine.prototype.createNode = function(json) {

    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default

    var core = this._coreFactory.getCore(json.type, json.coreId); // Create or share a core

    var node;

    //try {
    node = this._nodeFactory.getNode(this, json, core);

    SceneJS_events.fireEvent(SceneJS_events.NODE_CREATED, {
        sceneId: this.id, // Engine ID is same as scene ID
        nodeId: node.nodeId
    });


    //    } catch (e) {
    //
    //        this._coreFactory.putCore(core); // Clean up after node create failed
    //
    //        throw e;
    //    }

    if (json.nodes) {

        for (var i = 0, len = json.nodes.length; i < len; i++) { // Create sub-nodes
            node.addNode(this.createNode(json.nodes[i]));
        }
    }

    return node;
};

/**
 * Finds the node with the given ID in this engine's scene graph
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS_Engine.prototype.findNode = function(nodeId) {
    return this._nodeFactory.nodes.items[nodeId];
};

/** Finds nodes in this engine's scene graph that have nodes IDs matching the given regular expression
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS_Engine.prototype.findNodes = function(nodeIdRegex) {

    var regex = new RegExp(nodeIdRegex);
    var nodes = [];
    var nodeMap = this._nodeFactory.nodes.items;

    for (var nodeId in nodeMap) {
        if (nodeMap.hasOwnProperty(nodeId)) {

            if (regex.test(nodeId)) {
                nodes.push(nodeMap[nodeId]);
            }
        }
    }

    return nodes;
};

/**
 * Schedules the given subtree of this engine's {@link SceneJS.Scene} for recompilation
 *
 * @param {SceneJS.Node} node Root node of the subtree to recompile
 */
SceneJS_Engine.prototype.branchDirty = function(node) {

    if (this.sceneDirty) {
        return; // Whole scene will recompile anyway
    }

    /* Dealing with some weirdness with the embedded window and iframe / window fascism.
     */
    if (node == window) {
        return;
    }

    node.branchDirty = true;
    node.dirty = true;

    for (var n = node.parent; n && !(n.dirty || n.branchDirty); n = n.parent) { // Flag path down to this node
        n.dirty = true;
    }

    this._sceneBranchesDirty = true;
};


SceneJS_Engine.prototype.nodeLoading = function(node) {

    var nodeStatus = this.sceneStatus.nodes[node.id] || (this.sceneStatus.nodes[node.id] = { numLoading: 0 });

    nodeStatus.numLoading++;

    this.sceneStatus.numLoading++;

    this.events.fireEvent("loading", this.sceneStatus);
};

SceneJS_Engine.prototype.nodeLoaded = function(node) {

    var nodeStatus = this.sceneStatus.nodes[node.id];

    if (!nodeStatus) {
        return;
    }

    nodeStatus.numLoading--;

    this.sceneStatus.numLoading--;

    if (nodeStatus.numLoading == 0) {
        delete this.sceneStatus.nodes[node.id];
    }

    this.events.fireEvent("loaded", this.sceneStatus);
};


/**
 * Renders a single frame. Does any pending scene compilations or draw graph updates first.
 * Ordinarily the frame is rendered only if compilations or draw graph updates were performed,
 * but may be forced to render the frame regardless.
 *
 * @param {{String:String}} params Rendering parameters
 */
SceneJS_Engine.prototype.renderFrame = function(params) {

    if (this._tryCompile() || (params && params.force)) { // Do any pending (re)compilations

//        var eventParams = {
//            sceneId: this.id
//        };
//
        //self.events.fireEvent("idle", eventParams);

        this.display.render(params);

        return true;
    }

    return false;
};

/**
 * Starts the render loop on this engine.
 * @params cfg Render loop configs
 * @params cfg.idleFunc {Function} Callback to call on each loop iteration
 * @params cfg.frameFunc {Function} Callback to call after a render is done to update the scene image
 * @params cfg.sleepFunc {Function}
 */
SceneJS_Engine.prototype.start = function(cfg) {

    if (!this.running) {

        cfg = cfg || {};

        this.running = true;
        this.paused = false;

        var self = this;
        var fnName = "__scenejs_sceneLoop" + this.id;

        var sleeping = false;

        this.sceneDirty = true;

        var idleEventParams = {
            sceneId: this.id
        };

        self.events.fireEvent("started", idleEventParams);

        window[fnName] = function() {

            if (self.running && !self.paused) {  // idleFunc may have paused scene

                self.events.fireEvent("idle", idleEventParams);

                if (cfg.idleFunc) {
                    cfg.idleFunc();
                }

                if (!self.running) { // idleFunc may have destroyed scene
                    return;
                }

                if (self._tryCompile()) {         // Attempt pending compile and redraw

                    sleeping = false;

                    self.display.render();

                    self.events.fireEvent("rendered", idleEventParams);

                    if (cfg.frameFunc) {
                        cfg.frameFunc();
                    }

                    window.requestAnimationFrame(window[fnName]);

                } else {

                    if (!sleeping && cfg.sleepFunc) {
                        cfg.sleepFunc();
                    }

                    sleeping = true;

                    self.events.fireEvent("sleep", idleEventParams);

                    window.requestAnimationFrame(window[fnName]);
                }
            } else {

                window.requestAnimationFrame(window[fnName]);
            }
        };

        this._startCfg = cfg;

        window.requestAnimationFrame(window[fnName]);
    }
};

/**
 * Performs a pick on this engine and returns a hit record containing at least the name of the picked
 * scene object (as configured by SceneJS.Name nodes) and the canvas pick coordinates. Ordinarily, picking
 * is the simple GPU color-name mapped method, but this method can instead perform a ray-intersect pick
 * when the 'rayPick' flag is set on the options parameter for this method. For that mode, this method will
 * also find the intersection point on the picked object's near surface with a ray cast from the eye that passes
 * through the mouse position on the projection plane.
 *
 * @param {Number} canvasX X-axis canvas pick coordinate
 * @param {Number} canvasY Y-axis canvas pick coordinate
 * @param options Pick options
 * @param options.rayPick Performs additional ray-intersect pick when true
 * @returns The pick record
 */
SceneJS_Engine.prototype.pick = function(canvasX, canvasY, options) {

    this._tryCompile();  // Do any pending scene compilations

    var hit = this.display.pick({
        canvasX : canvasX,
        canvasY : canvasY,
        rayPick: options ? options.rayPick : false
    });

    if (hit) {
        hit.canvasX = canvasX;
        hit.canvasY = canvasY;
    }

    return hit;
};

/**
 * Performs any pending scene compilations or display rebuilds, returns true if any of those were done,
 * in which case a display re-render is then needed
 *
 * @returns {Boolean} True when any compilations or display rebuilds were done
 */
SceneJS_Engine.prototype._tryCompile = function() {

    if (this.display.imageDirty // Frame buffer needs redraw
            || this.display.drawListDirty // Draw list needs rebuild
            || this.display.stateSortDirty // Draw list needs to redetermine state order
            || this.display.stateOrderDirty // Draw list needs state sort
            || this.display.objectListDirty // Draw list needs to be rebuilt
            || this._sceneBranchesDirty // One or more branches in scene graph need (re)compilation
            || this.sceneDirty) { // Whole scene needs recompilation

        this._doDestroyNodes(); // Garbage collect destroyed nodes - node destructions set imageDirty true

        if (this._sceneBranchesDirty || this.sceneDirty) { // Need scene graph compilation

            SceneJS_events.fireEvent(SceneJS_events.SCENE_COMPILING, {  // Notify compilation support start
                engine: this                                            // Compilation support modules get ready
            });

            this.scene._compileNodes(); // Begin depth-first compilation descent into scene sub-nodes
        }

        this._sceneBranchesDirty = false;
        this.sceneDirty = false;

        return true; // Compilation was performed, need frame redraw now
    }

    return false;
};

/**
 * Pauses/unpauses the render loop
 * @param {Boolean} doPause Pauses or unpauses the render loop
 */
SceneJS_Engine.prototype.pause = function(doPause) {
    this.paused = doPause;
};

/**
 * Stops the render loop
 */
SceneJS_Engine.prototype.stop = function() {

    if (this.running) {

        this.running = false;
        this.paused = false;

        window["__scenejs_sceneLoop" + this.id] = null;

        this.events.fireEvent("stopped", { sceneId: this.id });
    }
};

/**
 * Destroys a node within this engine's {@link SceneJS.Scene}
 *
 * @param {SceneJS.Node} node Node to destroy
 */
SceneJS_Engine.prototype.destroyNode = function(node) {

    /* The node is actually scheduled for lazy destruction within the next invocation of #_tryCompile
     */
    this._nodesToDestroy[this._numNodesToDestroy++] = node;

    /* Stop tracking node's status
     */
    var nodeStatus = this.sceneStatus.nodes[node.id];

    if (nodeStatus) {
        this.sceneStatus.numLoading -= nodeStatus.numLoading;
        delete this.sceneStatus.nodes[node.id];
    }
};

/**
 * Performs pending node destructions. When destroyed, each node and its core is released back to the
 * node and core pools for reuse, respectively.
 */
SceneJS_Engine.prototype._doDestroyNodes = function() {

    var node;

    while (this._numNodesToDestroy > 0) {

        node = this._nodesToDestroy[--this._numNodesToDestroy];

        node._doDestroy();

        this._coreFactory.putCore(node._core);    // Release state core for reuse

        this._nodeFactory.putNode(node);         // Release node for reuse
    }
};

/**
 * Destroys this engine
 */
SceneJS_Engine.prototype.destroy = function() {

    this.destroyed = true;

    this.events.fireEvent("destroyed", { sceneId: this.id });
};

/*---------------------------------------------------------------------------------------------------------------------
 * JavaScript augmentations to support render loop
 *--------------------------------------------------------------------------------------------------------------------*/

if (! self.Int32Array) {
    self.Int32Array = Array;
    self.Float32Array = Array;
}

// Ripped off from THREE.js - https://github.com/mrdoob/three.js/blob/master/src/Three.js
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                || window[vendors[x] + 'RequestCancelAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            },
                    timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
