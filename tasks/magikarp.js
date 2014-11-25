/*
 * grunt-magikarp
 * https://github.com/perry-mitchell/grunt-magikarp
 *
 * Copyright (c) 2014 Perry Mitchell
 * Licensed under the DO WHAT THE FUCK YOU WANT TO Public License.
 */

'use strict';

module.exports = function(grunt) {

	var gyarados = require("./lib/gyarados.js");

	grunt.registerMultiTask('magikarp', 'A Grunt-based NPM package version incrementation utility.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options(gyarados.getDefaultOptions());

		var workingDirectory = this.targetDirectory || ".",
			packagePath = ((workingDirectory[workingDirectory.length - 1] === '/') ?
				workingDirectory : workingDirectory + "/") + "package.json";

		grunt.log.writeln("Incrementing package version: " + packagePath);

		var result = gyarados.processPackage(packagePath, options);

		grunt.log.writeln("Version incremented: " + result.old_version + " -> " + result.new_version);
	});

};
