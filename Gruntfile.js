/*
 SceneJS WebGL Scene Graph Engine
 Copyright (c) 2013, Lindsay Kay
 lindsay.kay@xeolabs.com
 All rights reserved.
 */


'use strict';
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// var distDir = "dist/" + (productionBuild ? "latest" : "dev");
var distDir = "dist/latest/";

module.exports = function(grunt) {

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        jekyll: {
            default: {}
        },

        watch: {

            jekyll: {
                files: [
                    'assets/**/*',
                    '_includes/**/*.html',
                    '_layouts/**/*.html',
                    '*.html'
                ],
                tasks: ['jekyll'],
                options: {
                    livereload: 12345,
                }
            }
        },

        // testing server
        connect: {
            testserver: {
                options: {
                    hostname: '*',
                    port: 1234,
                    base: '_gh_pages'
                }
            }
        },
        
        rsync: {
            options: {
                recursive: true,
                syncDest: true
            },
            plugins: {
                options: {
                    src: "src/plugins",
                    dest: distDir
                }
            },
            extras: {
                options: {
                    src: "src/extras",
                    dest: distDir
                }
            }
        },
        
        concat: {

            dist: {
                src: [

                    // TODO: do automatic banner generation in grunt
                    "licenses/license-header.js",

                    //--------------------------------------------------------------------
                    // Integrated 3rd party libs
                    //--------------------------------------------------------------------
                    // TODO: manage these with grunt or bower
                    // TODO: have a build that optionally doesn't include requirejs

                    // RequireJS supports dynamic loading of dependencies by plugins
                    // We're wrapping it in a conditional to define it if not already defined.

                    "src/misc/requireWrapperStart.js",
                    "src/misc/require.js",
                    "src/misc/requireWrapperEnd.js",
                    
                    // TODO: optionally exclude these
                    "src/misc/webgl-debug-utils.js",

                    //--------------------------------------------------------------------
                    // SceneJS
                    //--------------------------------------------------------------------

                    // Core

                    "src/core/map.js",
                    "src/core/scenejs.js",
                    
                    // Synchronises the plugins' RequireJS 3rd-party libs route to the plugin path config,
                    // so that the plugins' require calls can find their 'lib' directory relative to their plugins directory
                    // TODO: take a look at this
                    "src/misc/requireConfig.js",
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
                    "src/core/scene/enable.js",
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
                ],
                
                dest: distDir + 'scenejs.js',
            },
            
            gui: {
                src: ["src/extras/gui/dat.gui.min.js", "src/extras/gui/gui.js"],
                dest: distDir + "extras/gui.js"
            }
        }
    });

    grunt.registerTask('jekyll', function() {

        grunt.option('force', true);

        grunt.task.run([
            'jekyll',
            'connect',
            'watch'
        ]);
    });

    grunt.registerTask('build', function(target) {
        
        target = target || 'all';

        grunt.task.run([
            'rsync:plugins',
            'rsync:extras',
            'concat:dist',
            'concat:gui'
        ]);
    });
    
    grunt.registerTask('default', function() {
        grunt.task.run([
            'build'
        ]);
    });
};
