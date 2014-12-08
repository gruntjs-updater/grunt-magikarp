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

		var title = gyarados.getPackageValue(packagePath, "name"),
			baseVersion = gyarados.getPackageVersion(packagePath);

		grunt.log.writeln("Incrementing package version on: " + packagePath);

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
				grunt.log.write("Retrieving remote tags...");
				git_helper.getGitTagVersions(options, function(tags) {
					grunt.log.ok();
					if (tags.length > 0) {
						// Set last version for highest filter
						options.lastVersion = baseVersion;
						var highestTag = git_helper.getHighestTagVersion(options, tags);
						options.lastVersion = highestTag;
						grunt.log.writeln("Highest tag-version in repo: " + highestTag);
					}
					var result = gyarados.processPackage(packagePath, options);
					grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
					_this.resolve(options, result.new_version);
				});
			}).then(function(options, version) {
				// Step 4: Create tag
				if (options.git.createTag === true) {
					var _this = this;
					grunt.log.write("Tagging git version: " + version + "...");
					git_helper.createTag(options, version, function() {
						grunt.log.ok();
						_this.resolve(options, version, true);
					});
				} else {
					this.resolve(options, version, false);
				}
			}).then(function(options, version, created) {
				// Step 5: Push with tags
				if (options.git.pushAfterTag === true) {
					var _this = this;
					grunt.log.write("Pushing tags to remote...");
					git_helper.pushWithTags(options, function() {
						grunt.log.ok();
						_this.resolve(version);
					});
				} else {
					this.resolve(version);
				}
			}).done(function(version) {
				grunt.log.writeln("Finished versioning project: " + title);
				(done)();
			}).fail(function(err) {
				throw new Error("Failed versioning: " + err);
			}).resolve(options);
		} else {
			var result = gyarados.processPackage(packagePath, options);
			grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
		}
	});

};
