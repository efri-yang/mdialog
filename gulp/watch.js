'use strict';

const gulp=require("gulp");
const watch=require("gulp-watch");



const server = require('./server');


const htmls = require('./htmls');
const styles = require('./styles');
const scripts = require('./scripts');
const images = require('./images');
const others=require('./others');


const conf = require('./config.js');

/**
 *
 * gulp.watch 官方api 只能监听到文件修改change 添加add 事件 所以换了gulp-watch
 *
 * gulp-watch的watch事件：events: [ 'add', 'change', 'unlink' ],
 *
 * 
 */
function watchs(){
	/**
	 * 只能用on 绑定 change属性
	 */
	gulp.watch([conf.src + '/**/*.html',"!" + conf.src + '/**/_*.html']).on("change",gulp.series(htmls.html,htmls.cHtml,server.reload));

	gulp.watch(conf.src + '/**/_*.html').on("change",gulp.series(htmls.html,htmls.cHtml,server.reload));



	/**
	 * 改变一个。scss 对应的文件夹会被改变
	 */
	gulp.watch(conf.src+"/**/*.{scss,sass,css}",gulp.series(styles.style,styles.cStyle));


	gulp.watch(conf.src+'/**/*.{png,jpg,gif,jpeg,ico,eot,svg,ttf,woff}',gulp.series(images.image,images.cImage));

	gulp.watch(conf.src+'/**/*.js',gulp.series(scripts.script,scripts.cScript))

	gulp.watch([conf.src + '/**/*', '!' +conf.src + '/**/*.{html,js,scss,css,sass,png,jpg,gif,jpeg,ico,eot,svg,ttf,woff}'],gulp.series(others.other,others.cOther))

}


module.exports =watchs;