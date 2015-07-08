/*
 * Infobox Importer Script for Japanese Wikias
 * Per Johan Groland <pgroland@wikia-inc.com>
 *
 */
"use strict";

var opts = require("nomnom")
   .option('interactive', {
      abbr: 'i',
      flag: true,
      help: 'Run in interactive mode'
   })
   .option('config', {
      abbr: 'c',
      default: 'config.json',
      help: 'JSON file with configuration'
   })
   .option('version', {
      flag: true,
      help: 'print version and exit',
      callback: function() {
         return "version 1.2.4";
      }
   });

function parseOptions() {
    return opts.parse();
}

exports.parseOptions = parseOptions;
