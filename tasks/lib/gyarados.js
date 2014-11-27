module.exports = (function() {

	"use strict";

	var gyarados = {};
	var grunt = require('grunt');

	/**
	 * Extract the version from the package.json file contents
	 * @param contents {string} The file contents
	 * @returns {string|boolean} Returns version on success, false on failure
	 */
	gyarados.extractVersion = function(contents) {
		var exp = gyarados.getVersionRegex(),
			match = exp.exec(contents);
		if (match === null) {
			return false;
		}
		return (match.length >= 2) ? match[1] : false;
	};

	/**
	 * Get the default options structure
	 * @returns {Object}
	 */
	gyarados.getDefaultOptions = function() {
		return {
			git: {
				createTag: true,
				projectDirectory: ".",
				pullBeforeCheck: true,
				pushAfterTag: true
			},
			gitTags: false,
			increment: "build",
			limits: {
				build: 0,
				minor: 0
			},
			lastVersion: false
		};
	};

	/**
	 * Get the highest version out of 2 versions
	 * @param versionA {string} The first version (x.y.z)
	 * @param versionB {string} The second version (x.y.z)
	 * @returns {string} The highest of the 2 versions (x.y.z)
	 */
	gyarados.getHighestVersion = function(versionA, versionB) {
		var parts1 = versionA.split('.'),
			parts2 = versionB.split('.');
		for (var p = 0; p <= 2; p += 1) {
			var num1 = parseInt(parts1[p], 10),
				num2 = parseInt(parts2[p], 10);
			if (num1 > num2) {
				return versionA;
			} else if (num1 < num2) {
				return versionB;
			}
			// else continue
		}
		// both are the same
		return versionA;
	};


	gyarados.getPackageValue = function(path, key) {
		var data = grunt.file.readJSON(path);
		return data[key] || "";
	};

	/**
	 * Get the version-extraction regular expression
	 * @returns {RegExp} The regular expression
	 */
	gyarados.getVersionRegex = function() {
		return /"version"\s*:\s*"(\d+\.\d+\.\d+)"/g;
	};

	/**
	 * Increment a version string. Takes a version string, the index to increment, and
	 * an array of index limits (build and minor).
	 * @param version {string} The version string, in format 'x.y.z', where x, y and z
	 * 		are all positive integers.
	 * @param indexFromRight {integer} A positive integer between 0 and 2 (inclusive).
	 *		This is the index to increment, from the right, so that 0 is 'build' and 2
	 *		is 'major'.
	 * @param limits {Array[2]} An array of limits (for the build and minor portions).
	 *		Limiting a column sets a maximum value that can be kept there -
	 *		Incrementing a column beyond the limit will increment the next column up.
	 *		Setting a limit to 0 is equivalent to an unlimited amount (default). The
	 *		array must always contain exactly 2 integers.
	 * @returns {string} The incremented version in the format 'x.y.z'
	 */
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

	/**
	 * Process the package.json file and increment the version inside it, according
	 * to a configuration.
	 * @param packageJSONPath {string} The path to the package.json file
	 * @returns {
	 * 		{
     *			old_version: string,
     *			new_version: string
	 *		}
	 * }
	 */
	gyarados.processPackage = function(packageJSONPath, config) {
		if (!grunt.file.exists(packageJSONPath)) {
			throw new Error("package.json does not exist at path: " + packageJSONPath);
		}

		var contents = grunt.file.read(packageJSONPath),
			version = gyarados.extractVersion(contents),
			originalVersion = version;

		if (version === false) {
			throw new Error("Unable to extract version from manifest: " + packageJSONPath);
		}
		if (!gyarados.versionIsValid(version)) {
			throw new Error("Package version is invalid: " + version);
		}

		if (config.lastVersion !== false) {			
			version = gyarados.getHighestVersion(version, config.lastVersion);
			if (version !== originalVersion) {
				grunt.log.writeln("Git repo had higher version: " + version + " (package was at " + originalVersion + ")");
			}
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

		contents = gyarados.replaceVersion(contents, newVersion);
		grunt.file.write(packageJSONPath, contents);

		return {
			old_version: version,
			new_version: newVersion
		};
	};

	/**
	 * Replace the version inside a package.json file
	 * @param contents {string} The package.json file contents
	 * @param newVersion {string} The new version
	 * @returns {string} The new contents, version replaced
	 */
	gyarados.replaceVersion = function(contents, newVersion) {
		var exp = gyarados.getVersionRegex();
		return contents.replace(exp, '"version":"' + newVersion + '"');
	};

	/**
	 * Check if a version is valid
	 * @param versionStr {string} A version string
	 * @returns {boolean} True for valid ('x.y.z'), false otherwise
	 */
	gyarados.versionIsValid = function(versionStr) {
		var exp = /^\d+\.\d+\.\d+$/;
		return exp.test(versionStr);
	};

	return gyarados;

})();