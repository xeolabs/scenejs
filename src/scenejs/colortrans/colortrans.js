/**
 * @class A scene node that defines color transforms to apply to materials.
 *
 */

new (function() {
    var idStack = [];
    var colortransStack = [];
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
            function() {
                if (dirty) {
                    if (stackLen > 0) {
                        SceneJS_DrawList.setColortrans(idStack[stackLen - 1], colortransStack[stackLen - 1]);
                    } else {
                        SceneJS_DrawList.setColortrans();
                    }
                    dirty = false;
                }
            });

    var Colortrans = SceneJS.createNodeType("colortrans");

    Colortrans.prototype._init = function(params) {
        if (this.core._nodeCount == 1) { // This node defines the resource
            this.setScale(params.scale);
            this.setAdd(params.add);
            this.setSaturation(params.saturation);
        }
    };

    Colortrans.prototype.setSaturation = function(saturation) {
        this.core.saturation = saturation;
    };

    Colortrans.prototype.mulSaturation = function(saturation) {
        this.core.saturation *= saturation;
    };

    Colortrans.prototype.incSaturation = function(saturation) {
        this.core.saturation += saturation;
    };

    Colortrans.prototype.getSaturation = function() {
        return this.core.saturation;
    };

    Colortrans.prototype.setScale = function(scale) {
        scale = scale || {};
        this.core.scale = {
            r: scale.r != undefined ? scale.r : 1,
            g: scale.g != undefined ? scale.g : 1,
            b: scale.b != undefined ? scale.b : 1,
            a: scale.a != undefined ? scale.a : 1
        };
    };

    Colortrans.prototype.incScale = function(scale) {
        scale = scale || {};
        var s = this.core.scale;
        if (scale.r) {
            s.r += scale.r;
        }
        if (scale.g) {
            s.g += scale.g;
        }
        if (scale.b) {
            s.b += scale.b;
        }
        if (scale.a) {
            s.a += scale.a;
        }
    };

    Colortrans.prototype.mulScale = function(scale) {
        scale = scale || {};
        var s = this.core.scale;
        if (scale.r) {
            s.r *= scale.r;
        }
        if (scale.g) {
            s.g *= scale.g;
        }
        if (scale.b) {
            s.b *= scale.b;
        }
        if (scale.a) {
            s.a *= scale.a;
        }
    };

    Colortrans.prototype.getScale = function() {
        return this.core.scale;
    };

    Colortrans.prototype.setAdd = function(add) {
        add = add || {};
        this.core.add = {
            r: add.r != undefined ? add.r : 0,
            g: add.g != undefined ? add.g : 0,
            b: add.b != undefined ? add.b : 0,
            a: add.a != undefined ? add.a : 0
        };
    };

    Colortrans.prototype.incAdd = function(add) {
        add = add || {};
        var s = this.core.add;
        if (add.r) {
            s.r += add.r;
        }
        if (add.g) {
            s.g += add.g;
        }
        if (add.b) {
            s.b += add.b;
        }
        if (add.a) {
            s.a += add.a;
        }
    };

    Colortrans.prototype.mulAdd = function(add) {
        add = add || {};
        var s = this.core.add;
        if (add.r) {
            s.r *= add.r;
        }
        if (add.g) {
            s.g *= add.g;
        }
        if (add.b) {
            s.b *= add.b;
        }
        if (add.a) {
            s.a *= add.a;
        }
    };

    Colortrans.prototype.getAdd = function() {
        return this.core.add;
    };

    Colortrans.prototype._compile = function() {

        idStack[stackLen] = this.attr.id;
        colortransStack[stackLen] = this.core;
        stackLen++;
        dirty = true;

        this._compileNodes();

        stackLen--;
        dirty = true;
    };

})();