SceneJS.loggingToPage = function() {
    var cfg = SceneJS._utils.getNodeConfig(arguments);

    if (!cfg.fixed) {
        throw new SceneJS.exceptions.UnsupportedOperationException
                ("Dynamic configuration of loggingToPage nodes is not supported");
    }

    var backend = SceneJS._backends.getBackend('logging');
    var logging;

    function findElement(elementId) {
        var element = document.getElementById(elementId);
        if (!element) {
            throw "Failed to find loggingToPage element: " + elementId;
        }
        return element;
    }

    return SceneJS._utils.createNode(
            function(scope) {
                if (!logging) {
                    var params = cfg.getParams();
                    if (!params.elementId) {
                        throw new SceneJS.exceptions.NodeConfigExpectedException
                                ("loggingToPage node parameter expected : elementId");
                    }

                    var element = findElement(params.elementId);

                    function log(msg) {
                        element.innerHTML = "<p>" + msg + "</p>";
                    }

                    logging = {
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
                var prevLogger = backend.getLogger();
                backend.setLogger(logging);
                SceneJS._utils.visitChildren(cfg, scope);
                backend.setLogger(prevLogger);
            });
};