#!/usr/bin/env node


/*
 ExampleJS Build Script
 Copyright (c) 2013, XeoLabs
 All rights reserved.
 */

(function () {

    var sys = require('util');
    var fs = require('fs');

    var TYPE = "all"; // Default Type

    var FLAGS = {
        all:{
            core:true
        },
        scripts:{
            core:true
        },
        docs:{
            core:false,
            documents:true
        },
        dev:{
            devtemplate:true
        }
    };

    var isHelp = false;

    //parse command line argments
    process.argv.forEach(function (val, index, array) {

        if (val == "--help") {
            sys.print('SceneJS ExampleJS Build Script\n');
            sys.print('Usage:\n');
            sys.print('build [type] [options]\n');
            sys.print('eg building scripts without XXX support,\n build SCRIPTS --without-XXX\n');
            sys.print('\n');
            sys.print('Types:\n');
            sys.print('all - (DEFAULT) build all options\n');
            sys.print('scripts - build the compiled script and uglify\n');
            sys.print('docs - build documents\n');
            sys.print('dev - build development template\n');
            sys.print('\n');
            sys.print('Options:\n');
            sys.print('--without-uglify  : builds without using the uglify JS compiler\n');
            sys.print('--without-documents  : (DEFAULT) builds without creating docs using the node-jsdoc-toolkit\n');
            sys.print('\n');
            sys.print('--with-uglify  : (DEFAULT) builds using the uglify JS compiler\n');
            sys.print('--with-documents  : builds the docs using the node-jsdoc-toolkit\n');
            isHelp = true;
            return;
        }

        if (FLAGS[val]) {
            FLAGS = FLAGS[val];
            TYPE = val;
        }

        if (val.substr(0, 10) == "--without-") {
            if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE];
            FLAGS[val.substr(10)] = false;
        }

        if (val.substr(0, 7) == "--with-") {
            if (FLAGS[TYPE]) FLAGS = FLAGS[TYPE];
            FLAGS[val.substr(7)] = true;
        }

    });

    //if type not set then use default
    if (FLAGS[TYPE]) {
        FLAGS = FLAGS[TYPE];
    }

    //if this is just a help request then simply return here
    if (isHelp) return;

    if (FLAGS.uglify) {
        try {
            sys.print('UGLIFY starts\n');
            var jsp = require("./external/uglifyjs/lib/parse-js");
            var pro = require("./external/uglifyjs/lib/process");
            sys.print('UGLIFY done\n');
        } catch (e) {
            FLAGS.uglify = false;
            sys.print(">> ERROR: UglifyJS unavailable\n");
        }
    }

    var FILES = {
        core:[
            "licenses/license-header.js",
            "js/api/map.js",
            "js/api/examplejsAPI.js",
            "js/api/component.js",
            "js/api/example.js"
        ]
    };

    var DEPENDS = {
    };

    sys.print("Generating file list\n");

    var getFileList = function (list, all) {

        var addDepends = function (file, list) {
            if (DEPENDS[file]) {
                for (var i = 0; i < DEPENDS[file].length; i++) {
                    addDepends(DEPENDS[file][i], list);
                    if (list.indexOf(DEPENDS[file][i]) < 0) {
                        list.push(DEPENDS[file][i]);
                    }
                }
            }
        };

        if (!list) {
            list = [];
        }

        for (var flag in FLAGS) {
            if ((FLAGS[flag] || all) && FILES[flag]) {
                for (var i = 0; i < FILES[flag].length; i++) {
                    addDepends(FILES[flag][i], list);
                    if (list.indexOf(FILES[flag][i]) < 0) {
                        list.push(FILES[flag][i]);
                    }
                }
            }
        }

        return list;
    };

    var fileList = getFileList();

    var output = [];
    for (var i = 0; i < fileList.length; i++) {
        sys.print("Importing: " + fileList[i] + "\n");
        output.push(fs.readFileSync(fileList[i]));
    }

    var distDir = "api";
    var versionDir = "api/v0";
    var latestDir = "api/latest";

    // Create sub directory for build version

    fs.mkdir(distDir,
        function () {
            fs.mkdir(versionDir,
                function () {
                    fs.mkdir(latestDir,
                        function () {
                            var files = getFileList([], true);
                            if (files.length > 0) {
                                sys.print("Writing built API library: examplejs.js\n");
                                var outputStr = output.join("");
                                fs.writeFileSync(versionDir + "/example.js", outputStr);
                                fs.writeFileSync(latestDir + "/example.js", outputStr);
                            }
                        });
                });
        });
})();