/**
 * Widget that browses a remote directory of scene examples.
 *
 * TODO: Generalise this for any kind of entry, not just scene examples
 *
 * Configs:
 *      breadcrumbsId   ID of breadcrumbs div
 *      indexId         ID of index div
 *      entryId         ID of entry display div - shows scene definition JS and layout HTML
 *      baseDir         Path to server-side catalog base dir
 */
var CatalogBrowser = function(cfg) {

    var catalogProxy;

    var updateBreadCrumbs = function(path) {
        var crumbsId = cfg.breadcrumbsId + "-crumbs";  // TODO: append random catalog controller ID


        /* Render path
         */
        var html = ['<div class="breadCrumbHolder module"><div id="' + crumbsId + '" class="breadCrumb module"><ul>'];
        for (var i = 0; i < path.length; i++) {
            var dir = path[i];
            html.push('<li id="breadcrumbs-dir"><div id="breadcrumbs-dir-link' + i + '">');
            html.push(dir.title);
            html.push('</div></li>');
        }
        html.push('</ul></div></div>');
        $("#" + cfg.breadcrumbsId).html(html.join(""));

        /** Attach click handlers
         */
        for (var i = 0; i < path.length; i++) {
            $("#breadcrumbs-dir-link" + i).click((function(j) {   //  delegate
                return function() {
                    catalogProxy.openPathDir(j);
                };
            })(i));
        }

        /* Generate JQuery breadcrumbs
         */
        jQuery("#" + crumbsId).jBreadCrumb();
    };

    var updateIndex = function(index) {
        var indexId = cfg.indexId + "-index"; // TODO: append random catalog controller ID

        /* Render index
         */
        var html = ['<div id="' + indexId + '">'];
        html.push('<div id="index">');
        if (index.dirs) {
            for (var i = 0; i < index.dirs.length; i++) {  // Directories
                var dir = index.dirs[i];
                html.push('<div id="index-dir">');
                html.push('<div id="index-dir-title"><div id="index-dir-link' + i + '">');
                html.push(dir.title);
                html.push('</div></div>');
                html.push('<div id="index-dir-abstract">');
                html.push(dir.abstract);
                html.push('</div>');
                html.push('</div');
            }
        }
        if (index.entries) {
            for (var i = 0; i < index.entries.length; i++) { // Entries
                var entry = index.entries[i];
                html.push('<div id="index-entry">');
                html.push('<div id="index-entry-title"><div id="index-entry-link' + i + '">');
                html.push(entry.title);
                html.push('</div></div>');
                html.push('<div id="index-entry-abstract">');
                html.push(entry.abstract);
                html.push('</div>');
                html.push('<div id="index-entry-author">');
                html.push(entry.author);
                html.push('</div>');
                html.push('<div id="index-entry-date">');
                html.push(entry.date);
                html.push('</div>');
                html.push('</div>');
            }
        }
        html.push('</div></div>');
        $("#" + cfg.indexId).html(html.join(""));

        /** Attach click handlers
         */
        if (index.dirs) {
            for (var i = 0; i < index.dirs.length; i++) {
                $("#index-dir-link" + i).click((function(j) {   //  delegate
                    return function() {
                        catalogProxy.openChildDir(j);
                    };
                })(i));
            }
        }
        if (index.entries) {
            for (var i = 0; i < index.entries.length; i++) {   //  delegate
                $("#index-entry-link" + i).click((function(j) {
                    return function() {
                        catalogProxy.openEntry(j);
                    };
                })(i));
            }
        }
    };


    catalogProxy = new CatalogProxy({

        baseDir: cfg.baseDir,

        indexLoaded  : function(path, index) {
            if (cfg.indexLoaded) {
                cfg.indexLoaded();
            }
            updateBreadCrumbs(path);
            updateIndex(index);
        },

        entryLoaded : function(path, entry) {
            updateBreadCrumbs(path);
            if (cfg.entryLoaded) {
                cfg.entryLoaded(entry);
            }
        },

        onError: function(e) {
            throw (e); // TODO
        }
    });

    catalogProxy.openRootDir();
};

var CatalogProxy = function(cfg) {
    var path = [];
    var dirPath = [];
    var stack = [];
    var index = null;

    var loadIndex = function() {
        index = null;
        var base = cfg.baseDir + ((dirPath.length > 0) ? (dirPath.join("/") + "/") : "");
        (new ajaxObject(base + "index.js",
                function(responseText, responseStatus) {
                    try {
                        eval('index = ' + responseText);
                        if (cfg.indexLoaded) {
                            cfg.indexLoaded(path, index);
                        }
                    } catch (e) {
                        if (cfg.onError) {
                            cfg.onError(e);
                        }
                    }
                })).update();
    };

    this.openRootDir = function() {
        dirPath = [];
        path = [];
        loadIndex();
    };

    /** Opens the higher dir at the ith position in the stack.
     * The index of the newly opened dir is then provided through the indexLoaded callback.
     */
    this.openPathDir = function(i) {
        if (!index) {
            throw "No index loaded";
        }
        while (stack.length > i) {
            path.pop();
            dirPath.pop();
            stack.pop();
        }
        loadIndex();
    };

    /** Opens directory i of the index of the currently open dir.
     * The index of the newly opened dir is then provided through the indexLoaded callback.
     */
    this.openChildDir = function(i) {
        if (!index) {
            throw "No index loaded";
        }
        var dir = index.dirs[i];
        if (!dir) {
            throw "No such child directory";
        }
        path.push(dir);
        dirPath.push(dir.dir);
        stack.push(index);
        loadIndex();
    };

    this.reopenCurrentDir = function() {
        loadIndex();
    };

    /** Opens entry i of the index of the currently open dir.
     * The scene definition and html layout are then provided through the entryLoaded callback.
     */
    this.openEntry = function(i) {
        if (!index) {
            throw "No index loaded";
        }
        var entry = index.entries[i];
        if (!entry) {
            throw "Entry not found";
        }
        var base = cfg.baseDir + ((dirPath.length > 0) ? (dirPath.join("/") + "/") : "") + entry.dir + "/";
        (new ajaxObject(base + "scene.js",
                function(responseText, responseStatus) {
                    var scene = responseText;
                    (new ajaxObject(base + "layout.html",
                            function(responseText2, responseStatus2) {
                                var layout = responseText2;
                                if (cfg.entryLoaded) {
                                    cfg.entryLoaded(path, {
                                        scene: scene,
                                        layout: layout
                                    });
                                }
                            })).update();
                })).update();
    };
};



