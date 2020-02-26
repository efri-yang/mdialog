const cpaths=require("./paths.js");
const minimist = require('minimist');
const knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'd' }
};
/**
 *development 开发环境 d
 * 打包的时候需要输入 --env p   production 生产环境
 * 压缩的时候 默认是压缩js 和 css 的
 * @type {[type]}
 */


var options = minimist(process.argv.slice(2), knownOptions);
var c=!!options.compress  ? options.compress.toLowerCase() :"";

options.src=cpaths.src;
options.dest=(options.env=="p") ? cpaths.dist : cpaths.dev;
//打包过个模块的时候
options.mod=options.mod ? ((options.mod==="all") ? "" :"/"+options.mod) :"";
options.compress=(options.env==="d") ? false : (c==undefined) ? true : c;
options.commonFile=cpaths.commonFile;
/**
 * {
 * 	dest:
 * 	mod:
 * 	compress:
 * 	env:
 * 	comomonFile
 * }
 */
module.exports = options;
