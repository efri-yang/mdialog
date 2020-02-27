# mDialog
mDialog是一款针对移动端的表单验证控件，为了在移动端屏幕和空间大小的情况下,快速实现弹框的效果！<a href="https://wnworld.com/mdialog/index.html" target="_blank">查看demo<a/>

##      	目录

*	[特性](#特性)
*	[调用方式](#调用方式)
*	[参数](#参数)
*	[拓展方法](#拓展方法)

##	特性

1.	适配flexible的rem自适应布局
2.	深度接入animate.css(只要是animate.css的动画，只要传入名字就可以实现弹框进场和出场动画，而无需人工书写，一步到位)
3.	弹框的多类型（loading,confirm,msg等等）
4.  自适应宽高

##	调用方式
<pre>
Dialog = mDialog.open({
    duration: 250,
    title: {
        text: "mDialog弹框标题"
    },
    width: "80%",
    maxWidth: "100%",
    duration: 250,
    content: $("#J_mDialog-section-11"),
    hasInput: true,
    buttons: [{
            text: "取消",
            className: "btn-11",
            callback: function () {
                this.close();
            }
        },
        {
            text: "确认",
            className: "btn-11",
            callback: function () {
                mDialog.confirm({
                    content: "您确定关闭这个弹出框！",
                    yes: function () {
                        this.close();
                        Dialog.close();
                    }
                })
            }
        }
    ],
    onShow: function () {
        if (!Scroll) {
            Scroll = new IScroll('#J_wrapper-11');
        }
    },
    onClose: function () {}
});
</pre>

<pre>
mDialog.confirm({
    content: "<p style='text-align:center;'>您确定关闭这个弹出框！</p>",
    yes: function () {
        this.close();
    },
    onClose: function () {
        mDialog.msg({
            content: "我被关闭，然后升天了！"
        })
    }
})
</pre>

<pre>
mDialog.load({
    pause: 3000,
})
</pre>

<pre>
mDialog.msg({
    content: "诗和远方在哪里？"
})
</pre>

<pre>
mDialog.confirm({
    duration:750,
    content: "<p style='text-align:center;'>您确定关闭这个弹出框！</p>",
    animIn:"rotateIn",
    animOut:"rotateOut",
    yes: function () {
        this.close();
    }
})
</pre>

##	参数
参数 | 类型 | 描述 | 默认值
------------ | ------------- | ------------ | ------------
type | Number | 验证类型,类型1：弹出提示信息，类型2：未通过验证的表单下面显示提示文字 | 1
validateInSubmit | Boolean | 点击"提交"按钮的时候是否要对表单进行验证 | true
sendForm | Boolean | 表单通过验证的时候，是否需要提交表单 | true
onKeyup | Boolean | 输入放开键盘的时候,是否需要验证 | false
firstInvalidFocus | Boolean | 未通过验证的第一个表单元素，是否要获取焦点 | true
conditional | Object | 输入域通过data-conditional="name"对应到conditional中属性等于name的函数 | {}
descriptions | Object | 输入域通过data-descriptions="name"对应到descriptions中属性名等于name的函数 | {}
eachField | Function | 输入域在执行验证之前触发该函数| {}
eachInvalidField | Function | 所有未通过验证的表单输入域触发该函数 | $.noop
eachValidField | Function | 所有的通过验证的表单输入域触发该函数 | $.noop
valid | Function | 点击“提交”按钮的时候，若表单通过验证，就触发该函数！ | $.noop
invalid | Function | 点击“提交”按钮的时候，若表单未通过验证，就触发该函数！ | $.noop

##	拓展方法
方法| 描述 
------------ | -------------
$.mvalidateExtend | 该方法用来拓展一些输入域的验证,例如:data-validate="phone"
<pre>
$.mvalidateExtend({
    phone:{
        required : true,   
        pattern : /^0?1[3|4|5|8][0-9]\d{8}$/,
        each:function(){
           
        },
        descriptions:{
            required : '必填字段',
            pattern : '请您输入正确的格式'
        }
    }
});
</pre>






