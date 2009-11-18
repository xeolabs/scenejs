/**
 *
 */
var PlayRoomController = function(cfg) {
    var info = null;
    var scene;
    var editor;

    /** Load HTML that embeds canvases etc.
     *
     */
    var loadHtml = function() {
        var textarea = document.getElementById(cfg.htmlAreaId);
        (new ajaxObject(cfg.htmlPath,
                function(responseText, responseStatus) {
                    scene = responseText;
                    textarea.value = responseText + responseText + responseText + responseText + responseText;
                    editor = new MirrorFrame(CodeMirror.replace(textarea), {
                        height: "100%",
                        width: "100%",
                        content: textarea.value,
                        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                        stylesheet: "css/jscolors.css",
                        path: "js/codemirror/",
                        autoMatchParens: true
                    });
                    if (cfg.onLoad) {
                        cfg.onLoad.fn.call(cfg.onLoad.scope || this);
                    }
                })).update();
    };

    var evalScene = function(sceneJs) {
        //        var output = document.getElementById(cfg.outputAreaId);
        //        output.innerHTML = '<canvas id="exampleCanvas" class="sandbox-canvas"/>';
        try {
            eval(sceneJs);
        } catch (e) {
            document.getElementById(cfg.logAreaId).innerHTML = 'Error in scene - ' + e;
            if (cfg.onError) {
                cfg.onError.fn.call(cfg.onError.scope || this);
            }
        }
    };

    /** Load scene definition
     *
     */
    var loadScene = function() {
        var textarea = document.getElementById(cfg.definitionAreaId);
        (new ajaxObject(cfg.definitionPath,
                function(responseText, responseStatus) {
                    scene = responseText;
                    textarea.value = responseText + responseText + responseText + responseText + responseText;
                    editor = new MirrorFrame(CodeMirror.replace(textarea), {
                        height: "100%",
                        width: "100%",
                        content: textarea.value,
                        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                        stylesheet: "css/jscolors.css",
                        path: "js/codemirror/",
                        autoMatchParens: true
                    });
                    evalScene(responseText);
                    loadHtml();
                })).update();
    };

    /**
     * Load metadata
     */
    var loadInfo = function() {
        (new ajaxObject(cfg.infoPath,
                function(responseText, responseStatus) {
                    eval('info = ' + responseText);
                    loadScene();
                })).update();
    };

    /**
     * Load everything
     */
    var load = function() {
        loadInfo();
    };

    load();

    this.getInfo = function() {
        return info;
    };

    this.reset = function() {
        editor.mirror.setCode(scene);
    };

    this.execute = function() {
        evalScene(editor.mirror.getCode());
    };

    this.reindent = function() {
        editor.mirror.reindent();
    };
};