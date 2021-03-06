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

	testVersionIncrementZeroingEnabled: function(test) {
		var newVer = gyarados.incrementVersion("5.6.7", 1, [0, 0], true);
		test.equal(newVer, "5.7.0", "Should zero build version");
		test.done();
	},

	testVersionIncrementZeroingDisabled: function(test) {
		var newVer = gyarados.incrementVersion("5.6.7", 1, [0, 0], false);
		test.equal(newVer, "5.7.7", "Should keep build version");
		test.done();
	},

	testBasicIncrement: function(test) {
		writePackageJSON("1.1.1");
		gyarados.processPackage("tmp/package.json", gyarados.getDefaultOptions());
		var pkg = grunt.file.readJSON("tmp/package.json");
		test.equal(pkg.version, "1.1.2", "Should increment package version");
		test.done();
	},

	testIncrementWithZeroing: function(test) {
		writePackageJSON("9.9.9");
		var ops = gyarados.getDefaultOptions();
		ops.zeroRight = true;
		ops.increment = "minor";
		gyarados.processPackage("tmp/package.json", ops);
		var pkg = grunt.file.readJSON("tmp/package.json");
		test.equal(pkg.version, "9.10.0", "Should zero build version");
		test.done();
	},

	testIncrementWithoutZeroing: function(test) {
		writePackageJSON("9.9.9");
		var ops = gyarados.getDefaultOptions();
		ops.zeroRight = false;
		ops.increment = "minor";
		gyarados.processPackage("tmp/package.json", ops);
		var pkg = grunt.file.readJSON("tmp/package.json");
		test.equal(pkg.version, "9.10.9", "Should leave build version");
		test.done();
	},

	testReplaceTextInFile: function(test) {
		var text = "/* This is some regular text file...\n" +
			"it contains some text... */\n\n" +
			"var item = 'some data -> ' + 'Ver:1.2.3' + ' -> more';\n" +
			"// end\n";
		grunt.file.write("tmp/test_file.js", text);
		gyarados.replaceVersionInFile("tmp/test_file.js", '(Ver:)(\\d+\\.\\d+\\.\\d+)', "$110.9.8");
		var content = grunt.file.read("tmp/test_file.js");
		test.equal(content.indexOf("Ver:10.9.8") > 0, true, "File should contain new version text");
		test.done();
	},

	testIncrementReplaceTextInFile: function(test) {
		var text = "/* This is some regular text file...\n" +
			"it contains some text... */\n\n" +
			"var item = { 'title': 'test', 'version':'1.1.0' };\n" +
			"// end\n";
		grunt.file.write("tmp/test_file.js", text);
		writePackageJSON("1.1.0");
		var ops = gyarados.getDefaultOptions();
		ops.increment = "build";
		ops.replacements.push({
			path: "tmp/test_file.js",
			expression: '(\'version\':\')(\\d+\\.\\d+\\.\\d+)(\')',
			replacement: '$1$ver$3'
		});
		gyarados.processPackage("tmp/package.json", ops);
		var pkg = grunt.file.readJSON("tmp/package.json");
		test.equal(pkg.version, "1.1.1", "Should increment version in package.json");
		var content = grunt.file.read("tmp/test_file.js");
		test.equal(content.indexOf("'version':'1.1.1'") > 0, true, "File should contain new version text");
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

	testGetPackageVersion: function(test) {
		writePackageJSON("12.342.49");
		var pver = gyarados.getPackageVersion("tmp/package.json");
		test.equal(pver, "12.342.49");
		test.done();
	},

	testGetRegexForVersionRangeBuild: function(test) {
		var ver = "1.2.3",
			exp = gyarados.getRegexForVersionRange(ver, "build");
		test.equal(exp.toString(), "/1\\.2\\.\\d+/", "Build regex should have dynamic build number");
		test.done();
	},

	testGetRegexForVersionRangeMinor: function(test) {
		var ver = "2.3.4",
			exp = gyarados.getRegexForVersionRange(ver, "minor");
		test.equal(exp.toString(), "/2\\.\\d+\\.\\d+/", "Minor regex should have dynamic minor & build numbers");
		test.done();
	},

	testMergeObjects: function(test) {
		var obj1 = {
				a: 5,
				b: 6
			},
			obj2 = {
				b: 4,
				c: 99
			};
		var output = gyarados.mergeObjects(obj1, obj2);
		test.deepEqual(output, {
			a: 5,
			b: 4,
			c: 99
		}, "Object should have merged form");
		test.equal(output.b, 4, "Merged property should take value of later object");
		test.done();
	},

	testVersionIsValid: function(test) {
		var validVersions = ["0.1.2", "1.2.44", "123.0.33", "0.0.0", "999.999.999"];
		for (var i = 0; i < validVersions.length; i += 1) {
			test.equal(gyarados.versionIsValid(validVersions[i]), true, "Version " + validVersions[i] + " should be valid");
		}
		test.expect(validVersions.length);
		test.done();
	},

	testGitFilterTags: function(test) {
		var tags = ["1.2.3", "1.2.4", "1.5.7", "2.2.3"],
			exp = /1\.2\.\d+/,
			filtered = git_helper.filterTags(tags, exp);
		test.equal(filtered.indexOf("1.2.3") >= 0, true, "1.2.3 is included");
		test.equal(filtered.indexOf("1.2.4") >= 0, true, "1.2.4 is included");
		test.equal(filtered.indexOf("1.5.7") >= 0, false, "1.2.3 is NOT included");
		test.equal(filtered.indexOf("2.2.3") >= 0, false, "2.2.3 is NOT included");
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
	},

	testGitGetHighestTagWithVersionRangeBuild: function(test) {
		var ops = gyarados.getDefaultOptions();
		ops.gitTags = true;
		ops.increment = "build";
		ops.git.checkOnlyIncrementColumn = true;
		ops.lastVersion = "0.1.1";
		var tags = [
			"0.1.1",
			"1.2.3",
			"1.2.4",
			"1.0.9",
			"0.1.9",
			"0.9.99"
		];
		var highest = git_helper.getHighestTagVersion(ops, tags);
		test.equal(highest, "0.1.9", "Highest version should be picked when on build-range");
		test.done();
	},

	testGitGetHighestTagWithVersionRangeMinor: function(test) {
		var ops = gyarados.getDefaultOptions();
		ops.gitTags = true;
		ops.increment = "minor";
		ops.git.checkOnlyIncrementColumn = true;
		ops.lastVersion = "1.2.3";
		var tags = [
			"0.1.1",
			"1.2.3",
			"1.2.4",
			"1.4.99",
			"2.1.2",
			"1.0.9",
			"0.1.9"
		];
		var highest = git_helper.getHighestTagVersion(ops, tags);
		test.equal(highest, "1.4.99", "Highest version should be picked when on minor-range");
		test.done();
	}

};
