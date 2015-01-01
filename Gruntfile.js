//
// Gruntfile.js - configuration of build tool
//

/* global module */
module.exports = function(grunt) {
    'use strict';
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        meta: {
            banner: "\n/* <%= pkg.title || pkg.name %>" + " - v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %>\n * <%= pkg.homepage %>\n <%= pkg.description %>*/\n\n"
        },
        clean: {
            dist: "dist"
        },
        concat: {
            options: {
                separator: "\n\n"
            },
            dist: {
                options: {
                    banner: "<%= meta.banner %>"
                },
                src: ["src/**/*.js"],
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        uglify: {
            options: {
                report: "gzip",
                sourceMap: false,
                //                    sourceMap: "dist/<%= pkg.name %>.min.map",
                banner: "<%= meta.banner %>"
            },
            dist: {
                files: {
                    "dist/<%= pkg.name %>.min.js": ["dist/<%= pkg.name %>.js"]
                }
            }
        },
        'jshint': {
            'files': ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            'options': {
                'jshintrc': '.jshintrc'
            }
        },
        'jscs': {
            'src': ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        },
        delta: {
            all: {
                files: ["Gruntfile.js", "src/**/*.js", "test/*.js"],
                tasks: ["karma:continuous", "concat", "uglify"]
            }
        },
        connect: {
            server: {
                options: {
                    directory: ".",
                    hostname: "0.0.0.0"
                }
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['PhantomJS']
            },
            unit: {
                runnerPort: 9019,
                background: true
            },
            continuous: {
                singleRun: true
            }
        }
    });

    // loading dependencies
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.renameTask("watch", "delta");
    grunt.registerTask("watch", ["build", "delta"]);
    grunt.registerTask("default", ["connect", "watch"]);
    grunt.registerTask("build", ["clean", "concat", "uglify", "test"]);
    grunt.registerTask('test', ['jshint', 'jscs', 'karma:continuous']);
}; 