/*
 * 功能：
 * 1.音乐自动播放
 * 2.模拟Alert框
 * 3.禁止页面默认的触摸滑动事件
 */

//模拟Alert框
function AlexAlertBox(obj){this.init(obj);}
AlexAlertBox.prototype = {
    alertTemplate:[
        '<div class="popBox" id="alertBox">',
            '<div class="alertBoxMarginTop" id="alertBoxMarginTop"></div>',
            '<div class="alertText" id="alertText">',
                '<div id="alertBoxText"></div>',
                '<button onclick="javascript:$(this).parent().parent().remove();" type="button">关闭</button>',
            '</div>',
        '</div>'
    ].join(""),
    init:function(obj){
    },
    getAlertHtml:function(){
        $('body').append(this.alertTemplate);
    },
    alertBox:function(text){
        this.getAlertHtml();
        $('#alertBoxText').html(text);
        $('#alertBox').fadeIn(500);
        $('#alertBoxMarginTop').height((($(window).height() - $('#alertText').height())/2)-30);
    }
}

var alertFun = new AlexAlertBox();
alertFun;
//alert使用方法：alertFun.alertBox('hahahahhahaha');

//Music
function AlexMusicBox(obj){this.init(obj);}
AlexMusicBox.prototype = {
    musicTemplate:[
        '<div id="musicMenu" class="musicMenu">',
            '<audio id="Jaudio" class="media-audio" preload loop="loop">',
                '<source src="{mp3}" type="audio/mpeg">',
            '</audio>',
            '<div class="control">',
                '<div class="control-after"></div>',
            '</div>',
        '</div>'
    ].join(""),
    init:function(obj){
        var _self = this;
        this.musicMp3 = obj.music;
        this.getMusicHtml();
        this.audio = document.getElementById("Jaudio");
        this.musicPlay = false;
        $("#musicMenu").click(function(){
            if(_self.musicPlay){
                console.log('music Off');
                _self.audio.pause();
                $("#musicMenu .control").removeClass("show_loop");
                _self.musicPlay = false;
            }else{
                console.log('music On');
                _self.audioAutoPlay();
            }
        });
        this.audioAutoPlay('Jaudio');
    },
    getMusicHtml:function(){
        obj = {
            mp3:this.musicMp3
        };
        $('body').append(this.substitute(this.musicTemplate,obj));
    },
    audioAutoPlay:function(){
        var _self = this;
        $("#musicMenu .control").addClass("show_loop");
        this.musicPlay = true;
        var play = function(){
                _self.audio.play();
                document.removeEventListener("touchstart",play, false);
            };
        this.audio.play();
        document.addEventListener("WeixinJSBridgeReady", function () {
            play();
        }, false);
        document.addEventListener('YixinJSBridgeReady', function() {
            play();
        }, false);
        document.addEventListener("touchstart",play, false);
    },
    substitute:function(str,object){//模板内容替换函数
        return str.replace(/\\?\{([^}]+)\}/g, function(match, name){
            if (match.charAt(0) == '\\') return match.slice(1);
            return (object[name] != undefined) ? object[name] : '';
        });
    }
}

$(function($) {
    //禁止页面默认的触摸滑动事件
    document.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, false);
    
    var musicBox = new AlexMusicBox({music:musicMp3});
    musicBox;
});