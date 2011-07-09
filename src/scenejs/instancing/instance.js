(function() {

    window.SceneJS_instancingModule = new function() {
        var sceneId;
        var idStack = [];
        var countInstances = 0;
        var instances = {}; // Maps ID of each current node instance

        SceneJS_eventModule.addListener(
                SceneJS_eventModule.RESET,
                function() {
                    idStack = [];
                    countInstances = 0;
                    instances = {};
                });

        SceneJS_eventModule.addListener(
                SceneJS_eventModule.SCENE_COMPILING,
                function(params) {
                    sceneId = params.sceneId;
                    idStack = [];
                    countInstances = 0;
                    instances = {};
                });

        this._acquireInstance = function(id, node) {
            //        if (instances[nodeID]) {
            //            SceneJS_errorModule.error(
            //                    SceneJS.errors.INSTANCE_CYCLE,
            //                    "Instance attempted to create cyclic instantiation: " + nodeID);
            //            return null;
            //        }
            //        var node = SceneJS_sceneModule.scenes[sceneId].scene.nodeMap.items[nodeID];
            //        if (!node) {
            //            var nodeStore = SceneJS.Services.getService(SceneJS.Services.NODE_LOADER_SERVICE_ID);
            //            if (nodeStore) {
            //                node = nodeStore.loadNode(nodeID);
            //            }
            //        }
            //        if (node) {
            //            instances[nodeID] = nodeID;
            idStack.push(id);
            countInstances++;

            /* We set the instance node's ID on the render module, so that it may
             * internally form state IDs prefixed by the instance
             */
            SceneJS_renderModule.setIDPrefix(idStack.join(""));
            //        }
            //        return node;
        };

        /**
         * Query if any Nodes are currently being instanced - useful
         * for determining if certain memoisation tricks can be done safely by nodes
         */
        this.instancing = function() {
            return countInstances > 0;
        };

        this._releaseInstance = function(nodeID) {
            instances[nodeID] = null;
            idStack.pop();
            countInstances--;
            SceneJS_renderModule.setIDPrefix((countInstances > 0) ? idStack.join("") : null);
        };

        SceneJS._compilationStates.setSupplier("instances", {
            get: function() {
                return countInstances > 0;
            }
        });
    };

    var Instance = SceneJS.createNodeType("instance");

    Instance.prototype._init = function(params) {
        this.setTarget(params.target);
        this.attr.mustExist = params.mustExist;
        this.attr.retry = (params.retry == null || params.retry == undefined) ? false : params.retry;
        //this.attr.
        this._symbol = null;
    };

    /**
     * Returns the URI on which the Instance looks for its target {@link SceneJS_node}
     */
    Instance.prototype.getTarget = function() {
        return this.attr.target;
    };

    /**
     Returns the URI on which the Instance looks for its target {@link SceneJS_node}
     @param {String} target - target node ID
     @returns {Instance} This node
     */
    Instance.prototype.setTarget = function(target) {

        /* Deregister old link
         */
        var map;
        if (this.attr.target) {
            map = this.scene.instanceMap[this.attr.target];
            if (!map) {
                map = this.scene.instanceMap[this.attr.target] = {
                    numInstances: 0,
                    instances: {}
                };
            } else {
                delete map.instances[this.attr.id];
                map.numInstances--;
            }
        }
        this.attr.target = target;

        /* Register new link
         */
        if (target) {
            map = this.scene.instanceMap[target];
            if (!map) {
                map = this.scene.instanceMap[this.attr.target] = {
                    numInstances: 0,
                    instances: {}
                };
            }
            map.numInstances++;
            map.instances[this.attr.id] = this.attr.id;

        }
        this._resetCompilationMemos();
        return this;
    };


    // @private
    Instance.prototype._compile = function(traversalContext) {
        if (this.attr.target) {
            var nodeId = this.attr.target; // Make safe to set #uri while instantiating

            /* Try to find target node in graph
             */
            this._symbol = this.scene.nodeMap.items[nodeId];

            //        if (!this._symbol) {
            //
            //            /* Target not in graph, try to load target via service
            //             */
            //            var nodeStore = SceneJS.Services.getService(SceneJS.Services.NODE_LOADER_SERVICE_ID);
            //            if (nodeStore) {
            //                var libId = "SCENEJS_default_library";
            //                var sceneLib = this.scene.getNode(libId);
            //                if (!sceneLib) {
            //                    this.scene.addNode({
            //                        id: libId,
            //                        type: "library"
            //                    });
            //                }
            //                nodeStore.loadNode(
            //                        libId,
            //                        this.attr.target,
            //                        function() {        // Success
            //                            SceneJS_compileModule.nodeUpdated(self, "loaded");
            //                        },
            //                        function() {        // Error
            //
            //                        });
            //            }
            //        }

            if (!this._symbol) {

                /* Still no target
                 */
                var exception;
                if (this.attr.mustExist) {
                    throw SceneJS_errorModule.fatalError(
                            exception = SceneJS.errors.INSTANCE_TARGET_NOT_FOUND,
                            "Instance could not find target node: '" + this.attr.target + "'");
                }

                /**
                 * If we're going to keep trying to find the
                 * target, then we'll need the scene graph to
                 * keep rendering so that this instance can
                 * keep trying. Otherwise, we'll wait for the next
                 * render.
                 */
                if (this.attr.retry) {

                    SceneJS_compileModule.nodeUpdated(this, "searching");

                    /* Record this node as still loading, for "loading-status"
                     * events to include in their reported stats
                     */
                    SceneJS_loadStatusModule.status.numNodesLoading++;
                }

            } else {

                SceneJS_instancingModule._acquireInstance(this.attr.id, nodeId);

                /* Record this node as loaded
                 */
                SceneJS_loadStatusModule.status.numNodesLoaded++;

                if (SceneJS_compileModule.preVisitNode(this._symbol)) {
                    SceneJS_flagsModule.preVisitNode(this._symbol);
                    this._symbol._compileWithEvents(this._createTargetTraversalContext(traversalContext, this._symbol));
                    SceneJS_flagsModule.postVisitNode(this._symbol);
                }

               // SceneJS_compileModule.postVisitNode(this._symbol);
             //   SceneJS_renderModule.marshallStates();
                SceneJS_instancingModule._releaseInstance(nodeId);
                this._symbol = null;
            }
        }
    };

    /* Returns a traversal context for traversal of the children of the given target node.
     *
     * If this Instance has children then it will have a callback that will render them after the last of
     * the target's sub-nodes have rendered, as effectively the children of that last node. The callback will
     * create a traversal context for the sub-nodes that will:
     *
     * - initially flag the traversal as inside the right fringe if the there are more than one child
     * - pass on any callback that was passed in on the traversal context to this Instance
     * - pass on any WithConfigs configs that were passed in on the traversal context to this Instance
     *
     * @private
     */
    Instance.prototype._createTargetTraversalContext = function(traversalContext, target) {
        this._superCallback = traversalContext.callback;
        var self = this;
        if (!this._callback) {
            this._callback = function(traversalContext) {
                var subTraversalContext = {

                    /* For instancing mechanism, track if we are traversing down right fringe
                     * and pass down the callback.
                     *
                     * DOCS: http://scenejs.wikispaces.com/Instancing+Algorithm
                     */
                    insideRightFringe : self.children.length > 1,
                    callback : self._superCallback
                };
                self._compileNodes(subTraversalContext);
            };
        }
        return {
            callback: this._callback,
            insideRightFringe:  target.children.length > 1
        };
    };

    Instance.prototype._destroy = function() {
        if (this.attr.target) {
            var map = this.scene.instanceMap[this.attr.target];
            if (map) {
                map.numInstances--;
                delete map.instances[this.attr.id];
            }
        }
    };

})();
    