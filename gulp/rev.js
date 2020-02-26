'user strict';

const gulp=require("gulp");
const revCollector = require('gulp-rev-collector');
const conf=require("./config.js");
const debug=require('gulp-debug');

function revFunc(){
	return gulp.src([conf.src + conf.mod + '/**/*.html',"!" + conf.src + conf.mod + '/**/_*.html'])
		.pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'css': '/dist/css',
                '/js/': '/dist/js/',
                'cdn/': function(manifest_value) {
                    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                }
            }
        }) )
        .pipe(debug({title: 'revFunc-------------'}))
        .pipe(gulp.dest(conf.dest + conf.mod));
}

module.exports={
	rev:revFunc
};