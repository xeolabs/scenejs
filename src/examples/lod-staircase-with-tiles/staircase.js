/* Returns SceneJS JavaScript subgraph that defines a spiral staircase.

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
        return  SceneJS.createNode({
            type: "texture",
            layers : [
                {
                    uri: "images/white-marble.jpg",
                    applyTo:"baseColor",
                    minFilter: "nearestMipMapLinear",
                    maxFilter: "linearMapLinear"
                }
            ],
            nodes: [
                material
            ]
        });
    } else {
        return SceneJS.createNode(material);
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
