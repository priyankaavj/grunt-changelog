/*
 * grunt-changelog
 * https://github.com/ericmatthys/grunt-changelog
 *
 * Copyright (c) 2013 Eric Matthys
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>',
			],
			options: {
				jshintrc: '.jshintrc',
			},
		},

		clean: {
			tests: ['tmp'],
		},

		changelog: {
			default_options: {
				options: {
					log: 'test/fixtures/log',
					snippet: 'test/fixtures/snippet',
					dest: 'tmp/changelog_default',
					startCommitId : '4f97f4bc8fbf7a3779594773a7f6bae57f6304ca',
					endCommitId : 'bdb80e9af4b4ebde50b0d5420b6822c10f154e93',
					startSnippetDate : '01-09-2014',
					endSnippetDate : '01-11-2014'

				}
			}
		},

		nodeunit: {
			tests: ['test/*_test.js'],
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.registerTask('test', ['clean', 'changelog']);

	grunt.registerTask('default', ['jshint', 'test']);

};
