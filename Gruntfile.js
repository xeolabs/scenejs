'use strict';
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    
    jekyll: {
      default: {}
    },

    // watch list
    watch: {

      jekyll: {
        files: [
          'assets/**/*',
          '_includes/**/*.html',
          '_layouts/**/*.html',
          'index.html',
          'example.html'
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
          base: '.'
        }
      }
    }
  });

  // starts express server with live testing via testserver
  grunt.registerTask('default', function(target) {

    grunt.option('force', true);

    grunt.task.run([
      'connect',
      'watch'
    ]);
  });
};
