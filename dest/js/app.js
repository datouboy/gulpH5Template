/*
 * Html5裁图工具，配合阿里云OSS使用
 * 基于jquery.js,Hammer.js
 */
function AlexCuttingImg(obj){this.init(obj);}
AlexCuttingImg.prototype = {
    init:function(obj){
    	var _self = this;
    	this.cuttingImgBoxID = $('#'+obj.cuttingImgBoxID);
    	this.imgID = $('#'+obj.imgID);
    	this.outside = obj.outside;
    	this.myCuttingImgBox = document.getElementById(obj.imgID);
    	this.imageInfo = {
			left : 0,
			top : 0,
			//位移动作touchstart时的left和top值
			tempLeft : 0,
			tempTop : 0,
			//图片原始宽/高
			width : this.imgID.width(),
			height : this.imgID.height(),
			//变化后图片宽/高
			now_width : this.imgID.width(),
			now_height : this.imgID.height(),
			//获取图片的宽高比
			imgAspectRatio : this.imgID.width() / this.imgID.height(),
			//获取截图框的宽高比
			boxAspectRatio : this.cuttingImgBoxID.width() / this.cuttingImgBoxID.height(),
			//touchend时间戳
			touchendTime : 0,
			//缩放完成时间戳
			pinchendTime : 0,
			//图片缩放状态（配合双击事件）
			zoomState : true
		}
		//初始化裁剪框大小及图片大小
		this.setInit();

    	//初始化配置Hammer
    	var mc = new Hammer(this.myCuttingImgBox);
    	mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
		mc.get('pinch').set({ enable: true });

		//添加监听事件
		this.myCuttingImgBox.addEventListener('touchstart', function(e){ _self.touch(e,_self); }, false);
		this.myCuttingImgBox.addEventListener('touchend', function(e){ _self.touch(e,_self); }, false);

		mc.on('pan', function(ev) {
		    if(new Date().getTime() - _self.imageInfo.pinchendTime > 100){
		    	if(ev.center.y > 0){
		    		//判断是否图片必须填满裁剪框
		    		//如果设置图片必须填满裁剪框，则检测图片位置，超出边界停止执行后续位移
		    		var positionOut = {
		    			left:false,
		    			top:false
		    		}
		    		if(_self.outside){
		    			if(_self.imageInfo.left + ev.deltaX > 0){
		    				_self.imgID.css('left', 0);
		    				positionOut.left = true;
		    			}else if(_self.imageInfo.left + ev.deltaX < -(_self.imgID.width() - _self.cuttingImgBoxID.width())){
		    				_self.imgID.css('left', -(_self.imgID.width() - _self.cuttingImgBoxID.width()));
		    				positionOut.left = true;
		    			}
		    			if(_self.imageInfo.top + ev.deltaY > 0){
		    				_self.imgID.css('top', 0);
		    				positionOut.top = true;
		    			}else if(_self.imageInfo.top + ev.deltaY < -(_self.imgID.height() - _self.cuttingImgBoxID.height())){
		    				_self.imgID.css('top', -(_self.imgID.height() - _self.cuttingImgBoxID.height()));
		    				positionOut.top = true;
		    			}
		    		}

		    		if(!positionOut.left){
					    _self.imgID.css({
					    	left: _self.imageInfo.left + ev.deltaX
					    });
				    }
				    if(!positionOut.top){
					    _self.imgID.css({
					    	top : _self.imageInfo.top + ev.deltaY
					    });
				    }

				    if(ev.isFinal){
				    	_self.checkError();
						setTimeout(function(){
							_self.imageInfo.left = _self.imgID.position().left;
				    		_self.imageInfo.top = _self.imgID.position().top;
						},130);
					}
				}else{
					_self.checkError();
					setTimeout(function(){
						_self.imageInfo.left = _self.imgID.position().left;
			    		_self.imageInfo.top = _self.imgID.position().top;
					},130);
				}
			}
		});

		var imgSizeOut = false;
		mc.on('pinch', function(ev) {
			var scale = Math.round(ev.scale*100)/100;
			//判断是否图片必须填满裁剪框
		    //如果设置图片必须填满裁剪框，则检测图片位置，超出边界停止执行后续位移
		    imgSizeOut = false;
		    //$('#showInfo').append(_self.imgID.width() - _self.cuttingImgBoxID.width() + ' | ');
			if(_self.outside){
				if(_self.imgID.width() * scale < _self.cuttingImgBoxID.width()){
					_self.imgID.css({
						width: _self.imageInfo.width,
						height: _self.imageInfo.height,
						left: 0,
						top: 0
					});
		    		imgSizeOut = true;
				}else if(_self.imgID.height() * scale < _self.cuttingImgBoxID.height()){
					_self.imgID.css({
						width: _self.imageInfo.width,
						height: _self.imageInfo.height,
						left: 0,
						top: 0
					});
		    		imgSizeOut = true;
				}
			}

			if(!imgSizeOut){
				_self.imgID.css({
			    	width: _self.imageInfo.now_width * scale,
			    	height : _self.imageInfo.now_height * scale,
			    	left: _self.imageInfo.tempLeft + ((_self.imageInfo.now_width - _self.imgID.width())/2),
			    	top: _self.imageInfo.tempTop + ((_self.imageInfo.now_height - _self.imgID.height())/2)
			    });
		    }
		});

		mc.on('pinchend', function(ev) {
			//检测图片最小宽高
			if(_self.imgID.width() < _self.cuttingImgBoxID.width() && _self.imgID.height() < _self.cuttingImgBoxID.height()){
		    	//图片高度大于截图框
		    	if(_self.imageInfo.imgAspectRatio < _self.imageInfo.boxAspectRatio){
		    		//以图片最小高度为准
					_self.imgID.css({
				    	width: _self.cuttingImgBoxID.height() * _self.imageInfo.imgAspectRatio,
				    	height : _self.cuttingImgBoxID.height(),
				    	left: (_self.cuttingImgBoxID.width() - (_self.cuttingImgBoxID.height() * _self.imageInfo.imgAspectRatio))/2,
				    	top: 0
				    });
		    	}else{//图片高度小于截图框
		    		//以图片最小宽度为准
		    		_self.imgID.css({
				    	width: _self.imageInfo.width,
				    	height : _self.imageInfo.height,
				    	left: 0,
				    	top: 0
				    });
		    	}
			}

			_self.checkError();
			setTimeout(function(){
			    _self.imageInfo.now_width = _self.imgID.width();
				_self.imageInfo.now_height = _self.imgID.height();
				_self.imageInfo.left = _self.imgID.position().left;
			    _self.imageInfo.top = _self.imgID.position().top;
		    },130);
		    _self.imageInfo.pinchendTime = new Date().getTime();
		});
    },
    setInit:function(){
    	this.cuttingImgBoxID.width(this.cuttingImgBoxID.width());
		this.cuttingImgBoxID.height(this.cuttingImgBoxID.height());
		this.imgID.width(this.imgID.width());
		this.imgID.height(this.imgID.height());
    },
    touch:function(event, _self){
	    var event = event || window.event;
	    switch(event.type){
	        case "touchstart":
	            _self.imageInfo.tempLeft = _self.imgID.position().left;
	            _self.imageInfo.tempTop = _self.imgID.position().top;
	            break;
	        case "touchend":
	        	//双击放大缩小图片
	        	var touchendTime = new Date().getTime();
	        	if(touchendTime - _self.imageInfo.pinchendTime > 300){
	        	//判断双击时间间隔
		        	if(touchendTime - _self.imageInfo.touchendTime < 300){
		        		if(!_self.outside){
			        		if(_self.imageInfo.zoomState){
				        		_self.imgID.css({
							    	width: _self.cuttingImgBoxID.height() * _self.imageInfo.imgAspectRatio,
							    	height : _self.cuttingImgBoxID.height(),
							    	left: (_self.cuttingImgBoxID.width() - (_self.cuttingImgBoxID.height() * _self.imageInfo.imgAspectRatio))/2,
							    	top: 0
							    });
							    _self.imageInfo.zoomState = false;
				        	}else{
				        		_self.imgID.css({
							    	width: _self.imageInfo.width,
							    	height : _self.imageInfo.height,
							    	left: 0,
							    	top: 0
							    });
							    _self.imageInfo.zoomState = true;
				        	}
				        }else{
				        	if(!_self.imageInfo.zoomState){
				        		_self.imgID.css({
							    	width: _self.imageInfo.width,
							    	height : _self.imageInfo.height,
							    	left: 0,
							    	top: 0
							    });
							    _self.imageInfo.zoomState = true;
				        	}else{
				        		_self.imgID.css({
							    	width: _self.imageInfo.width*2,
							    	height : _self.imageInfo.height*2,
							    	left: -(_self.imageInfo.width/2),
							    	top: -(_self.imageInfo.height/2)
							    });
							    _self.imageInfo.zoomState = false;
				        	}
				        }
			        	
					    _self.imageInfo.now_width = _self.imgID.width();
						_self.imageInfo.now_height = _self.imgID.height();
						_self.imageInfo.left = _self.imgID.position().left;
					    _self.imageInfo.top = _self.imgID.position().top;
					    
		        	}
	        	}
	        	_self.imageInfo.touchendTime = new Date().getTime();

	        	//给隐藏域赋值
	        	setTimeout(function(){
		        	_self.cuttingImgBoxID.children('input[name=picW]').val(Math.round(_self.imgID.width()));
		        	_self.cuttingImgBoxID.children('input[name=picH]').val(Math.round(_self.imgID.height()));
		        	_self.cuttingImgBoxID.children('input[name=picX]').val(-Math.round(_self.imgID.position().left));
		        	_self.cuttingImgBoxID.children('input[name=picY]').val(-Math.round(_self.imgID.position().top));
		        	_self.cuttingImgBoxID.children('input[name=picCropW]').val(Math.round(_self.cuttingImgBoxID.width()));
		        	_self.cuttingImgBoxID.children('input[name=picCropH]').val(Math.round(_self.cuttingImgBoxID.height()));
	        	},180);
	            break;
	    }
	},
	checkError:function(){
		//边界值出界状态
		var boundaryState = {
			top: false,
			right: false,
			bottom: false,
			left: false,
			outNum:0
		}
		//检测图片移动边界值
		//右边界
		if(this.imgID.position().left >= this.cuttingImgBoxID.width()-10){
		    boundaryState.right = true;
		    boundaryState.outNum++;
		}
		//下边界
		if(this.imgID.position().top >= this.cuttingImgBoxID.height()-10){
		    boundaryState.bottom = true;
		    boundaryState.outNum++;
		}
		//左边界
		if(this.imgID.width() + this.imgID.position().left <= 10){
		    boundaryState.left = true;
		    boundaryState.outNum++;
		}
		//上边界
		if(this.imgID.height() + this.imgID.position().top <= 10){
		    boundaryState.top = true;
		    boundaryState.outNum++;
		}

		//两边出界
		if(boundaryState.outNum == 2){
			if(boundaryState.top && boundaryState.right){
				this.imgID.animate({
			    	top: (-this.imgID.height() + (this.cuttingImgBoxID.height()/3)) + 'px',
			    	left: (this.cuttingImgBoxID.width() - (this.cuttingImgBoxID.width()/3)) + 'px'
			    },100);
			}else if(boundaryState.right && boundaryState.bottom){
				this.imgID.animate({
			    	left: (this.cuttingImgBoxID.width() - (this.cuttingImgBoxID.width()/3)) + 'px',
			    	top: (this.cuttingImgBoxID.height() - (this.cuttingImgBoxID.height()/3)) + 'px'
			    },100);
			}else if(boundaryState.bottom && boundaryState.left){
				this.imgID.animate({
			    	top: (this.cuttingImgBoxID.height() - (this.cuttingImgBoxID.height()/3)) + 'px',
			    	left: (-this.imgID.width() + (this.cuttingImgBoxID.width()/3)) + 'px'
			    },100);
			}else if(boundaryState.left && boundaryState.top){
				this.imgID.animate({
			    	left: (-this.imgID.width() + (this.cuttingImgBoxID.width()/3)) + 'px',
			    	top: (-this.imgID.height() + (this.cuttingImgBoxID.height()/3)) + 'px'
			    },100);
			}
		}else{//单边出界
			if(boundaryState.top){
				this.imgID.animate({
			    	top: (-this.imgID.height() + (this.cuttingImgBoxID.height()/3)) + 'px'
			    },100);
			}else if(boundaryState.right){
				this.imgID.animate({
			    	left: (this.cuttingImgBoxID.width() - (this.cuttingImgBoxID.width()/3)) + 'px'
			    },100);
			}else if(boundaryState.bottom){
				this.imgID.animate({
			    	top: (this.cuttingImgBoxID.height() - (this.cuttingImgBoxID.height()/3)) + 'px'
			    },100);
			}else if(boundaryState.left){
				this.imgID.animate({
			    	left: (-this.imgID.width() + (this.cuttingImgBoxID.width()/3)) + 'px'
			    },100);
			}
		}
		//恢复状态
		boundaryState = {
			top: false,
			right: false,
			bottom: false,
			left: false,
			outNum:0
		}
	}
}

//初始化图片裁剪框，outside：是否图片必须填满裁剪框
var cuttingImg = new AlexCuttingImg({cuttingImgBoxID:'cuttingImgBox', imgID:'oldImage', outside:true});
cuttingImg;