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
    newScope : function(_parent, _fixed) {
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
     * Wraps a node function with a flag that identifies it as such. This allows
     * getNodeConfig to differentiate between child nodes and config functions
     * in node parameters, doing away with the need to always supply a config
     * with every node, ie. instead of:
     *
     *      node({}, node, node)
     *
     * you can then write this:
     *
     *      node(node, node)
     */
    //        createNode : function(func) {
    //            return {
    //                ___isSceneJSNode : true,  // Don't use this name in your node configs!
    //                func: func
    //            };
    //        },

    /**
     * Used within scene node functions to extract parameters and child nodes from arguments.
     *
     * Here are the four ways you can invoke a scene node function, along with the results extracted from the
     * arguments in each case by this utility:
     *
     * 1. No arguments
     *
     *      SceneJS.objects.cube()
     *
     *      Result:
     *
     *          {
     *              getParams : function() {
     *                    return {};
     *              },
     *              fixed : true,                   // Parameters will never vary because there are none
     *              children: []
     *          }
     *
     * 2. Child nodes with no parameters object
     *
     *      SceneJS.scene(node, node..)
     *
     *      Result:
     *
     *          {
     *              getParams : function() {
     *                    return {};
     *              },
     *              fixed : true,                   // Parameters will never vary because there are none
     *              children: [ node, node ]
     *          }
     *
     * 3. Parameters object followed by zero or more child nodes
     *
     *      SceneJS.rotate({ angle: 45 }, node, node..)
     *
     *      Result:
     *
     *          {
     *              getParams : function() {
     *                    return {
     *                          angle : 45
     *                    };
     *              },
     *              fixed : true,                   // Paramaters will never vary because they are an object
     *              children: [ node, node ],
     *          }
     *
     * 4. Dynamic parameterisation function followed by zero or more child nodes
     *
     *      SceneJS.rotate(function(data) { return data.get("angle"); }, node, node..)
     *
     *      Result:
     *
     *          {
     *              getParams : function(data) {    // Same function passed into the node function above
     *                    return data.get("angle");
     *              },
     *              fixed : false,                   // Params may vary because they are provided through a function
     *              children: [ node, node ]
     *          }
     *
     * @param args
     */
    getNodeConfig : function(args) {
        args = args || [];
        var result = {
            children : [],
            fixed: true
        };
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg._render) {
                result.children.push(arg);
            } else if (i == 0) {
                if (arg instanceof Function) {
                    result.getParams = arg;
                    result.fixed = false; // Configs generated by function - probably variable
                } else {
                    var config = arg;

                    /* Config is dynamic if any property is a function
                     */
                    result.fixed = true;  // Config object - may be constant - node may override if config has function
                    for (var key in arg) {
                        if (result.fixed && arg[key] instanceof Function) {
                            result.fixed = false;
                        }
                    }
                    result.getParams = function() {
                        return config;
                    };

                }
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.InvalidNodeConfigException
                        ("Invalid node parameters - config should be first, IE. node(config, node, node,...)"));
            }
        }
        if (!result.getParams) {
            result.getParams = function() {
                return {
                };
            };
        }
        return result;
    },

    NodeParams : function(nodeName, params, data) {
        this.fixed = true;
        this.getParam = function(name, mandatory) {
            var param = params[name];
            if (param instanceof Function) {
                this.fixed = false;
                param = param(data);
            }
            if (param) {
                return param;
            }
            if (mandatory) {
                SceneJS_errorModule.fatalError(
                        SceneJS.exceptions.NodeConfigExpectedException(
                                nodeName + " property expected: \"" + name + "\""));
            }
            else {
                return null;
            }
        };
    },

    createNode : function(type, children, proto) {
        this._parent = null;
        var _type = type;
        var _children = children;

        proto.getType = function() {
            return _type;
        };

        proto.getNumChildren = function() {
            return _children.length;
        };

        proto.getChildren = function() {
            var list = new Array(_children.length);
            var len = _children.length;
            for (var i = 0; i < len; i++) {
                list[i] = _children[i];
                child._parent = this;
            }
            return list;
        };

        proto.setChildren = function(children) {
            var temp = new Array(children.length);
            var len = children.length;
            var child;
            for (var i = 0; i < len; i++) {
                child = children[i];
                if (child._parent) {

                }
                temp[i] = child;
            }
            children = temp;
            return this;
        };

        proto.getChildAt = function(i) {
            return _children[i];
        };

        proto.removeChildAt = function(i) {
            var r = _children.splice(i, 1);
            if (r.length > 0) {
                r[0]._parent = null;
                return r[0];
            } else {
                return null;
            }
        };

        proto.addChild = function(node) {
            if (node._parent != null) {
            }
            _children.push(node);
            node._parent = this;
            return node;
        };

        proto.insertChild = function(node, i) {
            if (node._parent != null) {
            }
            if (i == undefined || i <= 0) {
                _children.unshift(node);
            } else if (i >= _children.length) {
                _children.push(node);
            } else {
                _children.splice(i, 0, node);
            }
            node._parent = this;
            return node;
        };

        proto.getParent = function() {
            return this._parent;
        };

        proto._renderChildren = function(traversalContext, data) {
            var child;
            var len = _children.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    child = _children[i];
                    child._render.call(child, { // Traversal context
                        appendix : traversalContext.appendix,
                        insideRightFringe: traversalContext.insideRightFringe || (i < len - 1)
                    }, data);
                }
            } else {

                /* Leaf node - if on right fringe of tree then
                 * render appended nodes
                 */
                if (traversalContext.appendix && (!traversalContext.insideRightFringe)) {
                    len = traversalContext.appendix.length;
                    for (var i = 0; i < len; i++) {
                        child = traversalContext.appendix[i];
                        child._render.call(child, { // Traversal context
                            appendix : null,
                            insideRightFringe: (i < len - 1)
                        }, data);
                    }
                }
            }
        };

        proto._renderChild = function(index, traversalContext, data) {
            _children[index]._render(traversalContext, data);
        };

        return proto;
    },

    getParam : function(param, data, fallback) {
        if (param instanceof Function) {
            return param.call(this, data);
        } else if (!param) {
            return fallback;
        } else {
            return param;
        }
    },

    /**
     * This function is used when you want to wrap a scene node function invokation it with your own node function,
     * while adding/overriding members on the parameters argument.
     *
     * See SceneJS._utils.getNodeConfigs to see how node arguments are processed.
     *
     * Examples
     * --------
     *
     * Wrapping SceneJS.someNode and augmenting the parameters argument with a new member, "myNewParam":
     *
     *      SceneJS.myNewNode = function() {
     *          var extendedArgs = SceneJS._utils.extendNodeArgs(arguments, { myNewParam : "new param value" });
     *          return SceneJS.someNode.apply(this, extendedArgs);
     *      };
     *
     * If the parameters argument already has a "myNewParam" then this won't replace it, unless you force it's
     * replacement with an override flag like this:
     *
     *      var extendedArgs =  SceneJS._utils.extendNodeArgs(arguments, { myNewParam : "new param value" }, true);
     *
     * @param args The JavaScript Arguments passed to the scene node function
     * @param cfg Each member of these is attached to the config object extracted from the arguments, overriding any member already there
     * @param override When true, the extending parameters will replace any already in the Argument's parameters - false by default
     */
    extendNodeArgs : function(args, cfg, override) {
        if (!args || args.length == 0) {
            return [cfg];
        }
        args = Array.prototype.slice.call(args);
        var arg = args[0];
        if (arg._render) {

            /* First arg is a scene graph node - push override configs in front of it
             */
            args.unshift(cfg);

        } else if (arg instanceof Function) {

            /* First arg is a dynamic configuration function - wrap it and override members on its result
             */
            var func = arg;
            args[0] = function(data) {
                var result = func(data);
                for (var key in cfg) {
                    if (override || !result[key]) {
                        result[key] = cfg[key];
                    }
                }
                return result;
            };
        } else {

            /* First arg is a configuration object - extend it
             */
            for (var key in cfg) {
                if (override || !arg[key]) {
                    arg[key] = cfg[key];
                }
            }
        }
        return args;
    },

    //        invokeNode : function(node, args, extraArgs) {
    //            if (extraArgs) {
    //                return node.apply(this, SceneJS._utils.extendNodeArgs(args, extraArgs));
    //            } else {
    //                return node.apply(this, args);
    //            }
    //        },

    /** Visits child nodes in the given node configuration
     */
    visitChildren : function(config, traversalContext, data) {
        var child;
        if (config.children) {
            var len = config.children.length;

            if (len) {
                for (var i = 0; i < len; i++) {
                    child = config.children[i];
                    child._render.call(child, { // Traversal context
                        appendix : traversalContext.appendix,
                        insideRightFringe: traversalContext.insideRightFringe || (i < len - 1)
                    }, data);
                }
            } else {

                /* Leaf node - if on right fringe of tree then
                 * render appended nodes
                 */
                if (traversalContext.appendix && (!traversalContext.insideRightFringe)) {
                    len = traversalContext.appendix.length;
                    for (var i = 0; i < len; i++) {
                        child = traversalContext.appendix[i];
                        child._render.call(child, { // Traversal context
                            appendix : null,
                            insideRightFringe: (i < len - 1)
                        }, data);
                    }
                }
            }
        }
    },

    /** Visits a selected child node in the given node configuration
     */
    visitChild : function(config, index, traversalContext, data) {
        if (config.children) {
            config.children[index]._render(traversalContext, data);
        }
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


