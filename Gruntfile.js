
'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        'browser': true,
        'devel': true,
        'node': true,
        'esnext': false,
        'bitwise': true,
        'camelcase': false,
        'curly': true,
        'eqeqeq': true,
        'immed': true,
        'indent': 2,
        'latedef': true,
        'newcap': true,
        'noarg': true,
        'quotmark': 'single',
        'regexp': true,
        'undef': true,
        'unused': true,
        'strict': true,
        'trailing': true,
        'smarttabs': true,
        'white': true,
        'laxcomma': true,
        'asi': true,
        'sub': true,
        'globals': {
          'it': false,
          'describe': false,
          'after': false,
          'before': false,
          '$': false,
          'jQuery': false
        }
      },
      src: [
        'Gruntfile.js',
        '{model,routes,test}/*.js'
      ],
      assets: [
        'public/javascripts/**/*.js',
        '!public/javascripts/vendor/**/*.js',
      ]
    },
    watch: {
      lint: {
        files: ['<%= jshint.src %>', '<%= jshint.assets %>'],
        tasks: ['jshint']
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          cwd: __dirname,
          ignore: ['node_modules/**'],
          // argv: ['--host localhost', '--user user']
          ext: 'js',
          watch: ['model', 'routes', 'views', 'test'],
          delayTime: 1,
          legacyWatch: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },
    blanket: {
      options: {
        // Task-specific options go here.
        debug: true
      },
      files: {
        'coverage/': ['model/'],
      },
    },
    concurrent: {
      server: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.registerTask('default', 'server');
  grunt.registerTask('test', ['blanket', 'jshint', 'mochaTest']);
  grunt.registerTask('server', 'concurrent:server');

  require('load-grunt-tasks')(grunt);
};
