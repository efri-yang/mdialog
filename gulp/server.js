'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();



const conf = require('./config.js');



function server(){
	browserSync.init({
        server:{
            baseDir:conf.dest,
            directory:true
        }
    });
}




module.exports={
    reload:browserSync.reload,
    server:server
};