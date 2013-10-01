/**
 * A procedurally-generated tree
 *
 * This is a quick bit of fun that borrows the procedural tree generation
 * code from the "Ghost Trees" Chrome Experiment by Marek Kapolka:
 *
 * http://www.chromeexperiments.com/detail/ghost-trees/
 *
 * Tree generation code is wrapped in a custom SceneJS node type defined in:
 * http://scenejs.org/api/latest/plugins/node/objects/plants/ghostTree.js
 *
 * All the parameters for the tree generator are exposed as configurations
 * for the node type.
 *
 */

(function () {

    require([
        SceneJS.getConfigs("pluginPath") + "/lib/gl-matrix-min.js"
    ],
        function (glmat) {

            SceneJS.Types.addType("objects/plants/ghostTree", {

                construct:function (params) {

                    if (params.minSegmentLength == undefined) params.minSegmentLength = 1;
                    if (params.maxSegmentLength == undefined) params.maxSegmentLength = 2;
                    if (params.minSegmentAngle == undefined) params.minSegmentAngle = Math.PI / 16;
                    if (params.maxSegmentAngle == undefined) params.maxSegmentAngle = Math.PI / 8;
                    if (params.minNumBranches == undefined) params.minNumBranches = 1;
                    if (params.maxNumBranches == undefined) params.maxNumBranches = 4;
                    if (params.segments == undefined) params.segments = 9;
                    if (params.branchLengthFactor == undefined) params.branchLengthFactor = 2;
                    if (params.branchAngleFactor == undefined) params.branchAngleFactor = 1.5;
                    if (params.branchSegmentFactor == undefined) params.branchSegmentFactor = 1;
                    if (params.branchBranchFactor == undefined) params.branchBranchFactor = .5;
                    if (params.color == undefined) params.color = [1, 1, 1];

                    var segment = generateSegment(null, params);
                    var height = countSegmentMaxHeight(segment);

                    this.addNode(buildGeometry(segment));
                }
            });

            function buildGeometry(segment) {

                var templateVertices = [];

                for (var i = 0; i < 6; i++) {
                    var v = glmat.vec3.create();
                    glmat.vec3.set(v, Math.cos(i * Math.PI / 3), 0, Math.sin(i * Math.PI / 3));
                    templateVertices.push(v);
                }

                var vertexArray = templateVertices.slice(0);
                var elementArray = [];
                var colorArray = [];
                //Initialize color array
                for (var i = 0; i < vertexArray.length; i++) {
                    colorArray.push([1, 1, 1, 1]);
                }
                var rootMatrix = glmat.mat4.create();
                glmat.mat4.identity(rootMatrix);

                addSegmentToRenderable(vertexArray, elementArray, colorArray, 0, templateVertices, segment, rootMatrix, 0);

                return {
                    type:"geometry",
                    primitive:"triangle-strip",
                    positions:unpackArray(vertexArray),
                    indices:elementArray,
                    colors:unpackArray(colorArray)
                };
            }

            function Segment() {

                //type: Segment
                //The segment that precedes this one
                this.prevSegment = null;

                //type: Segment
                //The segment that succeeds this one
                this.nextSegment = null;

                //Type: Array (of Segments)
                //Contains the root segments of the branches connected to this Segment.
                this.branches = [];

                //Type: float
                //The length of this segment in distance units
                this.segmentLength = 1;

                //Type: float (radians)
                //The angle of this segment's rotation along the X/Y axis
                this.angle = 0;

                //Type: float (radians)
                //The angle of this segment's rotation along the local Z axis
                this.direction = 0;
            }

            function SegmentParameters() {

                //Type: float
                //The minimum and maximum lengths of a segment to use
                //when generating a new segment
                this.minSegmentLength = 1;
                this.maxSegmentLength = 1;

                //Type: float (radians)
                //The minimum and maximum values of a segment's angle
                //when generating a new segment
                this.minSegmentAngle = 0;
                this.maxSegmentAngle = 0;

                //Type: int
                //The minimum and maxiumum amount of branches to have on this segment
                this.minNumBranches = 0;
                this.maxNumBranches = 0;

                //Type: int
                //This value represents how many segments are left to be generated
                //along this particular length of tree.
                this.segments = 0;

                //Type: float
                //When generating a branch, the the min and max values of the branch's length
                //will be multiplied by this value.
                this.branchLengthFactor = 1;

                //Type: float
                //When generating a branch, the min and max value of the branch's angle will be
                //multiplied by this factor
                this.branchAngleFactor = 1;

                //Type: float
                //When generating a branch, the number of segments in the branch will be taken
                //from it's root and multiplied by this factor.
                this.branchSegmentFactor = 1;

                //Type: float
                //When generating a branch, the number of branches branching out from that branch
                //Will be multiplied by this factor.
                this.branchBranchFactor = 1;
            }

            //Generates a random value between min and max (inclusive)

            function randomRange(min, max) {
                return min + Math.random() * (max - min);
            }

            //Parameters:
            //--root--
            //Type: Segment
            //The generated segment will stem from this segment
            //--params--
            //Type: SegmentParameters
            //The values to use when generating this Segment

            function generateSegment(root, params) {
                var segment = new Segment();
                segment.previousSegment = root;
                segment.segmentLength = randomRange(params.minSegmentLength, params.maxSegmentLength);
                segment.angle = randomRange(params.minSegmentAngle, params.maxSegmentAngle);
                segment.direction = Math.random() * Math.PI * 2;

                var numBranches = Math.floor(randomRange(params.minNumBranches, params.maxNumBranches));
                var branchParams = branchSegmentParams(params);
                for (var i = 0; i < numBranches; i++) {
                    var branch = generateSegment(segment, branchParams);
                    branch.prevSegment = segment;
                    segment.branches.push(branch);
                }

                if (params.segments > 1) {
                    //params.segments -= 1;
                    segment.nextSegment = generateSegment(segment, branchParams);
                    segment.nextSegment.prevSegment = segment;
                }

                return segment;
            }

            //Returns the root-most segment connected to the input Segment

            function getBaseSegment(segment) {
                if (segment.prevSegment === null) {
                    return segment;
                } else {
                    return getBaseSegment(segment.prevSegment);
                }
            }

            //Creates a new SegmentParameters object
            //by shrinking the min and max values of the
            //given SegmentParameters object by the factors specified
            //in that object.
            //Parameters:
            //--params--
            //Type: SegmentParameters
            //The input SegmentParameters object that will have its values
            //shrunk

            function branchSegmentParams(params) {
                var sp2 = new SegmentParameters();
                sp2.minSegmentLength = params.minSegmentLength * params.branchLengthFactor;
                sp2.maxSegmentLength = params.maxSegmentLength * params.branchLengthFactor;

                sp2.minSegmentAngle = params.minSegmentAngle * params.branchAngleFactor;
                sp2.maxSegmentAngle = params.maxSegmentAngle * params.branchAngleFactor;

                sp2.minNumBranches = Math.floor(params.minNumBranches * params.branchBranchFactor);
                sp2.maxNumBranches = Math.floor(params.maxNumBranches * params.branchBranchFactor);

                sp2.segments = Math.floor(params.segments * params.branchSegmentFactor);
                sp2.segments -= 1;

                return sp2;
            }

            //Unpacks an array of vectors into an array of values.
            //This is useful because the addSegmentToRenderable method
            //expects the values in its vertexArray to be glMatrix vec3s, but
            //WebGL buffers should be filled with primative values

            function unpackArray(input) {
                var output = [];

                for (var child in input) {
                    for (var i = 0; i < input[child].length; i++) {
                        output.push(input[child][i]);
                    }
                }

                return output;
            }

            //Generates the vertex, element, and color array data for a tree segment
            //and its children recursively.

            function addSegmentToRenderable(vertexArray, elementArray, colorArray, rootIndexStart, templateVertices, segment, rootMatrix, level) {
                var m = glmat.mat4.clone(rootMatrix);

                var vUp = glmat.vec3.create();
                glmat.vec3.set(vUp, 0, 1, 0);
                var vFor = glmat.vec3.create();
                glmat.vec3.set(vFor, Math.cos(segment.direction), 0, Math.sin(segment.direction));
                var vRot = glmat.vec3.create();
                vRot = glmat.vec3.cross(vRot, vUp, vFor);

                glmat.mat4.rotate(m, m, segment.angle, vRot);
                glmat.mat4.translate(m, m, [0, segment.segmentLength, 0]);

                var startIndex = vertexArray.length;

                var scaleMatrix = glmat.mat4.create();
                glmat.mat4.identity(scaleMatrix);
                //var dist = countSegmentMaxHeight(getBaseSegment(segment)) - countSegmentMaxHeight(segment);
                var dist = getBaseSegment(segment).maxHeight - segment.maxHeight;
                glmat.mat4.scale(scaleMatrix, scaleMatrix, [Math.pow(.6, dist), 1, Math.pow(.6, dist)]);
                //Add vertices
                for (var i in templateVertices) {
                    //Vertex Location
                    var v = glmat.vec3.clone(templateVertices[i]);
                    glmat.vec3.transformMat4(v, v, scaleMatrix);
                    glmat.vec3.transformMat4(v, v, m);
                    vertexArray.push(v);

                    //Color
                    var c = Math.pow(.8, level);
                    colorArray.push([c, c, c, 1]);
                }

                //Elements
                for (var i = 0; i < templateVertices.length; i++) {
                    elementArray.push(rootIndexStart + i);
                    elementArray.push(startIndex + i);
                }
                //loop around
                elementArray.push(rootIndexStart);
                elementArray.push(startIndex);
                //Degenerate
                elementArray.push(startIndex);

                //Up first
                if (segment.nextSegment != null) {
                    addSegmentToRenderable(vertexArray, elementArray, colorArray, startIndex, templateVertices, segment.nextSegment, m, level + 1);
                }

                for (var branch in segment.branches) {
                    //discontinuous degenerate
                    elementArray.push(rootIndexStart);
                    elementArray.push(rootIndexStart);
                    addSegmentToRenderable(vertexArray, elementArray, colorArray, rootIndexStart, templateVertices, segment.branches[branch], rootMatrix, level);
                }
            }

            //Generates the pattern of vertices that will be used for each ring of the tree

            function makeTemplateVertices() {
                var templateVertices = [];

                for (var i = 0; i < 6; i++) {
                    var v = glmat.vec3.create();
                    glmat.vec3.set(v, Math.cos(i * Math.PI / 3), 0, Math.sin(i * Math.PI / 3));
                    templateVertices.push(v);
                }

                return templateVertices;
            }

            //Generates a Renderable tree from this segment and its children.

            function makeSegmentRenderable(segment, glContext) {
                var templateVertices = makeTemplateVertices();

                var vertexArray = templateVertices.slice(0);
                var elementArray = [];
                var colorArray = [];
                //Initialize color array
                for (var i = 0; i < vertexArray.length; i++) {
                    colorArray.push([1, 1, 1, 1]);
                }
                var rootMatrix = glmat.mat4.create();
                mat4.identity(rootMatrix);

                var renderable = new Renderable(glContext);
                renderable.mvMatrix = rootMatrix;

                addSegmentToRenderable(vertexArray, elementArray, colorArray, 0, templateVertices, segment, rootMatrix, 0);

                var upColors = unpackArray(colorArray);
                var upVerts = unpackArray(vertexArray);
                var upElements = elementArray;

                renderable.setVertices(upVerts);
                renderable.setElements(upElements);
                renderable.setColors(upColors);

                return renderable;
            }

            //Returns the maxiumum number of segments that follow this one
            //Before a leaf segment is found

            function countSegmentMaxHeight(segment) {
                if (segment.nextSegment === null && segment.branches.length === 0) {
                    return 1;
                } else {
                    var max = 0;
                    if (segment.nextSegment != null) {
                        max = countSegmentMaxHeight(segment.nextSegment) + 1;
                    } else {
                        max = 1;
                    }
                    for (var child in segment.branches) {
                        var ch = countSegmentMaxHeight(segment.branches[child]);
                        if (ch > max) {
                            max = ch;
                        }
                    }
                    segment.maxHeight = max;
                    return max;
                }
            }

            //Counts the total number of segments below this segment in a tree.

            function countNumSegments(segment) {
                var output;
                if (segment.nextSegment != null) {
                    output = countNumSegments(segment.nextSegment) + 1;
                } else {
                    output = 1;
                }
                for (var branch in segment.branches) {
                    output += countNumSegments(branch);
                }
                return output;
            }
        });
})();