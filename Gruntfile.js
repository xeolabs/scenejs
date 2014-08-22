module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    rsync: {

      push: {
        options: {
          src: './api',
          dest: '/home/ld/mujin/dev/mujinjsclient/mujincontroller/app/vendor/scenejs/',
          // args: ['--verbose'],
          recursive: true,
          delete: true
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['build', 'push'],
        options: {
          spawn: false
        }
      }
    },

    exec: {
      build: 'node build.js'
    }
  });

  grunt.registerTask('build', [
    'exec'
  ]);

  grunt.registerTask('push', [
    'rsync'
  ]);

  grunt.registerTask('default', [
    'build',
    'push'
  ]);
};
