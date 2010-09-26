SceneJS.createNode({
    type: "boundingBox",

    id: "lod-stairs",

    xmin: -20,
    ymin: -20,
    zmin: -20,
    xmax:  20,
    ymax:  20,
    zmax:  20,

    /* We'll do level-of-detail selection with this
     * boundingBox - five representations at
     * different sizes:
     */
    levels: [
        10,     // Level 1
        200,    // Level 2
        400,    // Level 3
        500,    // Level 4
        600     // Level 5
    ],

    nodes:[

        /* Level 1 - a cube to at least show a dot on the horizon
         */
        {
            type: "cube"
        },


        /* Level 2 - staircase with 12 very chunky steps
         * and no texture. Staircase factory function is defined in staircase.js
         */
        createStaircase({
            stepWidth:7,
            stepHeight:2.4,
            stepDepth:3,
            stepSpacing:6,
            innerRadius:10,
            numSteps:12,
            stepAngle:80 }),

        /* Level 3 - more detail; staircase with 24 chunky
         *  steps and no texture
         */
        createStaircase({
            stepWidth:7,
            stepHeight:1.2,
            stepDepth:3,
            stepSpacing:3,
            innerRadius:10,
            numSteps:24,       // Half the number of steps, less coarse
            stepAngle:40 }),

        /* Level 4 - yet more detail; staircase with 48 fine
         * steps and no texture
         */
        createStaircase({
            stepWidth:7,
            stepHeight:0.6,
            stepDepth:3,
            stepSpacing:1.5,
            innerRadius:10,
            numSteps:48,
            stepAngle:20 }),

        /* Level 5 - maximum detail; textured staircase with
         * 48 fine steps
         */
        createStaircase({
            withTexture: true,
            stepWidth:7,
            stepHeight:0.6,
            stepDepth:3,
            stepSpacing:1.5,
            innerRadius:10,
            numSteps:48,
            stepAngle:20 })
    ]
});


/* Returns SceneJS subgraph that defines a spiral staircase.
 * The result of this is processed with SceneJS.createNode to create the actual
 * scene graph node object.
 */
function createStaircase(cfg) {

    cfg.innerRadius = cfg.innerRadius || 10.0;
    cfg.stepAngle = cfg.stepAngle || 25.0;
    cfg.stepSpacing = cfg.stepSpacing || 2.0;
    cfg.stepWidth = cfg.stepWidth || 5.0;
    cfg.stepHeight = cfg.stepHeight || 0.5;
    cfg.stepDepth = cfg.stepDepth || 3.0;

    var material = {
        type: "material",
        baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
        specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
        specular:       0.9,
        shine:          6.0,
        nodes: createSteps(cfg)
    };

    if (cfg.withTexture) {
        return  {
            type: "texture",
            layers : [
                {
                    uri: "images/white-marble.jpg",
                    minFilter: "nearestMipMapLinear",
                    maxFilter: "linearMapLinear",
                    applyTo:"baseColor",
                    blendMode: "multiply"
                }
            ],
            nodes: [
                material
            ]
        };
    } else {
        return material;
    }
}

function createSteps(cfg) {
    var nodes = [];
    var angle = 0;
    var height = -10;
    for (var stepNum = 0; stepNum < cfg.numSteps; stepNum++) {
        angle += cfg.stepAngle;
        height += cfg.stepSpacing;
        nodes.push({
            type: "rotate",
            angle: angle,
            y: 1.0,
            nodes: [
                {
                    type: "translate",
                    x: cfg.innerRadius,
                    y : height,
                    nodes: [
                        {
                            type: "scale",
                            x: cfg.stepWidth,
                            y: cfg.stepHeight,
                            z: cfg.stepDepth,
                            nodes: [
                                {
                                    type: "cube"
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
    return nodes;
}
