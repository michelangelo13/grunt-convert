/*
 * grunt-convert-xml
 * https://github.com/jonschlinkert/grunt-convert-xml
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var util = require('util');
  var parse = require('xml2js').parseString;
  var YAML = require('yamljs');
 
  grunt.registerMultiTask('convert', 'Convert XML to JSON.', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      inline: 2,
      space: 0
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {

      var srcFiles = f.src.filter(function(filepath) {
        // Verify that files exist. Warn if a source file/pattern was invalid.
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(grunt.file.read).join(grunt.util.normalizelf(grunt.util.linefeed)); // Read source files.

      if (f.src.length < 1) {
        // No src files, issued warn and goto next target.
        grunt.log.warn('Destination not written because no source files were found.');
        return;
      }

      // Check source format
      var srcType = f.src[0].split('.').pop();

      if(srcType === 'yml') {

        var json = JSON.stringify(YAML.load(f.src[0]), options.inline, options.spaces);
        saveFile(f, json);

      }  else if (srcType === 'json') {

        var yaml = YAML.stringify(JSON.parse(srcFiles), options.inline, options.spaces);
        saveFile(f, yaml);

      } else if (srcType === 'xml') {

        xml2jsonyml(srcFiles, f, options);

      }
    });
  });

  var saveFile = function(file, data) {
    grunt.verbose.writeln(util.inspect(data, 10, null).cyan);
    grunt.file.write(file.dest, data);
    grunt.log.ok('File "' + file.dest + '" converted.');
  };

  var xml2jsonyml = function(source, file, options) {

    // Check destination format and write to destination file.
    var type = file.dest.split('.').pop();

    return parse(source, function (err, result) {

      grunt.verbose.writeln(util.inspect(result, 10, null).cyan);

      // Stringify to JSON
      var data = JSON.stringify(result, null, options.spaces);

      if (type === 'yml') {
        var yaml = YAML.stringify(JSON.parse(data), options.inline, options.spaces);
        grunt.file.write(file.dest, yaml);
      } else {
        grunt.file.write(file.dest, data);
      }

      // Print a success message.
      grunt.log.ok('File "' + file.dest + '" converted.');

    });
  };

};