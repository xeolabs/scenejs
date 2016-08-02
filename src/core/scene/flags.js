(function () {

    /**
     * The default state core singleton for {@link SceneJS.Flags} nodes
     */
    var defaultCore = {

        stateId: SceneJS._baseStateId++,
        type: "flags",

        picking: true,              // Picking enabled
        clipping: true,             // User-defined clipping enabled
        frontClippingOnly: true,        // Used to assist drawing clipping caps
        enabled: true,              // Node not culled from traversal
        transparent: false,         // Node transparent - works in conjunction with matarial alpha properties
        backfaces: true,            // Show backfaces
        frontface: "ccw",           // Default vertex winding for front face
        reflective: true,           // Reflects reflection node cubemap, if it exists, by default.
        solid: false,               // When true, renders backfaces without texture or shading, for a cheap solid cross-section effect
        solidColor: [1.0, 1.0, 1.0],// Solid cap color
        skybox: false,              // Treat as a skybox
        hash: "refl;;;"
    };

    var coreStack = [];
    var stackLen = 0;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_COMPILING,
        function (params) {
            params.engine.display.flags = defaultCore;
            stackLen = 0;
        });

    /**
     * @class Scene graph node which sets rendering mode flags for its subgraph
     * @extends SceneJS.Node
     */
    SceneJS.Flags = SceneJS_NodeFactory.createNodeType("flags");

    SceneJS.Flags.prototype._init = function (params) {

        if (this._core.useCount == 1) {         // This node is first to reference the state core, so sets it up

            this._core.picking = true;           // Picking enabled
            this._core.clipping = true;          // User-defined clipping enabled
            this._core.frontClippingOnly = false;
            this._core.enabled = true;           // Node not culled from traversal
            this._core.transparent = false;      // Node transparent - works in conjunction with matarial alpha properties
            this._core.backfaces = true;         // Show backfaces
            this._core.frontface = "ccw";        // Default vertex winding for front face
            this._core.reflective = true;        // Reflects reflection node cubemap, if it exists, by default.
            this._core.solid = false;            // Renders backfaces without texture or shading, for a cheap solid cross-section effect
            this._core.solidColor = [1.0, 1.0, 1.0 ]; // Solid cap color
            this._core.skybox = false;              // Treat as a skybox
            if (params.flags) {                  // 'flags' property is actually optional in the node definition
                this.setFlags(params.flags);
            }
        }
    };

    SceneJS.Flags.prototype.setFlags = function (flags) {

        var core = this._core;

        if (flags.picking != undefined) {
            core.picking = !!flags.picking;
            this._engine.display.drawListDirty = true;
        }

        if (flags.clipping != undefined) {
            core.clipping = !!flags.clipping;
            this._engine.display.imageDirty = true;
        }

        if (flags.frontClippingOnly != undefined) {
            core.frontClippingOnly = !!flags.frontClippingOnly;
            this._engine.display.imageDirty = true;
        }

        if (flags.enabled != undefined) {
            core.enabled = !!flags.enabled;
            this._engine.display.drawListDirty = true;
        }

        if (flags.transparent != undefined) {
            core.transparent = !!flags.transparent;
            this._engine.display.stateSortDirty = true;
        }

        if (flags.backfaces != undefined) {
            core.backfaces = !!flags.backfaces;
            this._engine.display.imageDirty = true;
        }

        if (flags.frontface != undefined) {
            core.frontface = flags.frontface;
            this._engine.display.imageDirty = true;
        }

        if (flags.reflective != undefined) {
            core.reflective = flags.reflective;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        if (flags.solid != undefined) {
            core.solid = flags.solid;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        if (flags.solidColor != undefined) {
            var defaultSolidColor = defaultCore.solidColor;
            var color = flags.solidColor;
            core.solidColor = color ? [
                color.r != undefined && color.r != null ? color.r : defaultSolidColor[0],
                color.g != undefined && color.g != null ? color.g : defaultSolidColor[1],
                color.b != undefined && color.b != null ? color.b : defaultSolidColor[2]
            ] : defaultCore.solidColor;
            this._engine.display.imageDirty = true;
        }

        if (flags.skybox != undefined) {
            core.skybox = flags.skybox;
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }

        core.hash = getHash(core);

        return this;
    };

    SceneJS.Flags.prototype.getFlags = function () {
        var core = this._core;
        return {
            picking: core.picking,
            clipping: core.clipping,
            frontClippingOnly: core.frontClippingOnly,
            enabled: core.enabled,
            transparent: core.transparent,
            backfaces: core.backfaces,
            frontface: core.frontface,
            reflective: core.reflective,
            solid: core.solid,
            solidColor: core.solidColor
        };
    };

    SceneJS.Flags.prototype.setPicking = function (picking) {
        picking = !!picking;
        if (this._core.picking != picking) {
            this._core.picking = picking;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getPicking = function () {
        return this._core.picking;
    };

    SceneJS.Flags.prototype.setClipping = function (clipping) {
        clipping = !!clipping;
        if (this._core.clipping != clipping) {
            this._core.clipping = clipping;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.setFrontClippingOnly = function (frontClippingOnly) {
        frontClippingOnly = !!frontClippingOnly;
        if (this._core.frontClippingOnly != frontClippingOnly) {
            this._core.frontClippingOnly = frontClippingOnly;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getClipping = function () {
        return this._core.clipping;
    };

    SceneJS.Flags.prototype.getFrontClippingOnly = function () {
        return this._core.frontClippingOnly;
    };

    SceneJS.Flags.prototype.setEnabled = function (enabled) {
        enabled = !!enabled;
        if (this._core.enabled != enabled) {
            this._core.enabled = enabled;
            this._engine.display.drawListDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getEnabled = function () {
        return this._core.enabled;
    };

    SceneJS.Flags.prototype.setTransparent = function (transparent) {
        transparent = !!transparent;
        if (this._core.transparent != transparent) {
            this._core.transparent = transparent;
            this._engine.display.stateOrderDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getTransparent = function () {
        return this._core.transparent;
    };

    SceneJS.Flags.prototype.setBackfaces = function (backfaces) {
        backfaces = !!backfaces;
        if (this._core.backfaces != backfaces) {
            this._core.backfaces = backfaces;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getBackfaces = function () {
        return this._core.backfaces;
    };

    SceneJS.Flags.prototype.setFrontface = function (frontface) {
        if (this._core.frontface != frontface) {
            this._core.frontface = frontface;
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getFrontface = function () {
        return this._core.frontface;
    };

    SceneJS.Flags.prototype.setReflective = function (reflective) {
        reflective = !!reflective;
        if (this._core.reflective != reflective) {
            this._core.reflective = reflective;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getReflective = function () {
        return this._core.reflective;
    };

    SceneJS.Flags.prototype.setSolid = function (solid) {
        solid = !!solid;
        if (this._core.solid != solid) {
            this._core.solid = solid;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getSolid = function () {
        return this._core.solid;
    };

    SceneJS.Flags.prototype.setSolidColor = function (color) {
        var defaultSolidColor = defaultCore.solidColor;
        this._core.solidColor = color ? [
            color.r != undefined && color.r != null ? color.r : defaultSolidColor[0],
            color.g != undefined && color.g != null ? color.g : defaultSolidColor[1],
            color.b != undefined && color.b != null ? color.b : defaultSolidColor[2]
        ] : defaultCore.solidColor;
        this._engine.display.imageDirty = true;
        return this;
    };

    SceneJS.Flags.prototype.getSolidColor = function () {
        return {
            r: this._core.solidColor[0],
            g: this._core.solidColor[1],
            b: this._core.solidColor[2]
        };
    };

    SceneJS.Flags.prototype.setSkybox = function (skybox) {
        skybox = !!skybox;
        if (this._core.skybox != skybox) {
            this._core.skybox = skybox;
            this._core.hash = getHash(this._core);
            this._engine.branchDirty(this);
            this._engine.display.imageDirty = true;
        }
        return this;
    };

    SceneJS.Flags.prototype.getSkybox = function () {
        return this._core.skybox;
    };

    SceneJS.Flags.prototype._compile = function (ctx) {
        this._engine.display.flags = coreStack[stackLen++] = this._core;
        this._compileNodes(ctx);
        this._engine.display.flags = (--stackLen > 0) ? coreStack[stackLen - 1] : defaultCore;
        coreStack[stackLen] = null; // Release memory
    };

    function getHash(core) {
        return (core.reflective ? "refl" : "") + ";" +
                (core.solid ? "s" : "") + ";" +
                (core.skybox ? "sky" : "") + ";";
    }

})();
