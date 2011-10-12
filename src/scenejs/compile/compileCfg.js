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
    this.COMPILE_PATH = 2;      // Compile node plus path to root
    this.RESORT = 3;            // Resort display list and redraw

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
     *      COMPILE_SCENE for structure updates
     *
     *      DOCS: http://scenejs.wikispaces.com/Scene+Graph+Compilation
     */
    this.config = {

        /* Configs for base node type overrides configs for subtypes
         */
        "node": {

            "add" : {
                attr: {
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
                        level: this.RESORT
                    },
                    "nodes" : {
                        level: this.RESORT
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
            },

            "bind": {
                attr: {
                    "rendered": {
                        level: this.COMPILE_BRANCH
                    }
                }
            },

            "unbind": {
                attr: {
                    "rendered": {
                        level: this.COMPILE_BRANCH
                    }
                }
            }
        },

        "billboard": {
            alwaysCompile: true
        },

        "clip": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

        "colortrans": {
            set: {
                level: this.REDRAW
            },
            inc: {
                level: this.REDRAW
            },
            mul: {
                level: this.REDRAW
            }
        },

        "lights": {
        },

        "scene" : {
            "created" : {
                level: this.COMPILE_SCENE
            },
            "start" : {
                level: this.COMPILE_SCENE
            },
            set: {
                attr: {
                    "tagMask": {
                        level: this.REDRAW
                    }
                }
            }
        },

        "scale": {
            set: {
                level: this.COMPILE_BRANCH
            },
            inc: {
                level: this.COMPILE_BRANCH
            }
        },

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

        "matrix": {
            set: {
                level: this.COMPILE_BRANCH
            }
        },

        "xform": {
            set: {
                level: this.REDRAW
            }
        },

        "material": {
            set: {
                level: this.REDRAW
            }
        },

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

        "morphGeometry": {
            set: {
                level: this.REDRAW
            },
            "loaded": {
                level: this.REDRAW
            }
        },

        "texture": {
            set: {
                attr: {
                    layers: {
                        level: this.REDRAW
                    }
                }
            },
            "loaded" : {
                level: this.REDRAW
            }
        },

        "geometry": {
            set: {
                attr: {
                    positions: {
                        level: this.REDRAW
                    },
                    normals: {
                        level: this.REDRAW
                    },
                    uv: {
                        level: this.REDRAW
                    },
                    uv2: {
                        level: this.REDRAW
                    },
                    indices: {
                        level: this.REDRAW
                    }
                }
            },

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

        "shader": {
            set: {
                attr: {
                    params: {
                        level: this.REDRAW
                    }
                }
            }
        },

        "shaderParams": {
            set: {
                attr: {
                    params: {
                        level: this.REDRAW
                    }
                }
            }
        },

        "flags": {
            "set" : {
                attr: {
                    "flags": {
                        level: this.RESORT
                    }
                }
            },

            "add" : {
                attr: {

                    /* "add" op is used to overwrite flags
                     */
                    "flags": {

                        attr: {

                            level: this.RESORT
                        }
                    }
                }
            }
        },

        "layer": {
            "set" : {
                attr: {
                    "priority": {
                        level: this.RESORT
                    },
                    "enabled": {
                        level: this.RESORT
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