new (function() {

    const TICK_INTERVAL = 50;
    const TIMEOUT = 60000; // 60 seconds

    var moduleQueue = [];
    var moduleLoading = null;
    var modules = {};
    var moduleLoadTimer = 0;

    SceneJS.requireModule = function(url) {
        moduleQueue.unshift({ url : url });
    };

    SceneJS.installModule = function(name, module) {
        try {
           // alert("installing " + moduleLoading.url);
            module.init({ baseURL : SceneJS._getBaseURL(moduleLoading.url) });
            modules[name] = module;
        } catch (e) {
            throw SceneJS._errorModule.fatalError(
                    new SceneJS.errors.ModuleInstallFailureException(
                            "Module install failed - " + moduleLoading.url + ": " + e));
        } finally {
            moduleLoading = null;
        }
    };

    SceneJS._moduleLoadTicker = function() {
        if (moduleLoading) {
            if (moduleLoadTimer > TIMEOUT) {
                var url = moduleLoading.url;
                moduleLoading = null;
                moduleQueue = [];
                throw SceneJS._errorModule.fatalError(
                        new SceneJS.errors.ModuleLoadTimeoutException(
                                "Module load timed out - SceneJS.requireModule(" + url + ") - check console for more info"));
            }
            moduleLoadTimer += TICK_INTERVAL;
            return;
        }
        if (moduleQueue.length == 0) {
            return;
        }

        /* Load next module
         */
        moduleLoading = moduleQueue.pop();
        moduleLoadTimer = 0;

        var headID = document.getElementsByTagName("head")[0];
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = moduleLoading.url;
                // alert("loading " + moduleLoading.url);
        headID.appendChild(newScript);
    };
    window.setInterval("SceneJS._moduleLoadTicker()", TICK_INTERVAL);


    SceneJS.UseModule = function() {
        SceneJS.Node.apply(this, arguments);
        this._startTime = null;
        this._timer = null;
        this._nodeType = "usemodule";
        this._moduleName = null;
        this._moduleNode = null;
        this._moduleParams = null;
        if (this._fixedParams) {
            this._init(this._getParams());
        }
    };

    SceneJS._inherit(SceneJS.UseModule, SceneJS.Node);

    // @private
    SceneJS.UseModule.prototype._init = function(params) {
        if (params.name) {
            this._moduleName = params.name;
            this._moduleParams = params.params || {};
        }
    };

    // @private
    SceneJS.UseModule.prototype._render = function(traversalContext, data) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }
        if (!this._moduleNode) {
            var module = modules[this._moduleName];
            if (module) {
                this._moduleNode = module.getNode(this._moduleParams);
            } else {
                if (!this._startTime) {
                    this._startTime = (new Date()).getTime();
                } else if (((new Date()).getTime() - this._startTime) > TIMEOUT) {
                    throw SceneJS._errorModule.fatalError(
                            new SceneJS.errors.ModuleNotFoundException(
                                    "SceneJS.UseModule failed to find module '"
                                            + this._moduleName + "' after waiting " + (TIMEOUT / 1000) + " seconds - check console for more info"));
                }
            }
        }
        if (this._moduleNode) {
            this._moduleNode._render(traversalContext, data);
        }
        //this._renderNodes(traversalContext, data);
        ;
    };

    SceneJS.useModule = function() {
        var n = new SceneJS.UseModule();
        SceneJS.UseModule.prototype.constructor.apply(n, arguments);
        return n;
    };
})();