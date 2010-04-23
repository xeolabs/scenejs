(function() {
    var errorBackend = SceneJS._backends.getBackend("error");

    SceneJS.loggingToPage = function() {
        var cfg = SceneJS._utils.getNodeConfig(arguments);

        var backend = SceneJS._backends.getBackend('logging');
        var funcs;


        function findElement(elementId) {
            var element;
            if (!elementId) {
                elementId = SceneJS_webgl_DEFAULT_LOGGING_ID;
                element = document.getElementById(elementId);
                if (!element) {
                    errorBackend.fatalError(new SceneJS.exceptions.PageLoggingElementNotFoundException
                            ("SceneJS.loggingToPage config 'elementId' omitted and no default element found with ID '"
                                    + SceneJS_webgl_DEFAULT_LOGGING_ID + "'"));
                }
            } else {
                element = document.getElementById(elementId);
                if (!element) {
                    elementId = SceneJS_webgl_DEFAULT_LOGGING_ID;
                    element = document.getElementById(elementId);
                    if (!element) {
                        errorBackend.fatalError(
                                new SceneJS.exceptions.PageLoggingElementNotFoundException
                                        ("SceneJS.loggingToPage config 'elementId' does not match any elements in page and no " +
                                         "default element found with ID '" + SceneJS_webgl_DEFAULT_LOGGING_ID + "'"));
                    }
                }
            }
            return element;
        }

        return {
            _render: function(traversalContext, data) {
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
                var prevFuncs = backend.getFuncs();
                backend.setFuncs(funcs);
                SceneJS._utils.visitChildren(cfg, traversalContext, data);
                backend.setFuncs(prevFuncs);
            }
        };
    };
})();