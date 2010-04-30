var SceneJS = {
    version: '0.7.2'
};


/** Includes JavaScript - use this for pulling in extra libraries like extensions, plugins etc.
 */
//    SceneJS.require = function(url) {
//
//    };

/** All exceptions thrown by SceneJS
 */
SceneJS.exceptions = {

};


/** Private resources
 */
SceneJS._utils = {

    traversalMode :0x1,

    TRAVERSAL_MODE_RENDER: 0x1,
    TRAVERSAL_MODE_PICKING:   0x2,

    inherit : function(DerivedClassName, BaseClassName) {
        DerivedClassName.prototype = new BaseClassName();
        DerivedClassName.prototype.constructor = DerivedClassName;
    },

    /** Adds members of o1 to o2 where not already on the latter
     *
     */
    applyIf : function(o1, o2) {
        for (var key in o2) {
            if (!o1[key]) {
                o1[key] = o2[key];
            }
        }
        return o1;
    },

    apply : function(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
        return o1;
    },

    /** Converts degrees to radiians
     */
    degToRad : function(degrees) {
        return degrees * Math.PI / 180.0;
    },

    /** Creates a namespace
     */
    namespace : function() {
        var a = arguments, o = null, i, j, d, rt;
        for (i = 0; i < a.length; ++i) {
            d = a[i].split(".");
            rt = d[0];
            eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
            for (j = 1; j < d.length; ++j) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
    },
    /** Creates a new data data for a scene graph subtree, optionally as a child of a
     * parent scope. The scope can be flagged as being either fixed or unfixed. The former
     * type has data that will be constant for the life of the scene graph, while the latter
     * has data that will vary. So, data derived from the former type may be cached (or 'memoized')
     * in scene nodes, while the latter type must not be cached.
     */
    newScope : function(_parent, _fixed) { // TODO: Optimise!
        var parent = _parent;
        var data = {};
        var fixed = _fixed || (_parent ? _parent.isfixed() : false);

        return {
            put : function(key, value) {
                data[key] = value;
            },

            /** Gets an element of data from this data or the first one on the parent path that has it
             */
            get : function(key) {
                var value = data[key];
                if ((value == 0) || value) {
                    return value;
                }
                if (!parent) {
                    return null;
                }
                return parent.get(key);
            },

            isfixed : function() {
                return fixed;
            }
        };
    },



    /**
     * Returns a key for a vacant slot in the given map
     */
    createKeyForMap : function(keyMap, prefix) {
        var i = 0;
        while (true) {
            var key = prefix + i++;
            if (!keyMap[key]) {
                return key;
            }
        }
    }
};


SceneJS._utils.ns = SceneJS._utils.namespace; // in intellij using keyword "namespace" causes parsing errors
SceneJS._utils.ns("SceneJS");


