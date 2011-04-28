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
    this._enableCompiler = false;

    /* Stack to track nodes during scene traversal. Public push and pop methods are used with this
     * to track which nodes are within subgraphs that are targeted by instance nodes, in order to flag
     * node compilations along traversal paths.
     */
    var nodeStack = new Array(500);
    var stackLen = 0;

    /* Incremented as we traverse instance link, decremented as we return
     */
    var countTraversedInstanceLinks = 0;

    /* Incremented when we traverse into a node that is flagged for entire subtree
     * compilation, decremented on return
     */
    var countTraversedSubtreesToCompile = 0;

    /* Flag for each node indicating if it is within subtree or target of an instance node.
     * Updated when node is traversed.
     * When compiler notified of node update, bumps COMPILE_NODE and COMPILE_SUBTREE up to COMPILE_BRANCH.
     * Cleared when scene compiled.
     * Synchronised for node relocation, which causes COMPILE_SCENE, which then overrides all notifications.
     */
    this._nodeInstanced = {};

    /* Flag for each node indicating if it must always be recompiled
     */
    this._nodeAlwaysCompile = {};

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
    this.triggerCompile = true;

    /**
     * True when all nodes need compilation
     */
    this._needCompileScene = false;

    /**
     * Tracks highest compilation level selected for each node that compiler receives update notification on.
     * Is emptied after compilation. A notification that would result in lower compilation level than already stored
     * for each node are ignored.
     */
    this._nodeCompilationLevels = {};

    /**
     * IDs of nodes that require re-render
     */
    this._dirtyNodes = {};

    /*
     * IDs of nodes that need COMPILE_NODE or COMPILE_SUBTREE
     */
    this._subtreeRootsToCompile = {};

    /* When traversal is inside these nodes, every node encountered is compiled
     */
    this._nodesWithinBranches = {};


    /*-----------------------------------------------------------------------------------------------------------------
     * Priority queue of compilations. Each element is a directive to (re)compile a portion of the scene
     * graph relative to a given node. They is ordered by decreasing generality of compilation to avoid overlap,
     * and are processed and cleared before each scene traversal to set combinations of the traversal flags
     * defined above.
     *---------------------------------------------------------------------------------------------------------------*/

    this._sceneCompilationQueued = false;

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

                self._enableCompiler = (debugCfg.enabled === false) ? false : true;

                /* Start with a fresh compilation queue on SceneJS init
                 */
                self._sceneCompilationQueued = false;
                self._compilationQueue.clear();
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function(params) {

                /* Reset compilation trigger - may be set again during compilation
                 * by nodes like interpolate as they ask for another compilation pass
                 */
                self.triggerCompile = false;

                /* Ready to note nodes that are within
                 * instanced subtrees in _nodeInstanced
                 */
                stackLen = 0;
                countTraversedInstanceLinks = 0;

                /*
                 */
                countTraversedSubtreesToCompile = 0;

                /* Recompute compilation flags
                 */
                if (!self._forceSceneCompile && self._enableCompiler) {
                    self._scheduleCompilations();
                }

                /* Initiate (re)compilation
                 */
                var compileMode = (self._needCompileScene || self._forceSceneCompile || (!self._enableCompiler))
                        ? SceneJS._renderModule.COMPILE_SCENE
                        : SceneJS._renderModule.COMPILE_NODES;

                SceneJS._renderModule.bindScene({ sceneId: params.sceneId }, { compileMode: compileMode });
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILED,
            function() {

                self._forceSceneCompile = false;  // One-shot effect per pass

                /* Since we recompute compilation flags from the compilation queue on
                 * next SCENE_COMPILING we can unset them now.
                 *
                 * We dont reset triggerCompile because a node may be set during compilation
                 * to trigger another compilation pass.
                 */

                self._needCompileScene = false;
                self._needCompileSubtrees = false;
                self._nodeCompilationLevels = {};
                self._subtreeRootsToCompile = {};
                self._dirtyNodes = {};
                self._nodesWithinBranches = {};
                self._sceneCompilationQueued = false;
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
                        level: this.COMPILE_SCENE
                    },

                    "nodes": {
                        level: this.COMPILE_SCENE
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
         * billboard
         *---------------------------------------------------------------------------------*/

        "billboard": {
            alwaysCompile: true
        },

        /*-----------------------------------------------------------------------------------
         * clip
         *---------------------------------------------------------------------------------*/

        "clip": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        /*-----------------------------------------------------------------------------------
         * colortrans
         *---------------------------------------------------------------------------------*/

        "colortrans": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            },
            mul: {
                level: this.COMPILE_BRANCH
            }
        },

        /*-----------------------------------------------------------------------------------
         * deform
         *---------------------------------------------------------------------------------*/

        "deform": {
            alwaysCompile: true
        },

        /*-----------------------------------------------------------------------------------
         * lights
         *---------------------------------------------------------------------------------*/

        "lights": {
            //alwaysCompile: true
        },

        "scene" : {
            "created" : {
                level: this.COMPILE_SCENE
            },
            "start" : {
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

        /*-----------------------------------------------------------------------------------
         * stationary
         *---------------------------------------------------------------------------------*/

        "stationary": {
            alwaysCompile: true
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

        "quaternion": {
            set: {
                level: this.COMPILE_BRANCH
            },
            add: {
                level: this.COMPILE_BRANCH
            }
        },

        /* View and camera transforms
         */
        "lookAt": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            }
        },

        "camera": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            }
        },

        /*
         */
        "morphGeometry": {
            set: {
                level: this.COMPILE_BRANCH
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
                        level: this.COMPILE_BRANCH
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
     * This function references compileConfig to find the level as
     * configured there. It falls back on default levels as configured,
     * falling back on a complete re-compile when no configs can be found.
     *
     * @param {String} nodeType Type of node - eg. "rotate", "lookAt" etc.
     * @param {String} op Type of update (optional) - eg. "set", "get", "inc"
     * @param {String} attrName Name of updated attribute (optional) - eg. "angle", "eye", "baseColor"
     * @param {{String:Object}} value Value for the attribute (optional) - when a map, the lowest compilation level among the keys will be returned
     */
    this.nodeUpdated = function(node, op, attrName, value) {

        if (!this._enableCompiler) {
            this.triggerCompile = true;
            return;
        }

        if (this._forceSceneCompile) {
            return;
        }

        // TODO: peek at top of queue to see if COMPILE_SCENE stacked

        //        if (this._sceneCompilationQueued) { // Whole scene already flagged for recompile anyway
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

        /* Set compilation trigger - this may be while scene is sleeping,
         * or during a compilation pass to trigger another one
         */
        this.triggerCompile = true;

        if (level === undefined) {
            level = this.COMPILE_SCENE;
        }

        //        if (level == this.COMPILE_SCENE) {
        //            this._sceneCompilationQueued = true;
        //            this._compilationQueue.clear(); // No point in building compilation list any more
        //            return;
        //        }

        /* COMPILE_SUBTREE and COMPILE_NODE get bumped up to COMPILE_BRANCH
         * when the target node is found to be within a subtree that is targeted by
         * an instance node. This is due to how instance nodes work, where if an
         * instance node defines child nodes, then they become surrogate children
         * of the target sub-graph's right-most node.
         */
        if (this._nodeInstanced[nodeId]) {
            if (level == this.COMPILE_SUBTREE || level == this.COMPILE_NODE) {
                level = this.COMPILE_BRANCH;
            }
        }

        /*------------------------------------------------------------------------------------------------
         * HACKS
         *
         * Until we get COMPILE_SUBTREE and COMPILE_NODE working, we'll bump those up to COMPILE_BRANCH.
         *-----------------------------------------------------------------------------------------------*/

        if (level == this.COMPILE_SUBTREE) {
            level = this.COMPILE_BRANCH;
        }

        if (level == this.COMPILE_NODE) {
            level = this.COMPILE_PATH;
        }

        /* Only reschedule compilation for node if new level is more general.
         */
        if (this._nodeCompilationLevels[nodeId] <= level) {
            return;
        }
        this._nodeCompilationLevels[nodeId] = level;

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


        //        if (this._sceneCompilationQueued) {
        //            this._needCompileScene = true;
        //        }


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



        /* Compile indiscriminately if scheduler disabled
         */
        if (!this._enableCompiler) {
            return true;
        }

        var config = compileConfig[node._attr.nodeType];

        /* When doing complete indescriminate scene compile, take this opportunity
         * to flag paths to nodes that must always be compiled
         */
        if (this._needCompileScene) {
            if (config && config.alwaysCompile) {
                if (!this._nodeAlwaysCompile[nodeId]) {   // Only happens once
                    this._alwaysCompilePath(node);
                }
            }
        }

        /* Compile indiscriminately if forced
         */
        if (this._forceSceneCompile) {
            return true;
        }

        /* Track compilation path into scene graph
         */
        nodeStack[stackLen++] = node;

        var nodeId = node._attr.id;

        /* Track nodes within instances
         */
        this._nodeInstanced[nodeId] = (countTraversedInstanceLinks > 0);

        /* Track number of nodes compiling within subtrees of instances 
         */
        if (node._attr.nodeType == "instance") {
            countTraversedInstanceLinks++;
        }

        /* Compile entire subtree when within a subtree flagged for complete compile,
         * or when within a node that must always be compiled
         */

        if (this._nodesWithinBranches[nodeId] === true || (config && config.alwaysCompile)) {
            countTraversedSubtreesToCompile++;
        }

        /* Compile every node when doing indiscriminate scene compile
         */
        if (this._needCompileScene) {
            return true;
        }

        /* Compile every node flagged for indiscriminate compilation
         */
        if (this._nodeAlwaysCompile[nodeId]) {
            return true;
        }

        /* Compile every node
         */
        if (countTraversedSubtreesToCompile > 0) {
            return true;
        }

        if (this._dirtyNodes[nodeId] === true) {
            return true;
        }

        return false;
    };

    this._alwaysCompilePath = function(targetNode) {
        var nodeInstances;
        var id;
        var node = targetNode;
        while (node) {
            id = node._attr.id;

            this._nodeAlwaysCompile[id] = true;

            //            /* Ensure that instance allows compilation of the entire subgraph of its symbol
            //             * because the updated node will be a temporary child of the symbol subgraph's
            //             * rightmost leaf - otherwise the symbol subgraph will cull compilation of the
            //             * updated node if the subgraph is not flagged for compilation.
            //             */
            //            if (node._attr.nodeType == "instance") {
            //                this._nodeAlwaysCompile[id] = true;
            //            }
            //  this._nodesWithinBranches[instanceNodeId] = true;
            nodeInstances = SceneJS._nodeInstanceMap[id];
            if (nodeInstances) {
                for (var instanceNodeId in nodeInstances.instances) {
                    if (nodeInstances.instances.hasOwnProperty(instanceNodeId)) {
                        this._nodeAlwaysCompile[instanceNodeId] = true;
                        this._alwaysCompilePath(SceneJS._nodeIDMap[instanceNodeId]);
                    }
                }
            }
            node = node._parent;
        }
    };

    this.postVisitNode = function(node) {
        if (stackLen > 0) {
            var nodeId = node._attr.id;
            var peekNode = nodeStack[stackLen - 1];
            if (peekNode._attr.id == nodeId) {
                stackLen--;
                if (node._attr.nodeType == "instance") {
                    countTraversedInstanceLinks--;
                }
                var config = compileConfig[node._attr.nodeType];
                if (this._nodesWithinBranches[nodeId] === true || (config && config.alwaysCompile)) {
                    countTraversedSubtreesToCompile--;
                }

            }
        }
    };

})();
