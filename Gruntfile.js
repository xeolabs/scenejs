module.exports = function (grunt) {

    "use strict";

    var devScripts = grunt.file.readJSON("dev-scripts.json");

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        PROJECT_NAME: "<%= pkg.name %>",
        ENGINE_VERSION: "<%= pkg.version %>",
        build_dir: "build/<%= ENGINE_VERSION %>",
        license: grunt.file.read("LICENSE.txt"),

        concat: {
            options: {
                banner: grunt.file.read('BANNER'),
                separator: ';',
                process: true
            },
            engine: {
                src: devScripts.engine,
                dest: "<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.js"
            }
        },

        uglify: {
            options: {
                report: "min",
                banner: grunt.file.read('BANNER')
            },
            engine: {
                files: {
                    "<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.min.js": "<%= concat.engine.dest %>"
                }
            }
        },

        clean: {
            tmp: "tmp/*.js",
            docs: ["docs/*"]
        },

        copy: {
            minified: {
                src: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.min.js',
                dest: 'api/latest/<%= PROJECT_NAME %>.min.js'
            },
            unminified: {
                src: '<%= build_dir %>/<%= PROJECT_NAME %>-<%= ENGINE_VERSION %>.js',
                dest: 'api/latest/<%= PROJECT_NAME %>.js'
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask("compile", ["clean", "concat", "uglify"]);
    grunt.registerTask("build", ["compile"]);
    grunt.registerTask("default", "compile");
    grunt.registerTask("all", ["build"]);

    grunt.registerTask("snapshot", ["concat", "uglify", "copy"]);
};
