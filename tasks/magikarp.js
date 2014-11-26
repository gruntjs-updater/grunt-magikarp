/*
 * grunt-magikarp
 * https://github.com/perry-mitchell/grunt-magikarp
 *
 * Copyright (c) 2014 Perry Mitchell
 * Licensed under the DO WHAT THE FUCK YOU WANT TO Public License.
 */

'use strict';

module.exports = function(grunt) {

	var gyarados = require("./lib/gyarados.js"),
		git_helper = require("./lib/git_helper.js");

	grunt.registerMultiTask('magikarp', 'A Grunt-based NPM package version incrementation utility.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options(gyarados.getDefaultOptions());

		var workingDirectory = this.targetDirectory || ".",
			packagePath = ((workingDirectory[workingDirectory.length - 1] === '/') ?
				workingDirectory : workingDirectory + "/") + "package.json";

		grunt.log.writeln("Incrementing package version: " + packagePath);

		if (options.gitTags === true) {
			var done = this.async();

			var getTags = function() {
				git_helper.getGitTagVersions(options, function(tags) {
					if (tags.length > 0) {
						var highestTag = git_helper.getHighestTagVersion(options, tags);
						options.lastVersion = highestTag;
						grunt.log.writeln("Highest tag-version in repo: " + highestTag);
						var result = gyarados.processPackage(packagePath, options);
						grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
					} else {
						var result = gyarados.processPackage(packagePath, options);
						grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
					}
					(done)();
				});
			};

			if (options.git.pullBeforeCheck === true) {
				grunt.log.write("Fetching tags from repository...");
				git_helper.fetchTags(options, function() {
					grunt.log.ok();
					(getTags)();
				});
			}
		} else {
			var result = gyarados.processPackage(packagePath, options);
			grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
		}
	});

};
