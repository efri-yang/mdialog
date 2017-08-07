;
(function($, window, document, undefined) {
    var Dialog = (function() {
        function Dialog(element, options) {
            this.$element = $(element);
            this.opts = $.extend({}, $.fn.dialogs.defaults, options);
        }
        Dialog.prototype = {
            test: 100,
            _init: function() {
                var _this = this;
                this.$element.on("touchmove", function(event) {
                    event.stopPropagation();
                    return false;
                });
                this.$element.find("[data-roler='close']").on("click", function(e) {
                    e.preventDefault();
                    _this.hide();
                })
            },
            _shadeShow: function() {
                this.$shadow = $('<div class="coms-dialog-shadow in"></div>');
                this.$shadow.appendTo($("body"));
                this._shadeEvent();
            },
            _shadeHide: function() {
                var _this = this;
                this.$shadow.removeClass("in").addClass('out');
                this._mainHide();
                this.$shadow.animationEnd(function() {
                    _this.$shadow.remove();
                })
            },
            _shadeEvent: function() {
                var _this = this;
                if (!!this.opts.shadeClose) {
                    this.$shadow.on("click", function() {
                        _this._shadeHide();
                    }).on("touchstart touchmove", function(event) {
                        _this._shadeHide();
                        event.stopPropagation();
                        return false;
                    })
                } else {
                    this.$shadow.on("touchstart touchmove", function(event) {
                        event.stopPropagation();
                        return false;
                    })
                }
            },
            _mainShow: function(fn) {
                var _this = this;
                !!this.opts.beforeShow && this.opts.beforeShow.call(this);
                this.$element.addClass('dia-in').transitionEnd(function() {
                    _this.opts.afterShow && _this.opts.afterShow.call(this);
                    !!fn && setTimeout(fn, 0);
                });
            },
            _mainHide: function(fn) {
                var _this = this;
                this.opts.beforeHide && this.opts.beforeHide.call(this);
                this.$element.removeClass('dia-in').transitionEnd(function() {
                    _this.opts.afterHide && _this.opts.afterHide.call(this);
                    !!fn && setTimeout(fn, 0);
                })
            },
            show: function(fn) {
                if (this.opts.shade) {
                    this._shadeShow();
                }
                this._mainShow(fn);
            },
            hide: function(fn) {
                if (this.opts.shade) {
                    this._shadeHide();
                }
                this._mainHide(fn);

            }
        }
        return Dialog;
    })();

    $.fn.dialogs = function(options) {
        var self = this;
        return this.each(function() {
            var $this = $(this),
                instance = $this.data("dialog");
            if (!instance) {
                var instance = new Dialog(this, options);
                instance._init();
                $this.data('dialog', instance);
            }
            self.hide = function(fn) {
                instance.hide(fn);
            };
            self.show = function(fn) {
                instance.show(fn);
            };
        })
    };

    $.fn.dialogs.defaults = {
        shade: true,
        shadeClose: true,
        beforeShow: function() {},
        afterShow: function() {},
        beforeHide: function() {},
        afterHide: function() {}
    }
})(window.jQuery || window.Zepto, window, document)



;
(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        defaults: {
            title: "",
            autoClose: true,
            pause: 2000,
            shade: true,
            shadeClose: true,
            content: "mDialog 是一款专为移动端而定制的弹框插件！",
            closeBtn: true,
            buttons: {},
            beforeShow: function() {},
            afterShow: function() {},
            beforeHide: function() {},
            afterHide: function() {}
        }
    }

    var _uuidArr = [],
        _shadeIdArr = [],
        _dialogIdArr = [];

    mDialog.stack={};

    var colorRgbReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; //验证正则

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
    var createClass = function(options) {
        this.opts = $.extend(true, mDialog.defaults, options);
        this._init();
    }
    createClass.prototype._init = function() {
        //如果是{} new Object 对象
        this.opts.uid=ExtraFunc.uuid();
        mDialog.stack[this.opts.uid]=[];
        if (!!this.opts.content) {
            if ($.isPlainObject(this.opts.content)) {
                    console.dir("isPlainObject")
            }else{
                console.dir("isNotPlainObject")
            }
        }else{

            alert("content没有内容！")
        }
        this._shade();
    }

    createClass.prototype._shade = function() {
        // false  
        if (!!this.opts.shade) {
            //opts.shade=true
            var defaultOpacity=0.8,
                defaultColor="#000",
                stylesColor;
            this.$shade = $('<div class="mDialog-shade"></div>');
            if ($.isPlainObject(this.opts.shade)) {

                //如果是{color:"",opacity:""} 
                ropacity=!!this.opts.shade.opacity ? this.opts.shade.opacity : defaultOpacity;
                rcolor=!!this.opts.shade.defaultColor ?  this.opts.shade.defaultColor : defaultColor;
                stylesColor=ExtraFunc.colorToRgba(rcolor,ropacity);
                this.$shade.css("backgroundColor",stylesColor);
            }
            this.$shade.appendTo($("body"));

            if(this.opts.shadeClose){
                //如果需要点击关闭遮罩层, 遮罩要关闭，主题要关闭
                    
            }

            mDialog.stack[this.opts.uid].push(this.$shade);
            console.dir(mDialog.stack)
        }
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    createClass.prototype.close = function() {

    }
    mDialog.open = function(options) {
        var o = new createClass(options);
        return o;
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