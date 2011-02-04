/**
 * Backend that tracks the current node render priority as a scene is traversed. Each node that has a "priority"
 * attribute pushes and pops its priority value before and after the node is rendered. Then, when a geometry is
 * being ordered within GL state sorting, the priority for that geometry can be be obtained from here in order
 * to set its explicit render order.
 *
 * On an architectural note, see how we isolate this kind of state tracking into a singleton module instead of monkey
 * patching it onto node objects - a more obvious design with less surprises.
 *
 * @private
 */
SceneJS._layerModule = new (function() {

    this.DEFAULT_LAYER_NAME = "___default";

    var enabledLayers;
    var layerOrder;

    var layerStack = new Array(500);
    var stackLen = 0;

    var self = this;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_COMPILING,
            function() {
                self.setActiveLayers(null);
                stackLen = 0;
            });

    this.setActiveLayers = function(layers) {
        enabledLayers = {};

        /* Default layer - implicitly enabled
         */
        layerOrder = [
            {
                name: this.DEFAULT_LAYER_NAME,
                priority: 0
            }
        ];
        if (layers) {
            if (SceneJS._isArray(layers)) {

                /* Array of layer names - no sorting
                 */
                for (var i = 0, len = layers.length; i < len; i++) {
                    appendLayer(layers[i], 0);
                }
            } else {

                /* Map of layer names - do sorting
                 */
                var priority;
                for (var layerName in layers) {
                    if (layers.hasOwnProperty(layerName)) {
                        priority = layers[layerName];
                        insertLayer(layerName, priority);
                    }
                }
            }
        }
    };

    /* Append layer for when sorting not done
     */
    function appendLayer(layerName, priority) {
        enabledLayers[layerName] = true;
        var newLayer = {
            name: layerName,
            priority: priority
        };
        layerOrder.push(newLayer);
    }

    /* Insert layer for when sorting is done
     */
    function insertLayer(layerName, priority) {
        enabledLayers[layerName] = true;
        var newLayer = {
            name: layerName,
            priority: priority
        };
        var layer;
        for (var i = layerOrder.length - 1; i >= 0; i--) {
            layer = layerOrder[i];
            if (layer.priority > priority) {
                layerOrder.splice(i, 0, newLayer);
                return;
            }
        }
        /* Insert at front
         */
        layerOrder.push(newLayer);
    }

    this.getLayerOrder = function() {
        return layerOrder;
    };

    this.getEnabledLayers = function() {
        return enabledLayers;
    };

    this.layerEnabled = function(layer) {
        return (layerOrder.length == 0)  // All layers are enabled by default
                || (enabledLayers[layer] === true);
    };

    this.pushLayer = function(layer) {
        layerStack[stackLen++] = layer;
    };

    this.getLayer = function() {
        return stackLen == 0 ? undefined : layerStack[stackLen - 1];
    };

    this.popLayer = function() {
        stackLen--;
    };

})();

