module.exports = (function() {

	"use strict";

	var helper = {};
	var grunt = require('grunt'),
		gyarados = require('./gyarados'),
		exec = require('child_process').exec,
		Repo  = require('git').Repo;

	helper.checkStatusClear = function(options, callback) {
		var command = "git status";
		exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				throw new Error("Checking git status failed: " + error);
			}
			if (stdout.indexOf("nothing to commit") < 0) {
				throw new Error("Working directory is not clean - cannot continue");
			}
			(callback)();
		});
	};

	helper.createTag = function(options, version, callback) {
		var command = "git commit -a -m \"Version: " + version + "\"; git tag -a " + version + " -m \"Version " + version + "\"";
		exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				throw new Error("Creating/Commiting tag failed: " + error);
			}
			(callback)();
		});
	};

	helper.fetchTags = function(options, callback) {
		var command = "git fetch --tags";
		exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				throw new Error("Fetching git tags failed: " + error);
			}
			(callback)();
		})
	};

	helper.getGitTagVersions = function(options, callback) {
		var repo = new Repo(options.git.projectDirectory, {}, function(err, r) {
			r.tags(function(err, tags) {
				var tagArr = [];
				for (var tagIndex in tags) {
					var tag = tags[tagIndex];
					tagArr.push(tag.name);
				}
				(callback)(tagArr);
			});
		});
	};

	helper.getHighestTagVersion = function(options, tags) {
		var exp = new RegExp(options.git.tagFilterRegex);
		return tags.sort(function(a, b) {
			var aMatch = a.match(exp),
				bMatch = b.match(exp);
			if ((aMatch !== null) && (bMatch !== null)) {
				var ver1 = aMatch[0],
					ver2 = bMatch[0];
				if (gyarados.versionIsValid(ver1) && gyarados.versionIsValid(ver2)) {
					var highest = gyarados.getHighestVersion(ver1, ver2);
					if (ver1 === ver2) {
						return 0;
					} else if (highest === ver1) {
						return -1;
					} else if (highest === ver2) {
						return 1;
					}
				} else {
					throw new Error("Invalid versions from git repo: " + aMatch + ", " + bMatch);
				}
			} else {
				throw new Error("Bad versions from git repo: " + aMatch + ", " + bMatch);
			}
			return 0;
		})[0];
	};

	helper.pushWithTags = function(options, callback) {
		var command = "git push; git push --tags";
		exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				throw new Error("Pushing git tags failed: " + error);
			}
			(callback)();
		})
	};

	return helper;

})();