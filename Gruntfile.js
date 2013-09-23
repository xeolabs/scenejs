'use strict';
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    // watch list
    watch: {

      livereload: {
        files: [

          'js/{,**/}*.js'
        ],
        // tasks: ['exec'],
        options: {
          livereload: 12345,
        }
      }
      /* not used at the moment
      handlebars: {
        files: [
          '<%= yeoman.app %>/templates/*.hbs'
        ],
        tasks: ['handlebars']
      }*/
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
      // 'clean:server',
      // 'compass:server',
      'connect:testserver',
      // 'express:dev',
      // 'exec',
      // 'open',
      'watch'
    ]);
  });
};
