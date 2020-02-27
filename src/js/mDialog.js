;(function (factory) {
	if (typeof define === 'function' && define.amd ) {
		define(['jquery'], function(jquery){
			// 返回构造函数
			factory(window.jQuery || window.Zepto, window, document); // 初始化插件	
		});
	}else if(typeof define === 'function' && define.cmd){
		define(['jquery'], function(require,exports,moudles){
			factory(require('jquery'),window, document); // 初始化插件
		})
	}else{
		factory(jQuery,window, document);
	}
})(function($, window, document,undefined){
    var mDialog = {
        v: '0.0.1',
        stack: {},
        zIndex: 100000,
        defaults: {
            title: "",
            pause: false,
            duration: 250,
            isPreventMove: true,
            shade: true,
            width: "auto",
            height: "auto",
            maxWidth: "85%",
            maxHeight: "80%",
            offset: ["auto", "auto"],
            animIn: "mDialogZoomIn",
            animOut: "mDialogZoomOut",
            shadeClose: true,
            content: "",
            closeBtn: true,
            buttons: {},
            baseViewWidth: 750,
            baseViewHeight: 1344,
            hasInput:false,
            onBeforeShow: function() {},
            onShow: function() {},
            onBeforeClose: function() {},
            onClose: function() {}
        }
    }
    var ExtraFunc = {
        colorToRgba: function(colorStr, opacity) {
            colorStr = !!colorStr ? colorStr : "#000";
            var sColor = colorStr.toLowerCase();
            //没有传递，那么默认的是
            var sOpacity = (opacity === 0 || !!opacity) ? ((opacity > 1) ? 1 : ((opacity <= 0) ? 0 : opacity)) : 0.8;
            if (sColor && /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(sColor)) {
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
         dealCssEvent:function(eventNameArr, callback,duration) {
            var events = eventNameArr,
                called=false,
                Timer=null,
                i, dom = this; // jshint ignore:line

            function fireCallBack(e) {
                /*jshint validthis:true */
                called=true;
                if (e.target !== this) return;
                callback.call(this, e);
                for (i = 0; i < events.length; i++) {
                    dom.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    dom.on(events[i], fireCallBack);
                    Timer=setTimeout(function(){
                       clearTimeout(Timer);
                       !called &&callback();
                    },duration)
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
        },
        isPercent: function(str) {
            /*return /^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(str);*/
            return (typeof str == "string") ? ((str.indexOf("%") == -1) ? false : true) : false;
        },
        isRem: function(str) {
            // return /^((\d+\.?\d*rem)|(\d*\.\d+))*rem$/.test(str);
            return (typeof str == "string") ? ((str.indexOf("rem") == -1) ? false : true) : false;
        },
        isPx: function(str) {
            return (typeof str == "string") ? ((str.indexOf("px") == -1) ? false : true) : false;
        },
        removeAllSpace: function(str) {
            return str.replace(/\s+/g, "");
        },
        getNumber: function(str) {
            return str.match(/\d+(\.\d{0,2})?/)[0]
        }
    };

    var deviceUtil = (function() {
        var UA = window.navigator.userAgent,
            win = window,
            isAndroid = /android|adr/gi.test(UA),
            isIOS = /iphone|ipod|ipad/gi.test(UA) && !isAndroid,
            isIPhone = win.navigator.appVersion.match(/iphone/gi),
            isMobile = isAndroid || isIOS,
            isSupportTouch = "ontouchend" in document ? true : false;
        return {
            tapEvent: isMobile && isSupportTouch ? 'touchstart' : 'click',
            isIPhone: isIPhone
        }
    })();



    if (!$.fn.AnimationEnd) {
        $.fn.AnimationEnd = function(callback,duration) {
            var called=ExtraFunc.dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback,duration);
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

    function titleRender(opts) {
        var title = "";
        if (!!opts.title) {
            if ($.isPlainObject(opts.title)) {
                title = '<div class="mDialog-layer-title ' + (!!opts.title.className ? opts.title.className : '') + '" style="' + (!!opts.title.style ? opts.title.style : '') + '">' + opts.title.text + '</div>'
            } else {
                title = '<div class="mDialog-layer-title">' + opts.title + '</div>';
            }
        }
        return title;
    }

    function closeBtnRender(opts, indicator) {
        var $close = null;
        if (!!opts.closeBtn) {
            $close = $('<span class="mDialog-close"></span>');
            $close.on(deviceUtil.tapEvent, function() {

                indicator.close();
            })
        }
        return $close;

    };

    function buttonRender(opts, type, indicator) {
        var $btnContainer = ($.isArray(opts.buttons) || type == "confirm") ? $('<div class="mDialog-layer-btns"></div>') : null,
            _this = this;
        if ($.isArray(opts.buttons) && !!opts.buttons.length) {
            $.each(opts.buttons, function(index, obj) {
                obj.class = !!obj.class ? obj.class : "";
                var $btn = $('<a href="javascript:void(0);" class="mDialog-btn ' + (obj.className ? obj.className : "") + '">' + obj.text + '</a>');
                if (!!obj.callback) {
                    $btn.on(deviceUtil.tapEvent, function(event) {
                        event.preventDefault();
                        obj.callback.call(indicator);
                    })
                }
                $btn.appendTo($btnContainer);
            });
        }
        return $btnContainer;
    };

    function setElemPos($elem, opts, $title, $main, $footer) {
        //maxWidth、maxHeight 传递进来的值可能是  auto  80%  400px;
        //width、height  传递进来的值可能是  auto  80%  400px;

        var elemW, elemH, winW, winH, realW, realH, maxW, maxH, offsetX, isOffsetX, offsetY, isOffsetY, titleH = 0,
            contentH = 0,
            footerH = 0,
            fullClassName = "mDialog-layer-main-full",
            dpr, isFull, mainH,
            standardRatio, //flexible 基准缩放比
            isFlexible = !!(document.documentElement.style.fontSize && document.body.style.fontSize),
            unitRemPx = isFlexible ? "rem" : "px";

        winW = $(window).width();
        winH = $(window).height();
        dpr = document.documentElement.getAttribute('data-dpr');


        opts.offset[0] = (opts.offset[0] == "auto" || opts.offset[0] == "center") ? "auto" : ((opts.offset[0] == 0) ? "0px" : opts.offset[0].toLowerCase());
        opts.offset[1] = (opts.offset[1] == "auto" || opts.offset[1] == "center") ? "auto" : ((opts.offset[1] == 0) ? "0px" : opts.offset[1].toLowerCase());

        isOffsetX = (opts.offset[0] == "auto") ? false : true;
        isOffsetY = (opts.offset[1] == "auto") ? false : true;

        //进行宽度计算
        elemW = $elem.outerWidth();
        opts.maxWidth = !!opts.maxWidth ? ((opts.maxWidth == "auto") ? "85%" : opts.maxWidth) : "85%";
        maxW = ExtraFunc.isPx(opts.maxWidth) ? ExtraFunc.getNumber(opts.maxWidth) : winW * ExtraFunc.getNumber(opts.maxWidth) / 100;

        //对于百分比(%) auto px 的时候进行宽度的计算，
        if (opts.width == "auto" || !opts.width) {
            realW = (elemW > maxW) ? maxW : elemW;
            standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;
        } else if (ExtraFunc.isPercent(opts.width)) {
            realW = winW * ExtraFunc.getNumber(opts.width) / 100;
            if (realW > maxW) {
                realW = maxW;
            }
            standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;

        } else if (ExtraFunc.isPx(opts.width)) {
            realW = ExtraFunc.getNumber(opts.width);
            if (isFlexible) {
                if (realW > opts.baseViewWidth * ExtraFunc.getNumber(opts.maxWidth) / 100) {
                    realW = maxW;
                    standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;
                } else {
                    standardRatio = opts.baseViewWidth;
                }
            } else {
                realW = (realW > winW) ? maxW : realW;
            }
        }
        if (isFlexible) {
            realW = realW / standardRatio * 10;
        }
        if (isOffsetX) {
            if (ExtraFunc.isPx(opts.offset[0])) {
                offsetX = ExtraFunc.isPx(opts.offset[0]) ? ExtraFunc.getNumber(opts.offset[0]) : winW * ExtraFunc.getNumber(opts.offset[0]) / 100;
                isFlexible && (offsetX = offsetX / standardRatio * 10);
                $elem.css({
                    left: offsetX + unitRemPx
                })
            } else if (ExtraFunc.isPercent(opts.offset[0])) {
                $elem.css({
                    left: opts.offset[0],
                })
            } else if (opts.offset[0] == "left") {
                $elem.css({
                    left: 0,
                })
            } else if (opts.offset[0] == "right") {
                $elem.css({
                    right: 0,
                })
            } else {
                $elem.css({
                    left: "50%",
                    "marginLeft": -realW / 2 + unitRemPx
                })
            }

        } else {
            $elem.css({
                left: "50%",
                "marginLeft": -realW / 2 + unitRemPx
            })
        }

        $elem.css({
            width: realW + unitRemPx,
        })



        elemH = $elem.outerHeight();
        opts.maxHeight = !!opts.maxHeight ? ((opts.maxHeight == "auto") ? "80%" : opts.maxHeight) : "80%";
        maxH = ExtraFunc.isPx(opts.maxHeight) ? ExtraFunc.getNumber(opts.maxHeight) : winH * ExtraFunc.getNumber(opts.maxHeight) / 100;

        if (opts.height == "auto" || !opts.height) {
            realH = (elemH > maxH) ? maxH : elemH;
            standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;
        } else if (ExtraFunc.isPercent(opts.height)) {
            realH = winH * ExtraFunc.getNumber(opts.height) / 100;
            if (realH > maxH) {
                realH = maxH;
            }
            standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;
        } else if (ExtraFunc.isPx(opts.height)) {
            realH = ExtraFunc.getNumber(opts.height);
            if (isFlexible) {
                if (realH > opts.baseViewHeight * ExtraFunc.getNumber(opts.maxHeight) / 100) {
                    realH = maxH;
                    standardRatio = (dpr == 1 && winW > 540) ? 540 : winW;
                } else {
                    standardRatio = opts.baseViewWidth;
                }
            } else {
                realH = (realH > maxH) ? maxH : realH;
            }
        }

        !!$title && !!$title.length && (titleH = $title.outerHeight());
        !!$footer && !!$footer.length && (footerH = $footer.outerHeight());
        mainH = ((realH - titleH - footerH) > 0) ? (realH - titleH - footerH) : 0;



        if (isFlexible) {
            realH = realH / standardRatio * 10;
            mainH = mainH / standardRatio * 10;
        }


        if ((realH > maxH) || elemH > realH) {
            $main.addClass(fullClassName);
        }
        if (opts.width == opts.height && opts.width == "100%") {
            $elem.addClass('mDialog-layer-container-full')
        }

        $main.css({
            height: mainH + unitRemPx
        });
        $elem.css({
            height: realH + unitRemPx
        });

        if (isOffsetY) {
            if (ExtraFunc.isPx(opts.offset[1])) {
                offsetY = ExtraFunc.isPx(opts.offset[1]) ? ExtraFunc.getNumber(opts.offset[1]) : winH * ExtraFunc.getNumber(opts.offset[1]) / 100;
                isFlexible && (offsetY = offsetY / standardRatio * 10);
                $elem.css({
                    top: offsetY + unitRemPx,
                })
            } else if (ExtraFunc.isPercent(opts.offset[1])) {
                $elem.css({
                    top: opts.offset[1],
                })
            } else if (opts.offset[1] == "top") {
                $elem.css({
                    top: 0
                })
            } else if (opts.offset[1] == "bottom") {
                $elem.css({
                    bottom: 0
                })
            } else {
                $elem.css({
                    top: "50%",
                    "marginTop": -realH / 2 + unitRemPx
                })
            }
        } else {
            $elem.css({
                top: "50%",
                "marginTop": -realH / 2 + unitRemPx
            })
        }
    };

    function setAnim($elem, animInClass, animOutClass, duration, type, callback) {
        var called = false;
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
        },duration)

    }

    var createClass = function(options, type) {
        this.opts = $.extend({}, mDialog.defaults, options);
        this.opts._type = type;
        this._init();
    };
    createClass.prototype._init = function() {
        this.opts.uid = ExtraFunc.uuid();
        this.opts.isAniming=false;
        this.opts.scrollTop=0;
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
        var _this = this,
            opts = this.opts,
            containerStr = "", //容器
            title = "", //标题
            content = "", //内容

            $container,
            $main,
            $closeBtn,
            $footerButton,

            containerClassName = "mDialog-layer-container",
            mainClassName = "mDialog-layer-main",
            titleClassName = "mDialog-layer-title",

            containerCloseHandle,
            contentCloseHandle;


        title = titleRender(opts);
        $closeBtn = closeBtnRender(opts, this);
        $footerButton = buttonRender(opts, this.opts, this);

        if (!opts._type) {
            //如果没有type参数,那么说明 调用的方式是open() 
            //判断 content的内容是不是页面的元素内容
            if (opts.content instanceof $ || $.zepto.isZ(opts.content)) {
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                $title = $(title);
                opts.content.css({
                    visibility: "visible",
                    display: "block",
                    clear: "both"
                });
                opts.content.wrap('<div class="' + containerClassName + '"><div class="mDialog-layer-main"></div></div>');
                $main = opts.content.parent();
                $container = $main.parent();
                !!title && $container.prepend($title);
                contentCloseHandle = function() {
                    $main.siblings().remove();
                    opts.content.css({
                        visibility: "hidden",
                        display: "none",
                        float: "none"
                    });
                    for (var i = 0; i < 2; i++) {
                        opts.content.unwrap();
                    }
                }
            } else {
                content = '<div class="mDialog-default-section">' + opts.content + '</div>';

            }
        } else {
            switch (opts._type) {
                case "load":
                    content = '<div class="mDialog-loading-section' + (!opts.text ? ' loading-notext' : '') + '"><div class="loading-icon"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>' + (!!opts.text ? (typeof opts.text == "string" ? '<p class="loading-txt">' + opts.text + '</p>' : '<p class="loading-txt">加载中...</p>') : '') + '</div>';
                    break;
                case "comfirm":
                    content = '<div class="mDialog-confirm-section">' + opts.content + '</div>';
                    break;
                case "msg":
                    content = '<div class="mDialog-msg-section">' + opts.content + '</div>';
                    break;
            }

        }

        if (!$container) {
            containerStr = '<div class="' + containerClassName + '">' +
                title +
                '<div class="' + mainClassName + '">' +
                content +
                '</div>' +
                '</div>';
            $container = $(containerStr);
            $container.appendTo($('body'));

            $title = $container.children('.' + titleClassName);
            $main = $container.children('.' + mainClassName);


        }

        if (!!opts.isPreventMove) {
            $container.on("touchmove", function(event) {
                event.preventDefault();
            })
        }

        !!$closeBtn && $closeBtn.appendTo($container);
        !!$footerButton && $footerButton.appendTo($container);
        $container.css({ "zIndex": mDialog.zIndex + 1, "visibility": "visible" });
        containerCloseHandle = function() {
            if(!!opts.hasInput){
                $("html,body").css({"height":"auto","overflow":"visible"});
                $(window).scrollTop(opts.scrollTop);
            }
            
            !!opts.onBeforeClose && opts.onBeforeClose();
            if (opts.animOut) {

                setAnim($container, opts.animIn, opts.animOut, opts.duration, "out", function() {

                    !!contentCloseHandle && contentCloseHandle();
                    $container.remove();
                    opts.onClose();
                });
            } else {
                setTimeout(function() {
                    !!contentCloseHandle && contentCloseHandle();
                    $container.remove();
                    opts.onClose();
                })
            }

        }

        setElemPos($container, opts, $title, $main, $footerButton);

        !!opts.onBeforeShow && opts.onBeforeShow();
        $container.css({ "zIndex": mDialog.zIndex + 1, "visibility": "visible" });
        if (opts.animIn) {
            opts.isAniming=true;
            setAnim($container, opts.animIn, opts.animOut, opts.duration, "in", function() {
                opts.onShow();
                opts.isAniming=false;
                !!opts.pause && setTimeout(function() {
                    _this.close();
                    
                }, opts.pause)
            });
        } else {
            !!opts.onShow && opts.onShow();
            !!opts.pause && setTimeout(function() {
                _this.close();
               
            }, opts.pause)
        }
        if(!!opts.hasInput){
            opts.scrollTop=$(window).scrollTop();
            $("html,body").css({"height":"100%","overflow":"hidden"});
        }
        $container.removeSelf = containerCloseHandle;
        mDialog.stack[this.opts.uid].push($container);
        
    };

    createClass.prototype._renderShade = function() {
        //opts.shade=true 如果需要遮罩
        var _this = this,
            opts = this.opts,
            defaultOpacity = 0.75,
            defaultColor = "#000",
            shadeCloseHandle = $.noop(),
            styles = {
                "animation-duration": this.opts.duration + "ms",
                "zIndex": mDialog.zIndex,
            },
            $shade = $('<div class="mDialog-shade in"></div>');
        //如果是{color:"",opacity:""} 传入的是颜色和透明值
        ropacity = (!!opts.shade.opacity || opts.shade.opacity == 0) ? opts.shade.opacity : defaultOpacity;
        rcolor = !!opts.shade.bgColor ? opts.shade.bgColor : defaultColor;
        styles["background-color"] = ExtraFunc.colorToRgba(rcolor, ropacity);


        shadeCloseHandle = function() {
            if (!!opts.duration) {
                !!$shade && $shade.removeClass("in").addClass('out');
                $shade.AnimationEnd(function() {
                    $shade.remove();
                },opts.duration)
            } else {
                $shade.remove();
            }
        }

        if (this.opts.shadeClose) {
            //如果需要点击关闭遮罩层, 遮罩要关闭，主体要关闭
            
            $shade.on(deviceUtil.tapEvent, function(event) {
                if(opts.isAniming) return;
                event.stopPropagation();
                _this.close();
            });
        } else {
            $shade.on(deviceUtil.tapEvent, function(event) {
                event.stopPropagation();
            });
            $shade.on("touchmove", function(event) {
                event.preventDefault();
                event.stopPropagation();
            })
        }
        $shade.css(styles);
        $shade.removeSelf = shadeCloseHandle;
        if (opts._type == "load") {

            $shade.removeSelfOnlyFinal = shadeCloseHandle;
        }
        $shade.appendTo($("body"));
        mDialog.stack[this.opts.uid].push($shade);
    };



    /******************************************************************/
    /**
     * *
     * 通过调用 mDialog.close() 来关闭
     */
    createClass.prototype.close = function(index) {

        var _this = this;
        sindex = !!index ? index : this.opts.uid;
        $.each(mDialog.stack[sindex], function(index, obj) {
            !!obj.removeSelf ? obj.removeSelf() : (!!obj.removeSelfOnlyFinal && obj.removeSelfOnlyFinal());
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
        return mDialog.open(options, "load");
    };
    mDialog.confirm = function(opts) {
        var options = !!$.isPlainObject(opts) ? opts : {};
        options.closeBtn = false;
        options.animIn = !!opts.animIn ? opts.animIn : "mDialogBigIn";
        options.animOut = !!opts.animOut ? opts.animOut : "mDialogBigOut";
        options.duration = !!opts.duration ? opts.duration : 150;
        options.width = !!opts.width ? opts.width : "80%";　
        options.buttons = ($.isArray(opts.buttons) && !!opts.buttons.length) ? opts.buttons : [{
                text: "取消",
                callback: function() {
                    this.close();
                }
            },
            {
                text: "确认",
                callback: !!opts.yes ? opts.yes : function() {}
            }
        ]
        return mDialog.open(options, "comfirm")
    };
    mDialog.msg = function(opts) {
        var options = !!$.isPlainObject(opts) ? opts : {};
        options.closeBtn = false;
        options.shade = !!opts.shade ? opts.shade : false;
        options.pause = !!opts.pause ? opts.pause : 2000;
        return mDialog.open(options, "msg")
    };
    mDialog.close = function(obj) {
        obj.close();
    };
    mDialog.closeAll = function() {
        $.each(mDialog.stack, function(index1, obj1) {
            $.each(obj1, function(index2, obj2) {
                obj2.removeSelf();
                if (index2 == mDialog.stack[index1].length - 1) {
                    delete mDialog.stack[index1];
                }
            })
        });
    };
    window.mDialog = mDialog;
});
