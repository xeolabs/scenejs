/**
 * Frustum detail culling body
 *
 * @author xeolabs / http://xeolabs.com
 *
 */
SceneJS.Types.addType("cull/visibility", {

    construct: function (params) {

        var self = this;

        this.addNode({
                type: "cull/body",
                shape: params.shape,
                min: params.min,
                max: params.max,
                showBoundary: params.showBoundary,
                frustumCull: params.frustumCull ? params.frustumCull : true, // Enable frustum culling?
                detailCull: false // Don't need LOD switching
            },
            function (body) {
                if (params.nodes) {
                    self.addNode({
                            type: "enable",
                            enabled: false,
                            nodes: params.nodes
                        },
                        function (enable) {
                            body.on("intersect",
                                function (intersect) {
                                    switch (intersect) {
                                        case 0: // Completely outside frustum
                                            enable.setEnabled(false);
                                            break;
                                        case 1: // Partially inside frustum
                                            enable.setEnabled(true);
                                            break;
                                        case 2: // Completely inside frustum
                                            enable.setEnabled(true);
                                            break;
                                    }
                                });
                        });
                }
            });
    }
});