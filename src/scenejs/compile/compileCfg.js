var SceneJS_compileCfg = new (function() {

      /*-----------------------------------------------------------------------------------------------------------------
     * CONFIGURATION
     *
     *----------------------------------------------------------------------------------------------------------------*/

    /* Compilation levels - these are also the priorities in which the
     * compilations are queued (when queuing is applicable).
     */
    this.COMPILE_NOTHING = -2;  // Do nothing
    this.REDRAW = -1;           // Compile nothing and redraw the display list
    this.COMPILE_SCENE = 0;     // Compile entire scene graph
    this.COMPILE_BRANCH = 1;    // Compile node, plus path to root, plus subnodes
    this.COMPILE_SUBTREE = 2;   // Compile node plus subnodes
    this.COMPILE_PATH = 3;      // Compile node plus path to root
    this.COMPILE_NODE = 4;      // Compile just node

    /* Level names for logging
     */
    this.levelNameStrings = ["COMPILE_SCENE","COMPILE_BRANCH","COMPILE_SUBTREE", "COMPILE_PATH","COMPILE_NODE"];

    /**
     * Configures recompilation behaviour on a per-node basis
     *
     *      Default is always COMPILE_SCENE
     *
     *      Configs for base node type overrides configs for subtypes
     *
     *      COMPILE_NODE and COMPILE_SUBGRAPH are bumped to COMPILE_BRANCH if node within an instanced subgraph
     *
     *      COMPILE_SCENE for structure updates so we can rediscover which nodes are within instanced subtrees.
     *      Compilation is therefore optimised for update as cost of restructure.
     *
     *      DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
     */
    this.config = {

        /* Configs for base node type overrides configs for subtypes
         */
        "node": {
            "set" : {
                attr: {

                    //                    "enabled": {
                    //                        level: this.COMPILE_BRANCH
                    //                    },

                    "flags": {
                        attr: {
                            transparent: {
                                level: this.COMPILE_BRANCH
                            },
                            enabled: {
                                level: this.COMPILE_BRANCH
                            },
                            picking: {
                                level: this.COMPILE_BRANCH
                            },
                            colortrans: {
                                level: this.COMPILE_BRANCH
                            }
                        },
                        level: this.COMPILE_SCENE
                    }
                }
            },

            "add" : {
                attr: {

                    /* "add" op is used to overwrite flags
                     */
                    "flags": {

                        attr: {

                            transparent: {
                                level: this.COMPILE_BRANCH
                            },
                            enabled: {
                                level: this.COMPILE_BRANCH
                            },
                            picking: {
                                level: this.COMPILE_BRANCH
                            },
                            colortrans: {
                                level: this.COMPILE_BRANCH
                            }
                        },

                        level: this.COMPILE_SCENE
                    },

                    "node": {
                        level: this.COMPILE_SCENE
                    },

                    "nodes": {
                        level: this.COMPILE_SCENE
                    }
                },

                level: this.COMPILE_SCENE
            },

            "remove" : {
                attr: {
                    "node" : {
                        level: this.COMPILE_SCENE
                    }
                },
                level: this.COMPILE_SCENE
            },

            "insert" : {
                attr: {
                    "node" : {
                        level: this.COMPILE_SCENE
                    }
                },
                level: this.COMPILE_SCENE
            }
        },

        /*-----------------------------------------------------------------------------------
         * billboard
         *---------------------------------------------------------------------------------*/

        "billboard": {
            alwaysCompile: true
        },

        /*-----------------------------------------------------------------------------------
         * clip
         *---------------------------------------------------------------------------------*/

        "clip": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        /*-----------------------------------------------------------------------------------
         * colortrans
         *---------------------------------------------------------------------------------*/

        "colortrans": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            },
            mul: {
                level: this.COMPILE_BRANCH
            }
        },       

        /*-----------------------------------------------------------------------------------
         * lights
         *---------------------------------------------------------------------------------*/

        "lights": {
            //alwaysCompile: true
        },

        "scene" : {
            "created" : {
                level: this.COMPILE_SCENE
            },
            "start" : {
                level: this.COMPILE_SCENE
            }
        },


        /* Transform nodes require many things below them to recompile,
         * such as transforms and boundingBoxes
         */

        "scale": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        /*-----------------------------------------------------------------------------------
         * stationary
         *---------------------------------------------------------------------------------*/

        "stationary": {
            alwaysCompile: true
        },


        "rotate": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        "translate": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        "quaternion": {
            set: {
                level: this.COMPILE_BRANCH
            },
            add: {
                level: this.COMPILE_BRANCH
            }
        },

        /* View and camera transforms
         */
        "lookAt": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            }
        },

        "camera": {
            set: {
                level: this.COMPILE_PATH
            },
            inc: {
                level: this.COMPILE_PATH
            }
        },

        /*
         */
        "morphGeometry": {
            set: {
                level: this.COMPILE_BRANCH
            },
            "loaded": {
                level: this.COMPILE_SCENE
            }
        },

        /* Keep recompiling instance node while it searches for its target
         */
        "instance": {
            "searching": {
                level: this.COMPILE_BRANCH
            }
        },

        /* Recompile texture node once it has loaded
         */
        "texture": {

            "loadedImage": {
                level: this.COMPILE_BRANCH
            },

            "waitingForImagebuf": {
                level: this.COMPILE_SCENE   // TODO: got to be a tighter rule - maybe compile imagebuf's subtree then texture's branch?
            },

            set: {
                attr: {
                    layers: {
                        level: this.COMPILE_BRANCH
                    }
                }
            }
        },

        /* Recompile stream-loaded geometry node once it has loaded
         */
        "geometry": {

            "loaded": {
                level: this.COMPILE_SCENE
            }
        },

        /* Recompile texture node once it has loaded
         */
        "text": {

            "loadedImage": {
                level: this.COMPILE_BRANCH
            }
        },

        /* Interpolator needs to recompile the node as it waits for it's sequence to begin, then
         * for as long as it is interpolating in order to update. The target node will notify for
         * it's own recompilations as it is updated.
         */
        "interpolator": {
            "before": {
                level: this.COMPILE_PATH
            },
            "running": {
                level: this.COMPILE_PATH
            }
        },

        /* Custom shader
         */
        "shader": {
            set: {
                attr: {
                    vars: {
                        level: this.COMPILE_PATH
                    }
                }
            }
        }
    };

    /**
     * Gets the level of compilation required after an update of the given type
     * to an attribute of the given node type.
     *
     * @param {String} nodeType Type of node - eg. "rotate", "lookAt" etc.
     * @param {String} op Type of update (optional) - eg. "set", "get", "inc"
     * @param {String} name Name of updated attribute (optional) - eg. "angle", "eye", "baseColor"
     * @param {{String:Object}} value Value for the attribute (optional) - when a map, the lowest compilation level among the keys will be returned
     * @return {Number} Number from [0..5] indicating level of compilation required
     */
    this.getCompileLevel = function(nodeType, op, name, value) {
        var config = this.config[nodeType];
        if (config) {

            /*-------------------------------------------------------------
             * Got config for node
             *-----------------------------------------------------------*/

            if (op) {
                var opConfig = config[op];
                if (opConfig) {

                    /*-------------------------------------------------------------
                     * Got config for [node, op]
                     *-----------------------------------------------------------*/

                    if (opConfig.attr) {
                        if (name) {
                            var attrConfig = opConfig.attr[name];
                            if (attrConfig) {

                                /*-------------------------------------------------------------
                                 * Got config for [node, op, attribute]
                                 *-----------------------------------------------------------*/

                                if (value) {
                                    if (typeof (value) == "object") {
                                        var subAttrConfig = attrConfig.attr;
                                        if (subAttrConfig) {

                                            /*-------------------------------------------------------------
                                             * Got config for [node, op, attribute, sub-attributes]
                                             *
                                             * Try to find the most general (lowest) compilation level
                                             * among the levels for sub-attributes.
                                             *-----------------------------------------------------------*/


                                            var lowestLevel;
                                            var valueConfig;
                                            for (var subAttrName in value) {
                                                if (value.hasOwnProperty(subAttrName)) {
                                                    valueConfig = subAttrConfig[subAttrName];
                                                    if (valueConfig) {
                                                        if (valueConfig.level != undefined) {
                                                            if (lowestLevel == undefined || (valueConfig.level < lowestLevel)) {
                                                                lowestLevel = valueConfig.level;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if (lowestLevel) {
                                                return lowestLevel;
                                            }
                                        }
                                    }
                                }

                                /*-------------------------------------------------------------
                                 * Try fall back to [node, op, attribute]
                                 *-----------------------------------------------------------*/

                                if (attrConfig.level != undefined) {  // Level found for attribute
                                    return attrConfig.level;
                                }
                            }
                        }
                    }

                    /*-------------------------------------------------------------
                     * Try fall back to [node, op]
                     *-----------------------------------------------------------*/

                    if (opConfig.level != undefined) {
                        return opConfig.level;
                    }
                }
            }

            /*-------------------------------------------------------------
             * Try fall back to [node]
             *-----------------------------------------------------------*/

            if (config.level != undefined) {
                return config.level;
            }
        }

        /*-------------------------------------------------------------
         * No config found for node
         *-----------------------------------------------------------*/

        return undefined;
    };

})();