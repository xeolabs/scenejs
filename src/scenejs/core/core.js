/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.7.6',

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** @private */
    _traversalMode :0x1,

    /** @private */
    _TRAVERSAL_MODE_RENDER: 0x1,

    /** @private */
    _TRAVERSAL_MODE_PICKING:   0x2,

    /**
     * @private
     */
    _inherit : function(DerivedClassName, BaseClassName) {
        DerivedClassName.prototype = new BaseClassName();
        DerivedClassName.prototype.constructor = DerivedClassName;
    },

    /** Creates a namespace
     * @private
     */
    _namespace : function() {
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

    /**
     * Returns a key for a vacant slot in the given map
     * @private
     */
    _createKeyForMap : function(keyMap, prefix) {
        var i = 0;
        while (true) {
            var key = prefix + i++;
            if (!keyMap[key]) {
                return key;
            }
        }
    } ,

    /**
     * Returns true if object is an array
     * @private
     */
    _isArray : function(testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length')) 
                && typeof testObject === 'object' && typeof testObject.length === 'number';
    }
};

SceneJS._namespace("SceneJS");

