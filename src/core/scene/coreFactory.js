/**
 * @class Manages creation, recycle and destruction of {@link SceneJS_Core} instances
 * @private
 */
var SceneJS_CoreFactory = function () {

    this._stateMap = new SceneJS_Map(null, SceneJS._baseStateId);  // For creating unique state IDs for cores

    this._cores = {}; // Map of cores for each type
};

/**
 * State core classes provided by this factory
 * @type {SceneJS.Core}
 */
SceneJS_CoreFactory.coreTypes = {};    // Supported core classes, installed by #createCoreType

/**
 * Creates a core class for instantiation by this factory
 * @param {String} type Name of type, eg. "camera"
 * @param {Node} [superType] Class of super type - SceneJS.Node by default
 * @returns The new node class
 */
SceneJS_CoreFactory.createCoreType = function (type, superType) {
    //
    //    var supa = SceneJS_CoreFactory.coreTypes[superType];
    //
    //    if (!supa) {
    //        supa = SceneJS.Core; // Super class is Core by default
    //    }
    //
    //    var nodeType = function() { // Create the class
    //        supa.apply(this, arguments);
    //        this.type = type;
    //    };
    //
    //    nodeType.prototype = new supa();            // Inherit from base class
    //    nodeType.prototype.constructor = nodeType;
    //
    //    SceneJS_CoreFactory.nodeTypes[type] = nodeType;
    //
    //    return nodeType;
};

SceneJS_CoreFactory.addCoreBuilder = function (type, factory) {

};

/* HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core    
 */
SceneJS_CoreFactory.coreAliases = {
    "rotate":"xform",
    "translate":"xform",
    "scale":"xform",
    "matrix":"xform",
    "xform":"xform"
};

/**
 * Gets a core of the given type from this factory. Reuses any existing existing core of the same type and ID.
 *
 * The caller (a scene node) will then augment the core with type-specific attributes and methods.
 *
 * @param {String} type Type name of core, e.g. "material", "texture"
 * @param {String} coreId ID for the core, unique among all cores of the given type within this factory
 * @returns {Core} The core
 */
SceneJS_CoreFactory.prototype.getCore = function (type, coreId) {

    /* HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core    
     */
    var alias = SceneJS_CoreFactory.coreAliases[type];
    if (alias) {
        type = alias;
    }

    var cores = this._cores[type];

    if (!cores) {
        cores = this._cores[type] = {};
    }

    var core;

    if (coreId) { // Attempt to reuse a core

        core = cores[coreId];

        if (core) {
            core.useCount++;
            return core;
        }
    }

    core = new SceneJS_Core(type);
    core.useCount = 1;  // One user so far

    core.stateId = this._stateMap.addItem(core);
    core.coreId = (coreId != undefined && coreId != null) ? coreId : core.stateId; // Use state ID as core ID by default

    cores[core.coreId] = core;

    return core;
};


/**
 * Tests if a core of the given type and ID currently exists within this factory.
 *
 * @param {String} type Type name of core, e.g. "material", "texture"
 * @param {String} coreId ID for the core, unique among all cores of the given type within this factory
 * @returns {Boolean} True if the core exists
 */
SceneJS_CoreFactory.prototype.hasCore = function (type, coreId) {
    // HACK - allows different types of node to have same type of core, eg. "rotate" and "translate" nodes can both have an "xform" core
    var alias = SceneJS_CoreFactory.coreAliases[type];
    if (alias) {
        type = alias;
    }
    var cores = this._cores[type];
    return cores && cores[coreId];
};

/**
 * Releases a state core back to this factory, destroying it if the core's use count is then zero.
 * @param {Core} core Core to release
 */
SceneJS_CoreFactory.prototype.putCore = function (core) {

    if (core.useCount == 0) {
        return; // In case of excess puts
    }

    if (--core.useCount <= 0) {                    // Release shared core if use count now zero

        var cores = this._cores[core.type];

        delete cores[core.coreId];

        this._stateMap.removeItem(core.stateId);  // Release state ID for reuse
    }
};

/**
 * Reallocates WebGL resources for cores within this factory
 */
SceneJS_CoreFactory.prototype.webglRestored = function () {

    var cores;
    var core;

    for (var type in this._cores) {
        if (this._cores.hasOwnProperty(type)) {

            cores = this._cores[type];

            if (cores) {

                for (var coreId in cores) {
                    if (cores.hasOwnProperty(coreId)) {

                        core = cores[coreId];

                        if (core && core.webglRestored) { // Method augmented on core by user
                            core.webglRestored();
                        }
                    }
                }
            }
        }
    }
};
