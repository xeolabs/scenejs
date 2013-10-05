/*
 SceneJS WebGL Scene Graph Engine
 Copyright (c) 2013, Lindsay Kay
 lindsay.kay@xeolabs.com
 All rights reserved.
 */

'use strict';


// var apiDir = "api/" + (productionBuild ? "latest" : "dev");
var apiDir = 'api/latest/';

var sjsFiles = [

    // Core

    'src/core/map.js',
    'src/core/scenejs.js',

    'src/core/eventManager.js',
    'src/core/plugins.js',
    'src/core/events.js',
    'src/core/canvas.js',
    'src/core/engine.js',
    'src/core/errors.js',
    'src/core/config.js',
    'src/core/log.js',
    'src/core/math.js',
    'src/core/webgl.js',
    'src/core/status.js',

    // Scene graph classes

    'src/core/scene/nodeEvents.js',
    'src/core/scene/core.js',
    'src/core/scene/coreFactory.js',
    'src/core/scene/node.js',
    'src/core/scene/nodeFactory.js',
    'src/core/scene/camera.js',
    'src/core/scene/clips.js',
    'src/core/scene/enable.js',
    'src/core/scene/flags.js',
    'src/core/scene/framebuf.js',
    'src/core/scene/geometry.js',
    'src/core/scene/layer.js',
    'src/core/scene/library.js',
    'src/core/scene/lights.js',
    'src/core/scene/lookAt.js',
    'src/core/scene/material.js',
    'src/core/scene/morphGeometry.js',
    'src/core/scene/name.js',
    'src/core/scene/renderer.js',
    'src/core/scene/depthbuf.js',
    'src/core/scene/colorbuf.js',
    'src/core/scene/view.js',
    'src/core/scene/scene.js',
    'src/core/scene/shader.js',
    'src/core/scene/shaderParams.js',
    'src/core/scene/style.js',
    'src/core/scene/tag.js',
    'src/core/scene/texture.js',
    'src/core/scene/xform.js',
    'src/core/scene/matrix.js',
    'src/core/scene/rotate.js',
    'src/core/scene/translate.js',
    'src/core/scene/scale.js',
    'src/core/scene/modelXFormStack.js',
    'src/core/nodeTypes.js',

    // Display list classes

    'src/core/display/display.js',
    'src/core/display/programSourceFactory.js',
    'src/core/display/programSource.js',
    'src/core/display/programFactory.js',
    'src/core/display/program.js',
    'src/core/display/objectFactory.js',
    'src/core/display/object.js',
    'src/core/display/renderContext.js',

    // Display list state chunks

    'src/core/display/chunks/chunk.js',
    'src/core/display/chunks/chunkFactory.js',
    'src/core/display/chunks/cameraChunk.js',
    'src/core/display/chunks/clipsChunk.js',
    'src/core/display/chunks/drawChunk.js',
    'src/core/display/chunks/flagsChunk.js',
    'src/core/display/chunks/framebufChunk.js',
    'src/core/display/chunks/geometryChunk.js',
    'src/core/display/chunks/lightsChunk.js',
    'src/core/display/chunks/listenersChunk.js',
    'src/core/display/chunks/lookAtChunk.js',
    'src/core/display/chunks/materialChunk.js',
    'src/core/display/chunks/morphGeometryChunk.js',
    'src/core/display/chunks/nameChunk.js',
    'src/core/display/chunks/programChunk.js',
    'src/core/display/chunks/rendererChunk.js',
    'src/core/display/chunks/depthbufChunk.js',
    'src/core/display/chunks/colorbufChunk.js',
    'src/core/display/chunks/viewChunk.js',
    'src/core/display/chunks/shaderChunk.js',
    'src/core/display/chunks/shaderParamsChunk.js',
    'src/core/display/chunks/styleChunk.js',
    'src/core/display/chunks/textureChunk.js',
    'src/core/display/chunks/xformChunk.js'
];

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // read package.json
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({

        pkg: pkg,

        jekyll: {
            website: {}
        },

        watch: {

            options: {
                livereload: 12345
            },

            // build the website if anything changes
            website: {
                files: [
                    '_config.yml',
                    'assets/**/*',
                    '_includes/**/*.html',
                    '_layouts/**/*.html',
                    'examples/**/*',
                    'bower_components/**/*',
                    '*.html'
                ],
                tasks: ['jekyll']
            },

            // build scenejs if any source changes
            src: {
                files: ['src/**/*'],
                tasks: ['build']
            },

            // copy api folder over to the site if it changes
            api: {
                files: [
                    'api/**/*'
                ],
                tasks: ['rsync:api2site']
            }
        },

        // testing server
        connect: {

            options: {
                hostname: '*',
                port: 1234,
                livereload: 12345,
                base: '_site'
            },

            testserver: {}
        },

        rsync: {

            options: {
                recursive: true,
                syncDest: true
            },

            plugins: {
                options: {
                    src: 'src/plugins',
                    dest: apiDir
                }
            },

            extras: {
                options: {
                    src: 'src/extras',
                    dest: apiDir
                }
            },

            api2site: {
                options: {
                    src: 'api',
                    dest: '_site'
                }
            },

            apiVersionFolder: {
                options: {
                    src: apiDir,
                    dest: 'api/' + pkg.version
                }
            }
        },

        wrap: {

            requirejsSafe: {
                src: ['node_modules/requirejs/require.js'],
                dest: 'src/misc/requirejsSafe.js',
                options: {
                    wrapper: ['if (undefined === require) {\n', '};\n']
                }
            }
        },

        concat: {

            options: {
                banner: grunt.file.read('BANNER')
            },

            default: {
                src: ['src/misc/requirejsSafe.js', 'src/misc/webgl-debug-utils.js'].concat(sjsFiles).concat('src/misc/requireConfig.js'),

                dest: apiDir + 'scenejs.js',

                options: {
                    footer: 'SceneJS.configure({ pluginPath: "/api/latest/plugins" });\n'
                }
            },

            amd: {
                src: ['src/misc/webgl-debug-utils.js'].concat(sjsFiles),
                dest: apiDir + 'scenejs-amd.js',

                options: {
                    banner: grunt.file.read('BANNER') + 'define([], function() {\n',
                    footer: 'return SceneJS;\n});\n'
                }
            },

            gui: {
                src: ['src/extras/gui/dat.gui.min.js', 'src/extras/gui/gui.js'],
                dest: apiDir + 'extras/gui.js'
            }
        }
    });

    grunt.registerTask('website', function() {

        grunt.task.run([
            'jekyll',
            'connect',
            'watch'
        ]);
    });

    grunt.registerTask('build', function(target) {

        target = target || 'all';

        var tasks = {
            default: ['wrap:requirejsSafe', 'concat:default'],
            amd: ['concat:amd'],
            common: ['rsync:plugins', 'rsync:extras', 'concat:gui']
        };

        grunt.task.run(tasks.common);
        grunt.task.run(target == 'all' ? tasks.default.concat(tasks.amd) : tasks[target]);
        grunt.task.run('rsync:apiVersionFolder');
    });

    grunt.registerTask('default', function() {

        grunt.option('force', true);

        grunt.task.run([
            'build',
            'website'
        ]);
    });
};
