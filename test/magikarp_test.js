'use strict';

var grunt = require('grunt'),
	gyarados = require("../tasks/lib/gyarados.js"),
	git_helper = require("../tasks/lib/git_helper.js");

/*
	======== A Handy Little Nodeunit Reference ========
	https://github.com/caolan/nodeunit

	Test methods:
		test.expect(numAssertions)
		test.done()
	Test assertions:
		test.ok(value, [message])
		test.equal(actual, expected, [message])
		test.notEqual(actual, expected, [message])
		test.deepEqual(actual, expected, [message])
		test.notDeepEqual(actual, expected, [message])
		test.strictEqual(actual, expected, [message])
		test.notStrictEqual(actual, expected, [message])
		test.throws(block, [error], [message])
		test.doesNotThrow(block, [error], [message])
		test.ifError(value)
*/

function writePackageJSON(ver) {
	grunt.file.write("tmp/package.json", JSON.stringify({
		title: "Some Package",
		description: "Some description text.",
		version: ver
	}));
}

var ops;

exports.magikarp = {
	setUp: function(done) {
		ops = {

		};
		done();
	},

	testVersionIncrementBasic: function(test) {
		var newVer = gyarados.incrementVersion("1.1.1", 0, [0, 0]);
		test.equal(newVer, "1.1.2", "Should increment only build");
		test.done();
	},

	testVersionIncrementTen: function(test) {
		var newVer = gyarados.incrementVersion("1.1.9", 0, [0, 0]);
		test.equal(newVer, "1.1.10", "Should increment over 9");
		test.done();
	},

	testVersionIncrementLimitBuild: function(test) {
		var newVer = gyarados.incrementVersion("1.1.5", 0, [5, 0]);
		test.equal(newVer, "1.2.0", "Should increment minor when build limited");
		test.done();
	},

	testVersionIncrementLimitMinor: function(test) {
		var newVer = gyarados.incrementVersion("1.9.3", 1, [0, 9]);
		test.equal(newVer, "2.0.0", "Should increment major when minor limited");
		test.done();
	},

	testVersionIncrementLimitMinorAndBuild: function(test) {
		var newVer = gyarados.incrementVersion("1.9.9", 0, [9, 9]);
		test.equal(newVer, "2.0.0", "Should increment major when build+minor limited");
		test.done();
	},

	testBasicIncrement: function(test) {
		writePackageJSON("1.1.1");
		gyarados.processPackage("tmp/package.json", gyarados.getDefaultOptions());
		var pkg = grunt.file.readJSON("tmp/package.json");
		test.equal(pkg.version, "1.1.2", "Should increment package version");
		test.done();
	},

	testGetHighestVersion: function(test) {
		var highest1 = gyarados.getHighestVersion("0.1.1", "0.2.2");
		var highest2 = gyarados.getHighestVersion("1.1.1", "0.2.2");
		var highest3 = gyarados.getHighestVersion("9.1.1", "10.0.1");
		var highest4 = gyarados.getHighestVersion("1.1.1", "1.1.1");
		test.equal(highest1, "0.2.2", "Highest version should be 0.2.2 (1)");
		test.equal(highest2, "1.1.1", "Highest version should be 1.1.1 (2)");
		test.equal(highest3, "10.0.1", "Highest version should be 10.0.1 (3)");
		test.equal(highest4, "1.1.1", "Highest version should be 1.1.1 (4)");
		test.done();
	},

	testGitGetHighestTag: function(test) {
		var ops = gyarados.getDefaultOptions();
		ops.gitTags = true;
		var tags = [
			"0.1.1",
			"1.2.3",
			"1.2.4",
			"1.0.9",
			"0.9.99"
		];
		var highest = git_helper.getHighestTagVersion(ops, tags);
		test.equal(highest, "1.2.4", "Highest version should be picked");
		test.done();
	}

};
