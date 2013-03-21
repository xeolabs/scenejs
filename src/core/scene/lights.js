(function () {

    /**
     * The default state core singleton for {@link SceneJS.Lights} nodes
     */
    var defaultCore = {
        type:"lights",
        stateId:SceneJS._baseStateId++,
        hash:null,
        empty:false,
        lights:[
            {
                mode:"ambient",
                color:[0.6, 0.6, 0.6], // Core has arrays for WebGL loading
                diffuse:true,
                specular:false
            },
            {
                mode:"dir",
                color:[1.0, 1.0, 1.0 ],
                diffuse:true,
                specular:true,
                dir:[0.5, -1.0, -0.6 ]
            },
            {
                mode:"dir",
                color:[1.0, 1.0, 1.0 ],
                diffuse:true,
                specular:true,
                dir:[-1.0, 0.0, 0.0 ]
            }
        ]
    };

    makeHash(defaultCore);

    function makeHash(core) {
        if (core.lights && core.lights.length > 0) {
            var lights = core.lights;
            var parts = [];
            var light;
            for (var i = 0, len = lights.length; i < len; i++) {
                light = lights[i];
                parts.push(light.mode);
                if (light.specular) {
                    parts.push("s");
                }
                if (light.diffuse) {
                    parts.push("d");
                }
                parts.push((light.space == "world") ? "w" : "v");
            }
            core.hash = parts.join("");

        } else {
            core.hash = "";
        }
    }

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.lights = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which defines light sources to illuminate the {@link SceneJS.Geometry}s within its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Lights = SceneJS_NodeFactory.createNodeType("lights");

    SceneJS.Lights.prototype._init = function (params) {

        if (this._core.useCount == 1) { // This node defines the resource

            var lights = params.lights;

            if (!lights) {
                throw SceneJS_error.fatalError(
                    SceneJS.errors.NODE_CONFIG_EXPECTED,
                    "lights node attribute missing : 'lights'");
            }

            this._core.lights = this._core.lights || [];

            for (var i = 0, len = lights.length; i < len; i++) {
                this._setLight(i, lights[i]);
            }
        }
    };

    SceneJS.Lights.prototype.setLights = function (lights) {
        var indexNum;
        for (var index in lights) {
            if (lights.hasOwnProperty(index)) {
                if (index != undefined || index != null) {
                    indexNum = parseInt(index);
                    if (indexNum < 0 || indexNum >= this._core.lights.length) {
                        throw SceneJS_error.fatalError(
                            SceneJS.errors.ILLEGAL_NODE_CONFIG,
                            "Invalid argument to set 'lights': index out of range (" + this._core.lights.length + " lights defined)");
                    }
                    this._setLight(indexNum, lights[index] || {});
                }
            }
        }
        this._engine.display.imageDirty = true;
    };

    SceneJS.Lights.prototype._setLight = function (index, cfg) {

        var light = this._core.lights[index] || (this._core.lights[index] = []);

        var mode = cfg.mode || "dir";
        if (mode != "dir" && mode != "point" && mode != "ambient") {
            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "Light mode not supported - should be 'dir' or 'point' or 'ambient'");
        }

        var pos = cfg.pos;
        var dir = cfg.dir;

        var color = cfg.color;
        light.color = [
            color.r != undefined ? color.r : 1.0,
            color.g != undefined ? color.g : 1.0,
            color.b != undefined ? color.b : 1.0
        ];

        // Ambient lights hardwired to contribute to diffuse lighting
        light.mode = mode;
        light.diffuse = (mode == "ambient") ? true : ((cfg.diffuse != undefined) ? cfg.diffuse : true);
        light.specular = (mode == "ambient") ? false : ((cfg.specular != undefined) ? cfg.specular : true);
        light.pos = cfg.pos ? [ pos.x || 0, pos.y || 0, pos.z || 0 ] : undefined;
        light.dir = cfg.dir ? [dir.x || 0, dir.y || 0, dir.z || 0] : undefined;
        light.constantAttenuation = (cfg.constantAttenuation != undefined) ? cfg.constantAttenuation : 1.0;
        light.linearAttenuation = (cfg.linearAttenuation || 0.0);
        light.quadraticAttenuation = (cfg.quadraticAttenuation || 0.0);

        var space = cfg.space;

        if (!space) {

            space = "world";

        } else if (space != "view" && space != "world") {

            throw SceneJS_error.fatalError(
                SceneJS.errors.ILLEGAL_NODE_CONFIG,
                "lights node invalid value for property 'space': '" + space + "' - should be 'view' or 'world'");
        }

        light.space = space;

        this._core.hash = null;
    };

    SceneJS.Lights.prototype._compile = function () {

        if (!this._core.hash) {
            makeHash(this._core);
        }

        this._engine.display.lights = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.lights = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();