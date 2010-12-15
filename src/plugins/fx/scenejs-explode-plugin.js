(function() {

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

    if (commandService.hasCommand("fx.explode")) {
        return;
    }

    //----------------------------------------------------------------
    // fx.explode
    //----------------------------------------------------------------

    commandService.addCommand("fx.explode",
            (function() {
                return {
                    execute: function(params) {
                        var target = params.target;
                        if (target) {
                            explode(target, params.factor);
                        }
                    }
                };
            })());

    function explode(nodeId, factor) {

        var node = SceneJS.withNode(nodeId);
        var rootData = node.get("data");

        /* First of all, ensure nodes for explosion control are inserted
         */
        if (!rootData._explode) {

            SceneJS.withNode(nodeId).eachNode(
                    function() {
                        var childId = this.get("id");
                        var childData = this.get("data");

                        var boundary = getGeometriesBoundary(childId, null);

                        var xCenter = (boundary.xmax + boundary.xmin ) * 0.5;
                        var yCenter = (boundary.ymax + boundary.ymin ) * 0.5;
                        var zCenter = (boundary.zmax + boundary.zmin ) * 0.5;

                        SceneJS.withNode(childId).insert({
                            nodes: [

                                // Moves node back out to current position

                                {
                                    type: "translate",
                                    id: childId + "._explode-pos",
                                    x: xCenter,
                                    y: yCenter,
                                    z: zCenter,

                                    nodes: [

                                        // Moves node to world-space origin
                                        {
                                            type: "translate",
                                            id: childId + "._explode-center",
                                            x: -xCenter,
                                            y: -yCenter,
                                            z: -zCenter
                                        }
                                    ]
                                }
                            ]
                        });
                    }, {
                depthFirst: false,  // Iterate children only, no recursion
                andSelf: true
            });

            /* Mark node as having explosion controls
             */
            if (!rootData._explode) {
                rootData._explode = {};
            }
            rootData._explode.exploded = true;
            node.set("data", rootData);
        }

        /* Now if we have an explosion factor, set the current
         * degree of explosion
         */
        if (factor) {
            SceneJS.withNode(nodeId).eachNode(
                    function() {
                        var childId = this.get("id");
                        var childPosId = childId + "._explode-pos";
                        if (SceneJS.nodeExists(childPosId)) {
                            var childPosNode = SceneJS.withNode(childPosId);
                            var pos = childPosNode.get("xyz");

                            var childData = this.get("data");
                            var explodeData = childData["fx.explode"];
                            if (explodeData && explodeData.pos) {

                            }
                        }
                    });
        }
    }


    function getGeometriesBoundary(nodeId, boundary) {
        boundary = boundary || {
            xmin : Number.MAX_VALUE,
            ymin : Number.MAX_VALUE,
            zmin : Number.MAX_VALUE,
            xmax : Number.MIN_VALUE,
            ymax : Number.MIN_VALUE,
            zmax : Number.MIN_VALUE
        };
        SceneJS.withNode(nodeId).eachNode(
                function() {
                    var type = this.get("type");
                    if (type == "geometry") {
                        var b = this.get("boundary");  // geometry  read-only attribute
                        if (b.xmin < boundary.xmin) {
                            boundary.xmin = b.xmin;
                        }
                        if (b.ymin < boundary.ymin) {
                            boundary.ymin = b.ymin;
                        }
                        if (b.zmin < boundary.zmin) {
                            boundary.zmin = b.zmin;
                        }
                        if (b.xmax > boundary.xmax) {
                            boundary.xmax = b.xmax;
                        }
                        if (b.ymax > boundary.ymax) {
                            boundary.ymax = b.ymax;
                        }
                        if (b.zmax > boundary.zmax) {
                            boundary.zmax = b.zmax;
                        }
                    } else if (type == "instance") {
                        var targetNodeId = this.get("target");
                        if (SceneJS.nodeExists(targetNodeId)) {
                            getGeometriesBoundary(targetNodeId, boundary);
                        }
                    }
                }, { depthFirst: true, andSelf: true });
        return boundary;
    }

    //----------------------------------------------------------------
    // fx.collapse
    //----------------------------------------------------------------

    commandService.addCommand("fx.collapse",
            (function() {
                return {
                    execute: function(params) {
                        var target = params.target;
                        if (target) {
                            collapse(target);
                        }
                    }
                };
            })());


    function collapse(nodeId) {

        var node = SceneJS.withNode(nodeId);

        /* Do nothing if node not marked as currently exploded
         */
        var rootData = node.get("data");
        if (!rootData._explode || !rootData._explode.exploded) {
            return;
        }

        var self = this;

        //.......

        /* Mark node as currently not exploded
         */
        rootData._explode.exploded = false;
        node.set("data", rootData);
    }

})();