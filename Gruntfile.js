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
    }
  });

  // starts express server with live testing via testserver
  grunt.registerTask('default', function(target) {

    grunt.option('force', true);

    grunt.task.run([
      'jekyll',
      'connect',
      'watch'
    ]);
  });
};
