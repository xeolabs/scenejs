/**
 *
 *
 *  @private
 */
SceneJS._morphGeometryModule = new (function() {

    var canvas;
    var morphMaps = {};                   // morph map for each canvas
    var currentMorphMap = null;

    var idStack = new Array(255);
    var morphStack = new Array(255);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                canvas = null;
                currentMorphMap = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_ACTIVATED,
            function(c) {
                if (!morphMaps[c.canvasId]) {      // Lazy-create morph map for canvas
                    morphMaps[c.canvasId] = {};
                }
                canvas = c;
                currentMorphMap = morphMaps[c.canvasId];
                stackLen = 0;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                currentMorphMap = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {

            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (stackLen > 0) {

                        /* Get top morph on stack
                         */
                        var morph = morphStack[stackLen - 1];

                        /* Select target frame
                         */
                        var target1 = morph.targets[0];   // Just for testing
                        var target2 = morph.targets[1];

                        /* Set on shader module
                         */
                        SceneJS._renderModule.setMorph(idStack[stackLen - 1], {
                            factor: morph.factor,
                            target1: target1,
                            target2: target2
                        });
                    } else {
                        SceneJS._renderModule.setMorph();
                    }
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                for (var canvasId in morphMaps) {    // Destroy geometries on all canvases
                    if (morphMaps.hasOwnProperty(canvasId)) {
                        var morphMap = morphMaps[canvasId];
                        for (var resource in morphMap) {
                            if (morphMap.hasOwnProperty(resource)) {
                                var morph = morphMap[resource];
                                destroyMorph(morph);
                            }
                        }
                    }
                }
                canvas = null;
                morphMaps = {};
                currentMorphMap = null;
                stackLen = 0;
            });

    /**
     * Destroys morph, returning true if memory freed, else false
     * where canvas not found and morph was implicitly destroyed
     */
    function destroyMorph(morph) {
        if (document.getElementById(morph.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            var target;
            for (var i = 0, len = morph.targets.length; i < len; i++) {
                target = morph.targets[i];
                if (target.vertexBuf) {
                    target.vertexBuf.destroy();
                }
                if (target.normalBuf) {
                    target.normalBuf.destroy();
                }
                if (target.uvBuf) {
                    target.uvBuf.destroy();
                }
                if (target.uvBuf2) {
                    target.uvBuf2.destroy();
                }
            }
        }
        var morphMap = morphMaps[morph.canvas.canvasId];
        if (morphMap) {
            morphMap[morph.resource] = null;
        }
    }

    /**
     * Tests if the given morph resource exists on the currently active canvas
     */
    this.testMorphGeometryExists = function(resource) {
        return currentMorphMap[resource] ? true : false;
    };

    /**
     * Creates morph on the active canvas
     */
    this.createMorphGeometry = function(resource, attr) {
        if (!resource) {
            resource = SceneJS._createKeyForMap(currentMorphMap, "m");
        }
        var context = canvas.context;

        var morph = {
            resource: resource,
            keys: attr.keys,
            instant : attr.instant,
            targets: []
        };

        try {

            var usage = context.STATIC_DRAW;

            var target;
            var newTarget;

            for (var i = 0, len = attr.targets.length; i < len; i++) {
                target = attr.targets[i];

                newTarget = {};
                morph.targets.push(newTarget);  // We'll iterate this to destroy targets when we recover from error

                if (target.positions && target.positions.length > 0) {
                    newTarget.vertexBuf = new SceneJS._webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            new Float32Array(target.positions), target.positions.length, 3, usage);
                }
                if (target.normals && target.normals.length > 0) {
                    newTarget.normalBuf = new SceneJS._webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            new Float32Array(target.normals), target.normals.length, 3, usage);
                }
                if (target.uv && target.uv.length > 0) {
                    newTarget.uvBuf = new SceneJS._webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            new Float32Array(target.uv), target.uv.length, 2, usage);
                }
                if (target.uv2 && target.uv2.length > 0) {
                    newTarget.uvBuf2 = new SceneJS._webgl_ArrayBuffer(context, context.ARRAY_BUFFER,
                            new Float32Array(target.uv2), target.uv2.length, 2, usage);
                }
            }
            currentMorphMap[resource] = morph;
            return resource;

        } catch (e) {

            /* Allocation failure - deallocate all target VBOs
             */
            for (var i = 0, len = morph.targets.length; i < len; i++) {
                target = morph.targets[i];
                if (target.vertexBuf) {
                    target.vertexBuf.destroy();
                }
                if (target.normalBuf) {
                    target.normalBuf.destroy();
                }
                if (target.uvBuf) {
                    target.uvBuf.destroy();
                }
                if (target.uvBuf2) {
                    target.uvBuf2.destroy();
                }
            }
            throw e;
        }
    };


    this.pushMorphGeometry = function(id, resource, factor) {
        var morph = currentMorphMap[resource];
        morph.factor = factor;

        idStack[stackLen] = id;
        morphStack[stackLen] = morph;

        stackLen++;
        dirty = true;
    };

    this.popMorphGeometry = function() {
        stackLen--;
        dirty = true;
    };
})();
