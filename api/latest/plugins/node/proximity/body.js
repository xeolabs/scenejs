/**
 * Body within a proximity culling system
 *
 *  var body = myNode.addNode({
 *      type: "proximity/body",
 *      pos: [45, -34, 100],
 *      radius: 35
 *  });
 *
 *  body.on("proximity",
 *      function(status) {
 *          switch(status) {
                case 0:
 *                  // Body is outside outer proximity radius
 *                  break;
 *
 *              case 1:
 *                  // Body intersects outer proximity radius
 *                  break;
 *
 *              case 2:
 *                  // Body intersects inner proximity radius
 *                  break;
 *          }
 *      });
 *
 *  TODO:
 *
 *  Handle load/unload for nodes that are added with #addNode and #addNodes etc
 */
require([
    // Prefix routes to plugin support libs
    "scenejsPluginDeps/proximity/proximitySystemPool"
],
    function (pool) {

        SceneJS.Types.addType("proximity/body", {

            init:function (params) {

                // We'll create the system on pre-compile, where we can find the parent lookat

                this._pos = params.pos || [0, 0, 0];
                this._radius = params.radius || 1.0;
                this._systemId = params.systemId;
                this._culling = params.culling != undefined ? params.culling : true;
                this._nodesAdded = false;

                if (params.nodes) {
                    if (this._culling) {

                        // If this node manages culling of child nodes, then
                        // create a flags node to show/hide them, and retain
                        // their JSON definition so we can create and
                        // destroy them as the body intersection state changes
                        // with respect to the outer radius

                        this._cullingFlags = this.addNode({
                            type:"flags",
                            flags:{
                                enabled:false,
                                backfaces: false
                            }
                        });
                        this._culledNodes = params.nodes;
                    } else {
                        this.addNodes(params.nodes);
                    }
                }
            },

            preCompile:function () {
                this._build();
            },

            _build:function () {
                this._putSystem();
                // Find parent lookat
                var lookat = this.parent;
                while (lookat && lookat.type != "lookAt") {
                    lookat = lookat.parent;
                }
                if (!lookat) {
                    console.log("Failed to create 'proximity/body' node ID '" + this.getId()
                        + "' : mandatory parent 'lookat' node not found");
                } else {
                    this._getSystem(lookat);
                }
                this._lastStatus = null;
            },

            _putSystem:function () {
                if (this._bodyId) {
                    this._system.removeBody(this._bodyId);
                    this._bodyId = null;
                }
                if (this._systemId) {
                    pool.putSystem(this._system);
                    this._systemId = null;
                }
            },

            // Get culling system for this scene
            // When params.systemId is undefined, get the default system for this scene
            _getSystem:function (lookat) {
                this._system = pool.getSystem(this.getScene(), lookat, this._systemId);
                var self = this;
                try {
                    // There must be no overlap in params for SceneJS and the culling system
                    // because we are just passing those params straight through to the system.
                    this._bodyId = this._system.createBody({
                            pos:this._pos,
                            radius:this._radius
                        },
                        function (status) { // Body update handler

                            // status == 0 : body outside outer radius
                            // status == 1 : body intersects outer radius
                            // status == 2:  body intersects inner radius

                            self.publish("proximity", status);

                            if (self._culling) {
                                switch (status) {
                                    case -1:
                                    case 2:
                                        // Body now outside outermost radius
                                        if (self._culling && self._culledNodes) {
                                            if (self._nodesAdded) {
                                                // Remove child nodes
                                                self._cullingFlags.removeNodes();
                                                console.log("[proximity/body " + self.id + "] - Removed child nodes");
                                                self._nodesAdded = false;
                                            }
                                        }
                                        // Hide child nodes
                                        self._cullingFlags.setEnabled(false);
                                        break;
                                    case 1:
                                        // Body now intersects next-to-inner radius
                                        if (self._culling && self._culledNodes) {
                                            if (!self._nodesAdded) {
                                                // Add nodes if holding them and not yet added
                                                self._cullingFlags.addNodes(self._culledNodes);
                                                console.log("[proximity/body " + self.id + "] - Added child nodes");
                                                self._nodesAdded = true;
                                            }
                                        }
                                        // Show child nodes
                                        self._cullingFlags.setEnabled(false);
                                        break;
                                    case 0:
                                        // Body now intersects inner radius,
                                        if (self._culling && self._culledNodes) {
                                            if (!self._nodesAdded) {
                                                // Add nodes if holding them and not yet added
                                                self._cullingFlags.addNodes(self._culledNodes);
                                                console.log("[proximity/body " + self.id + "] - Added child nodes");
                                                self._nodesAdded = true;
                                            }
                                        }
                                        // Show child nodes
                                        self._cullingFlags.setEnabled(true);
                                }
                                self._lastStatus = status;
                            }
                        });
                } catch (e) {
                    console.log("Failed to create 'proximity/body' node ID '" + this.getId() + "' : " + e);
                }
            },

            setPos:function (pos) {
                this._pos = pos;
                if (this._bodyId) {
                    // update body in system
                }
            },

            getPos:function () {
                return this._pos;
            },

            setRadius:function (radius) {
                this._radius = radius;
                if (this._bodyId) {
                    // update body in system
                }
            },

            getRadius:function () {
                return this._radius;
            },

            postCompile:function () {
                // Not used
            },

            destroy:function () {
                this._putSystem();
            }
        });
    });
