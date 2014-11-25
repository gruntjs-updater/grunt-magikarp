'use strict';

var grunt = require('grunt'),
	gyarados = require("../tasks/lib/gyarados.js");

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
		var pkg = grunt.file.readJSON("tmp/package.json")
		test.equal(pkg.version, "1.1.2", "Should increment package version");
		test.done();
	}

	/*default_options: function(test) {
		test.expect(1);

		var actual = grunt.file.read('tmp/default_options');
		var expected = grunt.file.read('test/expected/default_options');
		test.equal(actual, expected, 'should describe what the default behavior is.');

		test.done();
	},
	custom_options: function(test) {
		test.expect(1);

		var actual = grunt.file.read('tmp/custom_options');
		var expected = grunt.file.read('test/expected/custom_options');
		test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');

		test.done();
	},*/
};
