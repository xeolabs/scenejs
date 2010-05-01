/**
 * Backend module for VRAM management. This module tries to ensure that SceneJS always has enough video memory
 * to keep things ticking over, at least slowly. Whenever any backend wants to load something into video RAM, it
 * will get the memory manager to mediate the allocation, passing in a callback that will attempt the actual allocation.
 * The memory manager will then try the callback and if no exception is thrown by it, all is good and that's that.
 *
 * However, if the callback throws an out-of-memory exception, the memory manager will poll each registered evictor to
 * evict something to free up some memory in order to satisfy the request. As soon as one of the evictors has
 * successfully evicted something, the memory manager will have another go with the  callback. It will repeat this
 * process, polling a different evictor each time, until the callback succeeds. For fairness, the memory manager
 * remembers the last evictor it polled, to continue with the next one when it needs to evict something again.
 *
 * This module is to be used only when there is an active canvas.
 *
 *  @private
 */
var SceneJS_memoryModule = new (function() {

    var canvas;                 // Used for testing for error conditions
    var evictors = [];          // Eviction function for each client
    var iEvictor = 0;           // Fair eviction policy - don't keep starting polling at first evictor

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
            });

    SceneJS_eventModule.onEvent(// Framework reset - start next polling at first evictor
            SceneJS_eventModule.RESET,
            function() {
                canvas = null;
                iEvictor = 0;
            });

    /**
     * Polls each registered evictor backend to evict something. Stops on the first one to
     * comply. When called again, resumes at the next in sequence to ensure fairness.
     * @private
     */
    function evict() {
        if (evictors.length == 0) {
            return false;
        }
        var tries = 0;
        while (true) {
            if (iEvictor > evictors.length) {
                iEvictor = 0;
            }
            if (evictors[iEvictor++]()) {
                SceneJS_loggingModule.warn("Evicted least-used item from memory");
                return true;
            } else {
                tries++;
                if (tries == evictors.length) {
                    return false;
                }
            }
        }
    }

    // @private
    function outOfMemory(description) {
        SceneJS_loggingModule.error("Memory allocation failed");
        SceneJS_errorModule.fatalError(new SceneJS.OutOfVRAMException(
                "Out of memory - failed to allocate memory for " + description));
    }

    /**
     * Volunteers the caller as an evictor that is willing to attempt to free some memory when polled
     * by this module as memory runs low. The given evict callback is to attempt to free some memory
     * held by the caller, and should return true on success else false.
     * @private
     */
    this.registerEvictor = function(evict) {
        evictors.push(evict);
    };

    /**
     * Attempt allocation of some memory for the caller. This method does not return anything - the
     * tryAllocate callback is to wrap the allocation attempt and provide the result to the caller via
     * a closure, IE. not return it.
     * @private
     */
    this.allocate = function(description, tryAllocate) {
        // SceneJS_loggingModule.debug("Allocating memory for: " + description);
        if (!canvas) {
            SceneJS_errorModule.fatalError(new SceneJS.NoCanvasActiveException
                    ("No canvas active - failed to allocate shader memory"));
        }
        var maxTries = 10; // TODO: Heuristic for this? Does this really need be greater than one?
        var context = canvas.context;
        if (context.getError() == context.OUT_OF_MEMORY) {
            outOfMemory(description);
        }
        var tries = 0;
        while (true) {
            try {
                tryAllocate();
                if (context.getError() == context.OUT_OF_MEMORY) {
                    outOfMemory(description);
                }
                return; // No errors, must have worked
            } catch (e) {
                if (context.getError() != context.OUT_OF_MEMORY) {
                    SceneJS_loggingModule.error(e.message || e);
                    throw e; // We only handle out-of-memory error here
                }
                if (++tries > maxTries || !evict()) { // Too many tries or no cacher wants to evict
                    outOfMemory(description);
                }
            }
        }
    };
})();




