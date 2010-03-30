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
                    throw SceneJS.exceptions.NodeConfigExpectedException(
                            nodeName + " property expected: \"" + name + "\"");
                }
                else {
                    return null;
                }
            };
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


/** Private math utilities.
 */
SceneJS._math = {

    divVec3:function(u, v) {
        return [u[0] / v[0], u[1] / v[1], u[2] / v[2]];
    },

    negateVector4: function(v) {
        return [-v[0],-v[1],-v[2],-v[3]];
    },

    addVec4: function (u, v) {
        return [u[0] + v[0],u[1] + v[1],u[2] + v[2],u[3] + v[3]];
    },

    addVec4s: function (v, s) {
        return [v[0] + s,v[1] + s,v[2] + s,v[3] + s];
    },

    addScalarVec4: function(s, v) {
        return SceneJS._math.addVec4s(v, s)
    },

    subVec4: function(u, v) {
        return [u[0] - v[0],u[1] - v[1],u[2] - v[2],u[3] - v[3]];
    },

    subVec3: function(u, v) {
        return [u[0] - v[0],u[1] - v[1],u[2] - v[2]];
    },

    subVec4Scalar: function(v, s) {
        return [v[0] - s,v[1] - s,v[2] - s,v[3] - s];
    },

    subScalarVec4: function(v, s) {
        return [s - v[0],s - v[1],s - v[2],s - v[3]];
    },

    mulVec4: function(u, v) {
        return [u[0] * v[0],u[1] * v[1],u[2] * v[2],u[3] * v[3]];
    },

    mulVec4Scalar:function(v, s) {
        return [v[0] * s,v[1] * s,v[2] * s,v[3] * s];
    },

    divVec4:function(u, v) {
        return [u[0] / v[0],u[1] / v[1],u[2] / v[2],u[3] / v[3]];
    },

    divScalarVec3:function(s, v) {
        return [s / v[0], s / v[1], s / v[2]];
    },


    divVec3s:function(v, s) {
        return [v[0] / s, v[1] / s, v[2] / s];
    },

    divVec4s:function(v, s) {
        return [v[0] / s,v[1] / s,v[2] / s,v[3] / s];
    },

    divScalarVec4:function(s, v) {
        return [s / v[0],s / v[1],s / v[2],s / v[3]];
    },


    dotVector4:function(u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
    },

    cross3Vec4:function(u, v) {
        return [u[1] * v[2] - u[2] * v[1],u[2] * v[0] - u[0] * v[2],u[0] * v[1] - u[1] * v[0],0.0];
    },

    sqLenVec4:function(v) {
        return SceneJS._math.dotVector4(v, v);
    },

    lenVec4:function(v) {
        return Math.sqrt(SceneJS._math.sqLenVec4(v));
    },

    dotVector3:function(u, v) {
        return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
    },

    sqLenVec3:function(v) {
        return SceneJS._math.dotVector3(v, v);
    },

    lenVec3:function(v) {
        return Math.sqrt(SceneJS._math.sqLenVec3(v));
    },

    rcpVec3 : function(v) {
        return SceneJS._math.divScalarVec3(1.0, v);
    },

    normalizeVec4:function(v) {
        var f = 1.0 / SceneJS._math.lenVec4(v);
        return SceneJS._math.mulVec4Scalar(v, f);
    },

    mat4:function() {
        return new Array(16);
    },

    dupMat4:function(m) {
        return m.slice(0, 16);
    },

    getCellMat4:function(m, row, col) {
        return m[row + col * 4];
    },

    setCellMat4:function(m, row, col, s) {
        m[row + col * 4] = s;
    },

    getRowMat4:function(m, r) {
        return [m[r + 0], m[r + 4], m[r + 8], m[r + 12]];
    },

    setRowMat4:function(m, r, v) {
        m[r + 0] = v[0];
        m[r + 4] = v[1];
        m[r + 8] = v[2];
        m[r + 12] = v[3];
    },

    setRowMat4c:function(m, r, x, y, z, w) {
        SceneJS._math.setRowMat4(m, r, [x,y,z,w]);
    },

    setRowMat4s:function(m, r, s) {
        SceneJS._math.setRowMat4c(m, r, s, s, s, s);
    },

    getColMat4:function(m, c) {
        var i = c * 4;
        return [m[i + 0], m[i + 1],m[i + 2],m[i + 3]];
    },

    setColMat4v:function(m, c, v) {
        var i = c * 4;
        m[i + 0] = v[0];
        m[i + 1] = v[1];
        m[i + 2] = v[2];
        m[i + 3] = v[3];
    },

    setColMat4c:function(m, c, x, y, z, w) {
        SceneJS._math.setColMat4v(m, c, [x,y,z,w]);
    },

    setColMat4Scalar:function(m, c, s) {
        SceneJS._math.setColMat4c(m, c, s, s, s, s);
    },

    mat4To3:function(m) {
        return [
            m[0],m[1],m[2],
            m[4],m[5],m[6],
            m[8],m[9],m[10]
        ];
    },

    m4s:function(s) {
        return [
            s,s,s,s,
            s,s,s,s,
            s,s,s,s,
            s,s,s,s
        ];
    },

    setMat4ToZeroes:function() {
        return SceneJS._math.m4s(0.0);
    },

    setMat4ToOnes:function() {
        return SceneJS._math.m4s(1.0);
    },

    diagonalMat4v:function(v) {
        return [
            v[0], 0.0, 0.0, 0.0,
            0.0,v[1], 0.0, 0.0,
            0.0, 0.0, v[2],0.0,
            0.0, 0.0, 0.0, v[3]
        ];
    },

    diagonalMat4c:function(x, y, z, w) {
        return SceneJS._math.diagonalMat4v([x,y,z,w]);
    },

    diagonalMat4s:function(s) {
        return SceneJS._math.diagonalMat4c(s, s, s, s);
    },

    identityMat4:function() {
        return SceneJS._math.diagonalMat4s(1.0);
    },

    isIdentityMat4:function(m) {
        var i = 0;
        var j = 0;
        var s = 0.0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                s = m[i + j * 4];
                if ((i == j)) {
                    if (s != 1.0) {
                        return false;
                    }
                }
                else {
                    if (s != 0.0) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    negateMat4:function(m) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = -m[i];
        }
        return r;
    },

    addMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] + b[i];
        }
        return r;
    },

    addMat4Scalar:function(m, s) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] + s;
        }
        return r;
    },

    addScalarMat4:function(s, m) {
        return SceneJS._math.addMat4Scalar(m, s);
    },

    subMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = a[i] - b[i];
        }
        return r;
    },

    subMat4Scalar:function(m, s) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] - s;
        }
        return r;
    },

    subScalarMat4:function(s, m) {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = s - m[i];
        }
        return r;
    },

    mulMat4:function(a, b) {
        var r = new SceneJS._math.mat4();
        var i = 0;
        var j = 0;
        var k = 0;
        var s = 0.0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                s = 0.0;
                for (k = 0; k < 4; ++k) {
                    s += a[i + k * 4] * b[k + j * 4];
                }
                r[i + j * 4] = s;
            }
        }
        return r;
    },

    mulMat4s:function(m, s)
    {
        var r = new SceneJS._math.mat4();
        for (var i = 0; i < 16; ++i) {
            r[i] = m[i] * s;
        }
        return r;
    },

    mulMat4v4:function(m, v) {
        return [
            m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
            m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
        ];
    },

    transposeMat4:function(m) {
        var r = new SceneJS._math.mat4();
        var i = 0;
        var j = 0;
        for (i = 0; i < 4; ++i) {
            for (j = 0; j < 4; ++j) {
                r[i + j * 4] = m[i * 4 + j];
            }
        }
        return r;
    },

    determinantMat4:function(m) {
        var f = SceneJS._math.getCellMat4;
        return (
                f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) +
                f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) +
                f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) +
                f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) +
                f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) +
                f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3)
                );
    },

    inverseMat4:function(m) {
        var t = new SceneJS._math.mat4();

        var f = SceneJS._math.getCellMat4;

        t[0] = f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) - f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) + f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[1] = f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) + f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) + f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) - f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[2] = f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) + f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) - f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[3] = f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[4] = f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 3);
        t[5] = f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 3);
        t[6] = f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 3);
        t[7] = f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 0) + f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 2);

        t[8] = f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 3);
        t[9] = f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 3);
        t[10] = f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 3);
        t[11] = f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 2);

        t[12] = f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) + f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3);
        t[13] = f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3);
        t[14] = f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3);
        t[15] = f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) + f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2);

        var s = 1.0 / SceneJS._math.determinantMat4(m);
        return SceneJS._math.mulMat4s(t, s);
    },

    traceMat4:function(m) {
        return (m[0] + m[5] + m[10] + m[15]);
    },

    translationMat4v:function(v) {
        var m = SceneJS._math.identityMat4();
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return m;
    },

    translationMat4c:function(x, y, z) {
        return SceneJS._math.translationMat4v([x,y,z]);
    },

    translationMat4s:function(s) {
        return SceneJS._math.translationMat4c(s, s, s);
    },

    rotationMat4v:function(anglerad, axis) {
        var ax = SceneJS._math.normalizeVec4([axis[0],axis[1],axis[2],0.0]);
        var s = Math.sin(anglerad);
        var c = Math.cos(anglerad);
        var q = 1.0 - c;

        var x = ax[0];
        var y = ax[1];
        var z = ax[2];

        var xx,yy,zz,xy,yz,zx,xs,ys,zs;

        xx = x * x;
        yy = y * y;
        zz = z * z;
        xy = x * y;
        yz = y * z;
        zx = z * x;
        xs = x * s;
        ys = y * s;
        zs = z * s;

        var m = new SceneJS._math.mat4();

        m[0] = (q * xx) + c;
        m[1] = (q * xy) + zs;
        m[2] = (q * zx) - ys;
        m[3] = 0.0;

        m[4] = (q * xy) - zs;
        m[5] = (q * yy) + c;
        m[6] = (q * yz) + xs;
        m[7] = 0.0;

        m[8] = (q * zx) + ys;
        m[9] = (q * yz) - xs;
        m[10] = (q * zz) + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    },

    rotationMat4c:function(anglerad, x, y, z) {
        return SceneJS._math.rotationMat4v(anglerad, [x,y,z]);
    },

    scalingMat4v:function(v) {
        var m = SceneJS._math.identityMat4();
        m[0] = v[0];
        m[5] = v[1];
        m[10] = v[2];
        return m;
    },

    scalingMat4c:function(x, y, z) {
        return SceneJS._math.scalingMat4v([x,y,z]);
    },

    scalingMat4s:function(s) {
        return SceneJS._math.scalingMat4c(s, s, s);
    },

    lookAtMat4v:function(pos, target, up) {
        var pos4 = [pos[0],pos[1],pos[2],0.0];
        var target4 = [target[0],target[1],target[2],0.0];
        var up4 = [up[0],up[1],up[2],0.0];

        var v = SceneJS._math.normalizeVec4(SceneJS._math.subVec4(target4, pos4));
        var u = SceneJS._math.normalizeVec4(up4);
        var s = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(v, u));

        u = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(s, v));

        var m = new SceneJS._math.mat4();

        m[0] = s[0];
        m[1] = u[0];
        m[2] = -v[0];
        m[3] = 0.0;

        m[4] = s[1];
        m[5] = u[1];
        m[6] = -v[1];
        m[7] = 0.0;

        m[8] = s[2];
        m[9] = u[2];
        m[10] = -v[2];
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        m = SceneJS._math.mulMat4(m, SceneJS._math.translationMat4v(SceneJS._math.negateVector4(pos4)));

        return m;
    },

    lookAtMat4c:function(posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
        return SceneJS._math.lookAtMat4v([posx,posy,posz], [targetx,targety,targetz], [upx,upy,upz]);
    },

    orthoMat4v:function(omin, omax) {
        var omin4 = [omin[0],omin[1],omin[2],0.0];
        var omax4 = [omax[0],omax[1],omax[2],0.0];
        var vsum = SceneJS._math.addVec4(omax4, omin4);
        var vdif = SceneJS._math.subVec4(omax4, omin4);

        var m = new SceneJS._math.mat4();

        m[0] = 2.0 / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = 2.0 / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = 0.0;
        m[9] = 0.0;
        m[10] = -2.0 / vdif[2];
        m[11] = 0.0;

        m[12] = -vsum[0] / vdif[0];
        m[13] = -vsum[1] / vdif[1];
        m[14] = -vsum[2] / vdif[2];
        m[15] = 1.0;

        return m;
    },

    orthoMat4c:function(left, right, bottom, top, znear, zfar) {
        return SceneJS._math.orthoMat4v([left,bottom,znear], [right,top,zfar]);
    },

    frustumMat4v:function(fmin, fmax) {
        var fmin4 = [fmin[0],fmin[1],fmin[2],0.0];
        var fmax4 = [fmax[0],fmax[1],fmax[2],0.0];
        var vsum = SceneJS._math.addVec4(fmax4, fmin4);
        var vdif = SceneJS._math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJS._math.mat4();

        m[0] = t / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif[0];
        m[9] = vsum[1] / vdif[1];
        m[10] = -vsum[2] / vdif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif[2];
        m[15] = 0.0;

        return m;
    },

    frustumMatrix4:function(left, right, bottom, top, znear, zfar) {
        var fmin4 = [left,right,bottom,0.0];
        var fmax4 = [top,znear,zfar,0.0];
        var vsum = SceneJS._math.addVec4(fmax4, fmin4);
        var vdif = SceneJS._math.subVec4(fmax4, fmin4);
        var t = 2.0 * fmin4[2];

        var m = new SceneJS._math.mat4();

        m[0] = t / vdif[0];
        m[1] = 0.0;
        m[2] = 0.0;
        m[3] = 0.0;

        m[4] = 0.0;
        m[5] = t / vdif[1];
        m[6] = 0.0;
        m[7] = 0.0;

        m[8] = vsum[0] / vdif[0];
        m[9] = vsum[1] / vdif[1];
        m[10] = -vsum[2] / vdif[2];
        m[11] = -1.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = -t * fmax4[2] / vdif[2];
        m[15] = 0.0;

        return m;
    },

    perspectiveMatrix4:function(fovyrad, aspectratio, znear, zfar) {
        var pmin = new Array(4);
        var pmax = new Array(4);

        pmin[2] = znear;
        pmax[2] = zfar;

        pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
        pmin[1] = -pmax[1];

        pmax[0] = pmax[1] * aspectratio;
        pmin[0] = -pmax[0];

        return SceneJS._math.frustumMat4v(pmin, pmax);
    },

    transformPoint3:function(m, p) {
        return [
            (m[0] * p[0]) + (m[4] * p[1]) + (m[8] * p[2]) + m[12],
            (m[1] * p[0]) + (m[5] * p[1]) + (m[9] * p[2]) + m[13],
            (m[2] * p[0]) + (m[6] * p[1]) + (m[10] * p[2]) + m[14],
            (m[3] * p[0]) + (m[7] * p[1]) + (m[11] * p[2]) + m[15]
        ];
    },

    transformPoints3:function(m, points) {
        var result = new Array(points.length);
        var len = points.length;
        for (var i = 0; i < len; i++) {
            result[i] = SceneJS._math.transformPoint3(m, points[i]);
        }
        return result;
    },

    transformVector3:function(m, v) {
        return [
            (m[0] * v[0]) + (m[4] * v[1]) + (m[8] * v[2]),
            (m[1] * v[0]) + (m[5] * v[1]) + (m[9] * v[2]),
            (m[2] * v[0]) + (m[6] * v[1]) + (m[10] * v[2])
        ];
    },

    projectVec4:function(v) {
        var f = 1.0 / v[3];
        return [v[0] * f, v[1] * f, v[2] * f, 1.0];
    },


    Plane3 : function(normal, offset, normalize) {
        this.normal = [0.0, 0.0, 1.0 ];
        this.offset = 0.0;
        if (normal && offset) {
            this.normal[0] = normal[0];
            this.normal[1] = normal[1];
            this.normal[2] = normal[2];
            this.offset = offset;

            if (normalize) {
                var s = Math.sqrt(
                        this.normal[0] * this.normal[0] +
                        this.normal[1] * this.normal[1] +
                        this.normal[2] * this.normal[2]
                        );
                if (s > 0.0) {
                    s = 1.0 / s;
                    this.normal[0] *= s;
                    this.normal[1] *= s;
                    this.normal[2] *= s;
                    this.offset *= s;
                }
            }
        }
    },

    MAX_DOUBLE: 1000000000000.0,
    MIN_DOUBLE: -1000000000000.0,

    Box3: function(min, max) {
        this.min = min || [ SceneJS._math.MAX_DOUBLE,SceneJS._math.MAX_DOUBLE,SceneJS._math.MAX_DOUBLE ];
        this.max = max || [ SceneJS._math.MIN_DOUBLE,SceneJS._math.MIN_DOUBLE,SceneJS._math.MIN_DOUBLE ];

        this.init = function(min, max) {
            for (var i = 0; i < 3; ++i) {
                this.min[i] = min[i];
                this.max[i] = max[i];
            }
            return this;
        };

        this.fromPoints = function(points) {
            var points2 = [];
            for (var i = 0; i < points.length; i++) {
                points2.push([points[i][0] / points[i][3], points[i][1] / points[i][3], points[i][2] / points[i][3]]);
            }
            points = points2;
            for (var i = 0; i < points.length; i++) {
                var v = points[i];
                for (var j = 0; j < 3; j++) {
                    if (v[j] < this.min[j]) {
                        this.min[j] = v[j];
                    }
                    if (v[j] > this.max[j]) {
                        this.max[j] = v[j];
                    }
                }
            }
            return this;
        };

        this.isEmpty = function() {
            return (
                    (this.min[0] >= this.max[0])
                            && (this.min[1] >= this.max[1])
                            && (this.min[2] >= this.max[2])
                    );
        };

        this.getCenter = function() {
            return [
                (this.max[0] + this.min[0]) / 2.0,
                (this.max[1] + this.min[1]) / 2.0,
                (this.max[2] + this.min[2]) / 2.0
            ];
        };

        this.getSize = function() {
            return [
                (this.max[0] - this.min[0]),
                (this.max[1] - this.min[1]),
                (this.max[2] - this.min[2])
            ];
        };

        this.getFacesAreas = function() {
            var s = this.size;
            return [
                (s[1] * s[2]),
                (s[0] * s[2]),
                (s[0] * s[1])
            ];
        };

        this.getSurfaceArea = function() {
            var a = this.getFacesAreas();
            return ((a[0] + a[1] + a[2]) * 2.0);
        };

        this.getVolume = function() {
            var s = this.size;
            return (s[0] * s[1] * s[2]);
        };

        this.getOffset = function(half_delta) {
            for (var i = 0; i < 3; ++i) {
                this.min[i] -= half_delta;
                this.max[i] += half_delta;
            }
            return this;
        };
    },

    AxisBox3 : function(min, max) {
        this.verts = [
            [min[0], min[1], min[2]],
            [max[0], min[1], min[2]],
            [max[0], max[1], min[2]],
            [min[0], max[1], min[2]],

            [min[0], min[1], max[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], max[2]],
            [min[0], max[1], max[2]]
        ];

        this.toBox3 = function() {
            var box = new SceneJS._math.Box3();
            for (var i = 0; i < 8; i++) {
                var v = this.verts[i];
                for (var j = 0; j < 3; j++) {
                    if (v[j] < box.min[j]) {
                        box.min[j] = v[j];
                    }
                    if (v[j] > box.max[j]) {
                        box.max[j] = v[j];
                    }
                }
            }
        };
    },

    Sphere3 : function(center, radius) {
        this.center = [center[0], center[1], center[2] ];
        this.radius = radius;

        this.isEmpty = function() {
            return (this.radius == 0.0);
        };

        this.surfaceArea = function() {
            return (4.0 * Math.PI * this.radius * this.radius);
        };

        this.getVolume = function() {
            return ((4.0 / 3.0) * Math.PI * this.radius * this.radius * this.radius);
        };
    },

    FrustumPlane: function (nx, ny, nz, offset) {
        var s = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
        this.normal = [nx * s, ny * s, nz * s];
        this.offset = offset * s;
        this.testVertex = [
            (this.normal[0] >= 0.0) ? (1) : (0),
            (this.normal[1] >= 0.0) ? (1) : (0),
            (this.normal[2] >= 0.0) ? (1) : (0)];
    },

    OUTSIDE_FRUSTUM : 3,
    INTERSECT_FRUSTUM : 4,
    INSIDE_FRUSTUM : 5,

    Frustum : function(viewMatrix, projectionMatrix, viewport) {
        var math = SceneJS._math;
        var m = math.mulMat4(projectionMatrix, viewMatrix);
        var q = [ m[3], m[7], m[11] ];
        var planes = [
            new math.FrustumPlane(q[ 0] - m[ 0], q[ 1] - m[ 4], q[ 2] - m[ 8], m[15] - m[12]),
            new math.FrustumPlane(q[ 0] + m[ 0], q[ 1] + m[ 4], q[ 2] + m[ 8], m[15] + m[12]),
            new math.FrustumPlane(q[ 0] - m[ 1], q[ 1] - m[ 5], q[ 2] - m[ 9], m[15] - m[13]),
            new math.FrustumPlane(q[ 0] + m[ 1], q[ 1] + m[ 5], q[ 2] + m[ 9], m[15] + m[13]),
            new math.FrustumPlane(q[ 0] - m[ 2], q[ 1] - m[ 6], q[ 2] - m[10], m[15] - m[14]),
            new math.FrustumPlane(q[ 0] + m[ 2], q[ 1] + m[ 6], q[ 2] + m[10], m[15] + m[14])
        ];

        /* Resources for LOD         
         */
        var rotVec = [
            math.getColMat4(viewMatrix, 0),
            math.getColMat4(viewMatrix, 1),
            math.getColMat4(viewMatrix, 2)
        ];

        var scaleVec = [
            math.lenVec4(rotVec[0]),
            math.lenVec4(rotVec[1]),
            math.lenVec4(rotVec[2])
        ];

        var scaleVecRcp = math.rcpVec3(scaleVec);
        var sMat = math.scalingMat4v(scaleVec);
        var sMatInv = math.scalingMat4v(scaleVecRcp);

        rotVec[0] = math.mulVec4Scalar(rotVec[0], scaleVecRcp[0]);
        rotVec[1] = math.mulVec4Scalar(rotVec[1], scaleVecRcp[1]);
        rotVec[2] = math.mulVec4Scalar(rotVec[2], scaleVecRcp[2]);

        var rotMatInverse = math.identityMat4();

        math.setRowMat4(rotMatInverse, 0, rotVec[0]);
        math.setRowMat4(rotMatInverse, 1, rotVec[1]);
        math.setRowMat4(rotMatInverse, 2, rotVec[2]);

        this.matrix = math.mulMat4(projectionMatrix, viewMatrix);
        this.billboardMatrix = math.mulMat4(sMatInv, math.mulMat4(rotMatInverse, sMat));
        this.viewport = viewport.slice(0, 4);

        this.textAxisBoxIntersection = function(box) {
            var ret = SceneJS._math.INSIDE_FRUSTUM;
            var bminmax = [ box.min, box.max ];
            var plane = null;
            for (var i = 0; i < 6; ++i) {
                plane = planes[i];
                if (((plane.normal[0] * bminmax[plane.testVertex[0]][0]) +
                     (plane.normal[1] * bminmax[plane.testVertex[1]][1]) +
                     (plane.normal[2] * bminmax[plane.testVertex[2]][2]) +
                     (plane.offset)) < 0.0) {
                    return SceneJS._math.OUTSIDE_FRUSTUM;
                }

                if (((plane.normal[0] * bminmax[1 - plane.testVertex[0]][0]) +
                     (plane.normal[1] * bminmax[1 - plane.testVertex[1]][1]) +
                     (plane.normal[2] * bminmax[1 - plane.testVertex[2]][2]) +
                     (plane.offset)) < 0.0) {
                    ret = SceneJS._math.INTERSECT_FRUSTUM;
                }
            }
            return ret;
        };


        this.getProjectedSize = function(box) {
            var diagVec = math.subVec3(box.max, box.min);

            var diagSize = math.lenVec3(diagVec);

            var size = Math.abs(diagSize);

            var p0 = [
                (box.min[0] + box.max[0]) * 0.5,
                (box.min[1] + box.max[1]) * 0.5,
                (box.min[2] + box.max[2]) * 0.5,
                0.0];

            var halfSize = size * 0.5;
            var p1 = [ -halfSize, 0.0, 0.0, 1.0 ];
            var p2 = [  halfSize, 0.0, 0.0, 1.0 ];

            p1 = math.mulMat4v4(this.billboardMatrix, p1);
            p1 = math.addVec4(p1, p0);
            p1 = math.projectVec4(math.mulMat4v4(this.matrix, p1));

            p2 = math.mulMat4v4(this.billboardMatrix, p2);
            p2 = math.addVec4(p2, p0);
            p2 = math.projectVec4(math.mulMat4v4(this.matrix, p2));

            return viewport[2] * Math.abs(p2[0] - p1[0]);
        };

    }
};


/** Private WebGL support classes
 */
SceneJS._webgl = {

    /** ID of canvas SceneJS looks for when SceneJS.scene node does not supply one
     */
    DEFAULT_CANVAS_ID : "_scenejs-default-canvas",

    /** ID of element SceneJS looks for when SceneJS.loggingToPage node does not supply one
     */
    DEFAULT_LOGGING_ID : "_scenejs-default-logging",

    /** IDs of supported WebGL canvas contexts
     */
    contextNames : ["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** Maps SceneJS node parameter names to WebGL enum names
     */
    enumMap : {
        funcAdd: "FUNC_ADD",
        funcSubtract: "FUNC_SUBTRACT",
        funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
        zero : "ZERO",
        one : "ONE",
        srcColor:"SRC_COLOR",
        oneMinusSrcColor:"ONE_MINUS_SRC_COLOR",
        dstColor:"DST_COLOR",
        oneMinusDstColor:"ONE_MINUS_DST_COLOR",
        srcAlpha:"SRC_ALPHA",
        oneMinusSrcAlpha:"ONE_MINUS_SRC_ALPHA",
        dstAlpha:"DST_ALPHA",
        oneMinusDstAlpha:"ONE_MINUS_DST_ALPHA",
        contantColor:"CONSTANT_COLOR",
        oneMinusConstantColor:"ONE_MINUS_CONSTANT_COLOR",
        constantAlpha:"CONSTANT_ALPHA",
        oneMinusConstantAlpha:"ONE_MINUS_CONSTANT_ALPHA",
        srcAlphaSaturate:"SRC_ALPHA_SATURATE",
        front: "FRONT",
        back: "BACK",
        frontAndBack: "FRONT_AND_BACK",
        never:"NEVER",
        less:"LESS",
        equal:"EQUAL",
        lequal:"LEQUAL",
        greater:"GREATER",
        notequal:"NOTEQUAL",
        gequal:"GEQUAL",
        always:"ALWAYS",
        cw:"CW",
        ccw:"CCW",
        linear: "LINEAR",
        nearest: "NEAREST",
        linearMipMapNearest : "LINEAR_MIPMAP_NEAREST",
        nearestMipMapNearest : "NEAREST_MIPMAP_NEAREST",
        nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
        linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
        repeat: "REPEAT",
        clampToEdge: "CLAMP_TO_EDGE",
        mirroredRepeat: "MIRRORED_REPEAT",
        alpha:"ALPHA",
        rgb:"RGB",
        rgba:"RGBA",
        luminance:"LUMINANCE",
        luminanceAlpha:"LUMINANCE_ALPHA",
        textureBinding2D:"TEXTURE_BINDING_2D",
        textureBindingCubeMap:"TEXTURE_BINDING_CUBE_MAP",
        compareRToTexture:"COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
        unsignedByte: "UNSIGNED_BYTE"
    },

    fogModes: {
        EXP: 0,
        EXP2: 1,
        LINEAR: 2
    },

    ProgramUniform : function(context, program, name, type, size, location, logging) {
        //  logging.debug("Program uniform found in shader: " + name);
        var func = null;
        if (type == context.BOOL) {
            func = function (v) {
                context.uniform1i(location, v);
            };
        } else if (type == context.BOOL_VEC2) {
            func = function (v) {
                context.uniform2iv(location, v);
            };
        } else if (type == context.BOOL_VEC3) {
            func = function (v) {
                context.uniform3iv(location, v);
            };
        } else if (type == context.BOOL_VEC4) {
            func = function (v) {
                context.uniform4iv(location, v);
            };
        } else if (type == context.INT) {
            func = function (v) {
                context.uniform1iv(location, v);
            };
        } else if (type == context.INT_VEC2) {
            func = function (v) {
                context.uniform2iv(location, v);
            };
        } else if (type == context.INT_VEC3) {
            func = function (v) {
                context.uniform3iv(location, v);
            };
        } else if (type == context.INT_VEC4) {
            func = function (v) {
                context.uniform4iv(location, v);
            };
        } else if (type == context.FLOAT) {
            func = function (v) {
                context.uniform1f(location, v);
            };
        } else if (type == context.FLOAT_VEC2) {
            func = function (v) {
                context.uniform2fv(location, v);
            };
        } else if (type == context.FLOAT_VEC3) {
            func = function (v) {
                context.uniform3fv(location, v);
            };
        } else if (type == context.FLOAT_VEC4) {
            func = function (v) {
                context.uniform4fv(location, v);
            };
        } else if (type == context.FLOAT_MAT2) {
            func = function (v) {
                context.uniformMatrix2fv(location, context.FALSE, v);
            };
        } else if (type == context.FLOAT_MAT3) {
            func = function (v) {
                context.uniformMatrix3fv(location, context.FALSE, v);
            };
        } else if (type == context.FLOAT_MAT4) {
            func = function (v) {
                context.uniformMatrix4fv(location, context.FALSE, v);
            };
        } else {
            throw "Unsupported shader uniform type: " + type;
        }

        this.setValue = function(v) {
            //   alert("setValue " + name + " = " + v);
            func(v);
        };

        this.getValue = function() {
            return context.getUniform(program, location);
        };
    },

    ProgramSampler : function(context, program, name, type, size, location, logging) {
        //  logging.debug("Program sampler found in shader: " + name);
        this.bindTexture = function(texture, unit) {
            texture.bind(unit);
            context.uniform1i(location, unit);
        };
    },

    /** An attribute within a shader
     */
    ProgramAttribute : function(context, program, name, type, size, location, logging) {
        // logging.debug("Program attribute found in shader: " + name);
        this.bindFloatArrayBuffer = function(buffer) {
            context.enableVertexAttribArray(location);
            buffer.bind();
            context.vertexAttribPointer(location, buffer.itemSize, context.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
        };

    },

    /**
     * A vertex/fragment shader in a program
     *
     * @param context WebGL context
     * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
     * @param source Source code for shader
     * @param logging Shader will write logging's debug channel as it compiles
     */
    Shader : function(context, type, source, logging) {
        this.handle = context.createShader(type);

        logging.debug("Creating " + ((type == context.VERTEX_SHADER) ? "vertex" : "fragment") + " shader");
        this.valid = true;

        context.shaderSource(this.handle, source);
        context.compileShader(this.handle);

        if (context.getShaderParameter(this.handle, context.COMPILE_STATUS) != 0) {
            logging.debug("Shader compile succeeded:" + context.getShaderInfoLog(this.handle));
        }
        else {
            this.valid = false;
            logging.error("Shader compile failed:" + context.getShaderInfoLog(this.handle));
        }
        if (!this.valid) {
            throw new SceneJS.exceptions.ShaderCompilationFailureException("Shader program failed to compile");
        }
    },


    /**
     * A program on an active WebGL context
     *
     * @param hash SceneJS-managed ID for program
     * @param lastUsed Time program was lst activated, for LRU cache eviction
     * @param context WebGL context
     * @param vertexSources Source codes for vertex shaders
     * @param fragmentSources Source codes for fragment shaders
     * @param logging Program and shaders will write to logging's debug channel as they compile and link
     */
    Program : function(hash, lastUsed, context, vertexSources, fragmentSources, logging) {
        this.hash = hash;
        this.lastUsed = lastUsed;

        /* Create shaders from sources
         */
        var shaders = [];
        for (var i = 0; i < vertexSources.length; i++) {
            shaders.push(new SceneJS._webgl.Shader(context, context.VERTEX_SHADER, vertexSources[i], logging));
        }
        for (var i = 0; i < fragmentSources.length; i++) {
            shaders.push(new SceneJS._webgl.Shader(context, context.FRAGMENT_SHADER, fragmentSources[i], logging));
        }

        /* Create program, attach shaders, link and validate program
         */
        var handle = context.createProgram();

        for (var i = 0; i < shaders.length; i++) {
            var shader = shaders[i];
            if (shader.valid) {
                context.attachShader(handle, shader.handle);
            }
        }
        context.linkProgram(handle);
        context.validateProgram(handle);

        this.valid = true;
        this.valid = this.valid && (context.getProgramParameter(handle, context.LINK_STATUS) != 0);
        this.valid = this.valid && (context.getProgramParameter(handle, context.VALIDATE_STATUS) != 0);

        logging.debug("Creating shader program: '" + hash + "'");
        if (this.valid) {
            logging.debug("Program link succeeded: " + context.getProgramInfoLog(handle));
        }
        else {
            logging.debug("Program link failed: " + context.getProgramInfoLog(handle));
        }

        if (!this.valid) {
            throw new SceneJS.exceptions.ShaderLinkFailureException("Shader program failed to link");
        }

        /* Discover active uniforms and samplers
         */
        var uniforms = {};
        var samplers = {};

        var numUniforms = context.getProgramParameter(handle, context.ACTIVE_UNIFORMS);

        for (var i = 0; i < numUniforms; ++i) {
            var u = context.getActiveUniform(handle, i);
            if (u) {
                var location = context.getUniformLocation(handle, u.name);
                if ((u.type == context.SAMPLER_2D) || (u.type == context.SAMPLER_CUBE) || (u.type == 35682)) {

                    samplers[u.name] = new SceneJS._webgl.ProgramSampler(
                            context,
                            handle,
                            u.name,
                            u.type,
                            u.size,
                            location,
                            logging);
                } else {
                    uniforms[u.name] = new SceneJS._webgl.ProgramUniform(
                            context,
                            handle,
                            u.name,
                            u.type,
                            u.size,
                            location,
                            logging);
                }
            }
        }

        /* Discover attributes
         */
        var attributes = {};

        var numAttribs = context.getProgramParameter(handle, context.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numAttribs; i++) {
            var a = context.getActiveAttrib(handle, i);
            if (a) {
                var location = context.getAttribLocation(handle, a.name);
                attributes[a.name] = new SceneJS._webgl.ProgramAttribute(
                        context,
                        handle,
                        a.name,
                        a.type,
                        a.size,
                        location,
                        logging);
            }
        }

        this.bind = function() {
            context.useProgram(handle);
        };


        this.setUniform = function(name, value) {
            var u = uniforms[name];
            if (u) {
                u.setValue(value);
            } else {
                //    logging.warn("Shader uniform load failed - uniform not found in shader : " + name);
            }
        };

        this.bindFloatArrayBuffer = function(name, buffer) {
            var attr = attributes[name];
            if (attr) {
                attr.bindFloatArrayBuffer(buffer);
            } else {
                //  logging.warn("Shader attribute bind failed - attribute not found in shader : " + name);
            }
        };

        this.bindTexture = function(name, texture, unit) {
            var sampler = samplers[name];
            if (sampler) {
                sampler.bindTexture(texture, unit);
            } else {
                //  logging.warn("Sampler not found: " + name);
            }
        };

        this.unbind = function() {
            context.useProgram(null);
        };

        this.destroy = function() {
            if (this.valid) {
                logging.debug("Destroying shader program: '" + hash + "'");
                context.deleteProgram(handle);
                for (var s in shaders) {
                    context.deleteShader(shaders[s].handle);
                }
                attributes = null;
                uniforms = null;
                samplers = null;
                this.valid = false;
            }
        };
    },

    Texture2D : function(context, cfg) {
        cfg.logging.debug("Creating texture: '" + cfg.textureId + "'");
        this.canvas = cfg.canvas;
        this.textureId = cfg.textureId;
        this.handle = context.createTexture();
        this.target = context.TEXTURE_2D;
        this.minFilter = cfg.minFilter;
        this.magFilter = cfg.magFilter;
        this.wrapS = cfg.wrapS;
        this.wrapT = cfg.wrapT;

        context.bindTexture(this.target, this.handle);

        if (cfg.image) {

            /* Texture from image
             */
            context.texImage2D(context.TEXTURE_2D, 0, cfg.image, cfg.flipY);

            this.format = context.RGBA;
            this.width = cfg.image.width;
            this.height = cfg.image.height;
            this.isDepth = false;
            this.depthMode = 0;
            this.depthCompareMode = 0;
            this.depthCompareFunc = 0;

        } else {

            /* Texture from data
             */
            if (!cfg.texels) {
                if (cfg.sourceType == context.FLOAT) {
                    cfg.texels = new WebGLFloatArray(cfg.width * cfg.height * 4);
                }
                else {
                    cfg.texels = new WebGLUnsignedByteArray(cfg.width * cfg.height * 4);
                }
            }

            context.texImage2D(context.TEXTURE_2D, 0, cfg.internalFormat, cfg.width, cfg.height, 0, cfg.sourceFormat, cfg.sourceType, cfg.texels);

            if (cfg.isDepth) {
                if (cfg.depthMode) {
                    context.texParameteri(context.TEXTURE_2D, context.DEPTH_TEXTURE_MODE, cfg.depthMode);
                }
                if (cfg.depthCompareMode) {
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_MODE, cfg.depthCompareMode);
                }
                if (cfg.depthCompareFunc) {
                    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_FUNC, cfg.depthCompareFunc);
                }
            }

            this.format = cfg.internalFormat;
            this.width = cfg.width;
            this.height = cfg.height;
            this.isDepth = cfg.isDepth;
            this.depthMode = cfg.depthMode;
            this.depthCompareMode = cfg.depthCompareMode;
            this.depthCompareFunc = cfg.depthCompareFunc;
        }

        if (cfg.minFilter) {
            context.texParameteri(// Filtered technique when scaling texture down
                    context.TEXTURE_2D,
                    context.TEXTURE_MIN_FILTER,
                    cfg.minFilter);
        }

        if (cfg.magFilter) {
            context.texParameteri(// Filtering technique when scaling texture up
                    context.TEXTURE_2D,
                    context.TEXTURE_MAG_FILTER,
                    cfg.magFilter);
        }
        if (cfg.wrapS) {
            context.texParameteri(
                    context.TEXTURE_2D,
                    context.TEXTURE_WRAP_S,
                    cfg.wrapS);
        }

        if (cfg.wrapT) {
            context.texParameteri(
                    context.TEXTURE_2D,
                    context.TEXTURE_WRAP_T,
                    cfg.wrapT);
        }

        /* Generate MIP map if required
         */
        if (cfg.minFilter == context.NEAREST_MIPMAP_NEAREST ||
            cfg.minFilter == context.LINEAR_MIPMAP_NEAREST ||
            cfg.minFilter == context.NEAREST_MIPMAP_LINEAR ||
            cfg.minFilter == context.LINEAR_MIPMAP_LINEAR) {

            context.generateMipmap(context.TEXTURE_2D);
        }

        context.bindTexture(this.target, null);

        //        gl.activeTexture(gl.TEXTURE0);
        //  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        //  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

        this.bind = function(unit) {
            context.activeTexture(context["TEXTURE" + unit]);
            context.bindTexture(this.target, this.handle);

        };

        this.unbind = function(unit) {
            context.activeTexture(context["TEXTURE" + unit]);
            context.bindTexture(this.target, null);
        };

        this.generateMipmap = function() {
            context.generateMipmap(context.TEXTURE_2D);
        };

        this.destroy = function() {
            if (this.handle) {
                cfg.logging.debug("Destroying texture");
                context.deleteTexture(this.handle);
                this.handle = null;
            }
        };
    },

    /** Buffer for vertices and indices
     *
     * @param context  WebGL context
     * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
     * @param values   WebGL array wrapper
     * @param numItems Count of items in array wrapper
     * @param itemSize Size of each item
     * @param usage    Eg. STATIC_DRAW
     */
    ArrayBuffer : function(context, type, values, numItems, itemSize, usage) {
        this.handle = context.createBuffer();
        context.bindBuffer(type, this.handle);
        context.bufferData(type, values, usage);
        context.bindBuffer(type, null);

        this.type = type;
        this.numItems = numItems;
        this.itemSize = itemSize;

        this.bind = function() {
            context.bindBuffer(type, this.handle);
        };

        this.unbind = function() {
            context.bindBuffer(type, null);
        };

        this.destroy = function() {
            context.deleteBuffer(this.handle);
        };
    }
};
/** Basic scene graph node, generally used as a group node.
 */
SceneJS.node = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(data) {
                var params = cfg.getParams();
                var childScope = SceneJS._utils.newScope(data, false);
                if (params) {
                    for (var key in params) {
                        childScope.put(key, params[key]);
                    }
                }
                SceneJS._utils.visitChildren(cfg, childScope || data);
            });
};
/**
 * Classes for exceptions thrown by SceneJS.
 *
 * Exceptions have classes so that they can be discriminated on by application code.
 */

SceneJS.exceptions.WebGLNotSupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeBackendInstallFailedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeConfigExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ShaderCompilationFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ShaderLinkFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ShaderVariableNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoSceneActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoCanvasActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NoShaderActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.CanvasNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.CanvasAlreadyActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidLookAtConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidGeometryConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.UnsupportedOperationException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.IllegalRotateConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.InvalidNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.NodeBackendNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.AssetLoadFailureException = function(msg, uri, proxy) {      // TODO: handle more cases for asset failure?
    this.message = msg + " (uri=\"" + (uri || "null") + "\", proxy=\"" + (proxy || "null") + "\")";
};

SceneJS.exceptions.OutOfVRAMException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.PageLoggingElementNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ColladaParseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ColladaRootNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ColladaRootRequiredException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

SceneJS.exceptions.ProxyNotSpecifiedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};


SceneJS.exceptions.WebGLUnsupportedNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};



/**
 * Backend module that defines SceneJS events and provides an interface on the backend context through which
 * backend modules can fire and subscribe to them.
 *
 * Events are actually somewhat more like commands; they are always synchronous, and are often used to decouple the
 * transfer of data between backends, request events in response, and generally trigger some immediate action.
 *
 * Event subscription can optionally be prioritised, to control the order in which the subscriber will be notified of
 * a given event relative to other suscribers. This is useful, for example, when a backend must be the first to handle
 * an INIT, or the last to handle a RESET.
 *
 */

/**
 * Types of events that occur among backend modules. These are given values by the
 * events backend module when it is installed. When you add your own, just give them
 * a zero value like these ones.
 */
SceneJS._eventTypes = {
    INIT : 0,                           // SceneJS framework initialised
    RESET : 0,                          // SceneJS framework reset

    TIME_UPDATED : 0,                   // System time updated

    SCENE_CREATED : 0,                  // Scene has just been created
    SCENE_ACTIVATED : 0,                // Scene about to be traversed
    SCENE_DEACTIVATED : 0,              // Scene just been completely traversed
    SCENE_DESTROYED : 0,                // Scene just been destroyed

    RENDERER_UPDATED: 0,                // Current WebGL context has been updated to the given state
    RENDERER_EXPORTED: 0,               // Export of the current WebGL context state

    CANVAS_ACTIVATED : 0,
    CANVAS_DEACTIVATED : 0,

    VIEWPORT_UPDATED : 0,               // Viewport updated

    GEOMETRY_EXPORTED : 0,              // Export of geometry for rendering

    MODEL_TRANSFORM_UPDATED : 0,        // Model transform matrix updated
    MODEL_TRANSFORM_EXPORTED : 0,       // Export transform matrix for rendering

    PROJECTION_TRANSFORM_UPDATED : 0,   // 
    PROJECTION_TRANSFORM_EXPORTED : 0,

    VIEW_TRANSFORM_UPDATED : 0,
    VIEW_TRANSFORM_EXPORTED : 0,

    LIGHTS_UPDATED : 0,
    LIGHTS_EXPORTED : 0,

    MATERIAL_UPDATED : 0,
    MATERIAL_EXPORTED : 0,

    TEXTURES_UPDATED : 0,              // Texture activated after a texture node visited
    TEXTURES_EXPORTED : 0,    

    SHADER_ACTIVATE : 0,
    
    SHADER_ACTIVATED : 0,
    SHADER_RENDERING : 0,
    SHADER_DEACTIVATED : 0 ,

    FOG_UPDATED: 0,
    FOG_EXPORTED: 0,

    NAME_UPDATED: 0 ,

    MOUSE_DOWN: 0
};

SceneJS._backends.installBackend(

        "events",

        function(ctx) {

            /* Initialise event types list
             */
            var nevents = 0;
            for (var key in SceneJS._eventTypes) {
                SceneJS._eventTypes[key] = nevents;
                nevents++;
            }
            var events = new Array(nevents);


            /* Interface on backend context
             */
            ctx.events = {

                /**
                 * Registers a handler for the given event
                 *
                 * The handler can be registered with an optional priority number which specifies the order it is
                 * called among the other handler already registered for the event.
                 *
                 * So, with n being the number of commands registered for the given event:
                 *
                 * (priority <= 0)      - command will be the first called
                 * (priority >= n)      - command will be the last called
                 * (0 < priority < n)   - command will be called at the order given by the priority
                 *
                 * @param type Event type - one of the values in SceneJS._eventTypes
                 * @param command - Handler function that will accept whatever parameter object accompanies the event
                 * @param priority - Optional priority number (see above)
                 */
                onEvent: function(type, command, priority) {
                    var list = events[type];
                    if (!list) {
                        list = [];
                        events[type] = list;
                    }
                    var handler = {
                        command: command,
                        priority : (priority == undefined) ? list.length : priority
                    };
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].priority > handler.priority) {
                            list.splice(i, 0, handler);
                            return;
                        }
                    }
                    list.push(handler);
                },

                fireEvent: function(type, params) {
                    var list = events[type];
                    if (list) {
                        for (var i = 0; i < list.length; i++) {
                            list[i].command(params || {});
                        }
                    }
                }
            };
        });
/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 */
SceneJS._backends.installBackend(

        "time",

        function(ctx) {

            var time = (new Date()).getTime();

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        time = (new Date()).getTime();
                        ctx.events.fireEvent(SceneJS._eventTypes.TIME_UPDATED, time);
                    });

            return { // Node-facing API

                getTime: function() {
                    return time;
                }
            };
        });
/**
 * Backend module to provide logging that is aware of the current location of scene traversal.
 *
 * There are three "channels" of log message: error, warning, info and debug.
 *
 * Provides an interface on the backend context through which other backends may log messages.
 *
 * Provides an interface to scene nodes to allow them to log messages, as well as set and get the function
 * that actually processes messages on each channel. Those getters and setters are used by the SceneJS.logging node,
 * which may be distributed throughout a scene graph to cause messages to be processed in particular ways for different
 * parts of the graph.
 *
 * Messages are queued. Initially, each channel has no function set for it and will queue messages until a function is
 * set, at which point the queue flushes.  If the function is unset, subsequent messages will queue, then flush when a
 * function is set again. This allows messages to be logged before any SceneJS.logging node is visited.
 *
 * This backend is always the last to handle a RESET
 *
 */
SceneJS._backends.installBackend(

        "logging",

        function(ctx) {

            var activeSceneId;
            var funcs = null;
            var queues = {};
            var indent = 0;
            var indentStr = "";

            function log(channel, message) {
                message = activeSceneId
                        ? indentStr + activeSceneId + ": " + message
                        : indentStr + message;
                var func = funcs ? funcs[channel] : null;
                if (func) {
                    func(message);
                } else {
                    var queue = queues[channel];
                    if (!queue) {
                        queue = queues[channel] = [];
                    }
                    queue.push(message);
                }
            }

            function flush(channel) {
                var queue = queues[channel];
                if (queue) {
                    var func = funcs ? funcs[channel] : null;
                    if (func) {
                        for (var i = 0; i < queue.length; i++) {
                            func(queue[i]);
                        }
                        queues[channel] = [];
                    }
                }
            }

            ctx.logging = {

                setIndent:function(_indent) {
                    indent = _indent;
                    var indentArray = [];
                    for (var i = 0; i < indent; i++) {
                        indentArray.push("----");
                    }
                    indentStr = indentArray.join("");
                },

                error:function(msg) {
                    log("error", msg);
                } ,

                warn:function(msg) {
                    log("warn", msg);
                },

                info:function(msg) {
                    log("info", msg);
                },

                debug:function(msg) {
                    log("debug", msg);
                }
            };

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED, // Set default logging for scene root
                    function(params) {
                        activeSceneId = params.sceneId;
                        funcs = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_DEACTIVATED, // Set default logging for scene root
                    function() {
                        activeSceneId = null;
                        //funcs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        queues = {};
                        funcs = null;
                    },
                    100000);  // Really low priority - must be reset last

            return { // Node-facing API

                getLogger : function() {
                    return ctx.logging;
                },

                getFuncs: function() {
                    return funcs;
                },

                setFuncs : function(l) {
                    if (l) {
                        funcs = l;
                        for (var channel in queues) {
                            flush(channel);
                        }
                    }
                }
            };
        });
/** Specifies logging for its sub-nodes
 */
SceneJS.logging = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('logging');
    var funcs;
    return SceneJS._utils.createNode(
            function(data) {
                var prevFuncs = backend.getFuncs();
                if (!funcs || !cfg.fixed) {
                    funcs = cfg.getParams(data);
                    var p = prevFuncs || {};
                    funcs.warn = funcs.warn || p.warn;
                    funcs.error = funcs.error || p.error;
                    funcs.debug = funcs.debug || p.debug;
                    funcs.info = funcs.info || p.info;
                }
                backend.setFuncs(funcs);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setFuncs(prevFuncs);
            });
};




SceneJS.loggingToPage = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of loggingToPage nodes is not supported");
    }

    var backend = SceneJS._backends.getBackend('logging');
    var funcs;


    function findElement(elementId) {
        var element;
        if (!elementId) {
            elementId = SceneJS._webgl.DEFAULT_LOGGING_ID;
            element = document.getElementById(elementId);
            if (!element) {
                throw new SceneJS.exceptions.PageLoggingElementNotFoundException
                        ("SceneJs.loggingToPage config 'elementId' omitted and no default element found with ID '"
                                + SceneJS._webgl.DEFAULT_LOGGING_ID + "'");
            }
        } else {
            element = document.getElementById(elementId);
            if (!element) {
                elementId = SceneJS._webgl.DEFAULT_LOGGING_ID;
                element = document.getElementById(elementId);
                if (!element) {
                    throw new SceneJS.exceptions.PageLoggingElementNotFoundException
                            ("SceneJs.loggingToPage config 'elementId' does not match any elements in page and no " +
                             "default element found with ID '" + SceneJS._webgl.DEFAULT_LOGGING_ID + "'");
                }
            }
        }
        return element;
    }

    return SceneJS._utils.createNode(
            function(data) {
                if (!funcs) {
                    var params = cfg.getParams();                  

                    var element = findElement(params.elementId);

                    function log(msg) {
                        element.innerHTML = "<p>" + msg + "</p>";
                    }

                    funcs = {
                        warn : function log(msg) {
                            element.innerHTML += "<p style=\"color:orange;\">" + msg + "</p>";
                        },
                        error : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkred;\">" + msg + "</p>";
                        },
                        debug : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkblue;\">" + msg + "</p>";
                        },
                        info : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkgreen;\">" + msg + "</p>";
                        }
                    };
                }
                var prevFuncs = backend.getFuncs();
                backend.setFuncs(funcs);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setFuncs(prevFuncs);
            });
};
/**
 * Backend module for asynchronous process management.
 *
 * This module creates a "processes" object on the backend context through which other backend modules may
 * create, destroy and query the state of SceneJS processes.
 *
 * This module maintains a separate group of processes for each active scene. When a scene is defined, it
 * will create a group for it, then whenever it is deactivated it will automatically destroy all processes
 * in its group that have timed out.
 */
SceneJS._backends.installBackend(

        "processes",

        function(ctx) {

            var time = (new Date()).getTime();          // System time
            var groups = {};                            // A process group for each existing scene
            var activeSceneId;                          // ID of currently-active scene

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(// Scene defined, create new process group for it
                    SceneJS._eventTypes.SCENE_CREATED,
                    function(params) {
                        var group = {   // IDEA like this
                            sceneId : params.sceneId,
                            processes: {} ,
                            numProcesses : 0
                        };
                        groups[params.sceneId] = group;
                    });

            ctx.events.onEvent(// Scene traversal begins
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function(params) {
                        activeSceneId = params.sceneId;
                    });

            ctx.events.onEvent(// Scene traversed - reap its dead and timed-out processes
                    SceneJS._eventTypes.SCENE_DEACTIVATED,
                    function() {
                        var group = groups[activeSceneId];
                        var processes = group.processes;
                        for (var pid in processes) {
                            var process = processes[pid];
                            if (process) {
                                if (process.destroyed) {
                                    processes[pid] = undefined;
                                    group.numProcesses--;
                                } else {
                                    var elapsed = time - process.timeStarted;
                                    if (elapsed > process.timeout) {
                                        ctx.logging.warn("Process timed out after " +
                                                         (process.timeout / 1000) +
                                                         " seconds: " + process.description);
                                        process.destroyed = true;
                                        processes[pid] = undefined;
                                        group.numProcesses--;
                                        if (process.onTimeout) {
                                            process.onTimeout();
                                        }
                                    } else {
                                        process.timeRunning = elapsed;
                                    }
                                }
                            }
                        }
                        activeSceneId = null;
                    });

            ctx.events.onEvent(// Scene destroyed - destroy its process group
                    SceneJS._eventTypes.SCENE_DESTROYED,
                    function(params) {
                        groups[params.sceneId] = undefined;
                    });

            ctx.events.onEvent(// Framework reset - destroy all process groups
                    SceneJS._eventTypes.RESET,
                    function(params) {
                        groups = {};
                        activeSceneId = null;
                    });

            /**
             * Create object on backend context through which processes
             * may be created, destroyed and queried.
             */
            ctx.processes = {

                /**
                 * Creates a new asynchronous process for the currently active scene and returns a handle to it.
                 * The handle is actually an object containing live information on the process, which must
                 * not be modified.
                 *
                 * Example:
                 *
                 * createProcess({
                 *      description: "loading texture image",
                 *      timeout: 30000,                         // 30 Seconds
                 *      onTimeout(function() {
                 *              alert("arrrg!!");
                 *          });
                 */
                createProcess: function(cfg) {
                    if (!activeSceneId) {
                        throw new SceneJS.exceptions.NoSceneActiveException("No scene active - can't create process");
                    }
                    var group = groups[activeSceneId];
                    var i = 0;
                    while (true) {
                        var pid = activeSceneId + i++;
                        if (!group.processes[pid]) {
                            var process = {
                                sceneId: activeSceneId,
                                id: pid,
                                timeStarted : time,
                                timeRunning: 0,
                                description : cfg.description || "",
                                timeout : cfg.timeout || 30000, // Thirty second default timout
                                onTimeout : cfg.onTimeout
                            };
                            group.processes[pid] = process;
                            group.numProcesses++;
                            ctx.logging.debug("Created process: " + cfg.description);
                            return process;
                        }
                    }
                },

                /**
                 * Destroys the given process, which is the object returned by the previous call to createProcess.
                 * Does not care if no scene is active, or if the process no longer exists or is dead.
                 */
                destroyProcess: function(process) {
                    if (process) {
                        process.destroyed = true;
                        ctx.logging.debug("Destroyed process: " + process.description);
                    }
                },

                /**
                 * Returns the number of living processes for either the scene of the given ID, or if
                 * no ID supplied, the active scene. If no scene is active, returns zero.
                 */
                getNumProcesses : function(sceneId) {
                    var group = groups[sceneId];
                    if (!group) {
                        return 0;
                    }
                    return sceneId ? group.numProcesses : (activeSceneId ? groups[activeSceneId].numProcesses : 0);
                },

                /**
                 * Returns all living processes for the given scene, which may be null, in which case this
                 * method will return the living processes for the currently active scene by default. An empty map
                 * will be returned if there is no scene active.
                 *
                 * Process info looks like this:
                 *
                 *      {   id: "xx",
                 *          timeStarted :   65765765765765,             // System time in milliseconds
                 *          timeRunning:    876870,                     // Elapsed time in milliseconds
                 *          description :   "loading texture image",
                 *          timeout :       30000,                      // Timeout in milliseconds
                 *          onTimeout :     <function>                  // Function that will fire on timeout
                 */
                getProcesses : function(sceneId) {
                    var group = groups[sceneId];
                    if (!group) {
                        return {};
                    }
                    return sceneId ? group.processes : (activeSceneId ? groups[activeSceneId].processes : {});
                }
            };

            /* Node-facing API            
             */
            return {

                getNumProcesses: ctx.processes.getNumProcesses,

                getProcesses: ctx.processes.getProcesses

            };
        });
/**
 * Backend module that services the SceneJS.assets.XXX nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 */
SceneJS._backends.installBackend(

        "load",

        function(ctx) {

            var time = (new Date()).getTime();
            var proxyUri = null;
            var assets = {};                        // Nodes created by parsers, cached against file name

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        assets = {};
                    });

            function jsonp(fullUri, callbackName, onLoad) {
                var head = document.getElementsByTagName("head")[0];
                var script = document.createElement("script");
                script.type = "text/javascript";
                window[callbackName] = function(data) {
                    onLoad(data);
                    window[callbackName] = undefined;
                    try {
                        delete window[callbackName];
                    } catch(e) {
                    }
                    head.removeChild(script);
                };
                head.appendChild(script);
                script.src = fullUri;  // Request fires now
            }

            /** Loads asset and caches it against uri
             */
            function _loadAsset(uri, serverParams, callbackName, parser, onSuccess, onError) {
                var url = [proxyUri, "?callback=", callbackName , "&uri=" + uri];
                for (var param in serverParams) { // TODO: memoize string portion that contains params
                    url.push("&", param, "=", serverParams[param]);
                }
                jsonp(url.join(""),
                        callbackName,
                        function(data) {    // onLoad
                            if (!data) {
                                onError("server response is empty");
                            } else {
                                var assetNode = parser(
                                        data,
                                        function(msg) {
                                            onError(msg);
                                        });
                                if (!assetNode) {
                                    onError("asset node's parser returned null result");
                                } else {
                                    assets[uri] = {
                                        uri: uri, // Asset idenitifed by URI
                                        node: assetNode,
                                        lastUsed: time
                                    };

                                    onSuccess(assetNode);
                                }
                            }
                        });
            }

            return { // Node-facing API

                setProxy: function(_proxyUri) {
                    proxyUri = _proxyUri;
                },

                /** Atempts to get currently-loaded asset, which may have been evicted, in which case
                 * node should then just call loadAsset to re-load it.
                 */
                getAsset : function(uri) {
                    var asset = assets[uri];
                    if (asset) {
                        asset.lastUsed = time;
                        return asset.node;
                    }
                    return null;
                },

                /**
                 * Triggers asynchronous JSONP load of asset and creates new process; callback will fire with new child for the
                 * client asset node. The asset node will have to then call assetLoaded to notify the backend that the
                 * asset has loaded and allow backend to kill the process.
                 *
                 * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
                 *
                 * @uri Location of asset
                 * @serverParams Request parameters for proxy
                 * @parser Processes asset data on load
                 * @onSuccess Callback through which processed asset data is returned
                 * @onTimeout Callback invoked when no response from proxy
                 * @onError Callback invoked when error reported by proxy
                 */
                loadAsset : function(uri, serverParams, parser, onSuccess, onTimeout, onError) {
                    if (!proxyUri) {
                        throw new SceneJS.exceptions.ProxyNotSpecifiedException
                                ("SceneJS.load node expects you to provide a 'proxy' configuration on the SceneJS.scene root node");
                    }
                    ctx.logging.debug("Loading asset from " + uri);
                    var process = ctx.processes.createProcess({
                        onTimeout: function() {  // process killed automatically on timeout
                            ctx.logging.error(
                                    "Asset load failed - timed out waiting for a reply " +
                                    "(incorrect proxy URI?) - proxy: " + proxyUri +
                                    ", uri: " + uri);
                            onTimeout();
                        },
                        description:"asset load: proxy = " + proxyUri + ", uri = " + uri
                    });
                    var callbackName = "callback" + process.id; // Process ID is globally unique
                    _loadAsset(
                            uri,
                            serverParams,
                            callbackName,
                            parser,
                            onSuccess,
                            function(msg) {  // onError
                                ctx.processes.destroyProcess(process);
                                onError(msg);
                            });
                    return process;
                },

                /** Notifies backend that load has completed; backend then kills the process.
                 */
                assetLoaded : function(process) {
                    ctx.processes.destroyProcess(process);
                }
            };
        });
/** Asynchronously loads a subgraph cross-domain. This node is configured with the location of a file
 * that describes the subgraph. When first visited, it will start the load, then finish the load and
 * integrate the subgraph on a future visit.
 *
 * Can be configured with child nodes to visit while the load is in progress, which will be replaced by
 * the loaded subgraph.
 */
SceneJS.load = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of SceneJS.load nodes is not supported");
    }
    var params;

    var backend = SceneJS._backends.getBackend("load");
    var logging = SceneJS._backends.getBackend("logging");
    var process = null;
    var assetNode;

    const STATE_INITIAL = 0;        // Ready to start load
    const STATE_LOADING = 2;        // Load in progress
    const STATE_LOADED = 3;         // Load completed
    const STATE_ATTACHED = 4;       // Subgraph integrated
    const STATE_ERROR = -1;         // Asset load or texture creation failed

    var state = STATE_INITIAL;

    function sceneJSParser(data, onError) {
        if (!data.___isSceneJSNode) {
            onError(data.error || "unknown server error");
            return null;
        } else {
            return data;
        }
    }

    function visitSubgraph(params, data) {
        if (params) { // Parameters for asset - supply in a new child data
            var childScope = SceneJS._utils.newScope(data, cfg.fixed);
            for (var key in params.params) {
                childScope.put(key, params.params[key]);
            }
            assetNode.func.call(this, childScope);
        } else {
            assetNode.func.call(this, data);
        }
    }

    return SceneJS._utils.createNode(
            function(data) {

                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.uri) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Mandatory SceneJS.load parameter missing: uri");
                    }                 
                }

                if (state == STATE_ATTACHED) {
                    if (!backend.getAsset(params.uri)) {
                        state = STATE_INITIAL;
                    }
                }

                switch (state) {
                    case STATE_ATTACHED:
                        visitSubgraph(params.params, data);
                        break;

                    case STATE_LOADING:
                        break;

                    case STATE_LOADED:
                        backend.assetLoaded(process);  // Finish loading - kill process
                        process = null;
                        state = STATE_ATTACHED;
                        visitSubgraph(params.params, data);
                        break;

                    case STATE_INITIAL:
                        state = STATE_LOADING;
                        process = backend.loadAsset(// Process killed automatically on error or abort
                                params.uri,
                                params.serverParams || {
                                    format: "scenejs"
                                },
                                params.parser || sceneJSParser,
                                function(asset) { // Success
                                    assetNode = asset;   // Asset is wrapper created by SceneJS._utils.createNode
                                    state = STATE_LOADED;
                                },
                                function() { // onTimeout
                                    state = STATE_ERROR;                                 
                                },
                                function(msg) { // onError - backend has killed process
                                    state = STATE_ERROR;
                                    logging.getLogger().error(
                                            "SceneJS.load failed - " + msg + " - uri: " + params.uri);
                                });

                        SceneJS._utils.visitChildren(cfg, data);
                        break;

                    case STATE_ERROR:
                        SceneJS._utils.visitChildren(cfg, data);
                        break;
                }
            });
};
/**
 * Backend for a scene node.
 */
SceneJS._backends.installBackend(

        "scene",

        function(ctx) {

            var initialised = false; // True as soon as first scene registered
            var scenes = {};
            var nScenes = 0;
            var activeSceneId;

            var projMat;
            var viewMat;
            var picking;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            function updatePick() {

            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(params) {
                        projMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                    });

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             *
             * If canvasId is null, will fall back on SceneJS._webgl.DEFAULT_CANVAS_ID
             */
            var findCanvas = function(canvasId) {
                var canvas;
                if (!canvasId) {
                    ctx.logging.info("SceneJS.scene config 'canvasId' omitted - looking for default canvas with ID '"
                            + SceneJS._webgl.DEFAULT_CANVAS_ID + "'");
                    canvasId = SceneJS._webgl.DEFAULT_CANVAS_ID;
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        throw new SceneJS.exceptions.CanvasNotFoundException
                                ("SceneJs.scene config 'canvasId' omitted and could not find default canvas with ID '"
                                        + SceneJS._webgl.DEFAULT_CANVAS_ID + "'");
                    }
                } else {
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        ctx.logging.info("SceneJS.scene config 'canvasId' unresolved - looking for default canvas with " +
                                         "ID '" + SceneJS._webgl.DEFAULT_CANVAS_ID + "'");
                        canvasId = SceneJS._webgl.DEFAULT_CANVAS_ID;
                        canvas = document.getElementById(canvasId);
                        if (!canvas) {
                            throw new SceneJS.exceptions.CanvasNotFoundException
                                    ("SceneJs.scene config 'canvasId' does not match any elements in the page and no " +
                                     "default canvas found with ID '" + SceneJS._webgl.DEFAULT_CANVAS_ID + "'");
                        }
                    }
                }
                var context;
                var contextNames = SceneJS._webgl.contextNames;
                for (var i = 0; (!context) && i < contextNames.length; i++) {
                    try {
                        context = canvas.getContext(contextNames[i]);
                    } catch (e) {

                    }
                }
                if (!context) {
                    throw new SceneJS.exceptions.WebGLNotSupportedException
                            ('Canvas document element with ID \''
                                    + canvasId
                                    + '\' failed to provide a supported WebGL context');
                }
                context.clearColor(0.0, 0.0, 0.0, 1.0);
                context.clearDepth(1.0);
                context.enable(context.DEPTH_TEST);
                context.disable(context.CULL_FACE);
                context.disable(context.TEXTURE_2D);
                context.depthRange(0, 1);
                context.disable(context.SCISSOR_TEST);
                return {
                    canvas: canvas,
                    context: context,
                    canvasId : canvasId
                };
            };

            function createPickBuffer(context) {
                var buffer = {
                    frameBuffer : context.createFramebuffer(),
                    renderBuffer : context.createRenderbuffer(),
                    texture : context.createTexture()
                };
                context.bindTexture(context.TEXTURE_2D, buffer.texture);
                try { // Null may be OK with some browsers - thanks Paul
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, null);
                } catch (e) {
                    var texture = new WebcontextUnsignedByteArray(3);
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, texture);
                }
                context.bindFramebuffer(context.FRAMEBUFFER, buffer.frameBuffer);
                context.bindRenderbuffer(context.RENDERBUFFER, buffer.renderBuffer);
                context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT, 1, 1);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.framebufferTexture2D(
                        context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, buffer.texture, 0);
                context.framebufferRenderbuffer(
                        context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, buffer.renderBuffer);
                context.bindFramebuffer(context.FRAMEBUFFER, null);
                return buffer;
            }

            function activatePickBuffer(context, buffer) {
                context.bindFramebuffer(context.FRAMEBUFFER, buffer.framePickBuffer);
                context.viewport(0, 0, 1, 1);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.disable(context.BLEND);
            }

            function getPick(context, buffer) {
                var data = context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
                if (data.data) {
                    data = data.data; // TODO: hack for firefox
                }
                var id = data[0] + data[1] * 256;
                context.bindFramebuffer(context.FRAMEBUFFER, null);
                return id;
            }

            function pick(x, y) {
                //get camera space coords
                var origmatrix = this.camera.matrix;
                var origpmatrix = this.camera.pMatrix;
                xcoord = -( ( ( 2 * x ) / this.renderer.canvas.width ) - 1 ) / this.camera.pMatrix.e(1, 1);
                ycoord = ( ( ( 2 * y ) / this.renderer.canvas.height ) - 1 ) / this.camera.pMatrix.e(2, 2);
                zcoord = 1;
                if (this.camera.type == GLGE.C_PERSPECTIVE) {
                    var coord = [xcoord,ycoord,zcoord,0];
                    coord = this.camera.matrix.inverse().x(coord);
                    var cameraPos = this.camera.getPosition();
                    var zvec = coord.toUnitVector();
                    var xvec = (new GLGE.Vec([0,0,1])).cross(zvec).toUnitVector();
                    var yvec = zvec.cross(xvec).toUnitVector();
                    this.camera.matrix = new GLGE.Mat([xvec.e(1), yvec.e(1), zvec.e(1), cameraPos.x,
                        xvec.e(2), yvec.e(2), zvec.e(2), cameraPos.y,
                        xvec.e(3), yvec.e(3), zvec.e(3), cameraPos.z,
                        0, 0, 0, 1]).inverse();
                }
                if (this.camera.type == GLGE.C_ORTHO) {
                    this.camera.matrix = this.camera.matrix.inv().x(GLGE.translateMatrix(-xcoord, -ycoord, 0)).inv();
                }
                this.camera.pMatrix = GLGE.makeOrtho(-0.0001, 0.0001, -0.0001, 0.0001, this.camera.near, this.camera.far);
                //render for picking
                var gl = this.renderer.gl;
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framePickBuffer);
                gl.viewport(0, 0, 1, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                this.renderer.gl.disable(this.renderer.gl.BLEND);

                for (var i = 0; i < this.objects.length; i++) {
                    this.objects[i].GLRender(this.renderer.gl, GLGE.RENDER_PICK);
                }
                var data = gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE);
                //TODO: firefox hack :-( remove when fixed!
                if (data.data) data = data.data;
                var index = data[0] + data[1] * 256;
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);

                //revert the view matrix
                this.camera.matrix = origmatrix;
                this.camera.pMatrix = origpmatrix;

                if (index > 0) {
                    return this.objects[index - 1];
                } else {
                    return false;
                }

            }


            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene, params) {
                    if (!initialised) {
                        ctx.logging.info("SceneJS V" + SceneJS.version + " initialised");
                        ctx.events.fireEvent(SceneJS._eventTypes.INIT);
                    }
                    var canvas = findCanvas(params.canvasId); // canvasId can be null
                    var sceneId = SceneJS._utils.createKeyForMap(scenes, "scene");
                    scenes[sceneId] = {
                        sceneId: sceneId,
                        scene:scene,
                        canvas: canvas
                    };
                    nScenes++;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_CREATED, {sceneId : sceneId });
                    ctx.logging.info("Scene defined: " + sceneId);
                    return sceneId;
                },

                /** Deregisters scene
                 */
                deregisterScene :function(sceneId) {
                    scenes[sceneId] = null;
                    nScenes--;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DESTROYED, {sceneId : sceneId });
                    if (activeSceneId == sceneId) {
                        activeSceneId = null;
                    }
                    ctx.logging.info("Scene destroyed: " + sceneId);
                    if (nScenes == 0) {
                        ctx.logging.info("SceneJS reset");
                        ctx.events.fireEvent(SceneJS._eventTypes.RESET);

                    }
                },

                /** Specifies which registered scene is the currently active one
                 */
                activateScene : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, scene.canvas);
                },

                /** Returns the canvas element the given scene is bound to
                 */
                getSceneCanvas : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    return scene.canvas.canvas;
                },
                //
                //                activatePick : function(sceneId) {
                //
                //                },

                /** Returns all registered scenes
                 */
                getAllScenes:function() {
                    var list = [];
                    for (var id in scenes) {
                        var scene = scenes[id];
                        if (scene) {
                            list.push(scene.scene);
                        }
                    }
                    return list;
                },

                /** Finds a registered scene
                 */
                getScene : function(sceneId) {
                    return scenes[sceneId].scene;
                },

                /** Deactivates the currently active scene and reaps destroyed and timed out processes
                 */
                deactivateScene : function() {
                    if (!activeSceneId) {
                        throw "Internal error: no scene active";
                    }
                    var sceneId = activeSceneId;
                    activeSceneId = null;
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED, scene.canvas);
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    //ctx.logging.info("Scene deactivated: " + sceneId);

                }
            };
        });
/**
 * Root node of a scene graph. Like all nodes, its arguments are an optional config object followed by
 * zero or more child nodes. The members of the config object are set on the root data data when rendered.
 *
 */

(function() {

    var backend = SceneJS._backends.getBackend('scene');
    var loadBackend = SceneJS._backends.getBackend('load');
    var processesBackend = SceneJS._backends.getBackend('processes');

    /** Creates a new scene
     */
    SceneJS.scene = function() {

        /* Check that backend modules installed OK
         */
        if (SceneJS._backends.getStatus().error) {
            throw SceneJS._backends.getStatus().error;
        }

        var cfg = SceneJS._utils.getNodeConfig(arguments);
        if (!cfg.fixed) {
            throw new SceneJS.exceptions.UnsupportedOperationException
                    ("Dynamic configuration of SceneJS.scene nodes is not supported");
        }
        var params = cfg.getParams();

        var sceneId = null; // Unique ID for this scene graph - null again as soon as scene destroyed

        /* Create, register and return the scene graph
         */
        var _scene = {

            /** Returns the canvas element that this scene is bound to. When no canvasId was configured, it will be one
             * that SceneJS selected by default, hence the need to use this method to get the canvas through the scene
             * node rather than assume its ID.
             */
            getCanvas : function() {
                if (!sceneId) {
                    return null;
                }
                return backend.getSceneCanvas(sceneId);
            },

            /**
             * Renders the scene, passing in the given parameters to override any node parameters
             * that were set on the config.
             */
            render : function(paramOverrides) {
                if (sceneId) {
                    backend.activateScene(sceneId);
                    var data = SceneJS._utils.newScope(null, false); // TODO: how to determine fixed data for cacheing??
                    if (paramOverrides) {        // Override with traversal params
                        for (var key in paramOverrides) {
                            data.put(key, paramOverrides[key]);
                        }
                    }
                    if (params.proxy) {
                        loadBackend.setProxy(params.proxy);
                    }
                    SceneJS._utils.visitChildren(cfg, data);
                    loadBackend.setProxy(null);
                    backend.deactivateScene();
                }
            },

            pick : function(paramOverrides, canvasX, canvasY) {
                if (sceneId) {
                    try {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_PICKING;
                        backend.activateScene(sceneId);
                        var data = SceneJS._utils.newScope(null, false);
                        if (paramOverrides) {        // Override with traversal params
                            for (var key in paramOverrides) {
                                data.put(key, paramOverrides[key]);
                            }
                        }
                        if (params.proxy) {
                            loadBackend.setProxy(params.proxy);
                        }
                        SceneJS._utils.visitChildren(cfg, data);
                        loadBackend.setProxy(null);
                        backend.deactivateScene();
                    } finally {
                        SceneJS._utils.traversalMode = SceneJS._utils.TRAVERSAL_MODE_RENDER;
                    }
                }
            },

            /**
             * Returns count of active processes. A non-zero count indicates that the scene should be rendered
             * at least one more time to allow asynchronous processes to complete - since processes are
             * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
             * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
             * a race condition.
             */
            getNumProcesses : function() {
                return (sceneId) ? processesBackend.getNumProcesses(sceneId) : 0;
            },

            /** Destroys this scene, after which it cannot be rendered any more. You should destroy
             * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
             * resources for it (eg. shaders, VBOs etc) that are no longer in use.
             */
            destroy : function() {
                if (sceneId) {
                    backend.deregisterScene(sceneId); // Last one fires RESET command
                    sceneId = null;
                }
            },

            /** Returns true if scene active, ie. not destroyed
             */
            isActive: function() {
                return (sceneId != null);
            }
        };

        /* Register scene - fires a SCENE_CREATED event
         */
        sceneId = backend.registerScene(_scene, params);

        return _scene;
    };

    /** Total SceneJS reset - destroys all scenes and cached resources.
     */
    SceneJS.reset = function() {
        var scenes = backend.getAllScenes();
        var temp = [];
        for (var i = 0; i < scenes.length; i++) {
            temp.push(scenes[i]);
        }
        while (temp.length > 0) {

            /* Destroy each scene individually so it they can mark itself as destroyed.
             * A RESET command will be fired after the last one is destroyed.
             */
            temp.pop().destroy();
        }
    };
})();
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
 */
SceneJS._backends.installBackend(

        "memory",

        function(ctx) {

            var canvas;                 // Used for testing for error conditions
            var evictors = [];          // Eviction function for each client
            var iEvictor = 0;           // Fair eviction policy - don't keep starting polling at first evictor

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                    });

            ctx.events.onEvent(// Framework reset - start next polling at first evictor
                    SceneJS._eventTypes.RESET,
                    function() {
                        canvas = null;
                        iEvictor = 0;
                    });

            /**
             * Polls each registered evictor backend to evict something. Stops on the first one to
             * comply. When called again, resumes at the next in sequence to ensure fairness.
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
                        ctx.logging.warn("Evicted least-used item from memory");
                        return true;
                    } else {
                        tries++;
                        if (tries == evictors.length) {
                            return false;
                        }
                    }
                }
            }

            function outOfMemory(description) {
                ctx.logging.error("Memory allocation failed");
                throw new SceneJS.exceptions.OutOfVRAMException(
                        "Out of memory - failed to allocate memory for " + description);
            }

            ctx.memory = {

                /**
                 * Volunteers the caller as an evictor that is willing to attempt to free some memory when polled
                 * by this module as memory runs low. The given evict callback is to attempt to free some memory
                 * held by the caller, and should return true on success else false.
                 */
                registerEvictor: function(evict) {
                    evictors.push(evict);
                },

                /**
                 * Attempt allocation of some memory for the caller. This method does not return anything - the
                 * tryAllocate callback is to wrap the allocation attempt and provide the result to the caller via
                 * a closure, IE. not return it.
                 */
                allocate: function(description, tryAllocate) {
                    ctx.logging.debug("Allocating memory for: " + description);
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException
                                ("No canvas active - failed to allocate shader memory");
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
                                throw e; // We only handle out-of-memory error here
                            }
                            if (++tries > maxTries || !evict()) { // Too many tries or no cacher wants to evict
                                outOfMemory(description);
                            }
                        }
                    }
                }
            };
        });




/**
 * This backend encapsulates shading behind an event API.
 *
 * By listening to XXX_UPDATED events, this backend tracks various elements of scene state, such as WebGL settings,
 * texture layers, lighting, current material properties etc.
 *
 * On a SHADER_ACTIVATE event it will compose and activate a shader taylored to the current scene state
 * (ie. where the shader has variables and routines for the current lights, materials etc), then fire a
 * SHADER_ACTIVATED event when the shader is ready for business.
 *
 * Other backends will then handle the SHADER_ACTIVATED event by firing XXXXX_EXPORTED events parameterised with
 * resources that they want loaded into the shader. This backend then handles those by loading their parameters into
 * the shader.
 *
 * The backend will avoid constant re-generation of shaders by caching each of them against a hash code that it
 * derives from the current collective scene state; on a SHADER_ACTIVATE event, it will attempt to reuse a shader
 * cached for the hash of the current scene state.
 *
 * Shader allocation and LRU cache eviction is mediated by the "memory" backend.
 */
SceneJS._backends.installBackend(

        "shader",

        function(ctx) {

            var time = (new Date()).getTime();      // For LRU caching
            var canvas;                             // Currently active canvas
            var rendererState;                      // WebGL settings state
            var programs = {};                      // Program cache
            var activeProgram = null;               // Currently active program
            var lights = [];                        // Current lighting state
            var material = {};                      // Current material state
            var namedItem;                          // Current named item
            var fog = null;                         // Current fog
            var textureLayers = [];                 // Texture layers are pushed/popped to this as they occur
            var sceneHash;                          // Current hash of collective scene state pertenant to shaders

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        for (var programId in programs) {  // Just free allocated programs
                            programs[programId].destroy();
                        }
                        programs = {};
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        rendererState = null;
                        activeProgram = null;
                        lights = [];
                        material = {};
                        textureLayers = [];
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        activeProgram = null;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        activeProgram = null;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RENDERER_UPDATED,
                    function(_rendererState) {
                        rendererState = _rendererState;  // Canvas change will be signified by a CANVAS_UPDATED
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RENDERER_EXPORTED,
                    function(_rendererState) {

                        /* Default ambient material colour is taken from canvas clear colour
                         */
                        var clearColor = _rendererState.clearColor;
                        activeProgram.setUniform("uAmbient",
                                clearColor
                                        ? [clearColor.r, clearColor.g, clearColor.b]
                                        : [0, 0, 0]);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURES_UPDATED,
                    function(stack) {
                        textureLayers = stack;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.TEXTURES_EXPORTED,
                    function(stack) {
                        for (var i = 0; i < stack.length; i++) {
                            var layer = stack[i];
                            activeProgram.bindTexture("uSampler" + i, layer.texture, i);
                            if (layer.params.matrixAsArray) {
                                activeProgram.setUniform("uLayer" + i + "Matrix", layer.params.matrixAsArray);
                            }
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_UPDATED,
                    function(l) {
                        lights = l;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.LIGHTS_EXPORTED,
                    function(_lights) {
                        for (var i = 0; i < _lights.length; i++) {
                            var light = _lights[i];

                            activeProgram.setUniform("uLightColor" + i, light.color);
                            activeProgram.setUniform("uLightDiffuse" + i, light.diffuse);

                            activeProgram.setUniform("uLightPos" + i, light.pos);
                            activeProgram.setUniform("uLightSpotDir" + i, light.spotDir);

                            if (light.type == "spot") {
                                activeProgram.setUniform("uLightSpotCosCutOff" + i, light.spotCosCutOff);
                                activeProgram.setUniform("uLightSpotExp" + i, light.spotExponent);
                            }

                            activeProgram.setUniform("uLightAttenuation" + i,
                                    [
                                        light.constantAttenuation,
                                        light.linearAttenuation,
                                        light.quadraticAttenuation
                                    ]);
                        }
                    });


            ctx.events.onEvent(
                    SceneJS._eventTypes.MATERIAL_UPDATED,
                    function(m) {
                        material = m;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MATERIAL_EXPORTED,
                    function(m) {
                        activeProgram.setUniform("uMaterialBaseColor", m.baseColor);
                        activeProgram.setUniform("uMaterialSpecularColor", m.specularColor);

                        activeProgram.setUniform("uMaterialSpecular", m.specular);
                        activeProgram.setUniform("uMaterialShine", m.shine);
                        activeProgram.setUniform("uMaterialEmit", m.emit);
                        activeProgram.setUniform("uMaterialAlpha", m.alpha);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.FOG_UPDATED,
                    function(f) {
                        fog = f;
                        sceneHash = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.FOG_EXPORTED,
                    function(f) {
                        activeProgram.setUniform("uFogColor", f.color);
                        activeProgram.setUniform("uFogDensity", f.density);
                        activeProgram.setUniform("uFogStart", f.start);
                        activeProgram.setUniform("uFogEnd", f.end);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MODEL_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uMMatrix", transform.matrixAsArray);
                        activeProgram.setUniform("uMNMatrix", transform.normalMatrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uVMatrix", transform.matrixAsArray);
                        activeProgram.setUniform("uVNMatrix", transform.normalMatrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_EXPORTED,
                    function(transform) {
                        activeProgram.setUniform("uPMatrix", transform.matrixAsArray);
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.GEOMETRY_EXPORTED,
                    function(geo) {
                        activeProgram.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                        activeProgram.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                        if (geo.texCoordBuf && textureLayers.length > 0 && rendererState.enableTexture2D) {
                            activeProgram.bindFloatArrayBuffer("aTextureCoord", geo.texCoordBuf);
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATE, // Request to activate a shader
                    function() {
                        activateProgram();
                    });


            ctx.events.onEvent(
                    SceneJS._eventTypes.NAME_UPDATED,
                    function(n) {
                        namedItem = n;
                    });

            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time;
                        var programToEvict;
                        for (var hash in programs) {
                            if (hash) {
                                var program = programs[hash];

                                /* Avoiding eviction of shader just used,
                                 * currently in use, or likely about to use
                                 */
                                if (program.lastUsed < earliest && program.hash != sceneHash) {
                                    programToEvict = program;
                                    earliest = programToEvict.lastUsed;
                                }
                            }
                        }
                        if (programToEvict) { // Delete LRU program's shaders and deregister program
                            ctx.logging.info("Evicting shader: " + hash);
                            programToEvict.destroy();
                            programs[programToEvict.hash] = null;
                            return true;
                        }
                        return false;   // Couldnt find suitable program to delete
                    });

            function activateProgram() {
                if (!canvas) {
                    throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                }

                if (!sceneHash) {
                    generateHash();
                }

                if (!activeProgram || activeProgram.hash != sceneHash) {
                    if (activeProgram) {
                        canvas.context.flush();
                        activeProgram.unbind();
                        activeProgram = null;
                        ctx.events.fireEvent(SceneJS._eventTypes.SHADER_DEACTIVATED);
                    }

                    if (!programs[sceneHash]) {
                        ctx.logging.info("Creating shader: '" + sceneHash + "'");
                        var vertexShaderSrc = composeRenderingVertexShader();
                        var fragmentShaderSrc = composeRenderingFragmentShader();
                        ctx.memory.allocate(
                                "shader",
                                function() {
                                    try {
                                        programs[sceneHash] = new SceneJS._webgl.Program(
                                                sceneHash,
                                                time,
                                                canvas.context,
                                                [vertexShaderSrc],
                                                [fragmentShaderSrc],
                                                ctx.logging);
                                    } catch (e) {
                                        ctx.logging.debug("Vertex shader:");
                                        ctx.logging.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                                        ctx.logging.debug("Fragment shader:");
                                        ctx.logging.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                                        throw e;
                                    }
                                });
                    }
                    activeProgram = programs[sceneHash];
                    activeProgram.lastUsed = time;
                    activeProgram.bind();
                    ctx.events.fireEvent(SceneJS._eventTypes.SHADER_ACTIVATED);
                }

                ctx.events.fireEvent(SceneJS._eventTypes.SHADER_RENDERING);
            }

            /** Generates a shader hash code from current rendering state.
             */
            function generateHash() {
                var val = [
                    canvas.canvasId,
                    ";"
                ];

                /* Textures
                 */
                if (textureLayers.length > 0) {
                    val.push("tex/");
                    for (var i = 0; i < textureLayers.length; i++) {
                        var layer = textureLayers[i];
                        val.push(layer.params.applyFrom);
                        val.push("/");
                        val.push(layer.params.applyTo);
                        val.push("/");
                        val.push(layer.params.blendMode);
                        val.push("/");
                        if (layer.params.matrix) {
                            val.push("/anim");
                        }
                    }
                    val.push(";");
                }

                /* Lighting
                 */
                if (lights.length > 0) {
                    val.push("light/");
                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];
                        val.push(light.type);
                        val.push("/");
                        if (light.specular) {
                            val.push("spec/");
                        }
                        if (light.diffuse) {
                            val.push("diff/");
                        }
                    }
                    val.push(";");
                }

                /* Fog
                 */
                if (fog && fog.mode != "disabled") {
                    val.push("fog/");
                    val.push(fog.mode);
                    val.push(";");
                }
                sceneHash = val.join("");
            }

            function getShaderLoggingSource(src) {
                var src2 = [];
                for (var i = 0; i < src.length; i++) {
                    var padding = (i < 10) ? "&nbsp;&nbsp;&nbsp;" : ((i < 100) ? "&nbsp;&nbsp;" : (i < 1000 ? "&nbsp;" : ""));
                    src2.push(i + padding + ": " + src[i]);
                }
                return src2.join("<br/>");
            }

            /**
             * Composes a vertex shader script for rendering mode in current scene state
             */
            function composePickingVertexShader() {
                return [
                    "attribute vec3 aVertex;",
                    "uniform mat4 uMMatrix;",
                    "uniform mat4 uVMatrix;",
                    "uniform mat4 uPMatrix;",
                    "void main(void) {",
                    "  gl_Position = uPMatrix * (uVMatrix * (uMMatrix * vec4(aVertex, 1.0)));",
                    "}"
                ].join("\n");
            }

            /**
             * Composes a fragment shader script for rendering mode in current scene state
             */
            function composePickingFragmentShader() {
                return [
                    "uniform vec3 uColor;",
                    "void main(void) {",
                    "    gl_FragColor = vec4(uColor.rgb, 1.0);  ",
                    "}"
                ].join("\n");
            }

            /**
             * Composes a vertex shader script for rendering mode in current scene state
             *
             *      Vertex in view-space
             *      Normal in view-space
             *      Direction of each light position from view-space vertex
             *      Direction of vertex from eye position
             */
            function composeRenderingVertexShader() {

                var texturing = textureLayers.length > 0 && rendererState.enableTexture2D;

                var src = ["\n"];
                src.push("attribute vec3 aVertex;");                // World
                src.push("attribute vec3 aNormal;");                // World
                if (texturing) {
                    src.push("attribute vec2 aTextureCoord;");      // World
                }
                src.push("uniform mat4 uMMatrix;");               // Model
                src.push("uniform mat4 uMNMatrix;");              // Model Normal
                src.push("uniform mat4 uVMatrix;");               // View
                src.push("uniform mat4 uVNMatrix;");              // View Normal
                src.push("uniform mat4 uPMatrix;");               // Projection

                for (var i = 0; i < lights.length; i++) {
                    src.push("uniform vec3 uLightPos" + i + ";");
                }
                src.push("varying vec4 vViewVertex;");
                src.push("varying vec3 vNormal;");
                src.push("varying vec3 vEyeVec;");
                if (texturing) {
                    src.push("varying vec2 vTextureCoord;");
                }
                for (var i = 0; i < lights.length; i++) {
                    src.push("varying vec3 vLightVec" + i + ";");
                    src.push("varying float vLightDist" + i + ";");
                }
                src.push("void main(void) {");
                src.push("  vec4 tmpVNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
                src.push("  vNormal = normalize(tmpVNormal.xyz);");                                 // View-space normal
                src.push("  vViewVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
                src.push("  gl_Position = uPMatrix * vViewVertex;");

                src.push("  vec3 tmpVec;");
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    if (light.type == "dir") {
                        src.push("tmpVec = uLightPos" + i + ";");
                    } else {
                        src.push("tmpVec = (uLightPos" + i + ".xyz - vViewVertex.xyz);");
                    }
                    src.push("vLightVec" + i + " = tmpVec;");                   // Vector from light to vertex
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex
                }
                src.push("vEyeVec = normalize(vViewVertex.xyz);");
                if (texturing) {
                    src.push("vTextureCoord = aTextureCoord;");
                }
                src.push("}");
              //   ctx.logging.info(getShaderLoggingSource(src));
                return src.join("\n");
            }


            /**
             * Generates a fragment shader script for rendering mode in current scene state
             */
            function composeRenderingFragmentShader() {

                var texturing = textureLayers.length > 0 && rendererState.enableTexture2D;
                var lighting = (lights.length > 0);
                var tangent = false;

                var src = ["\n"];

                // ------------ Inputs ----------------------------------------------

                src.push("varying vec4 vViewVertex;");              // View-space vertex
                src.push("varying vec3 vNormal;");                  // View-space normal
                src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

                if (texturing) {
                    src.push("varying vec2 vTextureCoord;");

                    //texture uniforms
                    for (var i = 0; i < textureLayers.length; i++) {
                        var layer = textureLayers[i];
                        src.push("uniform sampler2D uSampler" + i + ";");
                        if (layer.params.matrix) {
                            src.push("uniform mat4 uLayer" + i + "Matrix;");
                        }
                    }
                }

                src.push("uniform vec3 uAmbient;");                         // Scene ambient colour - taken from clear colour

                /* Light-independent material uniforms
                 */
                src.push("uniform vec4 uMaterialBaseColor;");
                src.push("uniform float uMaterialEmit;");
                src.push("uniform float uMaterialAlpha;");

                /* Light and lighting-dependent material uniforms
                 */
                if (lighting) {

                    src.push("uniform vec3  uMaterialSpecularColor;");
                    src.push("uniform float uMaterialSpecular;");
                    src.push("uniform float uMaterialShine;");

                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];

                        src.push("uniform vec3  uLightColor" + i + ";");
                        src.push("uniform vec3  uLightPos" + i + ";");
                        src.push("uniform vec3  uLightSpotDir" + i + ";");

                        if (light.type == "spot") {
                            src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                            src.push("uniform float  uLightSpotExp" + i + ";");
                        }

                        src.push("uniform vec3  uLightAttenuation" + i + ";");

                        // Computed by vertex shader:

                        src.push("varying vec3   vLightVec" + i + ";");         // Vector from light to vertex
                        src.push("varying float  vLightDist" + i + ";");        // Distance from light to vertex
                    }
                }

                /* Fog uniforms
                 */
                if (fog && fog.mode != "disabled") {
                    src.push("uniform vec3  uFogColor;");
                    src.push("uniform float uFogDensity;");
                    src.push("uniform float uFogStart;");
                    src.push("uniform float uFogEnd;");
                }

                src.push("void main(void) {");

                src.push("  vec3    ambientValue=uAmbient;");

                /* Initial values for colours and coefficients that will be modulated by
                 * by the application of texture layers and lighting
                 */
                src.push("  vec4    color   = uMaterialBaseColor;");
                src.push("  float   emit    = uMaterialEmit;");
                src.push("  float   alpha   = uMaterialAlpha;");

                src.push("  vec4    normalmap = vec4(vNormal,0.0);");

                if (lighting) {
                    src.push("  float   specular=uMaterialSpecular;");
                    src.push("  vec3    specularColor=uMaterialSpecularColor;");
                    src.push("  float   shine=uMaterialShine;");


                    src.push("  float   attenuation = 1.0;");
                }

                src.push("  float   mask=1.0;");

                src.push("  vec4    texturePos;");
                src.push("  vec2    textureCoord=vec2(0.0,0.0);");

                /* ====================================================================================================
                 * TEXTURING
                 * ===================================================================================================*/

                if (texturing) {

                    /* Get texturePos from image
                     */

                    for (var i = 0; i < textureLayers.length; i++) {
                        var layer = textureLayers[i];

                        /* Get texture coord from specified source
                         */
                        if (layer.params.applyFrom == "normal") {
                            src.push("texturePos=vec4(vNormal.xyz, 1.0);");
                        }

                        if (layer.params.applyFrom == "geometry") {
                            src.push("texturePos = vec4(vTextureCoord.s, vTextureCoord.t, 1.0, 1.0);");
                        }

                        /* Transform texture coord
                         */
                        if (layer.params.matrixAsArray) {
                            src.push("textureCoord=(uLayer" + i + "Matrix * texturePos).xy;");
                        } else {
                            src.push("textureCoord=texturePos.xy;");
                        }

                        /* Apply the layer
                         */

                        if (layer.params.applyTo == "baseColor") {
                            if (layer.params.blendMode == "multiply") {
                                src.push("color  = color * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y));");
                            } else {
                                src.push("color  = color + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y));");
                            }
                        }
                    }

                }
                /* ====================================================================================================
                 * LIGHTING
                 * ===================================================================================================*/

                if (lighting) {
                    src.push("  vec3    lightVec;");
                    src.push("  float   dotN;");
                    src.push("  float   spotFactor;");
                    src.push("  float   pf;");
                    src.push("  vec3    lightValue      = uAmbient;");
                    src.push("  vec3    specularValue   = vec3(0.0,0.0,0.0);");


                    for (var i = 0; i < lights.length; i++) {
                        var light = lights[i];
                        src.push("lightVec = normalize(-vLightVec" + i + ");");

                        /* Point Light
                         */
                        if (light.type == "point") {
                            src.push("dotN = max(dot(vNormal, -lightVec), 0.0);");

                            src.push("if (dotN > 0.0) {");

                            src.push("  attenuation = 1.0 / (" +
                                     "  uLightAttenuation" + i + "[0] + " +
                                     "  uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                                     "  uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");

                            if (light.diffuse) {
                                src.push("  lightValue += dotN *  uLightColor" + i + " * attenuation;");
                            }
                            src.push("}");

                            if (light.specular) {
                                src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                         " * specular  * pow(max(dot(reflect(lightVec, vNormal), vEyeVec),0.0), shine);");
                            }
                        }

                        /* Directional Light
                         */
                        if (light.type == "dir") {
                            src.push("dotN=max(dot(vNormal,-lightVec),0.0);");
                            if (light.diffuse) {
                                src.push("lightValue += dotN * uLightColor" + i + ";");
                            }
                            if (light.specular) {
                                src.push("specularValue += specularColor * uLightColor" + i +
                                         " * specular  * pow(max(dot(reflect(lightVec, vNormal),normalize(vEyeVec)),0.0), shine);");
                            }
                        }


                        /* Spot light
                         */
                        if (light.type == "spot") {
                            src.push("spotFactor = dot(-lightVec,-normalize(uLightSpotDir" + i + "));");
                            src.push("if (spotFactor > uLightSpotCosCutOff" + i + ") {");
                            src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");

                            src.push("  dotN = max(dot(vNormal,-normalize(lightVec)),0.0);");

                            src.push("      if(dotN>0.0){");

                            src.push("          attenuation = spotFactor / (" +
                                     "uLightAttenuation" + i + "[0] + " +
                                     "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                                     "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");\n");

                            if (light.diffuse) {
                                src.push("lightValue += dotN * uLightColor" + i + ";");
                            }
                            if (lights[i].specular) {
                                src.push("specularValue += specularColor * uLightColor" + i +
                                         " * specular  * pow(max(dot(reflect(normalize(lightVec), vNormal),normalize(vEyeVec)),0.0), shine);");
                            }

                            src.push("      }");
                            src.push("}");
                        }
                    }
                }

                src.push("vec4 fragColor = vec4(specularValue.rgb + color.rgb * lightValue.rgb, alpha);");

                if (fog && fog.mode != "disabled") {
                    src.push("float fogFact=1.0;");
                    if (fog.mode == "exp") {
                        src.push("fogFact=clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
                    } else if (fog.mode == "linear") {
                        src.push("fogFact=clamp((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0, 1.0);");
                    }
                    src.push("gl_FragColor = fragColor * fogFact + vec4(uFogColor, 1) * (1.0 - fogFact);");
                } else {
                    src.push("gl_FragColor = fragColor;");
                }

                src.push("}");

                //    ctx.logging.info(getShaderLoggingSource(src));
                return src.join("\n");
            }


        }

        )
        ;
/**
 * Manages a stack of WebGL state frames that may be pushed and popped by SceneJS.renderer nodes.
 */
SceneJS._backends.installBackend(

        "renderer",

        function(ctx) {

            var canvas;  // Currently active canvas
            var stateStack;     // Stack of WebGL state frames
            var currentProps;   // Current map of set WebGL modes and states
            var loaded;         // True when current state exported

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        currentProps = {
                            clearColor: {r: 0, g : 0, b : 0, a: 1.0},
                            clearDepth: 1.0,
                            enableDepthTest:true,
                            enableCullFace: false,
                            enableTexture2D: false,
                            depthRange: { zNear: 0, zFar: 1},
                            enableScissorTest: false,
                            viewport: {} // will default to canvas extents
                        };
                        stateStack = [
                            {
                                props: currentProps,
                                restore : null          // WebGL properties to set for reverting to previous state
                            }
                        ];
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        loaded = false;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        loaded = false;
                    });

            /* WebGL state is exported on demand to construct shaders as required
             */
            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (!loaded) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.RENDERER_EXPORTED,
                                    currentProps);
                            loaded = true;
                        }
                    });


            /**
             * Maps renderer node properties to WebGL context enums
             */
            var glEnum = function(context, name) {
                if (!name) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Null SceneJS.renderer node config: \"" + name + "\"");
                }
                var result = SceneJS._webgl.enumMap[name];
                if (!result) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Unrecognised SceneJS.renderer node config value: \"" + name + "\"");
                }
                var value = context[result];
                if (!value) {
                    throw new SceneJS.exceptions.WebGLUnsupportedNodeConfigException(
                            "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
                }
                return value;
            };
           


            /**
             * Order-insensitive functions that set WebGL modes ie. not actually causing an
             * immediate change.
             *
             * These map to renderer properties and are called in whatever order their
             * property is found on the renderer config.
             *
             * Each of these wrap a state-setter function on the WebGL context. Each function
             * also uses the glEnum map to convert its renderer node property argument to the
             * WebGL enum constant required by its wrapped function.
             */
            var glModeSetters = {

                enableBlend: function(context, flag) {
                    context.enable(context.BLEND, flag);
                    currentProps.enableBlend = flag;
                },

                blendColor: function(context, color) {
                    color = {
                        r:color.r || 0,
                        g: color.g || 0,
                        b: color.b || 0,
                        a: color.a || 1
                    };
                    context.blendColor(color.r, color.g, color.b, color.a);
                    currentProps.blendColor = color;
                },

                blendEquation: function(context, eqn) {
                    context.blendEquation(context, eqn);
                    currentProps.blendEquation = eqn;
                },

                /** Sets the RGB blend equation and the alpha blend equation separately
                 */
                blendEquationSeparate: function(context, eqn) {
                    eqn = {
                        rgb : glEnum(context, eqn.rgb || "func_add"),
                        alpha : glEnum(context, eqn.alpha || "func_add")
                    };
                    context.blendEquation(eqn.rgb, eqn.alpha);
                    currentProps.blendEquationSeperate = eqn;
                },

                blendFunc: function(context, funcs) {
                    funcs = {
                        sfactor : glEnum(context, funcs.sfactor || "one"),
                        dfactor : glEnum(context, funcs.dfactor || "zero")
                    };
                    context.blendFunc(funcs.sfactor, funcs.dfactor);
                    currentProps.blendFunc = funcs;
                },

                blendFuncSeparate: function(context, func) {
                    func = {
                        srcRGB : glEnum(context, func.srcRGB || "zero"),
                        dstRGB : glEnum(context, func.dstRGB || "zero"),
                        srcAlpha : glEnum(context, func.srcAlpha || "zero"),
                        dstAlpha :  glEnum(context, func.dstAlpha || "zero")
                    };
                    context.blendFuncSeparate(func.srcRGB, func.dstRGB, func.srcAlpha, func.dstAlpha);
                    currentProps.blendFuncSeparate = func;
                },

                clearColor: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
                    context.clearColor(color.r, color.g, color.b, color.a);
                    currentProps.clearColor = color;
                },

                clearDepth: function(context, depth) {
                    context.clearDepth(depth);
                    currentProps.clearDepth = depth;
                },

                clearStencil: function(context, clearValue) {
                    context.clearStencil(clearValue);
                    currentProps.clearStencil = clearValue;
                },

                colorMask: function(context, color) {
                    color.r = color.r || 0;
                    color.g = color.g || 0;
                    color.b = color.b || 0;
                    color.a = color.a || 1;
                    context.colorMask(color.r, color.g, color.b, color.a);
                    currentProps.colorMask = color;
                },

                enableCullFace: function(context, flag) {
                    if (flag) {
                        context.enable(context.CULL_FACE);
                    } else {
                        flag = false;
                        context.disable(context.CULL_FACE);
                    }
                    currentProps.enableCullFace = flag;
                },

                cullFace: function(context, mode) {
                    mode = glEnum(context, mode);
                    context.cullFace(mode);
                    currentProps.cullFace = mode;
                },

                enableDepthTest: function(context, flag) {
                    if (flag === false) {
                        context.disable(context.DEPTH_TEST);
                    } else {
                        flag = true;
                        context.enable(context.DEPTH_TEST);
                    }
                    currentProps.enableDepthTest = flag;
                },

                depthFunc: function(context, func) {
                    func = glEnum(context, func);
                    context.depthFunc(glEnum(context, func));
                    currentProps.depthFunc = func;
                },

                enableDepthMask: function(context, flag) {
                    context.depthMask(flag);
                    currentProps.enableDepthMask = flag;
                },

                depthRange: function(context, range) {
                    range = {
                        zNear : range.zNear || 0,
                        zFar : range.zFar || 1
                    };
                    context.depthRange(range.zNear, range.zFar);
                    currentProps.depthRange = range;
                },

                frontFace: function(context, mode) {
                    mode = glEnum(context, mode);
                    context.frontFace(mode);
                    currentProps.frontFace = mode;
                },

                lineWidth: function(context, width) {
                    context.lineWidth(width);
                    currentProps.lineWidth = width;
                },

                enableTexture2D: function(context, flag) {
                    if (flag) {
                        context.enable(context.TEXTURE_2D);
                    } else {
                        flag = false;
                        context.disable(context.TEXTURE_2D);
                    }
                    currentProps.enableTexture2D = flag;
                },

                enableScissorTest: function(context, flag) {
                    if (flag) {
                        context.enable(context.SCISSOR_TEST);
                    } else {
                        flag = false;
                        context.disable(context.SCISSOR_TEST);
                    }
                    currentProps.enableScissorTest = flag;
                }
            };

            /**
             * Order-sensitive functions that immediately effect WebGL state change.
             *
             * These map to renderer properties and are called in a particular order since they
             * affect one another.
             *
             * Each of these wrap a state-setter function on the WebGL context. Each function
             * also uses the glEnum map to convert its renderer node property argument to the
             * WebGL enum constant required by its wrapped function.
             */
            var glStateSetters = {

                /** Set viewport on the given context
                 */
                viewport: function(context, v) {
                    v = {
                        x : v.x || 1,
                        y : v.y || 1,
                        width: v.width || canvas.width,
                        height: v.height || canvas.height
                    };
                    currentProps.viewport = v;
                    context.viewport(v.x, v.y, v.width, v.height);
                    ctx.events.fireEvent(SceneJS._eventTypes.VIEWPORT_UPDATED, v);
                },

                /** Sets scissor region on the given context
                 */
                scissor: function(context, s) {
                    s = {
                        x : s.x || currentProps.viewport.x,
                        y : s.y || currentProps.viewport.y,
                        width: s.width || currentProps.viewport.width,
                        height: s.height || currentProps.viewport.height
                    };
                    currentProps.scissor = s;
                    context.scissor(s.x, s.y, s.width, s.height);
                },

                /** Clears buffers on the given context as specified in mask
                 */
                clear:function(context, mask) {
                    var m;
                    if (mask.color) {
                        m = context.COLOR_BUFFER_BIT;
                    }
                    if (mask.depth) {
                        m = m | context.DEPTH_BUFFER_BIT;
                    }
                    if (mask.stencil) {
                        m = m | context.STENCIL_BUFFER_BIT;
                    }
                    if (m) {
                        context.clear(m);
                    }
                }
            };

            /**
             * Sets current renderer properties on the given WebGL context. These will then
             * appear on currentProps.
             */
            var setProperties = function(context, props) {

                /* Set order-insensitive properties (modes)
                 */
                for (var key in props) {
                    var setter = glModeSetters[key];
                    if (setter) {
                        setter(context, props[key]);
                    }
                }

                /* Set order-sensitive properties (states)
                 */
                if (props.viewport) {
                    glStateSetters.viewport(context, props.viewport);
                }
                if (props.scissor) {
                    glStateSetters.clear(context, props.scissor);
                }
                if (props.clear) {
                    glStateSetters.clear(context, props.clear);
                }

                ctx.events.fireEvent(
                        SceneJS._eventTypes.RENDERER_UPDATED,
                        currentProps);

                loaded = false;
            };

            /** Gets value of the given property on the first higher renderer state that has it
             */
            var getSuperProperty = function(name) {
                for (var i = stateStack.length - 1; i >= 0; i--) {
                    var state = stateStack[i];
                    if (state.props[name] != null) {
                        return state.props[name];
                    }
                }
                throw "Internal error - renderer backend stateStack underflow!";
            };

            return {// Node-facing API

                /**
                 * Returns a new WebGL state object to the caller, without making it active.
                 */
                createRendererState : function(props) {

                    /* For each property supplied, find the previous value to restore it to
                     */
                    var restore = {};
                    for (var name in props) {
                        if ((!props[name] === undefined)) {
                            restore[name] = getSuperProperty(name);
                        }
                    }

                    var state = {
                        props : props,
                        restore : restore
                    };
                    return state;
                },

                /** Activates the given WebGL state. If no state is active, then it must specify a canvas to activate,
                 * in which case the default simple shader will be activated as well
                 */
                setRendererState : function(state) {
                    stateStack.push(state);
                    setProperties(canvas.context, state.props);
                },

                /** Restores previous WebGL state, if any.
                 */
                restoreRendererState : function(state) {
                    stateStack.pop();
                    setProperties(canvas.context, state.restore); // Undo property settings
                }
            };
        });



/** Scene graph node that sets renderer state for nodes in its subtree. These nodes may
 * be nested, and the root renderer node must specify the ID of a WebGL canvas node in
 * the DOM. Nested renderes may then omit the canvas ID to reuse the current canvas, or
 * may specify a different canvas ID to activate a different canvas.
 */
SceneJS.renderer = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('renderer');
    var env;

    return SceneJS._utils.createNode(
            function(data) {
                if (!env || !cfg.fixed) {
                    var params = cfg.getParams(data);
                    env = backend.createRendererState(params);
                }
                backend.setRendererState(env);
                SceneJS._utils.visitChildren(cfg, data);
                backend.restoreRendererState(env);
            });
};


/**
 * Services geometry node requests to store and render elements of geometry.
 *
 * Stores geometry in vertex buffers in video RAM, caching them there under a least-recently-used eviction policy
 * mediated by the "memory" backend.
 *
 * Geometry elements are identified  by type strings, which may either be supplied by scene nodes, or automatically
 * generated by this backend.
 *
 * After creating geometry, the backend returns to the node a handle to the geometry for the node to retain. The node
 * can then pass in the handle to test if the geometry still exists (perhaps it has been evicted) or to have the
 * backend render the geometry.
 *
 * The backend is free to evict whatever geometry it chooses between scene traversals, so the node must always check
 * the existence of the geometry and possibly request its re-creation each time before requesting the backend render it.
 *
 * A geometry buffer consists of vertices, normals, optional texture coordinates, indices and a primitive type
 * (eg. "triangles").
 *
 * When rendering a geometry element, the backend will first fire a SHADER_ACTIVATE to prompt the shader backend
 * to ensure that the shader backend has composed and activated a shader. The shader backend will then fire
 * SHADER_ACTIVATED to marshal resources for its script variables from various backends, which then provide their
 * resources to the shader through XXX_EXPORTED events. This backend then likewise provides its geometry buffers to the
 * shader backend through a GEOMETRY_EXPORTED event, then bind and draw the index buffer.
 *
 * The backend avoids needlessly re-exporting and re-binding geometry (eg. when rendering a bunch of cubes in a row)
 * by tracking the ID of the last geometry rendered. That ID is maintained until another either geoemetry is rendered,
 * the canvas switches, shader deactivates or scene deactivates. While the ID is non-null, the corresponding geometry
 * cannot be evicted from the cache.
 */
SceneJS._backends.installBackend(

        "geometry",

        function(ctx) {

            var time = (new Date()).getTime();               // For LRU caching
            var canvas;
            var geometries = {};
            var nextTypeId = 0;     // For random geometry type when no type specified
            var currentBoundGeo;    // ID of geometry last rendered, non-null while that geometry loaded

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        for (var geoId in geometries) {
                            destroyGeometry(geometries[geoId]);
                        }
                        canvas = null;
                        geometries = {};
                        currentBoundGeo = null;
                    });

            /**
             * Destroys geometry, returning true if memory freed, else false
             * where canvas not found and geometry was implicitly destroyed
             */
            function destroyGeometry(geo) {
                ctx.logging.debug("Destroying geometry : '" + geo.type + "'");
                if (geo.geoId == currentBoundGeo) {
                    currentBoundGeo = null;
                }
                if (document.getElementById(geo.canvas.canvasId)) { // Context won't exist if canvas has disappeared
                    if (geo.vertexBuf) {
                        geo.vertexBuf.destroy();
                    }
                    if (geo.normalBuf) {
                        geo.normalBuf.destroy();
                    }
                    if (geo.normalBuf) {
                        geo.indexBuf.destroy();
                    }
                    if (geo.texCoordBuf) {
                        geo.texCoordBuf.destroy();
                    }
                }
                geometries[geo.geoId] = null;
            }

            /**
             * Volunteer to destroy a shader when asked to by
             * memory management module when memory runs low
             */
            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time;
                        var evictee;
                        for (var geoId in geometries) {
                            if (geoId) {
                                var geo = geometries[geoId];
                                if (geo.lastUsed < earliest
                                        && document.getElementById(geo.canvas.canvasId)) {
                                    evictee = geo;
                                    earliest = geo.lastUsed;
                                }
                            }
                        }
                        if (evictee) {
                            ctx.logging.warn("Evicting geometry from shader memory: " + evictee.type);
                            destroyGeometry(evictee);
                            return true;
                        }
                        return false;   // Couldnt find suitable geo to delete
                    });

            /**
             * Creates an array buffer
             *
             * @param context WebGL context
             * @param type Eg. ARRAY_BUFFER
             * @param values WebGL array
             * @param numItems
             * @param itemSize
             * @param usage Eg. STATIC_DRAW
             */
            function createArrayBuffer(description, context, type, values, numItems, itemSize, usage) {
                var buf;
                ctx.memory.allocate(
                        description,
                        function() {
                            buf = new SceneJS._webgl.ArrayBuffer
                                    (context, type, values, numItems, itemSize, usage);
                        });
                return buf;
            }

            /**
             * Converts SceneJS primitive type string to WebGL constant
             */
            function getPrimitiveType(context, type) {
                switch (type) {
                    case "points":
                        return context.POINTS;
                    case "lines":
                        return context.LINES;
                    case "line-loop":
                        return context.LINE_LOOP;
                    case "line-strip":
                        return context.LINE_STRIP;
                    case "triangles":
                        return context.TRIANGLES;
                    case "triangle-strip":
                        return context.TRIANGLE_STRIP;
                    case "triangle-fan":
                        return context.TRIANGLE_FAN;
                    default:
                        throw new SceneJS.exceptions.InvalidGeometryConfigException(
                                "Unsupported geometry primitive: '" +
                                type +
                                "' - supported types are: 'points', 'lines', 'line-loop', " +
                                "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'");
                }
            }

            return { // Node-facing API

                /**
                 * Returns the ID of the geometry of the given type if it exists on the active canvas
                 */
                findGeometry : function(type) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var geoId = canvas.canvasId + type;
                    return (geometries[geoId]) ? geoId : null;
                },

                /**
                 * Creates geometry of the given type on the active canvas and returns its ID
                 *
                 * @param type Optional type for geometry - when null, a random type will be used
                 * @param data Contains vertices, normals, indexes etc.
                 */
                createGeometry : function(type, data) {
                    ctx.logging.debug("Creating geometry: '" + type + "'");
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }

                    if (!data.primitive) { // "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
                        throw new SceneJS.exceptions.NodeConfigExpectedException("Geometry node parameter expected : primitive");
                    }

                    var geoId = canvas.canvasId + (type || nextTypeId++);
                    var context = canvas.context;

                    var usage = context.STATIC_DRAW;
                    //var usage = (!data.fixed) ? context.STREAM_DRAW : context.STATIC_DRAW;

                    var vertexBuf;
                    var normalBuf;
                    var texCoordBuf;
                    var indexBuf;

                    try { // TODO: Modify usage flags in accordance with how often geometry is evicted

                        vertexBuf = createArrayBuffer("geometry vertex buffer", context, context.ARRAY_BUFFER,
                                new WebGLFloatArray(data.vertices), data.vertices.length, 3, usage);

                        normalBuf = createArrayBuffer("geometry normal buffer", context, context.ARRAY_BUFFER,
                                new WebGLFloatArray(data.normals), data.normals.length, 3, usage);

                        if (data.texCoords) {
                            texCoordBuf = createArrayBuffer("geometry texture buffer", context, context.ARRAY_BUFFER,
                                    new WebGLFloatArray(data.texCoords), data.texCoords.length, 2, usage);
                        }

                        indexBuf = createArrayBuffer("geometry index buffer", context, context.ELEMENT_ARRAY_BUFFER,
                                new WebGLUnsignedShortArray(data.indices), data.indices.length, 1, usage);

                        var geo = {
                            fixed : true, // TODO: support dynamic geometry
                            primitive: getPrimitiveType(context, data.primitive),
                            type: type,
                            geoId: geoId,
                            lastUsed: time,
                            canvas : canvas,
                            context : context,
                            vertexBuf : vertexBuf,
                            normalBuf : normalBuf,
                            indexBuf : indexBuf,
                            texCoordBuf: texCoordBuf
                        };

                        geometries[geoId] = geo;

                        return geoId;

                    } catch (e) { // Allocation failure - delete whatever buffers got allocated

                        if (vertexBuf) {
                            vertexBuf.destroy();
                        }
                        if (normalBuf) {
                            normalBuf.destroy();
                        }
                        if (texCoordBuf) {
                            texCoordBuf.destroy();
                        }
                        if (indexBuf) {
                            indexBuf.destroy();
                        }
                        throw e;
                    }
                },

                /**
                 * Draws the geometry of the given ID that exists on the current canvas.
                 * Client node must ensure prior that the geometry exists on the canvas
                 * using findGeometry, and have created it if neccessary with createGeometry.
                 */
                drawGeometry : function(geoId) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }

                    ctx.events.fireEvent(SceneJS._eventTypes.SHADER_ACTIVATE);

                    var geo = geometries[geoId];

                    geo.lastUsed = time;

                    var context = canvas.context;

                    /* Dont re-export and bind if already the last one exported and bound - this is the case when
                     * we're drawing a batch of the same object, Eg. a bunch of cubes in a row
                     */
                    if (currentBoundGeo != geoId) {
                        ctx.events.fireEvent(
                                SceneJS._eventTypes.GEOMETRY_EXPORTED,
                                geo);

                        geo.indexBuf.bind(); // Bind index buffer

                        currentBoundGeo = geoId;
                    }

                    /* Draw geometry
                     */
               
                    context.drawElements(geo.primitive, geo.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                    context.flush();                  
                    /* Don't need to unbind buffers - only one is bound at a time anyway                    
                     */

                    /* Destroy one-off geometry
                     */
                    if (!geo.fixed) {
                        destroyGeometry(geo);
                        currentBoundGeo = null;
                    }
                   
                }
            };
        });
SceneJS._utils.ns("SceneJS.geometry");

/**
 * An element of geometry
 */
SceneJS.geometry = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var geometryBackend = SceneJS._backends.getBackend('geometry');

    var params;
    var type;
    var create;
    var geo = {};

    return SceneJS._utils.createNode(
            function(data) {

                /* Dynamic config only happens first time
                 */
                if (!params) {
                    params = cfg.getParams(data);
                    if (!params.type) { // Identifies VBO's on canvas
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("Geometry node parameter expected : type");
                    }
                    type = SceneJS._utils.getParam(params.type, data);
                    if (params.create instanceof Function) {

                        /* Create must not be a dynamic config function!                        
                         */
                        create = params.create;
                    } else {
                        geo = {
                            vertices : SceneJS._utils.getParam(params.vertices, data) || [],
                            normals : SceneJS._utils.getParam(params.normals, data) || [],
                            colors : SceneJS._utils.getParam(params.colors, data) || [],
                            indices : SceneJS._utils.getParam(params.indices, data) || [],
                            texCoords : SceneJS._utils.getParam(params.texCoords, data) || [],
                            primitive : SceneJS._utils.getParam(params.primitive, data) || "triangles"
                        };
                    }
                }

                /* Backend may have evicted the geometry, so we may have to re-create it
                 */
                var geoId = geometryBackend.findGeometry(type);

                if (!geoId) {
                    if (create) {
                        geoId = geometryBackend.createGeometry(type, create()); // Lazy-create geometry through callback
                    } else {
                        geoId = geometryBackend.createGeometry(type, geo);
                    }
                }

                geometryBackend.drawGeometry(geoId);
                SceneJS._utils.visitChildren(cfg, data);
            });
};

SceneJS._utils.ns("SceneJS.objects");

/** Provides a teapot geometry node by wrapping a call to the core SceneJS.geometry node.
 *
 */
SceneJS.objects.teapot = function() {

    var vertices = [
        [-3.000000, 1.650000, 0.000000],
        [-2.987110, 1.650000, -0.098438],
        [-2.987110, 1.650000, 0.098438],
        [-2.985380, 1.567320, -0.049219],
        [-2.985380, 1.567320, 0.049219],
        [-2.983500, 1.483080, 0.000000],
        [-2.981890, 1.723470, -0.049219],
        [-2.981890, 1.723470, 0.049219],
        [-2.976560, 1.798530, 0.000000],
        [-2.970900, 1.486210, -0.098438],
        [-2.970900, 1.486210, 0.098438],
        [-2.963880, 1.795340, -0.098438],
        [-2.963880, 1.795340, 0.098438],
        [-2.962210, 1.570170, -0.133594],
        [-2.962210, 1.570170, 0.133594],
        [-2.958640, 1.720570, -0.133594],
        [-2.958640, 1.720570, 0.133594],
        [-2.953130, 1.650000, -0.168750],
        [-2.953130, 1.650000, 0.168750],
        [-2.952470, 1.403740, -0.049219],
        [-2.952470, 1.403740, 0.049219],
        [-2.937700, 1.494470, -0.168750],
        [-2.937700, 1.494470, 0.168750],
        [-2.935230, 1.852150, -0.049219],
        [-2.935230, 1.852150, 0.049219],
        [-2.933590, 1.320120, 0.000000],
        [-2.930450, 1.786930, -0.168750],
        [-2.930450, 1.786930, 0.168750],
        [-2.930370, 1.411500, -0.133594],
        [-2.930370, 1.411500, 0.133594],
        [-2.921880, 1.325530, -0.098438],
        [-2.921880, 1.325530, 0.098438],
        [-2.912780, 1.844170, -0.133594],
        [-2.912780, 1.844170, 0.133594],
        [-2.906250, 1.910160, 0.000000],
        [-2.894230, 1.904570, -0.098438],
        [-2.894230, 1.904570, 0.098438],
        [-2.891380, 1.579100, -0.196875],
        [-2.891380, 1.579100, 0.196875],
        [-2.890990, 1.339800, -0.168750],
        [-2.890990, 1.339800, 0.168750],
        [-2.890650, 1.712080, -0.196875],
        [-2.890650, 1.712080, 0.196875],
        [-2.883460, 1.245790, -0.048343],
        [-2.883460, 1.245790, 0.048343],
        [-2.863460, 1.257130, -0.132718],
        [-2.863460, 1.257130, 0.132718],
        [-2.862660, 1.434830, -0.196875],
        [-2.862660, 1.434830, 0.196875],
        [-2.862550, 1.889830, -0.168750],
        [-2.862550, 1.889830, 0.168750],
        [-2.850000, 1.650000, -0.225000],
        [-2.850000, 1.650000, 0.225000],
        [-2.849710, 1.161550, 0.000000],
        [-2.847100, 1.820820, -0.196875],
        [-2.847100, 1.820820, 0.196875],
        [-2.841940, 1.946920, -0.049219],
        [-2.841940, 1.946920, 0.049219],
        [-2.829000, 1.761400, -0.225000],
        [-2.829000, 1.761400, 0.225000],
        [-2.828670, 1.175980, -0.094933],
        [-2.828670, 1.175980, 0.094933],
        [-2.824700, 1.521940, -0.225000],
        [-2.824700, 1.521940, 0.225000],
        [-2.821150, 1.935200, -0.133594],
        [-2.821150, 1.935200, 0.133594],
        [-2.812310, 1.187190, -0.168750],
        [-2.812310, 1.187190, 0.168750],
        [-2.805010, 1.289970, -0.196875],
        [-2.805010, 1.289970, 0.196875],
        [-2.797270, 1.383110, -0.225000],
        [-2.797270, 1.383110, 0.225000],
        [-2.789060, 1.990140, 0.000000],
        [-2.788360, 1.699320, -0.196875],
        [-2.788360, 1.699320, 0.196875],
        [-2.778210, 1.982830, -0.098438],
        [-2.778210, 1.982830, 0.098438],
        [-2.774420, 1.527380, -0.196875],
        [-2.774420, 1.527380, 0.196875],
        [-2.773560, 1.098600, -0.084375],
        [-2.773560, 1.098600, 0.084375],
        [-2.766410, 1.845120, -0.225000],
        [-2.766410, 1.845120, 0.225000],
        [-2.760340, 1.900900, -0.196875],
        [-2.760340, 1.900900, 0.196875],
        [-2.749600, 1.963560, -0.168750],
        [-2.749600, 1.963560, 0.168750],
        [-2.748310, 1.785700, -0.196875],
        [-2.748310, 1.785700, 0.196875],
        [-2.746880, 1.650000, -0.168750],
        [-2.746880, 1.650000, 0.168750],
        [-2.731250, 1.007810, 0.000000],
        [-2.727560, 1.735870, -0.168750],
        [-2.727560, 1.735870, 0.168750],
        [-2.720360, 1.690830, -0.133594],
        [-2.720360, 1.690830, 0.133594],
        [-2.719480, 1.249770, -0.225000],
        [-2.719480, 1.249770, 0.225000],
        [-2.716780, 1.144680, -0.196875],
        [-2.716780, 1.144680, 0.196875],
        [-2.712890, 1.650000, -0.098438],
        [-2.712890, 1.650000, 0.098438],
        [-2.708990, 1.541770, -0.133594],
        [-2.708990, 1.541770, 0.133594],
        [-2.703540, 1.426410, -0.168750],
        [-2.703540, 1.426410, 0.168750],
        [-2.700980, 1.037840, -0.168750],
        [-2.700980, 1.037840, 0.168750],
        [-2.700000, 1.650000, 0.000000],
        [-2.699650, 2.010790, -0.048346],
        [-2.699650, 2.010790, 0.048346],
        [-2.697120, 1.687930, -0.049219],
        [-2.697120, 1.687930, 0.049219],
        [-2.694130, 1.727460, -0.098438],
        [-2.694130, 1.727460, 0.098438],
        [-2.686620, 1.546690, -0.049219],
        [-2.686620, 1.546690, 0.049219],
        [-2.682630, 1.762350, -0.133594],
        [-2.682630, 1.762350, 0.133594],
        [-2.681480, 1.996460, -0.132721],
        [-2.681480, 1.996460, 0.132721],
        [-2.681440, 1.724270, 0.000000],
        [-2.675740, 1.270850, -0.196875],
        [-2.675740, 1.270850, 0.196875],
        [-2.672650, 1.440680, -0.098438],
        [-2.672650, 1.440680, 0.098438],
        [-2.670260, 1.800400, -0.168750],
        [-2.670260, 1.800400, 0.168750],
        [-2.667800, 1.846230, -0.196875],
        [-2.667800, 1.846230, 0.196875],
        [-2.662790, 1.905100, -0.225000],
        [-2.662790, 1.905100, 0.225000],
        [-2.660940, 1.446090, 0.000000],
        [-2.660180, 1.754370, -0.049219],
        [-2.660180, 1.754370, 0.049219],
        [-2.638580, 1.785670, -0.098438],
        [-2.638580, 1.785670, 0.098438],
        [-2.634380, 1.103910, -0.225000],
        [-2.634380, 1.103910, 0.225000],
        [-2.630740, 1.956740, -0.196875],
        [-2.630740, 1.956740, 0.196875],
        [-2.626560, 1.780080, 0.000000],
        [-2.625000, 2.043750, 0.000000],
        [-2.624640, 1.305020, -0.132813],
        [-2.624640, 1.305020, 0.132813],
        [-2.606420, 1.317450, -0.048438],
        [-2.606420, 1.317450, 0.048438],
        [-2.606320, 2.026440, -0.094945],
        [-2.606320, 2.026440, 0.094945],
        [-2.591800, 2.012990, -0.168750],
        [-2.591800, 2.012990, 0.168750],
        [-2.571730, 1.834290, -0.168750],
        [-2.571730, 1.834290, 0.168750],
        [-2.567770, 1.169970, -0.168750],
        [-2.567770, 1.169970, 0.168750],
        [-2.554600, 1.183040, -0.095315],
        [-2.554600, 1.183040, 0.095315],
        [-2.549750, 1.890590, -0.196875],
        [-2.549750, 1.890590, 0.196875],
        [-2.549540, 0.878984, -0.084375],
        [-2.549540, 0.878984, 0.084375],
        [-2.546430, 1.831970, -0.132721],
        [-2.546430, 1.831970, 0.132721],
        [-2.537500, 1.200000, 0.000000],
        [-2.527210, 1.819200, -0.048346],
        [-2.527210, 1.819200, 0.048346],
        [-2.518750, 1.945310, -0.225000],
        [-2.518750, 1.945310, 0.225000],
        [-2.516830, 0.932671, -0.196875],
        [-2.516830, 0.932671, 0.196875],
        [-2.471840, 1.006490, -0.196875],
        [-2.471840, 1.006490, 0.196875],
        [-2.445700, 1.877640, -0.168750],
        [-2.445700, 1.877640, 0.168750],
        [-2.439130, 1.060180, -0.084375],
        [-2.439130, 1.060180, 0.084375],
        [-2.431180, 1.864180, -0.094945],
        [-2.431180, 1.864180, 0.094945],
        [-2.412500, 1.846870, 0.000000],
        [-2.388280, 0.716602, 0.000000],
        [-2.382250, 0.737663, -0.095854],
        [-2.382250, 0.737663, 0.095854],
        [-2.378840, 2.052020, -0.084375],
        [-2.378840, 2.052020, 0.084375],
        [-2.377660, 0.753680, -0.168750],
        [-2.377660, 0.753680, 0.168750],
        [-2.364750, 0.798761, -0.199836],
        [-2.364750, 0.798761, 0.199836],
        [-2.354300, 0.835254, -0.225000],
        [-2.354300, 0.835254, 0.225000],
        [-2.343840, 0.871747, -0.199836],
        [-2.343840, 0.871747, 0.199836],
        [-2.341150, 1.999720, -0.196875],
        [-2.341150, 1.999720, 0.196875],
        [-2.330930, 0.916827, -0.168750],
        [-2.330930, 0.916827, 0.168750],
        [-2.320310, 0.953906, 0.000000],
        [-2.289320, 1.927820, -0.196875],
        [-2.289320, 1.927820, 0.196875],
        [-2.251620, 1.875520, -0.084375],
        [-2.251620, 1.875520, 0.084375],
        [-2.247410, 0.882285, -0.084375],
        [-2.247410, 0.882285, 0.084375],
        [-2.173630, 0.844043, 0.000000],
        [-2.168530, 0.826951, -0.097184],
        [-2.168530, 0.826951, 0.097184],
        [-2.164770, 0.814364, -0.168750],
        [-2.164770, 0.814364, 0.168750],
        [-2.156880, 0.786694, -0.187068],
        [-2.156880, 0.786694, 0.187068],
        [-2.156250, 2.092970, 0.000000],
        [-2.154120, 0.740520, -0.215193],
        [-2.154120, 0.740520, 0.215193],
        [-2.150170, 0.694734, -0.215193],
        [-2.150170, 0.694734, 0.215193],
        [-2.147420, 0.648560, -0.187068],
        [-2.147420, 0.648560, 0.187068],
        [-2.144960, 0.612777, -0.132948],
        [-2.144960, 0.612777, 0.132948],
        [-2.143710, 0.591789, -0.048573],
        [-2.143710, 0.591789, 0.048573],
        [-2.142330, 2.058360, -0.168750],
        [-2.142330, 2.058360, 0.168750],
        [-2.111720, 1.982230, -0.225000],
        [-2.111720, 1.982230, 0.225000],
        [-2.084470, 0.789526, -0.048905],
        [-2.084470, 0.789526, 0.048905],
        [-2.081100, 1.906090, -0.168750],
        [-2.081100, 1.906090, 0.168750],
        [-2.078340, 0.770387, -0.133280],
        [-2.078340, 0.770387, 0.133280],
        [-2.067190, 1.871480, 0.000000],
        [-2.000000, 0.750000, 0.000000],
        [-1.995700, 0.737109, -0.098438],
        [-1.995700, 0.737109, 0.098438],
        [-1.984380, 0.703125, -0.168750],
        [-1.984380, 0.703125, 0.168750],
        [-1.978520, 0.591650, 0.000000],
        [-1.969370, 0.670825, -0.202656],
        [-1.969370, 0.670825, 0.202656],
        [-1.968360, 0.655078, -0.210938],
        [-1.968360, 0.655078, 0.210938],
        [-1.960000, 0.750000, -0.407500],
        [-1.960000, 0.750000, 0.407500],
        [-1.958730, 0.925195, -0.201561],
        [-1.958730, 0.925195, 0.201561],
        [-1.957030, 1.100390, 0.000000],
        [-1.950000, 0.600000, -0.225000],
        [-1.950000, 0.600000, 0.225000],
        [-1.938950, 0.591650, -0.403123],
        [-1.938950, 0.591650, 0.403123],
        [-1.931640, 0.544922, -0.210938],
        [-1.931640, 0.544922, 0.210938],
        [-1.930690, 0.522583, -0.198676],
        [-1.930690, 0.522583, 0.198676],
        [-1.921880, 0.453516, 0.000000],
        [-1.917890, 1.100390, -0.398745],
        [-1.917890, 1.100390, 0.398745],
        [-1.915620, 0.496875, -0.168750],
        [-1.915620, 0.496875, 0.168750],
        [-1.904300, 0.462891, -0.098438],
        [-1.904300, 0.462891, 0.098438],
        [-1.900000, 0.450000, 0.000000],
        [-1.892280, 0.670825, -0.593047],
        [-1.892280, 0.670825, 0.593047],
        [-1.883440, 0.453516, -0.391582],
        [-1.883440, 0.453516, 0.391582],
        [-1.882060, 0.925195, -0.589845],
        [-1.882060, 0.925195, 0.589845],
        [-1.881390, 1.286130, -0.193602],
        [-1.881390, 1.286130, 0.193602],
        [-1.855120, 0.522583, -0.581402],
        [-1.855120, 0.522583, 0.581402],
        [-1.845000, 0.750000, -0.785000],
        [-1.845000, 0.750000, 0.785000],
        [-1.843750, 1.471870, 0.000000],
        [-1.833170, 1.890680, -0.084375],
        [-1.833170, 1.890680, 0.084375],
        [-1.831800, 1.946490, -0.196875],
        [-1.831800, 1.946490, 0.196875],
        [-1.829920, 2.023230, -0.196875],
        [-1.829920, 2.023230, 0.196875],
        [-1.828550, 2.079040, -0.084375],
        [-1.828550, 2.079040, 0.084375],
        [-1.825180, 0.591650, -0.776567],
        [-1.825180, 0.591650, 0.776567],
        [-1.817580, 0.343945, -0.187036],
        [-1.817580, 0.343945, 0.187036],
        [-1.807750, 1.286130, -0.566554],
        [-1.807750, 1.286130, 0.566554],
        [-1.806870, 1.471870, -0.375664],
        [-1.806870, 1.471870, 0.375664],
        [-1.805360, 1.100390, -0.768135],
        [-1.805360, 1.100390, 0.768135],
        [-1.772930, 0.453516, -0.754336],
        [-1.772930, 0.453516, 0.754336],
        [-1.750000, 0.234375, 0.000000],
        [-1.746440, 0.343945, -0.547339],
        [-1.746440, 0.343945, 0.547339],
        [-1.744330, 0.670825, -0.949871],
        [-1.744330, 0.670825, 0.949871],
        [-1.734910, 0.925195, -0.944741],
        [-1.734910, 0.925195, 0.944741],
        [-1.715000, 0.234375, -0.356563],
        [-1.715000, 0.234375, 0.356562],
        [-1.710080, 0.522583, -0.931218],
        [-1.710080, 0.522583, 0.931218],
        [-1.700860, 1.471870, -0.723672],
        [-1.700860, 1.471870, 0.723672],
        [-1.666400, 1.286130, -0.907437],
        [-1.666400, 1.286130, 0.907437],
        [-1.662500, 0.750000, -1.125000],
        [-1.662500, 0.750000, 1.125000],
        [-1.655160, 1.860940, -0.170322],
        [-1.655160, 1.860940, 0.170322],
        [-1.647420, 0.159961, -0.169526],
        [-1.647420, 0.159961, 0.169526],
        [-1.644640, 0.591650, -1.112920],
        [-1.644640, 0.591650, 1.112920],
        [-1.626780, 1.100390, -1.100830],
        [-1.626780, 1.100390, 1.100830],
        [-1.614370, 0.234375, -0.686875],
        [-1.614370, 0.234375, 0.686875],
        [-1.609890, 0.343945, -0.876660],
        [-1.609890, 0.343945, 0.876660],
        [-1.600000, 1.875000, 0.000000],
        [-1.597560, 0.453516, -1.081060],
        [-1.597560, 0.453516, 1.081060],
        [-1.590370, 1.860940, -0.498428],
        [-1.590370, 1.860940, 0.498428],
        [-1.584380, 1.910160, -0.168750],
        [-1.584380, 1.910160, 0.168750],
        [-1.582940, 0.159961, -0.496099],
        [-1.582940, 0.159961, 0.496099],
        [-1.578130, 0.085547, 0.000000],
        [-1.550000, 1.987500, -0.225000],
        [-1.550000, 1.987500, 0.225000],
        [-1.546560, 0.085547, -0.321543],
        [-1.546560, 0.085547, 0.321543],
        [-1.532970, 0.670825, -1.265670],
        [-1.532970, 0.670825, 1.265670],
        [-1.532620, 1.471870, -1.037110],
        [-1.532620, 1.471870, 1.037110],
        [-1.524690, 0.925195, -1.258830],
        [-1.524690, 0.925195, 1.258830],
        [-1.523670, 0.042773, -0.156792],
        [-1.523670, 0.042773, 0.156792],
        [-1.515630, 2.064840, -0.168750],
        [-1.515630, 2.064840, 0.168750],
        [-1.502870, 0.522583, -1.240810],
        [-1.502870, 0.522583, 1.240810],
        [-1.500000, 0.000000, 0.000000],
        [-1.500000, 2.100000, 0.000000],
        [-1.500000, 2.250000, 0.000000],
        [-1.470000, 0.000000, -0.305625],
        [-1.470000, 0.000000, 0.305625],
        [-1.470000, 2.250000, -0.305625],
        [-1.470000, 2.250000, 0.305625],
        [-1.466020, 1.860940, -0.798320],
        [-1.466020, 1.860940, 0.798320],
        [-1.464490, 1.286130, -1.209120],
        [-1.464490, 1.286130, 1.209120],
        [-1.464030, 0.042773, -0.458833],
        [-1.464030, 0.042773, 0.458833],
        [-1.459860, 2.286910, -0.150226],
        [-1.459860, 2.286910, 0.150226],
        [-1.459170, 0.159961, -0.794590],
        [-1.459170, 0.159961, 0.794590],
        [-1.455820, 0.085547, -0.619414],
        [-1.455820, 0.085547, 0.619414],
        [-1.454690, 0.234375, -0.984375],
        [-1.454690, 0.234375, 0.984375],
        [-1.449220, 2.323830, 0.000000],
        [-1.420230, 2.323830, -0.295278],
        [-1.420230, 2.323830, 0.295278],
        [-1.420000, 0.750000, -1.420000],
        [-1.420000, 0.750000, 1.420000],
        [-1.414820, 0.343945, -1.168120],
        [-1.414820, 0.343945, 1.168120],
        [-1.411910, 2.336130, -0.145291],
        [-1.411910, 2.336130, 0.145291],
        [-1.404750, 0.591650, -1.404750],
        [-1.404750, 0.591650, 1.404750],
        [-1.403130, 2.348440, 0.000000],
        [-1.402720, 2.286910, -0.439618],
        [-1.402720, 2.286910, 0.439618],
        [-1.400000, 2.250000, 0.000000],
        [-1.389490, 1.100390, -1.389490],
        [-1.389490, 1.100390, 1.389490],
        [-1.383750, 0.000000, -0.588750],
        [-1.383750, 0.000000, 0.588750],
        [-1.383750, 2.250000, -0.588750],
        [-1.383750, 2.250000, 0.588750],
        [-1.380470, 2.323830, 0.000000],
        [-1.377880, 2.336130, -0.141789],
        [-1.377880, 2.336130, 0.141789],
        [-1.376330, 2.286910, -0.141630],
        [-1.376330, 2.286910, 0.141630],
        [-1.375060, 2.348440, -0.285887],
        [-1.375060, 2.348440, 0.285887],
        [-1.372000, 2.250000, -0.285250],
        [-1.372000, 2.250000, 0.285250],
        [-1.364530, 0.453516, -1.364530],
        [-1.364530, 0.453516, 1.364530],
        [-1.356650, 2.336130, -0.425177],
        [-1.356650, 2.336130, 0.425177],
        [-1.352860, 2.323830, -0.281271],
        [-1.352860, 2.323830, 0.281271],
        [-1.349570, 0.042773, -0.734902],
        [-1.349570, 0.042773, 0.734902],
        [-1.336900, 2.323830, -0.568818],
        [-1.336900, 2.323830, 0.568818],
        [-1.323950, 2.336130, -0.414929],
        [-1.323950, 2.336130, 0.414929],
        [-1.322460, 2.286910, -0.414464],
        [-1.322460, 2.286910, 0.414464],
        [-1.311820, 0.085547, -0.887695],
        [-1.311820, 0.085547, 0.887695],
        [-1.309060, 1.471870, -1.309060],
        [-1.309060, 1.471870, 1.309060],
        [-1.300000, 2.250000, 0.000000],
        [-1.294380, 2.348440, -0.550727],
        [-1.294380, 2.348440, 0.550727],
        [-1.293050, 2.286910, -0.704126],
        [-1.293050, 2.286910, 0.704126],
        [-1.291500, 2.250000, -0.549500],
        [-1.291500, 2.250000, 0.549500],
        [-1.288390, 1.860940, -1.063730],
        [-1.288390, 1.860940, 1.063730],
        [-1.282370, 0.159961, -1.058760],
        [-1.282370, 0.159961, 1.058760],
        [-1.274000, 2.250000, -0.264875],
        [-1.274000, 2.250000, 0.264875],
        [-1.273480, 2.323830, -0.541834],
        [-1.273480, 2.323830, 0.541834],
        [-1.267660, 2.274900, -0.130448],
        [-1.267660, 2.274900, 0.130448],
        [-1.265670, 0.670825, -1.532970],
        [-1.265670, 0.670825, 1.532970],
        [-1.260940, 2.299800, 0.000000],
        [-1.258830, 0.925195, -1.524690],
        [-1.258830, 0.925195, 1.524690],
        [-1.250570, 2.336130, -0.680997],
        [-1.250570, 2.336130, 0.680997],
        [-1.246880, 0.000000, -0.843750],
        [-1.246880, 0.000000, 0.843750],
        [-1.246880, 2.250000, -0.843750],
        [-1.246880, 2.250000, 0.843750],
        [-1.242500, 0.234375, -1.242500],
        [-1.242500, 0.234375, 1.242500],
        [-1.240810, 0.522583, -1.502870],
        [-1.240810, 0.522583, 1.502870],
        [-1.235720, 2.299800, -0.256916],
        [-1.235720, 2.299800, 0.256916],
        [-1.220430, 2.336130, -0.664583],
        [-1.220430, 2.336130, 0.664583],
        [-1.219060, 2.286910, -0.663837],
        [-1.219060, 2.286910, 0.663837],
        [-1.218050, 2.274900, -0.381740],
        [-1.218050, 2.274900, 0.381740],
        [-1.209120, 1.286130, -1.464490],
        [-1.209120, 1.286130, 1.464490],
        [-1.204660, 2.323830, -0.815186],
        [-1.204660, 2.323830, 0.815186],
        [-1.199250, 2.250000, -0.510250],
        [-1.199250, 2.250000, 0.510250],
        [-1.196510, 2.319430, -0.123125],
        [-1.196510, 2.319430, 0.123125],
        [-1.186040, 0.042773, -0.979229],
        [-1.186040, 0.042773, 0.979229],
        [-1.168120, 0.343945, -1.414820],
        [-1.168120, 0.343945, 1.414820],
        [-1.166350, 2.348440, -0.789258],
        [-1.166350, 2.348440, 0.789258],
        [-1.163750, 2.250000, -0.787500],
        [-1.163750, 2.250000, 0.787500],
        [-1.163220, 2.299800, -0.494918],
        [-1.163220, 2.299800, 0.494918],
        [-1.156250, 2.339060, 0.000000],
        [-1.149680, 2.319430, -0.360312],
        [-1.149680, 2.319430, 0.360312],
        [-1.147520, 2.323830, -0.776514],
        [-1.147520, 2.323830, 0.776514],
        [-1.136370, 2.286910, -0.938220],
        [-1.136370, 2.286910, 0.938220],
        [-1.133120, 2.339060, -0.235586],
        [-1.133120, 2.339060, 0.235586],
        [-1.125000, 0.750000, -1.662500],
        [-1.125000, 0.750000, 1.662500],
        [-1.122810, 2.274900, -0.611424],
        [-1.122810, 2.274900, 0.611424],
        [-1.120470, 0.085547, -1.120470],
        [-1.120470, 0.085547, 1.120470],
        [-1.112920, 0.591650, -1.644640],
        [-1.112920, 0.591650, 1.644640],
        [-1.100830, 1.100390, -1.626780],
        [-1.100830, 1.100390, 1.626780],
        [-1.099040, 2.336130, -0.907402],
        [-1.099040, 2.336130, 0.907402],
        [-1.081060, 0.453516, -1.597560],
        [-1.081060, 0.453516, 1.597560],
        [-1.080630, 2.250000, -0.731250],
        [-1.080630, 2.250000, 0.731250],
        [-1.072550, 2.336130, -0.885531],
        [-1.072550, 2.336130, 0.885531],
        [-1.071350, 2.286910, -0.884537],
        [-1.071350, 2.286910, 0.884537],
        [-1.066640, 2.339060, -0.453828],
        [-1.066640, 2.339060, 0.453828],
        [-1.065000, 0.000000, -1.065000],
        [-1.065000, 0.000000, 1.065000],
        [-1.065000, 2.250000, -1.065000],
        [-1.065000, 2.250000, 1.065000],
        [-1.063730, 1.860940, -1.288390],
        [-1.063730, 1.860940, 1.288390],
        [-1.059790, 2.319430, -0.577104],
        [-1.059790, 2.319430, 0.577104],
        [-1.058760, 0.159961, -1.282370],
        [-1.058760, 0.159961, 1.282370],
        [-1.048150, 2.299800, -0.709277],
        [-1.048150, 2.299800, 0.709277],
        [-1.037110, 1.471870, -1.532620],
        [-1.037110, 1.471870, 1.532620],
        [-1.028940, 2.323830, -1.028940],
        [-1.028940, 2.323830, 1.028940],
        [-0.996219, 2.348440, -0.996219],
        [-0.996219, 2.348440, 0.996219],
        [-0.994000, 2.250000, -0.994000],
        [-0.994000, 2.250000, 0.994000],
        [-0.986761, 2.274900, -0.814698],
        [-0.986761, 2.274900, 0.814698],
        [-0.984375, 0.234375, -1.454690],
        [-0.984375, 0.234375, 1.454690],
        [-0.980719, 2.369530, -0.100920],
        [-0.980719, 2.369530, 0.100920],
        [-0.980133, 2.323830, -0.980133],
        [-0.980133, 2.323830, 0.980133],
        [-0.979229, 0.042773, -1.186040],
        [-0.979229, 0.042773, 1.186040],
        [-0.961133, 2.339060, -0.650391],
        [-0.961133, 2.339060, 0.650391],
        [-0.949871, 0.670825, -1.744330],
        [-0.949871, 0.670825, 1.744330],
        [-0.944741, 0.925195, -1.734910],
        [-0.944741, 0.925195, 1.734910],
        [-0.942332, 2.369530, -0.295330],
        [-0.942332, 2.369530, 0.295330],
        [-0.938220, 2.286910, -1.136370],
        [-0.938220, 2.286910, 1.136370],
        [-0.931373, 2.319430, -0.768968],
        [-0.931373, 2.319430, 0.768968],
        [-0.931218, 0.522583, -1.710080],
        [-0.931218, 0.522583, 1.710080],
        [-0.923000, 2.250000, -0.923000],
        [-0.923000, 2.250000, 0.923000],
        [-0.907437, 1.286130, -1.666400],
        [-0.907437, 1.286130, 1.666400],
        [-0.907402, 2.336130, -1.099040],
        [-0.907402, 2.336130, 1.099040],
        [-0.895266, 2.299800, -0.895266],
        [-0.895266, 2.299800, 0.895266],
        [-0.887695, 0.085547, -1.311820],
        [-0.887695, 0.085547, 1.311820],
        [-0.885531, 2.336130, -1.072550],
        [-0.885531, 2.336130, 1.072550],
        [-0.884537, 2.286910, -1.071350],
        [-0.884537, 2.286910, 1.071350],
        [-0.876660, 0.343945, -1.609890],
        [-0.876660, 0.343945, 1.609890],
        [-0.868654, 2.369530, -0.473023],
        [-0.868654, 2.369530, 0.473023],
        [-0.843750, 0.000000, -1.246880],
        [-0.843750, 0.000000, 1.246880],
        [-0.843750, 2.250000, -1.246880],
        [-0.843750, 2.250000, 1.246880],
        [-0.825000, 2.400000, 0.000000],
        [-0.820938, 2.339060, -0.820938],
        [-0.820938, 2.339060, 0.820938],
        [-0.815186, 2.323830, -1.204660],
        [-0.815186, 2.323830, 1.204660],
        [-0.814698, 2.274900, -0.986761],
        [-0.814698, 2.274900, 0.986761],
        [-0.808500, 2.400000, -0.168094],
        [-0.808500, 2.400000, 0.168094],
        [-0.798320, 1.860940, -1.466020],
        [-0.798320, 1.860940, 1.466020],
        [-0.794590, 0.159961, -1.459170],
        [-0.794590, 0.159961, 1.459170],
        [-0.789258, 2.348440, -1.166350],
        [-0.789258, 2.348440, 1.166350],
        [-0.787500, 2.250000, -1.163750],
        [-0.787500, 2.250000, 1.163750],
        [-0.785000, 0.750000, -1.845000],
        [-0.785000, 0.750000, 1.845000],
        [-0.776567, 0.591650, -1.825180],
        [-0.776567, 0.591650, 1.825180],
        [-0.776514, 2.323830, -1.147520],
        [-0.776514, 2.323830, 1.147520],
        [-0.768968, 2.319430, -0.931373],
        [-0.768968, 2.319430, 0.931373],
        [-0.768135, 1.100390, -1.805360],
        [-0.768135, 1.100390, 1.805360],
        [-0.763400, 2.369530, -0.630285],
        [-0.763400, 2.369530, 0.630285],
        [-0.761063, 2.400000, -0.323813],
        [-0.761063, 2.400000, 0.323813],
        [-0.754336, 0.453516, -1.772930],
        [-0.754336, 0.453516, 1.772930],
        [-0.734902, 0.042773, -1.349570],
        [-0.734902, 0.042773, 1.349570],
        [-0.731250, 2.250000, -1.080630],
        [-0.731250, 2.250000, 1.080630],
        [-0.723672, 1.471870, -1.700860],
        [-0.723672, 1.471870, 1.700860],
        [-0.709277, 2.299800, -1.048150],
        [-0.709277, 2.299800, 1.048150],
        [-0.704126, 2.286910, -1.293050],
        [-0.704126, 2.286910, 1.293050],
        [-0.686875, 0.234375, -1.614370],
        [-0.686875, 0.234375, 1.614370],
        [-0.685781, 2.400000, -0.464063],
        [-0.685781, 2.400000, 0.464063],
        [-0.680997, 2.336130, -1.250570],
        [-0.680997, 2.336130, 1.250570],
        [-0.664583, 2.336130, -1.220430],
        [-0.664583, 2.336130, 1.220430],
        [-0.663837, 2.286910, -1.219060],
        [-0.663837, 2.286910, 1.219060],
        [-0.650391, 2.339060, -0.961133],
        [-0.650391, 2.339060, 0.961133],
        [-0.631998, 2.430470, -0.064825],
        [-0.631998, 2.430470, 0.064825],
        [-0.630285, 2.369530, -0.763400],
        [-0.630285, 2.369530, 0.763400],
        [-0.619414, 0.085547, -1.455820],
        [-0.619414, 0.085547, 1.455820],
        [-0.611424, 2.274900, -1.122810],
        [-0.611424, 2.274900, 1.122810],
        [-0.607174, 2.430470, -0.190548],
        [-0.607174, 2.430470, 0.190548],
        [-0.593047, 0.670825, -1.892280],
        [-0.593047, 0.670825, 1.892280],
        [-0.589845, 0.925195, -1.882060],
        [-0.589845, 0.925195, 1.882060],
        [-0.588750, 0.000000, -1.383750],
        [-0.588750, 0.000000, 1.383750],
        [-0.588750, 2.250000, -1.383750],
        [-0.588750, 2.250000, 1.383750],
        [-0.585750, 2.400000, -0.585750],
        [-0.585750, 2.400000, 0.585750],
        [-0.581402, 0.522583, -1.855120],
        [-0.581402, 0.522583, 1.855120],
        [-0.577104, 2.319430, -1.059790],
        [-0.577104, 2.319430, 1.059790],
        [-0.568818, 2.323830, -1.336900],
        [-0.568818, 2.323830, 1.336900],
        [-0.566554, 1.286130, -1.807750],
        [-0.566554, 1.286130, 1.807750],
        [-0.559973, 2.430470, -0.304711],
        [-0.559973, 2.430470, 0.304711],
        [-0.550727, 2.348440, -1.294380],
        [-0.550727, 2.348440, 1.294380],
        [-0.549500, 2.250000, -1.291500],
        [-0.549500, 2.250000, 1.291500],
        [-0.547339, 0.343945, -1.746440],
        [-0.547339, 0.343945, 1.746440],
        [-0.541834, 2.323830, -1.273480],
        [-0.541834, 2.323830, 1.273480],
        [-0.510250, 2.250000, -1.199250],
        [-0.510250, 2.250000, 1.199250],
        [-0.498428, 1.860940, -1.590370],
        [-0.498428, 1.860940, 1.590370],
        [-0.496099, 0.159961, -1.582940],
        [-0.496099, 0.159961, 1.582940],
        [-0.494918, 2.299800, -1.163220],
        [-0.494918, 2.299800, 1.163220],
        [-0.491907, 2.430470, -0.406410],
        [-0.491907, 2.430470, 0.406410],
        [-0.473023, 2.369530, -0.868654],
        [-0.473023, 2.369530, 0.868654],
        [-0.464063, 2.400000, -0.685781],
        [-0.464063, 2.400000, 0.685781],
        [-0.458833, 0.042773, -1.464030],
        [-0.458833, 0.042773, 1.464030],
        [-0.456250, 2.460940, 0.000000],
        [-0.453828, 2.339060, -1.066640],
        [-0.453828, 2.339060, 1.066640],
        [-0.439618, 2.286910, -1.402720],
        [-0.439618, 2.286910, 1.402720],
        [-0.438241, 2.460940, -0.091207],
        [-0.438241, 2.460940, 0.091207],
        [-0.425177, 2.336130, -1.356650],
        [-0.425177, 2.336130, 1.356650],
        [-0.420891, 2.460940, -0.179078],
        [-0.420891, 2.460940, 0.179078],
        [-0.414929, 2.336130, -1.323950],
        [-0.414929, 2.336130, 1.323950],
        [-0.414464, 2.286910, -1.322460],
        [-0.414464, 2.286910, 1.322460],
        [-0.407500, 0.750000, -1.960000],
        [-0.407500, 0.750000, 1.960000],
        [-0.406410, 2.430470, -0.491907],
        [-0.406410, 2.430470, 0.491907],
        [-0.403123, 0.591650, -1.938950],
        [-0.403123, 0.591650, 1.938950],
        [-0.398745, 1.100390, -1.917890],
        [-0.398745, 1.100390, 1.917890],
        [-0.391582, 0.453516, -1.883440],
        [-0.391582, 0.453516, 1.883440],
        [-0.381740, 2.274900, -1.218050],
        [-0.381740, 2.274900, 1.218050],
        [-0.375664, 1.471870, -1.806870],
        [-0.375664, 1.471870, 1.806870],
        [-0.372159, 2.460940, -0.251889],
        [-0.372159, 2.460940, 0.251889],
        [-0.362109, 2.897170, 0.000000],
        [-0.360312, 2.319430, -1.149680],
        [-0.360312, 2.319430, 1.149680],
        [-0.356563, 0.234375, 1.715000],
        [-0.356562, 0.234375, -1.715000],
        [-0.340625, 2.950780, 0.000000],
        [-0.337859, 2.923970, -0.069278],
        [-0.337859, 2.923970, 0.069278],
        [-0.334238, 2.897170, -0.142705],
        [-0.334238, 2.897170, 0.142705],
        [-0.330325, 2.864210, -0.067672],
        [-0.330325, 2.864210, 0.067672],
        [-0.325000, 2.831250, 0.000000],
        [-0.323938, 2.460940, -0.323938],
        [-0.323938, 2.460940, 0.323938],
        [-0.323813, 2.400000, -0.761063],
        [-0.323813, 2.400000, 0.761063],
        [-0.321543, 0.085547, -1.546560],
        [-0.321543, 0.085547, 1.546560],
        [-0.315410, 2.505470, -0.064395],
        [-0.315410, 2.505470, 0.064395],
        [-0.314464, 2.950780, -0.134407],
        [-0.314464, 2.950780, 0.134407],
        [-0.305625, 0.000000, -1.470000],
        [-0.305625, 0.000000, 1.470000],
        [-0.305625, 2.250000, -1.470000],
        [-0.305625, 2.250000, 1.470000],
        [-0.304711, 2.430470, -0.559973],
        [-0.304711, 2.430470, 0.559973],
        [-0.299953, 2.831250, -0.127984],
        [-0.299953, 2.831250, 0.127984],
        [-0.295330, 2.369530, -0.942332],
        [-0.295330, 2.369530, 0.942332],
        [-0.295278, 2.323830, -1.420230],
        [-0.295278, 2.323830, 1.420230],
        [-0.287197, 2.923970, -0.194300],
        [-0.287197, 2.923970, 0.194300],
        [-0.285887, 2.348440, -1.375060],
        [-0.285887, 2.348440, 1.375060],
        [-0.285250, 2.250000, -1.372000],
        [-0.285250, 2.250000, 1.372000],
        [-0.281271, 2.323830, -1.352860],
        [-0.281271, 2.323830, 1.352860],
        [-0.280732, 2.864210, -0.189856],
        [-0.280732, 2.864210, 0.189856],
        [-0.274421, 2.968800, -0.056380],
        [-0.274421, 2.968800, 0.056380],
        [-0.267832, 2.505470, -0.180879],
        [-0.267832, 2.505470, 0.180879],
        [-0.264875, 2.250000, -1.274000],
        [-0.264875, 2.250000, 1.274000],
        [-0.257610, 2.897170, -0.257610],
        [-0.257610, 2.897170, 0.257610],
        [-0.256916, 2.299800, -1.235720],
        [-0.256916, 2.299800, 1.235720],
        [-0.251889, 2.460940, -0.372159],
        [-0.251889, 2.460940, 0.372159],
        [-0.250872, 2.757420, -0.051347],
        [-0.250872, 2.757420, 0.051347],
        [-0.242477, 2.950780, -0.242477],
        [-0.242477, 2.950780, 0.242477],
        [-0.235586, 2.339060, -1.133120],
        [-0.235586, 2.339060, 1.133120],
        [-0.233382, 2.968800, -0.158018],
        [-0.233382, 2.968800, 0.158018],
        [-0.231125, 2.831250, -0.231125],
        [-0.231125, 2.831250, 0.231125],
        [-0.230078, 2.986820, 0.000000],
        [-0.213159, 2.757420, -0.144103],
        [-0.213159, 2.757420, 0.144103],
        [-0.212516, 2.986820, -0.091113],
        [-0.212516, 2.986820, 0.091113],
        [-0.202656, 0.670825, -1.969370],
        [-0.202656, 0.670825, 1.969370],
        [-0.201561, 0.925195, -1.958730],
        [-0.201561, 0.925195, 1.958730],
        [-0.200000, 2.550000, 0.000000],
        [-0.198676, 0.522583, -1.930690],
        [-0.198676, 0.522583, 1.930690],
        [-0.196875, 2.683590, 0.000000],
        [-0.194300, 2.923970, -0.287197],
        [-0.194300, 2.923970, 0.287197],
        [-0.193602, 1.286130, -1.881390],
        [-0.193602, 1.286130, 1.881390],
        [-0.190548, 2.430470, -0.607174],
        [-0.190548, 2.430470, 0.607174],
        [-0.189856, 2.864210, -0.280732],
        [-0.189856, 2.864210, 0.280732],
        [-0.187036, 0.343945, -1.817580],
        [-0.187036, 0.343945, 1.817580],
        [-0.184500, 2.550000, -0.078500],
        [-0.184500, 2.550000, 0.078500],
        [-0.181661, 2.683590, -0.077405],
        [-0.181661, 2.683590, 0.077405],
        [-0.180879, 2.505470, -0.267832],
        [-0.180879, 2.505470, 0.267832],
        [-0.179078, 2.460940, -0.420891],
        [-0.179078, 2.460940, 0.420891],
        [-0.176295, 2.581200, -0.036001],
        [-0.176295, 2.581200, 0.036001],
        [-0.174804, 2.648000, -0.035727],
        [-0.174804, 2.648000, 0.035727],
        [-0.170322, 1.860940, -1.655160],
        [-0.170322, 1.860940, 1.655160],
        [-0.169526, 0.159961, -1.647420],
        [-0.169526, 0.159961, 1.647420],
        [-0.168094, 2.400000, -0.808500],
        [-0.168094, 2.400000, 0.808500],
        [-0.166797, 2.612400, 0.000000],
        [-0.164073, 2.986820, -0.164073],
        [-0.164073, 2.986820, 0.164073],
        [-0.158018, 2.968800, -0.233382],
        [-0.158018, 2.968800, 0.233382],
        [-0.156792, 0.042773, -1.523670],
        [-0.156792, 0.042773, 1.523670],
        [-0.153882, 2.612400, -0.065504],
        [-0.153882, 2.612400, 0.065504],
        [-0.150226, 2.286910, -1.459860],
        [-0.150226, 2.286910, 1.459860],
        [-0.149710, 2.581200, -0.101116],
        [-0.149710, 2.581200, 0.101116],
        [-0.148475, 2.648000, -0.100316],
        [-0.148475, 2.648000, 0.100316],
        [-0.145291, 2.336130, -1.411910],
        [-0.145291, 2.336130, 1.411910],
        [-0.144103, 2.757420, -0.213159],
        [-0.144103, 2.757420, 0.213159],
        [-0.142705, 2.897170, -0.334238],
        [-0.142705, 2.897170, 0.334238],
        [-0.142000, 2.550000, -0.142000],
        [-0.142000, 2.550000, 0.142000],
        [-0.141789, 2.336130, -1.377880],
        [-0.141789, 2.336130, 1.377880],
        [-0.141630, 2.286910, -1.376330],
        [-0.141630, 2.286910, 1.376330],
        [-0.139898, 2.683590, -0.139898],
        [-0.139898, 2.683590, 0.139898],
        [-0.134407, 2.950780, -0.314464],
        [-0.134407, 2.950780, 0.314464],
        [-0.130448, 2.274900, -1.267660],
        [-0.130448, 2.274900, 1.267660],
        [-0.127984, 2.831250, -0.299953],
        [-0.127984, 2.831250, 0.299953],
        [-0.123125, 2.319430, -1.196510],
        [-0.123125, 2.319430, 1.196510],
        [-0.118458, 2.612400, -0.118458],
        [-0.118458, 2.612400, 0.118458],
        [-0.110649, 2.993410, -0.022778],
        [-0.110649, 2.993410, 0.022778],
        [-0.101116, 2.581200, -0.149710],
        [-0.101116, 2.581200, 0.149710],
        [-0.100920, 2.369530, -0.980719],
        [-0.100920, 2.369530, 0.980719],
        [-0.100316, 2.648000, -0.148475],
        [-0.100316, 2.648000, 0.148475],
        [-0.094147, 2.993410, -0.063797],
        [-0.094147, 2.993410, 0.063797],
        [-0.091207, 2.460940, -0.438241],
        [-0.091207, 2.460940, 0.438241],
        [-0.091113, 2.986820, -0.212516],
        [-0.091113, 2.986820, 0.212516],
        [-0.078500, 2.550000, -0.184500],
        [-0.078500, 2.550000, 0.184500],
        [-0.077405, 2.683590, -0.181661],
        [-0.077405, 2.683590, 0.181661],
        [-0.069278, 2.923970, -0.337859],
        [-0.069278, 2.923970, 0.337859],
        [-0.067672, 2.864210, -0.330325],
        [-0.067672, 2.864210, 0.330325],
        [-0.065504, 2.612400, -0.153882],
        [-0.065504, 2.612400, 0.153882],
        [-0.064825, 2.430470, -0.631998],
        [-0.064825, 2.430470, 0.631998],
        [-0.064395, 2.505470, -0.315410],
        [-0.064395, 2.505470, 0.315410],
        [-0.063797, 2.993410, -0.094147],
        [-0.063797, 2.993410, 0.094147],
        [-0.056380, 2.968800, -0.274421],
        [-0.056380, 2.968800, 0.274421],
        [-0.051347, 2.757420, -0.250872],
        [-0.051347, 2.757420, 0.250872],
        [-0.036001, 2.581200, -0.176295],
        [-0.036001, 2.581200, 0.176295],
        [-0.035727, 2.648000, -0.174804],
        [-0.035727, 2.648000, 0.174804],
        [-0.022778, 2.993410, -0.110649],
        [-0.022778, 2.993410, 0.110649],
        [0.000000, 0.000000, -1.500000],
        [0.000000, 0.000000, 1.500000],
        [0.000000, 0.085547, -1.578130],
        [0.000000, 0.085547, 1.578130],
        [0.000000, 0.234375, -1.750000],
        [0.000000, 0.234375, 1.750000],
        [0.000000, 0.453516, -1.921880],
        [0.000000, 0.453516, 1.921880],
        [0.000000, 0.591650, -1.978520],
        [0.000000, 0.591650, 1.978520],
        [0.000000, 0.750000, -2.000000],
        [0.000000, 0.750000, 2.000000],
        [0.000000, 1.100390, -1.957030],
        [0.000000, 1.100390, 1.957030],
        [0.000000, 1.471870, -1.843750],
        [0.000000, 1.471870, 1.843750],
        [0.000000, 2.250000, -1.500000],
        [0.000000, 2.250000, -1.400000],
        [0.000000, 2.250000, -1.300000],
        [0.000000, 2.250000, 1.300000],
        [0.000000, 2.250000, 1.400000],
        [0.000000, 2.250000, 1.500000],
        [0.000000, 2.299800, -1.260940],
        [0.000000, 2.299800, 1.260940],
        [0.000000, 2.323830, -1.449220],
        [0.000000, 2.323830, -1.380470],
        [0.000000, 2.323830, 1.380470],
        [0.000000, 2.323830, 1.449220],
        [0.000000, 2.339060, -1.156250],
        [0.000000, 2.339060, 1.156250],
        [0.000000, 2.348440, -1.403130],
        [0.000000, 2.348440, 1.403130],
        [0.000000, 2.400000, -0.825000],
        [0.000000, 2.400000, 0.825000],
        [0.000000, 2.460940, -0.456250],
        [0.000000, 2.460940, 0.456250],
        [0.000000, 2.550000, -0.200000],
        [0.000000, 2.550000, 0.200000],
        [0.000000, 2.612400, -0.166797],
        [0.000000, 2.612400, 0.166797],
        [0.000000, 2.683590, -0.196875],
        [0.000000, 2.683590, 0.196875],
        [0.000000, 2.831250, -0.325000],
        [0.000000, 2.831250, 0.325000],
        [0.000000, 2.897170, -0.362109],
        [0.000000, 2.897170, 0.362109],
        [0.000000, 2.950780, -0.340625],
        [0.000000, 2.950780, 0.340625],
        [0.000000, 2.986820, -0.230078],
        [0.000000, 2.986820, 0.230078],
        [0.000000, 3.000000, 0.000000],
        [0.022778, 2.993410, -0.110649],
        [0.022778, 2.993410, 0.110649],
        [0.035727, 2.648000, -0.174804],
        [0.035727, 2.648000, 0.174804],
        [0.036001, 2.581200, -0.176295],
        [0.036001, 2.581200, 0.176295],
        [0.051347, 2.757420, -0.250872],
        [0.051347, 2.757420, 0.250872],
        [0.056380, 2.968800, -0.274421],
        [0.056380, 2.968800, 0.274421],
        [0.063797, 2.993410, -0.094147],
        [0.063797, 2.993410, 0.094147],
        [0.064395, 2.505470, -0.315410],
        [0.064395, 2.505470, 0.315410],
        [0.064825, 2.430470, -0.631998],
        [0.064825, 2.430470, 0.631998],
        [0.065504, 2.612400, -0.153882],
        [0.065504, 2.612400, 0.153882],
        [0.067672, 2.864210, -0.330325],
        [0.067672, 2.864210, 0.330325],
        [0.069278, 2.923970, -0.337859],
        [0.069278, 2.923970, 0.337859],
        [0.077405, 2.683590, -0.181661],
        [0.077405, 2.683590, 0.181661],
        [0.078500, 2.550000, -0.184500],
        [0.078500, 2.550000, 0.184500],
        [0.091113, 2.986820, -0.212516],
        [0.091113, 2.986820, 0.212516],
        [0.091207, 2.460940, -0.438241],
        [0.091207, 2.460940, 0.438241],
        [0.094147, 2.993410, -0.063797],
        [0.094147, 2.993410, 0.063797],
        [0.100316, 2.648000, -0.148475],
        [0.100316, 2.648000, 0.148475],
        [0.100920, 2.369530, -0.980719],
        [0.100920, 2.369530, 0.980719],
        [0.101116, 2.581200, -0.149710],
        [0.101116, 2.581200, 0.149710],
        [0.110649, 2.993410, -0.022778],
        [0.110649, 2.993410, 0.022778],
        [0.118458, 2.612400, -0.118458],
        [0.118458, 2.612400, 0.118458],
        [0.123125, 2.319430, -1.196510],
        [0.123125, 2.319430, 1.196510],
        [0.127984, 2.831250, -0.299953],
        [0.127984, 2.831250, 0.299953],
        [0.130448, 2.274900, -1.267660],
        [0.130448, 2.274900, 1.267660],
        [0.134407, 2.950780, -0.314464],
        [0.134407, 2.950780, 0.314464],
        [0.139898, 2.683590, -0.139898],
        [0.139898, 2.683590, 0.139898],
        [0.141630, 2.286910, -1.376330],
        [0.141630, 2.286910, 1.376330],
        [0.141789, 2.336130, -1.377880],
        [0.141789, 2.336130, 1.377880],
        [0.142000, 2.550000, -0.142000],
        [0.142000, 2.550000, 0.142000],
        [0.142705, 2.897170, -0.334238],
        [0.142705, 2.897170, 0.334238],
        [0.144103, 2.757420, -0.213159],
        [0.144103, 2.757420, 0.213159],
        [0.145291, 2.336130, -1.411910],
        [0.145291, 2.336130, 1.411910],
        [0.148475, 2.648000, -0.100316],
        [0.148475, 2.648000, 0.100316],
        [0.149710, 2.581200, -0.101116],
        [0.149710, 2.581200, 0.101116],
        [0.150226, 2.286910, -1.459860],
        [0.150226, 2.286910, 1.459860],
        [0.153882, 2.612400, -0.065504],
        [0.153882, 2.612400, 0.065504],
        [0.156792, 0.042773, -1.523670],
        [0.156792, 0.042773, 1.523670],
        [0.158018, 2.968800, -0.233382],
        [0.158018, 2.968800, 0.233382],
        [0.164073, 2.986820, -0.164073],
        [0.164073, 2.986820, 0.164073],
        [0.166797, 2.612400, 0.000000],
        [0.168094, 2.400000, -0.808500],
        [0.168094, 2.400000, 0.808500],
        [0.169526, 0.159961, -1.647420],
        [0.169526, 0.159961, 1.647420],
        [0.170322, 1.860940, -1.655160],
        [0.170322, 1.860940, 1.655160],
        [0.174804, 2.648000, -0.035727],
        [0.174804, 2.648000, 0.035727],
        [0.176295, 2.581200, -0.036001],
        [0.176295, 2.581200, 0.036001],
        [0.179078, 2.460940, -0.420891],
        [0.179078, 2.460940, 0.420891],
        [0.180879, 2.505470, -0.267832],
        [0.180879, 2.505470, 0.267832],
        [0.181661, 2.683590, -0.077405],
        [0.181661, 2.683590, 0.077405],
        [0.184500, 2.550000, -0.078500],
        [0.184500, 2.550000, 0.078500],
        [0.187036, 0.343945, -1.817580],
        [0.187036, 0.343945, 1.817580],
        [0.189856, 2.864210, -0.280732],
        [0.189856, 2.864210, 0.280732],
        [0.190548, 2.430470, -0.607174],
        [0.190548, 2.430470, 0.607174],
        [0.193602, 1.286130, -1.881390],
        [0.193602, 1.286130, 1.881390],
        [0.194300, 2.923970, -0.287197],
        [0.194300, 2.923970, 0.287197],
        [0.196875, 2.683590, 0.000000],
        [0.198676, 0.522583, -1.930690],
        [0.198676, 0.522583, 1.930690],
        [0.200000, 2.550000, 0.000000],
        [0.201561, 0.925195, -1.958730],
        [0.201561, 0.925195, 1.958730],
        [0.202656, 0.670825, -1.969370],
        [0.202656, 0.670825, 1.969370],
        [0.212516, 2.986820, -0.091113],
        [0.212516, 2.986820, 0.091113],
        [0.213159, 2.757420, -0.144103],
        [0.213159, 2.757420, 0.144103],
        [0.230078, 2.986820, 0.000000],
        [0.231125, 2.831250, -0.231125],
        [0.231125, 2.831250, 0.231125],
        [0.233382, 2.968800, -0.158018],
        [0.233382, 2.968800, 0.158018],
        [0.235586, 2.339060, -1.133120],
        [0.235586, 2.339060, 1.133120],
        [0.242477, 2.950780, -0.242477],
        [0.242477, 2.950780, 0.242477],
        [0.250872, 2.757420, -0.051347],
        [0.250872, 2.757420, 0.051347],
        [0.251889, 2.460940, -0.372159],
        [0.251889, 2.460940, 0.372159],
        [0.256916, 2.299800, -1.235720],
        [0.256916, 2.299800, 1.235720],
        [0.257610, 2.897170, -0.257610],
        [0.257610, 2.897170, 0.257610],
        [0.264875, 2.250000, -1.274000],
        [0.264875, 2.250000, 1.274000],
        [0.267832, 2.505470, -0.180879],
        [0.267832, 2.505470, 0.180879],
        [0.274421, 2.968800, -0.056380],
        [0.274421, 2.968800, 0.056380],
        [0.280732, 2.864210, -0.189856],
        [0.280732, 2.864210, 0.189856],
        [0.281271, 2.323830, -1.352860],
        [0.281271, 2.323830, 1.352860],
        [0.285250, 2.250000, -1.372000],
        [0.285250, 2.250000, 1.372000],
        [0.285887, 2.348440, -1.375060],
        [0.285887, 2.348440, 1.375060],
        [0.287197, 2.923970, -0.194300],
        [0.287197, 2.923970, 0.194300],
        [0.295278, 2.323830, -1.420230],
        [0.295278, 2.323830, 1.420230],
        [0.295330, 2.369530, -0.942332],
        [0.295330, 2.369530, 0.942332],
        [0.299953, 2.831250, -0.127984],
        [0.299953, 2.831250, 0.127984],
        [0.304711, 2.430470, -0.559973],
        [0.304711, 2.430470, 0.559973],
        [0.305625, 0.000000, -1.470000],
        [0.305625, 0.000000, 1.470000],
        [0.305625, 2.250000, -1.470000],
        [0.305625, 2.250000, 1.470000],
        [0.314464, 2.950780, -0.134407],
        [0.314464, 2.950780, 0.134407],
        [0.315410, 2.505470, -0.064395],
        [0.315410, 2.505470, 0.064395],
        [0.321543, 0.085547, -1.546560],
        [0.321543, 0.085547, 1.546560],
        [0.323813, 2.400000, -0.761063],
        [0.323813, 2.400000, 0.761063],
        [0.323938, 2.460940, -0.323938],
        [0.323938, 2.460940, 0.323938],
        [0.325000, 2.831250, 0.000000],
        [0.330325, 2.864210, -0.067672],
        [0.330325, 2.864210, 0.067672],
        [0.334238, 2.897170, -0.142705],
        [0.334238, 2.897170, 0.142705],
        [0.337859, 2.923970, -0.069278],
        [0.337859, 2.923970, 0.069278],
        [0.340625, 2.950780, 0.000000],
        [0.356562, 0.234375, 1.715000],
        [0.356563, 0.234375, -1.715000],
        [0.360312, 2.319430, -1.149680],
        [0.360312, 2.319430, 1.149680],
        [0.362109, 2.897170, 0.000000],
        [0.372159, 2.460940, -0.251889],
        [0.372159, 2.460940, 0.251889],
        [0.375664, 1.471870, -1.806870],
        [0.375664, 1.471870, 1.806870],
        [0.381740, 2.274900, -1.218050],
        [0.381740, 2.274900, 1.218050],
        [0.391582, 0.453516, -1.883440],
        [0.391582, 0.453516, 1.883440],
        [0.398745, 1.100390, -1.917890],
        [0.398745, 1.100390, 1.917890],
        [0.403123, 0.591650, -1.938950],
        [0.403123, 0.591650, 1.938950],
        [0.406410, 2.430470, -0.491907],
        [0.406410, 2.430470, 0.491907],
        [0.407500, 0.750000, -1.960000],
        [0.407500, 0.750000, 1.960000],
        [0.414464, 2.286910, -1.322460],
        [0.414464, 2.286910, 1.322460],
        [0.414929, 2.336130, -1.323950],
        [0.414929, 2.336130, 1.323950],
        [0.420891, 2.460940, -0.179078],
        [0.420891, 2.460940, 0.179078],
        [0.425177, 2.336130, -1.356650],
        [0.425177, 2.336130, 1.356650],
        [0.438241, 2.460940, -0.091207],
        [0.438241, 2.460940, 0.091207],
        [0.439618, 2.286910, -1.402720],
        [0.439618, 2.286910, 1.402720],
        [0.453828, 2.339060, -1.066640],
        [0.453828, 2.339060, 1.066640],
        [0.456250, 2.460940, 0.000000],
        [0.458833, 0.042773, -1.464030],
        [0.458833, 0.042773, 1.464030],
        [0.464063, 2.400000, -0.685781],
        [0.464063, 2.400000, 0.685781],
        [0.473023, 2.369530, -0.868654],
        [0.473023, 2.369530, 0.868654],
        [0.491907, 2.430470, -0.406410],
        [0.491907, 2.430470, 0.406410],
        [0.494918, 2.299800, -1.163220],
        [0.494918, 2.299800, 1.163220],
        [0.496099, 0.159961, -1.582940],
        [0.496099, 0.159961, 1.582940],
        [0.498428, 1.860940, -1.590370],
        [0.498428, 1.860940, 1.590370],
        [0.510250, 2.250000, -1.199250],
        [0.510250, 2.250000, 1.199250],
        [0.541834, 2.323830, -1.273480],
        [0.541834, 2.323830, 1.273480],
        [0.547339, 0.343945, -1.746440],
        [0.547339, 0.343945, 1.746440],
        [0.549500, 2.250000, -1.291500],
        [0.549500, 2.250000, 1.291500],
        [0.550727, 2.348440, -1.294380],
        [0.550727, 2.348440, 1.294380],
        [0.559973, 2.430470, -0.304711],
        [0.559973, 2.430470, 0.304711],
        [0.566554, 1.286130, -1.807750],
        [0.566554, 1.286130, 1.807750],
        [0.568818, 2.323830, -1.336900],
        [0.568818, 2.323830, 1.336900],
        [0.577104, 2.319430, -1.059790],
        [0.577104, 2.319430, 1.059790],
        [0.581402, 0.522583, -1.855120],
        [0.581402, 0.522583, 1.855120],
        [0.585750, 2.400000, -0.585750],
        [0.585750, 2.400000, 0.585750],
        [0.588750, 0.000000, -1.383750],
        [0.588750, 0.000000, 1.383750],
        [0.588750, 2.250000, -1.383750],
        [0.588750, 2.250000, 1.383750],
        [0.589845, 0.925195, -1.882060],
        [0.589845, 0.925195, 1.882060],
        [0.593047, 0.670825, -1.892280],
        [0.593047, 0.670825, 1.892280],
        [0.607174, 2.430470, -0.190548],
        [0.607174, 2.430470, 0.190548],
        [0.611424, 2.274900, -1.122810],
        [0.611424, 2.274900, 1.122810],
        [0.619414, 0.085547, -1.455820],
        [0.619414, 0.085547, 1.455820],
        [0.630285, 2.369530, -0.763400],
        [0.630285, 2.369530, 0.763400],
        [0.631998, 2.430470, -0.064825],
        [0.631998, 2.430470, 0.064825],
        [0.650391, 2.339060, -0.961133],
        [0.650391, 2.339060, 0.961133],
        [0.663837, 2.286910, -1.219060],
        [0.663837, 2.286910, 1.219060],
        [0.664583, 2.336130, -1.220430],
        [0.664583, 2.336130, 1.220430],
        [0.680997, 2.336130, -1.250570],
        [0.680997, 2.336130, 1.250570],
        [0.685781, 2.400000, -0.464063],
        [0.685781, 2.400000, 0.464063],
        [0.686875, 0.234375, -1.614370],
        [0.686875, 0.234375, 1.614370],
        [0.704126, 2.286910, -1.293050],
        [0.704126, 2.286910, 1.293050],
        [0.709277, 2.299800, -1.048150],
        [0.709277, 2.299800, 1.048150],
        [0.723672, 1.471870, -1.700860],
        [0.723672, 1.471870, 1.700860],
        [0.731250, 2.250000, -1.080630],
        [0.731250, 2.250000, 1.080630],
        [0.734902, 0.042773, -1.349570],
        [0.734902, 0.042773, 1.349570],
        [0.754336, 0.453516, -1.772930],
        [0.754336, 0.453516, 1.772930],
        [0.761063, 2.400000, -0.323813],
        [0.761063, 2.400000, 0.323813],
        [0.763400, 2.369530, -0.630285],
        [0.763400, 2.369530, 0.630285],
        [0.768135, 1.100390, -1.805360],
        [0.768135, 1.100390, 1.805360],
        [0.768968, 2.319430, -0.931373],
        [0.768968, 2.319430, 0.931373],
        [0.776514, 2.323830, -1.147520],
        [0.776514, 2.323830, 1.147520],
        [0.776567, 0.591650, -1.825180],
        [0.776567, 0.591650, 1.825180],
        [0.785000, 0.750000, -1.845000],
        [0.785000, 0.750000, 1.845000],
        [0.787500, 2.250000, -1.163750],
        [0.787500, 2.250000, 1.163750],
        [0.789258, 2.348440, -1.166350],
        [0.789258, 2.348440, 1.166350],
        [0.794590, 0.159961, -1.459170],
        [0.794590, 0.159961, 1.459170],
        [0.798320, 1.860940, -1.466020],
        [0.798320, 1.860940, 1.466020],
        [0.808500, 2.400000, -0.168094],
        [0.808500, 2.400000, 0.168094],
        [0.814698, 2.274900, -0.986761],
        [0.814698, 2.274900, 0.986761],
        [0.815186, 2.323830, -1.204660],
        [0.815186, 2.323830, 1.204660],
        [0.820938, 2.339060, -0.820938],
        [0.820938, 2.339060, 0.820938],
        [0.825000, 2.400000, 0.000000],
        [0.843750, 0.000000, -1.246880],
        [0.843750, 0.000000, 1.246880],
        [0.843750, 2.250000, -1.246880],
        [0.843750, 2.250000, 1.246880],
        [0.868654, 2.369530, -0.473023],
        [0.868654, 2.369530, 0.473023],
        [0.876660, 0.343945, -1.609890],
        [0.876660, 0.343945, 1.609890],
        [0.884537, 2.286910, -1.071350],
        [0.884537, 2.286910, 1.071350],
        [0.885531, 2.336130, -1.072550],
        [0.885531, 2.336130, 1.072550],
        [0.887695, 0.085547, -1.311820],
        [0.887695, 0.085547, 1.311820],
        [0.895266, 2.299800, -0.895266],
        [0.895266, 2.299800, 0.895266],
        [0.907402, 2.336130, -1.099040],
        [0.907402, 2.336130, 1.099040],
        [0.907437, 1.286130, -1.666400],
        [0.907437, 1.286130, 1.666400],
        [0.923000, 2.250000, -0.923000],
        [0.923000, 2.250000, 0.923000],
        [0.931218, 0.522583, -1.710080],
        [0.931218, 0.522583, 1.710080],
        [0.931373, 2.319430, -0.768968],
        [0.931373, 2.319430, 0.768968],
        [0.938220, 2.286910, -1.136370],
        [0.938220, 2.286910, 1.136370],
        [0.942332, 2.369530, -0.295330],
        [0.942332, 2.369530, 0.295330],
        [0.944741, 0.925195, -1.734910],
        [0.944741, 0.925195, 1.734910],
        [0.949871, 0.670825, -1.744330],
        [0.949871, 0.670825, 1.744330],
        [0.961133, 2.339060, -0.650391],
        [0.961133, 2.339060, 0.650391],
        [0.979229, 0.042773, -1.186040],
        [0.979229, 0.042773, 1.186040],
        [0.980133, 2.323830, -0.980133],
        [0.980133, 2.323830, 0.980133],
        [0.980719, 2.369530, -0.100920],
        [0.980719, 2.369530, 0.100920],
        [0.984375, 0.234375, -1.454690],
        [0.984375, 0.234375, 1.454690],
        [0.986761, 2.274900, -0.814698],
        [0.986761, 2.274900, 0.814698],
        [0.994000, 2.250000, -0.994000],
        [0.994000, 2.250000, 0.994000],
        [0.996219, 2.348440, -0.996219],
        [0.996219, 2.348440, 0.996219],
        [1.028940, 2.323830, -1.028940],
        [1.028940, 2.323830, 1.028940],
        [1.037110, 1.471870, -1.532620],
        [1.037110, 1.471870, 1.532620],
        [1.048150, 2.299800, -0.709277],
        [1.048150, 2.299800, 0.709277],
        [1.058760, 0.159961, -1.282370],
        [1.058760, 0.159961, 1.282370],
        [1.059790, 2.319430, -0.577104],
        [1.059790, 2.319430, 0.577104],
        [1.063730, 1.860940, -1.288390],
        [1.063730, 1.860940, 1.288390],
        [1.065000, 0.000000, -1.065000],
        [1.065000, 0.000000, 1.065000],
        [1.065000, 2.250000, -1.065000],
        [1.065000, 2.250000, 1.065000],
        [1.066640, 2.339060, -0.453828],
        [1.066640, 2.339060, 0.453828],
        [1.071350, 2.286910, -0.884537],
        [1.071350, 2.286910, 0.884537],
        [1.072550, 2.336130, -0.885531],
        [1.072550, 2.336130, 0.885531],
        [1.080630, 2.250000, -0.731250],
        [1.080630, 2.250000, 0.731250],
        [1.081060, 0.453516, -1.597560],
        [1.081060, 0.453516, 1.597560],
        [1.099040, 2.336130, -0.907402],
        [1.099040, 2.336130, 0.907402],
        [1.100830, 1.100390, -1.626780],
        [1.100830, 1.100390, 1.626780],
        [1.112920, 0.591650, -1.644640],
        [1.112920, 0.591650, 1.644640],
        [1.120470, 0.085547, -1.120470],
        [1.120470, 0.085547, 1.120470],
        [1.122810, 2.274900, -0.611424],
        [1.122810, 2.274900, 0.611424],
        [1.125000, 0.750000, -1.662500],
        [1.125000, 0.750000, 1.662500],
        [1.133120, 2.339060, -0.235586],
        [1.133120, 2.339060, 0.235586],
        [1.136370, 2.286910, -0.938220],
        [1.136370, 2.286910, 0.938220],
        [1.147520, 2.323830, -0.776514],
        [1.147520, 2.323830, 0.776514],
        [1.149680, 2.319430, -0.360312],
        [1.149680, 2.319430, 0.360312],
        [1.156250, 2.339060, 0.000000],
        [1.163220, 2.299800, -0.494918],
        [1.163220, 2.299800, 0.494918],
        [1.163750, 2.250000, -0.787500],
        [1.163750, 2.250000, 0.787500],
        [1.166350, 2.348440, -0.789258],
        [1.166350, 2.348440, 0.789258],
        [1.168120, 0.343945, -1.414820],
        [1.168120, 0.343945, 1.414820],
        [1.186040, 0.042773, -0.979229],
        [1.186040, 0.042773, 0.979229],
        [1.196510, 2.319430, -0.123125],
        [1.196510, 2.319430, 0.123125],
        [1.199250, 2.250000, -0.510250],
        [1.199250, 2.250000, 0.510250],
        [1.204660, 2.323830, -0.815186],
        [1.204660, 2.323830, 0.815186],
        [1.209120, 1.286130, -1.464490],
        [1.209120, 1.286130, 1.464490],
        [1.218050, 2.274900, -0.381740],
        [1.218050, 2.274900, 0.381740],
        [1.219060, 2.286910, -0.663837],
        [1.219060, 2.286910, 0.663837],
        [1.220430, 2.336130, -0.664583],
        [1.220430, 2.336130, 0.664583],
        [1.235720, 2.299800, -0.256916],
        [1.235720, 2.299800, 0.256916],
        [1.240810, 0.522583, -1.502870],
        [1.240810, 0.522583, 1.502870],
        [1.242500, 0.234375, -1.242500],
        [1.242500, 0.234375, 1.242500],
        [1.246880, 0.000000, -0.843750],
        [1.246880, 0.000000, 0.843750],
        [1.246880, 2.250000, -0.843750],
        [1.246880, 2.250000, 0.843750],
        [1.250570, 2.336130, -0.680997],
        [1.250570, 2.336130, 0.680997],
        [1.258830, 0.925195, -1.524690],
        [1.258830, 0.925195, 1.524690],
        [1.260940, 2.299800, 0.000000],
        [1.265670, 0.670825, -1.532970],
        [1.265670, 0.670825, 1.532970],
        [1.267660, 2.274900, -0.130448],
        [1.267660, 2.274900, 0.130448],
        [1.273480, 2.323830, -0.541834],
        [1.273480, 2.323830, 0.541834],
        [1.274000, 2.250000, -0.264875],
        [1.274000, 2.250000, 0.264875],
        [1.282370, 0.159961, -1.058760],
        [1.282370, 0.159961, 1.058760],
        [1.288390, 1.860940, -1.063730],
        [1.288390, 1.860940, 1.063730],
        [1.291500, 2.250000, -0.549500],
        [1.291500, 2.250000, 0.549500],
        [1.293050, 2.286910, -0.704126],
        [1.293050, 2.286910, 0.704126],
        [1.294380, 2.348440, -0.550727],
        [1.294380, 2.348440, 0.550727],
        [1.300000, 2.250000, 0.000000],
        [1.309060, 1.471870, -1.309060],
        [1.309060, 1.471870, 1.309060],
        [1.311820, 0.085547, -0.887695],
        [1.311820, 0.085547, 0.887695],
        [1.322460, 2.286910, -0.414464],
        [1.322460, 2.286910, 0.414464],
        [1.323950, 2.336130, -0.414929],
        [1.323950, 2.336130, 0.414929],
        [1.336900, 2.323830, -0.568818],
        [1.336900, 2.323830, 0.568818],
        [1.349570, 0.042773, -0.734902],
        [1.349570, 0.042773, 0.734902],
        [1.352860, 2.323830, -0.281271],
        [1.352860, 2.323830, 0.281271],
        [1.356650, 2.336130, -0.425177],
        [1.356650, 2.336130, 0.425177],
        [1.364530, 0.453516, -1.364530],
        [1.364530, 0.453516, 1.364530],
        [1.372000, 2.250000, -0.285250],
        [1.372000, 2.250000, 0.285250],
        [1.375060, 2.348440, -0.285887],
        [1.375060, 2.348440, 0.285887],
        [1.376330, 2.286910, -0.141630],
        [1.376330, 2.286910, 0.141630],
        [1.377880, 2.336130, -0.141789],
        [1.377880, 2.336130, 0.141789],
        [1.380470, 2.323830, 0.000000],
        [1.383750, 0.000000, -0.588750],
        [1.383750, 0.000000, 0.588750],
        [1.383750, 2.250000, -0.588750],
        [1.383750, 2.250000, 0.588750],
        [1.389490, 1.100390, -1.389490],
        [1.389490, 1.100390, 1.389490],
        [1.400000, 2.250000, 0.000000],
        [1.402720, 2.286910, -0.439618],
        [1.402720, 2.286910, 0.439618],
        [1.403130, 2.348440, 0.000000],
        [1.404750, 0.591650, -1.404750],
        [1.404750, 0.591650, 1.404750],
        [1.411910, 2.336130, -0.145291],
        [1.411910, 2.336130, 0.145291],
        [1.414820, 0.343945, -1.168120],
        [1.414820, 0.343945, 1.168120],
        [1.420000, 0.750000, -1.420000],
        [1.420000, 0.750000, 1.420000],
        [1.420230, 2.323830, -0.295278],
        [1.420230, 2.323830, 0.295278],
        [1.449220, 2.323830, 0.000000],
        [1.454690, 0.234375, -0.984375],
        [1.454690, 0.234375, 0.984375],
        [1.455820, 0.085547, -0.619414],
        [1.455820, 0.085547, 0.619414],
        [1.459170, 0.159961, -0.794590],
        [1.459170, 0.159961, 0.794590],
        [1.459860, 2.286910, -0.150226],
        [1.459860, 2.286910, 0.150226],
        [1.464030, 0.042773, -0.458833],
        [1.464030, 0.042773, 0.458833],
        [1.464490, 1.286130, -1.209120],
        [1.464490, 1.286130, 1.209120],
        [1.466020, 1.860940, -0.798320],
        [1.466020, 1.860940, 0.798320],
        [1.470000, 0.000000, -0.305625],
        [1.470000, 0.000000, 0.305625],
        [1.470000, 2.250000, -0.305625],
        [1.470000, 2.250000, 0.305625],
        [1.500000, 0.000000, 0.000000],
        [1.500000, 2.250000, 0.000000],
        [1.502870, 0.522583, -1.240810],
        [1.502870, 0.522583, 1.240810],
        [1.523670, 0.042773, -0.156792],
        [1.523670, 0.042773, 0.156792],
        [1.524690, 0.925195, -1.258830],
        [1.524690, 0.925195, 1.258830],
        [1.532620, 1.471870, -1.037110],
        [1.532620, 1.471870, 1.037110],
        [1.532970, 0.670825, -1.265670],
        [1.532970, 0.670825, 1.265670],
        [1.546560, 0.085547, -0.321543],
        [1.546560, 0.085547, 0.321543],
        [1.578130, 0.085547, 0.000000],
        [1.582940, 0.159961, -0.496099],
        [1.582940, 0.159961, 0.496099],
        [1.590370, 1.860940, -0.498428],
        [1.590370, 1.860940, 0.498428],
        [1.597560, 0.453516, -1.081060],
        [1.597560, 0.453516, 1.081060],
        [1.609890, 0.343945, -0.876660],
        [1.609890, 0.343945, 0.876660],
        [1.614370, 0.234375, -0.686875],
        [1.614370, 0.234375, 0.686875],
        [1.626780, 1.100390, -1.100830],
        [1.626780, 1.100390, 1.100830],
        [1.644640, 0.591650, -1.112920],
        [1.644640, 0.591650, 1.112920],
        [1.647420, 0.159961, -0.169526],
        [1.647420, 0.159961, 0.169526],
        [1.655160, 1.860940, -0.170322],
        [1.655160, 1.860940, 0.170322],
        [1.662500, 0.750000, -1.125000],
        [1.662500, 0.750000, 1.125000],
        [1.666400, 1.286130, -0.907437],
        [1.666400, 1.286130, 0.907437],
        [1.700000, 0.450000, 0.000000],
        [1.700000, 0.485449, -0.216563],
        [1.700000, 0.485449, 0.216563],
        [1.700000, 0.578906, -0.371250],
        [1.700000, 0.578906, 0.371250],
        [1.700000, 0.711035, -0.464063],
        [1.700000, 0.711035, 0.464063],
        [1.700000, 0.862500, -0.495000],
        [1.700000, 0.862500, 0.495000],
        [1.700000, 1.013970, -0.464063],
        [1.700000, 1.013970, 0.464063],
        [1.700000, 1.146090, -0.371250],
        [1.700000, 1.146090, 0.371250],
        [1.700000, 1.239550, -0.216563],
        [1.700000, 1.239550, 0.216563],
        [1.700000, 1.275000, 0.000000],
        [1.700860, 1.471870, -0.723672],
        [1.700860, 1.471870, 0.723672],
        [1.710080, 0.522583, -0.931218],
        [1.710080, 0.522583, 0.931218],
        [1.715000, 0.234375, -0.356562],
        [1.715000, 0.234375, 0.356563],
        [1.734910, 0.925195, -0.944741],
        [1.734910, 0.925195, 0.944741],
        [1.744330, 0.670825, -0.949871],
        [1.744330, 0.670825, 0.949871],
        [1.746440, 0.343945, -0.547339],
        [1.746440, 0.343945, 0.547339],
        [1.750000, 0.234375, 0.000000],
        [1.772930, 0.453516, -0.754336],
        [1.772930, 0.453516, 0.754336],
        [1.805360, 1.100390, -0.768135],
        [1.805360, 1.100390, 0.768135],
        [1.806870, 1.471870, -0.375664],
        [1.806870, 1.471870, 0.375664],
        [1.807750, 1.286130, -0.566554],
        [1.807750, 1.286130, 0.566554],
        [1.808680, 0.669440, -0.415335],
        [1.808680, 0.669440, 0.415335],
        [1.815230, 0.556498, -0.292881],
        [1.815230, 0.556498, 0.292881],
        [1.817580, 0.343945, -0.187036],
        [1.817580, 0.343945, 0.187036],
        [1.818500, 0.493823, -0.107904],
        [1.818500, 0.493823, 0.107904],
        [1.825180, 0.591650, -0.776567],
        [1.825180, 0.591650, 0.776567],
        [1.843750, 1.471870, 0.000000],
        [1.844080, 1.273110, -0.106836],
        [1.844080, 1.273110, 0.106836],
        [1.845000, 0.750000, -0.785000],
        [1.845000, 0.750000, 0.785000],
        [1.849890, 1.212450, -0.289984],
        [1.849890, 1.212450, 0.289984],
        [1.855120, 0.522583, -0.581402],
        [1.855120, 0.522583, 0.581402],
        [1.860070, 1.106280, -0.412082],
        [1.860070, 1.106280, 0.412082],
        [1.872860, 0.972820, -0.473131],
        [1.872860, 0.972820, 0.473131],
        [1.881390, 1.286130, -0.193602],
        [1.881390, 1.286130, 0.193602],
        [1.882060, 0.925195, -0.589845],
        [1.882060, 0.925195, 0.589845],
        [1.883440, 0.453516, -0.391582],
        [1.883440, 0.453516, 0.391582],
        [1.886520, 0.830257, -0.473131],
        [1.886520, 0.830257, 0.473131],
        [1.892280, 0.670825, -0.593047],
        [1.892280, 0.670825, 0.593047],
        [1.908980, 0.762851, -0.457368],
        [1.908980, 0.762851, 0.457368],
        [1.917890, 1.100390, -0.398745],
        [1.917890, 1.100390, 0.398745],
        [1.921880, 0.453516, 0.000000],
        [1.925720, 0.624968, -0.368660],
        [1.925720, 0.624968, 0.368660],
        [1.930690, 0.522583, -0.198676],
        [1.930690, 0.522583, 0.198676],
        [1.935200, 0.536667, -0.215052],
        [1.935200, 0.536667, 0.215052],
        [1.938790, 0.503174, 0.000000],
        [1.938950, 0.591650, -0.403123],
        [1.938950, 0.591650, 0.403123],
        [1.957030, 1.100390, 0.000000],
        [1.958730, 0.925195, -0.201561],
        [1.958730, 0.925195, 0.201561],
        [1.960000, 0.750000, -0.407500],
        [1.960000, 0.750000, 0.407500],
        [1.969370, 0.670825, -0.202656],
        [1.969370, 0.670825, 0.202656],
        [1.978520, 0.591650, 0.000000],
        [1.984960, 1.304590, 0.000000],
        [1.991360, 1.273310, -0.210782],
        [1.991360, 1.273310, 0.210782],
        [2.000000, 0.750000, 0.000000],
        [2.007990, 0.721263, -0.409761],
        [2.007990, 0.721263, 0.409761],
        [2.008210, 1.190840, -0.361340],
        [2.008210, 1.190840, 0.361340],
        [2.024710, 0.614949, -0.288958],
        [2.024710, 0.614949, 0.288958],
        [2.032050, 1.074240, -0.451675],
        [2.032050, 1.074240, 0.451675],
        [2.033790, 0.556062, -0.106458],
        [2.033790, 0.556062, 0.106458],
        [2.059380, 0.940576, -0.481787],
        [2.059380, 0.940576, 0.481787],
        [2.086440, 1.330480, -0.101581],
        [2.086440, 1.330480, 0.101581],
        [2.086700, 0.806915, -0.451675],
        [2.086700, 0.806915, 0.451675],
        [2.101410, 1.278150, -0.275720],
        [2.101410, 1.278150, 0.275720],
        [2.110530, 0.690317, -0.361340],
        [2.110530, 0.690317, 0.361340],
        [2.127390, 0.607845, -0.210782],
        [2.127390, 0.607845, 0.210782],
        [2.127600, 1.186560, -0.391812],
        [2.127600, 1.186560, 0.391812],
        [2.133790, 0.576563, 0.000000],
        [2.160540, 1.071430, -0.449859],
        [2.160540, 1.071430, 0.449859],
        [2.169220, 0.790259, -0.399360],
        [2.169220, 0.790259, 0.399360],
        [2.179690, 1.385160, 0.000000],
        [2.189760, 1.358870, -0.195542],
        [2.189760, 1.358870, 0.195542],
        [2.194810, 0.691761, -0.281559],
        [2.194810, 0.691761, 0.281559],
        [2.195710, 0.948444, -0.449859],
        [2.195710, 0.948444, 0.449859],
        [2.208370, 0.637082, -0.103732],
        [2.208370, 0.637082, 0.103732],
        [2.216310, 1.289570, -0.335215],
        [2.216310, 1.289570, 0.335215],
        [2.220200, 0.891314, -0.434457],
        [2.220200, 0.891314, 0.434457],
        [2.248570, 1.433000, -0.092384],
        [2.248570, 1.433000, 0.092384],
        [2.253840, 1.191600, -0.419019],
        [2.253840, 1.191600, 0.419019],
        [2.259440, 0.772489, -0.349967],
        [2.259440, 0.772489, 0.349967],
        [2.268570, 1.390160, -0.250758],
        [2.268570, 1.390160, 0.250758],
        [2.281890, 0.696393, -0.204147],
        [2.281890, 0.696393, 0.204147],
        [2.290410, 0.667529, 0.000000],
        [2.296880, 1.079300, -0.446953],
        [2.296880, 1.079300, 0.446953],
        [2.299250, 0.874953, -0.384664],
        [2.299250, 0.874953, 0.384664],
        [2.303580, 1.315200, -0.356340],
        [2.303580, 1.315200, 0.356340],
        [2.306440, 1.504400, 0.000000],
        [2.318380, 1.483560, -0.173996],
        [2.318380, 1.483560, 0.173996],
        [2.330690, 0.784406, -0.271218],
        [2.330690, 0.784406, 0.271218],
        [2.339910, 0.966989, -0.419019],
        [2.339910, 0.966989, 0.419019],
        [2.347590, 0.734271, -0.099922],
        [2.347590, 0.734271, 0.099922],
        [2.347590, 1.220960, -0.409131],
        [2.347590, 1.220960, 0.409131],
        [2.349840, 1.428640, -0.298279],
        [2.349840, 1.428640, 0.298279],
        [2.353180, 1.568160, -0.080823],
        [2.353180, 1.568160, 0.080823],
        [2.375750, 1.535310, -0.219377],
        [2.375750, 1.535310, 0.219377],
        [2.377440, 0.869019, -0.335215],
        [2.377440, 0.869019, 0.335215],
        [2.387500, 1.650000, 0.000000],
        [2.394320, 1.350980, -0.372849],
        [2.394320, 1.350980, 0.372849],
        [2.394600, 1.120300, -0.409131],
        [2.394600, 1.120300, 0.409131],
        [2.400390, 1.634690, -0.149297],
        [2.400390, 1.634690, 0.149297],
        [2.403990, 0.799722, -0.195542],
        [2.403990, 0.799722, 0.195542],
        [2.414060, 0.773438, 0.000000],
        [2.415240, 1.477810, -0.311747],
        [2.415240, 1.477810, 0.311747],
        [2.434380, 1.594340, -0.255938],
        [2.434380, 1.594340, 0.255938],
        [2.438610, 1.026060, -0.356340],
        [2.438610, 1.026060, 0.356340],
        [2.445310, 1.261960, -0.397705],
        [2.445310, 1.261960, 0.397705],
        [2.451680, 1.805340, -0.063087],
        [2.451680, 1.805340, 0.063087],
        [2.464890, 1.405520, -0.357931],
        [2.464890, 1.405520, 0.357931],
        [2.473620, 0.951099, -0.250758],
        [2.473620, 0.951099, 0.250758],
        [2.477680, 1.786380, -0.171237],
        [2.477680, 1.786380, 0.171237],
        [2.482420, 1.537280, -0.319922],
        [2.482420, 1.537280, 0.319922],
        [2.493620, 0.908264, -0.092384],
        [2.493620, 0.908264, 0.092384],
        [2.496300, 1.172950, -0.372849],
        [2.496300, 1.172950, 0.372849],
        [2.501560, 1.971090, 0.000000],
        [2.517270, 1.965550, -0.103052],
        [2.517270, 1.965550, 0.103052],
        [2.517920, 1.328310, -0.357931],
        [2.517920, 1.328310, 0.357931],
        [2.523180, 1.753220, -0.243336],
        [2.523180, 1.753220, 0.243336],
        [2.537500, 1.471870, -0.341250],
        [2.537500, 1.471870, 0.341250],
        [2.540780, 1.095290, -0.298279],
        [2.540780, 1.095290, 0.298279],
        [2.549110, 2.044640, -0.047716],
        [2.549110, 2.044640, 0.047716],
        [2.558690, 1.950950, -0.176660],
        [2.558690, 1.950950, 0.176660],
        [2.567570, 1.256030, -0.311747],
        [2.567570, 1.256030, 0.311747],
        [2.572250, 1.040360, -0.173996],
        [2.572250, 1.040360, 0.173996],
        [2.579100, 2.121970, 0.000000],
        [2.580390, 1.711530, -0.279386],
        [2.580390, 1.711530, 0.279386],
        [2.581010, 2.037730, -0.129515],
        [2.581010, 2.037730, 0.129515],
        [2.584180, 1.019530, 0.000000],
        [2.592580, 1.406470, -0.319922],
        [2.592580, 1.406470, 0.319922],
        [2.598490, 2.119920, -0.087812],
        [2.598490, 2.119920, 0.087812],
        [2.601780, 1.554720, -0.304019],
        [2.601780, 1.554720, 0.304019],
        [2.607070, 1.198530, -0.219377],
        [2.607070, 1.198530, 0.219377],
        [2.611620, 1.691280, -0.287908],
        [2.611620, 1.691280, 0.287908],
        [2.617250, 1.930310, -0.220825],
        [2.617250, 1.930310, 0.220825],
        [2.629630, 1.165680, -0.080823],
        [2.629630, 1.165680, 0.080823],
        [2.637880, 2.025550, -0.180818],
        [2.637880, 2.025550, 0.180818],
        [2.640630, 1.349410, -0.255938],
        [2.640630, 1.349410, 0.255938],
        [2.649600, 2.114510, -0.150535],
        [2.649600, 2.114510, 0.150535],
        [2.650840, 2.185470, -0.042461],
        [2.650840, 2.185470, 0.042461],
        [2.653910, 1.504200, -0.264113],
        [2.653910, 1.504200, 0.264113],
        [2.665420, 1.649250, -0.266995],
        [2.665420, 1.649250, 0.266995],
        [2.674610, 1.309060, -0.149297],
        [2.674610, 1.309060, 0.149297],
        [2.678230, 1.782540, -0.252819],
        [2.678230, 1.782540, 0.252819],
        [2.684380, 1.906640, -0.235547],
        [2.684380, 1.906640, 0.235547],
        [2.687500, 1.293750, 0.000000],
        [2.691900, 2.183610, -0.115251],
        [2.691900, 2.183610, 0.115251],
        [2.696450, 1.463800, -0.185857],
        [2.696450, 1.463800, 0.185857],
        [2.700000, 2.250000, 0.000000],
        [2.708080, 2.010370, -0.208084],
        [2.708080, 2.010370, 0.208084],
        [2.717030, 1.611670, -0.213596],
        [2.717030, 1.611670, 0.213596],
        [2.720760, 1.440720, -0.068474],
        [2.720760, 1.440720, 0.068474],
        [2.725780, 2.250000, -0.082031],
        [2.725780, 2.250000, 0.082031],
        [2.725990, 2.106430, -0.175250],
        [2.725990, 2.106430, 0.175250],
        [2.736000, 1.751550, -0.219519],
        [2.736000, 1.751550, 0.219519],
        [2.750210, 2.269190, -0.039734],
        [2.750210, 2.269190, 0.039734],
        [2.751500, 1.882970, -0.220825],
        [2.751500, 1.882970, 0.220825],
        [2.753540, 1.585080, -0.124598],
        [2.753540, 1.585080, 0.124598],
        [2.767380, 1.575000, 0.000000],
        [2.775560, 2.284000, 0.000000],
        [2.780990, 1.994370, -0.208084],
        [2.780990, 1.994370, 0.208084],
        [2.783030, 1.726700, -0.154476],
        [2.783030, 1.726700, 0.154476],
        [2.793750, 2.250000, -0.140625],
        [2.793750, 2.250000, 0.140625],
        [2.797820, 2.271750, -0.107849],
        [2.797820, 2.271750, 0.107849],
        [2.799490, 2.292750, -0.076904],
        [2.799490, 2.292750, 0.076904],
        [2.800000, 2.250000, 0.000000],
        [2.804690, 2.098100, -0.200713],
        [2.804690, 2.098100, 0.200713],
        [2.809900, 1.712500, -0.056912],
        [2.809900, 1.712500, 0.056912],
        [2.810060, 1.862330, -0.176660],
        [2.810060, 1.862330, 0.176660],
        [2.812010, 2.178150, -0.169843],
        [2.812010, 2.178150, 0.169843],
        [2.812740, 2.297540, -0.035632],
        [2.812740, 2.297540, 0.035632],
        [2.817190, 2.250000, -0.049219],
        [2.817190, 2.250000, 0.049219],
        [2.825000, 2.306250, 0.000000],
        [2.830110, 2.271290, -0.025891],
        [2.830110, 2.271290, 0.025891],
        [2.840630, 2.292190, 0.000000],
        [2.844790, 2.299640, -0.029993],
        [2.844790, 2.299640, 0.029993],
        [2.850920, 2.307160, -0.065625],
        [2.850920, 2.307160, 0.065625],
        [2.851180, 1.979190, -0.180818],
        [2.851180, 1.979190, 0.180818],
        [2.851480, 1.847730, -0.103052],
        [2.851480, 1.847730, 0.103052],
        [2.860480, 2.300930, -0.096716],
        [2.860480, 2.300930, 0.096716],
        [2.862500, 2.250000, -0.084375],
        [2.862500, 2.250000, 0.084375],
        [2.862630, 2.292980, -0.054346],
        [2.862630, 2.292980, 0.054346],
        [2.865740, 2.272010, -0.070276],
        [2.865740, 2.272010, 0.070276],
        [2.867190, 1.842190, 0.000000],
        [2.872280, 2.294250, -0.131836],
        [2.872280, 2.294250, 0.131836],
        [2.883390, 2.089770, -0.175250],
        [2.883390, 2.089770, 0.175250],
        [2.888360, 2.301190, -0.081409],
        [2.888360, 2.301190, 0.081409],
        [2.898270, 2.170880, -0.194382],
        [2.898270, 2.170880, 0.194382],
        [2.908050, 1.967000, -0.129515],
        [2.908050, 1.967000, 0.129515],
        [2.919240, 2.309550, -0.112500],
        [2.919240, 2.309550, 0.112500],
        [2.920640, 2.295070, -0.093164],
        [2.920640, 2.295070, 0.093164],
        [2.932790, 2.131030, -0.172211],
        [2.932790, 2.131030, 0.172211],
        [2.939800, 2.273260, -0.158936],
        [2.939800, 2.273260, 0.158936],
        [2.939960, 1.960100, -0.047716],
        [2.939960, 1.960100, 0.047716],
        [2.959780, 2.081680, -0.150535],
        [2.959780, 2.081680, 0.150535],
        [2.969950, 2.274120, -0.103564],
        [2.969950, 2.274120, 0.103564],
        [3.000000, 2.250000, -0.187500],
        [3.000000, 2.250000, -0.112500],
        [3.000000, 2.250000, 0.112500],
        [3.000000, 2.250000, 0.187500],
        [3.002810, 2.304840, -0.142529],
        [3.002810, 2.304840, 0.142529],
        [3.010890, 2.076270, -0.087812],
        [3.010890, 2.076270, 0.087812],
        [3.015780, 2.305710, -0.119971],
        [3.015780, 2.305710, 0.119971],
        [3.030270, 2.074220, 0.000000],
        [3.041500, 2.125670, -0.116276],
        [3.041500, 2.125670, 0.116276],
        [3.043230, 2.211080, -0.166431],
        [3.043230, 2.211080, 0.166431],
        [3.068420, 2.173450, -0.143215],
        [3.068420, 2.173450, 0.143215],
        [3.079290, 2.123060, -0.042838],
        [3.079290, 2.123060, 0.042838],
        [3.093160, 2.298780, -0.175781],
        [3.093160, 2.298780, 0.175781],
        [3.096680, 2.301420, -0.124219],
        [3.096680, 2.301420, 0.124219],
        [3.126560, 2.316800, -0.150000],
        [3.126560, 2.316800, 0.150000],
        [3.126720, 2.277290, -0.103564],
        [3.126720, 2.277290, 0.103564],
        [3.126910, 2.171280, -0.083542],
        [3.126910, 2.171280, 0.083542],
        [3.137500, 2.250000, -0.084375],
        [3.137500, 2.250000, 0.084375],
        [3.149100, 2.170460, 0.000000],
        [3.153370, 2.275520, -0.158936],
        [3.153370, 2.275520, 0.158936],
        [3.168950, 2.211180, -0.112353],
        [3.168950, 2.211180, 0.112353],
        [3.182810, 2.250000, -0.049219],
        [3.182810, 2.250000, 0.049219],
        [3.200000, 2.250000, 0.000000],
        [3.206250, 2.250000, -0.140625],
        [3.206250, 2.250000, 0.140625],
        [3.207460, 2.312510, -0.119971],
        [3.207460, 2.312510, 0.119971],
        [3.212560, 2.210430, -0.041393],
        [3.212560, 2.210430, 0.041393],
        [3.216920, 2.310730, -0.142529],
        [3.216920, 2.310730, 0.142529],
        [3.230940, 2.279400, -0.070276],
        [3.230940, 2.279400, 0.070276],
        [3.267240, 2.278140, -0.025891],
        [3.267240, 2.278140, 0.025891],
        [3.272720, 2.307760, -0.093164],
        [3.272720, 2.307760, 0.093164],
        [3.274220, 2.250000, -0.082031],
        [3.274220, 2.250000, 0.082031],
        [3.295340, 2.277030, -0.107849],
        [3.295340, 2.277030, 0.107849],
        [3.300000, 2.250000, 0.000000],
        [3.314050, 2.303310, -0.131836],
        [3.314050, 2.303310, 0.131836],
        [3.330730, 2.309850, -0.054346],
        [3.330730, 2.309850, 0.054346],
        [3.333890, 2.324050, -0.112500],
        [3.333890, 2.324050, 0.112500],
        [3.334890, 2.317020, -0.081409],
        [3.334890, 2.317020, 0.081409],
        [3.342360, 2.280060, -0.039734],
        [3.342360, 2.280060, 0.039734],
        [3.355430, 2.302700, 0.000000],
        [3.359250, 2.314650, -0.096716],
        [3.359250, 2.314650, 0.096716],
        [3.379120, 2.316580, -0.029993],
        [3.379120, 2.316580, 0.029993],
        [3.386840, 2.304810, -0.076904],
        [3.386840, 2.304810, 0.076904],
        [3.402210, 2.326440, -0.065625],
        [3.402210, 2.326440, 0.065625],
        [3.406390, 2.318500, -0.035632],
        [3.406390, 2.318500, 0.035632],
        [3.408380, 2.315430, 0.000000],
        [3.428120, 2.327340, 0.000000]
    ];

    var indices = [
        [1454,1468,1458],
        [1448,1454,1458],
        [1461,1448,1458],
        [1468,1461,1458],
        [1429,1454,1440],
        [1421,1429,1440],
        [1448,1421,1440],
        [1454,1448,1440],
        [1380,1429,1398],
        [1373,1380,1398],
        [1421,1373,1398],
        [1429,1421,1398],
        [1327,1380,1349],
        [1319,1327,1349],
        [1373,1319,1349],
        [1380,1373,1349],
        [1448,1461,1460],
        [1456,1448,1460],
        [1471,1456,1460],
        [1461,1471,1460],
        [1421,1448,1442],
        [1433,1421,1442],
        [1456,1433,1442],
        [1448,1456,1442],
        [1373,1421,1400],
        [1382,1373,1400],
        [1433,1382,1400],
        [1421,1433,1400],
        [1319,1373,1351],
        [1329,1319,1351],
        [1382,1329,1351],
        [1373,1382,1351],
        [1264,1327,1289],
        [1258,1264,1289],
        [1319,1258,1289],
        [1327,1319,1289],
        [1192,1264,1228],
        [1188,1192,1228],
        [1258,1188,1228],
        [1264,1258,1228],
        [1100,1192,1157],
        [1098,1100,1157],
        [1188,1098,1157],
        [1192,1188,1157],
        [922,1100,1006],
        [928,922,1006],
        [1098,928,1006],
        [1100,1098,1006],
        [1258,1319,1291],
        [1266,1258,1291],
        [1329,1266,1291],
        [1319,1329,1291],
        [1188,1258,1230],
        [1194,1188,1230],
        [1266,1194,1230],
        [1258,1266,1230],
        [1098,1188,1159],
        [1102,1098,1159],
        [1194,1102,1159],
        [1188,1194,1159],
        [928,1098,1008],
        [933,928,1008],
        [1102,933,1008],
        [1098,1102,1008],
        [1456,1471,1475],
        [1481,1456,1475],
        [1482,1481,1475],
        [1471,1482,1475],
        [1433,1456,1450],
        [1444,1433,1450],
        [1481,1444,1450],
        [1456,1481,1450],
        [1382,1433,1412],
        [1392,1382,1412],
        [1444,1392,1412],
        [1433,1444,1412],
        [1329,1382,1357],
        [1331,1329,1357],
        [1392,1331,1357],
        [1382,1392,1357],
        [1481,1482,1490],
        [1500,1481,1490],
        [1502,1500,1490],
        [1482,1502,1490],
        [1444,1481,1470],
        [1465,1444,1470],
        [1500,1465,1470],
        [1481,1500,1470],
        [1392,1444,1431],
        [1410,1392,1431],
        [1465,1410,1431],
        [1444,1465,1431],
        [1331,1392,1371],
        [1345,1331,1371],
        [1410,1345,1371],
        [1392,1410,1371],
        [1266,1329,1297],
        [1276,1266,1297],
        [1331,1276,1297],
        [1329,1331,1297],
        [1194,1266,1232],
        [1200,1194,1232],
        [1276,1200,1232],
        [1266,1276,1232],
        [1102,1194,1163],
        [1106,1102,1163],
        [1200,1106,1163],
        [1194,1200,1163],
        [933,1102,1016],
        [929,933,1016],
        [1106,929,1016],
        [1102,1106,1016],
        [1276,1331,1307],
        [1283,1276,1307],
        [1345,1283,1307],
        [1331,1345,1307],
        [1200,1276,1238],
        [1210,1200,1238],
        [1283,1210,1238],
        [1276,1283,1238],
        [1106,1200,1167],
        [1116,1106,1167],
        [1210,1116,1167],
        [1200,1210,1167],
        [929,1106,1022],
        [923,929,1022],
        [1116,923,1022],
        [1106,1116,1022],
        [755,922,849],
        [757,755,849],
        [928,757,849],
        [922,928,849],
        [663,755,698],
        [667,663,698],
        [757,667,698],
        [755,757,698],
        [591,663,627],
        [597,591,627],
        [667,597,627],
        [663,667,627],
        [528,591,566],
        [536,528,566],
        [597,536,566],
        [591,597,566],
        [757,928,847],
        [753,757,847],
        [933,753,847],
        [928,933,847],
        [667,757,696],
        [661,667,696],
        [753,661,696],
        [757,753,696],
        [597,667,625],
        [589,597,625],
        [661,589,625],
        [667,661,625],
        [536,597,564],
        [526,536,564],
        [589,526,564],
        [597,589,564],
        [475,528,506],
        [482,475,506],
        [536,482,506],
        [528,536,506],
        [426,475,457],
        [434,426,457],
        [482,434,457],
        [475,482,457],
        [401,426,415],
        [407,401,415],
        [434,407,415],
        [426,434,415],
        [386,401,397],
        [393,386,397],
        [407,393,397],
        [401,407,397],
        [482,536,504],
        [473,482,504],
        [526,473,504],
        [536,526,504],
        [434,482,455],
        [422,434,455],
        [473,422,455],
        [482,473,455],
        [407,434,413],
        [399,407,413],
        [422,399,413],
        [434,422,413],
        [393,407,395],
        [383,393,395],
        [399,383,395],
        [407,399,395],
        [753,933,839],
        [749,753,839],
        [929,749,839],
        [933,929,839],
        [661,753,692],
        [655,661,692],
        [749,655,692],
        [753,749,692],
        [589,661,623],
        [579,589,623],
        [655,579,623],
        [661,655,623],
        [526,589,558],
        [524,526,558],
        [579,524,558],
        [589,579,558],
        [749,929,833],
        [741,749,833],
        [923,741,833],
        [929,923,833],
        [655,749,688],
        [647,655,688],
        [741,647,688],
        [749,741,688],
        [579,655,617],
        [574,579,617],
        [647,574,617],
        [655,647,617],
        [524,579,548],
        [512,524,548],
        [574,512,548],
        [579,574,548],
        [473,526,498],
        [463,473,498],
        [524,463,498],
        [526,524,498],
        [422,473,443],
        [411,422,443],
        [463,411,443],
        [473,463,443],
        [399,422,405],
        [374,399,405],
        [411,374,405],
        [422,411,405],
        [383,399,380],
        [372,383,380],
        [374,372,380],
        [399,374,380],
        [463,524,484],
        [447,463,484],
        [512,447,484],
        [524,512,484],
        [411,463,424],
        [392,411,424],
        [447,392,424],
        [463,447,424],
        [374,411,385],
        [357,374,385],
        [392,357,385],
        [411,392,385],
        [372,374,365],
        [353,372,365],
        [357,353,365],
        [374,357,365],
        [400,386,396],
        [406,400,396],
        [393,406,396],
        [386,393,396],
        [425,400,414],
        [433,425,414],
        [406,433,414],
        [400,406,414],
        [474,425,456],
        [481,474,456],
        [433,481,456],
        [425,433,456],
        [527,474,505],
        [535,527,505],
        [481,535,505],
        [474,481,505],
        [406,393,394],
        [398,406,394],
        [383,398,394],
        [393,383,394],
        [433,406,412],
        [421,433,412],
        [398,421,412],
        [406,398,412],
        [481,433,454],
        [472,481,454],
        [421,472,454],
        [433,421,454],
        [535,481,503],
        [525,535,503],
        [472,525,503],
        [481,472,503],
        [590,527,565],
        [596,590,565],
        [535,596,565],
        [527,535,565],
        [662,590,626],
        [666,662,626],
        [596,666,626],
        [590,596,626],
        [754,662,697],
        [756,754,697],
        [666,756,697],
        [662,666,697],
        [919,754,848],
        [927,919,848],
        [756,927,848],
        [754,756,848],
        [596,535,563],
        [588,596,563],
        [525,588,563],
        [535,525,563],
        [666,596,624],
        [660,666,624],
        [588,660,624],
        [596,588,624],
        [756,666,695],
        [752,756,695],
        [660,752,695],
        [666,660,695],
        [927,756,846],
        [932,927,846],
        [752,932,846],
        [756,752,846],
        [398,383,379],
        [373,398,379],
        [372,373,379],
        [383,372,379],
        [421,398,404],
        [410,421,404],
        [373,410,404],
        [398,373,404],
        [472,421,442],
        [462,472,442],
        [410,462,442],
        [421,410,442],
        [525,472,497],
        [523,525,497],
        [462,523,497],
        [472,462,497],
        [373,372,364],
        [356,373,364],
        [353,356,364],
        [372,353,364],
        [410,373,384],
        [391,410,384],
        [356,391,384],
        [373,356,384],
        [462,410,423],
        [446,462,423],
        [391,446,423],
        [410,391,423],
        [523,462,483],
        [511,523,483],
        [446,511,483],
        [462,446,483],
        [588,525,557],
        [578,588,557],
        [523,578,557],
        [525,523,557],
        [660,588,622],
        [654,660,622],
        [578,654,622],
        [588,578,622],
        [752,660,691],
        [748,752,691],
        [654,748,691],
        [660,654,691],
        [932,752,838],
        [926,932,838],
        [748,926,838],
        [752,748,838],
        [578,523,547],
        [573,578,547],
        [511,573,547],
        [523,511,547],
        [654,578,616],
        [646,654,616],
        [573,646,616],
        [578,573,616],
        [748,654,687],
        [740,748,687],
        [646,740,687],
        [654,646,687],
        [926,748,832],
        [918,926,832],
        [740,918,832],
        [748,740,832],
        [1099,919,1005],
        [1097,1099,1005],
        [927,1097,1005],
        [919,927,1005],
        [1191,1099,1156],
        [1187,1191,1156],
        [1097,1187,1156],
        [1099,1097,1156],
        [1263,1191,1227],
        [1257,1263,1227],
        [1187,1257,1227],
        [1191,1187,1227],
        [1326,1263,1288],
        [1318,1326,1288],
        [1257,1318,1288],
        [1263,1257,1288],
        [1097,927,1007],
        [1101,1097,1007],
        [932,1101,1007],
        [927,932,1007],
        [1187,1097,1158],
        [1193,1187,1158],
        [1101,1193,1158],
        [1097,1101,1158],
        [1257,1187,1229],
        [1265,1257,1229],
        [1193,1265,1229],
        [1187,1193,1229],
        [1318,1257,1290],
        [1328,1318,1290],
        [1265,1328,1290],
        [1257,1265,1290],
        [1379,1326,1348],
        [1372,1379,1348],
        [1318,1372,1348],
        [1326,1318,1348],
        [1428,1379,1397],
        [1420,1428,1397],
        [1372,1420,1397],
        [1379,1372,1397],
        [1453,1428,1439],
        [1447,1453,1439],
        [1420,1447,1439],
        [1428,1420,1439],
        [1468,1453,1457],
        [1461,1468,1457],
        [1447,1461,1457],
        [1453,1447,1457],
        [1372,1318,1350],
        [1381,1372,1350],
        [1328,1381,1350],
        [1318,1328,1350],
        [1420,1372,1399],
        [1432,1420,1399],
        [1381,1432,1399],
        [1372,1381,1399],
        [1447,1420,1441],
        [1455,1447,1441],
        [1432,1455,1441],
        [1420,1432,1441],
        [1461,1447,1459],
        [1471,1461,1459],
        [1455,1471,1459],
        [1447,1455,1459],
        [1101,932,1015],
        [1105,1101,1015],
        [926,1105,1015],
        [932,926,1015],
        [1193,1101,1162],
        [1199,1193,1162],
        [1105,1199,1162],
        [1101,1105,1162],
        [1265,1193,1231],
        [1275,1265,1231],
        [1199,1275,1231],
        [1193,1199,1231],
        [1328,1265,1296],
        [1330,1328,1296],
        [1275,1330,1296],
        [1265,1275,1296],
        [1105,926,1021],
        [1115,1105,1021],
        [918,1115,1021],
        [926,918,1021],
        [1199,1105,1166],
        [1209,1199,1166],
        [1115,1209,1166],
        [1105,1115,1166],
        [1275,1199,1237],
        [1282,1275,1237],
        [1209,1282,1237],
        [1199,1209,1237],
        [1330,1275,1306],
        [1344,1330,1306],
        [1282,1344,1306],
        [1275,1282,1306],
        [1381,1328,1356],
        [1391,1381,1356],
        [1330,1391,1356],
        [1328,1330,1356],
        [1432,1381,1411],
        [1443,1432,1411],
        [1391,1443,1411],
        [1381,1391,1411],
        [1455,1432,1449],
        [1480,1455,1449],
        [1443,1480,1449],
        [1432,1443,1449],
        [1471,1455,1474],
        [1482,1471,1474],
        [1480,1482,1474],
        [1455,1480,1474],
        [1391,1330,1370],
        [1409,1391,1370],
        [1344,1409,1370],
        [1330,1344,1370],
        [1443,1391,1430],
        [1464,1443,1430],
        [1409,1464,1430],
        [1391,1409,1430],
        [1480,1443,1469],
        [1499,1480,1469],
        [1464,1499,1469],
        [1443,1464,1469],
        [1482,1480,1489],
        [1502,1482,1489],
        [1499,1502,1489],
        [1480,1499,1489],
        [1500,1502,1533],
        [1572,1500,1533],
        [1585,1572,1533],
        [1502,1585,1533],
        [1465,1500,1519],
        [1555,1465,1519],
        [1572,1555,1519],
        [1500,1572,1519],
        [1410,1465,1496],
        [1510,1410,1496],
        [1555,1510,1496],
        [1465,1555,1496],
        [1345,1410,1427],
        [1436,1345,1427],
        [1510,1436,1427],
        [1410,1510,1427],
        [1283,1345,1341],
        [1333,1283,1341],
        [1436,1333,1341],
        [1345,1436,1341],
        [1210,1283,1270],
        [1242,1210,1270],
        [1333,1242,1270],
        [1283,1333,1270],
        [1116,1210,1184],
        [1143,1116,1184],
        [1242,1143,1184],
        [1210,1242,1184],
        [923,1116,1037],
        [917,923,1037],
        [1143,917,1037],
        [1116,1143,1037],
        [1572,1585,1599],
        [1611,1572,1599],
        [1622,1611,1599],
        [1585,1622,1599],
        [1555,1572,1574],
        [1570,1555,1574],
        [1611,1570,1574],
        [1572,1611,1574],
        [1510,1555,1537],
        [1527,1510,1537],
        [1570,1527,1537],
        [1555,1570,1537],
        [1436,1510,1494],
        [1467,1436,1494],
        [1527,1467,1494],
        [1510,1527,1494],
        [1611,1622,1624],
        [1626,1611,1624],
        [1633,1626,1624],
        [1622,1633,1624],
        [1570,1611,1601],
        [1589,1570,1601],
        [1626,1589,1601],
        [1611,1626,1601],
        [1527,1570,1561],
        [1535,1527,1561],
        [1589,1535,1561],
        [1570,1589,1561],
        [1467,1527,1508],
        [1479,1467,1508],
        [1535,1479,1508],
        [1527,1535,1508],
        [1333,1436,1394],
        [1359,1333,1394],
        [1467,1359,1394],
        [1436,1467,1394],
        [1242,1333,1299],
        [1254,1242,1299],
        [1359,1254,1299],
        [1333,1359,1299],
        [1143,1242,1198],
        [1149,1143,1198],
        [1254,1149,1198],
        [1242,1254,1198],
        [917,1143,1057],
        [915,917,1057],
        [1149,915,1057],
        [1143,1149,1057],
        [1359,1467,1414],
        [1367,1359,1414],
        [1479,1367,1414],
        [1467,1479,1414],
        [1254,1359,1311],
        [1262,1254,1311],
        [1367,1262,1311],
        [1359,1367,1311],
        [1149,1254,1212],
        [1155,1149,1212],
        [1262,1155,1212],
        [1254,1262,1212],
        [915,1149,1065],
        [913,915,1065],
        [1155,913,1065],
        [1149,1155,1065],
        [741,923,818],
        [712,741,818],
        [917,712,818],
        [923,917,818],
        [647,741,671],
        [613,647,671],
        [712,613,671],
        [741,712,671],
        [574,647,585],
        [522,574,585],
        [613,522,585],
        [647,613,585],
        [512,574,514],
        [419,512,514],
        [522,419,514],
        [574,522,514],
        [447,512,428],
        [342,447,428],
        [419,342,428],
        [512,419,428],
        [392,447,359],
        [308,392,359],
        [342,308,359],
        [447,342,359],
        [357,392,329],
        [291,357,329],
        [308,291,329],
        [392,308,329],
        [353,357,314],
        [275,353,314],
        [291,275,314],
        [357,291,314],
        [712,917,798],
        [706,712,798],
        [915,706,798],
        [917,915,798],
        [613,712,657],
        [601,613,657],
        [706,601,657],
        [712,706,657],
        [522,613,556],
        [496,522,556],
        [601,496,556],
        [613,601,556],
        [419,522,461],
        [388,419,461],
        [496,388,461],
        [522,496,461],
        [706,915,790],
        [700,706,790],
        [913,700,790],
        [915,913,790],
        [601,706,643],
        [593,601,643],
        [700,593,643],
        [706,700,643],
        [496,601,544],
        [488,496,544],
        [593,488,544],
        [601,593,544],
        [388,496,441],
        [376,388,441],
        [488,376,441],
        [496,488,441],
        [342,419,361],
        [320,342,361],
        [388,320,361],
        [419,388,361],
        [308,342,310],
        [293,308,310],
        [320,293,310],
        [342,320,310],
        [291,308,289],
        [257,291,289],
        [293,257,289],
        [308,293,289],
        [275,291,270],
        [246,275,270],
        [257,246,270],
        [291,257,270],
        [320,388,344],
        [312,320,344],
        [376,312,344],
        [388,376,344],
        [293,320,302],
        [274,293,302],
        [312,274,302],
        [320,312,302],
        [257,293,268],
        [243,257,268],
        [274,243,268],
        [293,274,268],
        [246,257,245],
        [232,246,245],
        [243,232,245],
        [257,243,245],
        [356,353,313],
        [290,356,313],
        [275,290,313],
        [353,275,313],
        [391,356,328],
        [307,391,328],
        [290,307,328],
        [356,290,328],
        [446,391,358],
        [341,446,358],
        [307,341,358],
        [391,307,358],
        [511,446,427],
        [418,511,427],
        [341,418,427],
        [446,341,427],
        [573,511,513],
        [521,573,513],
        [418,521,513],
        [511,418,513],
        [646,573,584],
        [612,646,584],
        [521,612,584],
        [573,521,584],
        [740,646,670],
        [711,740,670],
        [612,711,670],
        [646,612,670],
        [918,740,817],
        [916,918,817],
        [711,916,817],
        [740,711,817],
        [290,275,269],
        [256,290,269],
        [246,256,269],
        [275,246,269],
        [307,290,288],
        [292,307,288],
        [256,292,288],
        [290,256,288],
        [341,307,309],
        [319,341,309],
        [292,319,309],
        [307,292,309],
        [418,341,360],
        [387,418,360],
        [319,387,360],
        [341,319,360],
        [256,246,244],
        [242,256,244],
        [232,242,244],
        [246,232,244],
        [292,256,267],
        [273,292,267],
        [242,273,267],
        [256,242,267],
        [319,292,301],
        [311,319,301],
        [273,311,301],
        [292,273,301],
        [387,319,343],
        [375,387,343],
        [311,375,343],
        [319,311,343],
        [521,418,460],
        [495,521,460],
        [387,495,460],
        [418,387,460],
        [612,521,555],
        [600,612,555],
        [495,600,555],
        [521,495,555],
        [711,612,656],
        [705,711,656],
        [600,705,656],
        [612,600,656],
        [916,711,797],
        [914,916,797],
        [705,914,797],
        [711,705,797],
        [495,387,440],
        [487,495,440],
        [375,487,440],
        [387,375,440],
        [600,495,543],
        [592,600,543],
        [487,592,543],
        [495,487,543],
        [705,600,642],
        [699,705,642],
        [592,699,642],
        [600,592,642],
        [914,705,789],
        [912,914,789],
        [699,912,789],
        [705,699,789],
        [1115,918,1036],
        [1142,1115,1036],
        [916,1142,1036],
        [918,916,1036],
        [1209,1115,1183],
        [1241,1209,1183],
        [1142,1241,1183],
        [1115,1142,1183],
        [1282,1209,1269],
        [1332,1282,1269],
        [1241,1332,1269],
        [1209,1241,1269],
        [1344,1282,1340],
        [1435,1344,1340],
        [1332,1435,1340],
        [1282,1332,1340],
        [1409,1344,1426],
        [1509,1409,1426],
        [1435,1509,1426],
        [1344,1435,1426],
        [1464,1409,1495],
        [1554,1464,1495],
        [1509,1554,1495],
        [1409,1509,1495],
        [1499,1464,1518],
        [1571,1499,1518],
        [1554,1571,1518],
        [1464,1554,1518],
        [1502,1499,1532],
        [1585,1502,1532],
        [1571,1585,1532],
        [1499,1571,1532],
        [1142,916,1056],
        [1148,1142,1056],
        [914,1148,1056],
        [916,914,1056],
        [1241,1142,1197],
        [1253,1241,1197],
        [1148,1253,1197],
        [1142,1148,1197],
        [1332,1241,1298],
        [1358,1332,1298],
        [1253,1358,1298],
        [1241,1253,1298],
        [1435,1332,1393],
        [1466,1435,1393],
        [1358,1466,1393],
        [1332,1358,1393],
        [1148,914,1064],
        [1154,1148,1064],
        [912,1154,1064],
        [914,912,1064],
        [1253,1148,1211],
        [1261,1253,1211],
        [1154,1261,1211],
        [1148,1154,1211],
        [1358,1253,1310],
        [1366,1358,1310],
        [1261,1366,1310],
        [1253,1261,1310],
        [1466,1358,1413],
        [1478,1466,1413],
        [1366,1478,1413],
        [1358,1366,1413],
        [1509,1435,1493],
        [1526,1509,1493],
        [1466,1526,1493],
        [1435,1466,1493],
        [1554,1509,1536],
        [1569,1554,1536],
        [1526,1569,1536],
        [1509,1526,1536],
        [1571,1554,1573],
        [1610,1571,1573],
        [1569,1610,1573],
        [1554,1569,1573],
        [1585,1571,1598],
        [1622,1585,1598],
        [1610,1622,1598],
        [1571,1610,1598],
        [1526,1466,1507],
        [1534,1526,1507],
        [1478,1534,1507],
        [1466,1478,1507],
        [1569,1526,1560],
        [1588,1569,1560],
        [1534,1588,1560],
        [1526,1534,1560],
        [1610,1569,1600],
        [1625,1610,1600],
        [1588,1625,1600],
        [1569,1588,1600],
        [1622,1610,1623],
        [1633,1622,1623],
        [1625,1633,1623],
        [1610,1625,1623],
        [1626,1633,1628],
        [1621,1626,1628],
        [1629,1621,1628],
        [1633,1629,1628],
        [1589,1626,1607],
        [1584,1589,1607],
        [1621,1584,1607],
        [1626,1621,1607],
        [1621,1629,1616],
        [1603,1621,1616],
        [1612,1603,1616],
        [1629,1612,1616],
        [1584,1621,1593],
        [1568,1584,1593],
        [1603,1568,1593],
        [1621,1603,1593],
        [1535,1589,1563],
        [1529,1535,1563],
        [1584,1529,1563],
        [1589,1584,1563],
        [1479,1535,1512],
        [1473,1479,1512],
        [1529,1473,1512],
        [1535,1529,1512],
        [1529,1584,1557],
        [1521,1529,1557],
        [1568,1521,1557],
        [1584,1568,1557],
        [1473,1529,1504],
        [1452,1473,1504],
        [1521,1452,1504],
        [1529,1521,1504],
        [1603,1612,1580],
        [1559,1603,1580],
        [1566,1559,1580],
        [1612,1566,1580],
        [1568,1603,1565],
        [1525,1568,1565],
        [1559,1525,1565],
        [1603,1559,1565],
        [1521,1568,1523],
        [1484,1521,1523],
        [1525,1484,1523],
        [1568,1525,1523],
        [1452,1521,1477],
        [1406,1452,1477],
        [1484,1406,1477],
        [1521,1484,1477],
        [1367,1479,1417],
        [1361,1367,1417],
        [1473,1361,1417],
        [1479,1473,1417],
        [1262,1367,1313],
        [1260,1262,1313],
        [1361,1260,1313],
        [1367,1361,1313],
        [1361,1473,1404],
        [1355,1361,1404],
        [1452,1355,1404],
        [1473,1452,1404],
        [1260,1361,1303],
        [1248,1260,1303],
        [1355,1248,1303],
        [1361,1355,1303],
        [1155,1262,1214],
        [1151,1155,1214],
        [1260,1151,1214],
        [1262,1260,1214],
        [913,1155,1067],
        [911,913,1067],
        [1151,911,1067],
        [1155,1151,1067],
        [1151,1260,1204],
        [1147,1151,1204],
        [1248,1147,1204],
        [1260,1248,1204],
        [911,1151,1062],
        [909,911,1062],
        [1147,909,1062],
        [1151,1147,1062],
        [1355,1452,1384],
        [1323,1355,1384],
        [1406,1323,1384],
        [1452,1406,1384],
        [1248,1355,1287],
        [1236,1248,1287],
        [1323,1236,1287],
        [1355,1323,1287],
        [1147,1248,1190],
        [1135,1147,1190],
        [1236,1135,1190],
        [1248,1236,1190],
        [909,1147,1051],
        [907,909,1051],
        [1135,907,1051],
        [1147,1135,1051],
        [1559,1566,1531],
        [1514,1559,1531],
        [1515,1514,1531],
        [1566,1515,1531],
        [1525,1559,1517],
        [1486,1525,1517],
        [1514,1486,1517],
        [1559,1514,1517],
        [1484,1525,1488],
        [1438,1484,1488],
        [1486,1438,1488],
        [1525,1486,1488],
        [1406,1484,1425],
        [1363,1406,1425],
        [1438,1363,1425],
        [1484,1438,1425],
        [1514,1515,1506],
        [1498,1514,1506],
        [1501,1498,1506],
        [1515,1501,1506],
        [1486,1514,1492],
        [1463,1486,1492],
        [1498,1463,1492],
        [1514,1498,1492],
        [1438,1486,1446],
        [1408,1438,1446],
        [1463,1408,1446],
        [1486,1463,1446],
        [1363,1438,1386],
        [1343,1363,1386],
        [1408,1343,1386],
        [1438,1408,1386],
        [1323,1406,1337],
        [1293,1323,1337],
        [1363,1293,1337],
        [1406,1363,1337],
        [1236,1323,1268],
        [1220,1236,1268],
        [1293,1220,1268],
        [1323,1293,1268],
        [1135,1236,1182],
        [1122,1135,1182],
        [1220,1122,1182],
        [1236,1220,1182],
        [907,1135,1035],
        [905,907,1035],
        [1122,905,1035],
        [1135,1122,1035],
        [1293,1363,1317],
        [1281,1293,1317],
        [1343,1281,1317],
        [1363,1343,1317],
        [1220,1293,1246],
        [1208,1220,1246],
        [1281,1208,1246],
        [1293,1281,1246],
        [1122,1220,1172],
        [1114,1122,1172],
        [1208,1114,1172],
        [1220,1208,1172],
        [905,1122,1026],
        [903,905,1026],
        [1114,903,1026],
        [1122,1114,1026],
        [700,913,788],
        [704,700,788],
        [911,704,788],
        [913,911,788],
        [593,700,641],
        [595,593,641],
        [704,595,641],
        [700,704,641],
        [704,911,793],
        [708,704,793],
        [909,708,793],
        [911,909,793],
        [595,704,651],
        [607,595,651],
        [708,607,651],
        [704,708,651],
        [488,593,542],
        [494,488,542],
        [595,494,542],
        [593,595,542],
        [376,488,438],
        [382,376,438],
        [494,382,438],
        [488,494,438],
        [494,595,552],
        [500,494,552],
        [607,500,552],
        [595,607,552],
        [382,494,451],
        [403,382,451],
        [500,403,451],
        [494,500,451],
        [708,909,804],
        [718,708,804],
        [907,718,804],
        [909,907,804],
        [607,708,665],
        [619,607,665],
        [718,619,665],
        [708,718,665],
        [500,607,568],
        [532,500,568],
        [619,532,568],
        [607,619,568],
        [403,500,471],
        [449,403,471],
        [532,449,471],
        [500,532,471],
        [312,376,340],
        [318,312,340],
        [382,318,340],
        [376,382,340],
        [274,312,300],
        [285,274,300],
        [318,285,300],
        [312,318,300],
        [318,382,350],
        [327,318,350],
        [403,327,350],
        [382,403,350],
        [285,318,306],
        [295,285,306],
        [327,295,306],
        [318,327,306],
        [243,274,264],
        [250,243,264],
        [285,250,264],
        [274,285,264],
        [232,243,239],
        [237,232,239],
        [250,237,239],
        [243,250,239],
        [250,285,272],
        [266,250,272],
        [295,266,272],
        [285,295,272],
        [237,250,254],
        [255,237,254],
        [266,255,254],
        [250,266,254],
        [327,403,378],
        [371,327,378],
        [449,371,378],
        [403,449,378],
        [295,327,324],
        [322,295,324],
        [371,322,324],
        [327,371,324],
        [266,295,298],
        [304,266,298],
        [322,304,298],
        [295,322,298],
        [255,266,287],
        [296,255,287],
        [304,296,287],
        [266,304,287],
        [718,907,820],
        [733,718,820],
        [905,733,820],
        [907,905,820],
        [619,718,673],
        [635,619,673],
        [733,635,673],
        [718,733,673],
        [532,619,587],
        [562,532,587],
        [635,562,587],
        [619,635,587],
        [449,532,518],
        [492,449,518],
        [562,492,518],
        [532,562,518],
        [733,905,829],
        [739,733,829],
        [903,739,829],
        [905,903,829],
        [635,733,683],
        [645,635,683],
        [739,645,683],
        [733,739,683],
        [562,635,609],
        [572,562,609],
        [645,572,609],
        [635,645,609],
        [492,562,538],
        [510,492,538],
        [572,510,538],
        [562,572,538],
        [371,449,430],
        [417,371,430],
        [492,417,430],
        [449,492,430],
        [322,371,367],
        [369,322,367],
        [417,369,367],
        [371,417,367],
        [304,322,333],
        [338,304,333],
        [369,338,333],
        [322,369,333],
        [296,304,316],
        [334,296,316],
        [338,334,316],
        [304,338,316],
        [417,492,469],
        [445,417,469],
        [510,445,469],
        [492,510,469],
        [369,417,409],
        [390,369,409],
        [445,390,409],
        [417,445,409],
        [338,369,363],
        [355,338,363],
        [390,355,363],
        [369,390,363],
        [334,338,346],
        [351,334,346],
        [355,351,346],
        [338,355,346],
        [242,232,238],
        [249,242,238],
        [237,249,238],
        [232,237,238],
        [273,242,263],
        [284,273,263],
        [249,284,263],
        [242,249,263],
        [249,237,253],
        [265,249,253],
        [255,265,253],
        [237,255,253],
        [284,249,271],
        [294,284,271],
        [265,294,271],
        [249,265,271],
        [311,273,299],
        [317,311,299],
        [284,317,299],
        [273,284,299],
        [375,311,339],
        [381,375,339],
        [317,381,339],
        [311,317,339],
        [317,284,305],
        [326,317,305],
        [294,326,305],
        [284,294,305],
        [381,317,349],
        [402,381,349],
        [326,402,349],
        [317,326,349],
        [265,255,286],
        [303,265,286],
        [296,303,286],
        [255,296,286],
        [294,265,297],
        [321,294,297],
        [303,321,297],
        [265,303,297],
        [326,294,323],
        [370,326,323],
        [321,370,323],
        [294,321,323],
        [402,326,377],
        [448,402,377],
        [370,448,377],
        [326,370,377],
        [487,375,437],
        [493,487,437],
        [381,493,437],
        [375,381,437],
        [592,487,541],
        [594,592,541],
        [493,594,541],
        [487,493,541],
        [493,381,450],
        [499,493,450],
        [402,499,450],
        [381,402,450],
        [594,493,551],
        [606,594,551],
        [499,606,551],
        [493,499,551],
        [699,592,640],
        [703,699,640],
        [594,703,640],
        [592,594,640],
        [912,699,787],
        [910,912,787],
        [703,910,787],
        [699,703,787],
        [703,594,650],
        [707,703,650],
        [606,707,650],
        [594,606,650],
        [910,703,792],
        [908,910,792],
        [707,908,792],
        [703,707,792],
        [499,402,470],
        [531,499,470],
        [448,531,470],
        [402,448,470],
        [606,499,567],
        [618,606,567],
        [531,618,567],
        [499,531,567],
        [707,606,664],
        [719,707,664],
        [618,719,664],
        [606,618,664],
        [908,707,803],
        [906,908,803],
        [719,906,803],
        [707,719,803],
        [303,296,315],
        [337,303,315],
        [334,337,315],
        [296,334,315],
        [321,303,332],
        [368,321,332],
        [337,368,332],
        [303,337,332],
        [370,321,366],
        [416,370,366],
        [368,416,366],
        [321,368,366],
        [448,370,429],
        [491,448,429],
        [416,491,429],
        [370,416,429],
        [337,334,345],
        [354,337,345],
        [351,354,345],
        [334,351,345],
        [368,337,362],
        [389,368,362],
        [354,389,362],
        [337,354,362],
        [416,368,408],
        [444,416,408],
        [389,444,408],
        [368,389,408],
        [491,416,468],
        [509,491,468],
        [444,509,468],
        [416,444,468],
        [531,448,517],
        [561,531,517],
        [491,561,517],
        [448,491,517],
        [618,531,586],
        [634,618,586],
        [561,634,586],
        [531,561,586],
        [719,618,672],
        [732,719,672],
        [634,732,672],
        [618,634,672],
        [906,719,819],
        [904,906,819],
        [732,904,819],
        [719,732,819],
        [561,491,537],
        [571,561,537],
        [509,571,537],
        [491,509,537],
        [634,561,608],
        [644,634,608],
        [571,644,608],
        [561,571,608],
        [732,634,682],
        [738,732,682],
        [644,738,682],
        [634,644,682],
        [904,732,828],
        [902,904,828],
        [738,902,828],
        [732,738,828],
        [1154,912,1066],
        [1150,1154,1066],
        [910,1150,1066],
        [912,910,1066],
        [1261,1154,1213],
        [1259,1261,1213],
        [1150,1259,1213],
        [1154,1150,1213],
        [1150,910,1061],
        [1146,1150,1061],
        [908,1146,1061],
        [910,908,1061],
        [1259,1150,1203],
        [1247,1259,1203],
        [1146,1247,1203],
        [1150,1146,1203],
        [1366,1261,1312],
        [1360,1366,1312],
        [1259,1360,1312],
        [1261,1259,1312],
        [1478,1366,1416],
        [1472,1478,1416],
        [1360,1472,1416],
        [1366,1360,1416],
        [1360,1259,1302],
        [1354,1360,1302],
        [1247,1354,1302],
        [1259,1247,1302],
        [1472,1360,1403],
        [1451,1472,1403],
        [1354,1451,1403],
        [1360,1354,1403],
        [1146,908,1050],
        [1136,1146,1050],
        [906,1136,1050],
        [908,906,1050],
        [1247,1146,1189],
        [1235,1247,1189],
        [1136,1235,1189],
        [1146,1136,1189],
        [1354,1247,1286],
        [1322,1354,1286],
        [1235,1322,1286],
        [1247,1235,1286],
        [1451,1354,1383],
        [1405,1451,1383],
        [1322,1405,1383],
        [1354,1322,1383],
        [1534,1478,1511],
        [1528,1534,1511],
        [1472,1528,1511],
        [1478,1472,1511],
        [1588,1534,1562],
        [1583,1588,1562],
        [1528,1583,1562],
        [1534,1528,1562],
        [1528,1472,1503],
        [1520,1528,1503],
        [1451,1520,1503],
        [1472,1451,1503],
        [1583,1528,1556],
        [1567,1583,1556],
        [1520,1567,1556],
        [1528,1520,1556],
        [1625,1588,1606],
        [1620,1625,1606],
        [1583,1620,1606],
        [1588,1583,1606],
        [1633,1625,1627],
        [1629,1633,1627],
        [1620,1629,1627],
        [1625,1620,1627],
        [1620,1583,1592],
        [1602,1620,1592],
        [1567,1602,1592],
        [1583,1567,1592],
        [1629,1620,1615],
        [1612,1629,1615],
        [1602,1612,1615],
        [1620,1602,1615],
        [1520,1451,1476],
        [1483,1520,1476],
        [1405,1483,1476],
        [1451,1405,1476],
        [1567,1520,1522],
        [1524,1567,1522],
        [1483,1524,1522],
        [1520,1483,1522],
        [1602,1567,1564],
        [1558,1602,1564],
        [1524,1558,1564],
        [1567,1524,1564],
        [1612,1602,1579],
        [1566,1612,1579],
        [1558,1566,1579],
        [1602,1558,1579],
        [1136,906,1034],
        [1121,1136,1034],
        [904,1121,1034],
        [906,904,1034],
        [1235,1136,1181],
        [1219,1235,1181],
        [1121,1219,1181],
        [1136,1121,1181],
        [1322,1235,1267],
        [1292,1322,1267],
        [1219,1292,1267],
        [1235,1219,1267],
        [1405,1322,1336],
        [1362,1405,1336],
        [1292,1362,1336],
        [1322,1292,1336],
        [1121,904,1025],
        [1113,1121,1025],
        [902,1113,1025],
        [904,902,1025],
        [1219,1121,1171],
        [1207,1219,1171],
        [1113,1207,1171],
        [1121,1113,1171],
        [1292,1219,1245],
        [1280,1292,1245],
        [1207,1280,1245],
        [1219,1207,1245],
        [1362,1292,1316],
        [1342,1362,1316],
        [1280,1342,1316],
        [1292,1280,1316],
        [1483,1405,1424],
        [1437,1483,1424],
        [1362,1437,1424],
        [1405,1362,1424],
        [1524,1483,1487],
        [1485,1524,1487],
        [1437,1485,1487],
        [1483,1437,1487],
        [1558,1524,1516],
        [1513,1558,1516],
        [1485,1513,1516],
        [1524,1485,1516],
        [1566,1558,1530],
        [1515,1566,1530],
        [1513,1515,1530],
        [1558,1513,1530],
        [1437,1362,1385],
        [1407,1437,1385],
        [1342,1407,1385],
        [1362,1342,1385],
        [1485,1437,1445],
        [1462,1485,1445],
        [1407,1462,1445],
        [1437,1407,1445],
        [1513,1485,1491],
        [1497,1513,1491],
        [1462,1497,1491],
        [1485,1462,1491],
        [1515,1513,1505],
        [1501,1515,1505],
        [1497,1501,1505],
        [1513,1497,1505],
        [331,325,277],
        [228,331,277],
        [231,228,277],
        [325,231,277],
        [336,331,279],
        [224,336,279],
        [228,224,279],
        [331,228,279],
        [228,231,200],
        [173,228,200],
        [178,173,200],
        [231,178,200],
        [224,228,198],
        [167,224,198],
        [173,167,198],
        [228,173,198],
        [348,336,281],
        [222,348,281],
        [224,222,281],
        [336,224,281],
        [352,348,283],
        [210,352,283],
        [222,210,283],
        [348,222,283],
        [222,224,193],
        [150,222,193],
        [167,150,193],
        [224,167,193],
        [210,222,183],
        [142,210,183],
        [150,142,183],
        [222,150,183],
        [177,178,165],
        [136,177,165],
        [141,136,165],
        [178,141,165],
        [173,177,162],
        [127,173,162],
        [136,127,162],
        [177,136,162],
        [167,173,158],
        [131,167,158],
        [152,131,158],
        [173,152,158],
        [131,152,129],
        [82,131,129],
        [127,82,129],
        [152,127,129],
        [136,141,134],
        [114,136,134],
        [121,114,134],
        [141,121,134],
        [127,136,118],
        [93,127,118],
        [114,93,118],
        [136,114,118],
        [114,121,112],
        [101,114,112],
        [108,101,112],
        [121,108,112],
        [93,114,95],
        [90,93,95],
        [101,90,95],
        [114,101,95],
        [82,127,88],
        [59,82,88],
        [93,59,88],
        [127,93,88],
        [59,93,74],
        [52,59,74],
        [90,52,74],
        [93,90,74],
        [150,167,140],
        [86,150,140],
        [131,86,140],
        [167,131,140],
        [86,131,84],
        [50,86,84],
        [82,50,84],
        [131,82,84],
        [148,150,120],
        [76,148,120],
        [86,76,120],
        [150,86,120],
        [142,148,110],
        [72,142,110],
        [76,72,110],
        [148,76,110],
        [76,86,65],
        [36,76,65],
        [50,36,65],
        [86,50,65],
        [72,76,57],
        [34,72,57],
        [36,34,57],
        [76,36,57],
        [50,82,55],
        [27,50,55],
        [59,27,55],
        [82,59,55],
        [27,59,42],
        [18,27,42],
        [52,18,42],
        [59,52,42],
        [36,50,33],
        [12,36,33],
        [27,12,33],
        [50,27,33],
        [34,36,24],
        [8,34,24],
        [12,8,24],
        [36,12,24],
        [12,27,16],
        [2,12,16],
        [18,2,16],
        [27,18,16],
        [8,12,7],
        [0,8,7],
        [2,0,7],
        [12,2,7],
        [347,352,282],
        [221,347,282],
        [210,221,282],
        [352,210,282],
        [335,347,280],
        [223,335,280],
        [221,223,280],
        [347,221,280],
        [221,210,182],
        [149,221,182],
        [142,149,182],
        [210,142,182],
        [223,221,192],
        [166,223,192],
        [149,166,192],
        [221,149,192],
        [330,335,278],
        [227,330,278],
        [223,227,278],
        [335,223,278],
        [325,330,276],
        [231,325,276],
        [227,231,276],
        [330,227,276],
        [227,223,197],
        [172,227,197],
        [166,172,197],
        [223,166,197],
        [231,227,199],
        [178,231,199],
        [172,178,199],
        [227,172,199],
        [147,142,109],
        [75,147,109],
        [72,75,109],
        [142,72,109],
        [149,147,119],
        [85,149,119],
        [75,85,119],
        [147,75,119],
        [75,72,56],
        [35,75,56],
        [34,35,56],
        [72,34,56],
        [85,75,64],
        [49,85,64],
        [35,49,64],
        [75,35,64],
        [166,149,139],
        [130,166,139],
        [85,130,139],
        [149,85,139],
        [130,85,83],
        [81,130,83],
        [49,81,83],
        [85,49,83],
        [35,34,23],
        [11,35,23],
        [8,11,23],
        [34,8,23],
        [49,35,32],
        [26,49,32],
        [11,26,32],
        [35,11,32],
        [11,8,6],
        [1,11,6],
        [0,1,6],
        [8,0,6],
        [26,11,15],
        [17,26,15],
        [1,17,15],
        [11,1,15],
        [81,49,54],
        [58,81,54],
        [26,58,54],
        [49,26,54],
        [58,26,41],
        [51,58,41],
        [17,51,41],
        [26,17,41],
        [172,166,157],
        [151,172,157],
        [130,151,157],
        [166,130,157],
        [151,130,128],
        [126,151,128],
        [81,126,128],
        [130,81,128],
        [176,172,161],
        [135,176,161],
        [126,135,161],
        [172,126,161],
        [178,176,164],
        [141,178,164],
        [135,141,164],
        [176,135,164],
        [126,81,87],
        [92,126,87],
        [58,92,87],
        [81,58,87],
        [92,58,73],
        [89,92,73],
        [51,89,73],
        [58,51,73],
        [135,126,117],
        [113,135,117],
        [92,113,117],
        [126,92,117],
        [141,135,133],
        [121,141,133],
        [113,121,133],
        [135,113,133],
        [113,92,94],
        [100,113,94],
        [89,100,94],
        [92,89,94],
        [121,113,111],
        [108,121,111],
        [100,108,111],
        [113,100,111],
        [101,108,116],
        [125,101,116],
        [132,125,116],
        [108,132,116],
        [90,101,103],
        [105,90,103],
        [125,105,103],
        [101,125,103],
        [52,90,78],
        [71,52,78],
        [105,71,78],
        [90,105,78],
        [125,132,146],
        [156,125,146],
        [163,156,146],
        [132,163,146],
        [105,125,144],
        [154,105,144],
        [156,154,144],
        [125,156,144],
        [71,105,123],
        [138,71,123],
        [154,138,123],
        [105,154,123],
        [18,52,38],
        [22,18,38],
        [63,22,38],
        [52,63,38],
        [22,63,48],
        [40,22,48],
        [71,40,48],
        [63,71,48],
        [2,18,14],
        [10,2,14],
        [22,10,14],
        [18,22,14],
        [0,2,4],
        [5,0,4],
        [10,5,4],
        [2,10,4],
        [10,22,29],
        [31,10,29],
        [40,31,29],
        [22,40,29],
        [5,10,20],
        [25,5,20],
        [31,25,20],
        [10,31,20],
        [40,71,69],
        [67,40,69],
        [97,67,69],
        [71,97,69],
        [67,97,99],
        [107,67,99],
        [138,107,99],
        [97,138,99],
        [31,40,46],
        [61,31,46],
        [67,61,46],
        [40,67,46],
        [25,31,44],
        [53,25,44],
        [61,53,44],
        [31,61,44],
        [53,67,80],
        [91,53,80],
        [107,91,80],
        [67,107,80],
        [154,163,175],
        [195,154,175],
        [196,195,175],
        [163,196,175],
        [138,154,171],
        [189,138,171],
        [195,189,171],
        [154,195,171],
        [195,196,202],
        [207,195,202],
        [203,207,202],
        [196,203,202],
        [205,203,226],
        [234,205,226],
        [232,234,226],
        [203,232,226],
        [207,205,230],
        [236,207,230],
        [234,236,230],
        [205,234,230],
        [191,195,209],
        [241,191,209],
        [236,241,209],
        [195,236,209],
        [189,191,212],
        [248,189,212],
        [241,248,212],
        [191,241,212],
        [107,138,169],
        [185,107,169],
        [189,185,169],
        [138,189,169],
        [91,107,160],
        [179,91,160],
        [185,179,160],
        [107,185,160],
        [187,189,214],
        [252,187,214],
        [248,252,214],
        [189,248,214],
        [185,187,216],
        [259,185,216],
        [252,259,216],
        [187,252,216],
        [181,185,218],
        [261,181,218],
        [259,261,218],
        [185,259,218],
        [179,181,220],
        [262,179,220],
        [261,262,220],
        [181,261,220],
        [1,0,3],
        [9,1,3],
        [5,9,3],
        [0,5,3],
        [17,1,13],
        [21,17,13],
        [9,21,13],
        [1,9,13],
        [9,5,19],
        [30,9,19],
        [25,30,19],
        [5,25,19],
        [21,9,28],
        [39,21,28],
        [30,39,28],
        [9,30,28],
        [51,17,37],
        [62,51,37],
        [21,62,37],
        [17,21,37],
        [62,21,47],
        [70,62,47],
        [39,70,47],
        [21,39,47],
        [30,25,43],
        [60,30,43],
        [53,60,43],
        [25,53,43],
        [39,30,45],
        [66,39,45],
        [60,66,45],
        [30,60,45],
        [66,53,79],
        [106,66,79],
        [91,106,79],
        [53,91,79],
        [70,39,68],
        [96,70,68],
        [66,96,68],
        [39,66,68],
        [96,66,98],
        [137,96,98],
        [106,137,98],
        [66,106,98],
        [89,51,77],
        [104,89,77],
        [70,104,77],
        [51,70,77],
        [100,89,102],
        [124,100,102],
        [104,124,102],
        [89,104,102],
        [108,100,115],
        [132,108,115],
        [124,132,115],
        [100,124,115],
        [104,70,122],
        [153,104,122],
        [137,153,122],
        [70,137,122],
        [124,104,143],
        [155,124,143],
        [153,155,143],
        [104,153,143],
        [132,124,145],
        [163,132,145],
        [155,163,145],
        [124,155,145],
        [106,91,159],
        [184,106,159],
        [179,184,159],
        [91,179,159],
        [137,106,168],
        [188,137,168],
        [184,188,168],
        [106,184,168],
        [180,179,219],
        [260,180,219],
        [262,260,219],
        [179,262,219],
        [184,180,217],
        [258,184,217],
        [260,258,217],
        [180,260,217],
        [186,184,215],
        [251,186,215],
        [258,251,215],
        [184,258,215],
        [188,186,213],
        [247,188,213],
        [251,247,213],
        [186,251,213],
        [153,137,170],
        [194,153,170],
        [188,194,170],
        [137,188,170],
        [163,153,174],
        [196,163,174],
        [194,196,174],
        [153,194,174],
        [190,188,211],
        [240,190,211],
        [247,240,211],
        [188,247,211],
        [194,190,208],
        [235,194,208],
        [240,235,208],
        [190,240,208],
        [196,194,201],
        [203,196,201],
        [206,203,201],
        [194,206,201],
        [204,206,229],
        [233,204,229],
        [235,233,229],
        [206,235,229],
        [203,204,225],
        [232,203,225],
        [233,232,225],
        [204,233,225],
        [1552,1553,1587],
        [1632,1552,1587],
        [1630,1632,1587],
        [1553,1630,1587],
        [1550,1552,1591],
        [1637,1550,1591],
        [1632,1637,1591],
        [1552,1632,1591],
        [1632,1630,1647],
        [1665,1632,1647],
        [1663,1665,1647],
        [1630,1663,1647],
        [1637,1632,1651],
        [1673,1637,1651],
        [1665,1673,1651],
        [1632,1665,1651],
        [1548,1550,1595],
        [1641,1548,1595],
        [1637,1641,1595],
        [1550,1637,1595],
        [1546,1548,1597],
        [1645,1546,1597],
        [1641,1645,1597],
        [1548,1641,1597],
        [1641,1637,1657],
        [1679,1641,1657],
        [1673,1679,1657],
        [1637,1673,1657],
        [1645,1641,1660],
        [1688,1645,1660],
        [1679,1688,1660],
        [1641,1679,1660],
        [1665,1663,1677],
        [1695,1665,1677],
        [1693,1695,1677],
        [1663,1693,1677],
        [1673,1665,1683],
        [1705,1673,1683],
        [1695,1705,1683],
        [1665,1695,1683],
        [1695,1693,1707],
        [1718,1695,1707],
        [1712,1718,1707],
        [1693,1712,1707],
        [1705,1695,1709],
        [1725,1705,1709],
        [1718,1725,1709],
        [1695,1718,1709],
        [1679,1673,1692],
        [1714,1679,1692],
        [1705,1714,1692],
        [1673,1705,1692],
        [1688,1679,1703],
        [1729,1688,1703],
        [1714,1729,1703],
        [1679,1714,1703],
        [1714,1705,1723],
        [1739,1714,1723],
        [1725,1739,1723],
        [1705,1725,1723],
        [1729,1714,1733],
        [1752,1729,1733],
        [1739,1752,1733],
        [1714,1739,1733],
        [1544,1546,1605],
        [1649,1544,1605],
        [1645,1649,1605],
        [1546,1645,1605],
        [1542,1544,1576],
        [1614,1542,1576],
        [1609,1614,1576],
        [1544,1609,1576],
        [1614,1609,1635],
        [1653,1614,1635],
        [1649,1653,1635],
        [1609,1649,1635],
        [1649,1645,1669],
        [1699,1649,1669],
        [1688,1699,1669],
        [1645,1688,1669],
        [1653,1649,1662],
        [1681,1653,1662],
        [1675,1681,1662],
        [1649,1675,1662],
        [1681,1675,1690],
        [1711,1681,1690],
        [1699,1711,1690],
        [1675,1699,1690],
        [1540,1542,1578],
        [1618,1540,1578],
        [1614,1618,1578],
        [1542,1614,1578],
        [1618,1614,1639],
        [1655,1618,1639],
        [1653,1655,1639],
        [1614,1653,1639],
        [1538,1540,1582],
        [1619,1538,1582],
        [1618,1619,1582],
        [1540,1618,1582],
        [1619,1618,1643],
        [1658,1619,1643],
        [1655,1658,1643],
        [1618,1655,1643],
        [1655,1653,1667],
        [1685,1655,1667],
        [1681,1685,1667],
        [1653,1681,1667],
        [1685,1681,1697],
        [1720,1685,1697],
        [1711,1720,1697],
        [1681,1711,1697],
        [1658,1655,1671],
        [1686,1658,1671],
        [1685,1686,1671],
        [1655,1685,1671],
        [1686,1685,1701],
        [1721,1686,1701],
        [1720,1721,1701],
        [1685,1720,1701],
        [1699,1688,1716],
        [1743,1699,1716],
        [1729,1743,1716],
        [1688,1729,1716],
        [1711,1699,1727],
        [1754,1711,1727],
        [1743,1754,1727],
        [1699,1743,1727],
        [1743,1729,1748],
        [1770,1743,1748],
        [1752,1770,1748],
        [1729,1752,1748],
        [1754,1743,1760],
        [1786,1754,1760],
        [1770,1786,1760],
        [1743,1770,1760],
        [1720,1711,1735],
        [1762,1720,1735],
        [1754,1762,1735],
        [1711,1754,1735],
        [1721,1720,1741],
        [1768,1721,1741],
        [1762,1768,1741],
        [1720,1762,1741],
        [1762,1754,1776],
        [1796,1762,1776],
        [1786,1796,1776],
        [1754,1786,1776],
        [1768,1762,1782],
        [1801,1768,1782],
        [1796,1801,1782],
        [1762,1796,1782],
        [1718,1712,1731],
        [1746,1718,1731],
        [1744,1746,1731],
        [1712,1744,1731],
        [1725,1718,1737],
        [1758,1725,1737],
        [1746,1758,1737],
        [1718,1746,1737],
        [1739,1725,1750],
        [1780,1739,1750],
        [1758,1780,1750],
        [1725,1758,1750],
        [1752,1739,1765],
        [1800,1752,1765],
        [1780,1800,1765],
        [1739,1780,1765],
        [1746,1744,1756],
        [1772,1746,1756],
        [1763,1772,1756],
        [1744,1763,1756],
        [1758,1746,1767],
        [1788,1758,1767],
        [1772,1788,1767],
        [1746,1772,1767],
        [1772,1763,1790],
        [1814,1772,1790],
        [1806,1814,1790],
        [1763,1806,1790],
        [1788,1772,1803],
        [1832,1788,1803],
        [1814,1832,1803],
        [1772,1814,1803],
        [1780,1758,1784],
        [1816,1780,1784],
        [1788,1816,1784],
        [1758,1788,1784],
        [1800,1780,1808],
        [1839,1800,1808],
        [1816,1839,1808],
        [1780,1816,1808],
        [1839,1788,1845],
        [1898,1839,1845],
        [1832,1898,1845],
        [1788,1832,1845],
        [1770,1752,1774],
        [1794,1770,1774],
        [1778,1794,1774],
        [1752,1778,1774],
        [1786,1770,1792],
        [1810,1786,1792],
        [1794,1810,1792],
        [1770,1794,1792],
        [1794,1778,1798],
        [1822,1794,1798],
        [1800,1822,1798],
        [1778,1800,1798],
        [1810,1794,1818],
        [1843,1810,1818],
        [1822,1843,1818],
        [1794,1822,1818],
        [1796,1786,1805],
        [1824,1796,1805],
        [1810,1824,1805],
        [1786,1810,1805],
        [1801,1796,1812],
        [1825,1801,1812],
        [1824,1825,1812],
        [1796,1824,1812],
        [1824,1810,1830],
        [1861,1824,1830],
        [1843,1861,1830],
        [1810,1843,1830],
        [1825,1824,1841],
        [1870,1825,1841],
        [1861,1870,1841],
        [1824,1861,1841],
        [1822,1800,1828],
        [1874,1822,1828],
        [1839,1874,1828],
        [1800,1839,1828],
        [1843,1822,1859],
        [1892,1843,1859],
        [1874,1892,1859],
        [1822,1874,1859],
        [1892,1839,1886],
        [1911,1892,1886],
        [1878,1911,1886],
        [1839,1878,1886],
        [1911,1878,1909],
        [1935,1911,1909],
        [1898,1935,1909],
        [1878,1898,1909],
        [1861,1843,1880],
        [1902,1861,1880],
        [1892,1902,1880],
        [1843,1892,1880],
        [1870,1861,1890],
        [1905,1870,1890],
        [1902,1905,1890],
        [1861,1902,1890],
        [1902,1892,1907],
        [1923,1902,1907],
        [1911,1923,1907],
        [1892,1911,1907],
        [1923,1911,1930],
        [1949,1923,1930],
        [1935,1949,1930],
        [1911,1935,1930],
        [1905,1902,1913],
        [1926,1905,1913],
        [1923,1926,1913],
        [1902,1923,1913],
        [1926,1923,1939],
        [1952,1926,1939],
        [1949,1952,1939],
        [1923,1949,1939],
        [1539,1538,1581],
        [1617,1539,1581],
        [1619,1617,1581],
        [1538,1619,1581],
        [1617,1619,1642],
        [1654,1617,1642],
        [1658,1654,1642],
        [1619,1658,1642],
        [1541,1539,1577],
        [1613,1541,1577],
        [1617,1613,1577],
        [1539,1617,1577],
        [1613,1617,1638],
        [1652,1613,1638],
        [1654,1652,1638],
        [1617,1654,1638],
        [1654,1658,1670],
        [1684,1654,1670],
        [1686,1684,1670],
        [1658,1686,1670],
        [1684,1686,1700],
        [1719,1684,1700],
        [1721,1719,1700],
        [1686,1721,1700],
        [1652,1654,1666],
        [1680,1652,1666],
        [1684,1680,1666],
        [1654,1684,1666],
        [1680,1684,1696],
        [1710,1680,1696],
        [1719,1710,1696],
        [1684,1719,1696],
        [1543,1541,1575],
        [1608,1543,1575],
        [1613,1608,1575],
        [1541,1613,1575],
        [1608,1613,1634],
        [1648,1608,1634],
        [1652,1648,1634],
        [1613,1652,1634],
        [1545,1543,1604],
        [1644,1545,1604],
        [1648,1644,1604],
        [1543,1648,1604],
        [1648,1652,1661],
        [1674,1648,1661],
        [1680,1674,1661],
        [1652,1680,1661],
        [1674,1680,1689],
        [1698,1674,1689],
        [1710,1698,1689],
        [1680,1710,1689],
        [1644,1648,1668],
        [1687,1644,1668],
        [1698,1687,1668],
        [1648,1698,1668],
        [1719,1721,1740],
        [1761,1719,1740],
        [1768,1761,1740],
        [1721,1768,1740],
        [1710,1719,1734],
        [1753,1710,1734],
        [1761,1753,1734],
        [1719,1761,1734],
        [1761,1768,1781],
        [1795,1761,1781],
        [1801,1795,1781],
        [1768,1801,1781],
        [1753,1761,1775],
        [1785,1753,1775],
        [1795,1785,1775],
        [1761,1795,1775],
        [1698,1710,1726],
        [1742,1698,1726],
        [1753,1742,1726],
        [1710,1753,1726],
        [1687,1698,1715],
        [1728,1687,1715],
        [1742,1728,1715],
        [1698,1742,1715],
        [1742,1753,1759],
        [1769,1742,1759],
        [1785,1769,1759],
        [1753,1785,1759],
        [1728,1742,1747],
        [1751,1728,1747],
        [1769,1751,1747],
        [1742,1769,1747],
        [1547,1545,1596],
        [1640,1547,1596],
        [1644,1640,1596],
        [1545,1644,1596],
        [1549,1547,1594],
        [1636,1549,1594],
        [1640,1636,1594],
        [1547,1640,1594],
        [1640,1644,1659],
        [1678,1640,1659],
        [1687,1678,1659],
        [1644,1687,1659],
        [1636,1640,1656],
        [1672,1636,1656],
        [1678,1672,1656],
        [1640,1678,1656],
        [1551,1549,1590],
        [1631,1551,1590],
        [1636,1631,1590],
        [1549,1636,1590],
        [1553,1551,1586],
        [1630,1553,1586],
        [1631,1630,1586],
        [1551,1631,1586],
        [1631,1636,1650],
        [1664,1631,1650],
        [1672,1664,1650],
        [1636,1672,1650],
        [1630,1631,1646],
        [1663,1630,1646],
        [1664,1663,1646],
        [1631,1664,1646],
        [1678,1687,1702],
        [1713,1678,1702],
        [1728,1713,1702],
        [1687,1728,1702],
        [1672,1678,1691],
        [1704,1672,1691],
        [1713,1704,1691],
        [1678,1713,1691],
        [1713,1728,1732],
        [1738,1713,1732],
        [1751,1738,1732],
        [1728,1751,1732],
        [1704,1713,1722],
        [1724,1704,1722],
        [1738,1724,1722],
        [1713,1738,1722],
        [1664,1672,1682],
        [1694,1664,1682],
        [1704,1694,1682],
        [1672,1704,1682],
        [1663,1664,1676],
        [1693,1663,1676],
        [1694,1693,1676],
        [1664,1694,1676],
        [1694,1704,1708],
        [1717,1694,1708],
        [1724,1717,1708],
        [1704,1724,1708],
        [1693,1694,1706],
        [1712,1693,1706],
        [1717,1712,1706],
        [1694,1717,1706],
        [1795,1801,1811],
        [1823,1795,1811],
        [1825,1823,1811],
        [1801,1825,1811],
        [1785,1795,1804],
        [1809,1785,1804],
        [1823,1809,1804],
        [1795,1823,1804],
        [1823,1825,1840],
        [1860,1823,1840],
        [1870,1860,1840],
        [1825,1870,1840],
        [1809,1823,1829],
        [1842,1809,1829],
        [1860,1842,1829],
        [1823,1860,1829],
        [1769,1785,1791],
        [1793,1769,1791],
        [1809,1793,1791],
        [1785,1809,1791],
        [1751,1769,1773],
        [1777,1751,1773],
        [1793,1777,1773],
        [1769,1793,1773],
        [1793,1809,1817],
        [1821,1793,1817],
        [1842,1821,1817],
        [1809,1842,1817],
        [1777,1793,1797],
        [1799,1777,1797],
        [1821,1799,1797],
        [1793,1821,1797],
        [1860,1870,1889],
        [1901,1860,1889],
        [1905,1901,1889],
        [1870,1905,1889],
        [1842,1860,1879],
        [1891,1842,1879],
        [1901,1891,1879],
        [1860,1901,1879],
        [1901,1905,1912],
        [1922,1901,1912],
        [1926,1922,1912],
        [1905,1926,1912],
        [1922,1926,1938],
        [1948,1922,1938],
        [1952,1948,1938],
        [1926,1952,1938],
        [1891,1901,1906],
        [1910,1891,1906],
        [1922,1910,1906],
        [1901,1922,1906],
        [1910,1922,1929],
        [1934,1910,1929],
        [1948,1934,1929],
        [1922,1948,1929],
        [1821,1842,1858],
        [1873,1821,1858],
        [1891,1873,1858],
        [1842,1891,1858],
        [1799,1821,1827],
        [1838,1799,1827],
        [1873,1838,1827],
        [1821,1873,1827],
        [1838,1891,1885],
        [1877,1838,1885],
        [1910,1877,1885],
        [1891,1910,1885],
        [1877,1910,1908],
        [1895,1877,1908],
        [1934,1895,1908],
        [1910,1934,1908],
        [1738,1751,1764],
        [1779,1738,1764],
        [1799,1779,1764],
        [1751,1799,1764],
        [1724,1738,1749],
        [1757,1724,1749],
        [1779,1757,1749],
        [1738,1779,1749],
        [1717,1724,1736],
        [1745,1717,1736],
        [1757,1745,1736],
        [1724,1757,1736],
        [1712,1717,1730],
        [1744,1712,1730],
        [1745,1744,1730],
        [1717,1745,1730],
        [1779,1799,1807],
        [1815,1779,1807],
        [1838,1815,1807],
        [1799,1838,1807],
        [1757,1779,1783],
        [1787,1757,1783],
        [1815,1787,1783],
        [1779,1815,1783],
        [1787,1838,1844],
        [1831,1787,1844],
        [1895,1831,1844],
        [1838,1895,1844],
        [1745,1757,1766],
        [1771,1745,1766],
        [1787,1771,1766],
        [1757,1787,1766],
        [1744,1745,1755],
        [1763,1744,1755],
        [1771,1763,1755],
        [1745,1771,1755],
        [1771,1787,1802],
        [1813,1771,1802],
        [1831,1813,1802],
        [1787,1831,1802],
        [1763,1771,1789],
        [1806,1763,1789],
        [1813,1806,1789],
        [1771,1813,1789],
        [1814,1806,1820],
        [1836,1814,1820],
        [1826,1836,1820],
        [1806,1826,1820],
        [1832,1814,1834],
        [1872,1832,1834],
        [1836,1872,1834],
        [1814,1836,1834],
        [1898,1832,1888],
        [1915,1898,1888],
        [1872,1915,1888],
        [1832,1872,1888],
        [1836,1826,1847],
        [1857,1836,1847],
        [1850,1857,1847],
        [1826,1850,1847],
        [1872,1836,1863],
        [1882,1872,1863],
        [1857,1882,1863],
        [1836,1857,1863],
        [1915,1872,1900],
        [1919,1915,1900],
        [1882,1919,1900],
        [1872,1882,1900],
        [1935,1898,1928],
        [1954,1935,1928],
        [1915,1954,1928],
        [1898,1915,1928],
        [1949,1935,1951],
        [1969,1949,1951],
        [1954,1969,1951],
        [1935,1954,1951],
        [1952,1949,1962],
        [1974,1952,1962],
        [1969,1974,1962],
        [1949,1969,1962],
        [1954,1915,1941],
        [1958,1954,1941],
        [1919,1958,1941],
        [1915,1919,1941],
        [1969,1954,1965],
        [1971,1969,1965],
        [1958,1971,1965],
        [1954,1958,1965],
        [1974,1969,1973],
        [1975,1974,1973],
        [1971,1975,1973],
        [1969,1971,1973],
        [1857,1850,1855],
        [1867,1857,1855],
        [1853,1867,1855],
        [1850,1853,1855],
        [1882,1857,1876],
        [1884,1882,1876],
        [1867,1884,1876],
        [1857,1867,1876],
        [1919,1882,1904],
        [1917,1919,1904],
        [1884,1917,1904],
        [1882,1884,1904],
        [1867,1853,1852],
        [1849,1867,1852],
        [1837,1849,1852],
        [1853,1837,1852],
        [1884,1867,1869],
        [1865,1884,1869],
        [1849,1865,1869],
        [1867,1849,1869],
        [1917,1884,1894],
        [1897,1917,1894],
        [1865,1897,1894],
        [1884,1865,1894],
        [1958,1919,1937],
        [1947,1958,1937],
        [1917,1947,1937],
        [1919,1917,1937],
        [1971,1958,1960],
        [1956,1971,1960],
        [1947,1956,1960],
        [1958,1947,1960],
        [1975,1971,1967],
        [1963,1975,1967],
        [1956,1963,1967],
        [1971,1956,1967],
        [1947,1917,1921],
        [1925,1947,1921],
        [1897,1925,1921],
        [1917,1897,1921],
        [1956,1947,1943],
        [1932,1956,1943],
        [1925,1932,1943],
        [1947,1925,1943],
        [1963,1956,1945],
        [1933,1963,1945],
        [1932,1933,1945],
        [1956,1932,1945],
        [1948,1952,1961],
        [1968,1948,1961],
        [1974,1968,1961],
        [1952,1974,1961],
        [1934,1948,1950],
        [1953,1934,1950],
        [1968,1953,1950],
        [1948,1968,1950],
        [1895,1934,1927],
        [1914,1895,1927],
        [1953,1914,1927],
        [1934,1953,1927],
        [1968,1974,1972],
        [1970,1968,1972],
        [1975,1970,1972],
        [1974,1975,1972],
        [1953,1968,1964],
        [1957,1953,1964],
        [1970,1957,1964],
        [1968,1970,1964],
        [1914,1953,1940],
        [1918,1914,1940],
        [1957,1918,1940],
        [1953,1957,1940],
        [1831,1895,1887],
        [1871,1831,1887],
        [1914,1871,1887],
        [1895,1914,1887],
        [1813,1831,1833],
        [1835,1813,1833],
        [1871,1835,1833],
        [1831,1871,1833],
        [1806,1813,1819],
        [1826,1806,1819],
        [1835,1826,1819],
        [1813,1835,1819],
        [1871,1914,1899],
        [1881,1871,1899],
        [1918,1881,1899],
        [1914,1918,1899],
        [1835,1871,1862],
        [1856,1835,1862],
        [1881,1856,1862],
        [1871,1881,1862],
        [1826,1835,1846],
        [1850,1826,1846],
        [1856,1850,1846],
        [1835,1856,1846],
        [1970,1975,1966],
        [1955,1970,1966],
        [1963,1955,1966],
        [1975,1963,1966],
        [1957,1970,1959],
        [1946,1957,1959],
        [1955,1946,1959],
        [1970,1955,1959],
        [1918,1957,1936],
        [1916,1918,1936],
        [1946,1916,1936],
        [1957,1946,1936],
        [1955,1963,1944],
        [1931,1955,1944],
        [1933,1931,1944],
        [1963,1933,1944],
        [1946,1955,1942],
        [1924,1946,1942],
        [1931,1924,1942],
        [1955,1931,1942],
        [1916,1946,1920],
        [1896,1916,1920],
        [1924,1896,1920],
        [1946,1924,1920],
        [1881,1918,1903],
        [1883,1881,1903],
        [1916,1883,1903],
        [1918,1916,1903],
        [1856,1881,1875],
        [1866,1856,1875],
        [1883,1866,1875],
        [1881,1883,1875],
        [1850,1856,1854],
        [1853,1850,1854],
        [1866,1853,1854],
        [1856,1866,1854],
        [1883,1916,1893],
        [1864,1883,1893],
        [1896,1864,1893],
        [1916,1896,1893],
        [1866,1883,1868],
        [1848,1866,1868],
        [1864,1848,1868],
        [1883,1864,1868],
        [1853,1866,1851],
        [1837,1853,1851],
        [1848,1837,1851],
        [1866,1848,1851],
        [1069,952,992],
        [1072,1069,992],
        [952,1072,992],
        [1069,1072,1094],
        [1118,1069,1094],
        [1134,1118,1094],
        [1072,1134,1094],
        [1030,952,984],
        [1069,1030,984],
        [952,1069,984],
        [1030,1069,1076],
        [1080,1030,1076],
        [1118,1080,1076],
        [1069,1118,1076],
        [1118,1134,1133],
        [1131,1118,1133],
        [1139,1131,1133],
        [1134,1139,1133],
        [1131,1139,1129],
        [1110,1131,1129],
        [1127,1110,1129],
        [1139,1127,1129],
        [1080,1118,1104],
        [1088,1080,1104],
        [1131,1088,1104],
        [1118,1131,1104],
        [1088,1131,1096],
        [1074,1088,1096],
        [1110,1074,1096],
        [1131,1110,1096],
        [980,952,964],
        [1030,980,964],
        [952,1030,964],
        [980,1030,1028],
        [1002,980,1028],
        [1080,1002,1028],
        [1030,1080,1028],
        [951,952,954],
        [980,951,954],
        [952,980,954],
        [951,980,962],
        [949,951,962],
        [1002,949,962],
        [980,1002,962],
        [1002,1080,1059],
        [1012,1002,1059],
        [1088,1012,1059],
        [1080,1088,1059],
        [1012,1088,1053],
        [998,1012,1053],
        [1074,998,1053],
        [1088,1074,1053],
        [949,1002,974],
        [947,949,974],
        [1012,947,974],
        [1002,1012,974],
        [947,1012,972],
        [945,947,972],
        [998,945,972],
        [1012,998,972],
        [1110,1127,1082],
        [1047,1110,1082],
        [1060,1047,1082],
        [1127,1060,1082],
        [1074,1110,1071],
        [1004,1074,1071],
        [1047,1004,1071],
        [1110,1047,1071],
        [1047,1060,1039],
        [1024,1047,1039],
        [1031,1024,1039],
        [1060,1031,1039],
        [1024,1031,1041],
        [1049,1024,1041],
        [1063,1049,1041],
        [1031,1063,1041],
        [1004,1047,1018],
        [994,1004,1018],
        [1024,994,1018],
        [1047,1024,1018],
        [994,1024,1020],
        [1010,994,1020],
        [1049,1010,1020],
        [1024,1049,1020],
        [998,1074,1014],
        [976,998,1014],
        [1004,976,1014],
        [1074,1004,1014],
        [945,998,960],
        [943,945,960],
        [976,943,960],
        [998,976,960],
        [976,1004,986],
        [970,976,986],
        [994,970,986],
        [1004,994,986],
        [970,994,990],
        [978,970,990],
        [1010,978,990],
        [994,1010,990],
        [943,976,956],
        [941,943,956],
        [970,941,956],
        [976,970,956],
        [941,970,958],
        [939,941,958],
        [978,939,958],
        [970,978,958],
        [875,952,901],
        [951,875,901],
        [952,951,901],
        [875,951,893],
        [853,875,893],
        [949,853,893],
        [951,949,893],
        [825,952,891],
        [875,825,891],
        [952,875,891],
        [825,875,827],
        [775,825,827],
        [853,775,827],
        [875,853,827],
        [853,949,881],
        [843,853,881],
        [947,843,881],
        [949,947,881],
        [843,947,883],
        [857,843,883],
        [945,857,883],
        [947,945,883],
        [775,853,796],
        [767,775,796],
        [843,767,796],
        [853,843,796],
        [767,843,802],
        [781,767,802],
        [857,781,802],
        [843,857,802],
        [786,952,871],
        [825,786,871],
        [952,825,871],
        [786,825,779],
        [737,786,779],
        [775,737,779],
        [825,775,779],
        [782,952,863],
        [786,782,863],
        [952,786,863],
        [782,786,761],
        [720,782,761],
        [737,720,761],
        [786,737,761],
        [737,775,751],
        [724,737,751],
        [767,724,751],
        [775,767,751],
        [724,767,759],
        [745,724,759],
        [781,745,759],
        [767,781,759],
        [720,737,722],
        [715,720,722],
        [724,715,722],
        [737,724,722],
        [715,724,726],
        [727,715,726],
        [745,727,726],
        [724,745,726],
        [857,945,895],
        [879,857,895],
        [943,879,895],
        [945,943,895],
        [781,857,841],
        [851,781,841],
        [879,851,841],
        [857,879,841],
        [879,943,899],
        [885,879,899],
        [941,885,899],
        [943,941,899],
        [885,941,897],
        [877,885,897],
        [939,877,897],
        [941,939,897],
        [851,879,869],
        [861,851,869],
        [885,861,869],
        [879,885,869],
        [861,885,865],
        [845,861,865],
        [877,845,865],
        [885,877,865],
        [745,781,784],
        [808,745,784],
        [851,808,784],
        [781,851,784],
        [727,745,773],
        [794,727,773],
        [808,794,773],
        [745,808,773],
        [808,851,837],
        [831,808,837],
        [861,831,837],
        [851,861,837],
        [831,861,835],
        [806,831,835],
        [845,806,835],
        [861,845,835],
        [794,808,816],
        [823,794,816],
        [831,823,816],
        [808,831,816],
        [823,831,814],
        [791,823,814],
        [806,791,814],
        [831,806,814],
        [785,952,862],
        [782,785,862],
        [952,782,862],
        [785,782,760],
        [736,785,760],
        [720,736,760],
        [782,720,760],
        [824,952,870],
        [785,824,870],
        [952,785,870],
        [824,785,778],
        [774,824,778],
        [736,774,778],
        [785,736,778],
        [736,720,721],
        [723,736,721],
        [715,723,721],
        [720,715,721],
        [723,715,725],
        [744,723,725],
        [727,744,725],
        [715,727,725],
        [774,736,750],
        [766,774,750],
        [723,766,750],
        [736,723,750],
        [766,723,758],
        [780,766,758],
        [744,780,758],
        [723,744,758],
        [874,952,890],
        [824,874,890],
        [952,824,890],
        [874,824,826],
        [852,874,826],
        [774,852,826],
        [824,774,826],
        [950,952,900],
        [874,950,900],
        [952,874,900],
        [950,874,892],
        [948,950,892],
        [852,948,892],
        [874,852,892],
        [852,774,795],
        [842,852,795],
        [766,842,795],
        [774,766,795],
        [842,766,801],
        [856,842,801],
        [780,856,801],
        [766,780,801],
        [948,852,880],
        [946,948,880],
        [842,946,880],
        [852,842,880],
        [946,842,882],
        [944,946,882],
        [856,944,882],
        [842,856,882],
        [744,727,772],
        [807,744,772],
        [794,807,772],
        [727,794,772],
        [780,744,783],
        [850,780,783],
        [807,850,783],
        [744,807,783],
        [807,794,815],
        [830,807,815],
        [823,830,815],
        [794,823,815],
        [830,823,813],
        [805,830,813],
        [791,805,813],
        [823,791,813],
        [850,807,836],
        [860,850,836],
        [830,860,836],
        [807,830,836],
        [860,830,834],
        [844,860,834],
        [805,844,834],
        [830,805,834],
        [856,780,840],
        [878,856,840],
        [850,878,840],
        [780,850,840],
        [944,856,894],
        [942,944,894],
        [878,942,894],
        [856,878,894],
        [878,850,868],
        [884,878,868],
        [860,884,868],
        [850,860,868],
        [884,860,864],
        [876,884,864],
        [844,876,864],
        [860,844,864],
        [942,878,898],
        [940,942,898],
        [884,940,898],
        [878,884,898],
        [940,884,896],
        [938,940,896],
        [876,938,896],
        [884,876,896],
        [979,952,953],
        [950,979,953],
        [952,950,953],
        [979,950,961],
        [1001,979,961],
        [948,1001,961],
        [950,948,961],
        [1029,952,963],
        [979,1029,963],
        [952,979,963],
        [1029,979,1027],
        [1079,1029,1027],
        [1001,1079,1027],
        [979,1001,1027],
        [1001,948,973],
        [1011,1001,973],
        [946,1011,973],
        [948,946,973],
        [1011,946,971],
        [997,1011,971],
        [944,997,971],
        [946,944,971],
        [1079,1001,1058],
        [1087,1079,1058],
        [1011,1087,1058],
        [1001,1011,1058],
        [1087,1011,1052],
        [1073,1087,1052],
        [997,1073,1052],
        [1011,997,1052],
        [1068,952,983],
        [1029,1068,983],
        [952,1029,983],
        [1068,1029,1075],
        [1117,1068,1075],
        [1079,1117,1075],
        [1029,1079,1075],
        [1072,952,991],
        [1068,1072,991],
        [952,1068,991],
        [1072,1068,1093],
        [1134,1072,1093],
        [1117,1134,1093],
        [1068,1117,1093],
        [1117,1079,1103],
        [1130,1117,1103],
        [1087,1130,1103],
        [1079,1087,1103],
        [1130,1087,1095],
        [1109,1130,1095],
        [1073,1109,1095],
        [1087,1073,1095],
        [1134,1117,1132],
        [1139,1134,1132],
        [1130,1139,1132],
        [1117,1130,1132],
        [1139,1130,1128],
        [1127,1139,1128],
        [1109,1127,1128],
        [1130,1109,1128],
        [997,944,959],
        [975,997,959],
        [942,975,959],
        [944,942,959],
        [1073,997,1013],
        [1003,1073,1013],
        [975,1003,1013],
        [997,975,1013],
        [975,942,955],
        [969,975,955],
        [940,969,955],
        [942,940,955],
        [969,940,957],
        [977,969,957],
        [938,977,957],
        [940,938,957],
        [1003,975,985],
        [993,1003,985],
        [969,993,985],
        [975,969,985],
        [993,969,989],
        [1009,993,989],
        [977,1009,989],
        [969,977,989],
        [1109,1073,1070],
        [1046,1109,1070],
        [1003,1046,1070],
        [1073,1003,1070],
        [1127,1109,1081],
        [1060,1127,1081],
        [1046,1060,1081],
        [1109,1046,1081],
        [1046,1003,1017],
        [1023,1046,1017],
        [993,1023,1017],
        [1003,993,1017],
        [1023,993,1019],
        [1048,1023,1019],
        [1009,1048,1019],
        [993,1009,1019],
        [1060,1046,1038],
        [1031,1060,1038],
        [1023,1031,1038],
        [1046,1023,1038],
        [1031,1023,1040],
        [1063,1031,1040],
        [1048,1063,1040],
        [1023,1048,1040],
        [1049,1063,1120],
        [1161,1049,1120],
        [1170,1161,1120],
        [1063,1170,1120],
        [1010,1049,1092],
        [1126,1010,1092],
        [1161,1126,1092],
        [1049,1161,1092],
        [1165,1170,1224],
        [1272,1165,1224],
        [1279,1272,1224],
        [1170,1279,1224],
        [1161,1165,1216],
        [1250,1161,1216],
        [1272,1250,1216],
        [1165,1272,1216],
        [1141,1161,1196],
        [1234,1141,1196],
        [1250,1234,1196],
        [1161,1250,1196],
        [1126,1141,1178],
        [1206,1126,1178],
        [1234,1206,1178],
        [1141,1234,1178],
        [978,1010,1045],
        [1043,978,1045],
        [1126,1043,1045],
        [1010,1126,1045],
        [939,978,966],
        [937,939,966],
        [1043,937,966],
        [978,1043,966],
        [1084,1126,1153],
        [1174,1084,1153],
        [1206,1174,1153],
        [1126,1206,1153],
        [1043,1084,1112],
        [1124,1043,1112],
        [1174,1124,1112],
        [1084,1174,1112],
        [982,1043,1055],
        [1033,982,1055],
        [1124,1033,1055],
        [1043,1124,1055],
        [937,982,968],
        [935,937,968],
        [1033,935,968],
        [982,1033,968],
        [1272,1279,1321],
        [1369,1272,1321],
        [1376,1369,1321],
        [1279,1376,1321],
        [1250,1272,1309],
        [1347,1250,1309],
        [1369,1347,1309],
        [1272,1369,1309],
        [1234,1250,1285],
        [1315,1234,1285],
        [1347,1315,1285],
        [1250,1347,1285],
        [1206,1234,1252],
        [1278,1206,1252],
        [1315,1278,1252],
        [1234,1315,1252],
        [1369,1376,1388],
        [1402,1369,1388],
        [1415,1402,1388],
        [1376,1415,1388],
        [1347,1369,1375],
        [1378,1347,1375],
        [1402,1378,1375],
        [1369,1402,1375],
        [1402,1415,1419],
        [1423,1402,1419],
        [1434,1423,1419],
        [1415,1434,1419],
        [1378,1402,1396],
        [1390,1378,1396],
        [1423,1390,1396],
        [1402,1423,1396],
        [1315,1347,1339],
        [1335,1315,1339],
        [1378,1335,1339],
        [1347,1378,1339],
        [1278,1315,1305],
        [1295,1278,1305],
        [1335,1295,1305],
        [1315,1335,1305],
        [1335,1378,1365],
        [1353,1335,1365],
        [1390,1353,1365],
        [1378,1390,1365],
        [1295,1335,1325],
        [1301,1295,1325],
        [1353,1301,1325],
        [1335,1353,1325],
        [1174,1206,1222],
        [1226,1174,1222],
        [1278,1226,1222],
        [1206,1278,1222],
        [1124,1174,1176],
        [1169,1124,1176],
        [1226,1169,1176],
        [1174,1226,1176],
        [1033,1124,1108],
        [1078,1033,1108],
        [1169,1078,1108],
        [1124,1169,1108],
        [935,1033,988],
        [931,935,988],
        [1078,931,988],
        [1033,1078,988],
        [1226,1278,1256],
        [1240,1226,1256],
        [1295,1240,1256],
        [1278,1295,1256],
        [1169,1226,1202],
        [1180,1169,1202],
        [1240,1180,1202],
        [1226,1240,1202],
        [1240,1295,1274],
        [1244,1240,1274],
        [1301,1244,1274],
        [1295,1301,1274],
        [1180,1240,1218],
        [1186,1180,1218],
        [1244,1186,1218],
        [1240,1244,1218],
        [1078,1169,1138],
        [1086,1078,1138],
        [1180,1086,1138],
        [1169,1180,1138],
        [931,1078,996],
        [925,931,996],
        [1086,925,996],
        [1078,1086,996],
        [1086,1180,1145],
        [1090,1086,1145],
        [1186,1090,1145],
        [1180,1186,1145],
        [925,1086,1000],
        [921,925,1000],
        [1090,921,1000],
        [1086,1090,1000],
        [877,939,889],
        [812,877,889],
        [937,812,889],
        [939,937,889],
        [845,877,810],
        [729,845,810],
        [812,729,810],
        [877,812,810],
        [873,937,887],
        [822,873,887],
        [935,822,887],
        [937,935,887],
        [812,873,800],
        [731,812,800],
        [822,731,800],
        [873,822,800],
        [771,812,743],
        [681,771,743],
        [731,681,743],
        [812,731,743],
        [729,771,702],
        [649,729,702],
        [681,649,702],
        [771,681,702],
        [806,845,763],
        [694,806,763],
        [729,694,763],
        [845,729,763],
        [791,806,735],
        [684,791,735],
        [694,684,735],
        [806,694,735],
        [714,729,677],
        [621,714,677],
        [649,621,677],
        [729,649,677],
        [694,714,659],
        [605,694,659],
        [621,605,659],
        [714,621,659],
        [690,694,639],
        [583,690,639],
        [605,583,639],
        [694,605,639],
        [684,690,631],
        [575,684,631],
        [583,575,631],
        [690,583,631],
        [822,935,867],
        [777,822,867],
        [931,777,867],
        [935,931,867],
        [731,822,747],
        [686,731,747],
        [777,686,747],
        [822,777,747],
        [681,731,679],
        [629,681,679],
        [686,629,679],
        [731,686,679],
        [649,681,633],
        [577,649,633],
        [629,577,633],
        [681,629,633],
        [777,931,859],
        [769,777,859],
        [925,769,859],
        [931,925,859],
        [686,777,717],
        [675,686,717],
        [769,675,717],
        [777,769,717],
        [769,925,855],
        [765,769,855],
        [921,765,855],
        [925,921,855],
        [675,769,710],
        [669,675,710],
        [765,669,710],
        [769,765,710],
        [629,686,653],
        [615,629,653],
        [675,615,653],
        [686,675,653],
        [577,629,599],
        [560,577,599],
        [615,560,599],
        [629,615,599],
        [615,675,637],
        [611,615,637],
        [669,611,637],
        [675,669,637],
        [560,615,581],
        [554,560,581],
        [611,554,581],
        [615,611,581],
        [621,649,603],
        [540,621,603],
        [577,540,603],
        [649,577,603],
        [605,621,570],
        [508,605,570],
        [540,508,570],
        [621,540,570],
        [583,605,546],
        [486,583,546],
        [508,486,546],
        [605,508,546],
        [575,583,534],
        [478,575,534],
        [486,478,534],
        [583,486,534],
        [540,577,550],
        [520,540,550],
        [560,520,550],
        [577,560,550],
        [508,540,516],
        [477,508,516],
        [520,477,516],
        [540,520,516],
        [520,560,530],
        [502,520,530],
        [554,502,530],
        [560,554,530],
        [477,520,490],
        [465,477,490],
        [502,465,490],
        [520,502,490],
        [486,508,480],
        [453,486,480],
        [477,453,480],
        [508,477,480],
        [478,486,467],
        [439,478,467],
        [453,439,467],
        [486,453,467],
        [453,477,459],
        [432,453,459],
        [465,432,459],
        [477,465,459],
        [439,453,436],
        [420,439,436],
        [432,420,436],
        [453,432,436],
        [805,791,734],
        [693,805,734],
        [684,693,734],
        [791,684,734],
        [844,805,762],
        [728,844,762],
        [693,728,762],
        [805,693,762],
        [689,684,630],
        [582,689,630],
        [575,582,630],
        [684,575,630],
        [693,689,638],
        [604,693,638],
        [582,604,638],
        [689,582,638],
        [713,693,658],
        [620,713,658],
        [604,620,658],
        [693,604,658],
        [728,713,676],
        [648,728,676],
        [620,648,676],
        [713,620,676],
        [876,844,809],
        [811,876,809],
        [728,811,809],
        [844,728,809],
        [938,876,888],
        [936,938,888],
        [811,936,888],
        [876,811,888],
        [770,728,701],
        [680,770,701],
        [648,680,701],
        [728,648,701],
        [811,770,742],
        [730,811,742],
        [680,730,742],
        [770,680,742],
        [872,811,799],
        [821,872,799],
        [730,821,799],
        [811,730,799],
        [936,872,886],
        [934,936,886],
        [821,934,886],
        [872,821,886],
        [582,575,533],
        [485,582,533],
        [478,485,533],
        [575,478,533],
        [604,582,545],
        [507,604,545],
        [485,507,545],
        [582,485,545],
        [620,604,569],
        [539,620,569],
        [507,539,569],
        [604,507,569],
        [648,620,602],
        [576,648,602],
        [539,576,602],
        [620,539,602],
        [485,478,466],
        [452,485,466],
        [439,452,466],
        [478,439,466],
        [507,485,479],
        [476,507,479],
        [452,476,479],
        [485,452,479],
        [452,439,435],
        [431,452,435],
        [420,431,435],
        [439,420,435],
        [476,452,458],
        [464,476,458],
        [431,464,458],
        [452,431,458],
        [539,507,515],
        [519,539,515],
        [476,519,515],
        [507,476,515],
        [576,539,549],
        [559,576,549],
        [519,559,549],
        [539,519,549],
        [519,476,489],
        [501,519,489],
        [464,501,489],
        [476,464,489],
        [559,519,529],
        [553,559,529],
        [501,553,529],
        [519,501,529],
        [680,648,632],
        [628,680,632],
        [576,628,632],
        [648,576,632],
        [730,680,678],
        [685,730,678],
        [628,685,678],
        [680,628,678],
        [821,730,746],
        [776,821,746],
        [685,776,746],
        [730,685,746],
        [934,821,866],
        [930,934,866],
        [776,930,866],
        [821,776,866],
        [628,576,598],
        [614,628,598],
        [559,614,598],
        [576,559,598],
        [685,628,652],
        [674,685,652],
        [614,674,652],
        [628,614,652],
        [614,559,580],
        [610,614,580],
        [553,610,580],
        [559,553,580],
        [674,614,636],
        [668,674,636],
        [610,668,636],
        [614,610,636],
        [776,685,716],
        [768,776,716],
        [674,768,716],
        [685,674,716],
        [930,776,858],
        [924,930,858],
        [768,924,858],
        [776,768,858],
        [768,674,709],
        [764,768,709],
        [668,764,709],
        [674,668,709],
        [924,768,854],
        [920,924,854],
        [764,920,854],
        [768,764,854],
        [977,938,965],
        [1042,977,965],
        [936,1042,965],
        [938,936,965],
        [1009,977,1044],
        [1125,1009,1044],
        [1042,1125,1044],
        [977,1042,1044],
        [981,936,967],
        [1032,981,967],
        [934,1032,967],
        [936,934,967],
        [1042,981,1054],
        [1123,1042,1054],
        [1032,1123,1054],
        [981,1032,1054],
        [1083,1042,1111],
        [1173,1083,1111],
        [1123,1173,1111],
        [1042,1123,1111],
        [1125,1083,1152],
        [1205,1125,1152],
        [1173,1205,1152],
        [1083,1173,1152],
        [1048,1009,1091],
        [1160,1048,1091],
        [1125,1160,1091],
        [1009,1125,1091],
        [1063,1048,1119],
        [1170,1063,1119],
        [1160,1170,1119],
        [1048,1160,1119],
        [1140,1125,1177],
        [1233,1140,1177],
        [1205,1233,1177],
        [1125,1205,1177],
        [1160,1140,1195],
        [1249,1160,1195],
        [1233,1249,1195],
        [1140,1233,1195],
        [1164,1160,1215],
        [1271,1164,1215],
        [1249,1271,1215],
        [1160,1249,1215],
        [1170,1164,1223],
        [1279,1170,1223],
        [1271,1279,1223],
        [1164,1271,1223],
        [1032,934,987],
        [1077,1032,987],
        [930,1077,987],
        [934,930,987],
        [1123,1032,1107],
        [1168,1123,1107],
        [1077,1168,1107],
        [1032,1077,1107],
        [1173,1123,1175],
        [1225,1173,1175],
        [1168,1225,1175],
        [1123,1168,1175],
        [1205,1173,1221],
        [1277,1205,1221],
        [1225,1277,1221],
        [1173,1225,1221],
        [1077,930,995],
        [1085,1077,995],
        [924,1085,995],
        [930,924,995],
        [1168,1077,1137],
        [1179,1168,1137],
        [1085,1179,1137],
        [1077,1085,1137],
        [1085,924,999],
        [1089,1085,999],
        [920,1089,999],
        [924,920,999],
        [1179,1085,1144],
        [1185,1179,1144],
        [1089,1185,1144],
        [1085,1089,1144],
        [1225,1168,1201],
        [1239,1225,1201],
        [1179,1239,1201],
        [1168,1179,1201],
        [1277,1225,1255],
        [1294,1277,1255],
        [1239,1294,1255],
        [1225,1239,1255],
        [1239,1179,1217],
        [1243,1239,1217],
        [1185,1243,1217],
        [1179,1185,1217],
        [1294,1239,1273],
        [1300,1294,1273],
        [1243,1300,1273],
        [1239,1243,1273],
        [1233,1205,1251],
        [1314,1233,1251],
        [1277,1314,1251],
        [1205,1277,1251],
        [1249,1233,1284],
        [1346,1249,1284],
        [1314,1346,1284],
        [1233,1314,1284],
        [1271,1249,1308],
        [1368,1271,1308],
        [1346,1368,1308],
        [1249,1346,1308],
        [1279,1271,1320],
        [1376,1279,1320],
        [1368,1376,1320],
        [1271,1368,1320],
        [1314,1277,1304],
        [1334,1314,1304],
        [1294,1334,1304],
        [1277,1294,1304],
        [1346,1314,1338],
        [1377,1346,1338],
        [1334,1377,1338],
        [1314,1334,1338],
        [1334,1294,1324],
        [1352,1334,1324],
        [1300,1352,1324],
        [1294,1300,1324],
        [1377,1334,1364],
        [1389,1377,1364],
        [1352,1389,1364],
        [1334,1352,1364],
        [1368,1346,1374],
        [1401,1368,1374],
        [1377,1401,1374],
        [1346,1377,1374],
        [1376,1368,1387],
        [1415,1376,1387],
        [1401,1415,1387],
        [1368,1401,1387],
        [1401,1377,1395],
        [1422,1401,1395],
        [1389,1422,1395],
        [1377,1389,1395],
        [1415,1401,1418],
        [1434,1415,1418],
        [1422,1434,1418],
        [1401,1422,1418]
    ];

    var calculateNormals = function(vertices, indices) {
        var nvecs = new Array(vertices.length);

        for (var i = 0; i < indices.length; i++) {
            var j0 = indices[i][0];
            var j1 = indices[i][1];
            var j2 = indices[i][2];

            var v1 = vertices[j0];
            var v2 = vertices[j1];
            var v3 = vertices[j2];

            var va = SceneJS._math.subVec4(v2, v1);
            var vb = SceneJS._math.subVec4(v3, v1);

            var n = SceneJS._math.normalizeVec4(SceneJS._math.cross3Vec4(va, vb));

            if (!nvecs[j0]) nvecs[j0] = [];
            if (!nvecs[j1]) nvecs[j1] = [];
            if (!nvecs[j2]) nvecs[j2] = [];

            nvecs[j0].push(n);
            nvecs[j1].push(n);
            nvecs[j2].push(n);
        }

        var normals = new Array(vertices.length);

        // now go through and average out everything
        for (var i = 0; i < nvecs.length; i++) {
            var count = nvecs[i].length;
            var x = 0;
            var y = 0;
            var z = 0;
            for (var j = 0; j < count; j++) {
                x += nvecs[i][j][0];
                y += nvecs[i][j][1];
                z += nvecs[i][j][2];
            }
            normals[i] = [x / count, y / count, z / count];
        }
        return normals;
    };

    var flatten = function (ar, numPerElement) {
        var result = [];
        for (var i = 0; i < ar.length; i++) {
            if (numPerElement && ar[i].length != numPerElement)
                throw new SceneJS.exceptions.InvalidGeometryConfigException("Bad geometry array element");
            for (var j = 0; j < ar[i].length; j++)
                result.push(ar[i][j]);
        }
        return result;
    };

    return SceneJS.geometry({
        type:"teapot",
        primitive:"triangles",
        vertices: flatten(vertices, 3),
        indices:flatten(indices, 3),
        normals:flatten(calculateNormals(vertices, indices), 3)
    });
};



SceneJS._utils.ns("SceneJS.objects");

/**
 * Provides a cube geometry node by wrapping a call to the core SceneJS.geometry node.
 *
 * Cube geometry. This node type takes no parameters, and the cube is fixed to size [-1..1] on each axis,
 * so if you want to resize it you should wrap it in a scale node.
 */

SceneJS.objects.cube = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    /* Dynamic config OK, but only applies first time - good for assets    
     */
    var params = cfg.getParams();

    var x = params.xSize || 1;
    var y = params.ySize || 1;
    var z = params.zSize || 1;

    /* A geometry node is normally configured with arrays of vertices, normals, indices etc., but can instead be
     * configured with a "create" callback, as demonstrated here, that returns an object containing those arrays.
     *
     * Every geometry must get a type that globally identifies it within SceneJS. In this case, the
     * type is generated from the number of rings and slices.
     *
     * Since SceneJS caches geometry by type, it will attempt to reuse the geometry if it can find it in the cache,
     * otherwise it will use the callback to create it.
     */
    return SceneJS.geometry({

        type: "cube_" + x + "_" + y + "_" + z,

        /* Callback to create sphere geometry
         */
        create: function() {
            var vertices = [
                x, y, z,
                -x, y, z,
                -x,-y, z,
                x,-y, z,
                // v0-v1-v2-v3 front
                x, y, z,
                x,-y, z,
                x,-y,-z,
                x, y,-z,
                // v0-v3-v4-v5 right
                x, y, z,
                x, y,-z,
                -x, y,-z,
                -x, y, z,
                // v0-v5-v6-v1 top
                -x, y, z,
                -x, y,-z,
                -x,-y,-z,
                -x,-y, z,
                // v1-v6-v7-v2 left
                -x,-y,-z,
                x,-y,-z,
                x,-y, z,
                -x,-y, z,
                // v7-v4-v3-v2 bottom
                x,-y,-z,
                -x,-y,-z,
                -x, y,-z,
                x, y,-z
            ];   // v4-v7-v6-v5 back

            var normals = [
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                // v0-v1-v2-v3 front
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                // v0-v3-v4-v5 right
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                // v0-v5-v6-v1 top
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                // v1-v6-v7-v2 left
                0,1, 0,
                0,1, 0,
                0,1, 0,
                0,1, 0,
                // v7-v4-v3-v2 bottom
                0, 0,1,
                0, 0,1,
                0, 0,1,
                0, 0,1
            ];    // v4-v7-v6-v5 back

            var texCoords = [
                x, y,
                0, y,
                0, 0,
                x, 0,
                // v0-v1-v2-v3 front
                0, y,
                0, 0,
                x, 0,
                x, y,
                // v0-v3-v4-v5 right
                x, 0,
                x, y,
                0, y,
                0, 0,
                // v0-v5-v6-v1 top
                x, y,
                0, y,
                0, 0,
                x, 0,
                // v1-v6-v7-v2 left
                0, 0,
                x, 0,
                x, y,
                0, y,
                // v7-v4-v3-v2 bottom
                0, 0,
                x, 0,
                x, y,
                0, y
            ];   // v4-v7-v6-v5 back

            var indices = [
                0, 1, 2,
                0, 2, 3,
                // front
                4, 5, 6,
                4, 6, 7,
                // right
                8, 9,10,
                8,10,11,
                // top
                12,13,14,
                12,14,15,
                // left
                16,17,18,
                16,18,19,
                // bottom
                20,21,22,
                20,22,23
            ] ;  // back

            return {
                primitive : "triangles",
                vertices : vertices,
                normals: normals,
                texCoords : texCoords,
                indices : indices,
                colors:[]
            };
        }
    });
};



SceneJS._utils.ns("SceneJS.objects");

/**
 * Provides a sphere geometry node by wrapping a call to the core SceneJS.geometry node.
 *
 * Example of use:
 *
 * SceneJS.objects.sphere({ rings: 30, slices: 30 })
 */
SceneJS.objects.sphere = function() {

    var cfg = SceneJS._utils.getNodeConfig(arguments || [
        {}
    ]);

    /* Dynamic config OK, but only applies first time - good for assets
     */
    var params = cfg.getParams();

    var slices = params.slices || 30;
    var rings = params.rings || 30;

    /* A geometry node is normally configured with arrays of vertices, normals, indices etc., but can instead be
     * configured with a "create" callback, as demonstrated here, that returns an object containing those arrays.
     *
     * Every geometry must get a type that globally identifies it within SceneJS. In this case, the
     * type is generated from the number of rings and slices.
     *
     * Since SceneJS caches geometry by type, it will attempt to reuse the geometry if it can find it in the cache,
     * otherwise it will use the callback to create it.
     */
    return SceneJS.geometry({

        /* Unique global ID for this geometry
         */
        type: "sphere_" + rings + "_" + slices,

        /* Callback to create sphere geometry
         */
        create: function() {
            var radius = 1;
            var vertices = [];
            var normals = [];
            var texCoords = [];
            for (var sliceNum = 0; sliceNum <= slices; sliceNum++) {
                var theta = sliceNum * Math.PI / slices;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var ringNum = 0; ringNum <= rings; ringNum++) {
                    var phi = ringNum * 2 * Math.PI / rings;
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = cosPhi * sinTheta;
                    var y = cosTheta;
                    var z = sinPhi * sinTheta;
                    var u = 1 - (ringNum / rings);
                    var v = sliceNum / slices;

                    normals.push(-x);
                    normals.push(-y);
                    normals.push(-z);
                    texCoords.push(u);
                    texCoords.push(v);
                    vertices.push(radius * x);
                    vertices.push(radius * y);
                    vertices.push(radius * z);
                }
            }

            var indices = [];
            for (var sliceNum = 0; sliceNum < slices; sliceNum++) {
                for (var ringNum = 0; ringNum < rings; ringNum++) {
                    var first = (sliceNum * (rings + 1)) + ringNum;
                    var second = first + rings + 1;
                    indices.push(first);
                    indices.push(second);
                    indices.push(first + 1);

                    indices.push(second);
                    indices.push(second + 1);
                    indices.push(first + 1);
                }
            }

            return {
                primitive : "triangles",
                vertices : vertices,
                normals: normals,
                texCoords : texCoords,
                indices : indices,
                colors:[]
            };
        }
    });
};
/**
 * Backend that manages the current modelling transform matrices (modelling and normal).
 *
 * Services the scene modelling transform nodes, such as SceneJS.rotate, providing them with methods to set and
 * get the current modelling transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the modelling matrix and inverse normal matrix as WebGLFloatArrays to the
 * shading backend.
 *
 * Normal matrix and WebGLFloatArrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "model-transform",

        function(ctx) {

            var transform;
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS._math.identityMat4(),
                            fixed: true,
                            identity : true
                        };
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {

                        if (dirty) {

                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            if (!transform.normalMatrixAsArray) {
                                transform.normalMatrixAsArray = new WebGLFloatArray(
                                        SceneJS._math.transposeMat4(
                                                SceneJS._math.inverseMat4(transform.matrix)));
                            }

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.MODEL_TRANSFORM_EXPORTED,
                                    transform);

                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            /* Node-facing API
             */
            return {

                setTransform : function(t) {
                    transform = t;
                    dirty = true;
                    ctx.events.fireEvent(SceneJS._eventTypes.MODEL_TRANSFORM_UPDATED, transform);
                },

                getTransform : function() {
                    return transform;
                }
            };
        });
/**
 * Sets a rotation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */

SceneJS.rotate = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    var memoLevel = NO_MEMO;
    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(data) {
                if (memoLevel == NO_MEMO) {
                    var params = cfg.getParams(data);
                    params.angle = params.angle || 0;
                    params.x = params.x || 0;
                    params.y = params.y || 0;
                    params.z = params.z || 0;
                    if (params.x + params.y + params.z == 0) {
                        throw new SceneJS.exceptions.IllegalRotateConfigException('Rotate vector is zero - at least one of x,y and z must be non-zero');
                    }
                    mat = SceneJS._math.rotationMat4v(params.angle * Math.PI / 180.0, [params.x, params.y, params.z]);
                    if (cfg.fixed) {
                        memoLevel = FIXED_CONFIG;
                    }
                }
                var superXform = backend.getTransform();
                if (memoLevel < FIXED_MODEL_SPACE) {
                    var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                    xform = {
                        localMatrix: mat,
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };
                    if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                        memoLevel = FIXED_MODEL_SPACE;
                    }
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(superXform);
            });
};
/**
 * Sets a translation modelling transformation on the current shader. The transform will be cumulative with transforms at
 * higher nodes.
 */
(function() {

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    SceneJS.translate = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var mat;
        var xform;
        var memoLevel = NO_MEMO;

        return SceneJS._utils.createNode(
                function(data) {
                    if (memoLevel == NO_MEMO) {
                        var params = cfg.getParams(data);
                        mat = SceneJS._math.translationMat4v([params.x || 0, params.y || 0, params.z || 0]);
                    }
                    var superXform = backend.getTransform();
                    if (memoLevel < FIXED_MODEL_SPACE) {
                        var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                        xform = {
                            localMatrix: mat,
                            matrix: tempMat,
                            fixed: superXform.fixed && cfg.fixed
                        };
                        if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                            memoLevel = FIXED_MODEL_SPACE;
                        }
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setTransform(superXform);
                });
    };
})();
/**
 * Scaling modelling transform node
 */
(function() {

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    SceneJS.scale = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var mat;
        var xform;
        var memoLevel = NO_MEMO;

        return SceneJS._utils.createNode(
                function(data) {
                    if (memoLevel == NO_MEMO) {   
                        var params = cfg.getParams(data);
                        mat = SceneJS._math.scalingMat4v([params.x || 1, params.y || 1, params.z || 1]);
                        if (cfg.fixed) {
                            memoLevel = FIXED_CONFIG;
                        }
                    }
                    var superXform = backend.getTransform();
                    if (memoLevel < FIXED_MODEL_SPACE) {
                        var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                        xform = {
                            localMatrix: mat,
                            matrix: tempMat,
                            fixed: superXform.fixed && cfg.fixed
                        };
                        if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                            memoLevel = FIXED_MODEL_SPACE;
                        }
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setTransform(superXform);
                });
    };
})();
/**
 * Sets a modelling matrix on the current shader. The matrix should be a 1D array of sixteen elements and
 * will be cumulative with transforms at higher nodes.
 */

SceneJS.modellingMatrix = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    /* Memoization levels
     */
    const NO_MEMO = 0;              // No memoization, assuming that node's configuration is dynamic
    const FIXED_CONFIG = 1;         // Node config is fixed, memoizing local object-space matrix
    const FIXED_MODEL_SPACE = 2;    // Both node config and model-space are fixed, memoizing axis-aligned volume

    var backend = SceneJS._backends.getBackend('model-transform');

    var memoLevel = NO_MEMO;
    var mat;
    var xform;

    return SceneJS._utils.createNode(
            function(data) {
                if (memoLevel == NO_MEMO) {
                    var params = cfg.getParams(data);
                    mat = params.elements || SceneJS._math.identityMat4();
                    if (cfg.fixed) {
                        memoLevel = FIXED_CONFIG;
                    }
                }
                var superXform = backend.getTransform();
                if (memoLevel < FIXED_MODEL_SPACE) {
                    var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                    xform = {
                        localMatrix: mat,
                        matrix: tempMat,
                        fixed: superXform.fixed && cfg.fixed
                    };
                    if (memoLevel == FIXED_CONFIG && superXform.fixed) {   // Bump up memoization level if model-space fixed
                        memoLevel = FIXED_MODEL_SPACE;
                    }
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(superXform);
            });
};
/**
 * Backend that manages the current projection transform matrix.
 *
 * Services the scene projection transform nodes, such as SceneJS.frustum, providing them with methods to set and
 * get the current projection matrix.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * PROJECTION_TRANSFORM_EXPORTED to pass the projection matrix as a WebGLFloatArray to the shading backend.
 *
 * The WebGLFloatArray is lazy-computed and cached on export to avoid repeatedly regenerating it.
 *
 * Avoids redundant export of the matrix with a dirty flag; the matrix is only exported when the flag is set, which
 * occurs when the matrix is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "projection",

        function(ctx) {

            var transform;
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS._math.identityMat4(),
                            fixed: true
                        };
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {                
                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.PROJECTION_TRANSFORM_EXPORTED,
                                    transform);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            /* Node-facing API
             */
            return {

                setTransform: function(t) {
                    transform = t;
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                            transform);
                },

                getTransform: function() {
                    return transform;
                }
            };
        });
/**
 * Scene node that constructs a perspective projection matrix and sets it on the current shader.
 */

SceneJS.perspective = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('projection');
    var transform;

    return SceneJS._utils.createNode(
            function(data) {
                if (!transform || !cfg.fixed) {
                    var params = cfg.getParams(data);
                    var tempMat = SceneJS._math.perspectiveMatrix4(
                            (params.fovy || 60.0) * Math.PI / 180.0,
                            params.aspect || 1.0,
                            params.near || 0.1,
                            params.far || 400.0);

                    transform = {
                        matrix:tempMat
                    };
                }
                var prevTransform = backend.getTransform();
                backend.setTransform(transform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(prevTransform);
            });
};

/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 */
SceneJS.ortho = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('projection');
    var transform;
    return SceneJS._utils.createNode(
            function(data) {
                if (!transform || !cfg.fixed) {
                    var params = cfg.getParams(data);
                    var volume = {
                        left: params.left || -1.0,
                        right: params.right || 1.0,
                        bottom: params.bottom || -1.0,
                        top: params.top || 1.0,
                        near: params.near || 0.1,
                        far: params.far || 100.0
                    };
                    var tempMat = SceneJS._math.orthoMat4c(
                            volume.left,
                            volume.right,
                            volume.bottom,
                            volume.top,
                            volume.near,
                            volume.far
                            );
                    transform = {
                        matrix: tempMat
                    };
                }
                var prevTransform = backend.getTransform();
                backend.setTransform(transform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(prevTransform);
            });
};
/**
 * Scene node that specifies the current viewing volume and projection matrix
 */
SceneJS.frustum = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('projection');
    var transform;
    return SceneJS._utils.createNode(
            function(data) {
                if (!transform || cfg.fixed) {    // Memoize matrix if node config is constant
                    var params = cfg.getParams(data);
                    var volume = {
                        xmin: params.left || -1.0,
                        xmax: params.right || 1.0,
                        ymin: params.bottom || -1.0,
                        ymax: params.top || 1.0,
                        zmin: params.near || 0.1,
                        zmax: params.far || 100.0
                    };
                    var tempMat = SceneJS._math.frustumMatrix4(
                            volume.xmin,
                            volume.xmax,
                            volume.ymin,
                            volume.ymax,
                            volume.zmin,
                            volume.zmax
                            );
                    transform = {
                        matrix: tempMat
                    };
                }
                var prevTransform = backend.getTransform();
                backend.setTransform(transform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(prevTransform);
            });
};
/**
 * Backend that manages the current view transform matrices (view and normal).
 *
 * Services the scene view transform nodes, such as SceneJS.lookAt, providing them with methods to set and
 * get the current view transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the view matrix and normal matrix as WebGLFloatArrays to the
 * shading backend.
 *
 * Normal matrix and WebGLFloatArrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a VIEW_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "view-transform",

        function(ctx) {

            var transform;
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        transform = {
                            matrix : SceneJS._math.identityMat4(),
                            fixed: true
                        };
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {

                            if (!transform.matrixAsArray) {
                                transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                            }

                            if (!transform.normalMatrixAsArray) {
                                transform.normalMatrixAsArray = new WebGLFloatArray(
                                        SceneJS._math.transposeMat4(
                                                SceneJS._math.inverseMat4(transform.matrix)));
                            }

                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.VIEW_TRANSFORM_EXPORTED,
                                    transform);

                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            /* Node-facing API
             */
            return {

                setTransform : function(t) {
                    transform = t;
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                            transform);
                },                               

                getTransform : function() {
                    return transform;
                }
            };
        });
/**
 * Scene node that constructs a 'lookAt' view transformation matrix and sets it on the current shader.
 */

SceneJS.lookAt = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var backend = SceneJS._backends.getBackend('view-transform');

    var cloneVec = function(v) {
        return { x : v.x || 0, y : v.y || 0, z : v.z || 0 };
    };

    var mat;
    var fixed = cfg.fixed;
    var xform;

    return SceneJS._utils.createNode(
            function(data) {
                if (!mat || !fixed) {
                    var nodeParams = new SceneJS._utils.NodeParams("SceneJS.lookAt", cfg.getParams(data), data);

                    var eye = cloneVec(nodeParams.getParam("eye", data, true), { x: 0.0, y: 0.0, z: 0.0 });
                    var look = cloneVec(nodeParams.getParam("look", data, false), { x: 0.0, y: 0.0, z: 0.0 });
                    var up = cloneVec(nodeParams.getParam("up", data, false), { x: 0.0, y: 1.0, z: 0.0 });

                    if (eye.x == look.x && eye.y == look.y && eye.z == look.z) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: eye and look cannot be identical");
                    }
                    if (up.x == 0 && up.y == 0 && up.z == 0) {
                        throw new SceneJS.exceptions.InvalidLookAtConfigException
                                ("Invald lookAt parameters: up vector cannot be of zero length, ie. all elements zero");
                    }

                    mat = SceneJS._math.lookAtMat4c(
                            eye.x, eye.y, eye.z,
                            look.x, look.y, look.z,
                            up.x, up.y, up.z);

                    fixed = cfg.fixed && nodeParams.fixed;
                }

                var superXform = backend.getTransform();
                if (!xform || !superXform.fixed || !fixed) {
                    var tempMat = SceneJS._math.mulMat4(superXform.matrix, mat);
                    xform = {
                        matrix: tempMat,
                        lookAt : {
                            eye: eye,
                            look: look,
                            up: up
                        },
                        fixed: superXform.fixed && fixed
                    };
                }
                backend.setTransform(xform);
                SceneJS._utils.visitChildren(cfg, data);
                backend.setTransform(superXform);
            });
};
/**

 */
SceneJS.stationary = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('view-transform');
    var xform;
    return SceneJS._utils.createNode(
            function(data) {
                var superXform = backend.getTransform();
                var lookAt = superXform.lookAt;
                if (lookAt) {
                    if (!lookAt || !superXform.fixed) {
                        xform = {
                            matrix: SceneJS._math.mulMat4(
                                    superXform.matrix,
                                    SceneJS._math.translationMat4c(
                                            lookAt.eye.x,
                                            lookAt.eye.y,
                                            lookAt.eye.z)),
                            lookAt: lookAt,
                            fixed: superXform.fixed
                        };
                    }
                    backend.setTransform(xform);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setTransform(superXform);
                } else {
                    SceneJS._utils.visitChildren(cfg, data);
                }
            });
};

/**
 * Backend that manages scene lighting.
 *
 * Holds the sources on a stack and provides the SceneJS.light node with methods to push and pop them.
 *
 * Tracks the view and modelling transform matrices through incoming VIEW_TRANSFORM_UPDATED and
 * MODEL_TRANSFORM_UPDATED events. As each light are pushed, its position and/or direction is multipled by the
 * matrices. The stack will therefore contain sources that are instanced in view space by different modelling
 * transforms, with positions and directions that may be animated,
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * LIGHTS_EXPORTED to pass the entire light stack to the shading backend.
 *
 * Avoids redundant export of the sources with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the lights node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes or pops the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "lights",

        function(ctx) {

            var viewMat;
            var modelMat;
            var lightStack = [];
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        modelMat = viewMat = SceneJS._math.identityMat4();
                        lightStack = [];
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.MODEL_TRANSFORM_UPDATED,
                    function(params) {
                        modelMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.LIGHTS_EXPORTED,
                                    lightStack);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            function vectorToArray(v, fallback) {
                return v ? [ v.x || 0, v.y || 0, -v.z || 0] : fallback;    // TODO: Hack to negate vertex X and Y
            }

            function colourToArray(v, fallback) {
                return v ? [ v.r || fallback[0], v.g || fallback[1], v.b || fallback[2]] : fallback;
            }

            /* Creates a view-space light
             */
            function createLight(light) {
                if (light.type &&
                    (light.type != "spot"
                            && light.type != "dir"
                            && light.type != "point")) {
                    throw SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.light node has a light of unsupported type - should be 'spot', 'direction' or 'point'");
                }
                return {
                    type: light.type || "point",

                    color: colourToArray(light.color, [ 1.0, 1.0, 1.0 ]),

                    diffuse : light.diffuse,                    
                    specular : light.specular,

                    pos : SceneJS._math.transformPoint3(
                            viewMat,
                            SceneJS._math.transformPoint3(
                                    modelMat,
                                    vectorToArray(light.pos, [ 0,  0,  1.0]))),

                    spotDir: SceneJS._math.transformVector3(
                            viewMat,
                            SceneJS._math.transformVector3(
                                    modelMat,
                                    vectorToArray(light.spotDir, [ 0,  0,  -1.0]))),

                    spotExponent: light.spotExponent == undefined ?  1.0 : light.spotExponent,
                    spotCosCutOff: light.spotCosCutOff == undefined ?  20.0 : light.spotCosCutOff,

                    constantAttenuation: light.constantAttenuation == undefined ? 1.0 : light.constantAttenuation,
                    linearAttenuation: light.linearAttenuation == undefined ? 0.0 : light.linearAttenuation,
                    quadraticAttenuation: light.quadraticAttenuation == undefined ? 0.0 : light.quadraticAttenuation
                };
            }

              /* Transforms light by view and model matrices
             */
            function createLightOLD(light) {
                if (light.type &&
                    (light.type != "spot"
                            && light.type != "dir"
                            && light.type != "point")) {
                    throw SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.light node has a light of unsupported type - should be 'spot', 'direction' or 'point'");
                }
                return {
                    type: light.type || "point",
                    ambient: colourToArray(light.ambient, [ 0.2, 0.2, 0.2 ]),
                    diffuse: colourToArray(light.diffuse, [ 1.0, 1.0, 1.0 ]),
                    specular: colourToArray(light.specular, [ 1.0, 1.0, 1.0 ]),

                    pos : SceneJS._math.transformPoint3(
                            viewMat,
                            SceneJS._math.transformPoint3(
                                    modelMat,
                                    vectorToArray(light.pos, [ 0,  0,  1.0]))),
                    spotDir: SceneJS._math.transformVector3(
                            viewMat,
                            SceneJS._math.transformVector3(
                                    modelMat,
                                    vectorToArray(light.spotDir, [ 0,  0,  -1.0]))),

                    spotExponent: light.spotExponent || 0.0,
                    spotCosCutOff: light.spotCosCutOff || 20.0,

                    constantAttenuation: light.constantAttenuation || 1.0,
                    linearAttenuation: light.linearAttenuation || 0.0,
                    quadraticAttenuation: light.quadraticAttenuation || 0.0
                };
            }

            /* Node-facing API
             */
            return {

                pushLights : function(sources) {
                    for (var i = 0; i < sources.length; i++) {
                        lightStack.push(createLight(sources[i]));
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                },

                popLights : function(numSources) {
                    for (var i = 0; i < numSources; i++) {
                        lightStack.pop();
                    }
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.LIGHTS_UPDATED,
                            lightStack);
                }
            };
        });

/**
 * Defines a set of lights in a scene. These may appear at multiple points, anywhere in a scene graph, to define
 * multiple sources of light. The number of lights is only limited by memory available to the GPU.
 *
 * TODO: comment
 */
SceneJS.lights = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('lights');
    return SceneJS._utils.createNode(
            function(data) {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                    SceneJS._utils.visitChildren(cfg, data);
                } else {
                    var sources = cfg.getParams(data).sources;
                    backend.pushLights(sources);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.popLights(sources.length);
                }
            });
};

/**
 * Backend that manages the current material properties.
 *
 * Services the SceneJS.material scene node, providing it with methods to set and get the current material.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MATERIAL_EXPORTED to pass the material properties to the shading backend.
 *
 * Avoids redundant export of the material properties with a dirty flag; they are only exported when that is set, which
 * occurs when material is set by the SceneJS.material node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Sets the properties to defaults on SCENE_ACTIVATED.
 *
 * Whenever a SceneJS.material sets the material properties, this backend publishes it with a MATERIAL_UPDATED to allow
 * other dependent backends to synchronise their resources. One such backend is the shader backend, which taylors the
 * active shader according to the material properties.
 */
SceneJS._backends.installBackend(

        "material",

        function(ctx) {

            var material;
            var dirty;

            function colour4ToArray(v, fallback) {
                return v ?
                       [
                           v.r != undefined ? v.r : fallback[0],
                           v.g != undefined ? v.g : fallback[1],
                           v.b != undefined ? v.b : fallback[2],
                           v.a != undefined ? v.a : fallback[3]
                       ] : fallback;
            }

            function colour3ToArray(v, fallback) {
                return v ?
                       [
                           v.r != undefined ? v.r : fallback[0],
                           v.g != undefined ? v.g : fallback[1],
                           v.b != undefined ? v.b : fallback[2]
                       ] : fallback;
            }

            function _createMaterial(m) {
                return {
                    baseColor: colour4ToArray(m.baseColor, [ 0.2,  0.2,  0.2, 0.0]),       // IE. diffuse colour
                    specularColor: colour3ToArray(m.specularColor, [ 0.8,  0.8,  0.8]),
                    specular: m.specular,
                    shine: m.shine || 0.0,
                    reflect: m.reflect || 0.0,
                    alpha: (m.alpha == undefined) ? 1.0 : m.alpha,
                    emit: m.alpha || 0.0,
                    blendMode: m.blendMode || "multiply"
                };
            }

            function _createMaterialOLD(m) {
                return {
                    ambient: colourToArray(m.ambient, [ 0.2,  0.2,  0.2]),
                    diffuse: colourToArray(m.diffuse, [ 0.8,  0.8,  0.8]),
                    specular: colourToArray(m.specular, [ 0.0,  0.0,  0.0]),
                    shininess: m.shininess || 0,
                    emission: colourToArray(m.emission, [ 0.0,  0.0,  0.0])
                };
            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        material = _createMaterial({});
                        dirty = true;
                    });


            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.MATERIAL_EXPORTED,
                                    material);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });


            /* Node-facing API
             */
            return {

                createMaterial: _createMaterial,

                setMaterial : function(m) {
                    material = m;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.MATERIAL_UPDATED,
                            material);
                    dirty = true;
                },

                getMaterial : function() {
                    return material;
                }
            };
        });
/** Sets material properties on the current shader for sub-nodes
 */
SceneJS.material = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('material');

    var material;

    return SceneJS._utils.createNode(
            function(data) {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                    SceneJS._utils.visitChildren(cfg, data);
                } else {
                    if (!material || !cfg.fixed) {
                        material = backend.createMaterial(cfg.getParams(data));
                    }
                    var saveMaterial = backend.getMaterial();
                    backend.setMaterial(material);
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setMaterial(saveMaterial);
                }
            });

};
/**
 * Takes a key value from the current scope and creates a child scope containing an output value that is
 * interpolated within the configured keyframe sequence.
 */
SceneJS.scalarInterpolator = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) { // Can't dynamically configure an interpolator - TODO: would that be useful?
        throw new SceneJS.exceptions.UnsupportedOperationException("Dynamic configuration of interpolators is not supported");
    }

    var NOT_FOUND = 0;
    var BEFORE_FIRST = 1;
    var AFTER_LAST = 2;
    var FOUND = 3;

    var params;
    var outputValue;

    return SceneJS._utils.createNode(
            function(data) {
                if (!params) {
                    params = cfg.getParams(data);

                    // Validate

                    if (!params.input) {
                        throw 'scalarInterpolator input parameter missing';
                    }

                    if (!params.output) {
                        throw 'scalarInterpolator output parameter missing';
                    }

                    if (params.keys) {
                        if (!params.values) {
                            throw 'scalarInterpolator keys supplied but no values - must supply a value for each key';
                        }
                    } else if (params.values) {
                        throw 'scalarInterpolator values supplied but no keys - must supply a key for each value';
                    }

                    for (var i = 1; i < params.keys.length; i++) {
                        if (params.keys[i - 1] >= params.keys[i]) {
                            throw 'two invalid scalarInterpolator keys found (' + i - 1 + ' and ' + i + ') - key list should contain distinct values in ascending order';
                        }
                    }

                    params.type = params.type || 'linear';

                    switch (params.type) {
                        case 'linear':
                            break;
                        case 'constant':
                            break;
                        case 'cosine':
                            break;
                        case 'cubic':
                            if (params.keys.length < 4) {
                                throw 'Minimum of four keyframes required for cubic scalarInterpolation - only '
                                        + params.keys.length
                                        + ' are specified';
                            }
                            break;
                        default:
                            throw 'scalarInterpolator type not supported - only "linear", "cosine", "cubic" and "constant" are supported';
                        /*


                         case 'hermite':
                         break;
                         */
                    }
                }

                var key = data.get(params.input);

                if (!key && key != 0) {
                    throw "scalarInterpolator failed to find input on data";
                }

                var key1 = 0;
                var key2 = 1;

                var linearInterpolate = function(k) {
                    var u = params.keys[key2] - params.keys[key1];
                    var v = k - params.keys[key1];
                    var w = params.values[key2] - params.values[key1];
                    return params.values[key1] + ((v / u) * w);
                } ;

                var constantInterpolate = function(k) {
                    if (Math.abs((k - params.keys[key1])) < Math.abs((k - params.keys[key2]))) {
                        return params.keys[key1];
                    } else
                    {
                        return params.keys[key2];
                    }
                };

                var cosineInterpolate = function(k) {
                    var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
                    return (params.keys[key1] * (1 - mu2) + params.keys[key2] * mu2);
                };

                var cubicInterpolate = function(k) {
                    if (key1 == 0 || key2 == (params.keys.length - 1)) {
                        /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
                         */
                        return cosineInterpolate(k);
                    }
                    var y0 = params.keys[key1 - 1];
                    var y1 = params.keys[key1];
                    var y2 = params.keys[key2];
                    var y3 = params.keys[key2 + 1];
                    var mu2 = k * k;
                    var a0 = y3 - y2 - y0 + y1;
                    var a1 = y0 - y1 - a0;
                    var a2 = y2 - y0;
                    var a3 = y1;
                    return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
                };

                var findEnclosingFrame = function(key) {
                    if (params.keys.length == 0) {
                        return NOT_FOUND;
                    }
                    if (key < params.keys[0]) {
                        return BEFORE_FIRST;
                    }
                    if (key > params.keys[params.keys.length - 1]) {
                        return AFTER_LAST;
                    }
                    while (params.keys[key1] > key) {
                        key1--;
                        key2--;
                    }
                    while (params.keys[key2] < key) {
                        key1++;
                        key2++;
                    }
                    return FOUND;
                } ;

                var interpolate = function(k) {
                    switch (params.type) {
                        case 'linear':
                            return linearInterpolate(k);
                        case 'cosine':
                            return cosineInterpolate(k);
                        case 'cubic':
                            return cubicInterpolate(k);
                        case 'constant':
                            return constantInterpolate(k);
                        default:
                            throw 'internal error - interpolation type not switched: "' + params.type + "'";
                    }
                };

                var update = function() {
                    switch (findEnclosingFrame(key)) {
                        case NOT_FOUND:
                            break;
                        case BEFORE_FIRST:
                            break; // time delay before interpolation begins
                        case AFTER_LAST:
                            outputValue = params.values[params.values.length - 1];
                            break;
                        case FOUND:
                            outputValue = interpolate((key));
                            break;
                        default:
                            break;
                    }
                };

                update();

                var childScope = SceneJS._utils.newScope(data, cfg.fixed);
                childScope.put(params.output, outputValue);

                SceneJS._utils.visitChildren(cfg, childScope);
            });
};




/**
 * Scene node that creates a child data containing the elements of its configuration.
 */
SceneJS.withData = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    var childScope;

    return SceneJS._utils.createNode(
            function(data) {
                if (!childScope || !cfg.fixed || !data.isfixed()) { // memoize data if config and data are constant
                    childScope = SceneJS._utils.newScope(data, cfg.fixed);
                    var params = cfg.getParams(data);
                    if (params) {
                        for (var key in params) {
                            childScope.put(key, params[key]);
                        }
                    }
                }
                SceneJS._utils.visitChildren(cfg, childScope);
            });
};


/**
 * The SceneJS.generator node loops over its children, each time creating a child data for them from the result of its
 * configuration function, repeating this process until the config function returns nothing.
 *
 * This node type must be configured dynamically therefore, in the SceneJS style, with a configuration function.
 *
 * This node type is useful for procedurally generating scene subtrees. Its most common application would be
 * to dynamically instance elements of primitive geometry to build complex objects.
 *
 * Note that generator nodes can have a negative impact on performance, where they will often prevent subnodes from
 * employing memoization strategies that fast scene graphs often depend upon. Use them carefully when high performance
 * is desired in large scenes. The impact will depend on the type of subnode that receives the generated data.
 * For example, inability to memoize will cascade downwards through  modelling transform node hierarchies since they
 * will have to re-multiply matrices by dynamic parent modelling transforms etc.
 */
SceneJS.generator = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    return SceneJS._utils.createNode(
            function(data) {
                if (cfg.fixed) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException
                            ('SceneJS.generator node must be configured with a function');
                }
                var params = cfg.getParams(data);
                while (params) {
                    var childScope = SceneJS._utils.newScope(data);
                    for (var key in params) {
                        childScope.put(key, params[key]);
                    }
                    SceneJS._utils.visitChildren(cfg, childScope);
                    params = cfg.getParams(data);
                }
            });
};


/**
 * Backend that maintains a model-space viewing frustum computed from the current viewport and projection
 * and view transform matrices.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the viewport and matrices through incoming VIEWPORT_UPDATED, PROJECTION_TRANSFORM_UPDATED and
 * VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the frustum on demand, caching it until any of the viewport or matrices is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes against the frustum,
 * eg. to query their intersection or projected size.
 *
 */
SceneJS._backends.installBackend(

        "view-frustum",

        function(ctx) {

            var viewport;
            var projMat;
            var viewMat;
            var frustum;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        projMat = viewMat = SceneJS._math.identityMat4();
                        viewport = [0,0,1,1];
                        frustum = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEWPORT_UPDATED,
                    function(v) {
                        viewport = [v.x, v.y, v.width, v.height];
                        frustum = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(params) {
                        projMat = params.matrix;
                        frustum = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                        frustum = null;
                    });

            var getFrustum = function() {
                if (!frustum) {
                    frustum = new SceneJS._math.Frustum(viewMat, projMat, viewport);
                }
                return frustum;
            };

            /** Node-facing API
             */
            return {

                testAxisBoxIntersection : function(box) {
                    return getFrustum().textAxisBoxIntersection(box);
                } ,

                getProjectedSize : function(box) {
                    return getFrustum().getProjectedSize(box);
                }
            };
        });
/**
 * Backend that maintains a model-space sphere centered about the current eye position, computed from the
 * current view transform matrix.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the matrix through incoming VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the sphere on demand, caching it until the matrix is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes for intersection
 * with the sphere.
 */
SceneJS._backends.installBackend(

        "view-locality",

        function(ctx) {

            var viewMat;
            var sphere;

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        viewMat = SceneJS._math.identityMat4();
                        sphere = null;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                        sphere = null;
                    });

            var getSphere = function() {
                if (!sphere) {
                    //frustum = new SceneJS._math.Frustum(viewMat, projMat, viewport);
                }
                return sphere;
            };

            /** Node-facing API
             */
            return {

                testAxisBoxIntersection : function(box) {
                     return true;
                  //  return getFrustum().textAxisBoxIntersection(box);
                }
            };
        });
/**
 * Bounding box node - provides view-frustum culling and level-of-detail selection
 */
(function() {

    var backend = SceneJS._backends.getBackend("view-frustum");
    var localityBackend = SceneJS._backends.getBackend("view-locality");
    var modelTransformBackend = SceneJS._backends.getBackend("model-transform");

    const STAGE_REMOTE = 0;
    const STAGE_SCENE = 1;
    const STATE_BUFFERED = 2;

    SceneJS.boundingBox = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var objectCoords;
        var box;
        var levels;
        var states = [];

        return SceneJS._utils.createNode(
                function(data) {

                    if (!cfg.fixed || !(box || objectCoords)) {
                        var params = cfg.getParams(data);

                        if (!params.xmin || !params.ymin || !params.zmin || !params.xmax || !params.ymax || !params.zmax) {
                            throw new SceneJS.exceptions.NodeConfigExpectedException
                                    ("Mandatory boundingBox parameter missing: one or more of xmin, ymin, zmin, xmax, ymax or zmax");
                        }

                        var modelTransform = modelTransformBackend.getTransform();
                        if (modelTransform.identity) {  // No model transform
                            box = {
                                min: [params.xmin, params.ymin, params.zmin],
                                max: [params.xmax, params.ymax, params.zmax]
                            };
                        } else {                        // Model transform either fixed or dynamic
                            objectCoords = [
                                [params.xmin, params.ymin, params.zmin],
                                [params.xmax, params.ymin, params.zmin],
                                [params.xmax, params.ymax, params.zmin],
                                [params.xmin, params.ymax, params.zmin],

                                [params.xmin, params.ymin, params.zmax],
                                [params.xmax, params.ymin, params.zmax],
                                [params.xmax, params.ymax, params.zmax],
                                [params.xmin, params.ymax, params.zmax]
                            ];
                        }
                        if (params.levels) {
                            if (params.levels.length != cfg.children.length) {
                                throw new SceneJS.exceptions.NodeConfigExpectedException
                                        ("boundingBox levels parameter should have a value for each child node");
                            }

                            for (var i = 1; i < params.levels.length; i++) {
                                if (params.levels[i - 1] >= params.levels[i]) {
                                    throw new SceneJS.exceptions.NodeConfigExpectedException
                                            ("boundingBox levels parameter should be an ascending list of unique values");
                                }
                                states.push(STAGE_REMOTE);
                            }
                            levels = params.levels;
                        }
                    }

                    if (objectCoords) {
                        var modelTransform = modelTransformBackend.getTransform();
                        box = new SceneJS._math.Box3().fromPoints(
                                SceneJS._math.transformPoints3(
                                        modelTransform.matrix,
                                        objectCoords)
                                );

                        if (modelTransform.fixed) {
                            objectCoords = null;
                        }
                    }

                    var local = localityBackend.testAxisBoxIntersection(box);

                    if (local) {
                        var result = backend.testAxisBoxIntersection(box);

                        switch (result) {
                            case SceneJS._math.INTERSECT_FRUSTUM:  // TODO: GL clipping hints

                            case SceneJS._math.INSIDE_FRUSTUM:

                                if (levels) { // Level-of-detail mode

                                    var size = backend.getProjectedSize(box);
                                    for (var i = levels.length - 1; i >= 0; i--) {
                                        if (levels[i] <= size) {
                                            var state = states[i];
                                            SceneJS._utils.visitChild(cfg, i, data);
                                            return;
                                        }
                                    }
                                } else {
                                    SceneJS._utils.visitChildren(cfg, data);
                                }
                                break;

                            case SceneJS._math.OUTSIDE_FRUSTUM:
                                break;
                        }
                    }
                });
    };
})();
/**
 * Backend that manages material texture layers.
 *
 * Manages asynchronous load of texture images.
 *
 * Caches textures with a least-recently-used eviction policy.
 *
 * Holds currently-applied textures as "layers". Each layer specifies a texture and a set of parameters for
 * how the texture is to be applied, ie. to modulate ambient, diffuse, specular material colors, geometry normals etc.
 *
 * Holds the layers on a stack and provides the SceneJS.texture node with methods to push and pop them.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * TEXTURES_EXPORTED to pass the entire layer stack to the shading backend.
 *
 * Avoids redundant export of the layers with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the texture node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a texture node pushes or pops the stack, this backend publishes it with a TEXTURES_UPDATED to allow other
 * dependent backends to synchronise their resources.
 */
SceneJS._backends.installBackend(

        "texture",

        function(ctx) {

            var time = (new Date()).getTime();      // Current system time for LRU caching
            var canvas;
            var textures = {};
            var layerStack = [];
            var dirty;

            ctx.events.onEvent(
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        layerStack = [];
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.TEXTURES_EXPORTED,
                                    layerStack
                                    );
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });

            /** Removes texture from shader (if canvas exists in DOM) and deregisters it from backend
             */
            function deleteTexture(texture) {
                textures[texture.textureId] = undefined;
                if (document.getElementById(texture.canvas.canvasId)) {
                    texture.destroy();
                }
            }

            /**
             * Deletes all textures from their GL contexts - does not attempt
             * to delete them when their canvases no longer exist in the DOM.
             */
            function deleteTextures() {
                for (var textureId in textures) {
                    var texture = textures[textureId];
                    deleteTexture(texture);
                }
                textures = {};
                layerStack = [];
                dirty = true;
            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET, // Framework reset - delete textures
                    function() {
                        deleteTextures();
                    });

            /**
             * Registers this backend module with the memory management module as willing
             * to attempt to destroy a texture when asked, in order to free up memory. Eviction
             * is done on a least-recently-used basis, where a texture may be evicted if the
             * time that it was last used is the earliest among all textures, and after the current
             * system time. Since system time is updated just before scene traversal, this ensures that
             * textures previously or currently active during this traversal are not suddenly evicted.
             */
            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time; // Doesn't evict textures that are current in layers
                        var evictee;
                        for (var id in textures) {
                            if (id) {
                                var texture = textures[id];
                                if (texture.lastUsed < earliest) {
                                    evictee = texture;
                                    earliest = texture.lastUsed;
                                }
                            }
                        }
                        if (evictee) { // Delete LRU texture
                            ctx.logging.info("Evicting texture: " + id);
                            deleteTexture(evictee);
                            return true;
                        }
                        return false;   // Couldnt find suitable evictee
                    });

            /**
             * Translates a SceneJS param value to a WebGL enum value,
             * or to default if undefined. Throws exception when defined
             * but not mapped to an enum.
             */
            function getGLOption(name, context, cfg, defaultVal) {
                var value = cfg[name];
                if (value == undefined) {
                    return defaultVal;
                }
                var glName = SceneJS._webgl.enumMap[value];
                if (glName == undefined) {
                    throw new SceneJS.exceptions.InvalidNodeConfigException(
                            "Unrecognised value for SceneJS.texture node property '" + name + "' value: '" + value + "'");
                }
                var glValue = context[glName];
                //                if (!glValue) {
                //                    throw new SceneJS.exceptions.WebGLUnsupportedNodeConfigException(
                //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
                //                }
                return glValue;
            }

            /** Returns default value for when given value is undefined
             */
            function getOption(value, defaultVal) {
                return (value == undefined) ? defaultVal : value;
            }

            return { // Node-facing API

                /** Verifies that texture still cached - it may have been evicted after lack of recent use,
                 * in which case client texture node will have to recreate it.
                 */
                textureExists : function(texture) {
                    return textures[texture.textureId];
                },

                /**
                 * Starts a process to load a texture image.
                 *
                 * @param uri Image location
                 * @param onSuccess Callback returns image on success - client node than must kill process with imageLoaded
                 * @param onError Callback fired on failure
                 * @param onAbort Callback fired when load aborted, eg. user hits "stop" button in browser
                 */
                loadImage : function(uri, onSuccess, onError, onAbort) {
                    var process = ctx.processes.createProcess({
                        description:"Texture image load: " + uri
                    });
                    var image = new Image();
                    image.onload = function() {
                        onSuccess(image);
                    };
                    image.onerror = function() {
                        ctx.processes.destroyProcess(process);
                        onError();
                    };
                    image.onabort = function() {
                        ctx.processes.destroyProcess(process);
                        onAbort();
                    };
                    image.src = uri;  // Starts image load
                    return process;
                },

                /**
                 * Kills texture image load process.
                 */
                imageLoaded : function(process) {
                    ctx.processes.destroyProcess(process);
                },

                /**
                 * Creates and returns a new texture, or re-uses existing one if possible
                 */
                createTexture : function(image, cfg) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var context = canvas.context;
                    var textureId = SceneJS._utils.createKeyForMap(textures, canvas.canvasId + ":texture");

                    ctx.memory.allocate(
                            "texture '" + textureId + "'",
                            function() {
                                textures[textureId] = new SceneJS._webgl.Texture2D(context, {
                                    textureId : textureId,
                                    canvas: canvas,
                                    image : image,
                                    texels :cfg.texels,
                                    minFilter : getGLOption("minFilter", context, cfg, context.LINEAR),
                                    magFilter :  getGLOption("magFilter", context, cfg, context.LINEAR),
                                    wrapS : getGLOption("wrapS", context, cfg, context.CLAMP_TO_EDGE),
                                    wrapT :   getGLOption("wrapT", context, cfg, context.CLAMP_TO_EDGE),
                                    isDepth :  getOption(cfg.isDepth, false),
                                    depthMode : getGLOption("depthMode", context, cfg, context.LUMINANCE),
                                    depthCompareMode : getGLOption("depthCompareMode", context, cfg, context.COMPARE_R_TO_TEXTURE),
                                    depthCompareFunc : getGLOption("depthCompareFunc", context, cfg, context.LEQUAL),
                                    flipY : getOption(cfg.flipY, true),
                                    width: getOption(cfg.width, 1),
                                    height: getOption(cfg.height, 1),
                                    internalFormat : getGLOption("internalFormat", context, cfg, context.LEQUAL),
                                    sourceFormat : getGLOption("sourceType", context, cfg, context.ALPHA),
                                    sourceType : getGLOption("sourceType", context, cfg, context.UNSIGNED_BYTE),
                                    logging: ctx.logging
                                });
                            });

                    return textures[textureId];
                },

                pushLayer : function(texture, params) {
                    if (!textures[texture.textureId]) {
                        throw "No such texture loaded \"" + texture.textureId + "\"";
                    }
                    texture.lastUsed = time;

                    if (params.matrix && !params.matrixAsArray) { 
                        params.matrixAsArray = new WebGLFloatArray(params.matrix);
                    }
                    layerStack.push({
                        texture: texture,
                        params: params
                    });
                    dirty = true;
                    ctx.events.fireEvent(SceneJS._eventTypes.TEXTURES_UPDATED, layerStack);
                },

                popLayers : function(nLayers) {
                    for (var i = 0; i < nLayers; i++) {
                        layerStack.pop();
                    }
                    dirty = true;
                    ctx.events.fireEvent(SceneJS._eventTypes.TEXTURES_UPDATED, layerStack);
                }
            };
        });
(function() {

    var utils = SceneJS.__texture = {   // Just one object in closure

        textureBackend : SceneJS._backends.getBackend("texture"),
        loggingBackend : SceneJS._backends.getBackend("logging"),

        getMatrix: function(translate, rotate, scale) {
            var matrix = null;
            var t;
            if (translate) {
                matrix = SceneJS._math.translationMat4v([ translate.x || 0, translate.y || 0, translate.z || 0]);
            }
            if (scale) {
                t = SceneJS._math.scalingMat4v([ scale.x || 1, scale.y || 1, scale.z || 1]);
                matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
            }
            if (rotate) {
                if (rotate.x) {
                    t = SceneJS._math.rotationMat4v(rotate.x * 0.0174532925, [1,0,0]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
                if (rotate.y) {
                    t = SceneJS._math.rotationMat4v(rotate.y * 0.0174532925, [0,1,0]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
                if (rotate.z) {
                    t = SceneJS._math.rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
                    matrix = matrix ? SceneJS._math.mulMat4(matrix, t) : t;
                }
            }
            return matrix;
        },

        STATE_INITIAL : 0,            // Ready to get texture
        STATE_IMAGE_LOADING : 2,      // Texture image load in progress
        STATE_IMAGE_LOADED : 3,       // Texture image load completed
        STATE_TEXTURE_CREATED : 4,    // Texture created
        STATE_ERROR : -1             // Image load or texture creation failed
    };

    SceneJS.texture = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);
        var params;
        var layers = [];
        var matrix;

        return SceneJS._utils.createNode(
                function(data) {

                    /* Node can be dynamically configured, but only once
                     */
                    if (!params) {
                        params = cfg.getParams(data);

                        if (!params.layers) {
                            throw new SceneJS.exceptions.NodeConfigExpectedException(
                                    "SceneJS.texture.layers is undefined");
                        }

                        params.layers = params.layers || [];

                        /* Prepare texture layers from params
                         */
                        for (var i = 0; i < params.layers.length; i++) {

                            var layerParam = params.layers[i];

                            if (!layerParam.uri) {
                                throw new SceneJS.exceptions.NodeConfigExpectedException(
                                        "SceneJS.texture.layers[" + i + "].uri is undefined");
                            }

                            if (layerParam.applyFrom) {
                                if (layerParam.applyFrom != "uv1" &&
                                    layerParam.applyFrom != "uv2" &&
                                    layerParam.applyFrom != "normal" &&
                                    layerParam.applyFrom != "geometry") {

                                    throw SceneJS.exceptions.InvalidNodeConfigException(
                                            "SceneJS.texture.layers[" + i + "].applyFrom value is unsupported - " +
                                            "should be either 'uv1', 'uv2', 'normal' or 'geometry'");
                                }
                            }

                            if (layerParam.applyTo) {
                                if (layerParam.applyTo != "baseColor" && // Colour map
                                    layerParam.applyTo != "diffuseColor") {

                                    throw SceneJS.exceptions.InvalidNodeConfigException(
                                            "SceneJS.texture.layers[" + i + "].applyTo value is unsupported - " +
                                            "should be either 'baseColor', 'diffuseColor'");
                                }
                            }

                            layers.push({
                                state : utils.STATE_INITIAL,
                                process: null,                  // Imageload process handle
                                image : null,                   // Initialised when state == IMAGE_LOADED
                                creationParams: layerParam,   // Create texture using this
                                texture: null,          // Initialised when state == TEXTURE_LOADED
                                createMatrix : new (function() {
                                    var translate = layerParam.translate;
                                    var rotate = layerParam.rotate;
                                    var scale = layerParam.scale;
                                    var dynamic = ((translate instanceof Function) ||
                                                   (rotate instanceof Function) ||
                                                   (scale instanceof Function));
                                    var defined = dynamic || translate || rotate || scale;
                                    return function(data) {
                                        if (defined && (dynamic || !matrix)) {
                                            matrix = utils.getMatrix(
                                                    (translate instanceof Function) ? translate(data) : translate,
                                                    (rotate instanceof Function) ? rotate(data) : rotate,
                                                    (scale instanceof Function) ? scale(data) : scale);
                                        }
                                        return matrix;
                                    };
                                })(),
                                applyFrom: layerParam.applyFrom || "geometry",
                                applyTo: layerParam.applyTo || "baseColor",
                                blendMode: layerParam.blendMode || "multiply"
                                //matrix: utils.getMatrix(layerParam.translate, layerParam.rotate, layerParam.scale)

                            });
                        }
                    }

                    /* Update state of each texture layer and
                     * count how many are created and ready to apply
                     */
                    var countLayersReady = 0;

                    for (var i = 0; i < layers.length; i++) {
                        var layer = layers[i];

                        /* Backend may evict texture when not recently used,
                         * in which case we'll have to load it again
                         */
                        if (layer.state == utils.STATE_TEXTURE_CREATED) {
                            if (!utils.textureBackend.textureExists(layer.texture)) {
                                layer.state = utils.STATE_INITIAL;
                            }
                        }

                        switch (layer.state) {
                            case utils.STATE_TEXTURE_CREATED:
                                countLayersReady++;
                                break;

                            case utils.STATE_INITIAL:

                                /* Start loading image for this texture layer.
                                 *
                                 * Do it in a new closure so that the right layer gets the process result.
                                 */
                                (function(_layer) {
                                    _layer.state = utils.STATE_IMAGE_LOADING;


                                    _layer.process = utils.textureBackend.loadImage(// Process killed automatically on error or abort
                                            _layer.creationParams.uri,
                                            function(_image) {

                                                /* Image loaded successfully. Note that this callback will
                                                 * be called in the idle period between render traversals (ie. scheduled by a
                                                 * setInterval), so we're not actually visiting this node at this point. We'll
                                                 * defer creation and application of the texture to the subsequent visit. We'll also defer
                                                 * killing the load process to then so that we don't suddenly alter the list of
                                                 * running scene processes during the idle period, when the list is likely to
                                                 * be queried.
                                                 */
                                                _layer.image = _image;
                                                _layer.state = utils.STATE_IMAGE_LOADED;
                                            },

                                        /* General error, probably a 404
                                         */
                                            function() {
                                                utils.loggingBackend.getLogger().error("SceneJS.texture image load failed: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = utils.STATE_ERROR;
                                            },

                                        /* Load aborted - eg. user stopped browser
                                         */
                                            function() {
                                                utils.loggingBackend.getLogger().warn("SceneJS.texture image load aborted: "
                                                        + _layer.creationParams.uri);
                                                _layer.state = utils.STATE_ERROR;
                                            });
                                })(layer);
                                break;

                            case utils.STATE_IMAGE_LOADING:

                                /* Continue loading this texture layer
                                 */
                                break;

                            case utils.STATE_IMAGE_LOADED:

                                /* Create this texture layer
                                 */
                                layer.texture = utils.textureBackend.createTexture(layer.image, layer.creationParams);
                                utils.textureBackend.imageLoaded(layer.process);
                                layer.state = utils.STATE_TEXTURE_CREATED;
                                countLayersReady++;
                                break;

                            case utils.STATE_ERROR:

                                /* Give up on this texture layer, but we'll keep updating the others
                                 * to at least allow diagnostics to log
                                 */
                                break;
                        }
                    }

                    if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {

                        /* Dont apply textures if picking
                         */
                        SceneJS._utils.visitChildren(cfg, data);

                    } else {

                        if (countLayersReady == layers.length) {
                            for (var i = 0; i < layers.length; i++) {
                                var layer = layers[i];
                                utils.textureBackend.pushLayer(layer.texture, {
                                    applyFrom : layer.applyFrom,
                                    applyTo : layer.applyTo,
                                    blendMode : layer.blendMode,
                                    matrix: layer.createMatrix(data)
                                });
                            }
                            SceneJS._utils.visitChildren(cfg, data);
                            utils.textureBackend.popLayers(layers.length);

                        }
                    }
                }
                );
    };
})();
/**
 * Backend that manages scene fog.
 *
 *
 */
SceneJS._backends.installBackend(

        "fog",

        function(ctx) {

            var fog;
            var dirty;

            function colourToArray(v, fallback) {
                return v ?
                       [
                           v.r != undefined ? v.r : fallback[0],
                           v.g != undefined ? v.g : fallback[1],
                           v.b != undefined ? v.b : fallback[2]
                       ] : fallback;
            }

            function _createFog(f) {
                if (f.mode &&
                    (f.mode != "disabled"
                            && f.mode != "exp"
                            && f.mode != "exp2"
                            && f.mode != "linear")) {
                    throw SceneJS.exceptions.InvalidNodeConfigException(
                            "SceneJS.fog node has a mode of unsupported type - should be 'none', 'exp', 'exp2' or 'linear'");
                }
                if (f.mode == "disabled") {
                    return {
                        mode: f.mode || "exp"
                    };
                } else {
                    return {
                        mode: f.mode || "exp",
                        color: colourToArray(f.color, [ 0.5,  0.5, 0.5 ]),
                        density: f.density || 1.0,
                        start: f.start || 0,
                        end: f.end || 1.0
                    };
                }
            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        _createFog({});
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        dirty = true;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_RENDERING,
                    function() {
                        if (dirty) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.FOG_EXPORTED,
                                    fog);
                            dirty = false;
                        }
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        dirty = true;
                    });


            /* Node-facing API
             */
            return {

                setFog : function(f) {
                    fog = f ? _createFog(f) : null;
                    dirty = true;
                    ctx.events.fireEvent(
                            SceneJS._eventTypes.FOG_UPDATED,
                            fog);
                },

                getFog : function() {
                    return fog;
                }
            };
        });

/**

 */
SceneJS.fog = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);
    var backend = SceneJS._backends.getBackend('fog');
    return SceneJS._utils.createNode(
            function(data) {
                if (SceneJS._utils.traversalMode == SceneJS._utils.TRAVERSAL_MODE_PICKING) {
                       SceneJS._utils.visitChildren(cfg, data);
                } else {
                    var f = backend.getFog();
                    backend.setFog(cfg.getParams(data));
                    SceneJS._utils.visitChildren(cfg, data);
                    backend.setFog(f);
                }
            });
};

