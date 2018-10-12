(function(){
	
	//自适应宽高
	var section = document.querySelector('#section');
	var head = document.querySelector('#head');
	function resize(){
		var clientH = document.documentElement.clientHeight;
		section.style.height = clientH - head.offsetHeight+'px';
	}
	window.onresize = resize;
	resize();

	//---------------------------渲染和交互---------------------------------


	// -----------------封装操作数据的方法------------------

	function getChildsById(id){  // 通过指定的id，找到这个id下所有的子级
		var arr = [];
		for(var attr in data){
			if(data[attr].pid == id){
				arr.push(data[attr])
			}
		}	

		return arr;
	}

	// ---------------------先渲染左侧的树形菜单---------------------

	var treeMenu = document.querySelector('.tree-menu')

	var currentId = 0;

	// 根据数据找到层级关系

	var initId = -1;  // 定义一个初始的id，找到这个id下的所有的子级

	// 给定义一个id，返回的是这个id下子级生成的结构
	function createTreeHtml(id,level){
		var childs = getChildsById(id);  // 找到指定id下所有的子级
		// 生成ul和li的结构
		var treeHtml = '';
		level++;  // 3
		if(childs.length > 0){
			treeHtml += '<ul>'
			for( var i = 0; i < childs.length; i++ ){  // 1 
				var childsHtml = createTreeHtml(childs[i].id,level);
				var classTreeIco = childsHtml === '' ? '' : 'tree-ico'
				treeHtml += `<li>
	                <div data-id="${childs[i].id}" style="padding-left: ${level*10}px;" class="tree-title ${classTreeIco} close">
	                    <span><i></i>${childs[i].title}</span>
	                </div>
	                ${childsHtml}
	            </li>`
			}
			treeHtml += '</ul>'
		}

		return treeHtml;
	}

	treeMenu.innerHTML = createTreeHtml(initId,-1);


	// ------------------给选中的加高亮------------------------

	function positionSpan(id,parent){
		parent = parent || treeMenu;  // 传入了参数，就按照传入的来
		// 记录上次
		console.log(parent);
		if(parent.targetSpan){
			parent.targetSpan.classList.remove('active')
		}
		var treeTargetSpan = parent.querySelector(`div[data-id="${id}"] > span`)
		treeTargetSpan.classList.add('active');

		// 在这个元素上自定义一个属性，用来存已经加active的span
		parent.targetSpan = treeTargetSpan;
	}

	positionSpan(0)

	
	// ----------------------------渲染导航区域-----------------------------

	var navId = 2999; 
	// 给定一个id，要找到这个id所有的祖先级

	// 先到找指定id这条数据，通过这条数据拿到pid，遍历数据，哪一个的id和pid相同就是父级

	
	function getParentsById(id){
		var arr = [];
		var currentData = data[id];
		if(currentData){
			arr.push(currentData)
			arr = arr.concat(getParentsById(currentData.pid))
		}

		return arr;
	}

	var navBox = document.querySelector('.bread-nav');

	function createNavHtml(id){
		var navData = getParentsById(id).reverse();	
		// 渲染导航的结构

		var navHtml = '';
		for( var i = 0; i < navData.length - 1; i++ ){
			navHtml += `<a data-id="${navData[i].id}" href="javascript:;">${navData[i].title}</a>`
		}

		navHtml += `<span>${navData[navData.length - 1].title}</span>`

		return navHtml;
	}

	navBox.innerHTML = createNavHtml(0);

	// ---------------渲染文件区域-------------------------

	var fileId = 0;  // 需要找到这个id下面的数据，显示在文件区域

	// 数据中那一条数据的数据的pid为0，就是子级
	
	var folders = document.querySelector('.folders');

	// 文件夹下没有子数据，需要显示提醒
	var fEmpty = document.querySelector('.f-empty')

	function createFileHtml(id){
		var childs = getChildsById(id);
		var fileHtml = '';
		if(childs.length){
			for( var i = 0; i < childs.length; i++ ){
				fileHtml += `<div data-id="${childs[i].id}" class="file-item">
		            <img src="img/folder-b.png" alt="" />
		            <span class="folder-name">${childs[i].title}</span>
		            <input type="text" class="editor"/>
		            <i></i>
		        </div>`
			}
		}
		return fileHtml;	
	}
	folders.innerHTML = createFileHtml(0);

	// -----------------------三个区域的交互----------------------------------

	function render(id){
		navBox.innerHTML = createNavHtml(id);
		var fileHtml = createFileHtml(id);
		if(fileHtml === ''){
			fEmpty.style.display = 'block';
			folders.innerHTML = '';
		}else{
			fEmpty.style.display = 'none';
			folders.innerHTML = fileHtml;
		}
		positionSpan(id)
		checkedAll.classList.remove('checked')
		n = 0;	
		currentId = id;
	}

	// -------------------左侧菜单区域--------------------

	t.on(treeMenu,'click',function (ev){
		var target = ev.target;

		if(target.nodeName === 'UL') return;
		if(target.classList.contains('tree-menu')) return;

		if(target.nodeName === 'I'){
			target = target.parentNode.parentNode
		}else if (target.nodeName === 'SPAN') {
			target = target.parentNode
		}else if (target.nodeName === 'LI') {
			target = target.firstElementChild
		}

		// 找到id
		var id = target.dataset.id;
		// 重新渲染导航
		render(id)
	});

	// ---------------------导航区域交互------------------------

	// 利用事件委托，把事件绑在导航的最外层父级navBox上，
	// 因为点击任何一个菜单，导航都是重新生生成

	t.on(navBox, 'click', function (ev){
		var target = ev.target;
		if(target.nodeName === 'A'){
			var id = target.dataset.id;

			render(id)
		}	
	})

	// --------------文件区域的交互------------------
	var n = 0;
	t.on(folders,'click',function (ev){
		var target = ev.target;

		if(target.classList.contains('folders')) return;

		// 如果点击的是单选的这个i元素，那么是要做单选，不进到下一级

		// 这里要判断事件源是不是I，如果是I的话，不能进到下一级
		if(target.nodeName === 'I' ){
			return;
		}
		if(target.nodeName === 'INPUT' ){
			return;
		}

		if(target.nodeName === 'IMG' || 
		   target.nodeName === 'SPAN'		   
		){
			target = target.parentNode;
		}

		var id = target.dataset.id;
		render(id)
	})

	// 专门用来处理单选的
	t.on(folders,'click',function (ev){
		var target = ev.target;
		if(target.nodeName === "I"){
			var bl = target.classList.toggle('checked')
			if(bl){
				target.parentNode.classList.add('active');
				n++;
			}else{
				target.parentNode.classList.remove('active');
				n--;
			}
			if(n === fileAllI.length){
				checkedAll.classList.add('checked');
			}else{
				checkedAll.classList.remove('checked');
			}
		}	
	})

	// 单选和全选

	var checkedAll = document.querySelector('.checkedAll');
	// 找到文件区域所有的i
	var fileAllI = folders.getElementsByTagName('i');

	// 获取文件区域所有的文件
	var fileItems = folders.getElementsByClassName('file-item')

	t.on(checkedAll,'click',function (){

		if(fEmpty.style.display === 'block') return;

		var bl = this.classList.toggle('checked');

		if(bl){
			for( var i = 0; i < fileAllI.length; i++ ){
				fileAllI[i].classList.add('checked');
				fileAllI[i].parentNode.classList.add('active');
			}
			n = fileAllI.length
		}else{
			for( var i = 0; i < fileAllI.length; i++ ){
				fileAllI[i].classList.remove('checked');
				fileAllI[i].parentNode.classList.remove('active');
			}
			n = 0;
		}
	})
	
	// ----------------------框选交互----------------------------

	t.on(folders,'mousedown',function (ev) {

		var newDiv = document.createElement('div');
		newDiv.classList.add('kuang');

		//document.body.appendChild(newDiv);
		var x = ev.clientX,y = ev.clientY;
		newDiv.style.left = ev.clientX + 'px';
		newDiv.style.top = ev.clientY + 'px';

		folders.isAppend = false; // 没有插入到body

		function moveFn(ev){

			// 移动过程，超出一定的范围，在append
			// 如果已经把div插入到body中了，不需要重新放入了
			var fanwei = (Math.abs(ev.clientX - x) > 10 || Math.abs(ev.clientY - y) > 10)
			if( fanwei &&  !folders.isAppend){
				document.body.appendChild(newDiv);
				folders.isAppend = true;  // 已经进来了
			}

			// 以下代码，无论超过没超过10个像素，都要执行

			newDiv.style.width = Math.abs(ev.clientX - x) + 'px';
			newDiv.style.height = Math.abs(ev.clientY - y) + 'px';
			newDiv.style.left = Math.min(ev.clientX , x) + 'px';
			newDiv.style.top = Math.min(ev.clientY , y) + 'px';	

			// 判断是否和文件碰上
			if(fanwei){

				for( var i = 0; i < fileItems.length; i++ ){
					if(t.isDung(newDiv,fileItems[i])){
						fileItems[i].classList.add('active');
						fileItems[i].lastElementChild.classList.add('checked')
						//fileAllI[i].classList.add('checked')
					}else{
						fileItems[i].classList.remove('active');
						fileItems[i].lastElementChild.classList.remove('checked')
					}
				}
				var m = 0;
				for( var i = 0; i < fileAllI.length; i++ ){
					if(fileAllI[i].classList.contains('checked')){
						m++;
					}
				}

				if(m === fileAllI.length){
					checkedAll.classList.add('checked')
					n = fileAllI.length;
				}else{
					checkedAll.classList.remove('checked')
					n = m;   // 统计选中的
				}
			}


		}

		function upFn(ev){
			t.off(document,'mousemove', moveFn)
			t.off(document,'mouseup', upFn)

			newDiv.remove();
			folders.isAppend = false;  // 把元素从body中移出，标示设置为false
		}

		t.on(document, 'mousemove',moveFn)

		t.on(document, 'mouseup',upFn)



		ev.preventDefault();
	})

	// 删除数据
	var obj = {a:1,b:2};

	// delete obj.a; 操作符就是用来删除对象中的属性

	// 找指定id所有的子孙数据
	function getChildsAllById(id){
		//data[id]
		// 哪一个pid等于id，就是子级
		var arr = [];
		for(var attr in data){
			if(data[attr].pid == id){
				arr.push(data[attr]);
				arr = arr.concat(getChildsAllById(attr))
			}
		}
		return arr;
	}
	function getChildsAllByIdAndSelf(id){
		// [].concat(1,[2,3,4,5])
		return [].concat(data[id],getChildsAllById(id));
	}

	var del = document.querySelector('#del');
	
	// 弹框
	var delTan = document.querySelector('.delTan');

	t.on(del,'click',function (){
		var checkedFiles = whoChecked();

		if(checkedFiles.length === 0){
			alert('请选中要删除的文件')
		}else{

			tanbox.style.display = 'block';

			// 保证只绑定一次事件
			if(!tanbox.isClick){
				tanbox.isClick = true;

				var ok = tanbox.querySelector('.ok');
				var cancel = tanbox.querySelector('.cancel');
				var closeIco = tanbox.querySelector('.close-ico');

				t.on(ok,'click',function (){
					tanbox.style.display = 'none';
					deleteFiles();
				})
				t.on(cancel,'click',function (){
					tanbox.style.display = 'none';
				})
				t.on(closeIco,'click',function (){
					tanbox.style.display = 'none';
				})
			}

		}


	});

	function deleteFiles(){
		var checkedFiles = whoChecked();
		for( var i = 0; i < checkedFiles.length; i++ ){
			var id = checkedFiles[i].dataset.id;
			delete data[id];
			// 删除所有的子孙级
			// 通过这个id找到数据中所有的子孙
			var arr = getChildsAllById(id); //[{id},{id}]
			// {id:{},id:{}}
			for( var j = 0; j < arr.length; j++ ){
				delete data[arr[j].id]
			}
		}

		render(currentId);
		treeMenu.innerHTML = createTreeHtml(-1,-1);
		positionSpan(currentId)
	}

	//-------------------新建-----------------
	

	var create = document.querySelector('#create');

	t.on(create, 'mouseup' , function (){
		/*var fileHtml = `<div class="file-item">
                        <img src="img/folder-b.png" alt="" />
                        <span class="folder-name">JS基础课程</span>
                        <input type="text" class="editor"/>
                        <i class="checked"></i>
                    </div>`;
        folders.innerHTML = fileHtml + folders.innerHTML; */

        fEmpty.style.display = 'none';

        var divElement = document.createElement('div');
        divElement.className = 'file-item';
        divElement.innerHTML = `<img src="img/folder-b.png" alt="" />
                        <span class="folder-name">JS基础课程</span>
                        <input type="text" class="editor"/>
                        <i class="checked"></i>`;

        folders.insertBefore(divElement,folders.firstElementChild);

        // 标题隐藏，输入框显示
        var folderName = divElement.querySelector('.folder-name');
        var editor = divElement.querySelector('.editor');

        folderName.style.display = 'none';
        editor.style.display = 'block';

        editor.focus();

        // 添加标示，代表正在新建
		create.isCreate  = true;
        
	});

	// 判断是否和同级重名
	// 判断指定id下的子级是否有指定的name
	function isCunzaiNameById(id,name){
		var childs = getChildsById(id);
		for( var i = 0; i < childs.length; i++ ){
			if(childs[i].title === name){
				return true;
			}
		}

		return false;
	}

	// 在鼠标down和mousedown触发的函数，判断是否新建成功
	function createFn(ev){
		if(create.isCreate){

			var firstFile = folders.firstElementChild;
			var folderName = firstFile.querySelector('.folder-name');
			var editor = firstFile.querySelector('.editor');
			var value = editor.value.trim();

			// 新建的状态，如果down在了input上，就不去判断是否成功
			// 并且是鼠标触发的
			if(ev.target === editor && !ev.keyCode){
				return;
			}
			if(!value){  // 新建不成功
				firstFile.remove();
			}else if(isCunzaiNameById(currentId,value)){  // 同级中重名
				firstFile.remove();
			}else {  // 新建成功
				folderName.style.display = 'block';
				editor.style.display = 'none';
				folderName.innerHTML = value;

				// 添加在data中
				var id = Date.now();
				var obj = {
					id:id,
					pid:currentId,
					title: value
				}
				data[id] = obj;

				treeMenu.innerHTML = createTreeHtml(-1,-1);
				positionSpan(currentId);

				firstFile.setAttribute('data-id',id)
			}


			// 以后不管成功与否，都要把标示设置为false
			create.isCreate = false;
		}
	}
	// 为新建服务的
	t.on(document,'mousedown',createFn);
	t.on(document,'keydown',function (ev){

		if(ev.keyCode === 13){

			createFn(ev);
		}
	});


	// -----------------重命名----------------------


	// 封装方法，找到文件区选中的i
	function whoChecked(){
		var arr = [];
		for( var i = 0; i < fileAllI.length; i++ ){
			if(fileAllI[i].classList.contains('checked')) {
				arr.push(fileAllI[i].parentNode)
			}	
		}	
		return arr;
	}

	var rename = document.querySelector('#rename');
	t.on(rename,'click',function (){
		// 找到选中的i
		var checkedFiles = whoChecked();
		
		if(checkedFiles.length > 1) {
			alert('不能重命名多个文件')
		}else if(checkedFiles.length === 0){
			alert('请选中要重命名的文件')
		}else{
			var file = checkedFiles[0];
			var span = file.querySelector('span');
			var editor = file.querySelector('input');
			editor.style.display = 'block';
			span.style.display = 'none';

			editor.value = span.innerHTML.trim();

			editor.select();

			rename.isRename = true;
		}
	});

	t.on(document,'mousedown',function (){
		if(rename.isRename){
			var checkedFiles = whoChecked();
			var file = checkedFiles[0];
			var span = file.querySelector('span');
			var editor = file.querySelector('input');

			var val = editor.value.trim();
			console.log(val);
			if(!val){  // 为空
				span.style.display = 'block';
				editor.style.display = 'none';

			}else if(isCunzaiNameById(currentId,val)){
				span.style.display = 'block';
				editor.style.display = 'none';

			}else {
				span.style.display = 'block';
				editor.style.display = 'none';

				span.innerHTML = val;

				// 找到数据
				var id = file.dataset.id;

				data[id].title = val;

				treeMenu.innerHTML = createTreeHtml(-1,-1);
				positionSpan(currentId);

			}
			rename.isRename = false;
		}
	})

	//-----------------------移动到-----------------------




	var remove = document.querySelector('#remove');
	var modalTree = document.querySelector('.modal-tree');
	var mask = document.querySelector('#mask');
	var content = modalTree.querySelector('.content');
	var tip = modalTree.querySelector('.tip');
	t.on(remove, 'click', function (){
		var checkedFiles = whoChecked();  // 选中的文件

		if(checkedFiles.length === 0){
			alert('请选择要移动的文件')
		}else{
			modalTree.style.display = 'block';
			mask.style.display = 'block';

			// 放入树形菜单
			content.innerHTML = createTreeHtml(-1,-1);
			positionSpan(0,content)
		}	
	});

	// 给弹框的counten绑定事件
	t.on(content, 'click',function (ev){
		var target = ev.target;	
		var target = ev.target;

		if(target.nodeName === 'UL') return;
		if(target.classList.contains('content')) return;

		if(target.nodeName === 'I'){
			target = target.parentNode.parentNode
		}else if (target.nodeName === 'SPAN') {
			target = target.parentNode
		}else if (target.nodeName === 'LI') {
			target = target.firstElementChild
		}

		// 找到id
		var id = target.dataset.id;  // 选中的菜单
		var checkedFiles = whoChecked(); // 选中的文件

		positionSpan(id,content);

		// 找到选中菜单的所有的子孙

		// 选中菜单是任意一个选中文件的父级， 提醒“文件已经在该文件夹下”
		// 选中菜单是任意一个选中文件自身或子孙级 ，提醒“不能将文件移动到自身或其子文件夹下”
		var isParent = false;
		for( var i = 0; i < checkedFiles.length; i++ ){
			var fileId = checkedFiles[i].dataset.id;

			if(data[fileId].pid == id){
				console.log('是父级');
				tip.innerHTML = '文件已经在该文件夹下，是父级，不能移动'
				isParent = true;
				break;
			}
				// 判断选中菜单是任意一个选中文件自身或子孙级
				// 需要找到任意个选中文件的自身和子孙级
				// 判断选中菜单是否在找到的自身和子孙级中

			// 选中文件所有的子孙级
			var childs = getChildsAllByIdAndSelf(fileId); // [{},{}]

			// 选中菜单是否在选中选中文件所有的子孙级中

			var len = childs.filter(function (item){
				return item.id == id;	
			}).length;

			if(len){
				tip.innerHTML = '不能将文件移动到自身或其子文件夹下';
				isParent = true;
				break;
			}
		}

		// 不是父级 不是自身 不是子孙级
		if(!isParent){
			tip.innerHTML = ''
		}

		// 给弹框的确定和取消绑定事件

		if(!content.isClick){
			content.isClick = true;

			var ok = modalTree.querySelector('.ok');
			var cancel = modalTree.querySelector('.cancel');
			t.on(ok,'click',function (){
				console.log(!isParent);
				if(!isParent){
					// 把选中的文件的pid设置为选中菜单的id

					for( var i = 0; i < checkedFiles.length; i++ ){
						var fileId = checkedFiles[i].dataset.id;
						data[fileId].pid = id;
					}

					render(currentId);
					treeMenu.innerHTML = createTreeHtml(-1,-1);
					positionSpan(currentId);
					modalTree.style.display = 'none';
					mask.style.display = 'none';	
				}
			})

			t.on(cancel,'click',function (){
				modalTree.style.display = 'none';
				mask.style.display = 'none';	
			})

		}

	})

})();



