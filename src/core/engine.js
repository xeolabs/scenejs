/**
 * @class A container for a scene graph and its display
 *
 *
 * @private
 */
var SceneJS_Engine = function (json, options) {
    json.type = "scene"; // The type property supplied by user on the root JSON node is ignored - would always be 'scene'

    /**
     * ID of this engine, also the ID of this engine's {@link SceneJS.Scene}
     * @type String
     */
    this.id = json.id;


    /**
     * Number of times the scene is drawn each time it's rendered.
     * <p>This is useful for when we need to do things like render for left and right eyes.
     * @type {*|number}
     */
    this._numPasses = json.numPasses || 1;

    /**
     * Canvas and GL context for this engine
     */
    this.canvas = new SceneJS_Canvas(this.id, json.canvasId, json.contextAttr, options);

    /**
     * Manages firing of and subscription to events
     */
    this.events = new SceneJS_eventManager();

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
        canvas: this.canvas,
        transparent: json.transparent,
        dof: json.dof
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
     * Frame rate. 0 means as fast as the browser will render.
     */
    this.fps = json.fps || 0;

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
        nodes: {}, // Status for each node
        numTasks: 0  // Number of loads currently in progress
    };

    var self = this;


    // Create scene root first, then create its subnodes
    // This way nodes can access the scene in their constructors
    var nodes = json.nodes;
    json.nodes = null;
    this.scene = this.createNode(json); // Create scene root

    if (nodes) {
        json.nodes = nodes;
        this.scene.addNodes(nodes); // then create sub-nodes
    }

    this.canvas.canvas.addEventListener(// WebGL context lost
        "webglcontextlost",
        function (event) {
            event.preventDefault();
            self.stop();
            SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_LOST, { scene: self.scene });
        },
        false);

    this.canvas.canvas.addEventListener(// WebGL context recovered
        "webglcontextrestored",
        function (event) {
            self.canvas.initWebGL();
            self._coreFactory.webglRestored();  // Reallocate WebGL resources for node state cores
            self.display.webglRestored(); // Reallocate shaders and re-cache shader var locations for display state chunks
            SceneJS_events.fireEvent(SceneJS_events.WEBGL_CONTEXT_RESTORED, { scene: self.scene });
            self.start();
        },
        false);
};

/**
 * Sets the number of times the scene is drawn on each render.
 * <p>This is useful for when we need to do things like render for left and right eyes.
 * @param {Number} numPasses The number of times the scene is drawn on each frame.
 * @see #getTagMask
 * @see SceneJS.Tag
 */
SceneJS_Engine.prototype.setNumPasses = function (numPasses) {
    this._numPasses = numPasses;
};

/**
 * Simulate a lost WebGL context.
 * Only works if the simulateWebGLContextLost was given as an option to the engine's constructor.
 */
SceneJS_Engine.prototype.loseWebGLContext = function () {
    this.canvas.loseWebGLContext();
};

/**
 * Gets/loads the given node type
 *
 * @param {String} type Node type name
 * @param {Function(Function)} ok Callback fired when type loaded, returns the type constructor
 */
SceneJS_Engine.prototype.getNodeType = function (type, ok) {
    SceneJS_NodeFactory.getNodeType(type, ok);
};

/**
 * Returns true if the given node type is currently loaded (ie. load not required)
 * @param type
 */
SceneJS_Engine.prototype.hasNodeType = function (type) {
    return !!SceneJS_NodeFactory.nodeTypes[type];
};

/**
 * Recursively parse the given JSON scene graph representation and return a scene (sub)graph.
 *
 * @param {Object} json JSON definition of a scene graph or subgraph
 * @param {Function} ok Callback fired when node created, with the node as argument
 */
SceneJS_Engine.prototype.createNode = function (json, ok) {

    // Do buffered node destroys - don't want olds nodes
    // hanging around whose IDs may clash with the new node
    this._doDestroyNodes();

    json.type = json.type || "node"; // Nodes are SceneJS.Node type by default
    var core = this._coreFactory.getCore(json.type, json.coreId); // Create or share a core
    var self = this;

    return this._nodeFactory.getNode(
        this,
        json,
        core,
        function (node) {

            // Create child nodes
            if (!node._fromPlugin && json.nodes) {
                var numNodes = 0;
                for (var i = 0, len = json.nodes.length; i < len; i++) {
                    self.createNode(
                        json.nodes[i],
                        function (childNode) {
                            node.addNode(childNode);
                            if (++numNodes == len) {
                                if (ok) {
                                    ok(node);
                                }
                                self.scene.publish("nodes/" + node.id, node);
                            }
                        });
                }
            } else {
                if (ok) {
                    ok(node);
                    self.scene.publish("nodes/" + node.id, node);
                }
            }
        });
};

/**
 * Performs pending node destructions. When destroyed, each node and its core is released back to the
 * node and core pools for reuse, respectively.
 */
SceneJS_Engine.prototype._doDestroyNodes = function () {
    var node;
    while (this._numNodesToDestroy > 0) {
        node = this._nodesToDestroy[--this._numNodesToDestroy];
        node._doDestroy();
        this._coreFactory.putCore(node._core);    // Release state core for reuse
        this._nodeFactory.putNode(node);         // Release node for reuse
    }
};

