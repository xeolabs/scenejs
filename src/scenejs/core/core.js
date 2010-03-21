var SceneJS = {
    version: '0.7.0'
};

(function() {

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
            for (var key in o1) {
                if (!o2[key]) {
                    o2[key] = o1[key];
                }
            }
            return o2;
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
        createNode : function(func) {
            return {
                ___isSceneJSNode : true,  // Don't use this name in your node configs!
                func: func
            };
        },

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
                if (arg.___isSceneJSNode) {
                    result.children.push(arg.func);
                } else if (i == 0) {
                    if (arg instanceof Function) {
                        result.getParams = arg;
                        result.fixed = false; // Configs generated by function - probably variable
                    } else {
                        var config = arg;
                        result.getParams = function() {
                            return config;
                        };
                        result.fixed = true;  // Config object - may be constant - node may override if config has function
                    }
                } else {
                    throw new SceneJS.exceptions.InvalidNodeConfigException
                            ('Invalid node parameters - config should be first, IE. node(config, node, node,...)');
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
         *      SceneJs.myNewNode = function() {
         *          var extendedArgs = SceneJs._utils.extendNodeArgs(arguments, { myNewParam : "new param value" });
         *          return SceneJs.someNode.apply(this, extendedArgs);
         *      };
         *
         * If the parameters argument already has a "myNewParam" then this won't replace it, unless you force it's
         * replacement with an override flag like this:
         *
         *      var extendedArgs =  SceneJs._utils.extendNodeArgs(arguments, { myNewParam : "new param value" }, true);
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
            if (arg.___isSceneJSNode) {

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

        invokeNode : function(node, args, extraArgs) {
            if (extraArgs) {
                return node.apply(this, SceneJS._utils.extendNodeArgs(args, extraArgs));
            } else {
                return node.apply(this, args);
            }
        },

        /** Visits child nodes in the given node configuration
         */
        visitChildren : function(config, data) {
            if (config.children) {
                for (var i = 0; i < config.children.length; i++) {
                    config.children[i](data);
                }
            }
        },

        /** Visits a selected child node in the given node configuration
         */
        visitChild : function(config, index, data) {
            if (config.children) {
                config.children[index](data);
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
    },


        /** Registry of modules that provide backend functionality for scene graph nodes
         */
            SceneJS._backends = new (function() {
                var status = {
                    error: null
                };
                var backends = {};

                /** Context shared by all backend modules
                 */
                var ctx = {

                };

                /**
                 * Installs a backend module. If an error occurrs while installing, it will available
                 * via getStatus - we allow query for exceptions instead of throwing from this method
                 * so that we can process them in one place, ie. when we create a scene.
                 */
                this.installBackend = function(id, backend) {
                    if (!status.error) {
                        try {
                            var be = backend(ctx);
                            if (be) {

                                /* Not all backends are registered and available to nodes - some just
                                 * anonymously set up resources on the backend context, wire up event
                                 * handlers etc.
                                 */
                                backends[id] = be;
                            }
                        } catch (e) {
                            status.error = new SceneJS.exceptions.NodeBackendInstallFailedException
                                    ("Failed to install backend module for node type \"" + id + "\": " + (e.message || e), e);
                            throw status.error;
                        }
                    }
                };

                /** Runs the given function in the context of the currently-installed backends, useful for extending them
                 */
                this.extend = function(func) {
                    if (!status.error) {
                        try {
                            func(ctx);
                        } catch (e) {
                            status.error = new SceneJS.exceptions.NodeBackendInstallFailedException
                                    ("Failed to extend backends", e);
                            throw status.error;
                        }
                    }
                };

                /** Returns true if a backend of the given type is installed
                 */
                this.hasBackend = function(type) {
                    var backend = backends[type] ;
                    return (backend != undefined && backend != null);
                };


                /** Obtains the backend module of the given type
                 */
                this.getBackend = function(type) {
                    var backend = backends[type];
                    if (!backend) {
                        throw new SceneJS.exceptions.NodeBackendNotFoundException("No backend installed of type \"" + type + "\"");
                    }
                    return backend;
                };

                /** Returns current SceneJS backend error status
                 */
                this.getStatus = function() {
                    return status;
                };

                /** Clears current SceneJS backend error status
                 */
                this.clearStatus = function() {
                    status = {};
                };

                /** Cleans up all resources currently held by backend modules
                 */
                this.reset = function() {
                    for (var type in backends) {
                        var backend = backends[type];
                        if (backend.reset) {
                            backend.reset();
                        }
                    }
                };
            })();
})
        ();

SceneJS._utils.ns = SceneJS._utils.namespace; // in intellij using keyword "namespace" causes parsing errors
SceneJS._utils.ns("SceneJS");


