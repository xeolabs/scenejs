(function() {

    var commandService = SceneJS.Services.getService(SceneJS.Services.COMMAND_SERVICE_ID);

    if (commandService.hasCommand("clip.clipbox.create")) {
        return;
    }

    //----------------------------------------------------------------
    // clip.clipbox.create
    //----------------------------------------------------------------

    commandService.addCommand("clip.clipbox.create", {

        // Command always has an execute method

        execute: function(params) {
            var target = params.target;
            if (!target) {
                throw "Attribute 'target' expected on command 'clip.clipbox.create'";
            }
            clipbox(target, params);
        }
    });


    function clipbox(nodeId, params) {

        params = params || {};

        var translate = params.translate || {};

        var zmin = ((params.zmin != undefined) ? params.zmin : -1) + (translate.z || 0);
        var zmax = ((params.zmax != undefined) ? params.zmax : 1) + (translate.z || 0);
        var xmin = ((params.xmin != undefined) ? params.xmin : -1) + (translate.x || 0);
        var xmax = ((params.xmax != undefined) ? params.xmax : 1) + (translate.x || 0);
        var ymin = ((params.ymin != undefined) ? params.ymin : -1) + (translate.y || 0);
        var ymax = ((params.ymax != undefined) ? params.ymax : 1) + (translate.y || 0);

        var rotate = params.rotate || {};
        var xrot = rotate.x || 0;
        var yrot = rotate.y || 0;
        var zrot = rotate.z || 0;
        var angle = rotate.angle || 0;

        var xtra = (xmax + xmin) * 0.5;
        var ytra = (ymax + ymin) * 0.5;
        var ztra = (zmax + zmin) * 0.5;

        var xsca = (xmax - xmin) * 0.5;
        var ysca = (ymax - ymin) * 0.5;
        var zsca = (zmax - zmin) * 0.5;

        var node = SceneJS.withNode(nodeId);
        var parent = node.parent();
        var rootData = node.get("data");

        /* First of all, ensure nodes for clipbox are inserted
         */
        if (!rootData._clipbox) {   // No clipbox inserted on target yet
            var parentId = node.parent().get("id");
            var id = node.get("id");

            parent.insert({
                node:
                {
                    id:id + ".clipbox",
                    nodes: [
                        {
                            type: "material",
                            baseColor: { r: 1, g: 1, b: 1},
                            nodes: [
                                {

                                    type: "translate",
                                    id: id + ".clipbox.cube.xmax.tra",
                                    x: xtra,
                                    y: ytra,
                                    z: ztra,
                                    nodes: [
                                        {
                                            type: "rotate",
                                            id: id + ".clipbox.cube.xmax.rot",
                                            x: xrot,
                                            y: yrot,
                                            z: zrot,
                                            angle: angle,

                                            nodes: [
                                                {
                                                    type: "scale",
                                                    id: id + ".clipbox.cube.xmax.sca",
                                                    x: xsca,
                                                    y: ysca,
                                                    z: zsca,
                                                    nodes: [

                                                        {
                                                            type: "geometry",
                                                            positions : [
                                                                1.0,  1.0,  1.0,
                                                                1.0, -1.0,  1.0,
                                                                -1.0, -1.0,  1.0,
                                                                -1.0,  1.0,  1.0,
                                                                1.0,  1.0, -1.0,
                                                                1.0, -1.0, -1.0,
                                                                -1.0, -1.0, -1.0,
                                                                -1.0,  1.0, -1.0
                                                            ],
                                                            primitive: "lines",
                                                            indices : [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1,5, 2, 6,3,7 ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]

                        },
                        {
                            type: "clip",
                            id: id + ".clipbox.planes.xmin",
                            mode: "inside",
                            a: { x: xmax, y: 1, z: 1 },
                            b: { x: xmax, y: 0, z: 0 },
                            c: { x: xmax, y: 0, z: 1 },

                            nodes: [
                                {
                                    type: "clip",
                                    id: id + ".clipbox.planes.xmax",
                                    mode:"inside",
                                    a: { x: xmin, y: 1, z: 0 },
                                    b: { x: xmin, y: 0, z: 1 },
                                    c: { x: xmin, y: 0, z: 0 },
                                    nodes: [
                                        {
                                            type: "clip",
                                            id: id + ".clipbox.planes.ymin",
                                            mode:"inside",
                                            a: { x:    1, y: ymin, z:  1 },
                                            b: { x:   -1, y: ymin, z: -1 },
                                            c: { x:   -1, y: ymin, z:  1 },


                                            nodes: [
                                                {
                                                    type: "clip",
                                                    id: id + ".clipbox.planes.ymax",
                                                    mode:"inside",
                                                    a: { x:   -1, y: ymax, z:  1 },
                                                    b: { x:   -1, y: ymax, z: -1 },
                                                    c: { x:    1, y: ymax, z:  1 },

                                                    nodes: [
                                                        {
                                                            type: "clip",
                                                            id: id + ".clipbox.planes.zmin",
                                                            mode: "inside",
                                                            a: { x:   -1, y: -1, z: zmin },
                                                            b: { x:    1, y: -1, z: zmin },
                                                            c: { x:    1, y:  1, z: zmin },

                                                            nodes: [
                                                                {
                                                                    type: "clip",
                                                                    id: id + ".clipbox.planes.zmax",
                                                                    mode: "inside",
                                                                    a: { x:  1, y:   1, z: zmax },
                                                                    b: { x:  1, y:  -1, z: zmax },
                                                                    c: { x: -1, y:  -1, z: zmax }
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

            });

            /* Mark node as having clipbox
             */
            rootData._clipbox = {
                clipboxId: id + ".clipbox"

            };
            node.set("data", rootData);
        }
    }


    //----------------------------------------------------------------
    // clip.clipbox.resize
    //----------------------------------------------------------------

    commandService.addCommand("clip.clipbox.update", {

        execute: function(params) {
            var target = params.target;
            if (!target) {
                throw "Attribute 'target' expected on command 'clip.clipbox.update'";
            }

            var node = SceneJS.withNode(target);
            var rootData = node.get("data");

            if (!rootData._clipbox) {
                throw "No 'clip.clipbox' exists at target node for 'clip.clipbox.update'";
            }

            var id = node.get("id");

            var translate = params.translate || {};

            var zmin = ((params.zmin != undefined) ? params.zmin : -1) + (translate.z || 0);
            var zmax = ((params.zmax != undefined) ? params.zmax : 1) + (translate.z || 0);
            var xmin = ((params.xmin != undefined) ? params.xmin : -1) + (translate.x || 0);
            var xmax = ((params.xmax != undefined) ? params.xmax : 1) + (translate.x || 0);
            var ymin = ((params.ymin != undefined) ? params.ymin : -1) + (translate.y || 0);
            var ymax = ((params.ymax != undefined) ? params.ymax : 1) + (translate.y || 0);

            var rotate = params.rotate || {};
            var xrot = rotate.x || 0;
            var yrot = rotate.y || 0;
            var zrot = rotate.z || 0;
            var angle = rotate.angle || 0;

            var xtra = (xmax + xmin) * 0.5;
            var ytra = (ymax + ymin) * 0.5;
            var ztra = (zmax + zmin) * 0.5;

            var xsca = (xmax - xmin) * 0.5;
            var ysca = (ymax - ymin) * 0.5;
            var zsca = (zmax - zmin) * 0.5;

            /* Update the cube
             */
            SceneJS.withNode(id + ".clipbox.cube.xmax.tra").set({
                x: xtra,
                y: ytra,
                z: ztra
            });
            SceneJS.withNode(id + ".clipbox.cube.xmax.sca").set({
                x: xsca,
                y: ysca,
                z: zsca
            });

            /* Update the clip planes
             */
            SceneJS.withNode(id + ".clipbox.planes.xmin").set({
                a: { x: xmax, y: 1, z: 1 },
                b: { x: xmax, y: 0, z: 0 },
                c: { x: xmax, y: 0, z: 1 }

            });
            SceneJS.withNode(id + ".clipbox.planes.xmax").set({
                a: { x: xmin, y: 1, z: 0 },
                b: { x: xmin, y: 0, z: 1 },
                c: { x: xmin, y: 0, z: 0 }
            });
            SceneJS.withNode(id + ".clipbox.planes.ymin").set({
                a: { x:    1, y: ymin, z:  1 },
                b: { x:   -1, y: ymin, z: -1 },
                c: { x:   -1, y: ymin, z:  1 }

            });
            SceneJS.withNode(id + ".clipbox.planes.ymax").set({
                a: { x:   -1, y: ymax, z:  1 },
                b: { x:   -1, y: ymax, z: -1 },
                c: { x:    1, y: ymax, z:  1 }
            });
            SceneJS.withNode(id + ".clipbox.planes.zmin").set({
                a: { x:   -1, y: -1, z: zmin },
                b: { x:    1, y: -1, z: zmin },
                c: { x:    1, y:  1, z: zmin }
            });
            SceneJS.withNode(id + ".clipbox.planes.zmax").set({
                a: { x:  1, y:   1, z: zmax },
                b: { x:  1, y:  -1, z: zmax },
                c: { x: -1, y:  -1, z: zmax }
            });

        }
    });

    //----------------------------------------------------------------
    // clip.clipbox.destroy
    //----------------------------------------------------------------

    commandService.addCommand("clip.clipbox.destroy", {

        execute: function(params) {
            var target = params.target;
            if (!target) {
                return;
            }

            var node = SceneJS.withNode(target);
            var rootData = node.get("data");

            if (!rootData._clipbox) {
                return;
            }

            var id = node.get("id");
            node.parent().remove({
                node: id
            });
        }
    });
})();

