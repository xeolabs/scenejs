/*----------------------------------------------------------------------------------------------------------------

 * Scene Compilation
 *
 * DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
 *
 *--------------------------------------------------------------------------------------------------------------*/

var SceneJS_compileModule = new (function() {

    this._debugCfg = null;

    /* Compile enabled by default
     */
    this._enableCompiler = true;

    /** Tracks compilation states for each scene
     */
    this._scenes = {};
    this._scene = null;


    /* Stack to track nodes during scene traversal.
     */
    this._nodeStack = [];
    this._stackLen = 0;

    /*-----------------------------------------------------------------------------------------------------------------
     * Priority queue of compilations, optimised for minimal garbage collection and implicit sort. Each entry has 
     * a scene graph node and a compilation level. Entries are ordered in descending order of compilation level.
     *---------------------------------------------------------------------------------------------------------------*/

    var CompilationQueue = function() {
        this._bins = [];
        this.size = 0;

        this.insert = function(level, node) {
            var bin = this._bins[level];
            if (!bin) {
                bin = this._bins[level] = [];
                bin.numNodes = 0;
            }
            var compilation = bin[bin.numNodes];
            if (!compilation) {
                compilation = bin[bin.numNodes] = {};
            }
            compilation.node = node;
            compilation.level = level;
            bin.numNodes++;
            this.size++;
        };

        this.remove = function() {
            var bin;
            for (var level = SceneJS_compileCfg.COMPILE_NOTHING; level <= SceneJS_compileCfg.RESORT; level++) {
                bin = this._bins[level];
                if (bin && bin.numNodes > 0) {
                    this.size--;
                    return bin[--bin.numNodes];
                }
            }
            return null;
        };

        this.clear = function() {
            var bin;
            for (var level = SceneJS_compileCfg.COMPILE_NOTHING; level <= SceneJS_compileCfg.RESORT; level++) {
                bin = this._bins[level];
                if (bin) {
                    this._bins[level].numNodes = 0;
                }
            }
            this.size = 0;
        };
    };

    var self = this;
    SceneJS_eventModule.addListener(
            SceneJS_eventModule.INIT,
            function() {
                self._debugCfg = SceneJS_debugModule.getConfigs("compilation");
            //    self._enableCompiler = !!self._debugCfg.enabled;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_CREATED,
            function(params) {
                self._scenes[params.sceneId] = {
                    flagSceneCompile: false,
                    dirtyNodes: {},
                    dirtyNodesWithinBranches : {},

                    /* Incremented when we traverse into a node that is flagged for
                     * entire subtree compilation, decremented on return
                     */
                    countTraversedSubtreesToCompile : 0,
                    compilationQueue : new CompilationQueue(),

                    /**
                     * Tracks highest compilation level selected for each node that compiler receives update notification on.
                     * Is emptied after compilation. A notification that would result in lower compilation level than already stored
                     * for each node are ignored.
                     * Array eleared on exit from scheduleCompilations
                     */
                    nodeCompilationLevels : {},

                    /* Flag for each node indicating if it must always be recompiled
                     */
                    nodeAlwaysCompile : {},

                    stats: {
                        nodes: 0
                    }
                };
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {
                self._scenes[params.sceneId] = null;
            });

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
        var nodeScene = node.scene;
        var compileScene = this._scenes[nodeScene.attr.id];

        if (compileScene.compilingScene) {
            return;
        }

        var nodeType = node.attr.type;
        var nodeId = node.attr.id;
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

        if (level == SceneJS_compileCfg.REDRAW) {
            compileScene.redraw = true;
            return;
        }

        if (level == SceneJS_compileCfg.COMPILE_NOTHING) {
            return;
        }

        if (level === undefined) {
            level = SceneJS_compileCfg.COMPILE_SCENE;
        }

        if (level == SceneJS_compileCfg.COMPILE_SCENE) {
            compileScene.compilingScene = true;
            compileScene.compilationQueue.clear();
            return;
        }

        /* Only reschedule compilation for node if new level is more general.
         */
        if (compileScene.nodeCompilationLevels[nodeId] <= level) {
            return;
        }
        compileScene.nodeCompilationLevels[nodeId] = level;
        compileScene.compilationQueue.insert(level, node);
    };


    /*-----------------------------------------------------------------------------------------------------------------
     * SHEDULING
     *
     *----------------------------------------------------------------------------------------------------------------*/

    this.COMPILE_NOTHING = 0;       // No recompilations
    this.REDRAW = 1;                // Redraw display list, resolves render-time node dependencies like texture->imageBuf
    this.COMPILE_PARTIAL = 2;       // Recompile some nodes back into display list
    this.COMPILE_EVERYTHING = 3;    // Recompile all nodes, rebuilding the entire display list

    /**
     * Flush compilation queue to set all the flags that will direct the next compilation traversal
     */
    this.beginSceneCompile = function(sceneId) {
        var compileScene = this._scenes[sceneId];
        this._scene = compileScene;

        this._stackLen = 0;
        compileScene.countTraversedSubtreesToCompile = 0;

        if (!this._enableCompiler) {
            return { level: this.COMPILE_EVERYTHING };
        }

        compileScene.nodeCompilationLevels = {};

        if (compileScene.compilingScene) {
            compileScene.flagSceneCompile = true;
            compileScene.compilingScene = false;
            return { level: this.COMPILE_EVERYTHING };
        }

        var compilationQueue = compileScene.compilationQueue;
        if (compilationQueue.size == 0) {
            if (compileScene.redraw) {
                compileScene.redraw = false;
                return { level: this.REDRAW };
            }
            return { level: this.COMPILE_NOTHING };
        }

        var compilation;
        var node;
        var nodeId;
        var level;

        compileScene.stats = {
            scene: 0,
            branch: 0,
            path: 0,
            subtree: 0,
            nodes: 0
        };
        var stats = compileScene.stats;

        if (this._debugCfg.logTrace) {
            SceneJS_loggingModule.info("-------------------------------------------------------------------");
            SceneJS_loggingModule.info("COMPILING ...");
            SceneJS_loggingModule.info("");
        }

        var result = {
            level: this.REDRAW,     // Just flag display redraw until we know we need any node recompilations
            resort: false           // Don't know if we'll need to sort display list yet
        };

        while (compilationQueue.size > 0) {

            compilation = compilationQueue.remove();

            level = compilation.level;
            node = compilation.node;
            nodeId = node.attr.id;

            //            if (this._debugCfg.logTrace) {
            //                var logLevels = this._debugCfg.logTrace.levels || {};
            //                var minLevel = logLevels.min || SceneJS_compileCfg.COMPILE_SCENE;
            //                var maxLevel = (logLevels.max == undefined || logLevels.max == null) ? SceneJS_compileCfg.COMPILE_NODE : logLevels.max;
            //                if (minLevel <= level && level <= maxLevel) {
            //                    SceneJS_loggingModule.info("Compiling - level: "
            //                            + SceneJS_compileCfg.levelNameStrings[compilation.level] + ", node: "
            //                            + compilation.node.attr.type + ", node ID: " + compilation.node.attr.id + ", op: "
            //                            + compilation.op + ", attr: "
            //                            + compilation.attrName);
            //                }
            //            }

            if (level == SceneJS_compileCfg.COMPILE_BRANCH) {          // Compile node, nodes on path to root and nodes in subtree
                this._flagCompilePath(compileScene, node);                      // Compile nodes on path
                compileScene.dirtyNodesWithinBranches[nodeId] = true;        // Ensures that traversal descends into subnodes
                //    stats.branch++;
                result.level = this.COMPILE_PARTIAL;

            } else if (level == SceneJS_compileCfg.COMPILE_PATH) {            // Compile node plus nodes on path to root
                this._flagCompilePath(compileScene, node);                      // Traversal will not descend below the node
                // stats.path++;
                result.level = this.COMPILE_PARTIAL;

            }  else if (level == SceneJS_compileCfg.RESORT) {
                result.resort = true;
            }
        }

        if (this._debugCfg.logTrace) {
            SceneJS_loggingModule.info("-------------------------------------------------------------------");
        }

        return result;
    };

    /** Flags node and all nodes on path to root for recompilation
     */
    this._flagCompilePath = function(compileScene, targetNode) {
        var dirtyNodes = compileScene.dirtyNodes;
        var id;
        var node = targetNode;
        while (node) {
            id = node.attr.id;

            // TODO: why do these two lines break compilation within instanced subtrees?
                        if (dirtyNodes[id]) { // Node on path already marked, along with all instances of it
                            return;
                        }
                        if (compileScene.dirtyNodesWithinBranches[id]) { // Node on path already marked, along with all instances of it
                            return;
                        }
            dirtyNodes[id] = true;
            node = node.parent;
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
        var config = SceneJS_compileCfg.config[node.attr.type];
        var nodeId = node.attr.id;

        compileScene.stats.nodes++;

        /* When doing complete indescriminate scene compile, take this opportunity
         * to flag paths to nodes that must always be compiled
         */
        if (compileScene.flagSceneCompile) {
            compileScene.nodeAlwaysCompile[nodeId] = false;
            if (config && config.alwaysCompile) {
                this._alwaysCompilePath(compileScene, node);
            }
        }

        /* Track compilation path into scene graph
         */
        this._nodeStack[this._stackLen++] = node;


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
        if (compileScene.nodeAlwaysCompile[nodeId]) {
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

        compileScene.stats.nodes--;

        return false;
    };

    this._alwaysCompilePath = function(compileScene, targetNode) {
        if (compileScene.nodeAlwaysCompile[id]) {
            return;
        }
        var id;
        var node = targetNode;
        while (node) {
            id = node.attr.id;
            compileScene.nodeAlwaysCompile[id] = true;
            node = node.parent;
        }
    };

    this.postVisitNode = function(node) {
        if (this._stackLen > 0) {
            var compileScene = this._scene;
            var nodeId = node.attr.id;
            var peekNode = this._nodeStack[this._stackLen - 1];
            if (peekNode.attr.id == nodeId) {
                this._stackLen--;
                var config = SceneJS_compileCfg.config[node.attr.type];
                if (compileScene.dirtyNodesWithinBranches[nodeId] === true || (config && config.alwaysCompile)) {
                    compileScene.countTraversedSubtreesToCompile--;
                }
            }
            compileScene.dirtyNodes[nodeId] = false;
            compileScene.dirtyNodesWithinBranches[nodeId] = false;
        }
    };

    this.finishSceneCompile = function() {
        var scene = this._scene;
        scene.flagSceneCompile = false;
    };

})();