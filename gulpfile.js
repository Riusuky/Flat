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
    DEST: 'public/',
    CSS: 'css/',
    STYLUS: 'css/stylus/',
    JS: 'js/',
    LIBS: 'js/libs/'
};

const PATHS = {
    CSS_DEPENDENCIES: ['normalize.css/normalize.css'],
    JS_DEPENDENCIES: ['backbone/backbone-min.js', 'underscore/underscore-min.js', 'jquery/dist/jquery.min.js'],
    STYLUS: ['*.styl'],
    INDEX: ['index.html'],
    PROCESSED_CSS: ['**/*.min.css'],
    JS: ['**/*.js', '!libs/*', '!**/*.min.js'],
    PROCESSED_JS: ['*.min.js', 'libs/*.js']
};


/**
* Tasks
*/
gulp.task('update-dependencies-css', function(callback) {
    pump([
        gulp.src(PATHS.CSS_DEPENDENCIES, { cwd: BASE_PATHS.NODE }),
        cleanCSS(),
        rename({ suffix: '.min' }),
        gulp.dest(BASE_PATHS.SRC + BASE_PATHS.CSS)
    ], callback);
});

gulp.task('update-dependencies-js', function(callback) {
    pump([
        gulp.src(PATHS.JS_DEPENDENCIES, { cwd: BASE_PATHS.NODE }),
        gulp.dest(BASE_PATHS.SRC + BASE_PATHS.LIBS)
    ], callback);
});

gulp.task('stylus', function(callback) {
    pump([
        gulp.src(BASE_PATHS.STYLUS+'editor.styl', { cwd: BASE_PATHS.SRC }),
        stylus(),
        autoprefixer(),
        gulp.dest(BASE_PATHS.CSS, { cwd: BASE_PATHS.SRC }),
        cleanCSS(),
        rename({ suffix: '.min' }),
        gulp.dest(BASE_PATHS.CSS, { cwd: BASE_PATHS.SRC })
    ], callback);
});

gulp.task('clean-dest', function() {
    del.sync(`${BASE_PATHS.DEST}**`, {force:true});
});

gulp.task('copy-css', function(callback) {
    pump([
        gulp.src(PATHS.PROCESSED_CSS, { cwd: BASE_PATHS.SRC, base: BASE_PATHS.SRC }),
        gulp.dest(BASE_PATHS.DEST)
    ], callback);
});

gulp.task('copy-js', function(callback) {
    pump([
        gulp.src(PATHS.PROCESSED_JS, { cwd: BASE_PATHS.SRC+BASE_PATHS.JS, base: BASE_PATHS.SRC+BASE_PATHS.JS }),
        gulp.dest(BASE_PATHS.DEST+BASE_PATHS.JS)
    ], callback);
});

gulp.task("process-js", function (callback) {
    pump([
        gulp.src(PATHS.JS, { cwd: BASE_PATHS.SRC+BASE_PATHS.JS }),
        jshint({ esversion: 6 }),
        jshint.reporter(stylish),
        sourcemaps.init(),
        babel({ presets: ["es2015"] }),
        // uglify(),
        concat('manager.min.js'),
        sourcemaps.write(),
        gulp.dest(BASE_PATHS.SRC+BASE_PATHS.JS)
    ], callback);
});

gulp.task('index', function(callback) {
    let currentTime = new Date();
    let dd = currentTime.getDate();
    dd = ((dd < 10) ? '0' : '') + dd;

    let mm = currentTime.getMonth()+1;
    mm = ((mm < 10) ? '0' : '') + mm;

    let yyyy = currentTime.getFullYear();

    pump([
        gulp.src(PATHS.INDEX, { cwd: BASE_PATHS.SRC }),
        replace(/%UPDATE_DATE%/g, `${dd}/${mm}/${yyyy}`),
        htmlmin({collapseWhitespace: true}),
        gulp.dest(BASE_PATHS.DEST)
    ], callback);
});

gulp.task('watch', function() {
  gulp.watch(PATHS.STYLUS, { cwd: BASE_PATHS.SRC+BASE_PATHS.STYLUS }, ['stylus']);
  gulp.watch(PATHS.JS, { cwd: BASE_PATHS.SRC+BASE_PATHS.JS }, ['process-js']);
});

gulp.task('update-dependencies', ['update-dependencies-css', 'update-dependencies-js']);

gulp.task('deploy', ['clean-dest', 'stylus', 'index', 'copy-css', 'copy-js']);