/**
 * Finds the node with the given ID in this engine's scene graph
 * @return {SceneJS.Node} The node if found, else null
 */
SceneJS_Engine.prototype.findNode = function (nodeId) {
    return this._nodeFactory.nodes.items[nodeId];
};

/** Finds nodes in this engine's scene graph that have nodes IDs matching the given regular expression
 * @param {String} nodeIdRegex Regular expression to match on node IDs
 * @return {[SceneJS.Node]} Array of nodes whose IDs match the given regex
 */
SceneJS_Engine.prototype.findNodes = function (nodeIdRegex) {

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
 * Tests whether a core of the given ID exists for the given node type
 * @param {String} type Node type
 * @param {String} coreId
 * @returns Boolean
 */
SceneJS_Engine.prototype.hasCore = function (type, coreId) {
    return this._coreFactory.hasCore(type, coreId);
};

/**
 * Schedules the given subtree of this engine's {@link SceneJS.Scene} for recompilation
 *
 * @param {SceneJS.Node} node Root node of the subtree to recompile
 */
SceneJS_Engine.prototype.branchDirty = function (node) {

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

/**
 * Renders a single frame. Does any pending scene compilations or draw graph updates first.
 * Ordinarily the frame is rendered only if compilations or draw graph updates were performed,
 * but may be forced to render the frame regardless.
 *
 * @param {*} params Rendering parameters
 * @param {Boolean} params.clear True to clear the display first (default)
 */
SceneJS_Engine.prototype.renderFrame = function (params) {

    var rendered = false;

    if (this._needCompile() || (params && params.force)) {

//        // Render display graph
//        this.display.render(params);

        var time = Date.now();

        var force =  params && params.force;

        // Render the scene once for each pass
        for (var i = 0; i < this._numPasses; i++) {

            // Notify that render is upcoming
            this.scene.publish("rendering", {
                pass: i
            });

            // Compile scene graph to display graph, if necessary
            this._doCompile();

            // Render display graph
            // Clear buffers only on first frame
            this.display.render({
                clear: i == 0,
                force: force,
                opaqueOnly: params && params.opaqueOnly
            });

            // Notify that render completed
            this.scene.publish("rendered", {
                sceneId: this.id,
                time: time,
                pass: i
            });

            rendered = true;
        }
    }

    return rendered;
};

/**
 * Starts the render loop on this engine.
 */
SceneJS_Engine.prototype.start = function () {

    if (!this.running) { // Do nothing if already started

        this.running = true;
        this.paused = false;
        this.sceneDirty = true;

        var self = this;
        var fnName = "__scenejs_sceneLoop" + this.id;
        var sleeping = false;
        var time = Date.now();
        var prevTime = time;
        var startTime = time;
        var scene = this.scene;
        var rendered = false;
        var canvas = this.canvas.canvas;
        var width;
        var height;
        var lastWidth = null;
        var lastHeight = null;

        // Notify started
        this.events.fireEvent("started", {
            sceneId: self.id,
            startTime: startTime
        });

        var renderingEvent = {
            pass: 0
        };
        var renderOptions = {
            clear: true
        };
        var renderedEvent = {
            sceneId: self.id,
            time: time,
            pass: 0
        };
        var sleepEvent = {
            sceneId: self.id,
            startTime: time,
            prevTime: time,
            time: time
        };
        var canvasSizeEvent = {
            width: 0,
            height: 0,
            aspect: 1
        };
        var tickEvent = {
            sceneId: self.id,
            startTime: time,
            prevTime: time,
            time: time
        };

        function draw() {
            rendered = false;

            // Render the scene once for each pass
            for (var i = 0; i < self._numPasses; i++) {

                if (self._needCompile() || rendered) {

                    sleeping = false;

                    // Notify we're about to do a render
                    renderingEvent.pass = i;
                    scene.publish("rendering", renderingEvent);

                    // Compile scene graph to display graph, if necessary
                    self._doCompile();

                    // Render display graph
                    // Clear buffers only on first frame
                    renderOptions.clear = i == 0;
                    self.display.render(renderOptions);

                    // Notify that we've just done a render
                    renderedEvent.sceneId = self.id;
                    renderedEvent.time = time;
                    renderedEvent.pass = i;
                    scene.publish("rendered", renderedEvent);

                    rendered = true;
                }
            }

            // If any of the passes did not render anything, then put the render loop to sleep again
            if (!rendered) {
                if (!sleeping) {
                    sleepEvent.sceneId = self.id;
                    sleepEvent.startTime = startTime;
                    sleepEvent.prevTime = time;
                    sleepEvent.time = time;
                    scene.publish("sleep", sleepEvent);
                }
                sleeping = true;
            }
        }

        // Animation frame callback
        window[fnName] = function () {

            var resolutionScaling = self.canvas.resolutionScaling || 1;

            width = canvas.width = canvas.clientWidth * resolutionScaling;
            height = canvas.height = canvas.clientHeight * resolutionScaling;

            if (width != lastWidth || height != lastHeight) {
                canvasSizeEvent.width = width;
                canvasSizeEvent.height = height;
                canvasSizeEvent.aspect = width / height;
                scene.publish("canvasSize", canvasSizeEvent);
                self.display.imageDirty = true;
                lastWidth = width;
                lastHeight = height;
            }

            if (self.running && !self.paused) {

                time = Date.now();

                tickEvent.sceneId = self.id;
                tickEvent.startTime = startTime;
                tickEvent.prevTime = time;
                tickEvent.time = time;
                scene.publish("tick", tickEvent);

                prevTime = time;

                if (!self.running) { // "tick" handler have destroyed scene
                    return;
                }

                if (self.fps > 0) {
                    requestAnimationFrame(draw);
                } else {
                    draw();  // Already at an animation frame.
                }
            }

            if (self.running) {
                if (self.fps > 0) {
                    setTimeout(window[fnName], 1000 / self.fps);
                } else {
                    requestAnimationFrame(window[fnName]);
                }
            }
        };

        setTimeout(window[fnName], 0);
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
 * @param options.regionPick Performs additional region-intersect pick when true
 * @returns The pick record
 */
SceneJS_Engine.prototype.pick = function (canvasX, canvasY, options) {

    // Do any pending scene compilations
    if (this._needCompile()) {
        this._doCompile();
    }

    var hit = this.display.pick({
        canvasX: canvasX,
        canvasY: canvasY,
        pickTriangle: options ? options.rayPick : false,
        pickRegion: options ? options.regionPick : false
    });

    return hit;
};

/**
 * Reads colors of pixels from the last rendered frame.
 */
SceneJS_Engine.prototype.readPixels = function (entries, size, opaqueOnly) {

    // Do any pending scene compilations
    if (this._needCompile()) {
        this._doCompile();
    }

    return this.display.readPixels(entries, size, opaqueOnly);
};

/**
 * Returns true if view needs refreshing from scene
 * @returns {Boolean}
 * @private
 */
SceneJS_Engine.prototype._needCompile = function () {
    return (this.display.imageDirty // Frame buffer needs redraw
    || this.display.drawListDirty // Draw list needs rebuild
    || this.display.stateSortDirty // Draw list needs to redetermine state order
    || this.display.stateOrderDirty // Draw list needs state sort
    || this.display.objectListDirty // Draw list needs to be rebuilt
    || this._sceneBranchesDirty // One or more branches in scene graph need (re)compilation
    || this.sceneDirty); // Whole scene needs recompilation
};

/**
 * Performs any pending scene compilations or display rebuilds
 */
SceneJS_Engine.prototype._doCompile = function () {
    if (this._sceneBranchesDirty || this.sceneDirty) { // Need scene graph compilation
        this._sceneBranchesDirty = false;
        SceneJS_events.fireEvent(SceneJS_events.SCENE_COMPILING, {  // Notify compilation support start
            engine: this                                            // Compilation support modules get ready
        });
        this.pubSubProxy = new SceneJS_PubSubProxy(this.scene, null);
        var ctx = {
            pubSubProxy: this.pubSubProxy
        };
        this.scene._compileNodes(ctx); // Begin depth-first compilation descent into scene sub-nodes
        this.sceneDirty = false;
    }
    this._doDestroyNodes(); // Garbage collect destroyed nodes - node destructions set imageDirty true
};

/**
 * Pauses/unpauses the render loop
 * @param {Boolean} doPause Pauses or unpauses the render loop
 */
SceneJS_Engine.prototype.pause = function (doPause) {
    this.paused = doPause;
};

/**
 * Stops the render loop
 */
SceneJS_Engine.prototype.stop = function () {
    if (this.running) {
        this.running = false;
        this.paused = false;
        window["__scenejs_sceneLoop" + this.id] = null;
        //   this.events.fireEvent("stopped", { sceneId: this.id });
    }
};

/**
 * Destroys a node within this engine's {@link SceneJS.Scene}
 *
 * @param {SceneJS.Node} node Node to destroy
 */
SceneJS_Engine.prototype.destroyNode = function (node) {

    /* The node is actually scheduled for lazy destruction within the next invocation of #_tryCompile
     */
    this._nodesToDestroy[this._numNodesToDestroy++] = node;

    /* Stop tracking node's status
     */
    var nodeStatus = this.sceneStatus.nodes[node.id];

    if (nodeStatus) {
        this.sceneStatus.numTasks -= nodeStatus.numTasks;
        delete this.sceneStatus.nodes[node.id];
    }
};

/**
 * Destroys this engine
 */
SceneJS_Engine.prototype.destroy = function () {
    this.destroyed = true;
    // this.events.fireEvent("destroyed", { sceneId: this.id });
};

/*---------------------------------------------------------------------------------------------------------------------
 * JavaScript augmentations to support render loop
 *--------------------------------------------------------------------------------------------------------------------*/

if (!self.Int32Array) {
    self.Int32Array = Array;
    self.Float32Array = Array;
}

// Ripped off from THREE.js - https://github.com/mrdoob/three.js/blob/master/src/Three.js
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'RequestCancelAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
