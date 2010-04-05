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
            function(traversalContext, data) {
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
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setFuncs(prevFuncs);
            });
};