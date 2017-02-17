$('#cuttingImgBox').width($('#cuttingImgBox').width());
$('#cuttingImgBox').height($('#cuttingImgBox').height());
$('#oldImage').width($('#oldImage').width());
$('#oldImage').height($('#oldImage').height());

var myCuttingImgBox = document.getElementById('oldImage');
var mc = new Hammer(myCuttingImgBox);
mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
mc.get('pinch').set({ enable: true });

var oldImageInfo = {
	left : 0,
	top : 0,
	//位移动作touchstart时的left和top值
	tempLeft : 0,
	tempTop : 0,
	//图片原始宽/高
	width : $('#oldImage').width(),
	height : $('#oldImage').height(),
	//变化后图片宽/高
	now_width : $('#oldImage').width(),
	now_height : $('#oldImage').height(),
	//获取图片的宽高比
	imgAspectRatio : $('#oldImage').width() / $('#oldImage').height(),
	//获取截图框的宽高比
	boxAspectRatio : $('#cuttingImgBox').width() / $('#cuttingImgBox').height(),
	//touchend时间戳
	touchendTime : 0,
	//缩放完成时间戳
	pinchendTime : 0,
	//图片缩放状态（配合双击事件）
	zoomState : true
}

myCuttingImgBox.addEventListener('touchstart',touch,false);
myCuttingImgBox.addEventListener('touchend',touch,false);

function touch (event){
    var event = event || window.event;
    switch(event.type){
        case "touchstart":
            oldImageInfo.tempLeft = $('#oldImage').position().left;
            oldImageInfo.tempTop = $('#oldImage').position().top;
            break;
        case "touchend":
        	var touchendTime = new Date().getTime();
        	if(touchendTime - oldImageInfo.pinchendTime > 300){
        	//判断双击时间间隔
	        	if(touchendTime - oldImageInfo.touchendTime < 300){
	        		if(oldImageInfo.zoomState){
		        		$('#oldImage').css({
					    	width: $('#cuttingImgBox').height() * oldImageInfo.imgAspectRatio,
					    	height : $('#cuttingImgBox').height(),
					    	left: ($('#cuttingImgBox').width() - ($('#cuttingImgBox').height() * oldImageInfo.imgAspectRatio))/2,
					    	top: 0
					    });
					    oldImageInfo.zoomState = false;
		        	}else{
		        		$('#oldImage').css({
					    	width: oldImageInfo.width,
					    	height : oldImageInfo.height,
					    	left: 0,
					    	top: 0
					    });
					    oldImageInfo.zoomState = true;
		        	}
		        	setTimeout(function(){
					    oldImageInfo.now_width = $('#oldImage').width();
						oldImageInfo.now_height = $('#oldImage').height();
						oldImageInfo.left = $('#oldImage').position().left;
					    oldImageInfo.top = $('#oldImage').position().top;
				    },20);
	        	}
        	}
        	oldImageInfo.touchendTime = new Date().getTime();
            break;
    }
}

mc.on('pan', function(ev) {
    //console.log(ev);
    if(new Date().getTime() - oldImageInfo.pinchendTime > 100){
	    $('#oldImage').css({
	    	left: oldImageInfo.left + ev.deltaX,
	    	top : oldImageInfo.top + ev.deltaY
	    });
	    if(ev.isFinal){
	    	
	    	checkError();
			setTimeout(function(){
				oldImageInfo.left = $('#oldImage').position().left;
	    		oldImageInfo.top = $('#oldImage').position().top;
			},230);
		}
		//$('#showInfo').append('pan ');
	}
});

mc.on('pinch', function(ev) {
	//console.log(ev);
	//$('#showInfo').html('调试信息：' + ($('#oldImage').position().left + ((oldImageInfo.now_width - $('#oldImage').width())/2)));
	var scale = Math.round(ev.scale*100)/100;
	$('#oldImage').css({
    	width: oldImageInfo.now_width * scale,
    	height : oldImageInfo.now_height * scale,
    	left: oldImageInfo.tempLeft + ((oldImageInfo.now_width - $('#oldImage').width())/2),
    	top: oldImageInfo.tempTop + ((oldImageInfo.now_height - $('#oldImage').height())/2)
    });
});

mc.on('pinchend', function(ev) {
	//console.log(ev);
	//$('#showInfo').html('调试信息：' + ($('#oldImage').position().left + ((oldImageInfo.now_width - $('#oldImage').width())/2)));

	//检测图片最小宽高
	if($('#oldImage').width() < $('#cuttingImgBox').width() && $('#oldImage').height() < $('#cuttingImgBox').height()){
    	//图片高度大于截图框
    	if(oldImageInfo.imgAspectRatio < oldImageInfo.boxAspectRatio){
    		//以图片最小高度为准
    		//$('#showInfo').html('调试信息：' + $('#cuttingImgBox').width() + ' --- ' + ($('#cuttingImgBox').width() - ($('#cuttingImgBox').width() * oldImageInfo.imgAspectRatio))/2);

			$('#oldImage').css({
		    	width: $('#cuttingImgBox').height() * oldImageInfo.imgAspectRatio,
		    	height : $('#cuttingImgBox').height(),
		    	left: ($('#cuttingImgBox').width() - ($('#cuttingImgBox').height() * oldImageInfo.imgAspectRatio))/2,
		    	top: 0
		    });
    	}else{//图片高度小于截图框
    		//以图片最小宽度为准
    		$('#oldImage').css({
		    	width: oldImageInfo.width,
		    	height : oldImageInfo.height,
		    	left: 0,
		    	top: 0
		    });
    	}
	}

	checkError();
	setTimeout(function(){
	    oldImageInfo.now_width = $('#oldImage').width();
		oldImageInfo.now_height = $('#oldImage').height();
		oldImageInfo.left = $('#oldImage').position().left;
	    oldImageInfo.top = $('#oldImage').position().top;
    },230);
    oldImageInfo.pinchendTime = new Date().getTime();
	//$('#showInfo').append('pinchend ');
});

function checkError(){
	//检测图片移动边界值
	//右边界
	if($('#oldImage').position().left >= $('#cuttingImgBox').width()-10){
		$('#oldImage').animate({
	    	left: ($('#cuttingImgBox').width() - ($('#cuttingImgBox').width()/3)) + 'px'
	    },100);
	}
	//下边界
	if($('#oldImage').position().top >= $('#cuttingImgBox').height()-10){
		$('#oldImage').animate({
	    	top: ($('#cuttingImgBox').height() - ($('#cuttingImgBox').height()/3)) + 'px'
	    },100);
	}
	//左边界
	if($('#oldImage').width() + $('#oldImage').position().left <= 10){
		$('#oldImage').animate({
	    	left: (-$('#oldImage').width() + ($('#cuttingImgBox').width()/3)) + 'px'
	    },100);
	}
	//上边界
	if($('#oldImage').height() + $('#oldImage').position().top <= 10){
		$('#oldImage').animate({
	    	top: (-$('#oldImage').height() + ($('#cuttingImgBox').height()/3)) + 'px'
	    },100);
	}
}