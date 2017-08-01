'use strict';

const gulp = require('gulp');

const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const changed = require('gulp-changed');


const conf = require('./config.js');
const server = require("./server.js");


function scripts(){
    var compress=conf.compress==true || conf.compress=="js";
    return gulp.src(conf.src + conf.mod + '/**/*.js')
        .pipe(gulpif(compress, uglify()))
        .pipe(gulpif(conf.env==="d",changed(conf.dest)))
        .pipe(gulp.dest(conf.dest+conf.mod))
        .pipe(server.reload({ stream: true }));

}

function cScripts(){
    return gulp.src(conf.src + conf.commonFile + '/**/*.js')
        .pipe(gulpif(conf.compress, uglify()))
        .pipe(gulpif(conf.env==="d",changed(conf.dest)))
        .pipe(gulp.dest(conf.dest+conf.commonFile))
        .pipe(server.reload({ stream: true }));

}

// function scriptsDist() {
//     return gulp.src(c_paths.src + '/**/*.js')
//         .pipe(changed(c_paths.dist))
//         .pipe(gulpif(options.env === 'production', uglify()))
//         // .pipe(debug({title: 'scriptsDist-------------'}))
//         .pipe(gulp.dest(c_paths.dist))
//         .pipe(server.reload({ stream: true }));

// }

module.exports={
	script:scripts,
	cScript:cScripts
};
