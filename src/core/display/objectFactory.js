/**
 * @class Manages creation and recycle of {@link SceneJS_Object} instances
 * @private
 */
var SceneJS_ObjectFactory = function() {

};

/**
 * @property {[SceneJS_Object]} _freeObjects Pool of free display objects, shared by all object factories
 */
SceneJS_ObjectFactory.prototype._freeObjects = [];

/**
 * @property {Number} _numFreeObjects Number of free objects
 */
SceneJS_ObjectFactory.prototype._numFreeObjects = 0;

/**
 * Gets a display object from this factory
 *
 * @param {String} id ID to assign to the object
 * @returns {SceneJS_Object} The object
 */
SceneJS_ObjectFactory.prototype.getObject = function(id) {

    var object;

    if (this._numFreeObjects > 0) {

        object = this._freeObjects[--this._numFreeObjects];
        object.id = id;

        return object;
    }

    return new SceneJS_Object(id);
};

/**
 * Releases a display object back to this factory
 * @param {SceneJS_Object} object Object to release
 */
SceneJS_ObjectFactory.prototype.putObject = function (object) {

  //  this._freeObjects[this._numFreeObjects++] = object;
};