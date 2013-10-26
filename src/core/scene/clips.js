(function() {

    /**
     * The default state core singleton for {@link SceneJS.Clips} nodes
     */
    var defaultCore = {
        type: "clips",
        stateId: SceneJS._baseStateId++,
        empty: true,        
        hash: "",
        clips : []
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.clips = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which defines one or more arbitrarily-aligned clip planes to clip the {@link SceneJS.Geometry} nodes in its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Clips = SceneJS_NodeFactory.createNodeType("clips");

    SceneJS.Clips.prototype._init = function(params) {

        if (this._core.useCount == 1) { // This node defines the resource

            var clips = params.clips;

            if (!clips) {
                throw SceneJS_error.fatalError(
                        SceneJS.errors.NODE_CONFIG_EXPECTED,
                        "clips node attribute missing : 'clips'");
            }

            this._core.clips = this._core.clips || [];

            for (var i = 0, len = clips.length; i < len; i++) {
                this._setClip(i, clips[i]);
            }
        }
    };

    SceneJS.Clips.prototype.setClips = function(clips) {
        var indexNum;
        for (var index in clips) {
            if (clips.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.clips.length) {
                        throw SceneJS_error.fatalError(
                                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                                "Invalid argument to set 'clips': index out of range (" + this._core.clips.length + " clips defined)");
                    }
                    this._setClip(indexNum, clips[index] || {});
                }
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Clips.prototype._setClip = function(index, cfg) {

        var clip = this._core.clips[index] || (this._core.clips[index] = {});

        clip.normalAndDist = [cfg.x || 0,  cfg.y || 0, cfg.z || 0, cfg.dist || 0];

        var mode = cfg.mode || clip.mode || "disabled";

        if (mode != "inside" && mode != "outside" && mode != "disabled") {
            throw SceneJS_error.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "clips node invalid value for property 'mode': should be 'inside' or 'outside' or 'disabled'");
        }
        clip.mode = mode;

        this._core.hash = null;
    };

    SceneJS.Clips.prototype._compile = function(ctx) {

        if (!this._core.hash) {
            this._core.hash = this._core.clips.length;
        }

        this._engine.display.clips = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.clips = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };


})();