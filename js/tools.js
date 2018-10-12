//这个文件是我们的工具函数

/*
	封装绑定事件处理函数的工具函数
		addEventListener()
*/

var t = (function (){
	function on(element,evName,evFn){
		element.addEventListener(evName,evFn);	
	}

	function off(element,evName,evFn){
		element.removeEventListener(evName,evFn);	
	}
	
	function getRect(element){
		return element.getBoundingClientRect();
	}
	function isDung(box1,box2){
		var getBox1Rect = getRect(box1);
		var getBox2Rect = getRect(box2);
		if( 	
				getBox1Rect.right < getBox2Rect.left || 
				getBox1Rect.bottom < getBox2Rect.top || 
				getBox1Rect.left > getBox2Rect.right ||
				getBox1Rect.top > getBox2Rect.bottom
		  ){
			return false
		}else{
			return true;
		}		
	}
	// 把这些方法暴露出去

	return {
		on:on,
		off:off,
		getRect:getRect,
		isDung:isDung
	}

})()



