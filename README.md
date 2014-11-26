# grunt-magikarp

> A Grunt-based NPM package version incrementation utility.

![Magikarp](http://perrymitchell.net/wp-content/uploads/2014/11/magikarp_small.png)

## About
Magikarp (besides being a Pokemon) is a grunt utility for incrementing package versions. It supports incrementing any column (build/minor/major), as well as maximum value limits on build and minor columns.

Why start a new plugin for something that has already done? I didn't like the way the others functioned, so here's my take on the task.

[![Build Status](http://penkins.doomdns.org/buildStatus/icon?job=grunt-magikarp)](http://penkins.doomdns.org/job/grunt-magikarp/) [![npm version](https://badge.fury.io/js/grunt-magikarp.svg)](http://badge.fury.io/js/grunt-magikarp) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM](https://nodei.co/npm/grunt-magikarp.png?downloads=true&downloadRank=true)](https://nodei.co/npm/grunt-magikarp/)

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install magikarp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('magikarp');
```

## The "magikarp" task

### Overview
Magikarp takes some basic options (what to increment, limits etc.) as well as a target directory (that contains a package.json file).

```js
grunt.initConfig({
	magikarp: {
		options: {
			increment: "build",
			limits: {
				build: 0,
				minor: 0
			}
		},
		targetDirectory: "."
	},
});
```

### Options

#### options.increment
Type: `String`
Default value: `build`

A string that determines what to increment. Can be 'build', 'minor' or 'major'.

#### options.limits.build
Type: `Integer`
Default value: `0`

The maximum value of the build column when incrementing. 0 is equivalent to unlimited.

#### options.limits.minor
Type: `Integer`
Default value: `0`

The maximum value of the minor column when incrementing. 0 is equivalent to unlimited.

#### targetDirectory
Type: `String`
Default value: `.`

The directory containing the package.json file, usually an NPM project.

## Release History

| Version | Date       | Changes |
|---------|------------|---------|
| 0.1.2   | 2014-11-26 | Git tag support |
| 0.1.1   | 2014-11-25 | Initial stable build |