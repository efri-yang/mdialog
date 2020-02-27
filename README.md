# mDialog
mDialog是一款针对移动端的表单验证控件，为了在移动端屏幕和空间大小的情况下,快速实现弹框的效果！<a href="https://wnworld.com/mdialog/index.html" target="_blank">查看demo</a>
<p>手机扫码浏览</p>

![Image text](https://github.com/efri-yang/mdialog/blob/master/src/images/01.png)


##      	目录

*	[特性](#特性)
*	[调用方式](#调用方式)
*	[参数](#参数)
*	[方法](#方法)

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
    content: "您确定关闭这个弹出框！",
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
    content: "您确定关闭这个弹出框！",
    animIn:"rotateIn",
    animOut:"rotateOut",
    yes: function () {
        this.close();
    }
})
</pre>

##	参数
参数 |     类型     | 描述 | 默认值
------------ | ------------- | ------------ | ------------
title | String | 弹框标题 | ''
pause | Number | 弹框显示的时间（load,msg等提示框需显示时间） | 2000
duration | Number | 执行animation的时间 | 250
shade | Boolean或Object | 是否显示遮罩层 | false
width | String | 弹框宽度（可以是"500px"或“80%“或“auto”，像素、百分比、自适应都可以） | auto
height | String | 弹框高度（可以是"500px"或“80%“或“auto”，像素、百分比、自适应都可以） | auto
maxWidth | String | 弹框最大宽度（自适应或者是定义width不能大于maxWidth,大于maxWidth取值maxWidth） | "85%"
maxHeight | String | 弹框最大高度（自适应或者是定义height不能大于maxHeight,大于maxHeight取值maxHeight）| "80%"
animIn | String | 进场动画（animate.css的任何动画也可以） | mDialogZoomIn
animOut | String | 出场动画（animate.css的任何动画也可以） | mDialogZoomOut
shadeClose | Boolean | 点击遮罩层会不会触发关闭弹框 | true
closeBtn | Function | 是否显示关闭按钮 | $.noop
buttons | Boolean或Object | 弹框底部按钮 | false
content | Function | 弹框的内容	 | 是一个容器element，一个文本文字
offset | Function | 弹框的显示位置 | [“auto”, “auto”]
hasInput | Function | 是否有表单输入（ios fixed的时候input出键盘后，输入框位置漂移了兼容方案） | false
onBeforeShow | Function | 弹框显示前触发函数 | $.noop
onShow | Function | 弹框显示后触发函数 | $.noop
onBeforeClose | Function | 弹框关闭前触发函数 | $.noop
onClose | Function | 弹框关闭后触发函数 | $.noop

##	方法
方法| 描述 
------------ | -------------
mDialog.open() | 捕获页面元素的调用形式
mDialog.confirm() | 询问框调用方法
mDialog.msg() | 提示框调用方法
mDialog.close() | 关闭特定的弹框（mDialog.close(dialog1)）
mDialog.closeAll() | 关闭所有的弹框
<pre>
let dialog=mDialg.open();
mDialog.close(dialog)
</pre>






