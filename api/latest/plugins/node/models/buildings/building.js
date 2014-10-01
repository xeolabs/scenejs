/**
    A building model

    @author xeolabs / http://xeolabs.com

 */
(function () {

    var buildingTypes = initBuildingTypes();

    SceneJS.Types.addType("models/buildings/building", {

        construct: function (params) {
            var type = params.buildingType || 0;
            var buildingType = buildingTypes[type];
            if (!buildingType) {
                throw "unsupported building type: " + type;
            }
            var pos = params.pos || {};
            createBuilding(buildingType, this, {
                xmin: (pos.x || 0) - 10,
                zmin: (pos.z || 0) - 10,
                xmax: (pos.x || 0) + 10,
                zmax: (pos.z || 0) + 10
            });
        }
    });

    function initBuildingTypes() {

        var texturePath = SceneJS.getConfigs("pluginPath") + "/node/models/buildings/building/";

        return [
            // Building   1
            {
                freq: 50,
                material: {
                    type: "material",
                    coreId: "building.1.material",
                    baseColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0
                    },
                    specularColor: [ 1.0, 1.0, 1.0 ],
                    specular: 0.4,
                    shine: 20.0
                },

                // FIXME - using deprecated "_texture" node, update to use new "texture"
                texture: {
                    type: "_texture",
                    coreId: "building.1.texture",
                    layers: [
                        {
                            src: texturePath + "highrise-windows.jpg",
                            applyTo: "baseColor",
                            blendMode: "multiply",
                            wrapS: "repeat",
                            wrapT: "repeat",
                            scale: {
                                x: 0.04,
                                y: 0.05
                            }
                        }
                    ]
                },
                roof: {
                    height: 1,
                    material: {
                        type: "material",
                        coreId: "building.1.roof",
                        baseColor: {
                            r: 1.0,
                            g: 1.0,
                            b: 1.0
                        }
                    }
                }
            },
            // Building   2
            {
                freq: 30,
                material: {
                    type: "material",
                    coreId: "building.2.material",
                    baseColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0
                    },
                    specularColor: [ 1.0, 1.0, 1.0 ],
                    specular: 1.0,
                    shine: 5.0
                },
                // FIXME - using deprecated "_texture" node, update to use new "texture"
                texture: {
                    type: "_texture",
                    coreId: "building.2.texture",
                    layers: [
                        {
                            src: texturePath + "HighRiseGlass.jpg",
                            applyTo: "baseColor",
                            blendMode: "multiply",
                            wrapS: "repeat",
                            wrapT: "repeat",
                            scale: {
                                x: 0.25,
                                y: 0.2
                            }
                        },
                        {
                            src: texturePath + "HighRiseGlassSpecular.jpg",
                            applyTo: "specular",
                            blendMode: "multiply",
                            wrapS: "repeat",
                            wrapT: "repeat",
                            scale: {
                                x: 0.25,
                                y: 0.2
                            }
                        }
                    ]
                },
                roof: {
                    height: 1,
                    material: {
                        type: "material",
                        coreId: "building.2.roof",
                        baseColor: {
                            r: 0.4,
                            g: 0.4,
                            b: 0.4
                        },
                        specular: 0.2
                    }
                }
            },
            // Building 3
            {
                freq: 20,
                material: {
                    type: "material",
                    coreId: "building.3.material",
                    baseColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0
                    },
                    specularColor: [ 1.0, 1.0, 1.0 ],
                    specular: 0.4,
                    shine: 20.0
                },
                // FIXME - using deprecated "_texture" node, update to use new "texture"
                texture: {
                    type: "_texture",
                    coreId: "building.3.texture",
                    layers: [
                        {
                            src: texturePath + "pixelcity_windows7.jpg",
                            applyTo: "baseColor",
                            blendMode: "multiply",
                            wrapS: "repeat",
                            wrapT: "repeat",
                            scale: {
                                x: 0.015,
                                y: 0.01
                            }
                        }
                    ]
                },
                roof: {
                    height: 1,
                    material: {
                        type: "material",
                        coreId: "building.3.roof",
                        baseColor: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0
                        },
                        specular: 0.2
                    }
                }
            }
        ];
    }

    function createBuilding(buildingType, node, footprint) {

        var xpos = (footprint.xmin + footprint.xmax) * 0.5;
        var ypos = 0;
        var zpos = (footprint.zmin + footprint.zmax) * 0.5;

        /* Base
         */

        var baseWidth = 0.6;

        addBase(
            buildingType,
            node,
            xpos, zpos,
            footprint.xmax - footprint.xmin,
            baseWidth / 2,
            footprint.zmax - footprint.zmin);

        var xmin;
        var ymin;
        var zmin;
        var xmax;
        var ymax;
        var zmax;

        var width;
        var axis;
        var sign;

        var yMaxSize = (Math.random() * 30) + 15;
        var ySize = yMaxSize + baseWidth;

        while (ySize > 5) {

            width = (Math.random() * 3) + 2;

            axis = Math.round(Math.random());
            sign = Math.round(Math.random());

            ymin = baseWidth;
            ymax = ySize;

            switch (axis) {

                case 0:

                    if (sign == 0) {

                        xmin = footprint.xmin;
                        zmin = zpos - width;

                        xmax = xpos + width;
                        zmax = zpos + width;

                    } else {

                        xmin = xpos - width;
                        zmin = zpos - width;

                        xmax = footprint.xmax;
                        zmax = zpos + width;
                    }

                    break;

                case 1:


                    if (sign == 0) {

                        xmin = xpos - width;
                        zmin = footprint.zmin;

                        xmax = xpos + width;
                        zmax = zpos + width;

                    } else {

                        xmin = xpos - width;
                        zmin = zpos - width;

                        xmax = xpos + width;
                        zmax = footprint.zmax;
                    }

                    break;
            }

            addBox(
                buildingType,
                node,
                (xmin + xmax) * 0.5,
                ySize + baseWidth,
                (zmin + zmax) * 0.5,

                xmax - xmin,
                ySize,
                zmax - zmin);

            ySize -= (Math.random() * 5) + 2;
        }
    }


    function addBase(buildingType, node, xpos, zpos, xsize, ysize, zsize) {
        node.addNode({
            type: "translate",
            x: xpos,
            y: ysize,
            z: zpos,
            nodes: [
                {
                    type: "material",
                    baseColor: {
                        r: 0.6, g: .6, b: 0.6
                    },
                    coreId: "building.base",
                    nodes: [
                        {
                            type: "geometry/box",
                            xSize: xsize,
                            ySize: ysize,
                            zSize: zsize
                        }
                    ]
                }
            ]
        });
    }

    function addBox(buildingType, node, xpos, ypos, zpos, xsize, ysize, zsize) {

        /* Roof cap
         */
        node.addNode(buildingType.roof.material)
            .addNode({
                type: "translate",
                x: xpos,
                y: ypos + ysize + buildingType.roof.height,
                z: zpos
            })
            .addNode({
                type: "geometry/box",
                xSize: xsize,
                ySize: buildingType.roof.height,
                zSize: zsize
            });

        /* Body with texture
         */
        node.addNode(buildingType.material)// Current material
            .addNode(buildingType.texture)// Current texture
            .addNode({
                type: "translate",
                x: xpos,
                y: ypos,
                z: zpos
            })
            .addNode({
                type: "geometry/box",
                xSize: xsize,
                ySize: ysize,
                zSize: zsize
            });
    }
})();