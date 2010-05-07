/**
 * @class A scene node that allows you to intercept SceneJS logging at selected points within your
 * scene graph and write it to a specified DIV tag.
 * <p><b>Example Usage</b></p><p>Routing all logging within a given subgraph to alert popups:</b></p><pre><code>
 * var node = new SceneJS.Node(
 *
 *    // ...some nodes ...
 *
 *    new SceneJS.LoggingToPage({
 *           elementId: "myLoggingDiv"
 *       },
 *
 *       // ... sub-nodes we are in interesting
 *       //        intercepting logs from here ...
 *    )
 * );
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.LoggingToPage
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.LoggingToPage = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "logging-to-page";
    this._elementId = null;
    this._element = null;
    this._funcs = null; // Lazily initialised
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

/** ID ("_scenejs-default-logging") of element to which SceneJS will log to if found.
 * When no SceneJS.LoggingToPage is specified, or a SceneJS.LoggingToPage is
 * specified with no element ID.
 */
SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID = "_scenejs-default-logging";

SceneJS._inherit(SceneJS.LoggingToPage, SceneJS.Node);

/**
 * Sets target DIV ID. If no value is given then ID will default to the value of
 * SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID.
 *
 * @param {string} elementId - ID of target DIV
 * @returns {SceneJS.LoggingToPage} This logging node
 * @throws {SceneJS.DocumentElementNotFoundException} Element not found in document
 */
SceneJS.LoggingToPage.prototype.setElementId = function(elementId) {
    if (elementId) {
        var element = document.getElementById(elementId);
        if (!element) {
            SceneJS_errorModule.fatalError(new SceneJS.DocumentElementNotFoundException
                    ("SceneJS.LoggingToPage cannot find document element with ID '" + elementId + "'"));
        }
        this._elementId = elementId;
        this._element = element;
    } else {
        this._elementId = SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID;
        this._element = document.getElementById(SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID);
    }
    return this;
};

/** Returns the target DIV ID. If none has been given then the value will be that of
 * SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID.
 *
 * @returns {string} The DIV ID
 */
SceneJS.LoggingToPage.prototype.getElementId = function() {
    return this._elementId;
};

// @private
SceneJS.LoggingToPage.prototype._init = function(params) {
    this.setElementId(params.elementId);
};

// @private
SceneJS.LoggingToPage.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (!this._funcs && this._element) {
        var element = this._element;
        this._funcs = {
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
    if (this._element) {
        var prevFuncs = SceneJS_loggingModule.getFuncs();
        SceneJS_loggingModule.setFuncs(this._funcs);
        this._renderNodes(traversalContext, data);
        SceneJS_loggingModule.setFuncs(prevFuncs);
    } else {
        this._renderNodes(traversalContext, data);
    }
};

/** Returns a new SceneJS.LoggingToPage instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoggingToPage constructor
 * @returns {SceneJS.LoggingToPage}
 */
SceneJS.loggingToPage = function() {
    var n = new SceneJS.LoggingToPage();
    SceneJS.LoggingToPage.prototype.constructor.apply(n, arguments);
    return n;
};