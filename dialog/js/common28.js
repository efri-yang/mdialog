var test = "window";


;
(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        stack: {},
        zIndex: 100000,
        baseViewWidth: 750,
        baseFontSize: 75,
        defaults: {
            title: "",
            autoClose: false,
            pause: 2000,
            duration: 250,
            shade: true,
            width: "auto",
            height: "auto",
            maxWidth: "90%",
            maxHeight: "80%",
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
    function titleRender(opts){
        var title = "";
        if (!!opts.title) {
            if ($.isPlainObject(opts.title)) {
                title = '<div class="mDialog-layer-title ' + opts.className + ' style=' + opts.style + '">' + opts.title + '</div>'
            } else {
                title = '<div class="mDialog-layer-title">' + opts.title + '</div>';
            }
        }
        return title;
    }

    function closeBtnRender(opts,indicator) {
        var $close = null;
        if (!!opts.closeBtn) {
            $close = $('<span class="mDialog-close"></span>');
            $close.on("click touchstart", function() {
                indicator.close();
            })
        }
        return $close;

    };

    function buttonRender(opts,type,indicator){
        var $btnContainer = ($.isArray(opts.buttons) || type == "confirm") ? $('<div class="mDialog-layer-btns"></div>') : null,
            _this = this;
        if ($.isArray(opts.buttons) && !!opts.buttons.length) {
            $.each(opts.buttons, function(index, obj) {
                obj.class= !!obj.class ?  obj.class :"";
                var $btn = $('<a href="#" class="mDialog-btn ' + obj.class + '">' + obj.text + '</a>');
                if (!!obj.callback) {
                    $btn.on("touchstart", function(event) {
                        event.preventDefault();
                        obj.callback.call(indicator);
                    })
                }
                $btn.appendTo($btnContainer);
            });
        }
        return $btnContainer;
    };
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
            title = "",
            content = "",
            containerCloseHandle,
            contentCloseHandle;
        var $main;

        this.$container = null;
        this.$containerInner = null;
        title = titleRender(opts);
        $closeBtn = closeBtnRender(opts,this);
        $footerButton = buttonRender(opts,this.opts,this);

        if (!opts._type) {
            //如果没有type参数,那么说明 调用的方式是open() 
            //判断 content的内容是不是页面的元素内容
            if (opts.content instanceof $ || $.zepto.isZ(opts.content)) {
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                this.$container = $('<div class="mDialog-layer-container"></div>');
                this.$title = $(title);
                opts.content.css(stylesContentShow)
                opts.content.wrap('<div class="mDialog-layer-main"></div>')
                this.$main = opts.content.parent();
                this.$main.wrap(this.$container);


                !!title && this.$container.prepend(this.$title);


                contentCloseHandle = function() {
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

            title +
            '<div class="mDialog-layer-main">' +
            content +
            '</div>' +
           

            '</div>';

        if (!this.$container) {
            this.$container = $(containerStr);
            this.$container.appendTo($('body'));

            this.$title = this.$container.children('.mDialog-layer-title').eq(0);

            this.$main = this.$container.children('.mDialog-layer-main');
        }
        !!$closeBtn && $closeBtn.appendTo(this.$container);
        !!$footerButton && $footerButton.appendTo(this.$container);
        containerCloseHandle = function() {

            !!opts.onBeforeClose && opts.onBeforeClose();

            if (opts.animOut) {

                this._setAnim(this.$container, opts.animIn, opts.animOut, opts.duration, "out", function() {
                    // this -》 window

                    !!contentCloseHandle && contentCloseHandle();
                    _this.$container.remove();
                    opts.onClose();
                });
            } else {
                setTimeout(function() {
                    !!contentCloseHandle && contentCloseHandle();
                    _this.$container.remove();
                    opts.onClose();
                })
            }

        }






        this._setElemPos(_this.$container, opts.width, opts.height, opts.maxWidth, opts.maxHeight, _this.$title, _this.$main, $footerButton);


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
        var title = "";
        if (!!opts.title) {
            if ($.isPlainObject(opts.title)) {
                title = '<div class="mDialog-layer-title ' + opts.className + ' style=' + opts.style + '">' + opts.title + '</div>'
            } else {
                title = '<div class="mDialog-layer-title">' + opts.title + '</div>';
            }
        }
        return title;
    };

    createClass.prototype._close = function(opts) {
        var $close = null,
            _this = this;
        if (!!opts.closeBtn) {
            $close = $('<span class="mDialog-close"></span>');
            $close.on("click touchstart", function() {
                _this.close();
            })
        }
        return $close;

    };

    createClass.prototype._button = function(opts, type) {
        var $btnContainer = ($.isArray(opts.buttons) || type == "confirm") ? $('<div class="mDialog-layer-btns"></div>') : null,
            _this = this;
        if ($.isArray(opts.buttons) && !!opts.buttons.length) {
            $.each(opts.buttons, function(index, obj) {
                obj.class= !!obj.class ?  obj.class :"";
                var $btn = $('<a href="#" class="mDialog-btn ' + obj.class + '">' + obj.text + '</a>');
                if (!!obj.callback) {
                    $btn.on("touchstart", function(event) {
                        event.preventDefault();
                        obj.callback.call(_this);
                    })
                }
                $btn.appendTo($btnContainer);
            });
        }
        return $btnContainer;
    }

    createClass.prototype._content = function() {

    };
    createClass.prototype._footer = function() {

    };
    createClass.prototype._renderShade = function() {
        //opts.shade=true 如果需要遮罩
        var _this = this,
            opts = this.opts;
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



    /******************************************************************/
    createClass.prototype._setElemPos = function($elem, width, height, maxWidth, maxHeight, $title, $main, $footer) {
        //maxWidth、maxHeight 传递进来的值可能是  auto  80%  400px  8rem;
        //width、height  传递进来的值可能是  auto  80%  400px  8rem;

        var elemW, elemH, winW, winH, realW, realH, titleH = 0,
            contentH = 0,
            footerH = 0,
            fullClassName="mDialog-layer-main-full",
            dpr, isFull, mainH,
            standardRatio, //flexible 基准缩放比
            isFlexible = !!(document.documentElement.style.fontSize && document.body.style.fontSize),
            unitRemPx = isFlexible ? "rem" : "px";

        winW = $(window).width();
        winH = $(window).height();
        dpr = document.documentElement.getAttribute('data-dpr');

        if (dpr) {
            if (winW > 540 && dpr == 1) {
                standardRatio = 540;
            } else {
                standardRatio = winW;
            }
        } else {
            standardRatio = winW;
        }


        elemW = $elem.outerWidth();
        realW = !!width ? ((width == "auto") ? elemW : width) : elemW;
        maxW = !!maxWidth ? ((maxWidth == "auto") ? "90%" : maxWidth) : "90%";

        if (ExtraFunc.isPercent(realW)) {
            realW = winW * ExtraFunc.getNumber(realW) / 100; //转成 数字类型
        } else if (ExtraFunc.isPx(realW)) {
            realW = ExtraFunc.getNumber(realW); //转成 数字类型
        }

        if (ExtraFunc.isPercent(maxW)) {
            maxW = winW * ExtraFunc.getNumber(maxW) / 100; //转成px
        } else if (ExtraFunc.isPx(maxW)) {
            maxW = ExtraFunc.getNumber(maxW); //转成px
        }

        //宽高都是100%，那么默认的忽略\
        realW = (realW >= maxW) ? maxW : realW;
        if (isFlexible) { //转rem
            realW = realW / standardRatio * 10;
        }
        $elem.css({
            left: "50%",
            top: "50%",
            width: realW + unitRemPx,
            "marginLeft": -realW / 2 + unitRemPx
        })


        elemH = $elem.outerHeight();
        realH = !!height ? ((height == "auto") ? elemH : height) : elemH;
        maxH = !!maxHeight ? ((maxHeight == "auto") ? "80%" : maxHeight) : "80%";
        if (ExtraFunc.isPercent(realH)) {
            realH = winH * ExtraFunc.getNumber(realH) / 100; //转成px
        } else if (ExtraFunc.isPx(realH)) {
            realH = ExtraFunc.getNumber(realH); //转成px
        }
        if (ExtraFunc.isPercent(maxH)) {
            maxH = winH * ExtraFunc.getNumber(maxH) / 100; //转成px number 类型
        } else if (ExtraFunc.isPx(maxH)) {
            maxH = ExtraFunc.getNumber(maxH); //转成px
        }

        // elemH 大于规定的高度 heiht 那么也要启动 限制
        if (realH >= maxH) {
            realH = maxH;
            isFull = true;
        }
        if (realH <= elemH) {
            isFull = true;
        }
        if (!!isFull) {
            if (!!$title && !!$title.length) {
                titleH = $title.outerHeight();
            }
            if (!!$footer && $footer.length) {
                footerH = $footer.outerHeight();
            }
            mainH = ((realH - titleH - footerH) > 0) ? (realH - titleH - footerH) : 0;
            $main.addClass(fullClassName).css({ height: (isFlexible ? (mainH / standardRatio * 10) : mainH) + unitRemPx })
        }
        if (realH == maxH && realH == winH) {
            $elem.addClass(fullClassName)
        }

        if (isFlexible) { //转rem
            realH = realH / standardRatio * 10;
        }
        $elem.css({
            height: realH + unitRemPx,
            "marginTop": -realH / 2 + unitRemPx
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




var test = "window";


;
(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        stack: {},
        zIndex: 100000,
        baseViewWidth: 750,
        baseFontSize: 75,
        defaults: {
            title: "",
            autoClose: false,
            pause: 2000,
            duration: 250,
            shade: true,
            width: "auto",
            height: "auto",
            maxWidth: "90%",
            maxHeight: "80%",
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
    function titleRender(opts){
        var title = "";
        if (!!opts.title) {
            if ($.isPlainObject(opts.title)) {
                title = '<div class="mDialog-layer-title ' + opts.className + ' style=' + opts.style + '">' + opts.title + '</div>'
            } else {
                title = '<div class="mDialog-layer-title">' + opts.title + '</div>';
            }
        }
        return title;
    }

    function closeBtnRender(opts,indicator) {
        var $close = null;
        if (!!opts.closeBtn) {
            $close = $('<span class="mDialog-close"></span>');
            $close.on("click touchstart", function() {
                indicator.close();
            })
        }
        return $close;

    };

    function buttonRender(opts,type,indicator){
        var $btnContainer = ($.isArray(opts.buttons) || type == "confirm") ? $('<div class="mDialog-layer-btns"></div>') : null,
            _this = this;
        if ($.isArray(opts.buttons) && !!opts.buttons.length) {
            $.each(opts.buttons, function(index, obj) {
                obj.class= !!obj.class ?  obj.class :"";
                var $btn = $('<a href="#" class="mDialog-btn ' + obj.class + '">' + obj.text + '</a>');
                if (!!obj.callback) {
                    $btn.on("touchstart", function(event) {
                        event.preventDefault();
                        obj.callback.call(indicator);
                    })
                }
                $btn.appendTo($btnContainer);
            });
        }
        return $btnContainer;
    };

    function setElemPos($elem, width, height, maxWidth, maxHeight, $title, $main, $footer) {
        //maxWidth、maxHeight 传递进来的值可能是  auto  80%  400px  8rem;
        //width、height  传递进来的值可能是  auto  80%  400px  8rem;

        var elemW, elemH, winW, winH, realW, realH, titleH = 0,
            contentH = 0,
            footerH = 0,
            fullClassName="mDialog-layer-main-full",
            dpr, isFull, mainH,
            standardRatio, //flexible 基准缩放比
            isFlexible = !!(document.documentElement.style.fontSize && document.body.style.fontSize),
            unitRemPx = isFlexible ? "rem" : "px";

        winW = $(window).width();
        winH = $(window).height();
        dpr = document.documentElement.getAttribute('data-dpr');

        if (dpr) {
            if (winW > 540 && dpr == 1) {
                standardRatio = 540;
            } else {
                standardRatio = winW;
            }
        } else {
            standardRatio = winW;
        }


        elemW = $elem.outerWidth();
        realW = !!width ? ((width == "auto") ? elemW : width) : elemW;
        maxW = !!maxWidth ? ((maxWidth == "auto") ? "90%" : maxWidth) : "90%";

        if (ExtraFunc.isPercent(realW)) {
            realW = winW * ExtraFunc.getNumber(realW) / 100; //转成 数字类型
        } else if (ExtraFunc.isPx(realW)) {
            realW = ExtraFunc.getNumber(realW); //转成 数字类型
        }

        if (ExtraFunc.isPercent(maxW)) {
            maxW = winW * ExtraFunc.getNumber(maxW) / 100; //转成px
        } else if (ExtraFunc.isPx(maxW)) {
            maxW = ExtraFunc.getNumber(maxW); //转成px
        }

        //宽高都是100%，那么默认的忽略\
        realW = (realW >= maxW) ? maxW : realW;
        if (isFlexible) { //转rem
            realW = realW / standardRatio * 10;
        }
        $elem.css({
            left: "50%",
            top: "50%",
            width: realW + unitRemPx,
            "marginLeft": -realW / 2 + unitRemPx
        })


        elemH = $elem.outerHeight();
        realH = !!height ? ((height == "auto") ? elemH : height) : elemH;
        maxH = !!maxHeight ? ((maxHeight == "auto") ? "80%" : maxHeight) : "80%";
        if (ExtraFunc.isPercent(realH)) {
            realH = winH * ExtraFunc.getNumber(realH) / 100; //转成px
        } else if (ExtraFunc.isPx(realH)) {
            realH = ExtraFunc.getNumber(realH); //转成px
        }
        if (ExtraFunc.isPercent(maxH)) {
            maxH = winH * ExtraFunc.getNumber(maxH) / 100; //转成px number 类型
        } else if (ExtraFunc.isPx(maxH)) {
            maxH = ExtraFunc.getNumber(maxH); //转成px
        }

        // elemH 大于规定的高度 heiht 那么也要启动 限制
        if (realH >= maxH) {
            realH = maxH;
            isFull = true;
        }
        if (realH <= elemH) {
            isFull = true;
        }
        if (!!isFull) {
            if (!!$title && !!$title.length) {
                titleH = $title.outerHeight();
            }
            if (!!$footer && $footer.length) {
                footerH = $footer.outerHeight();
            }
            mainH = ((realH - titleH - footerH) > 0) ? (realH - titleH - footerH) : 0;
            $main.addClass(fullClassName).css({ height: (isFlexible ? (mainH / standardRatio * 10) : mainH) + unitRemPx })
        }
        if (realH == maxH && realH == winH) {
            $elem.addClass(fullClassName)
        }

        if (isFlexible) { //转rem
            realH = realH / standardRatio * 10;
        }
        $elem.css({
            height: realH + unitRemPx,
            "marginTop": -realH / 2 + unitRemPx
        })
    };

    function setAnim($elem, animInClass, animOutClass, duration, type, callback) {
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



    var createClass = function(options, type) {
        this.opts = $.extend({}, mDialog.defaults, options);
        this.opts._type = type;
        this._init();
    };
    createClass.prototype._init = function() {
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
        var _this = this,
            opts = this.opts,
            containerStr = "",//容器
            title = "",//标题
            content = "",//内容

            $container,
            $main,
            $closeBtn,
            $footerButton,

            containerClassName="mDialog-layer-container",
            mainClassName="mDialog-layer-main",
            titleClassName="mDialog-layer-title",

            containerCloseHandle,
            contentCloseHandle;


        title = titleRender(opts);
        $closeBtn = closeBtnRender(opts,this);
        $footerButton = buttonRender(opts,this.opts,this);

        if (!opts._type) {
            //如果没有type参数,那么说明 调用的方式是open() 
            //判断 content的内容是不是页面的元素内容
            if (opts.content instanceof $ || $.zepto.isZ(opts.content)) {
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                $container = $('<div class="'+containerClassName+'"></div>');
                $title = $(title);
                opts.content.css(stylesContentShow)
                opts.content.wrap('<div class="mDialog-layer-main"></div>')
                $main = opts.content.parent();
                $main.wrap($container);
                !!title && $container.prepend($title);
                contentCloseHandle = function() {
                    $main.siblings().remove();
                    opts.content.css(styleContentsHide);
                    for (var i = 0; i < 2; i++) {
                        opts.content.unwrap();
                    }
                }
            } else {
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


        containerStr = '<div class="'+containerClassName+'">' +
                            title +
                            '<div class="'+mainClassName+'">' +
                                content +
                            '</div>' +
                        '</div>';

        if (!$container) {
            $container = $(containerStr);
            $container.appendTo($('body'));

            $title = $container.children('.'+titleClassName);
            $main = $container.children('.'+mainClassName);
        }


        !!$closeBtn && $closeBtn.appendTo($container);
        !!$footerButton && $footerButton.appendTo($container);
        containerCloseHandle = function() {
            !!opts.onBeforeClose && opts.onBeforeClose();
            if (opts.animOut) {
                setAnim($container, opts.animIn, opts.animOut, opts.duration, "out", function() {
                    // this -》 window
                    !!contentCloseHandle && contentCloseHandle();
                    $container.remove();
                    opts.onClose();
                    alert(this)
                });
            } else {
                setTimeout(function() {
                    !!contentCloseHandle && contentCloseHandle();
                    $container.remove();
                    opts.onClose();
                })
            }

        }

        setElemPos($container, opts.width, opts.height, opts.maxWidth, opts.maxHeight,$title,$main, $footerButton);

        !!opts.onBeforeShow && opts.onBeforeShow();

        $container.css({ "zIndex": mDialog.zIndex + 1, "visibility": "visible" });
        if (opts.animIn) {
            setAnim($container, opts.animIn, opts.animOut, opts.duration, "in", opts.onShow);
        } else {
            setTimeout(function() {
                !!opts.onShow && opts.onShow();
            })
        }
        $container.removeSelf = containerCloseHandle;
        mDialog.stack[this.opts.uid].push($container);
    };



   
   
    
   
   
    createClass.prototype._renderShade = function() {
        //opts.shade=true 如果需要遮罩
        var _this = this,
            opts = this.opts;
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



    /******************************************************************/
   

   

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