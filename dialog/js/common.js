;(function($, window, document, undefined) {
    var Dialog = (function() {
        function Dialog(element, options) {
            this.$element = $(element);
            this.opts = $.extend({}, $.fn.dialogs.defaults, options);
        }
        Dialog.prototype = {
            test: 100,
            _init: function() {
               var _this=this;
               this.$element.on("touchmove", function(event) {
                    event.stopPropagation();
                    return false;
                });
               this.$element.find("[data-roler='close']").on("click",function(e){
                    e.preventDefault();
                    _this.hide();
               })
            },
            _shadeShow: function() {
                this.$shadow = $('<div class="coms-dialog-shadow in"></div>');
                this.$shadow.appendTo($("body"));
                this._shadeEvent();
            },
            _shadeHide:function() {
                var _this=this;
                this.$shadow.removeClass("in").addClass('out');
                this._mainHide();
                this.$shadow.animationEnd(function(){
                    _this.$shadow.remove();
                })
            },
            _shadeEvent:function(){
                var _this=this;
                if(!!this.opts.shadeClose){
                    this.$shadow.on("click",function(){
                       _this._shadeHide();
                    }).on("touchstart touchmove", function(event) {
                        _this._shadeHide();
                        event.stopPropagation();
                        return false;
                    })
                }else{
                    this.$shadow.on("touchstart touchmove", function(event) {
                        event.stopPropagation();
                        return false;
                    })
                }
            },
            _mainShow: function(fn) {
                var _this=this;
                !!this.opts.beforeShow && this.opts.beforeShow.call(this);
                this.$element.addClass('dia-in').transitionEnd(function(){
                    _this.opts.afterShow && _this.opts.afterShow.call(this);
                    !!fn && setTimeout(fn, 0);
                });
            },
            _mainHide: function(fn) {
                var _this = this;
                this.opts.beforeHide && this.opts.beforeHide.call(this);
                this.$element.removeClass('dia-in').transitionEnd(function(){
                    _this.opts.afterHide && _this.opts.afterHide.call(this);
                    !!fn && setTimeout(fn, 0);
                })
            },
            show: function(fn) {
                if(this.opts.shade){
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
        beforeShow: function(){},
        afterShow: function(){},
        beforeHide: function(){},
        afterHide: function() {}
    }
})(window.jQuery || window.Zepto, window, document)