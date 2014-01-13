/*
* grunt-changelog
* https://github.com/ericmatthys/grunt-changelog
*
* Copyright (c) 2013 Eric Matthys
* Licensed under the MIT license.
*/

'use strict';

module.exports = function (grunt) {

	var moment = require('moment');

	grunt.registerMultiTask('changelog', 'Generate a changelog based on commit messages.', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		//console.log(this);
		var options = this.options({
			featureRegex: /\s{6}.*/g,
			fixRegex: /^(.*)fixes #\d+:?(.*)$/gim,
			dest: 'changelog.txt',
			templates: {
				main: 'NEW:\n{{features}}',
				change: '  - {{change}}\n',
				empty: '  (none)\n'
			}

		});


		grunt.verbose.writeflags(options, 'Options');

		// Loop through each match and build the string of changes that will
		// replace part of the main template.
		function getChanges(log, regex) {
			var changes = '';
			var match;

			while ((match = regex.exec(log))) {
				var change = '';

				for (var i = 0, len = match.length; i < len; i++) {
					change += match[i];
				}

				changes += options.templates.change.replace('{{change}}', change.trim());
			}

			if (changes)
				return changes;
			else
				return options.templates.empty;
		}

		// Generate the changelog using the templates defined in options.
		function getChangelog(log) {
			var output = options.templates.main;
			var startCommitId = options.startCommitId;
			var endCommitId = options.endCommitId;

			var tmp = log.substring(log.indexOf(startCommitId)-7,log.length).split(/commit \w{40}/);
			log = log.substring(log.indexOf(endCommitId)-7,log.indexOf(startCommitId)-7) + "\ncommit "+startCommitId+tmp[1];

			output = output.replace('{{date}}', moment().format('YYYY-MM-DD'));
			output = output.replace('{{features}}', getChanges(log, options.featureRegex));
			

			return output;
		}
		function getSnippet(snippetFileContent, startDate, endDate){
			var result= "";
			var tmp = snippetFileContent.substring(snippetFileContent.indexOf(startDate)-17,snippetFileContent.length).split(/Snippet Content: \d{2}-\d{2}-\d{4}/);
			snippetFileContent = snippetFileContent.substring(snippetFileContent.indexOf(endDate)-17,snippetFileContent.indexOf(startDate)-17) + "\nSnippet Content: "+startDate+tmp[1];

			tmp = snippetFileContent.split(/Snippet Content: \d{2}-\d{2}-\d{4}/);
			for(var i=0; i<tmp.length; i++){
				result = result+tmp[i].trim();
			}
			return result;

		}
		// Write the changelog to the destination file.
		function writeChangelog(changelog) {
			grunt.file.write(options.dest, changelog);

			// Log the results.
			grunt.log.ok(changelog);
			grunt.log.writeln();
			grunt.log.writeln('Changelog created at '+ options.dest.toString().cyan + '.');
		}

		// If a log is passed in as an option, don't run the git log command
		// and just use the explicit log instead.
		var changelog = '';
		var snippet = '';
		var result = '';
		if (options.log) {
			// Check to make sure that the log exists before going any further.
			if (!grunt.file.exists(options.log)) {
				grunt.fatal('This log file does not exist.');
				return false;
			}

			result = grunt.file.read(options.log);
			changelog = getChangelog(result);
			
		}
		
		
		if (options.snippet) {
			// Check to make sure that the log exists before going any further.
			if (!grunt.file.exists(options.snippet)) {
				grunt.fatal('This snippet file does not exist.');
				return false;
			}

			result = grunt.file.read(options.snippet);
			snippet = getSnippet(result, options.startSnippetDate, options.endSnippetDate);

		}
		var content = snippet + "\n\n" +changelog;
		writeChangelog(content);

		if(!options.log){

			var done = this.async();

			// Build our options for the git log command. Only print the commit message.
			var args = [
				'log',
				'--pretty=format:%s',
				'--no-merges',
				'--after="' + options.after + '"',
				'--before="' + options.before + '"'
			];

			grunt.verbose.writeln('git ' + args.join(' '));

			// Run the git log command and parse the result.
			grunt.util.spawn(
				{
					cmd: 'git',
					args: args
				},

				function (error, result) {
					if (error) {
						grunt.log.error(error);
						return done(false);
					}

					var changelog = getChangelog(result);

					writeChangelog(changelog);

					done();
				}
			);
		}
	});

};
