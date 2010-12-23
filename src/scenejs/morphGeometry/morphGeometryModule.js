/**
 *
 *
 *  @private
 */
SceneJS._morphGeometryModule = new (function() {

    var time = (new Date()).getTime();  // For LRU caching
    var canvas;
    var morphMaps = {};                   // morph map for each canvas
    var currentMorphMap = null;
    var morphStack = new Array(100);
    var stackLen = 0;
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
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
                    if (stackLen == 0) {
                        SceneJS._shaderModule.setMorph(null);
                    } else {

                        /* Get top morph on stack
                         */
                        var morph = morphStack[stackLen - 1];

                        /* Select target frame
                         */
                        var target1 = morph.targets[0];   // Just for testing
                        var target2 = morph.targets[1];

                        /* Set on shader module
                         */
                        SceneJS._shaderModule.setMorph({
                            factor: morph.factor,
                            target1: target1,
                            target2: target2
                        });
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
     * Volunteer to attempt to destroy a morph when asked to by memory module
     */
    SceneJS._memoryModule.registerEvictor(
            function() {
                var earliest = time;
                var evictee;
                for (var canvasId in morphMaps) {
                    if (morphMaps.hasOwnProperty(canvasId)) {
                        var morphMap = morphMaps[canvasId];
                        if (morphMap) {
                            for (var resource in morphMap) {
                                if (morphMap.hasOwnProperty(resource)) {
                                    var morph = morphMap[resource];
                                    if (morph) {
                                        if (morph.lastUsed < earliest
                                                && document.getElementById(morph.canvas.canvasId)) { // Canvas must still exist
                                            evictee = morph;
                                            earliest = morph.lastUsed;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (evictee) {
                    SceneJS._loggingModule.warn("Evicting morph from memory: " + evictee.resource);
                    destroyMorph(evictee);
                    return true;
                }
                return false;  // Couldnt find a morph we can delete
            });

    /**
     * Creates an array buffer
     *
     * @param context WebGL context
     * @param bufType Eg. ARRAY_BUFFER
     * @param values WebGL array
     * @param numItems
     * @param itemSize
     * @param usage Eg. STATIC_DRAW
     */
    function createArrayBuffer(description, context, bufType, values, numItems, itemSize, usage) {
        var buf;
        SceneJS._memoryModule.allocate(
                context,
                description,
                function() {
                    buf = new SceneJS._webgl_ArrayBuffer(context, bufType, values, numItems, itemSize, usage);
                });
        return buf;
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
            lastUsed: time,
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
                    newTarget.vertexBuf = createArrayBuffer("morphGeometry vertex buffer", context, context.ARRAY_BUFFER,
                            new Float32Array(target.positions), target.positions.length, 3, usage);
                }
                if (target.normals && target.normals.length > 0) {
                    newTarget.normalBuf = createArrayBuffer("morphGeometry normal buffer", context, context.ARRAY_BUFFER,
                            new Float32Array(target.normals), target.normals.length, 3, usage);
                }
                if (target.uv && target.uv.length > 0) {
                    newTarget.uvBuf = createArrayBuffer("morphGeometry UV buffer", context, context.ARRAY_BUFFER,
                            new Float32Array(target.uv), target.uv.length, 2, usage);
                }
                if (target.uv2 && target.uv2.length > 0) {
                    newTarget.uvBuf2 = createArrayBuffer("morphGeometry UV2 buffer", context, context.ARRAY_BUFFER,
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


    this.pushMorphGeometry = function(resource, factor) {
        var morph = currentMorphMap[resource];
        morph.lastUsed = time;  // morph now not evictable during this scene traversal
        morph.factor = factor;
        morphStack[stackLen++] = morph;
        dirty = true;
    };

    this.popMorphGeometry = function() {
        stackLen--;
        dirty = true;
    };
})();
