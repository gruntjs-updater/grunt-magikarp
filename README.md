# grunt-magikarp

> A Grunt-based NPM package version incrementation utility.

![Magikarp](http://perrymitchell.net/wp-content/uploads/2014/11/magikarp_small.png)

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
| 0.1.0   | 2014-11-25 | Initial stable build |