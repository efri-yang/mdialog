'use strict';

const gulp = require('gulp');
const filter = require('gulp-filter');
const changed = require('gulp-changed');
const gulpif=require("gulp-if");
const conf = require('./config.js');
const server = require("./server.js")


function others() {
    return gulp.src([conf.src + conf.mod + '/**/*', '!' + conf.src + conf.mod + '/**/*.{html,js,scss,css,sass,png,jpg,gif,jpeg,ico,eot,svg,ttf,woff}'])
        .pipe(filter(function(file) {
            return file.stat.isFile();
        }))
        .pipe(gulpif(conf.env==="d",changed(conf.dest+conf.mod)))
        .pipe(gulp.dest(conf.dest+conf.mod));
}
function cOthers() {
    return gulp.src([conf.src + conf.commonFile + '/**/*', '!' + conf.src + conf.commonFile + '/**/*.{html,js,scss,css,sass,png,jpg,gif,jpeg,ico,eot,svg,ttf,woff}'])
        .pipe(filter(function(file) {
            return file.stat.isFile();
        }))
        .pipe(gulpif(conf.env==="d",changed(conf.dest+conf.commonFile)))
        .pipe(gulp.dest(conf.dest+conf.commonFile));
}
module.exports ={
	other:others,
	cOther:cOthers
}