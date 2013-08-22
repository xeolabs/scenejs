#!/usr/bin/env node

/*
 SceneJS WebGL Scene Graph Engine
 Copyright (c) 2013, Lindsay Kay
 lindsay.kay@xeolabs.com
 All rights reserved.
 */

(function () {

    var version = "3.1";

    var ncp = require('ncp').ncp;
    var sys = require('util');
    var fs = require('fs');
    var path = require('path');

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
            sys.print('SceneJS Build Script\n');
            sys.print('Usage:\n');
            sys.print('build [type] [options]\n');
            sys.print('eg building scripts without documentation,\n build SCRIPTS --without-documents\n');
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

    var FILES = {

        core:[

            "licenses/license-header.js",

            //--------------------------------------------------------------------
            // Integrated 3rd party libs
            //--------------------------------------------------------------------

            // RequireJS supports dynamic loading of dependencies by plugins
            // We're wrapping it in a conditional to define it if not already defined.

            "src/lib/requireWrapperStart.js",
            "src/lib/require.js",
            "src/lib/requireWrapperEnd.js",

            "src/lib/webgl-debug-utils.js",

            //--------------------------------------------------------------------
            // SceneJS
            //--------------------------------------------------------------------

            // Core

            "src/core/map.js",
            "src/core/scenejs.js",
            // Synchronises the plugins' RequireJS 3rd-party libs route to the plugin path config,
            // so that the plugins' require calls can find their 'lib' directory relative to their plugins directory
            "src/lib/requireConfig.js",
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

            // Scene graph classes

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
            "src/core/nodeTypes.js",

            // Display list classes

            "src/core/display/display.js",
            "src/core/display/programSourceFactory.js",
            "src/core/display/programSource.js",
            "src/core/display/programFactory.js",
            "src/core/display/program.js",
            "src/core/display/objectFactory.js",
            "src/core/display/object.js",
            "src/core/display/renderContext.js",

            // Display list state chunks

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

    sys.print("Generating file list\n");

    var getFileList = function (list, all) {

        if (!list) {
            list = [];
        }

        for (var flag in FLAGS) {
            if ((FLAGS[flag] || all) && FILES[flag]) {
                for (var i = 0; i < FILES[flag].length; i++) {
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

    var productionBuild = true;

    var distDir = "api/" + (productionBuild ? "latest" : "dev");
    var distPluginDir = distDir + "/plugins";
    var distExtrasDir = distDir + "/extras";

    // Create sub directory for build version

    fs.mkdir(distDir,
        function () {

            fs.mkdir(distPluginDir,
                function () {

                    fs.mkdir(distExtrasDir,
                        function () {

                            // Deep-copy an existing directory

                            sys.print("Distributing plugins to: " + distPluginDir + "\n");
                            ncp("src/plugins", distPluginDir, function (err) {

                            });

                            sys.print("Distributing extras to: " + distExtrasDir + "\n");
                            ncp("src/extras", distExtrasDir, function (err) {

                            });

                            fs.writeFileSync(distExtrasDir + "/gui.js", fs.readFileSync("src/extras/gui/dat.gui.min.js") + fs.readFileSync("src/extras/gui/gui.js"));

                            if (fileList.length > 0) {
                                sys.print("Writing core library to: " + distDir + "/scenejs.js\n");
                                output.push('SceneJS.configure({ pluginPath: "http://xeolabs.github.com/scenejs/' + distDir + '/plugins" });');
                                output = output.join("");
                                fs.writeFileSync(distDir + "/scenejs.js", output);
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
        });

})();