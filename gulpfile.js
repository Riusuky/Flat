/**
* Plugins
*/
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const babel = require("gulp-babel");
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const uglify = require('gulp-uglify');
const pump = require('pump');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');


/**
* Paths
*/
const BASE_PATHS = {
    NODE: 'node_modules/',
    SRC: 'src/',
    DEST: 'build/',
    DEPENDENCIES: 'dependencies/'
};

const PATHS = {
    JS_DEPENDENCIES: ['underscore/underscore-min.js'], //'backbone/backbone-min.js', 'underscore/underscore-min.js', 'jquery/dist/jquery.min.js'
    JS: ['classes/*.js', '*.js']
};


/**
* Tasks
*/
gulp.task('update-dependencies-js', function(callback) {
    pump([
        gulp.src(PATHS.JS_DEPENDENCIES, { cwd: BASE_PATHS.NODE }),
        gulp.dest(BASE_PATHS.DEPENDENCIES)
    ], callback);
});

gulp.task('clean-dest', function() {
    del.sync(`${BASE_PATHS.DEST}**`, {force:true});
});

gulp.task("process-js", function (callback) {
    pump([
        gulp.src(PATHS.JS, { cwd: BASE_PATHS.SRC }),
        jshint({ esversion: 6 }),
        jshint.reporter(stylish),
        sourcemaps.init(),
        babel({ presets: ["es2015"] }),
        // uglify(),
        concat('flat-engine.min.js'),
        sourcemaps.write(),
        gulp.dest(BASE_PATHS.DEST)
    ], callback);
});

gulp.task('watch', function() {
  gulp.watch(PATHS.JS, { cwd: BASE_PATHS.SRC }, ['process-js']);
});

gulp.task('update-dependencies', ['update-dependencies-css', 'update-dependencies-js']);

gulp.task('default', ['process-js']);
