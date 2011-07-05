/**
 * @class A scene node that defines an arbitrary clipping plane for nodes in its sub graph.

 */
new (function() {

    var idStack = [];
    var clipStack = [];
    var stackLen = 0;
    var dirty;

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_COMPILING,
            function() {
                stackLen = 0;
                dirty = true;
            });

    SceneJS_eventModule.addListener(
            SceneJS_eventModule.SCENE_RENDERING,
            function(params) {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_renderModule.setClips(idStack[stackLen - 1], clipStack.slice(0, stackLen));
                    } else  {
                        SceneJS_renderModule.setClips();
                    }
                    dirty = false;
                }
            });

    function pushClip(id, clip) {
        var modelMat = SceneJS_modelTransformModule.getTransform().matrix;
        var worldA = SceneJS_math_transformPoint3(modelMat, clip.a);
        var worldB = SceneJS_math_transformPoint3(modelMat, clip.b);
        var worldC = SceneJS_math_transformPoint3(modelMat, clip.c);
        var normal = SceneJS_math_normalizeVec3(
                SceneJS_math_cross3Vec4(
                        SceneJS_math_normalizeVec3(
                                SceneJS_math_subVec3(worldB, worldA, [0,0,0]), [0,0,0]),
                        SceneJS_math_normalizeVec3(
                                SceneJS_math_subVec3(worldB, worldC, [0,0,0]), [0,0,0])));

        var dist = SceneJS_math_dotVector3(normal, worldA);

        clip.normalAndDist = [normal[0], normal[1], normal[2], dist];
        clipStack[stackLen] = clip;
        idStack[stackLen] = id;
        stackLen++;
        dirty = true;
    };

    var Clip = SceneJS.createNodeType("clip");

    Clip.prototype._init = function(params) {
        this.setMode(params.mode);
        this.setA(params.a);
        this.setB(params.b);
        this.setC(params.c);
    };

    /**
     Sets the clipping mode. Default is "disabled".
     */
    Clip.prototype.setMode = function(mode) {
        mode = mode || "outside";
        if (mode != "disabled" && mode != "inside" && mode != "outside") {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "SceneJS.clip has a mode of unsupported type: '" + mode + " - should be 'disabled', 'inside' or 'outside'");
        }
        this.attr.mode = mode;
    };

    Clip.prototype.getMode = function() {
        return this.attr.mode;
    };

    Clip.prototype.setAbc = function(abc) {
        abc = abc || {};
        this.setA(abc.a);
        this.setB(abc.b);
        this.setC(abc.c);
    };

    Clip.prototype.getAbc = function() {
        return {
            a: this.getA(),
            b: this.getB(),
            c: this.getC()
        };
    };

    Clip.prototype.setA = function(a) {
        a = a || {};
        this.attr.a = [
            a.x != undefined ? a.x : 0.0,
            a.y != undefined ? a.y : 0.0,
            a.z != undefined ? a.z : 0.0,
            1
        ];
    };

    Clip.prototype.getA = function() {
        return {
            x: this.attr.a[0],
            y: this.attr.a[1],
            z: this.attr.a[2]
        };
    };

    Clip.prototype.setB = function(b) {
        b = b || {};
        this.attr.b = [
            b.x != undefined ? b.x : 0.0,
            b.y != undefined ? b.y : 0.0,
            b.z != undefined ? b.z : 0.0,
            1
        ];
    };

    Clip.prototype.getB = function() {
        return {
            x: this.attr.b[0],
            y: this.attr.b[1],
            z: this.attr.b[2]
        };
    };

    Clip.prototype.setC = function(c) {
        c = c || {};
        this.attr.c = [
            c.x != undefined ? c.x : 0.0,
            c.y != undefined ? c.y : 0.0,
            c.z != undefined ? c.z : 0.0,
            1
        ];
    };

    Clip.prototype.getC = function() {
        return {
            x: this.attr.c[0],
            y: this.attr.c[1],
            z: this.attr.c[2]
        };
    };

    Clip.prototype.getAttributes = function() {
        return {
            mode: this.attr.mode,
            a: this.getA(),
            b: this.getB(),
            c: this.getC()
        };
    };

    Clip.prototype._compile = function(traversalContext) {
        //this._preCompile(traversalContext);
        pushClip(this.attr.id, this.attr);
        this._compileNodes(traversalContext);
    };

    Clip.prototype._preCompile = function() {
        //    if (this._compileMemoLevel == 0) {
        //        this._makeClip();
        //    }
        pushClip(this.attr.id, this.attr);
    };



    Clip.prototype._postCompile = function() {
        //SceneJS_clipModule.popClip();
    };

})();