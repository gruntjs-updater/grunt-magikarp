module.exports = (function() {

	"use strict";

	var gyarados = {};
	var grunt = require('grunt');

	gyarados.extractVersion = function(contents) {
		var exp = gyarados.getVersionRegex(),
			match = exp.exec(contents);
		if (match === null) {
			return false;
		}
		return (match.length >= 2) ? match[1] : false;
	};

	gyarados.getDefaultOptions = function() {
		return {
			increment: "build",
			limits: {
				build: 0,
				minor: 0
			}
		};
	};

	gyarados.getVersionRegex = function() {
		return /"version"\s*:\s*"(\d+\.\d+\.\d+)"/g;
	};

	gyarados.incrementVersion = function(version, indexFromRight, limits) {
		var parts = version.split('.');
		parts.reverse();
		for (var i = 0; i < parts.length; i += 1) {
			parts[i] = parseInt(parts[i], 10);
		}
		parts[indexFromRight] += 1;

		if ((limits[0] > 0) && (parts[0] > limits[0])) { // build
			parts[0] = 0;
			parts[1] += 1;
		}
		if ((limits[1] > 0) && (parts[1] > limits[1])) { // minor
			parts[0] = 0;
			parts[1] = 0;
			parts[2] += 1;
		}

		return "" + parts[2] + "." + parts[1] + "." + parts[0];
	};

	gyarados.processPackage = function(packageJSONPath, config) {
		if (!grunt.file.exists(packageJSONPath)) {
			throw new Error("package.json does not exist at path: " + packageJSONPath);
		}

		var contents = grunt.file.read(packageJSONPath),
			version = gyarados.extractVersion(contents);

		if (version === false) {
			throw new Error("Unable to extract version from manifest: " + packageJSONPath);
		}
		if (!gyarados.versionIsValid(version)) {
			throw new Error("Package version is invalid: " + version);
		}

		var indexFromRight = 0;
		if (config.increment.toLowerCase() === "minor") {
			indexFromRight = 1;
		} else if (config.increment.toLowerCase() === "major") {
			indexFromRight = 2;
		}
		var newVersion = gyarados.incrementVersion(version, indexFromRight, [
			config.limits.build, config.limits.minor
		]);

		contents = gyarados.replaceVersion(contents, version, newVersion);
		grunt.file.write(packageJSONPath, contents);

		return {
			old_version: version,
			new_version: newVersion
		};
	};

	gyarados.replaceVersion = function(contents, oldVersion, newVersion) {
		var exp = gyarados.getVersionRegex();
		return contents.replace(exp, '"version":"' + newVersion + '"');
	};

	gyarados.versionIsValid = function(versionStr) {
		var exp = /^\d+\.\d+\.\d+$/;
		return exp.test(versionStr);
	};

	return gyarados;

})();