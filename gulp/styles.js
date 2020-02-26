'user strict';

const gulp=require("gulp");


const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

const rev = require('gulp-rev');  

const debug=require('gulp-debug');
const changed = require('gulp-changed');

const cleanCSS = require("gulp-clean-css");

const conf = require('./config.js');
const gulpif=require("gulp-if");

const server=require("./server.js");
/**
 * gulp-changed 这个时候不起作用 所以没用,
 * 这样书写基本问题提，只是某个.scss 修改了，所有的.css 会被拷贝,
 * 但是想想 囚scss 改变 那么引入的scss 确实要相应的改变，也还好
 * 
 */
function styles(){
	var compress=conf.compress==true || conf.compress=="css";
	return gulp.src(conf.src + conf.mod + '/**/*.{scss,sass,css}')
		.pipe(gulpif(conf.env==="d",sourcemaps.init({sourcemap:true})))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpif(conf.env==="d",sourcemaps.write({includeContent: false})))
		.pipe(autoprefixer({
			browsers: ['> 1%', 'IE 7']
		}))
		.pipe(gulpif(compress,cleanCSS()))
		.pipe(gulp.dest(conf.dest + conf.mod))
		.pipe(server.reload({stream:true}));
}

function cStyles(){
	return gulp.src(conf.src + conf.commonFile + '/**/*.{scss,sass,css}')
		.pipe(gulpif(conf.env==="d",sourcemaps.init({sourcemap:true})))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpif(conf.env==="d",sourcemaps.write({includeContent: false})))
		.pipe(autoprefixer({
			browsers: ['> 1%', 'IE 7']
		}))
		.pipe(gulpif(conf.compress,cleanCSS()))
		.pipe(gulp.dest(conf.dest + conf.commonFile))
		.pipe(server.reload({stream:true}));
}



module.exports={
	style:styles,
	cStyle:cStyles
};