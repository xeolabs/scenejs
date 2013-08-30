/**
 *
 *      });
 */

SceneJS.Types.addType("proximity/lod", {

    init:function (params) {

        var self = this;

        this.addNode({
                type:"proximity/body",
                pos:params.pos,
                radius:params.radius,

                // Don't let the body perform node culling
                // We'll be doing LOD switching in this node instead
                culling:false
            },
            function (body) {
                if (params.nodes) {
                    var flags = [];
                    for (var i = 0, len = params.nodes.length; i < len; i++) {
                        flags.push(
                            self.addNode({
                                type:"flags",
                                flags:{
                                    enabled:false
                                },
                                nodes:[
                                    params.nodes[i]
                                ]
                            }));
                    }

                    var prevNode;

                    body.on("proximity",
                        function (status) {
                            if (prevNode) {
                                prevNode.setEnabled(false);
                            }
                            if (params.nodes) {
                                if (status != -1) {
                                    var node = flags[status];
                                    if (node) {
                                        node.setEnabled(true);
                                        prevNode = node;
                                    }
                                }
                            }
                        });
                }
            });
    }
});