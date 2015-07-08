/*
 * Infobox Importer Script for Japanese Wikias
 * Per Johan Groland <pgroland@wikia-inc.com>
 *
 */

var gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , exec = require('child_process').exec;

var options = {
    path: './infoboximporter.js',
    execArgv: [ '--harmony' ],
    scriptArgv: [ '-i' ]
};

gulp.task('lint', function () {
    gulp.src(['./infoboximporter.js', './src/**/*.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('run', [ 'lint' ], function (cb) {
  exec('node ' + options.execArgv + ' ' + options.path + ' ' + options.scriptArgv,
    function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    }
  );
});

gulp.task('default', [ 'run'  ], function () {
  gulp.watch( [ './infoboximporter.js', './src/**/*.js' ], [ 'run' ] );
});
