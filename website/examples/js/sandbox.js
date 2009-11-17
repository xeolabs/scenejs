/**
 *
 */
var PlayRoomController = function(cfg) {
    var info = null;
    var scene;
    var editor;

    var evalScene = function(sceneJs) {
        var output = document.getElementById(cfg.outputAreaId);
        output.innerHTML = '<canvas id="exampleCanvas" class="sandbox-canvas"/>';
        try {
            eval(sceneJs);
        } catch (e) {
            output.innerHTML = '<div class="sandbox-error">Error in scene - ' + e + '</div>';
        }
    };

    var loadScene = function() {
        var textarea = document.getElementById(cfg.definitionAreaId);
        (new ajaxObject(cfg.definitionPath,
                function(responseText, responseStatus) {
                    scene = responseText;
                    textarea.value = responseText;
                    editor = new MirrorFrame(CodeMirror.replace(textarea), {
                        height: "1000px",
                        width: "590px",
                        content: textarea.value,
                        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                        stylesheet: "css/jscolors.css",
                        path: "js/codemirror/",
                        autoMatchParens: true
                    });
                    evalScene(responseText);
                    if (cfg.onLoad) {
                        cfg.onLoad.fn.call(cfg.onLoad.scope || this);
                    }
                })).update();
    };

    var loadDefinition = function() {
        (new ajaxObject(cfg.descriptionPath,
                function(responseText, responseStatus) {
                    document.getElementById(cfg.descriptionAreaId).innerHTML = responseText;
                    loadScene();
                })).update();
    };

    var loadInfo = function() {
        (new ajaxObject(cfg.infoPath,
                function(responseText, responseStatus) {
                    eval('info = ' + responseText);
                    loadDefinition();
                })).update();
    };

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