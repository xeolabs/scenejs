SceneJs.utils.ns("SceneJs.objects");

/** Cube geometry
 *
 */
SceneJs.objects.cube = function() {

    //    var cfg = SceneJs.utils.getNodeConfig(arguments);

    var min = -1.0;
    var max = 1.0;

    var zmax = 1.0;
    var zmin = -1.0;

    return SceneJs.geometry({
        //        vertices:    [
        //            [0.0, 0.5, 0.0],
        //            [-0.5, -0.5, 0.0],
        //            [0.5, -0.5, 0.0 ]
        //        ],

        vertices: [

            [min, min, zmin],
            [max, min, zmin],
            [max, max, zmin],
            [min, max, zmin],

            [min, min, zmax],
            [max, min, zmax],
            [max, max, zmax],
            [min, max, zmax]
        ],

        //        indices:[[0,1,2]]

        indices: [
            // top
            [0, 1, 2],
            [2, 3, 0],

            // left
            [0, 3, 7],
            [7, 4, 0],

            // right
            [2, 1, 5],
            [5, 6, 2],

            // front
            [3, 2, 6],
            [6, 7, 3],

            // back
            [1, 0, 4],
            [4, 5, 1],

            // back
            [4, 7, 6],
            [6, 5, 4]
        ]
    });
};



