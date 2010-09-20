/**
 * Backend that manages scene highlighting.
 *
 * @private
 */
SceneJS._highlightModule = new (function() {

    var highlightStack = [];
    var dirty;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function() {
                highlightStack = [
                    {
                        highlighted: false
                    }
                ];
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS._eventModule.fireEvent(
                            SceneJS._eventModule.HIGHLIGHT_EXPORTED,
                            highlightStack[highlightStack.length - 1]);
                    dirty = false;
                }
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.pushHighlight = function(highlight) {
        highlightStack.push(highlight);
        dirty = true;
    };

    this.popHighlight = function() {
        highlightStack.pop();
        dirty = true;
    };
})();

