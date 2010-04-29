/**
 * Scene node that routes messages logged by nodes in its subgraph to be written to a DIV element in the HTML document.
 * If you omit this node in your scene, SceneJS by default will look for a DIV with ID "_scenejs-default-logging" and
 * if that is found, will write logging there.
 *
 * @class SceneJS.loggingToPage
 * @extends SceneJS.logging
 */

SceneJS.loggingToPage = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    function findElement(elementId) {
        var element;
        if (!elementId) {
            elementId = SceneJS_webgl_DEFAULT_LOGGING_ID;
            element = document.getElementById(elementId);
            if (!element) {
                SceneJS_errorModule.fatalError(new SceneJS.exceptions.PageLoggingElementNotFoundException
                        ("SceneJS.loggingToPage config 'elementId' omitted and no default element found with ID '"
                                + SceneJS_webgl_DEFAULT_LOGGING_ID + "'"));
            }
        } else {
            element = document.getElementById(elementId);
            if (!element) {
                elementId = SceneJS_webgl_DEFAULT_LOGGING_ID;
                element = document.getElementById(elementId);
                if (!element) {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.exceptions.PageLoggingElementNotFoundException
                                    ("SceneJS.loggingToPage config 'elementId' does not match any elements in page and no " +
                                     "default element found with ID '" + SceneJS_webgl_DEFAULT_LOGGING_ID + "'"));
                }
            }
        }
        return element;
    }

    /* Augment the basic node type
     */
    return (function($) {

        var funcs;

        $._render = function(traversalContext, data) {
            if (!funcs) {
                var params = cfg.getParams();
                var element = findElement(params.elementId);
                funcs = {
                    warn : function (msg) {
                        element.innerHTML += "<p style=\"color:orange;\">" + msg + "</p>";
                    },
                    error : function (msg) {
                        element.innerHTML += "<p style=\"color:darkred;\">" + msg + "</p>";
                    },
                    debug : function (msg) {
                        element.innerHTML += "<p style=\"color:darkblue;\">" + msg + "</p>";
                    },
                    info : function (msg) {
                        element.innerHTML += "<p style=\"color:darkgreen;\">" + msg + "</p>";
                    }
                };
            }
            var prevFuncs = SceneJS_loggingModule.getFuncs();
            SceneJS_loggingModule.setFuncs(funcs);
            $._renderNodes(traversalContext, data);
            SceneJS_loggingModule.setFuncs(prevFuncs);
        };
        return $;
    })(SceneJS.node.apply(this, arguments));
};                