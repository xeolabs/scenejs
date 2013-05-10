#!/usr/bin/env node


/*
 SceneJS WebGL Scene Graph Engine
 Copyright (c) 2012, Lindsay Kay
 All rights reserved.
 */

(function () {

    var version = "3.0";

    var wrench = require('wrench');
    var sys = require('util');
    var fs = require('fs');
    var path = require('path');

    var TYPE = "all"; // Default Type

    var FLAGS = {

        all:{
            core:true,
            box:true,
            //quad:true,
            sphere:true,
            teapot:true,
            vectorText:true
        },

        scripts:{
            core:true
        },

        docs:{
            core:false,
            box:false,
            quad:false,
            sphere:false,
            teapot:false,
            vectorText:false,
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
            sys.print('SceneJS Build Script\n');
            sys.print('Usage:\n');
            sys.print('build [type] [options]\n');
            sys.print('eg building scripts without collada support,\n build SCRIPTS --without-collada\n');
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
  //  if (isHelp) return;

    // if (FLAGS.uglify) {
    var jsp;
    var pro;

    try {
        sys.print('UGLIFY starts\n');
        jsp = require("./external/uglifyjs/lib/parse-js");
        pro = require("./external/uglifyjs/lib/process");
        sys.print('UGLIFY done\n');
    } catch (e) {
        FLAGS.uglify = false;
        sys.print(">> ERROR: UglifyJS unavailable\n");
    }
    // }

    var FILES = {

        core:[

            "licenses/license-header.js",

            "src/core/webgl-debug-utils.js",

            "src/core/map.js",
            "src/core/scenejs.js",
            "src/core/eventManager.js",
            "src/core/plugins.js",
            "src/core/events.js",
            "src/core/canvas.js",
            "src/core/engine.js",
            "src/core/errors.js",
            "src/core/config.js",
            "src/core/log.js",
            "src/core/math.js",
            "src/core/webgl.js",
            "src/core/status.js",

            "src/core/scene/nodeEvents.js",
            "src/core/scene/core.js",
            "src/core/scene/coreFactory.js",
            "src/core/scene/node.js",
            "src/core/scene/nodeFactory.js",
            "src/core/scene/camera.js",
            "src/core/scene/clips.js",
            "src/core/scene/flags.js",
            "src/core/scene/framebuf.js",
            "src/core/scene/geometry.js",
            "src/core/scene/layer.js",
            "src/core/scene/library.js",
            "src/core/scene/lights.js",
            "src/core/scene/lookAt.js",
            "src/core/scene/material.js",
            "src/core/scene/morphGeometry.js",
            "src/core/scene/name.js",
            "src/core/scene/renderer.js",
            "src/core/scene/scene.js",
            "src/core/scene/shader.js",
            "src/core/scene/shaderParams.js",
            "src/core/scene/tag.js",
            "src/core/scene/texture.js",
            "src/core/scene/xform.js",
            "src/core/scene/matrix.js",
            "src/core/scene/rotate.js",
            "src/core/scene/translate.js",
            "src/core/scene/scale.js",
            "src/core/scene/modelXFormStack.js",

            "src/core/display/display.js",
            "src/core/display/programSourceFactory.js",
            "src/core/display/programSource.js",
            "src/core/display/programFactory.js",
            "src/core/display/program.js",
            "src/core/display/objectFactory.js",
            "src/core/display/object.js",
            "src/core/display/renderContext.js",

            "src/core/display/chunks/chunk.js",
            "src/core/display/chunks/chunkFactory.js",
            "src/core/display/chunks/cameraChunk.js",
            "src/core/display/chunks/clipsChunk.js",
            "src/core/display/chunks/drawChunk.js",
            "src/core/display/chunks/flagsChunk.js",
            "src/core/display/chunks/framebufChunk.js",
            "src/core/display/chunks/geometryChunk.js",
            "src/core/display/chunks/lightsChunk.js",
            "src/core/display/chunks/listenersChunk.js",
            "src/core/display/chunks/lookAtChunk.js",
            "src/core/display/chunks/materialChunk.js",
            "src/core/display/chunks/morphGeometryChunk.js",
            "src/core/display/chunks/nameChunk.js",
            "src/core/display/chunks/programChunk.js",
            "src/core/display/chunks/rendererChunk.js",
            "src/core/display/chunks/shaderChunk.js",
            "src/core/display/chunks/shaderParamsChunk.js",
            "src/core/display/chunks/textureChunk.js",
            "src/core/display/chunks/xformChunk.js"
        ]
    };

    var DEPENDS = {
        "src/core/math.js":[],
        "src/core/scenejs.js":[]
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

    var distDir = "build/latest";
    var distPluginDir = distDir + "/plugins";
    var distExtrasDir = distDir + "/extras";

    // Create sub directory for build version

    fs.mkdir(distDir,
        function () {

            fs.mkdir(distPluginDir,
                function () {

                    // Deep-copy an existing directory
                    wrench.copyDirSyncRecursive("src/plugins", distPluginDir);


                    fs.writeFileSync(distExtrasDir + "/orbitControl.js", fs.readFileSync("src/extras/orbitControl.js"));
                    fs.writeFileSync(distExtrasDir + "/pickControl.js", fs.readFileSync("src/extras/pickControl.js"));


                    fs.writeFileSync(distExtrasDir + "/gui.js", fs.readFileSync("src/extras/gui/dat.gui.min.js") + fs.readFileSync("src/extras/gui/gui.js"));

                    if (fileList.length > 0) {
                        sys.print("Writing built library: scenejs.js\n");
                        output.push('SceneJS.configure({ pluginPath: "http://xeolabs.github.com/scenejs/build/latest/plugins" });');
//                        output.push('SceneJS.configure({ pluginPath: "/home/lindsay/xeolabs/projects/scenejs3.0/build/latest/plugins"});');
                        output = output.join("");
                        fs.writeFileSync(distDir + "/scenejs.js", output);

                        //        var match = output.match(/^\s*(\/\*[\s\S]+?\*\/)/);
                        //        var license = match[0];
                        //        license = license.replace(/^\s*\/\*/, '/*!');

                        //if (FLAGS.uglify) {
//                        sys.print("Parsing Javascript\n");
//                        var ast = jsp.parse(output);
//                        sys.print("Minifiying..\n");
//                        ast = pro.ast_mangle(ast);
//                        sys.print("Optimizing..\n");
//                        ast = pro.ast_squeeze(ast);
//                        sys.print("Generating minified code\n");
//                        //var final_code = license + "\n" + pro.gen_code(ast);
//                        var final_code = pro.gen_code(ast);
//                        sys.print("Writing minimized javascript: " + distDir + "/scenejs.min.js\n");
//                        fs.writeFileSync(distDir + "/scenejs.min.js", final_code);
//                        //}
                    }
                    var files = getFileList([], true);


                    if (FLAGS.documents) {

                        if (files.length) {

                            var spawn = require('child_process').spawn;
                            var cmdStr = ["external/jsdoc-toolkit/app/run.js", "-a", "-d=docs",
                                //"-p",
                                "-t=external/jsdoc-toolkit/templates/jsdoc"].concat(files);

                            sys.print("cmdStr + " + cmdStr);

                            var cmd = spawn('node', cmdStr);

                            sys.print("Generating Documents\n");
                            cmd.stdout.on('data', function (data) {
                                sys.print(data);
                            });

                            // check exit-code
                            cmd.on('exit', function (code) {
                                if (code == 0) sys.print("Build Complete!\n");
                                else sys.print("Build Complete! Exit with code: " + code + "\n");
                            });

                            // check for errors
                            cmd.stderr.on('data', function (error) {
                                if (/^execvp\(\)/.test(error.asciiSlice(0, error.length))) {
                                    console.log('Failed to start child process.');
                                }
                            });
                        } else {
                            sys.print("Build Complete!\n");
                        }
                    } else {
                        sys.print("Build Complete!\n");
                    }
                });
        });

})();