/**
 * Post-effects pipeline
 *
 * @author xeolabs / http://xeolabs.com
 *
 * IN DEVELOPMENT
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "postprocess/pipeline",
 *      effects: [
 *          {
 *              effectId: "dof",
 *              type: "postprocess/dof",
 *              params: {
 *                  ppm: 10000.0,
 *                  blurCoeff: 0.001
 *              },
 *              enabled: true
 *          },
 *          {
 *              effectId: "technicolor",
 *              type: "postprocess/technicolor",
 *              enabled: false
 *          }
 *      ]
 *  },
 *      function(pipeline) {
 *
 *          pipeline.setEnabled({
 *                  dof: false,
 *                  technicolor: true
 *              });
 *  });
 */
SceneJS.Types.addType("postprocess/pipeline", {

    construct: function (params) {

        var self = this;

        /**
         * Effects in the order in which they will be applied
         *
         * @type {[{}]}
         */
        this.pipeline = [];

        /**
         * Effects mapped to their IDs
         *
         * @type {{}}
         */
        this.effects = {};

        // True when effects pipeline in the
        // scene graph needs to be rebuilt
        this._dirty = false;

        // Add effects
        if (params.effects) {
            for (var i = 0, len = params.effects.length; i < len; i++) {
                this.addEffect(params.effects[i]);
            }
        }

        if (params.enabled) {
            this.setEnabled(params.enabled);
        }

        if (params.params) {
            this.setParams(params.params);
        }

        this._subtree = this.addNode({
            id: this.id + ".subtree",
            nodes: params.nodes
        });

        this._needRebuild();
    },

    _needRebuild: function () {
        if (!this._tick) {
            var self = this;
            this._tick = this.getScene().once("tick",
                function () {
                    self._rebuildScene();
                    self._tick = null;
                });
        }
    },

    _rebuildScene: function () {

        // Disconnect scene content
        this._subtree.disconnect();

        // Blow away effect nodes
        this.removeNodes();

        // Rebuild effect nodes
        var effect;
        var json = {
            nodes: []
        };
        var node = json;
        var scene = this.getScene();


        for (var i = 0, len = this.pipeline.length; i < len; i++) {
            effect = this.pipeline[i];
            if (effect.enabled) {
                var effectId = this.id + "." + effect.effectId;

                var child = SceneJS._applyIf(effect.params, {
                    type: effect.type,
                    id: effectId,
                    nodes: []
                });
                node.nodes.push(child);
                node = child;

                // Save scene node on effect for param updates
                scene.getNode(effectId,
                    (function () {
                        var _effect = effect;
                        return function (node) {
                            _effect.node = node;
                        }
                    })());

            } else {

                // No scene nodes exist for disabled effects
                effect.node = null;
            }
        }

        // Append scene content to lowest effect node, thus applying
        // all the effects to it, in order of each effect on the path
        // up to the scene root
        node.nodes.push({ id: this.id + ".effectsSubTree" });

        var self = this;

        this.addNode(json,
            function () {
                scene.getNode(this.id + ".effectsSubTree",
                    function (leaf) {
                        if (self._subtree.parent == null) {
                            leaf.addNode(self._subtree);
                        }
                    });
                self._dirty = false;
            });
    },

    /**
     * Adds a effect
     * @param params
     */
    addEffect: function (params) {
        var effect = params;
        this.effects[params.effectId] = effect;
        this.pipeline.unshift(effect);
        this._needRebuild();
    },

    /**
     * Enables or disables effects
     * @param params
     */
    setEnabled: function (params) {
        // Option to replace the set of enabled effects
        if (params.replace) {
            for (var i = 0, len = this.pipeline.length; i < len; i++) {
                this.pipeline[i].enabled = false;
            }
        }
        var effect;
        if (params.effectId) {
            var effectId = params.effectId;
            effect = this.effects[effectId];
            if (!effect) {
                //Human.log.error("Human.view.effects.setEnabled", "Effect not found: " + effectId);
                return;
            }
            effect.enabled = !!params.enable;
        } else if (params.effectIds) {
            var effectIds = params.effectIds;
            var val;
            for (var effectId in effectIds) {
                if (effectIds.hasOwnProperty(effectId)) {
                    effect = this.effects[effectId];
                    if (!effect) {
                        //      Human.log.error("Human.view.effects.setEnabled", "Effect not found: " + effectId);
                        continue;
                    }
                    val = effectIds[effectId];
                    effect.enabled = !!val;
                    if (val && typeof val !== "boolean") {
                        // Effect params given
                        //   effect.setParams(val);
                    }
                }
            }
        }
        this._needRebuild();
    },

    /**
     * Sets parameters for effects
     * @param params
     */
    setParams: function (params) {
        var effect;
        for (var effectId in params) {
            if (params.hasOwnProperty(effectId)) {
                effect = this.effects[effectId];
                if (!effect) {
                    this.log("error", "Effect not found: " + effectId);
                    continue;
                }
                SceneJS._apply(params, effect.params);
                if (effect.node) {
                    effect.node.set(params[effectId]);
                }
            }
        }
    },

    _destruct: function () {
        this._subtree.destroy();
    }
});

