SceneJS.Types.addType("object", {

    init:function (params) {

        // Create child nodes

        var node;

        if (params.pos) {
            this.translate = node = this.addNode({
                type:"translate"
            });
        }

        if (params.scale) {
            this.scale = node = node.addNode({
                type:"scale",
                x:1,
                y:1,
                z:1
            });
        }

        if (params.rotate) {
            this.rotate = node = node.addNode({
                type:"rotate",
                x:1,
                y:1,
                z:1,
                angle:0
            });
        }

        if (params.matrix) {
            this.matrix = node = node.addNode({
                type:"matrix"
            });
        }

        if (params.material) {
            this.material = node = node.addNode({
                type:"material",
                color:{ r:1.0, g:0.6, b:0.6 }
            });
        }

        if (params.nodes) {
            this.material.addNodes(params.nodes);
            params.nodes = [];
        }

        // Set initial attributes
        if (params.pos) {
            this.setPos(params.pos);
        }

        if (params.size) {
            this.setSize(params.size);
        }
    },

    /**
     * Sets teapot position
     * @param pos
     */
    setPos:function (pos) {
        if (this.translate) {
            this.translate.setXYZ(pos);
        }
    },

    /**
     * Sets teapot size
     * @param size
     */
    setSize:function (size) {
        if (this.scale) {
            this.scale.setXYZ(size);
        }
    },

    /**
     * Sets rotation
     * @param rotate
     */
    setRotate:function (rotate) {
        if (this.rotate) {
            this.rotate.set(rotate);
        }
    }
});
