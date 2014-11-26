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
		git_helper = require("./lib/git_helper.js"),
		commit = require("js-commitment");

	grunt.registerMultiTask('magikarp', 'A Grunt-based NPM package version incrementation utility.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options(gyarados.getDefaultOptions());

		var workingDirectory = this.targetDirectory || ".",
			packagePath = ((workingDirectory[workingDirectory.length - 1] === '/') ?
				workingDirectory : workingDirectory + "/") + "package.json";

		grunt.log.writeln("Incrementing package version: " + packagePath);

		if (options.gitTags === true) {
			var done = this.async();

			var gitChain = commit.JSCommitment.commit(function(options) {
				// Step 1: Check for fetching tags
				if (options.git.pullBeforeCheck === true) {
					var _this = this;
					grunt.log.write("Fetching tags from repository...");
					git_helper.fetchTags(options, function() {
						grunt.log.ok();
						_this.resolve(options);
					});
				} else {
					this.resolve(options);
				}
			}).then(function(options) {
				// Step 2: Check the working directory is clean
				grunt.log.write("Checking working directory status...");
				var _this = this;
				git_helper.checkStatusClear(options, function() {
					grunt.log.ok();
					_this.resolve(options);
				});
			}).then(function(options) {
				// Step 3: Process the package version
				var _this = this;
				git_helper.getGitTagVersions(options, function(tags) {
					/*if (tags.length > 0) {
						var highestTag = git_helper.getHighestTagVersion(options, tags);
						options.lastVersion = highestTag;
						grunt.log.writeln("Highest tag-version in repo: " + highestTag);
						var result = gyarados.processPackage(packagePath, options);
						grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
					} else {
						var result = gyarados.processPackage(packagePath, options);
						grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
					}*/
					_this.resolve(options, "1.1.1");
				});
			}).then(function(options, version) {
				// Step 4: Commit and create the tag

				this.resolve(options, version, true);
			}).then(function(options, version, created) {
				// Step 5: Push with tags

			}).done(function(version) {

				(done)();
			}).fail(function(err) {
				throw new Error("Failed versioning: " + err);
			}).resolve(options);

			/*var getTags = function() {
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
					grunt.log.write("Checking working directory status...");
					git_helper.checkStatusClear(options, function() {
						grunt.log.ok();

					});
				});
			}*/
		} else {
			var result = gyarados.processPackage(packagePath, options);
			grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
		}
	});

};
