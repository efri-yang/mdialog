
var test="window";


;(function($, window, document, undefined) {
    var mDialog = {
        v: '0.0.1',
        stack:{},
        zIndex:100000,
        defaults: {
            title: "mDialog标题",
            autoClose: true,
            pause: 2000,
            duration:250,
            shade: true,
            shadeClose: true,
            content: "mDialog 是一款专为移动端而定制的弹框插件！",
            closeBtn: true,
            buttons: {},
            onBeforeShow: function() {},
            onShow: function() {},
            onBeforeClose: function() {},
            onClose: function() {}
        }
    }
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
        this._init(type);
    }
    createClass.prototype.test=100;
    createClass.prototype._init = function(type) {
        // type confirm   toast  msg  load

        //如果是{} new Object 对象
        this.opts.uid=ExtraFunc.uuid();
        mDialog.stack[this.opts.uid]=[];
        this._renderContainer();


        
           
        if (!!this.opts.shade) {
            this._shade();
        }
        
    }
    createClass.prototype._renderContainer=function(){
        /**
         * <div class="mDialog-layer">
  <div class="mDialog-layer-title"></div>
  <div class="mDialog-layer-main">
      <div class="box1" id="box1">
          <p>幸福了吗哈哈哈</p>
          <p>啊手动阀手动阀啊手动阀阿三地方阿三地方</p>
      </div>
  </div>
  <div class="mDialog-layer-btn"></div>
</div>
         */
        this.$container=$('<div class="mDialog-layer"></div>')
        if(!this.opts._type){
            //如果没有type参数,那么说明 调用的方式是open() 判断 content的内容
            if(this.opts.content instanceof $ || $.zepto.isZ(this.opts.content)){
                //如果内容是jquery 或者zepto 对象，实行把容器包起来
                this.opts.content.wrap('<div class="mDialog-layer"><div class="mDialog-layer-main"></div></div>')
                this.$content=this.opts.content.parent();    
            }
        }else{
            
        }
    };
    createClass.prototype._title=function(){

    };
    createClass.prototype._content=function(){

    };
    createClass.prototype._footer=function(){

    };
    createClass.prototype._shade = function() {
            //opts.shade=true 如果需要遮罩
            var defaultOpacity=0.5,
                defaultColor="#000",
                _this=this,
                closeFunc=$.noop();
                styles={
                    "animation-duration":this.opts.duration+"ms",
                    "zIndex":mDialog.zIndex
                };
            this.$shade = $('<div class="mDialog-shade in"></div>');
            if ($.isPlainObject(this.opts.shade)) {

                //如果是{color:"",opacity:""} 传入的是颜色和透明值
                ropacity=!!this.opts.shade.opacity ? this.opts.shade.opacity : defaultOpacity;
                rcolor=!!this.opts.shade.defaultColor ?  this.opts.shade.defaultColor : defaultColor;
                styles["background-color"]=ExtraFunc.colorToRgba(rcolor,ropacity);
            }

            if(this.opts.shadeClose){
                //如果需要点击关闭遮罩层, 遮罩要关闭，主体要关闭
                closeFunc=function(){
                    !!_this.$shade && _this.$shade.removeClass("in").addClass('out');
                    _this.$shade.AnimationEnd(function(){
                        _this.$shade.remove();
                    })

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
            this.$shade.removeSelf=closeFunc;
            this.$shade.appendTo($("body"));
            mDialog.stack[this.opts.uid].push(this.$shade);
            console.group(mDialog.stack)
    };
    
    /**
     * *
     * 通过调用 mDialog.close() 来关闭
     */
    createClass.prototype.close = function(index) {
        var index=!!index ? index : this.opts.uid;
        $.each(mDialog.stack[index], function(index, obj) {
            obj.removeSelf();
        });
    };





    mDialog.open = function(options,type) {
        mDialog.zIndex++;
        var o = new createClass(options,type);
        return o;
    };

    mDialog.close = function(index) {

    };
    mDialog.update = function(options) {

    };

    window.mDialog = mDialog;
})(window.jQuery || window.Zepto, window, document);

/**
 * 
 */