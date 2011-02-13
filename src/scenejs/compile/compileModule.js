/*----------------------------------------------------------------------------------------------------------------

 * Scene Compilation
 *
 * DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
 *
 *--------------------------------------------------------------------------------------------------------------*/

SceneJS._compileModule = new (function() {

    var debugCfg;

    /* Compile disabled by default
     */
    this._enableCompile = false;

    /* Stack to track nodes during scene traversal. Public push and pop methods are used with this
     * to track which nodes are within subgraphs that are targeted by instance nodes, in order to flag
     * node compilations along traversal paths.
     */
    var nodeStack = new Array(500);
    var stackLen = 0;
    var countInstanceLinks = 0;     // Incremented as we traverse an instance link, decremented as we return
    var traversalDepth = 0;         // Incremented when we push a node, decremented when we pop

    var countCompilingBranches = 0;

    /* During traversal, flags by ID which nodes are within instanced subgraphs.
     * Node IDs set on this when we push a node.
     *
     * Never unset, because only used for that node when we are between push and pop for that node.
     */
    this.instancedNodes = {};

    /* During traversal, records depth of nodes - only meaningful when they are NOT within instanced subgraphs.
     *
     * This is used for ordering those nodes flagged COMPILE_SUBGRAPH and COMPILE_NODE. Note that for nodes
     * within instanced subgraph, the compile module bumps COMPILE_NODE and COMPILE_NODE up to COMPILE_PATH,
     * so depths are not used with instanced nodes.
     *
     * Incremented when we push a node. Never reset, because only used for that node when we are
     * between push and pop for that node.
     */
    this.nonInstancedNodeDepths = {};

    /*-----------------------------------------------------------------------------------------------------------------
     * Flags which guide scene traversal during compilation, set by traversal of compilation queue (below)
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /**
     * Set by #setForceSceneCompile, forces compilation module
     * to behave as if everything in the scene needs to be compiled.
     */
    this._forceSceneCompile = false;

    /**
     * Triggers a compilation traversal when true, then unset as soon as
     * soon as traversal complete. Does not determine what is actually
     * compiled during the traversal.
     */
    this._needNewCompile = true;

    /**
     * True when all nodes need compilation
     */
    this._needCompileScene = false;


    this._notifiedNodes = {};

    /**
     * IDs of nodes that require re-render
     */
    this._dirtyNodes = {};

    /*
     * IDs of nodes that need COMPILE_NODE or COMPILE_SUBTREE
     */
    this._subtreeRootsToCompile = {};

    /*
     */
    this._nodesWithinBranches = {};


    this._withinCompilingBranch = false;


    /*-----------------------------------------------------------------------------------------------------------------
     * Priority queue of compilations. Each element is a directive to (re)compile a portion of the scene
     * graph relative to a given node. They is ordered by decreasing generality of compilation to avoid overlap,
     * and are processed and cleared before each scene traversal to set combinations of the traversal flags
     * defined above.
     *---------------------------------------------------------------------------------------------------------------*/

    this._compilationQueue = new (function() {
        var contents = [];
        var sorted = false;

        var prioritySortLow = function(a, b) {
            return b.priority - a.priority;
        };

        var sort = function() {
            contents.sort(prioritySortLow);
            sorted = true;
        };

        this.push = function(element) {
            contents.push(element);
            sorted = false;
            return element;
        };

        this.pop = function() {
            if (!sorted) {
                sort();
            }
            var element = contents.pop();
            if (element) {
                return element;
            } else {
                return undefined;
            }
        };

        this.size = function() {
            return contents.length;
        };

        this.clear = function() {
            contents = [];
        };

        this.sort = sort;
    })();


    var self = this;
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {

                debugCfg = SceneJS._debugModule.getConfigs("compilation");

                self._enableCompile = (debugCfg.enabled === false) ? false : true;

                /* Start with a fresh compilation queue on SceneJS init
                 */
                self._compilationQueue.clear();
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function(params) {

                /* Ready to note nodes that are within
                 * instanced subtrees in instancedNodes
                 */
                stackLen = 0;
                countInstanceLinks = 0;

                /*
                 */
                countCompilingBranches = 0;

                /* Ready to track node depths in nonInstancedNodeDepths
                 */
                traversalDepth = 0;

                /* We'll know if we need a compile
                 * when we recompute compilation flags next
                 */
                self._needNewCompile = false;

                /* Recompute compilation flags
                 */
                if (!self._forceSceneCompile && self._enableCompile) {
                    self._scheduleCompilations();
                }

                /* Initiate (re)compilation
                 */
                var compileMode = (self._needCompileScene || self._forceSceneCompile || (!self._enableCompile))
                        ? SceneJS._renderModule.COMPILE_SCENE
                        : SceneJS._renderModule.COMPILE_NODES;

                SceneJS._renderModule.renderScene({
                    sceneId: params.sceneId
                }, {
                    compileMode: compileMode
                });
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILED,
            function() {

                self._forceSceneCompile = false;  // One-shot effect per pass

                /* Since we recompute compilation flags from the compilation queue on
                 * next SCENE_COMPILING we can unset them now
                 */
                self._needCompileScene = false;
                self._needCompileSubtrees = false;
                self._notifiedNodes = {};
                self._subtreeRootsToCompile = {};
                self._dirtyNodes = {};
                self._nodesWithinBranches = {};
            });

    /*-----------------------------------------------------------------------------------------------------------------
     * CONFIGURATION
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /* Compilation levels - these are also the priorities in which the
     * compilations are queued (when queuing is applicable).
     */
    this.COMPILE_NOTHING = -1;  // Compile nothing
    this.COMPILE_SCENE = 0;     // Compile entire scene graph
    this.COMPILE_BRANCH = 1;    // Compile node, plus path to root, plus subnodes
    this.COMPILE_SUBTREE = 2;   // Compile node plus subnodes
    this.COMPILE_PATH = 3;      // Compile node plus path to root
    this.COMPILE_NODE = 4;      // Compile just node

    /* Level names for logging
     */
    var levelNameStrings = ["COMPILE_SCENE","COMPILE_BRANCH","COMPILE_SUBTREE", "COMPILE_PATH","COMPILE_NODE"];

    /**
     * Configures recompilation behaviour on a per-node basis
     *
     *      Default is always COMPILE_SCENE
     *
     *      Configs for base node type overrides configs for subtypes
     *
     *      COMPILE_NODE and COMPILE_SUBGRAPH are bumped to COMPILE_BRANCH if node within an instanced subgraph
     *
     *      COMPILE_SCENE for structure updates so we can rediscover which nodes are within instanced subtrees.
     *      Compilation is therefore optimised for update as cost of restructure.
     *
     *      DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
     */
    var compileConfig = {

        /* Configs for base node type overrides configs for subtypes
         */
        "node": {
            "set" : {
                attr: {

                    //                    "enabled": {
                    //                        level: this.COMPILE_BRANCH
                    //                    },

                    "flags": {
                        attr: {
                            transparent: {
                                level: this.COMPILE_BRANCH
                            },
                            enabled: {
                                level: this.COMPILE_BRANCH
                            },
                            picking: {
                                level: this.COMPILE_BRANCH
                            },
                            colortrans: {
                                level: this.COMPILE_BRANCH
                            }
                        },
                        level: this.COMPILE_SCENE
                    }
                }
            },

            "add" : {
                attr: {

                    /* "add" op is used to overwrite flags
                     */
                    "flags": {

                        attr: {

                            transparent: {
                                level: this.COMPILE_BRANCH
                            },
                            enabled: {
                                level: this.COMPILE_BRANCH
                            },
                            picking: {
                                level: this.COMPILE_BRANCH
                            },
                            colortrans: {
                                level: this.COMPILE_BRANCH
                            }
                        },

                        level: this.COMPILE_SCENE
                    },

                    "node": {
                        level: this.COMPILE_BRANCH
                    },

                    "nodes": {
                        level: this.COMPILE_BRANCH
                    }
                },

                level: this.COMPILE_SCENE
            },

            "remove" : {
                attr: {
                    "node" : {
                        level: this.COMPILE_SCENE
                    }
                },
                level: this.COMPILE_SCENE
            },

            "insert" : {
                attr: {
                    "node" : {
                        level: this.COMPILE_SCENE
                    }
                },
                level: this.COMPILE_SCENE
            }
        },

        /*-----------------------------------------------------------------------------------
         * clip
         *---------------------------------------------------------------------------------*/

        "clip": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            }
        },

        /*-----------------------------------------------------------------------------------
         * colortrans
         *---------------------------------------------------------------------------------*/

        "colortrans": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            },
            mul: {
                level: this.COMPILE_PATH
            }
        },

        "scene" : {
            "created" : {
                level: this.COMPILE_SCENE
            }
        },


        /* Transform nodes require many things below them to recompile,
         * such as transforms and boundingBoxes
         */

        "scale": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        "rotate": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        "translate": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        /* View and camera transforms
         */
        "lookAt": {
            set: {
                level: this.COMPILE_PATH
            }
        },

        "camera": {
            set: {
                level: this.COMPILE_PATH
            }
        },

        /* Setting state on a morphGeometry does not affect anything else in the scene
         */
        "morphGeometry": {
            set: {
                level: this.COMPILE_PATH
            }
        },

        /* Keep recompiling instance node while it searches for its target
         */
        "instance": {
            "searching": {
                level: this.COMPILE_BRANCH
            }
        },

        /* Recompile texture node once it has loaded
         */
        "texture": {

            "loadedImage": {
                level: this.COMPILE_SCENE
            },

            "loadedImagebuf": {
                level: this.COMPILE_SCENE   // TODO: got to be a tighter rule - maybe compile imagebuf's subtree then texture's branch?
            },

            set: {
                attr: {
                    layers: {
                        level: this.COMPILE_PATH
                    }
                }
            }
        },

        /* Recompile stream-loaded geometry node once it has loaded
         */
        "geometry": {

            "loaded": {
                level: this.COMPILE_BRANCH
            }
        },

        /* Recompile texture node once it has loaded
         */
        "text": {

            "loadedImage": {
                level: this.COMPILE_BRANCH
            }
        },

        /* Interpolator needs to recompile the node as it waits for it's sequence to begin, then
         * for as long as it is interpolating in order to update. The target node will notify for
         * it's own recompilations as it is updated.
         */
        "interpolator": {
            "before": {
                level: this.COMPILE_NODE
            },
            "running": {
                level: this.COMPILE_NODE
            }
        }
    };

    /*-----------------------------------------------------------------------------------------------------------------
     * NOTIFICATION
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /**
     */
    this.setForceSceneCompile = function(forceSceneCompile) {
        this._forceSceneCompile = forceSceneCompile;
    };

    /**
     * Notifies compilation module that a node has been modified
     *
     * This function references SceneJS._compileConfig to find the level as
     * configured there. It falls back on default levels as configured,
     * falling back on a complete re-compile when no configs can be found.
     *
     * @param {String} nodeType Type of node - eg. "rotate", "lookAt" etc.
     * @param {String} op Type of update (optional) - eg. "set", "get", "inc"
     * @param {String} attrName Name of updated attribute (optional) - eg. "angle", "eye", "baseColor"
     * @param {{String:Object}} value Value for the attribute (optional) - when a map, the lowest compilation level among the keys will be returned
     */
    this.nodeUpdated = function(node, op, attrName, value) {

        if (!this._enableCompile) {
            this._needNewCompile = true;    // When compile disabled, any update triggers a render.
            return;
        }

        if (this._forceSceneCompile) {
            return;
        }

        // TODO: peek at top of queue to see if COMPILE_SCENE stacked

        //        if (this._needCompileScene) { // Whole scene already flagged for recompile anyway
        //            return;
        //        }

        var nodeType = node._attr.nodeType;
        var nodeId = node._attr.id;
        var level;

        /* Compilation configs for base node type overrides configs for subtypes
         */
        if (nodeType != "node") {
            level = this._getCompileLevel("node", op, attrName, value);
        }

        /* When no config found for base type then find for subtype
         */
        if (level === undefined) {
            level = this._getCompileLevel(nodeType, op, attrName, value);
        }

        if (level == this.COMPILE_NOTHING) {
            return;
        }

        this._needNewCompile = true; // At this point we know we'll need to compile something

        if (level === undefined) {
            level = this.COMPILE_SCENE;
        }

        //  if (level === undefined || level == this.COMPILE_SCENE) {
        // this._needCompileScene = true;
        // this._compilationQueue.clear(); // No point in building compilation list any more
        //  return;
        // }

        /* COMPILE_SUBTREE and COMPILE_NODE get bumped up to COMPILE_BRANCH
         * when the target node is found to be within a subtree that is targeted by
         * an instance node. This is due to how instance nodes work, where if an
         * instance node defines child nodes, then they become surrogate children
         * of the target sub-graph's right-most node.
         */
        if (this.instancedNodes[nodeId]) {
            if (level == this.COMPILE_SUBTREE || level == this.COMPILE_NODE) {
                level = this.COMPILE_BRANCH;
            }
        }

        //******************************************
        // HACKS until we get COMPILE_SUBTREE going
        //******************************************

        if (level == this.COMPILE_SUBTREE) {
            level = this.COMPILE_BRANCH;
        }

        if (level == this.COMPILE_NODE) {
            level = this.COMPILE_PATH;
        }

        /* Avoid redundant recompilations of same node
         */
        if (this._notifiedNodes[nodeId] <= level) {
            return;
        }
        this._notifiedNodes[nodeId] = level;

        var priority = level;

        this._compilationQueue.push({
            node: node,
            op: op,
            attrName: attrName,
            level: level,
            priority: priority
        });
    };

    /**
     * Gets the level of compilation required after an update of the given type
     * to an attribute of the given node type.
     *
     * @param {String} nodeType Type of node - eg. "rotate", "lookAt" etc.
     * @param {String} op Type of update (optional) - eg. "set", "get", "inc"
     * @param {String} name Name of updated attribute (optional) - eg. "angle", "eye", "baseColor"
     * @param {{String:Object}} value Value for the attribute (optional) - when a map, the lowest compilation level among the keys will be returned
     * @return {Number} Number from [0..5] indicating level of compilation required
     */
    this._getCompileLevel = function(nodeType, op, name, value) {
        var config = compileConfig[nodeType];
        if (config) {

            /*-------------------------------------------------------------
             * Got config for node
             *-----------------------------------------------------------*/

            if (op) {
                var opConfig = config[op];
                if (opConfig) {

                    /*-------------------------------------------------------------
                     * Got config for [node, op]
                     *-----------------------------------------------------------*/

                    if (opConfig.attr) {
                        if (name) {
                            var attrConfig = opConfig.attr[name];
                            if (attrConfig) {

                                /*-------------------------------------------------------------
                                 * Got config for [node, op, attribute]
                                 *-----------------------------------------------------------*/

                                if (value) {
                                    if (typeof (value) == "object") {
                                        var subAttrConfig = attrConfig.attr;
                                        if (subAttrConfig) {

                                            /*-------------------------------------------------------------
                                             * Got config for [node, op, attribute, sub-attributes]
                                             *
                                             * Try to find the most general (lowest) compilation level
                                             * among the levels for sub-attributes.
                                             *-----------------------------------------------------------*/


                                            var lowestLevel;
                                            var valueConfig;
                                            for (var subAttrName in value) {
                                                if (value.hasOwnProperty(subAttrName)) {
                                                    valueConfig = subAttrConfig[subAttrName];
                                                    if (valueConfig) {
                                                        if (valueConfig.level != undefined) {
                                                            if (lowestLevel == undefined || (valueConfig.level < lowestLevel)) {
                                                                lowestLevel = valueConfig.level;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (lowestLevel) {
                                                return lowestLevel;
                                            }
                                        }
                                    }
                                }

                                /*-------------------------------------------------------------
                                 * Try fall back to [node, op, attribute]
                                 *-----------------------------------------------------------*/

                                if (attrConfig.level != undefined) {  // Level found for attribute
                                    return attrConfig.level;
                                }
                            }
                        }
                    }

                    /*-------------------------------------------------------------
                     * Try fall back to [node, op]
                     *-----------------------------------------------------------*/

                    if (opConfig.level != undefined) {
                        return opConfig.level;
                    }
                }
            }

            /*-------------------------------------------------------------
             * Try fall back to [node]
             *-----------------------------------------------------------*/

            if (config.level != undefined) {
                return config.level;
            }
        }

        /*-------------------------------------------------------------
         * No config found for node
         *-----------------------------------------------------------*/

        return undefined;
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * SHEDULING
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /**
     * Flush compilation queue to set all the flags that
     * will direct the next compilation traversal
     */
    this._scheduleCompilations = function() {

        var compilation;
        var node;
        var nodeId;
        var level;

        var stats = {
            scene: 0,
            branch: 0,
            path: 0,
            subtree: 0,
            node: 0
        };

        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("-------------------------------------------------------------------");
            SceneJS._loggingModule.info("COMPILING ...");
            SceneJS._loggingModule.info("");
        }

        while (!this._needCompileScene && this._compilationQueue.size() > 0) {

            compilation = this._compilationQueue.pop();


            level = compilation.level;
            node = compilation.node;
            nodeId = node._attr.id;

            if (debugCfg.logTrace) {
                var logLevels = debugCfg.logTrace.levels || {};
                var minLevel = logLevels.min || this.COMPILE_SCENE;
                var maxLevel = (logLevels.max == undefined || logLevels.max == null) ? this.COMPILE_NODE : logLevels.max;
                if (minLevel <= level && level <= maxLevel) {
                    SceneJS._loggingModule.info("Compiling - level: "
                            + levelNameStrings[compilation.level] + ", node: "
                            + compilation.node._attr.nodeType + ", node ID: " + compilation.node._attr.id + ", op: "
                            + compilation.op + ", attr: "
                            + compilation.attrName);
                }
            }


            if (level == this.COMPILE_SCENE) {
                stats.scene = 1;
                stats.branch = stats.path = stats.subtree = stats.node = 0;
                this._needCompileScene = true;
                this._compilationQueue.clear();

            } else if (level == this.COMPILE_BRANCH) {          // Compile node, nodes on path to root and nodes in subtree
                this._recompilePath(node);                      // Compile nodes on path
                this._nodesWithinBranches[nodeId] = true;        // Ensures that traversal descends into subnodes
                stats.branch++;

            } else if (level == this.COMPILE_PATH) {            // Compile node plus nodes on path to root
                this._recompilePath(node);                      // Traversal will not descend below the node
                stats.path++;

            } else if (level == this.COMPILE_SUBTREE) {         // Compile node plus nodes in subtree
                if (!this._nodesWithinBranches[nodeId]) {        // No need if already compiled as part of a COMPILE_BRANCH
                    this._needCompileSubtrees = true;
                    this._subtreeRootsToCompile[nodeId] = node;
                    this._nodesWithinBranches[nodeId] = true;    // Ensures that traversal descends into subnodes
                    stats.subtree++;
                }

            } else if (level == this.COMPILE_NODE) {            // Compile just the node
                if (!this._dirtyNodes[nodeId]) {                 // No need if already compiled
                    this.needCompileNodes = true;
                    this._subtreeRootsToCompile[nodeId] = node;
                    stats.node++;
                }
            }
        }

        if (debugCfg.logTrace) {
            SceneJS._loggingModule.info("-------------------------------------------------------------------");
        }
    };

    /** Flags node and all nodes on path to root for recompilation
     */
    this._recompilePath = function(targetNode) {
        var dirtyNodes = this._dirtyNodes;
        //        if (dirtyNodes[id]) { // Node on path already marked, along with all instances of it
        //                return;
        //            }
        //        if (this._nodesWithinBranches[targetNode._attr.id]) { // Optimise for multiple updates on same node
        //            return;
        //        }
        var nodeInstances;
        var id;
        var node = targetNode;
        while (node) {
            id = node._attr.id;


            /*
             */
            //            if (dirtyNodes[id]) { // Node on path already marked, along with all instances of it
            //                return;
            //            }
            //             if (this._nodesWithinBranches[id]) { // Node on path already marked, along with all instances of it
            //                return;
            //            }

            /* Ensure that instance allows compilation of the entire subgraph of its symbol
             * because the updated node will be a temporary child of the symbol subgraph's
             * rightmost leaf - otherwise the symbol subgraph will cull compilation of the
             * updated node if the subgraph is not flagged for compilation.
             */
            if (node._attr.nodeType == "instance") {
                this._nodesWithinBranches[id] = true;
            }
            dirtyNodes[id] = true;
            nodeInstances = SceneJS._nodeInstanceMap[id];
            if (nodeInstances) {
                for (var instanceNodeId in nodeInstances.instances) {
                    if (nodeInstances.instances.hasOwnProperty(instanceNodeId)) {
                        this._nodesWithinBranches[instanceNodeId] = true;
                        this._recompilePath(SceneJS._nodeIDMap[instanceNodeId]);
                    }
                }
            }

            node = node._parent;
        }
    };

    /**
     * Returns true if the given node requires compilation during this traversal.
     *
     * This called when about to visit the node, to determine if that node should
     * be visited.
     *
     * Will always return true if scene compilation was previously forced with
     * a call to setForceSceneCompile.
     *
     */
    this.preVisitNode = function(node) {

        if (!this._enableCompile) {
            return true;
        }

        if (this._forceSceneCompile) {
            return true;
        }

        nodeStack[stackLen++] = node;

        var nodeId = node._attr.id;

        /* Track nodes within instanced subgraphs
         */
        this.instancedNodes[nodeId] = (countInstanceLinks > 0);

        /* Track instances
         */
        if (node._attr.nodeType == "instance") {
            countInstanceLinks++;
        }

        if (this._nodesWithinBranches[nodeId] === true) {
            countCompilingBranches++;
        }

        var needCompile = this._needCompileNode(node);

        /* Track node traversal depth if node is not within instanced subtree
         */
        if (countInstanceLinks == 0) {
            this.nonInstancedNodeDepths[nodeId] = traversalDepth;
        }
        traversalDepth++;

        return needCompile;
    };

    /**
     * Returns true if the given node requires recompilation during
     * the current traversal
     */
    this._needCompileNode = function(node) {

        if (this._needCompileScene) {            // Whole scene needs compilation
            return true;
        }
        if (!node) {
            return false;
        }
        if (countCompilingBranches > 0) {
            return true;
        }

        var nodeId = node._attr.id;
        if (this._dirtyNodes[nodeId] === true) {
            return true;
        }
        if (this._nodesWithinBranches[nodeId] === true) {
            return true;
        }
        if (this._subtreeRootsToCompile[nodeId]) {
            return true;
        }
        return false;
    };

    this.postVisitNode = function(node) {
        if (stackLen > 0) {
            var nodeId = node._attr.id;
            var peekNode = nodeStack[stackLen - 1];
            if (peekNode._attr.id == nodeId) {
                stackLen--;
                if (node._attr.nodeType == "instance") {
                    countInstanceLinks--;
                }
                traversalDepth--;

                if (this._nodesWithinBranches[nodeId] === true) {
                    countCompilingBranches--;
                }
            }
        }
    };

    /**
     * Iterates over isolated subtrees that need compilation.
     *
     * The subtrees are each to be traversed, using needCompileNode
     * at each node to guide desecent.
     */
    this.withSubTreesToCompile = function(func) {
        if (this._forceSceneCompile || (!this._enableCompile)) {
            return;
        }
        var subtrees = SceneJS._compileModule._subtreeRootsToCompile;
        for (var nodeId in subtrees) {
            if (subtrees.hasOwnProperty(nodeId)) {
                func(subtrees[nodeId]);
            }
        }
    };

})();
