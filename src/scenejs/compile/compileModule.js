/*----------------------------------------------------------------------------------------------------------------

 * Scene Compilation
 *
 * DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
 *
 *--------------------------------------------------------------------------------------------------------------*/

var SceneJS_compileModule = new (function() {

    var debugCfg;

    /* Compile disabled by default
     */
    this._enableCompiler = false;

    /** Tracks compilation states for each scene
     */
    this._scenes = {};
    this._scene = null;


    /* Stack to track nodes during scene traversal. Public push and pop methods are used with this
     * to track which nodes are within subgraphs that are targeted by instance nodes, in order to flag
     * node compilations along traversal paths.
     */
    var nodeStack = new Array(1000);
    var stackLen = 0;

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
     * Tracks highest compilation level selected for each node that compiler receives update notification on.
     * Is emptied after compilation. A notification that would result in lower compilation level than already stored
     * for each node are ignored.
     * Array eleared on exit from scheduleCompilations
     */
    this._nodeCompilationLevels = {};


    /*-----------------------------------------------------------------------------------------------------------------
     * Priority queue of compilations. Each element is a directive to (re)compile a portion of the scene
     * graph relative to a given node. They is ordered by decreasing generality of compilation to avoid overlap,
     * and are processed and cleared before each scene traversal to set combinations of the traversal flags
     * defined above.
     *---------------------------------------------------------------------------------------------------------------*/

    var CompilationQueue = function() {
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
    };

    var self = this;
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.INIT,
            function() {
                debugCfg = SceneJS_debugModule.getConfigs("compilation");
                self._enableCompiler = (debugCfg.enabled === false) ? false : true;
            });


    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_CREATED,
            function(params) {
                self._scenes[params.sceneId] = {
                    flagSceneCompile: false,
                    dirtyNodes: {},
                    dirtyNodesWithinBranches : {},

                    /* Incremented as we traverse instance link, decremented as we return
                     */
                    countTraversedInstanceLinks : 0,

                    /* Incremented when we traverse into a node that is flagged for
                     * entire subtree compilation, decremented on return
                     */
                    countTraversedSubtreesToCompile : 0,
                    compilationQueue : new CompilationQueue()
                };
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {
                self._scenes[params.sceneId] = null;
            });


    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function(params) {

                var compileScene = self._scene = self._scenes[params.sceneId];

                /* Ready to note nodes that are within
                 * instanced subtrees in _nodeInstanced
                 */
                stackLen = 0;
                compileScene.countTraversedInstanceLinks = 0;

                /*
                 */
                compileScene.countTraversedSubtreesToCompile = 0;

                /* Initiate (re)compilation
                 */
                var compileMode = (compileScene.flagSceneCompile || !self._enableCompiler)
                        ? SceneJS_renderModule.COMPILE_SCENE
                        : SceneJS_renderModule.COMPILE_NODES;

                SceneJS_renderModule.bindScene({ sceneId: params.sceneId }, { compileMode: compileMode });
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILED,
            function() {
                var scene = self._scene;
                scene.flagSceneCompile = false;
                scene.dirtyNodes = {};
                scene.dirtyNodesWithinBranches = {};
            });


    this._preCompile = function(node) {

    };


    /*-----------------------------------------------------------------------------------------------------------------
     * NOTIFICATION
     *
     *----------------------------------------------------------------------------------------------------------------*/

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
            return;
        }

        var nodeScene = node._scene;
        if (!nodeScene) {
            throw "Updated node without a scene";
        }
        var compileScene = this._scenes[nodeScene._attr.id];
        if (!compileScene) {
            throw "Updated node without a compiler scene";
        }

        /* Further updates redundant when entire scene flagged for compile
         */
        if (compileScene.flagSceneCompile) {
            return;
        }

        var nodeType = node._attr.nodeType;
        var nodeId = node._attr.id;
        var level;

        /* Compilation configs for base node type overrides configs for subtypes
         */
        if (nodeType != "node") {
            level = SceneJS_compileCfg.getCompileLevel("node", op, attrName, value);
        }

        /* When no config found for base type then find for subtype
         */
        if (level === undefined) {
            level = SceneJS_compileCfg.getCompileLevel(nodeType, op, attrName, value);
        }

        if (level == SceneJS_compileCfg.COMPILE_NOTHING) {
            return;
        }

        if (level === undefined) {
            level = SceneJS_compileCfg.COMPILE_SCENE;
        }

        /* Compilation queue redundant when entire scene needs compilation
         */
        if (level == SceneJS_compileCfg.COMPILE_SCENE) {
            compileScene.flagSceneCompile = true;
            compileScene.compilationQueue.clear();
            return;
        }

        /* COMPILE_SUBTREE and COMPILE_NODE get bumped up to COMPILE_BRANCH
         * when the target node is found to be within a subtree that is targeted by
         * an instance node. This is due to how instance nodes work, where if an
         * instance node defines child nodes, then they become surrogate children
         * of the target sub-graph's right-most node.
         */
        if (this._nodeInstanced[nodeId]) {
            if (level == SceneJS_compileCfg.COMPILE_SUBTREE || level == SceneJS_compileCfg.COMPILE_NODE) {
                level = SceneJS_compileCfg.COMPILE_BRANCH;
            }
        }

        if (level == SceneJS_compileCfg.COMPILE_SUBTREE) {
            level = SceneJS_compileCfg.COMPILE_BRANCH;
        }

        if (level == SceneJS_compileCfg.COMPILE_NODE) {
            level = SceneJS_compileCfg.COMPILE_PATH;
        }

        /* Only reschedule compilation for node if new level is more general.
         */
        if (this._nodeCompilationLevels[nodeId] <= level) {
            return;
        }
        this._nodeCompilationLevels[nodeId] = level;

        var priority = level;

        compileScene.compilationQueue.push({
            node: node,
            op: op,
            attrName: attrName,
            level: level,
            priority: priority
        });
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * SHEDULING
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /**
     * Flush compilation queue to set all the flags that will direct the next compilation traversal
     */
    this.scheduleCompilations = function(sceneId) {

        if (!this._enableCompiler) {
            return true;
        }

        var compileScene = this._scenes[sceneId];
        if (!compileScene) {
            throw "scene not found";
        }

        if (compileScene.flagSceneCompile) {
            return true;
        }

        var compilationQueue = compileScene.compilationQueue;
        if (compilationQueue.size() == 0) {
            return false;
        }

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
            SceneJS_loggingModule.info("-------------------------------------------------------------------");
            SceneJS_loggingModule.info("COMPILING ...");
            SceneJS_loggingModule.info("");
        }

        while (compilationQueue.size() > 0) {

            compilation = compilationQueue.pop();

            level = compilation.level;
            node = compilation.node;
            nodeId = node._attr.id;

            if (debugCfg.logTrace) {
                var logLevels = debugCfg.logTrace.levels || {};
                var minLevel = logLevels.min || SceneJS_compileCfg.COMPILE_SCENE;
                var maxLevel = (logLevels.max == undefined || logLevels.max == null) ? SceneJS_compileCfg.COMPILE_NODE : logLevels.max;
                if (minLevel <= level && level <= maxLevel) {
                    SceneJS_loggingModule.info("Compiling - level: "
                            + SceneJS_compileCfg.levelNameStrings[compilation.level] + ", node: "
                            + compilation.node._attr.nodeType + ", node ID: " + compilation.node._attr.id + ", op: "
                            + compilation.op + ", attr: "
                            + compilation.attrName);
                }
            }

            if (level == SceneJS_compileCfg.COMPILE_SCENE) {
                throw "SceneJS_compileCfg.COMPILE_SCENE should not be queued";

            } else if (level == SceneJS_compileCfg.COMPILE_BRANCH) {          // Compile node, nodes on path to root and nodes in subtree
                this._flagCompilePath(compileScene, node);                      // Compile nodes on path
                compileScene.dirtyNodesWithinBranches[nodeId] = true;        // Ensures that traversal descends into subnodes
                stats.branch++;

            } else if (level == SceneJS_compileCfg.COMPILE_PATH) {            // Compile node plus nodes on path to root
                this._flagCompilePath(compileScene, node);                      // Traversal will not descend below the node
                stats.path++;

            } else if (level == SceneJS_compileCfg.COMPILE_SUBTREE) {         // Compile node plus nodes in subtree
                if (!compileScene.dirtyNodesWithinBranches[nodeId]) {        // No need if already compiled as part of a COMPILE_BRANCH
                    compileScene.dirtyNodesWithinBranches[nodeId] = true;    // Ensures that traversal descends into subnodes
                    stats.subtree++;
                }

            } else if (level == SceneJS_compileCfg.COMPILE_NODE) {            // Compile just the node
                if (!compileScene.dirtyNodes[nodeId]) {                 // No need if already compiled
                    this.needCompileNodes = true;
                    stats.node++;
                }
            }
        }

        if (debugCfg.logTrace) {
            SceneJS_loggingModule.info("-------------------------------------------------------------------");
        }

        this._nodeCompilationLevels = {};

        return true;
    };

    /** Flags node and all nodes on path to root for recompilation
     */
    this._flagCompilePath = function(compileScene, targetNode) {
        var dirtyNodes = compileScene.dirtyNodes;
        var nodeInstances;
        var id;
        var node = targetNode;
        while (node) {
            id = node._attr.id;

            // TODO: why do these two lines break compilation within instanced subtrees?
//            if (dirtyNodes[id]) { // Node on path already marked, along with all instances of it
//                return;
//            }
//            if (compileScene.dirtyNodesWithinBranches[id]) { // Node on path already marked, along with all instances of it
//                return;
//            }

            /* Ensure that instance allows compilation of the entire subgraph of its symbol
             * because the updated node will be a temporary child of the symbol subgraph's
             * rightmost leaf - otherwise the symbol subgraph will cull compilation of the
             * updated node if the subgraph is not flagged for compilation.
             */
            if (node._attr.nodeType == "instance") {
                compileScene.dirtyNodesWithinBranches[id] = true;
            }
            dirtyNodes[id] = true;
            nodeInstances = SceneJS._nodeInstanceMap[id];
            if (nodeInstances) {
                for (var instanceNodeId in nodeInstances.instances) {
                    if (nodeInstances.instances.hasOwnProperty(instanceNodeId)) {
                        compileScene.dirtyNodesWithinBranches[instanceNodeId] = true;
                        this._flagCompilePath(compileScene, SceneJS._nodeIDMap[instanceNodeId]);
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

        var compileScene = this._scene;
        var config = SceneJS_compileCfg.config[node._attr.nodeType];
        var nodeId = node._attr.id;

        /* When doing complete indescriminate scene compile, take this opportunity
         * to flag paths to nodes that must always be compiled
         */
        if (compileScene.flagSceneCompile) {
            this._nodeAlwaysCompile[nodeId] = false;
            if (config && config.alwaysCompile) {
                this._alwaysCompilePath(node);
            }
        }

        /* Track compilation path into scene graph
         */
        nodeStack[stackLen++] = node;

        /* Track nodes within instances
         */
        this._nodeInstanced[nodeId] = (this._scene.countTraversedInstanceLinks > 0);

        /* Track number of nodes compiling within subtrees of instances 
         */
        if (node._attr.nodeType == "instance") {
            compileScene.countTraversedInstanceLinks++;
        }

        /* Compile entire subtree when within a subtree flagged for complete compile,
         * or when within a node that must always be compiled
         */

        if (compileScene.dirtyNodesWithinBranches[nodeId] === true || (config && config.alwaysCompile)) {
            compileScene.countTraversedSubtreesToCompile++;
        }

        /* Compile every node when doing indiscriminate scene compile
         */
        if (compileScene.flagSceneCompile) {
            return true;
        }

        /* Compile every node flagged for indiscriminate compilation
         */
        if (this._nodeAlwaysCompile[nodeId]) {
            return true;
        }

        /* Compile every node
         */
        if (compileScene.countTraversedSubtreesToCompile > 0) {
            return true;
        }

        if (compileScene.dirtyNodes[nodeId] === true) {
            return true;
        }

        return false;
    };

    this._alwaysCompilePath = function(targetNode) {
        if (this._nodeAlwaysCompile[id]) {
            return;
        }
        var nodeInstances;
        var id;
        var node = targetNode;
        while (node) {
            id = node._attr.id;
            this._nodeAlwaysCompile[id] = true;
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
            var compileScene = this._scene;
            var nodeId = node._attr.id;
            var peekNode = nodeStack[stackLen - 1];
            if (peekNode._attr.id == nodeId) {
                stackLen--;
                if (node._attr.nodeType == "instance") {
                    compileScene.countTraversedInstanceLinks--;
                }
                var config = SceneJS_compileCfg.config[node._attr.nodeType];
                if (compileScene.dirtyNodesWithinBranches[nodeId] === true || (config && config.alwaysCompile)) {
                    compileScene.countTraversedSubtreesToCompile--;
                }
            }
        }
    };

})();
