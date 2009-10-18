var SceneJs = {version: '1.0'};

SceneJs.apply = function(o, c, defaults) {
    if (defaults) {
        // no "this" reference for friendly out of scope calls
        SceneJs.apply(o, defaults);
    }
    if (o && c && typeof c == 'object') {
        for (var p in c) {
            o[p] = c[p];
        }
    }
    return o;
};


(function() {
    var instanceofNode = function(o) {
        return (o.visit && o.visit instanceof Function
                && o.getNumChildren && o.getNumChildren instanceof Function);
    };

    SceneJs.apply(SceneJs, {

        MV_MATRIX_VAR : 'scene_ModelViewMatrix',

        emptyFn : function() {
        },

        /** Adds nodes of c to o where not existing in o, returns o
         *
         * @param o
         * @param c
         */
        applyIf : function(o, c) {
            if (o && c) {
                for (var p in c) {
                    if (typeof o[p] == "undefined") {
                        o[p] = c[p];
                    }
                }
            }
            return o;
        },

        /**
         *
         * @param origclass
         * @param overrides
         */

        extend : function() {
            // inline overrides
            var io = function(o) {
                for (var m in o) {
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sq, overrides) {
                if (typeof sq == 'object') {
                    overrides = sq;
                    sq = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function() {
                        sq.apply(this, arguments);
                    };
                }
                var F = function() {
                };
                var sbp;
                var sqp = sq.prototype;
                F.prototype = sqp;
                sbp = sb.prototype = new F();
                sbp.constructor = sb;
                sb.superclass = sqp;
                if (sqp.constructor == oc) {
                    sqp.constructor = sq;
                }
                sb.override = function(o) {
                    SceneJs.override(sb, o);
                };
                sbp.override = io;
                SceneJs.override(sb, overrides);
                sb.extend = function(o) {
                    SceneJs.extend(sb, o);
                };
                return sb;
            };
        }(),

        override : function(origclass, overrides) {
            if (overrides) {
                var p = origclass.prototype;
                for (var method in overrides) {
                    p[method] = overrides[method];
                }
            }
        },

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

        shallowClone : function(obj) {
            var obj2 = {};
            for (var key in obj) {
                obj2[key] = obj[key];
            }
            return obj2;
        },

        clone : function(obj) {
            return obj;
            //           var seenObjects = [];
            //           var mappingArray = [];
            //           var	f = function(simpleObject) {
            //              var indexOf = seenObjects.indexOf(simpleObject);
            //              if (indexOf == -1) {
            //                 switch (Ext.type(simpleObject)) {
            //                    case 'object':
            //                       seenObjects.push(simpleObject);
            //                       var newObject = {};
            //                       mappingArray.push(newObject);
            //                       for (var p in simpleObject)
            //                          newObject[p] = f(simpleObject[p]);
            //                       newObject.constructor = simpleObject.constructor;
            //                    return newObject;
            //                    case 'array':
            //                       seenObjects.push(simpleObject);
            //                       var newArray = [];
            //                       mappingArray.push(newArray);
            //                       for(var i=0,len=simpleObject.length; i<len; i++)
            //                          newArray.push(f(simpleObject[i]));
            //                    return newArray;
            //                    default:
            //                    return simpleObject;
            //                 }
            //              } else {
            //                 return mappingArray[indexOf];
            //              }
            //           };
            //           return f(obj);
        }
    });

    SceneJs.getConfig = function(args) {
        if (args.length == 0) {
            return {};
        }
        if (instanceofNode(args[0])) {
            return {
                children: args
            };
        } else {
            var cfg = args[0];
            if (!cfg.children) {
                cfg.children = [];
            }
            for (var i = 1; i < args.length; i++) {
                cfg.children.push(args[i]);
            }
            return cfg;
        }
    };

    SceneJs.inherit = function(superClass, args, cfg) {
        if (args.length == 0) {
            return superClass.call(this, cfg);
        }
        var args2 = [];
        if (instanceofNode(args[0])) {
            args2.push(cfg);
            for (var i = 0; i < args.length; i++) {
                args2.push(args[i]);
            }
        } else {
            args2.push(SceneJs.apply(args[0], cfg));
            for (var i = 1; i < args.length; i++) {
                args2.push(args[i]);
            }
        }
        return superClass.apply(this, args2);
    };

    // in intellij using keyword "namespace" causes parsing errors
    SceneJs.ns = SceneJs.namespace;
})();

SceneJs.ns("SceneJs");


SceneJs.apply(Function.prototype, {createCallback:function() {
    var A = arguments;
    var B = this;

    return function() {
        return B.apply(window, A)
    };
},
    createDelegate:function(C, B, A) {
        var D = this;
        return function() {
            var F = B || arguments;
            if (A === true) {
                F = Array.prototype.slice.call(arguments, 0);
                F = F.concat(B)
            } else {
                if (typeof A == "number") {
                    F = Array.prototype.slice.call(arguments, 0);
                    var E = [A,0].concat(B);
                    Array.prototype.splice.apply(F, E)
                }
            }
            return D.apply(C || window, F)
        };
    }
});

