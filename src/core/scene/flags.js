(function() {

    /**
     * The default state core singleton for {@link SceneJS.Flags} nodes
     */
    var defaultCore = {

        stateId: SceneJS._baseStateId++,
        type: "flags",

        picking : true,             // Picking enabled
        clipping : true,            // User-defined clipping enabled
        enabled : true,             // Node not culled from traversal
        transparent: false,         // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,            // Show backfaces
        frontface: "ccw",           // Default vertex winding for front face
        backfaceLighting: true,     // Shading enabled for backfaces
        backfaceTexturing: true,    // Texturing enabled for backfaces
        specular: true,             // Specular lighting enabled
        ambient: true               // Ambient lighting enabled
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
            SceneJS_events.SCENE_COMPILING,
            function(params) {
                params.engine.display.flags = defaultCore;
                stackLen = 0;
            });

    /**
     * @class Scene graph node which sets rendering mode flags for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Flags = SceneJS_NodeFactory.createNodeType("flags");

    SceneJS.Flags.prototype._init = function(params) {

        if (this._core.useCount == 1) {         // This node is first to reference the state core, so sets it up

            this._core.picking = true;           // Picking enabled
            this._core.clipping = true;          // User-defined clipping enabled
            this._core.enabled = true;           // Node not culled from traversal
            this._core.transparent = false;      // Node transparent - works in conjunction with matarial alpha properties
            this._core.backfaces = true;         // Show backfaces
            this._core.frontface = "ccw";        // Default vertex winding for front face
            this._core.backfaceLighting = true;  // Shading enabled for backfaces
            this._core.backfaceTexturing = true; // Texturing enabled for backfaces
            this._core.specular = true;          // Specular lighting enabled by default
            this._core.ambient = true;           // Ambient lighting enabled by default

            if (params.flags) {                 // 'flags' property is actually optional in the node definition
                this.setFlags(params.flags);
            }
        }
    };

    SceneJS.Flags.prototype.setFlags = function(flags) {

        var core = this._core;

        if (flags.picking != undefined) {
            core.picking = !!flags.picking;
            this._engine.display.drawListDirty = true;
        }

        if (flags.clipping != undefined) {
            core.clipping = !!flags.clipping;
            this._engine.display.imageDirty = true;
        }

        if (flags.enabled != undefined) {
            core.enabled = !!flags.enabled;
            this._engine.display.drawListDirty = true;
        }

        if (flags.transparent != undefined) {
            core.transparent = !!flags.transparent;
            this._engine.display.drawListDirty = true;
        }

        if (flags.backfaces != undefined) {
            core.backfaces = !!flags.backfaces;
            this._engine.display.imageDirty = true;
        }

        if (flags.frontface != undefined) {
            core.frontface = !!flags.frontface;
            this._engine.display.imageDirty = true;
        }

        if (flags.backfaceLighting != undefined) {
            core.backfaceLighting = !!flags.backfaceLighting;
            this._engine.display.imageDirty = true;
        }

        if (flags.backfaceTexturing != undefined) {
            core.backfaceTexturing = !!flags.backfaceTexturing;
            this._engine.display.imageDirty = true;
        }

        if (flags.specular != undefined) {
            core.specular = !!flags.specular;
            this._engine.display.imageDirty = true;
        }

        if (flags.ambient != undefined) {
            core.ambient = !!flags.ambient;
            this._engine.display.imageDirty = true;
        }

        return this;
    };

    SceneJS.Flags.prototype.addFlags = function(flags) {
        return this.setFlags(flags);
        //        var core = this._core;
        //        if (flags.picking != undefined) core.picking = flags.picking;
        //        if (flags.clipping != undefined) core.clipping = flags.clipping;
        //        if (flags.enabled != undefined) core.enabled = flags.enabled;
        //        if (flags.transparent != undefined) core.transparent = flags.transparent;
        //        if (flags.backfaces != undefined) core.backfaces = flags.backfaces;
        //        if (flags.frontface != undefined) core.frontface = flags.frontface;
        //        if (flags.backfaceLighting != undefined) core.backfaceLighting = flags.backfaceLighting;
        //        if (flags.backfaceTexturing != undefined) core.backfaceTexturing = flags.backfaceTexturing;
        //        return this;
    };

    SceneJS.Flags.prototype.getFlags = function() {
        var core = this._core;
        return {
            picking : core.picking,
            clipping : core.clipping,
            enabled : core.enabled,
            transparent: core.transparent,
            backfaces: core.backfaces,
            frontface: core.frontface,
            specular: core.specular,
            ambient: core.ambient
        };
    };

    SceneJS.Flags.prototype.setPicking = function(picking) {
        picking = !!picking;
        if (this._core.picking != picking) {
            this._core.picking = picking;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getPicking = function() {
        return this._core.picking;
    };

    SceneJS.Flags.prototype.setClipping = function(clipping) {
        clipping = !!clipping;
        if (this._core.clipping != clipping) {
            this._core.clipping = clipping;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getClipping = function() {
        return this._core.clipping;
    };

    SceneJS.Flags.prototype.setEnabled = function(enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getEnabled = function() {
        return this._core.enabled;
    };

    SceneJS.Flags.prototype.setTransparent = function(transparent) {
        transparent = !!transparent;
        if (this._core.transparent != transparent) {
            this._core.transparent = transparent;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getTransparent = function() {
        return this._core.transparent;
    };

    SceneJS.Flags.prototype.setBackfaces = function(backfaces) {
        backfaces = !!backfaces;
        if (this._core.backfaces != backfaces) {
            this._core.backfaces = backfaces;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getBackfaces = function() {
        return this._core.backfaces;
    };

    SceneJS.Flags.prototype.setFrontface = function(frontface) {
        if (this._core.frontface != frontface) {
            this._core.frontface = frontface;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getFrontface = function() {
        return this._core.frontface;
    };

    SceneJS.Flags.prototype.setBackfaceLighting = function(backfaceLighting) {
        backfaceLighting = !!backfaceLighting;
        if (this._core.backfaceLighting != backfaceLighting) {
            this._core.backfaceLighting = backfaceLighting;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getBackfaceLighting = function() {
        return this._core.backfaceLighting;
    };

    SceneJS.Flags.prototype.setBackfaceTexturing = function(backfaceTexturing) {
        backfaceTexturing = !!backfaceTexturing;
        if (this._core.backfaceTexturing != backfaceTexturing) {
            this._core.backfaceTexturing = backfaceTexturing;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getBackfaceTexturing = function() {
        return this._core.backfaceTexturing;
    };

    SceneJS.Flags.prototype.setSpecular = function(specular) {
        specular = !!specular;
        if (this._core.specular != specular) {
            this._core.specular = specular;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getSpecular = function() {
        return this._core.specular;
    };
    
    SceneJS.Flags.prototype.setAmbient = function(ambient) {
        ambient = !!ambient;
        if (this._core.ambient != ambient) {
            this._core.ambient = ambient;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getAmbient = function() {
        return this._core.ambient;
    };

    SceneJS.Flags.prototype.setAmbient = function(ambient) {
        ambient = !!ambient;
        if (this._core.ambient != ambient) {
            this._core.ambient = ambient;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getAmbient = function() {
        return this._core.ambient;
    };

    SceneJS.Flags.prototype._compile = function() {
        this._engine.display.flags = coreStack[stackLen++] = this._core;
        this._compileNodes();
        this._engine.display.flags = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
    };

})();