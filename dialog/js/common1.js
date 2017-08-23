
var test="window";


;(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        stack:{},
        zIndex:100000,
        defaults: {
            title: "mDialog标题",
            autoClose: false,
            pause: 2000,
            duration:250,
            shade: true,
            width:"auto",
            height:"auto",
            animIn:"mDialogZoomIn",
            animOut:"mDialogZoomOut",
            shadeClose: true,
            content: "",
            closeBtn: true,
            buttons: {},
            onBeforeShow: function() {
                console.dir("onBeforeShow");
            },
            onShow: function() {
                console.dir("oShow");
            },
            onBeforeClose: function() {
                console.dir("onBeforeClose");
            },
            onClose: function() {
                console.dir("onClose");
            }
        }
    }
    var colorRgbReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; //验证正则
    var stylesContentShow={
        visibility:"visible",
        display:"block",
        clear:"both",
        float:"left"
        
    };
    var styleContentsHide={
        visibility:"hidden",
        display:"none",
        float:"none"
    };

   
    var ExtraFunc = {
        colorToRgba: function(colorStr,opacity) {
            colorStr = !!colorStr ? colorStr : "#000";
            var sColor = colorStr.toLowerCase();
            //没有传递，那么默认的是
            var sOpacity = (opacity === 0 || !!opacity) ? ((opacity > 1) ? 1 : ((opacity < 0) ? 0 : opacity)) : 0.8;
            if (sColor && colorRgbReg.test(sColor)) {
                if (sColor.length === 4) {
                    var sColorNew = "#";
                    for (var i = 1; i < 4; i += 1) {
                        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                    }
                    sColor = sColorNew;
                }
                //处理六位的颜色值  
                var sColorChange = [];
                for (var i = 1; i < 7; i += 2) {
                    sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
                }
                return "rgba(" + sColorChange.join(",") + "," + sOpacity + ")";
            } else {
                return sColor;
            }
        },
        dealCssEvent(eventNameArr, callback) {
            var events = eventNameArr,
                i, dom = this; // jshint ignore:line

            function fireCallBack(e) {
                /*jshint validthis:true */
                if (e.target !== this) return;
                callback.call(this, e);
                for (i = 0; i < events.length; i++) {
                    dom.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    dom.on(events[i], fireCallBack);
                }
            }
        },
        uuid:function(){
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";
         
            var uuid = s.join("");
            return uuid;
        }
    };

    if(!$.fn.AnimationEnd){
        $.fn.AnimationEnd = function(callback) {
            ExtraFunc.dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback);
            return this;
        };
    }
    if(!$.fn.TransitionEnd){
        $.fn.TransitionEnd = function(callback) {
            ExtraFunc.dealCssEvent.call(this, ['webkitTransitionEnd', 'transitionend'], callback);
            return this;
        };
    }
    if(!$.fn.outerWidth){
        ['width', 'height'].forEach(function(dimension) {
            var  Dimension = dimension.replace(/./, function(m) {
                return m[0].toUpperCase();
            });
            $.fn['outer' + Dimension] = function(margin) {
                var elem = this;
                if (elem) {
                    var size = elem[dimension]();
                    var sides = {
                        'width': ['left', 'right'],
                        'height': ['top', 'bottom']
                    };
                    sides[dimension].forEach(function(side) {
                        if (margin) size += parseInt(elem.css('margin-' + side), 10);
                    });
                    return size;
                } else {
                    return null;
                }
            };
        });
    }
    var createClass = function(options,type) {
        this.opts = $.extend(true, mDialog.defaults, options);
        this.opts._type=type;
        this._init();
    }
    createClass.prototype.test=100;
    createClass.prototype._init = function() {
        // type confirm   toast  msg  load

        //如果是{} new Object 对象
        this.opts.uid=ExtraFunc.uuid();
        mDialog.stack[this.opts.uid]=[];

        if(!this.opts.duration){
            this.opts.animIn=this.opts.animOut=false;
        }
        this._renderContainer(this.opts);
        if (!!this.opts.shade) {
            this._renderShade();
        }
        
    }
    createClass.prototype._renderContainer=function(){
        var _this=this,
            containerStr="",
            content="",
            containerCloseHandle,
            contentObjHandle;

        this.$container=null;

      
        if(!this.opts._type){
            //如果没有type参数,那么说明 调用的方式是open() 
            //判断 content的内容是不是页面的元素内容
            this.$container=$('<div class="mDialog-layer-container"></div>')
            if(this.opts.content instanceof $ || $.zepto.isZ(this.opts.content)){
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                this.opts.content.css(stylesContentShow)
                this.opts.content.wrap('<div class="mDialog-layer-main"></div>')
                this.$main=this.opts.content.parent();
                this.$main.wrap(this.$container);
                contentObjHandle=function(){
                    _this.opts.content.css(styleContentsHide);
                    for(var i=0;i<2;i++){
                        _this.opts.content.unwrap();
                    }
                }
            }else{
                //如果内容是其他的文本
                content='<div class="mDialog-default-main">'+this.opts.content+'</div>'
            }
        }else{

            if(this.opts._type=="load"){
                //加载提示弹出框
                /**
                 * 参数 
                 *     {
                 *         content:"",
                 *         text:true,  //显示icon和文字
                 *         autoClose:false,  //不会自动关闭
                 *         title:false, //不会显示标题
                 *         closeButton:false, //不会显示关闭按钮
                 *         buttons:false, // 不会显示默认的按钮集
                 *         
                 *      }  
                 *     
                 * 固定 
                 *     水平垂直居中
                 * 动态 
                 *    {
                 *        text:true, //用户传递文字或者是否显示文字
                 *        autoClose:false, //是否自动关闭
                 *        pause: 2000, //停留多长时间后关闭
                 *    }
                 */
                content='<div class="mDialog-loading-section'+(!this.opts.text ? ' loading-notext' : '')+'"><div class="loading-icon"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'+(!!this.opts.text ? (typeof this.opts.text=="string" ? '<p class="loading-txt">'+this.opts.text+'</p>' : '<p class="loading-txt">加载中...</p>') : '')+'</div>'
            }else if(this.opts._type=="msg"){
                content='<div class="mDialog-msg-box">'+this.opts.content+'</div>';
            }else if(this.opts._type=="confirm"){

            }
        }
        containerStr='<div class="mDialog-layer-container">' +
                        '<div class="mDialog-layer-title"></div>' +
                        '<div class="mDialog-layer-main">'+
                            content+
                        '</div>'+ 
                        '<div class="mDialog-layer-btn"></div>' +
                      '</div>';






        if(!this.$container){
            this.$container=$(containerStr);
            this.$container.appendTo($('body'));
           
        }

        containerCloseHandle=function(){
            !!_this.opts.onBeforeClose && _this.opts.onBeforeClose();
            
            if(_this.opts.animOut){

                    _this._setAnim(_this.$container,_this.opts.animIn,_this.opts.animOut,_this.opts.duration,"out",function(){
                        !!contentObjHandle && contentObjHandle();
                        _this.$container.remove();
                        _this.opts.onClose();
                    });
            }else{
                setTimeout(function(){
                    !!contentObjHandle && contentObjHandle();
                    _this.$container.remove();
                    _this.opts.onClose();
                })
            }
            
        }
            
        

       


        this._setElemPos(this.$container);

        !!this.opts.onBeforeShow && this.opts.onBeforeShow();
         
        this.$container.css({"zIndex":mDialog.zIndex+1,"visibility":"visible"});
        if(this.opts.animIn){
            _this._setAnim(_this.$container,_this.opts.animIn,_this.opts.animOut,_this.opts.duration,"in",_this.opts.onShow);
        }else{
            setTimeout(function(){
                !!_this.opts.onShow && _this.opts.onShow();
            })
        }


        this.$container.removeSelf=containerCloseHandle;
        mDialog.stack[this.opts.uid].push(this.$container);  
        
       


        

        
            
        

               
        
    };
    createClass.prototype._title=function(){

    };

    createClass.prototype._content=function(){

    };
    createClass.prototype._footer=function(){

    };
    createClass.prototype._renderShade = function() {
            //opts.shade=true 如果需要遮罩
            var _this=this,
                defaultOpacity=0.5,
                defaultColor="#000",
                shadeCloseHandle=$.noop();
                styles={
                    "animation-duration":this.opts.duration+"ms",
                    "zIndex":mDialog.zIndex,
                };
            this.$shade = $('<div class="mDialog-shade in"></div>');
            
                //如果是{color:"",opacity:""} 传入的是颜色和透明值
            ropacity=!!this.opts.shade.opacity ? this.opts.shade.opacity : defaultOpacity;
            rcolor=!!this.opts.shade.defaultColor ?  this.opts.shade.defaultColor : defaultColor;
            styles["background-color"]=ExtraFunc.colorToRgba(rcolor,ropacity);
           

            if(this.opts.shadeClose){
                //如果需要点击关闭遮罩层, 遮罩要关闭，主体要关闭
                shadeCloseHandle=function(){
                    if(!!_this.opts.duration){
                        !!_this.$shade && _this.$shade.removeClass("in").addClass('out');
                         _this.$shade.AnimationEnd(function(){
                            _this.$shade.remove();
                        })
                    }else{
                        _this.$shade.remove();
                    }
                    
                   

                }
                this.$shade.on("click touchstart",function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    _this.close();
                })
            }else{
                this.$shade.on("click touchstart",function(event){
                    event.preventDefault();
                    event.stopPropagation();
                })
            }
            this.$shade.css(styles);
            this.$shade.removeSelf=shadeCloseHandle;
            this.$shade.appendTo($("body"));
            mDialog.stack[this.opts.uid].push(this.$shade);
    };

    
    createClass.prototype._setElemPos=function($elem){
        var width=$elem.outerWidth();
        var height=$elem.outerHeight();
        $elem.css({
            left:"50%",
            top:"50%",
            "marginLeft":-width/2+"px",
            "marginTop":-height/2+"px"
        })
    }
    createClass.prototype._setAnim=function($elem,animInClass,animOutClass,duration,type,callback){
        animInClass=!!animInClass ? animInClass :"";
        animOutClass=!!animOutClass ? animOutClass :"";
        switch(type){
            case "in":
               $elem.css({"animation-duration":duration+"ms"}).removeClass(animOutClass).addClass(animInClass);
               break;
            case "out":
               $elem.removeClass(animInClass).addClass(animOutClass);
               break;
            default:
               $elem.css({"animation-duration":duration+"ms"}).removeClass(animOutClass).addClass(animInClass);
        }
        $elem.AnimationEnd(function(){
            !!callback && callback();
        })
    }
    
    /**
     * *
     * 通过调用 mDialog.close() 来关闭
     */
    createClass.prototype.close = function(index) {
        var sindex=!!index ? index : this.opts.uid;
        $.each(mDialog.stack[sindex], function(index, obj) {
            obj.removeSelf();
            if(index==mDialog.stack[sindex].length-1){
               delete mDialog.stack[sindex];
            }
        });

    };





    mDialog.open = function(options,type) {
        mDialog.zIndex++;
        var o = new createClass(options,type);
        return o;
    };

    mDialog.load=function(opts){
        //load加载弹出框 不需要  title(标题) 关闭按钮(closeBnt)  button(按钮组)
        //参数 是否显示遮罩  是否显示文字
        var options=!!$.isPlainObject(opts) ? opts :{};
        options.title=false;
        options.closeBtn=false;
        options.buttons=false;
        options.text=options.text===undefined ? true : (!!options.text ? options.text :false);
        mDialog.open(options,"load")
    };
    mDialog.confirm=function(opts){

    }

    mDialog.close = function(index) {

    };
    mDialog.update = function(options) {

    };

    window.mDialog = mDialog;
})(window.jQuery || window.Zepto, window, document);

/**
 * 
 */


