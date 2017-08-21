'use strict';

const gulp=require("gulp");
const del=require("del");
const gulpif=require("gulp-if");


const conf=require("./config");

var delDest=(conf.env==="d") ? conf.dest : (conf.dest + conf.mod);

function clean(){
	return del(delDest);
}


module.exports=clean;