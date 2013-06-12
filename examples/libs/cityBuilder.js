/**

 Quick and dirty procedural city builder

 Usage:

 var builder= new CityBuilder({
    texturePath: "foo/bar/myTextures/"
 });

 builder.build(myNode, {
    xPos: 0,
    zPos: 0,
    xBuildings: 10,
    zBuildings: 10,
    xWidth: 500,
    zWidth: 500
 });

 */
var CityBuilder = function (cfg) {

    var buildingType;
    var buildingTypes;

    initBuildingTypes(cfg);

    /** Make some buildings under the given node
     *
     * @param node
     * @param params
     */
    this.build = function (node, params) {

        node = node.addNode({
            type:"flags",
            enabled:true
        }); // City root node

        var xPos = params.xPos || 0;
        var zPos = params.zPos || 0;

        var xBuildings = params.xBuildings || 5;
        var zBuildings = params.zBuildings || 5;

        var xWidth = params.xWidth || 200;
        var zWidth = params.zWidth || 200;

        var xMin = xPos - (xWidth * 0.5);
        var xMax = xPos + (xWidth * 0.5);

        var zMin = zPos - (zWidth * 0.5);
        var zMax = zPos + (zWidth * 0.5);

        var streetWidth = params.streetWidth || 20;

        var stepX = (xWidth + streetWidth) / xBuildings;
        var stepZ = (zWidth + streetWidth) / zBuildings;

        var name;

        for (var x = xMin; x <= xMax; x += stepX) {
            for (var z = zMin; z <= zMax; z += stepZ) {

                selectBuildingType();

                addBuilding(node, {
                    xmin:x - 10,
                    zmin:z - 10,
                    xmax:x + 10,
                    zmax:z + 10
                });
            }
        }

        /**
         *
         * @param params
         * @param params.enabled
         */
        this.set = function (params) {
            if (params.enabled != undefined) {
                node.setEnabled(params.enabled);
            }
        };

        this._destroy = function () {
            node.destroy();
        };
    };

    function initBuildingTypes(cfg) {

        if (!cfg.texturePath) {
            throw "config expected: texturePath";
        }

        buildingTypes = [

            /* Building 1
             */
            {
                freq:50,

                material:{
                    type:"material",
                    baseColor:{
                        r:1.0,
                        g:1.0,
                        b:1.0
                    },
                    specularColor:[ 1.0, 1.0, 1.0 ],
                    specular:0.4,
                    shine:20.0
                },

                texture:{
                    type:"texture",
                    coreId:"__type1",
                    layers:[
                        {
                            src:cfg.texturePath + "/highrise-windows.jpg",
                            applyTo:"baseColor",
                            blendMode:"multiply",
                            wrapS:"repeat",
                            wrapT:"repeat",
                            scale:{
                                x:0.04,
                                y:0.05
                            }
                        }
                    ]
                },

                roof:{
                    height:1,
                    material:{
                        type:"material",
                        baseColor:{
                            r:1.0,
                            g:1.0,
                            b:1.0
                        }
                    }
                }
            },

            /* Building 2
             */
            {

                freq:30,

                material:{
                    type:"material",
                    baseColor:{
                        r:1.0,
                        g:1.0,
                        b:1.0
                    },
                    specularColor:[ 1.0, 1.0, 1.0 ],
                    specular:1.0,
                    shine:5.0
                },

                texture:{
                    type:"texture",
                    coreId:"__type2",
                    layers:[
                        {
                            src:cfg.texturePath + "/HighRiseGlass.jpg",
                            applyTo:"baseColor",
                            blendMode:"multiply",
                            wrapS:"repeat",
                            wrapT:"repeat",
                            scale:{
                                x:0.25,
                                y:0.2
                            }
                        },
                        {
                            src:cfg.texturePath + "/HighRiseGlassSpecular.jpg",
                            applyTo:"specular",
                            blendMode:"multiply",
                            wrapS:"repeat",
                            wrapT:"repeat",
                            scale:{
                                x:0.25,
                                y:0.2
                            }
                        }
                    ]
                },

                roof:{
                    height:1,
                    material:{
                        type:"material",
                        baseColor:{
                            r:0.4,
                            g:0.4,
                            b:0.4
                        }
                    }
                }
            },

            /* Building 3
             */
            {

                freq:20,

                material:{
                    type:"material",
                    baseColor:{
                        r:1.0,
                        g:1.0,
                        b:1.0
                    },
                    specularColor:[ 1.0, 1.0, 1.0 ],
                    specular:0.4,
                    shine:20.0
                },

                texture:{
                    type:"texture",
                    coreId:"__type3",
                    layers:[
                        {
                            src:cfg.texturePath + "/pixelcity_windows7.jpg",
                            applyTo:"baseColor",
                            blendMode:"multiply",
                            wrapS:"repeat",
                            wrapT:"repeat",
                            scale:{
                                x:0.015,
                                y:0.01
                            }
                        }
                    ]
                },

                roof:{
                    height:1,
                    material:{
                        type:"material",
                        baseColor:{
                            r:0.0,
                            g:0.0,
                            b:0.0
                        }
                    }
                }
            }
        ];
    }

    function selectBuildingType() {

        var n = Math.round(Math.random() * 100);
        var type;
        var min = 0;
        var max;

        for (var i = 0, len = buildingTypes.length; i < len; i++) {

            type = buildingTypes[i];
            max = min + type.freq;

            if (min <= n && n <= max) {
                buildingType = type;
                return;
            }

            min = max
        }

        buildingType = buildingTypes[0];
    }


    function addBuilding(node, footprint) {

        var xpos = (footprint.xmin + footprint.xmax) * 0.5;
        var ypos = 0;
        var zpos = (footprint.zmin + footprint.zmax) * 0.5;

        /* Base
         */

        var baseWidth = 0.6;

        addBase(node,
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

            addBox(node,
                (xmin + xmax) * 0.5,
                ySize + baseWidth,
                (zmin + zmax) * 0.5,

                xmax - xmin,
                ySize,
                zmax - zmin);

            ySize -= (Math.random() * 5) + 2;
        }
    }


    function addBase(node, xpos, zpos, xsize, ysize, zsize) {

        node.addNode({
            type:"translate",
            x:xpos,
            y:ysize,
            z:zpos,

            nodes:[
                {
                    type:"material",
                    baseColor:{
                        r:0.6, g:.6, b:0.6
                    },
                    nodes:[
                        {
                            type:"geometry",
                            source:{
                                type:"box",
                                xSize:xsize,
                                ySize:ysize,
                                zSize:zsize
                            }
                        }
                    ]
                }
            ]
        });

    }

    function addBox(node, xpos, ypos, zpos, xsize, ysize, zsize) {

        /* Roof cap
         */
        node.addNode(buildingType.roof.material)
            .addNode({
                type:"translate",
                x:xpos,
                y:ypos + ysize + buildingType.roof.height,
                z:zpos
            })
            .addNode({
                type:"geometry",
                source:{
                    type:"box",
                    xSize:xsize,
                    ySize:buildingType.roof.height,
                    zSize:zsize
                }
            });

        /* Body with texture
         */
        node.addNode(buildingType.material)// Current material
            .addNode(buildingType.texture)// Current texture
            .addNode({
                type:"translate",
                x:xpos,
                y:ypos,
                z:zpos
            })
            .addNode({
                type:"geometry",
                source:{
                    type:"box",
                    xSize:xsize,
                    ySize:ysize,
                    zSize:zsize
                }
            });
    }
};
    