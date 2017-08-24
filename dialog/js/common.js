var test = "window";


;
(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        stack: {},
        zIndex: 100000,
        baseViewWidth:750,
        baseFontSize:75,
        defaults: {
            title: "",
            autoClose: false,
            pause: 2000,
            duration: 250,
            shade: true,
            width: "auto",
            height: "auto",
            maxWidth:"90%",
            maxHeight:"90%",
            animIn: "mDialogZoomIn",
            animOut: "mDialogZoomOut",
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
    var percentReg = /^((\d+\.?\d*)|(\d*\.\d+))\%$/;
    var stylesContentShow = {
        visibility: "visible",
        display: "block",
        clear: "both",
        float: "left"

    };
    var styleContentsHide = {
        visibility: "hidden",
        display: "none",
        float: "none"
    };


    var ExtraFunc = {
        colorToRgba: function(colorStr, opacity) {
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
        uuid: function() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        }
    };

    if (!$.fn.AnimationEnd) {
        $.fn.AnimationEnd = function(callback) {
            ExtraFunc.dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback);
            return this;
        };
    }
    if (!$.fn.TransitionEnd) {
        $.fn.TransitionEnd = function(callback) {
            ExtraFunc.dealCssEvent.call(this, ['webkitTransitionEnd', 'transitionend'], callback);
            return this;
        };
    }
    if (!$.fn.outerWidth) {
        ['width', 'height'].forEach(function(dimension) {
            var Dimension = dimension.replace(/./, function(m) {
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
    var createClass = function(options, type) {
        this.opts = $.extend({}, mDialog.defaults, options);
        this.opts._type = type;
        this._init();
    }
    createClass.prototype.test = 100;
    createClass.prototype._init = function() {
        // type confirm   toast  msg  load

        //如果是{} new Object 对象
        this.opts.uid = ExtraFunc.uuid();
        mDialog.stack[this.opts.uid] = [];

        if (!this.opts.duration) {
            this.opts.animIn = this.opts.animOut = false;
        }
        this._renderContainer();

        if (!!this.opts.shade) {
            this._renderShade();
        }

    }
    createClass.prototype._renderContainer = function() {
        console.dir(this.opts)
        var _this = this,
            opts = this.opts,
            containerStr = "",
            title="",
            content = "",
            containerCloseHandle,
            contentObjHandle;
        var $main;

        this.$container = null;
        this.$containerInner=null;
        title=this._title(opts);


        if (!opts._type) {
            //如果没有type参数,那么说明 调用的方式是open() 
            //判断 content的内容是不是页面的元素内容
            if (opts.content instanceof $ || $.zepto.isZ(opts.content)) {
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                this.$container = $('<div class="mDialog-layer-container"></div>');
                this.$title=$(title);
                opts.content.css(stylesContentShow)
                opts.content.wrap('<div class="mDialog-layer-main"></div>')
                this.$main = opts.content.parent();
                this.$main.wrap(this.$container);
               

                !!title && this.$container.prepend(this.$title)
                contentObjHandle = function() {
                    _this.$main.siblings().remove();
                    opts.content.css(styleContentsHide);
                    for (var i = 0; i < 2; i++) {
                        opts.content.unwrap();
                    }
                }
            } else {

                //如果内容是其他的文本
                content = '<div class="mDialog-default-box">' + opts.content + '</div>';

            }
        } else {
            switch (opts._type) {
                case "load":
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
                    content = '<div class="mDialog-loading-section' + (!opts.text ? ' loading-notext' : '') + '"><div class="loading-icon"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>' + (!!opts.text ? (typeof opts.text == "string" ? '<p class="loading-txt">' + opts.text + '</p>' : '<p class="loading-txt">加载中...</p>') : '') + '</div>';
                    break;
            }

        }


        containerStr = '<div class="mDialog-layer-container">' +
            
            title+
            '<div class="mDialog-layer-main">' +
            content +
            '</div>' +
            '<div class="mDialog-layer-btn"></div>' +
            '<div class="mDialog-close"></div>'+
           
            '</div>';

        if (!this.$container) {
            this.$container = $(containerStr);
            this.$containerInner=this.$container.children().eq(0);
            this.$container.appendTo($('body')); 
            this.$title=this.$container.children('.mDialog-layer-title');
            this.$footer=this.$container.children('.mDialog-layer-btn');
            this.$main=this.$container.children('.mDialog-layer-main');  
        }
        containerCloseHandle = function() {

            !!opts.onBeforeClose && opts.onBeforeClose();

            if (opts.animOut) {

                this._setAnim(this.$container, opts.animIn, opts.animOut, opts.duration, "out", function() {
                    // this -》 window

                    !!contentObjHandle && contentObjHandle();
                    _this.$container.remove();
                    opts.onClose();
                });
            } else {
                setTimeout(function() {
                    !!contentObjHandle && contentObjHandle();
                    _this.$container.remove();
                    opts.onClose();
                })
            }

        }






        this._setElemPos(this.$container,opts.width,opts.height,opts.maxWidth,opts.maxHeight,this.$title,this.$main,this.$footer);

        !!opts.onBeforeShow && opts.onBeforeShow();

        this.$container.css({ "zIndex": mDialog.zIndex + 1, "visibility": "visible" });
        if (opts.animIn) {
            this._setAnim(this.$container, opts.animIn, opts.animOut, opts.duration, "in", opts.onShow);
        } else {
            setTimeout(function() {
                !!opts.onShow && opts.onShow();
            })
        }
        this.$container.removeSelf = containerCloseHandle;
        mDialog.stack[this.opts.uid].push(this.$container);
    };


    
    createClass.prototype._title = function(opts) {
        var title="";
        if(!!opts.title){
            if($.isPlainObject(opts.title)){
                title='<div class="mDialog-layer-title '+opts.className+' style='+opts.style+'">'+opts.title+'</div>'
            }else{
                title='<div class="mDialog-layer-title">'+opts.title+'</div>';
            }        
        }
        return title; 
    };

    createClass.prototype._content = function() {

    };
    createClass.prototype._footer = function() {

    };
    createClass.prototype._renderShade = function() {
        //opts.shade=true 如果需要遮罩
        var _this = this,
            opts=this.opts;
            defaultOpacity = 0.5,
            defaultColor = "#000",
            shadeCloseHandle = $.noop();
        styles = {
            "animation-duration": this.opts.duration + "ms",
            "zIndex": mDialog.zIndex,
        };
        this.$shade = $('<div class="mDialog-shade in"></div>');

        //如果是{color:"",opacity:""} 传入的是颜色和透明值
        ropacity = !!opts.shade.opacity ? opts.shade.opacity : defaultOpacity;
        rcolor = !!opts.shade.defaultColor ? opts.shade.defaultColor : defaultColor;
        styles["background-color"] = ExtraFunc.colorToRgba(rcolor, ropacity);


        if (this.opts.shadeClose) {
            //如果需要点击关闭遮罩层, 遮罩要关闭，主体要关闭
            shadeCloseHandle = function() {
                if (!!opts.duration) {
                    !!_this.$shade && _this.$shade.removeClass("in").addClass('out');
                    _this.$shade.AnimationEnd(function() {
                        _this.$shade.remove();
                    })
                } else {
                    _this.$shade.remove();
                }
            }
            this.$shade.on("click touchstart", function(event) {
                event.preventDefault();
                event.stopPropagation();
                _this.close();
            })
        } else {
            this.$shade.on("click touchstart", function(event) {
                event.preventDefault();
                event.stopPropagation();
            })
        }
        this.$shade.css(styles);
        this.$shade.removeSelf = shadeCloseHandle;
        this.$shade.appendTo($("body"));
        mDialog.stack[this.opts.uid].push(this.$shade);
    };


    createClass.prototype._setElemPos = function($elem,width,height,maxWidth,maxHeight,$title,$main,$footer) {
        //maxWidth、maxHeight 传递进来的值可能是  auto  80%  400px  8rem;
        //width、height  传递进来的值可能是  auto  80%  400px  8rem;
        width=!!width ? width : "auto";
        height=!!height ? height : "auto"; 
        maxWidth=!!maxWidth ? maxWidth : "90%";
        maxHeight=!!maxHeight ? maxHeight :"90%";


        var elemW,elemH,winW,winH,titleH=0,contentH=0,footerH=0,
            standardPixRadio;//flexible 基准缩放比
        var isFlexible=!!(document.documentElement.style.fontSize && document.body.style.fontSize);
        var unitRemPx=isFlexible ? "rem" :"px";

       

        winW=parseInt($(window).width());
        winH=parseInt($(window).height());
        elemW=parseInt($elem.outerWidth());
        elemH=parseInt($elem.outerHeight());

        //有定义的width 以定义的width 为标准  没有的话那么就应该以container 的自身宽高为准
        width=(width=="auto") ? elemW : width;
        height=(height=="auto") ? elemH : height;
        standardPixRadio=mDialog.baseViewWidth/winW
       


        
        //百分比的时候 换算成 px;
        maxW=percentReg.test(maxWidth) ? winW*parseInt(maxWidth)/100 : parseInt(maxWidth);
        maxH=percentReg.test(maxHeight) ? winH*parseInt(maxHeight)/100 : parseInt(maxHeight);
        width=percentReg.test(width) ? winW*parseInt(width)/100 : parseInt(width);
        height=percentReg.test(height) ? winW*parseInt(height)/100 : parseInt(height);

        titleH=!!$title && $title.length && parseInt($title.height());
        footerH=!!$footer && $footer.length && parseInt($footer.height());

        if(isFlexible){

            width=width/mDialog.baseFontSize*standardPixRadio;
            height=height/mDialog.baseFontSize*standardPixRadio;
            maxW=maxW/mDialog.baseFontSize*standardPixRadio;
            maxH=maxH/mDialog.baseFontSize*standardPixRadio;
        }




        width=(width > maxW) ? maxW :width;

        if(height > maxH){
            height=maxH;

            if(!!titleH){
                titleH=isFlexible ? (titleH/mDialog.baseFontSize)*standardPixRadio : titleH;
            }
            
            if(!!footerH){
                footerH=isFlexible ? (footerH/mDialog.baseFontSize)*standardPixRadio : footerH;
            }
            $main.addClass('mDialog-layer-main-full').css({height:(height-titleH-footerH)+unitRemPx})
        }

       

    
        $elem.css({
            left: "50%",
            top: "50%",
            width:width+unitRemPx,
            height:height+unitRemPx,
            "marginLeft": -width / 2 + unitRemPx,
            "marginTop": -height / 2 + unitRemPx
        })
    }


    createClass.prototype._setAnim = function($elem, animInClass, animOutClass, duration, type, callback) {
        animInClass = !!animInClass ? animInClass : "";
        animOutClass = !!animOutClass ? animOutClass : "";
        switch (type) {
            case "in":
                $elem.css({ "animation-duration": duration + "ms" }).removeClass(animOutClass).addClass(animInClass);
                break;
            case "out":
                $elem.removeClass(animInClass).addClass(animOutClass);
                break;
            default:
                $elem.css({ "animation-duration": duration + "ms" }).removeClass(animOutClass).addClass(animInClass);
        }
        $elem.AnimationEnd(function() {
            !!callback && callback.call();
        })
    }

    /**
     * *
     * 通过调用 mDialog.close() 来关闭
     */
    createClass.prototype.close = function(index) {
        var _this = this;
        sindex = !!index ? index : this.opts.uid;
        $.each(mDialog.stack[sindex], function(index, obj) {
            obj.removeSelf.call(_this);
            if (index == mDialog.stack[sindex].length - 1) {
                delete mDialog.stack[sindex];
            }
        });

    };





    mDialog.open = function(options, type) {
        mDialog.zIndex++;
        var o = new createClass(options, type);
        return o;
    };

    mDialog.load = function(opts) {
        //load加载弹出框 不需要  title(标题) 关闭按钮(closeBnt)  button(按钮组)
        //参数 是否显示遮罩  是否显示文字
        var options = !!$.isPlainObject(opts) ? opts : {};
        options.title = false;
        options.closeBtn = false;
        options.buttons = false;
        options.text = options.text === undefined ? true : (!!options.text ? options.text : false);
        mDialog.open(options, "load")
    };
    mDialog.confirm = function(opts) {

    }

    // mDialog.close = function(index) {

    // };
    // mDialog.update = function(options) {

    // };

    window.mDialog = mDialog;
})(window.jQuery || window.Zepto, window, document);

/**
 * 
 */