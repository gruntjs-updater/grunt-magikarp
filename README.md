# grunt-magikarp

> A Grunt-based NPM package version incrementation utility.

![Magikarp](http://perrymitchell.net/wp-content/uploads/2014/11/magikarp_small.png)

## About
Magikarp (besides being a Pokemon) is a grunt utility for incrementing package versions. It supports incrementing any column (build/minor/major), as well as maximum value limits on build and minor columns. You can also use Magikarp to replace versions within other files (aside from package.json), so you can keep your versions synchronised throughout your projects.

Magikarp also supports git integration for convenience, and allows you to interact with tag versions in a remote repository.

Why start a new plugin for something that has already done? I didn't like the way the others functioned, so here's my take on the task.

[![Build Status](http://penkins.doomdns.org/buildStatus/icon?job=grunt-magikarp)](http://penkins.doomdns.org/job/grunt-magikarp/) [![npm version](https://badge.fury.io/js/grunt-magikarp.svg)](http://badge.fury.io/js/grunt-magikarp) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM](https://nodei.co/npm/grunt-magikarp.png?downloads=true&downloadRank=true)](https://nodei.co/npm/grunt-magikarp/)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-magikarp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-magikarp');
```

## The "magikarp" task

### Overview
Magikarp takes some basic options (what to increment, limits etc.) as well as a target directory (that contains a package.json file).

```js
grunt.initConfig({
	magikarp: {
		options: {
			git: {
				checkOnlyIncrementColumn: false,
				createTag: true,
				projectDirectory: ".",
				pullBeforeCheck: true,
				pushAfterTag: true,
				tagFilterRegex: ".+"
			},
			gitTags: false,
			increment: "build",
			limits: {
				build: 0,
				minor: 0
			},
			lastVersion: false,
			replacements: [],
			zeroRight: true
		},
		targetDirectory: "."
	},
});
```

### Options

#### options.gitTags

Type: `Boolean`
Default value: `false`

Enable git tags support. This allows Magikarp to check a remote Git repository for a list of tag versions (in the form x.y.z). Using these tags, it finds the highest and checks that against the package.json version. From the two, it takes the highest and increments *that* version. This protects against having outdated tags locally when working on feature branches in a team.

#### options.increment

Type: `String`
Default value: `build`

A string that determines what to increment. Can be 'build', 'minor' or 'major'.

#### options.lastVersion

Type: `String`/`Boolean`
Default value: `false`

A string that represents the last version from some other source. This is set automatically when using git tags and some tag(s) exist in the repo. There is usually no need to set this.

#### options.limits.build

Type: `Integer`
Default value: `0`

The maximum value of the build column when incrementing. 0 is equivalent to unlimited.

#### options.limits.minor

Type: `Integer`
Default value: `0`

The maximum value of the minor column when incrementing. 0 is equivalent to unlimited.

#### options.replacements

Type: `Array`
Default value: `[]`

An array of replacement objects, which take the following form:

```
{
	path: string,
	expression: string,
	replacement: string
}
```

Replacements provide a way of replacing version numbers in other files in a project.

The `path` parameter specifies the path to the file to perform a replacement in. The `expression` parameter is a string containing a regular expression to match a context that will be used to insert the new version.

The `replacement` parameter can contain group insertions (like `$1`), and **should** contain an insertion for the version `$ver`. You can also use regular regex replacements as specified on the `String.replace()` method - check it out on the [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter).

#### options.zeroRight

Type: `Boolean`
Default value: `true`

Whether or not to zero the right side of the incrementation process. When enabled, incrementing the _minor_ version of "1.2.3" would yield "1.3.0". If disabled, the same situation would produce "1.3.3".

#### targetDirectory

Type: `String`
Default value: `.`

The directory containing the package.json file, usually an NPM project.

#### options.git

##### options.git.checkOnlyIncrementColumn

Type: `Boolean`
Default value: `false`

Switch on checking for just a column range when reading git tags. For instance, if you want to make a hotfix from version 0.1.2 to 0.1.3, but a feature with version 0.2.1 already exists, this option is for you.

In that scenario:
 * Without 'checkOnlyIncrementColumn': 0.1.2 (increment:build) -> 0.2.2
 * With 'checkOnlyIncrementColumn': 0.1.2 (increment:build) -> 0.1.3 (intended)

This is useful to keep enabled if you or your team peforms hotfixes using version tags.

##### options.git.createTag

Type: `Boolean`
Default value: `true`

Git option to create (and commit) a tag automatically when updating the package version.

Requires options.gitTags to be set to `true`.

##### options.git.projectDirectory

Type: `String`
Default value: `.`

The path to the project directory that contains the git repository.

##### options.git.pullBeforeCheck

Type: `Boolean`
Default value: `true`

Git option to fetch tags before continuing with creating a new version+tag.

Requires options.gitTags to be set to `true`.

##### options.git.pushAfterTag

Type: `Boolean`
Default value: `true`

Git option to push the tags back to the server upon versioning completion

Requires options.gitTags **and** options.git.createTag to be set to `true`.

##### options.git.tagFilterRegex

Type: `String`
Default value: `.+`

Regular expression used to select the version data from tags stored in the git repository. Used to filter unwanted data on tags.

## Release History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.2.2   | 2014-12-08 | Git version column incrementation limiting |
| 0.2.0   | 2014-12-01 | Version replacements in files |
| 0.1.6   | 2014-11-28 | Version zeroing |
| 0.1.5   | 2014-11-27 | Git push commits + tags |
| 0.1.4   | 2014-11-27 | Minor bug fixes |
| 0.1.2   | 2014-11-26 | Git tag support, Promises |
| 0.1.1   | 2014-11-25 | Initial stable build |