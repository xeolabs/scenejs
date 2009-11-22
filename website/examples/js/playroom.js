/**
 *
 */
var PlayRoomController = function(cfg) {
    var scene;
    var html;
    var sceneEditor;
    var htmlEditor;

    var loadHtml = function() {
        if (!cfg.htmlAreaId) {
            throw "PlayRoom htmlAreaId not specified";
        }
        var textarea = document.getElementById(cfg.htmlAreaId);
        if (!textarea) {
            throw "PlayRoom htmlAreaId not resolved";
        }
        try {
            $.ajax({
                url:cfg.htmlPath,
                success: function(data) {
                    textarea.value = data;
                    html = data;
                    htmlEditor = new MirrorFrame(CodeMirror.replace(textarea), {
                        height: "100%",
                        width: "100%",
                        content: textarea.value,
                        parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
                        stylesheet: ["./examples/css/xmlcolors.css", "./playroom/css/jscolors.css", "./playroom/css/csscolors.css"],
                        path: "./examples/js/codemirror/"
                    });
                    if (cfg.onReady) {
                        cfg.onReady();
                    }
                }
            });
        } catch (e) {
            if (cfg.onLoadException) {
                cfg.onLoadException(e);
            }
        }
    };

    var evalScene = function(sceneDef) {
        try {
            eval(sceneDef);
        } catch (e) {
            if (cfg.onSceneDefError) {
                cfg.onSceneDefError(e);
            }
        }
    };

    var loadScene = function() {
        if (!cfg.definitionAreaId) {
            throw "PlayRoom definitionAreaId not specified";
        }
        var textarea = document.getElementById(cfg.definitionAreaId);
        if (!textarea) {
            throw "PlayRoom definitionAreaId not resolved";
        }
        try {
            $.ajax({
                url: cfg.definitionPath,
                success: function(data) {
                    textarea.value = data;
                    sceneEditor = new MirrorFrame(CodeMirror.replace(textarea), {
                        height: "100%",
                        width: "100%",
                        content: textarea.value,
                        parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
                        stylesheet: "./examples/css/jscolors.css",
                        path: "./examples/js/codemirror/",
                        autoMatchParens: true
                    });
                    scene = data;
                    evalScene(scene);
                    loadHtml();
                }
            });
        } catch (e) {
            if (cfg.onLoadException) {
                cfg.onLoadException(e);
            }
        }

        //
        //        (new ajaxObject(cfg.definitionPath,
        //                function(responseText, responseStatus) {
        //                    if (responseStatus == 201) {
        //                        scene = responseText;
        //                        textarea.value = responseText + responseText + responseText + responseText + responseText;
        //                        sceneEditor = new MirrorFrame(CodeMirror.replace(textarea), {
        //                            height: "100%",
        //                            width: "100%",
        //                            content: textarea.value,
        //                            parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
        //                            stylesheet: "./examples/css/jscolors.css",
        //                            path: "./examples/js/codemirror/",
        //                            autoMatchParens: true
        //                        });
        //                        evalScene(responseText);
        //                        loadHtml();
        //                    } else {
        //                        if (cfg.onLoadError) {
        //                            cfg.onLoadError(responseStatus);
        //                        } else {
        //                            throw "Failed to load example's scene description - status: " + responseStatus;
        //                        }
        //                    }
        //                })).update();
    };

    var load = function() {
        loadScene();
    };

    load();

    this.resetScene = function() {
        sceneEditor.mirror.setCode(scene);
    };

    this.resetHtml = function() {
        htmlEditor.mirror.setCode(html);
    };

    this.executeScene = function() {
        evalScene(sceneEditor.mirror.getCode());
    };

    this.reindentScene = function() {
        sceneEditor.mirror.reindent();
    };

    this.reindentHtml = function() {
        sceneEditor.mirror.reindent();
    };
};