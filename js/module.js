/**
 * Plani javascript module
 *
 * jquery 3.1.0
 *
 * @package	Plani javascript Api Module
 * @author	kim seung beom
 * @copyright	Copyright (c) 2016, Plani, Inc.
 * @link	http://plani.co.kr
 * @since	 Version 2.0
 * @filesource
 */
/*
-----------------------------------------------------------
jquery form
*/
$.module['form'] = function( platform, options ) {
	this.platform = platform.eq(0);
	this.file = platform.attr('enctype')=='multipart/form-data';

	this.options = $.extend
	(
		{
			'ajax' : true, 
			'error' : null,
			'success' : null,
			'before' : null,
			'message' : __('처리 되었습니다'), 
			'jgrow' : false,
			'auto_focus' : true,
			'page_exit' : false,
			'page_exit_check' : true
		}, 
		options
	);

	this.__construct();
}

$.extend
(
	$.module['form'].prototype, {
		__construct : function() {
			var $this=this;

			$this.platform
			.addClass('plani-form')
			.prepend('<div class="alert-error"></div><div class="alert-success"></div>')
			.end()
			.on
			(
				'submit', function() {
					$this.options['page_exit_check'] = true;
					// event=before
					if( $this.options['before'] instanceof Function ) {
						if( $this.options['before']($this) != true ) {
							return false;
						}
					}

					// event=ajax
					if( $this.options['ajax'] == true ) {
						$this.request();
						return false;
					}
				}
			);

			$('.submit', $this.platform).on('click', function(){
				$this.platform.submit();
				return false;
			});

			$this.platform.hook();

			if( $this.options['page_exit'] == true ) {
				$.window.on
				(
					'beforeunload', function(){
						if( $this.options['page_exit_check'] == false ) {
							$this.platform.trigger('editor_update');
							if( $('[detect-check=false]', $this.platform).length > 0 ) {
								return __('변경사항이 저장되지 않았을 수 있습니다.');
							}
						}
					}
				);

				$this.detect();
			}
		},
		request : function() {
			var $this = this;

			$this._disposal(true);
			$this.platform.ajaxSubmit
			(
				{
					data: { HTTP_X_REQUESTED_WITH : 'XMLHttpRequest' },
					beforeSubmit : function(a, f, o){ o.dataType	= 'html' },
					success: function ( msg ) {
						var msgSplit = msg.split('::'),
							arg1 = 'failed',
							arg2 = '';

						if( msgSplit[0] == 'true' ) {
							arg1 = 'true';
							arg2 = msgSplit[1] ? msgSplit[1] : '';
						}else if( msgSplit.length > 1 ) {
							arg1 = msgSplit[0];
							arg2 = msgSplit[1];
						}else {
							arg2 = msgSplit[0];
						}

						$this.response( arg1, arg2 );
					}
				}
			);
		},
		response : function( result, msg ){
			var $this = this

			//success
			if( result != 'failed' ) {
				if( $this.options['jgrow'] == true ) {
					$this._jgrow_success( result, msg );
				}else {
					$this._success( result, msg );
				}

			//failed
			}else {
				$this.options['page_exit_check'] = false;
				if( $this.options['jgrow'] == true ){
					$this._jgrow_error( msg );
				}else{
					$this._error( msg );
				}
			}
		},
		detect : function() {
			var $this = this;

			$('input[type=text], input[type=radio], input[type=checkbox], select, textarea', $this.platform).each
			(
				function(){
					var choice_mode = this.type == 'radio' || this.type == 'checkbox'

					$(this)
					.attr('detect', choice_mode == true ? this.checked : this.value)
					.attr('detect-check', 'true')
					.on
					(
						'change', function(){
							var detect = $(this).attr('detect'),
								v = choice_mode == true ? this.checked : this.value;

							$this.options['page_exit_check'] = false;
							$(this).attr('detect-check', detect == v.toString() );
						}
					);
				}
			);
		},
		_disposal : function( method ){
			var $this = this;

			if( method == true )
			{
				$('.alert-error', this.platform).html('');
				$('.alert-success', this.platform).html('');
			}

			$(':image, :submit, .submit', $this.platform).each
			(
				function(){
					if( this.tagName == 'BUTTON' ){
						if( method == true ){
							$(this).attr('disabled', true).find('span').hide().end().append('<span class="saveing"><i class="xi-spinner-3 xi-spin"></i> &nbsp;&nbsp;' +__('처리중')+ '...</span>');
						}else{
							$(this).attr('disabled', false).find('span').eq(0).show().end().eq(1).remove();
						}
					}else{
						if( method == true ){
							$(this).hide().after('<span class="saveing"><i class="xi-spinner-3 xi-spin"></i> &nbsp;&nbsp;' +__('처리중')+ '...</span>');	
						}else{
							$(this).show().next().remove();
						}
					}
				}
			);
		},
		_focus : function( msg ) {
			var focus = msg.match(/<!--focus>(.+)<\/focus-->/g),
				p = msg.match(/<p>(.+)<\/p>/g);


			try {
				for( var i=0; i < focus.length; i++ ){
					var item = focus[i].match(/<!--focus>(.+)<\/focus-->/),
						obj = $('[name='+item[1]+']');

					if( obj.length > 0 ) {
						try {
							var text = p[i].match(/<p>(.+)<\/p>/),
								text_message = text[1].split(' : ');
							obj.eq(0).addClass('tooltip').helper_tooltip({
								message : text_message[1], 
								open : false,
								form_element : true
							});							
						}
						catch (e) {
						}

						if( i == 0 ){
							obj.focus();
						}
					}
				}

			}catch( e ) {
				// return null
			}
		},
		_success : function( result, msg ) {
			var $this = this,
				msg = msg !='' ? msg : this.options['message'];

			$('.alert-success', this.platform)
				.html('<p>' +this.options['message']+ '</p>')
				.fadeIn()
				.find('p')
				.append('<i class="fa fa-times"></i>')
				.find('i')
				.on
				(
					'click', function(){
						$(this).closest('p').remove();
					}
				);
			
			setTimeout
			(
				function(){
					$this._process(msg, true);
				},
				1000
			);			
		},
		_error : function( msg ) {
			if( msg.indexOf('</p>') < 0 ) {
				msg='<p>' +msg+ '</p>';
			}

			$('.alert-error', this.platform)
				.html(msg)
				.fadeIn('slow')
				.find('p')
				.append('<i class="fa fa-times"></i>')
				.find('i')
				.one
				(
					'click', function(){
						$(this).closest('p').remove();
					}
				);
			
			this._process(msg, false);
			this._disposal(false);
			this._focus(msg);
		},
		_jgrow_success : function(result, msg) {
			var $this=this;
			var $this = this,
				msg = msg !='' && result !='redirect' ? msg : this.options['message'];
			
			$.jGrowl
			(
				$this.options['message'], 
				{
					life	: 1000,
					header  : 'SUCCESS',
					close	: function(e, m)
					{ 
						$this._process(msg, true);
					}
				}
			);

		},
		_jgrow_error : function(msg) {
			var $this=this;

			$.jGrowl
			(
				msg, 
				{
					life	: 2000,
					header : 'ERROR',
					close	: function(e, m)
					{ 
						$this._process(msg, false);
						$this._disposal(false);
						$this._focus(msg);
					}
				}
			);
		},
		_process : function( msg, issuccess ) {
			if( issuccess == true ) {
				if( typeof this.options['success'] == 'function' ){
					this.options['success']
					(
						this,
						msg
					);

				}else{
					location.reload();
				}
			}else {
				if( typeof this.options['error'] == 'function' ){
					this.options['error']
					(
						this,
						msg
					);
				}
			
			}
		}
	}
);


/*
-----------------------------------------------------------
jquery modal
*/
$.static.modal = null;
$.module['modal'] = function(platform, options){
	this.platform	= platform;
	this.layer = null;
	this.bg = null;
	this.selector = null;
	this.selector_size = {
		width : 0,
		heigth : 0
	};
	this.timer = null;
	this.status = {
		'open' : false,
		'mode' : 'img',
		'index' : 0
	}
	this.options = $.extend
	(
		{
			'title' : 'untitle',
			'start' : false,
			'close' : true,
			'iframe' : false,
			'width' : 'auto',
			'destory' : false,
			'onclose' : function(){
			}
		}, 
		options
	);

	if(typeof this.platform == 'string'){
		this.platform = $('<a />', { 'href' : this.platform });
		this.options.start = true;
		this.options.destory = true;
	}

	this.layer = $('.plani-modal');
	this.bg = $('.plani-modal-bg');
	this.progress = $('.plani-modal-progress');

	this.__layout();
	this.__construct();
}

$.extend
(
	$.module['modal'].prototype, {
		__layout : function() {
			if( this.layer.length < 1 ){
				this.layer = $('<div />', {'class' : 'plani-modal', 'tabindex' : 0}).html('<div class="modal-title"></div><div class="modal-frame"></div><iframe src="about:blank" class="modal-iframe" title="modal-iframe" />').appendTo('body');
			}
			if( this.bg.length < 1 ){
				this.bg = $('<div />', {'class' : 'plani-modal-bg'}).appendTo('body');
			}
			if( this.progress.length < 1 ){
				this.progress = $('<i />', {'class' : 'xi-spinner-1 xi-spin plani-modal-progress'}).appendTo(this.bg);
			}
		},
		__construct : function() {
			var $this=this;

			$this.platform.on
			(
				'click',function(){
					if( this.tagName  == 'IMG' ){
						$this._imagebox(this);
					}else{
						$this._pagebox(this);
					}

					return false;
				}
			);

			$this.bg.on
			(
				'click', function(){
					if( $this.options.close == true ){
						$this.end();
					}
				}
			);

			$this.layer
			.undelegate('.close-button', 'click')
			.delegate
			(
				'.close-button', 'click', function(){
					$this.end();
					return false;
				}
			)
			.undelegate('.prev-button', 'click')
			.delegate
			(
				'.prev-button', 'click', function(){
					$this.change($this.status.index-1);
					return false;
				}
			)
			.undelegate('.next-button', 'click')
			.delegate
			(
				'.next-button', 'click', function(){
					$this.change($this.status.index+1);
					return false;
				}
			);

			$.window
			.on
			(
				'keydown', function(e){
					if(e.which == 27 && $this.status.open == true){
						$this.end();
						return false;
					}
				}
			)
			.on
			(
				'resize', function(){
					if($this.status.open == true){
						var size=$this._resize($this.selector);
						$this.layer.stop().animate
						(
							{'left' : size.end.left, 'top' : size.end.top, 'min-width' : size.width, 'min-height' : size.height, 'max-width' : size.width},
							'normal'
						);
					}
				}
			)
			.on
			(
				'load', function(){
					if($this.status.open == true){
						var size=$this._resize($this.selector);
						$this.layer.stop().animate
						(
								{'left' : size.end.left, 'top' : size.end.top, 'min-width' : size.width, 'min-height' : size.height, 'max-width' : size.width},
								'normal'
						);
					}
				}
			);

			if( this.options.start == true ){
				$this.platform.eq(0).trigger('click');
			}
		},
		_pagebox : function(obj) {
			var $this=this,
				img=new Image(),
				iframe = $('.modal-iframe', $this.layer),
				frame = $('.modal-frame', $this.layer),
				iframe_src = iframe.attr('src'),
				obj_src = obj.getAttribute('href')+'/layout/modal';

			$this.bg.fadeIn('slow');
			$this.status.open = true;
			$this.status.mode = 'iframe';

			frame.hide();
			iframe.hide();

			title = $this.options.title;
			if( title == 'untitle' && $(obj).attr('title') != '' ) {
				 title = $(obj).attr('title');
			}

			$('.modal-title', $this.layer).html(title + $this._panel(obj));
			if( $this.options.iframe == true ) {
				iframe
					.css({'height' : 'auto'})
					.attr('src', obj_src)
					.off('load')
					.on
					(
						'load', function(){
							var frame = $(this),
								framebody=$(this.contentWindow.document);

							$this.layer.css({'width' : $this.options.width+20}).show();
							frame.show();
							
							img.width = $this.options.width =='auto'? framebody.width() : $this.options.width;
							img.height = framebody.height()+50;

							frame.hide();

							$('body', framebody).css('overflow', 'hidden');

							$this.open
							(
								$this._resize(img, true),
								true,
								function(){
									$this.timer=setInterval
									(
										function(){	
											iframe.stop().animate({'height' : framebody.height()}, 'fast');
										}, 
										100
									);
								}
							);
						}
					)
			}else{
				$.post
				(
					obj.getAttribute('href'), 
					{}, 
					function(data) {
						var target=$('.modal-frame', $this.layer);
						
						target.html(data);

						$this.timer=setTimeout
						(
							function(){
								img.width=$this.options.width =='auto'? target.width() : $this.options.width;
								img.height=target.height();

								$this.layer.css({'width' : img.width+20}).show();
								$this.open
								(
									$this._resize(img, true)
								);
							},
							500
						);
					}
				);					
			}
		},
		_imagebox : function(obj) {
			var $this = this,
				img = $('<img />', {'src' : obj.getAttribute('src'), 'alt' :  obj.getAttribute('alt') || $this.options.title }),
				frame = $('.modal-frame', $this.layer);

			$this.bg.fadeIn('slow');
			$this.status.open=true;
			$this.status.mode = 'img';

			frame.hide();
			img
			.off('load')
			.on
			(
				'load', 
				function(){
					$this.open
					(
						$this._resize(this, true)
					);
				}
			);

			$this.layer.focus();
			$('.modal-frame', $this.layer).html(img);
			$('.modal-title', $this.layer).html(img.attr('alt') + $this._panel(obj));
		},
		_resize : function(obj, isnew){
			var width = isnew == true ? obj.width : this.selector_size.width,
				height = isnew == true ? obj.height : this.selector_size.height,
				maxWidth = $.window.width(),
				maxHeight = $.document.height(),
				layer = this.layer,
				resize = {width : 0, height : 0, start : {}, end : {}},
				margin = 50;

			if( height <= 0 ) {
				height = 150;
			}

			resize.width = width > maxWidth-margin ? maxWidth-margin : width;

			if( resize.width < 150 ){
				resize.width = 150;
			}

			resize.height = Math.round(height-height*0.01*Math.round((width-resize.width) / (width*0.01)));

			if( resize.height > (maxHeight-margin-100) && this.status.mode == 'img' ) {
				resize.height = (maxHeight-margin-100);
				resize.width = Math.round(width-width*0.01*Math.round((height-resize.height) / (height*0.01)));
			}

			resize.start.width = layer.width();
			resize.start.height = layer.height();
			resize.start.left = ((maxWidth - layer.width()) / 2);
			resize.start.top = ((maxHeight- layer.height()) / 3) + $.window.scrollTop();

			resize.end.left = ((maxWidth - resize.width) / 2);
			resize.end.top	= ((maxHeight- resize.height) / 3) + $.window.scrollTop();
			
			if( resize.end.top < 50 ){
				resize.end.top = 50;
			}

			if( isnew == true ){
				this.selector=obj;
				this.selector_size.width= width;
				this.selector_size.height= height;
			}

			return resize;
		},
		_panel : function(obj) {
			var text=[],
				size=this.platform.length,
				index=this.platform.index(obj)+1;
			
			text.push('<span class="modal-panel-close"><a href="#" class="close-button"><i class="xi-close-circle bg-radius"></i></a></span>');

			if( size > 1 ){
				text.push('<span class="modal-panel">');
				if( index > 1 ){
					text.push('<i class="fas fa-chevron-circle-left prev-button"></i>');
				}

				text.push(' <span style="padding:0px 4px"> file of ' + size+ ' / ' + index + '</span> ');

				if( index < size ){
					text.push('<i class="fas fa-chevron-circle-right next-button"></i>');
				}
				text.push('</span>');
			}

			this.status.index=index-1;

			return text.join('');
		},
		open : function(size, iframemode, callback) {
			var $this=this;
			
			//save modal
			$.static.modal = $this;

			$('.modal-title', $this.layer).hide();
			$this.layer.css(
				{'left' : size.end.left, 'top' : size.end.top, 'min-width' : size.width, 'min-height' : size.height, 'max-width' : size.width}
			)
			.animate
			(
				{'opacity' : 'show'}, 
				'normal', 
				function() {
					$(this).animate({'top' : size.end.top});
					if( iframemode == true ){
						$('.modal-iframe', $this.layer).height(size.height).fadeIn('fast', function(){
							if( typeof callback == 'function' ){
								callback();
							}
						})						
					}else{
						$('.modal-frame', $this.layer).fadeIn('fast');
					}

					$this.layer.focus();
					$('.modal-title', $this.layer).show();
					$this.progress.hide();
				}
			);
			
			if( $.window.width() < size.start.width ){
				var size = $this._resize(
					$this.selector
				);
				
				$this.layer.css
				(
					{'left' : size.end.left, 'top' : size.end.top, 'min-width' : size.width, 'min-height' : size.height, 'max-width' : size.width}
				);
			}
		},
		end : function() {
			this.bg.stop().fadeOut();
			this.layer.stop().fadeOut();
			this.progress.show();
			this.status.open=false;
			this.platform.focus();
			if(typeof this.timer != 'undefined' ){
				clearInterval(this.timer);
				this.timer = null;
			}

			if(typeof this.options.onclose == 'function'){
				this.options.onclose();

				if( this.options.destory == true ) {
					this.options.onclose = null;
				}
			}

			try {
				clearInterval(this.timer);
			}
			catch (e) {
			}
		},
		change : function(index) {
			this.layer.stop().hide();
			this.progress.show();
			this.status.open=false;

			if(typeof this.timer != 'undefined' ){
				clearInterval(this.timer);
				this.timer = null;
			}

			if( typeof index == 'string' ) {
				$('.modal-iframe', this.layer).attr('src', index)
			}else {
				this.platform.eq(index).trigger('click');
			}
		}
	}
);



/*
-----------------------------------------------------------
jquery print
*/
$.module['print'] = function(platform, options) {
	this.platform = platform;
	this.options = $.extend
	(
		{ 
			'layer' : 'body',
			'javascript' : false,
			'style' : true
		}, 
		options
	);

	this.iframe = $('.plani-print-iframe');

	this.__layout();
	this.__construct();
}

$.extend
(
	$.module['print'].prototype, {
		__layout : function() {
			if( this.iframe.length < 1 ){
				this.iframe = $('<iframe src="about:blank" class="plani-print-iframe">').insertBefore('body');
			}
		},
		__construct : function() {
			var $this = this;

			$this.platform.on
			(
				'click', function(){
					$this.area_print();
				}
			);
		},
		area_print : function(){
			var $this = this,
				head_clone = $('head').clone(),
				body_clone = $($this.options.layer),
				doc = [];

			if( $this.options.javascript == false ){
				head_clone.find('script').remove();
				body_clone.find('script').remove();
			}

			if( $this.options.style == false ){
				head_clone.find('link, style').remove();
				body_clone.find('link, style').remove();
			}

			doc.push('<!doctype html>');
			doc.push('<html lang="ko-KR">');
			doc.push('<head>');
			doc.push(head_clone.html());
			doc.push('</head>');
			doc.push('<body>');
			doc.push(body_clone.html());
			doc.push('</body>');
			doc.push('</html>');

			var framebody = $this.iframe.get(0).contentWindow.document;
			with(framebody) {
				designMode='on';
				open();
				writeln(doc.join(''));
				close();
			}

			$this.iframe.one('load', function(){
				framebody.body.focus();
				framebody.execCommand('print', 0, 0);

				try {
					$.static.modal.end();
				} catch (e) {

				}
			});

		}
	}
);

/*
-----------------------------------------------------------
jquery nested sortable
*/
$.module['nested.sortable'] = function(platform, options) {
	this.platform = platform;
	this.ol = $('ol:eq(0)', platform);
	this.begin = false;
	this.removesData = [];
	this.not_visible_remove = true;

	this.options = $.extend
	(
		{	
			'title' : '',
			'obj' : {
				'group' : $('button:eq(0)', platform),
				'message' : $('.message', platform)
			},
			'item-level' : 3,
			'item-name' : '그룹메뉴',
			'item-sub-name' : '서브메뉴',
			'item-id' : 0,
			'isAllowed' : function(){
				return true;
			},
			'axis' : 'xy',
			'submit_jgrow' : true,
			'submit_success' : null,
			'event' : {
				'click' : null			
			}
		},
		options
	);

	this.__construct();
}

$.extend
(
	$.module['nested.sortable'].prototype, {
		__construct : function() {
			var $this = this;

			$this.platform.addClass('plani-nested-wrap');

			if( this.options.title != '' )
			{
				$this.platform.prepend('<h2 class="title">' +this.options.title+ '</h2>');			
			}

			new $.module['form']
			(
				$this.platform,
				{
					before : function(module){
						$this._serialize();
						return true;
					},
					success : function(module, result){
						$this.options.obj.message.hide();
						module._disposal(false);

						if( typeof $this.options.submit_success == 'function' ){
							console.log('d');
							$this.options.submit_success(module);
						}
					},
					jgrow : $this.options.submit_jgrow
				}
			);

			$this.options.obj.group
			.on
			(
				'click', function() {
					$this._import_group();
				}
			);

			$this.ol
			.delegate
			(
				'div',
				'mouseenter',
				function(){
					if($(this).hasClass('not-remove') == false) {
						$('<i class="fa fa-times tmp-button" style="right:14px"></i>')
						.appendTo(this)
						.on
						(
							'click',
							function(){
								$this._remove(this);
							}
						);
					}

					if($(this).parents('ol').length < $this.options['item-level']) {
						$('<i class="fa fa-plus tmp-button" style="right:34px"></i>')
						.appendTo(this)
						.on
						(
							'click',
							function(){
								$this._import(this);
							}
						);					
					}
				}
			)
			.delegate
			(
				'div',
				'mouseleave',
				function(){
					$('.tmp-button', this).remove();
				}
			)
			.delegate
			(
				'div',
				'click',
				function(e){
					if( e.target == this || $(e.target).hasClass('tmp-button') == false ){
						$this._hook('click', this);
					}
				}
			)
			.delegate
			(
				'div',
				'dblclick',
				function(e){
					if(e.target.tagName.toLowerCase() == 'span'){
						var target=$('span', this);

						$(this).find('.tmp-button').remove();
						target
							.html('<input type="text" value="' +target.text().trim()+ '"/>')
							.find('input')
							.focus()
							.one(
								'focusout',
								function(){
									var value=$(this).val().replace(/[\+]/g,'＋');

									target.text(value? value : 'Empty');
								}
							)
							.keyenter('focusout');
					}
				}
			);

			$this.ol.nestedSortable
			(
				{
					axis: $this.options['axis'],
					isAllowed: $this.options['isAllowed'],
					forcePlaceholderSize: true,
					handle: '.move',
					helper:	'clone',
					items: 'li',
					opacity: .8,
					placeholder: 'placeholder',
					revert: 250,
					tabSize: 25,
					tolerance: 'pointer',
					toleranceElement: '> div',
					maxLevels: $this.options['item-level'],
					isTree: true,
					expandOnHover: 700,
					startCollapsed: true,
					complate : function(){
						$this._depth();
					}
				}
			);

			$this._depth();
		},
		_depth : function(){
			var $this = this,
				target = $('li', $this.platform);

			setTimeout
			(
				function(){
					if( $this.not_visible_remove == true ) {
						$('li:not(:visible)', $this.ol).remove();
					}

					target.each
					(
						function(){
							var icon = $(this).has('li').length > 0? 'fa-folder-open' : 'fa-folder',
								div = $('div:eq(0)', this);

							if($('.move', div).length  < 1)
							{
								div.html('<i class="far fa-eye-slash"></i><i class="far ' +icon+ ' move"></i><span>' +div.text()+ '</span>');
							}else
							{
								$('.move', div).attr('class', 'far ' +icon+ ' move');
							}
						}
					);

					if($this.begin == true){
						$this.options.obj.message.show();
					}

					if($this.begin == false){
						$this.begin=true;
					}			
				}, 300
			)
		},
		_import_group : function(){
			var $this = this,
				target = $this.ol,
				newid = $this._latest();

			target.append('<li id="list_' +newid+ '"><div class="new">' +$this.options['item-name']+ '</div></li>');
			
			$this._depth();	
		},
		_import : function( obj ){
			var $this = this,
				target = $(obj).closest('li'),
				newid = $this._latest();

			
			if( target.is(':has(> ol)') == false ){
				target = $('<ol />').appendTo(target);
			}else{
				target = target.find('> ol');
			}

			target.append('<li id="list_' +newid+ '"><div class="new">' +$this.options['item-sub-name']+ '</div></li>');
			
			$this._depth();	
		},
		_latest : function(){
			var no = parseInt(this.options['item-id']);
			$('li', this.platform).each
			(
				function(){
					var id=parseInt(this.id.replace('list_', ''));
					if(id > no){
						no = id;
					}
				}
			);

			return no+1;
		},
		_remove : function( obj ){
			var $this=this;

			$(obj).closest('li').slideUp
			(
				function(){
					$this.removesData.push(this.id.replace('list_', ''));

					$(this).find('li').each
					(
						function(){
							if( typeof this.id != 'undefined' ){
								$this.removesData.push(this.id.replace('list_', ''));
							}
						}
					)

					$(this).remove();
					$this._depth();
				}	
			);
		},
		_serialize : function(){
			var $this=this,
				//toArray= $this.ol.nestedSortable('toArray', {startDepthCount: 0}),
				serialized = $this.ol.nestedSortable('serialize').split('&'),
				hash = []

			$('.postdata', $this.platform).remove();

			postdata = $('<div />', {'class' : 'postdata'}).appendTo($this.platform);

			for(var i=0; i< serialized.length; i++){
				if( serialized[i] == '' ){
					continue;
				}

				var item = serialized[i].replace('list[', '').split(']='),
					id = item[0],
					pid = item[1]=='null'? 0 : item[1],
					text = $('#list_' + id + ' > div', $this.ol).text().trim(),
					sort = 1,
					str =''

					if( typeof hash[pid] == 'undefined'){
						hash[pid]=1;
					}else{
						hash[pid]+=1;
					}

					sort = hash[pid];
					postdata.append($('<input />', {'type' : 'hidden', 'name' : 'sitemap['+id+'][id]', 'value' : id}));
					postdata.append($('<input />', {'type' : 'hidden', 'name' : 'sitemap['+id+'][pid]', 'value' : pid}));
					postdata.append($('<input />', {'type' : 'hidden', 'name' : 'sitemap['+id+'][text]', 'value' : text}));
					postdata.append($('<input />', {'type' : 'hidden', 'name' : 'sitemap['+id+'][sort]', 'value' : sort}));
			}

			for(var i=0; i< $this.removesData.length; i++){		
				postdata.append($('<input />', {'type' : 'hidden','name' : 'sitemap_remove[]', 'value' : $this.removesData[i]}));
			}
		},
		_hook : function(action, target){			
			if( typeof this.options.event[action]  == 'function' )
			{	
				this.options.event[action](target);
			}
		}
	}
);

/*
-----------------------------------------------------------
tree nodes
*/
$.module['nested.tree'] = function(platform, options) {
	this.platform = platform;
	this.ul = $('ul', platform);
	this.options = $.extend
	(
		{
			'title' : 'nodes',
			'open' : false
		},
		options
	);

	this.__construct();
}
$.extend
(
	$.module['nested.tree'].prototype, {
		__construct : function() {
			var $this = this;

			$this.platform.addClass('plani-tree-wrap');

			if( this.options.title != '' )
			{
				$this.platform.prepend('<h2 class="title">' +this.options.title+ '</h2>');
			}

			$this.ul.each
			(
				function(){
					var li=$(this).find('>li');
					li.each
					(
						function(){
							$(this).prepend( $(this).is(':has(ul)') == true ? '<span class="plus button"></span><span class="folder"></span>' : '<span class="page"></span>');
						}
					);
					li.eq(-1).addClass('joinend');
				}
			);

			$('li:has(ul) .button', $this.ul).on
			(
				'click'	, $this._open
			);

			if( this.options.open == true ) {
				$('li:has(ul) .button', $this.ul).trigger('click');
			}
		},
		_open : function(e){
			var target = $(this).closest('li'), 
				ul = target.find('>ul'), 
				span = target.find('span'), 
				hide = ul.is(':hidden');

			if( hide == true ){
				ul.show();
			}else{
				ul.hide();		
			}

			span.eq(0).attr('class',hide? 'minus' : 'plus')
				.end()
				.eq(1).attr('class',hide? 'folder-open' : 'folder');
		}
	}
);

/*
-----------------------------------------------------------
animate flip
*/
$.module['animate.flip'] = function( platform, options ) {
	this.platform = platform;
	this.btn = {
		'flip' : $('.flip', platform),
		'unflip' : $('.unflip', platform)
	}
	this.layer = {
		'front' : $('.front', platform),
		'back' : $('.back', platform)
	}
	this.queue = true;

	this.options = $.extend
	(
		{
			trigger : 'menual',
			reverse: true,
			axis: 'y'
		}, 
		options
	);

	this.__construct();
}

$.extend
(
	$.module['animate.flip'].prototype, {
		__construct : function() {
			var $this = this

			$this.platform.addClass('plani-flip').flip($this.options);

			$this.btn.flip.on
			(
				'click', function(){
					$this._flip();
				}
			);

			$this.btn.unflip.on
			(
				'click', function(){
					$this._unflip();
				}
			);

			setInterval
			(
				function(){
					var layer = $this.queue == true? $this.layer.front : $this.layer.back;
					$this.platform.height(layer.height())
				},
				100
			);

			$this._unflip();
		},
		_flip : function(){
			this.queue = false;
			this.platform.flip(true);
			this.layer.back.css('opacity', '1');
			this.layer.front.css('opacity', '0');		
		},
		_unflip : function(){
			this.queue = true;
			this.platform.flip(false);
			this.layer.front.css('opacity', '1');
			this.layer.back.css('opacity', '0');
		}
	}
);



/*
-----------------------------------------------------------
animate tabs
*/
$.module['animate.tabs'] = function( platform, options ) {
	this.platform = platform;
	this.btn = $(' > ol > li', platform);
	this.layer = $(' > div', platform);
	this.options = $.extend
	(
		{
			start : '0',
			prefix : '<i class="fa fa-angle-right" aria-hidden="true"></i>'
		}, 
		options
	);

	this.__construct();
}

$.extend
(
	$.module['animate.tabs'].prototype, {
		__construct : function() {
			var $this=this;

			$this.btn.attr('tabindex', 0);
			$this.btn.prepend($this.options.prefix);

			$this.btn.on
			(
				'click', function( e ){
					var no=$this.btn.index(this);

					$this.btn.removeClass('on').eq(no).addClass('on');
					$this.layer.hide().eq(no).fadeIn('fast');
				}
			)
			.keyenter('click')
			.eq($this.options.start)
			.trigger('click');
		}
	}
);



/*
-----------------------------------------------------------
animate scroll
*/
$.module['animate.scroll'] = function( platform, options ) {
	var $this = this;
	$this.platform = platform;

	//bug
	$.window.on('load', function(){
		$this.fix = $this.platform.position().top;
		$this.__construct();	
	});
}

$.extend
(
	$.module['animate.scroll'].prototype, {
		__construct : function() {
			var $this=this;

			$.window.on
			(
				'scroll', function(){
					var top = $(document).scrollTop(),
						move = top > $this.fix ? (top-$this.fix) : 0;

					console.log($.window.height());

					if( $.window.height() > ($this.platform.height()+100) || move == 0 ) {
						$this.platform.stop().animate
						(
							{ 'top' : move }
						);
					}
				}
			).on
			(
				'resize', function(){
					$this.platform.css('top', 0);
					$.window.trigger('scroll');
				}
			);

			setTimeout(function(){
				$.window.trigger('scroll');
			},100)
		}
	}
);

/*
-----------------------------------------------------------
board lists
*/
$.module['board.lists'] = function( platform, options ){
	this.platform = platform;
	this.options = $.extend
	(
		{
			'layer' : '.request',
			'grid' : false,
			'autoload' : false,
			'callback' : function(){}
		}, 
		options
	);
	this.grid_options  = {
		'able' : this.options.grid,
		'paging' : null,
		'col_width' : [],
		'min_height' : 200
	}
	this.pos_left = 0;
	this.layer = $(this.options.layer, platform);

	this.__construct();
}

$.extend
(
	$.module['board.lists'].prototype, {
		__construct : function() {
			var $this=this;

			$this.layer.addClass('plani-board-lists');
			$this.platform.delegate('.paging-area a', 'click', function(){
				if( $(this).attr('href') != '#' ){
					$this.request( $(this).attr('href') );
				}
				return false;
			});

			new $.module['form']( $this.platform, {
				'ajax' : false,
				'before' : function(){
					$this.request();
					return false;
				}
			});

			if( $this.options.autoload == true ) {
				$this.request();
			}else {
				$this._trigger();			
			}			
		},
		request : function( url ){
			var $this = this;

			if( !url ){
				url = $this.platform.attr('action');
			}

			try {
				var $scrollerOuter  = $( '.mCustomScrollbar' );
				var $dragger        = $scrollerOuter.find( '.mCSB_dragger' ).eq(1);
				var scrollWidth    = $scrollerOuter.find( '.mCSB_container' ).width();
				var draggerLeft      = $dragger.position().left;
				var scrollLeft = draggerLeft / ($scrollerOuter.width() - $dragger.width()) * (scrollWidth - $scrollerOuter.width());
				$this.pos_left = scrollLeft;
			}
			catch (e) {
			}

			$this.layer.append('<div class="progress"><i class="xi-spinner-1 xi-spin"></i></div>');
			$.request( { 'url' : url,'param' : $this.platform.serialize() }, function( html ){
				var $html = $(html);

				history.pushState({}, '', $html.find('input[name=history]').val());
				if( $this.grid_options.able == true ) {
					$this._grid_reset();
				}

				$html.filter(':not(' +$this.options.layer+ ')').find('[update-id]').each(function(){
					var obj1 = $(this),
						obj2 = $('[update-id=' +obj1.attr('update-id')+ ']', $this.platform);

					if( obj2.length > 0 ){
						obj2.after(obj1).remove();
					}
				});

				$this.layer.html($html.find($this.options.layer).html());
				$this._trigger();
			});
		},
		_trigger : function(){
			var $this=this,
				order_by=$('[name=search_order]', $this.platform).val(),
				sort=typeof order_by != 'undefined' ? order_by.split(' ') : ['', 'asc'],
				th=$('th[sort]', $this.platform);

			if( typeof $this.options.callback == 'function' ){
				this.options.callback($this.platform);
			}

			th.each
			(
				function(){
					var target=$(this);
					target.append('<span class="sort"></span>').addClass('cursor-hand');

					if( target.attr('sort') == sort[0] ){
						$('span', target).attr('class', 'sort ' + (sort.length < 2 ? 'asc' : sort[1]) );
					}

					target.on('click', function(){
						var span=$('span', target),
							order_by=span.hasClass('asc') == true? 'desc' : 'asc',
							val=target.attr('sort') + ' ' + order_by;

						$('[name=search_order]', $this.platform).val(val);
						$this.platform.submit();
					});
				}
			);

			if( $this.grid_options.able == true ) {
				$this._grid_set();
			}
		},
		_grid_set : function() {
			this.layer.addClass('plani-grid');

			if( this.grid_options.paging == null ){
				this.grid_options.paging = $('<div />', {'class' : 'plani-grid-paging'});
				this.layer.after(this.grid_options.paging);
			}

			this.grid_options.paging.html(this.layer.children().not('table'));

			this._grid();
		},
		_grid_reset : function() {
			this.layer.mCustomScrollbar("destroy");
			this.layer.removeClass('plani-grid');

		},
		_grid_scroll : function() {
			var top = parseInt($('.mCSB_container', this.layer).css('top'))*-1;

			$('.col-resize', this.layer).css('top', top);
			try {
				var tfoot = $('tfoot', this.layer);
				
				tfoot.css('top', (top + this.layer.height() - tfoot.height())-2);
			}catch (e) {
			}
		},
		_grid_resize : function( cols, base, extend ) {
			var $this = this,
				table_width = $('table', $this.layer).width(),
				base_col_size = base.length;

			base.each
			(
				function( no ){
					var w = $(this).width();

					if( extend == true ){
						if( typeof $this.grid_options.col_width[no] != 'undefined' ){
							w = $this.grid_options.col_width[no];
						}
						if( w < 60 ){
							w = 60;
						}
					}

					if( base_col_size == (no+1) ) {
						w=table_width;
					}else {
						table_width-=w;
					}

					for( var key in cols ) {
						var col = cols[key];
						try {
							col.eq(no).width(w);
						}catch (e) {
						}
					}

					$this.grid_options.col_width[no] = w;
				}
			);	
		},
		_grid_resize_overap : function( overap, base ) {
			var $this = this;

			for( var i=0; i < overap.length; i++ ) {
				var target= overap[i],
					w = 0,
					l = 0

				for( var x=target.start; x<=target.end; x++ ) {
					w+=base.eq(x).outerWidth();

					if( x == target.start ){
						l =	base.eq(x).position().left;
					}
				}

				target.obj.css({'left': l+($.info.isie == true ? -1 : 0), 'width' : w+1});
			}
		},
		_grid : function() {
			var $this = this,
				_table = $('table', $this.layer),
				_thead = $('thead', _table), 
				_tbody = $('tbody', _table), 
				_tfoot = $('tfoot', _table), 
				_trows = $('trows name', $this.platform), 
				_trows_cols = [],
				_ths = $('tr:eq(0) th', _thead), 
				_tds = $('tr:eq(0) td', _tbody),
				_tfoot_tds = $('td', _tfoot),
				_col_size = _ths.length

			if( _tds.length > 0 ) {
				_tbody.append('<tr><td colspan="' +_col_size+ '" class="end-tr">&nbsp;</td></tr>');
			}

			if( _trows.length > 0 ) {
				var eq_no = 0;
				_trows.each
				(
					function(){
						var colspan = parseInt($(this).attr('colspan')),
							text = $(this).attr('value'),
							bg = $(this).attr('bg')

						if(  colspan > 1 ) {
							_ths.eq(eq_no).prepend('<div class="grp">'+text+'</div>');
							for(var i=1; i<colspan; i++ ){
								_ths.eq(eq_no+i).prepend('<div class="grp">&nbsp;</div>')
							}

							_trows_cols.push({'obj' : $('<div />', {'class' : 'grp-overap'}).html(text).css('background', bg) , 'start' : eq_no, 'end' : eq_no+(i-1)});
						}else {
							_ths.eq(eq_no).prepend('<div class="grp-text">&nbsp;</div>');						
						}
						eq_no+=colspan;
					}
				);
			}

			$this._grid_resize(
				[_ths], _ths, true
			);

			$this.layer.mCustomScrollbar({
				theme : 'minimal-dark', //rounded-dark
				axis:"xy",
				scrollButtons:{
				  enable : true
				},
				setLeft : ($this.pos_left+ (($this.pos_left / 500)*10)) + 'px',
				callbacks:{
					 onInit : function(){
						$this._grid_scroll();
					 },
					 whileScrolling : function(){
						 $this._grid_resize(
							[_ths, _tfoot_tds], _ths, true	 
						 );
						 $this._grid_scroll();
					}
				}
			});
			$this.pos_left = 0;

			$.window.off('resize.grid').on
			(
				'resize.grid', function() {
					$('.col-resize', _table).remove();

					var clone = _thead.clone().height(_thead.height()+1).addClass('col-resize'),
						clone_th = $('th', clone).height(_thead.height()+1);

					clone_th.each
					(
						function(no){
							$(this)
							.on
							(
								'click', function(){
									_ths.eq(no).trigger('click');
								}
							);
						}
					);

					for( var i=0; i < _trows_cols.length; i++ )
					{
						clone.append(_trows_cols[i].obj);
					}

					_table.prepend(clone);


					var layer_height = $(this).height() - $this.layer.offset().top - $this.grid_options.min_height;
					if( layer_height > _table.height()+50 ) {
						layer_height = _table.height()+50;
					}

					if( layer_height < $this.grid_options.min_height ) {
						layer_height = $this.grid_options.min_height;
					}

					$this.layer.height(layer_height);

					_table.removeAttr('id').colResizable({
						'minWidth' : 60,
						'onResize' : function(e){
							$this._grid_resize_overap(
								_trows_cols, clone_th
							);
							$this._grid_resize(
								[_ths,  _tfoot_tds], clone_th, false
							);
						}
					});

					$this._grid_resize(
						[_ths,  _tfoot_tds], clone_th, false
					);
					$this._grid_resize(
						[_ths,  _tfoot_tds], clone_th, true
					);
					$this._grid_resize_overap(
						_trows_cols, _ths
					);
					$this._grid_scroll();

				}
			);

			setTimeout(function(){
				$.window.trigger('resize.grid');
			}, 500);
		}
	}
);

/*
-----------------------------------------------------------
board masonry
*/
$.module['board.masonry'] = function( platform, options ){
	this.platform = platform;
	this.options = $.extend
	(
		{
			'layer' : '.request',
			'paging' : '.paging-area',
			'items' : '.masonry_item',
			'callback' : function(){}
		}, 
		options
	);

	this.params = { num : 0, width : 0, margin : 20 }
	this.layer = $(this.options.layer, platform);
	this.items = $(this.options.items, this.layer);
	this.pageing = $(this.options.paging, platform).hide();
	this.progress = $('<div />', {'class' : 'progress' }).html('<i class="xi-spinner-1 xi-spin"></i>').appendTo(this.layer);
	this.empty = $('<div />', {'class' : 'empty-data' }).html(__('검색 결과가 없습니다')).appendTo(this.layer);

	this.__construct();
}


$.extend
(
	$.module['board.masonry'].prototype, {
		__construct : function(){
			var $this=this;

			$this.layer.addClass('plani-board-masonry');
			$this.platform.delegate
			(
				'.paging-area a', 'click', function(){
					if( $(this).attr('href') != '#' ){
						$this.request( $(this).attr('href'), true );
					}
					return false;
				}
			);

			new $.module['form']
			(
				$this.platform, {
					'ajax' : false,
					'before' : function(){
						$this.request();
						return false;
					}
				}
			);

			setTimeout(function(){
				$this.progress.remove();
				$this.pageing.show();
				$this.resizer
				(
					$this.layer.width(),
					'fadein'
				);
				$(this).on
				(
					'resize', function(){
						if( typeof this.resizedFinished != 'undefined' ){
							clearTimeout(this.resizedFinished);
						}

						this.resizedFinished = setTimeout
						(
							function(){
								$this.resizer
								(
									$this.layer.width(),
									'sort'
								);
							}, 
							200
						);
					}
				);
			}, 300);
		},
		resizer : function( width, method ){
			var $this=this,
				num = 6

			if( width < 600)
				num = 1;
			else if( width <= 800)
				num = 2;
			else if( width <= 1100 )
				num = 3;
			else if( width <= 1400 )
				num = 4;
			else if( width <= 1700 )
				num = 5;

			$this.params.num = num;
			$this.params.width = width;
			$this.items = $($this.options.items, this.platform);
			
			setTimeout
			(
				function(){
					$this.netsort(method);
				}, 100
			)
		},
		netsort : function(method){
			var $this=this,
				positioning = $this._position( method ),
				original_method = method,
				myno = 0;

			$this.items.each
			(
				function(no){
					var target = $(this),
						item_pos = positioning[myno];

					if( original_method == 'reload' )
					{
						if(typeof target.attr('data-load') != 'undefined' ){
							myno++;
							method = target.attr('data-load');
						}else{
							method = 'fadeout';
						}
					}else{
						myno++;
					}

					target.stop();

					if( method == 'fadein'){
						target.css
						(
							{'left' : item_pos.end_left, 'top' : item_pos.end_top, 'transform' : 'scale(0.5, 0.5)', 'opacity' : 0}
						);

						target.transition
						(
							{
								'opacity' : 1,
								'transform' : 'scale(1.0, 1.0)',
								'duration' : 800
							}
						);
					}else if( method == 'fadeout' )
					{
						target.transition
						(
							{
								'opacity' : 0,
								'transform' : 'scale(0.5, 0.5)',
								'duration' : 800
							},
							function(){
								target.remove();
							}
						);

					}else
					{
						target.animate
						(
							{
								'left' : item_pos.end_left, 
								'top' : item_pos.end_top, 
								'opacity' : 1
							},
							{ duration : 500 + (no*50) },
							'slow',
							'easeOutCirc'
						);
					}
				}
			);
		},
		request : function( url, focus ){
			var $this = this;

			if( !url ){
				url = $this.platform.attr('action');
			}

			$.request
			(	
				{
					'url' : url,
					'param' : $this.platform.serialize()
				},
				function( html ){
					if( focus == true ) {
						$('html, body').scrollTop($this.layer.position().top);
					}

					$this._parse(html);
				}
			);
		},
		_parse : function( html ){
			var $this=this,
				text_obj=$(html),
				new_items=$(this.options.items, text_obj).clone(),
				paging=$(this.options.paging, text_obj).clone(),
				sorts =[];

			$this.items = $(this.options.items, $this.layer);
			$this.items.removeAttr('data-load');

			new_items.each
			(
				function(no){
					var new_target = $(this),
						new_target_data = new_target.data(),
						old_target = $this.items.filter('[data-id=' +new_target_data.id+ ']');

					old_target.find('a').attr('href', new_target_data.href);
					
					if( $this.items.eq(no).length == 0 ){
						if( old_target.length < 1 ){
							sorts[no]=new_target.attr('data-load', 'fadein');
						}else{
							sorts[no]=old_target.attr('data-load', 'sort');
						}
					}else{
						if( old_target.length < 1 ){
							sorts[no]=new_target.attr('data-load', 'fadein');
						}else{
							sorts[no]=old_target.attr('data-load', 'sort');
						}
					}
				}
			);

			for(var i=0; i<sorts.length; i++) {
				$this.layer.append(sorts[i]);
			}

			if( sorts.length == 0 ){
				$this.empty.show();
				$this.pageing.html('');
			}else{
				$this.empty.hide();
				$this.pageing.html(paging.html());
			}
			$this.resizer
			(
				$this.layer.width(),
				'reload'
			);
		},
		_position : function( method ){
			var $this=this,
				$params = $this.params,
				$return = {},
				$items = method == 'reload'? $this.items.filter('[data-load]') : $this.items,
				item_width = (($params.width - (($params.num+1)*$params.margin)) / $params.num) + (($params.margin / $params.num) * 2),
				latest_height = [];
		


			$items.stop().width(item_width).removeAttr('data-no').each
			(
				function( no ){
					var item_sort_num = no == 0 ? 0 : no % $params.num,
						item_sort_top_target = $items.filter('[data-no=' +item_sort_num+ ']'),
						item_left = (($params.margin / 2) + (item_sort_num * $params.margin) + (item_width * item_sort_num)) - ($params.margin ) ,
						item_top = item_sort_top_target.length < 1? 0 : $this._top_sum(item_sort_top_target, method),
						target = $(this);


					target.attr({ 'data-no' : item_sort_num });
					$return[no] = {
						'end_width' : item_width,
						'end_height' : target.height(),
						'end_left' : item_left,
						'end_top' : item_top
					}

					latest_height.push(item_top + target.height());
				}
			);

			$this.layer.stop().animate({ 'height' : Math.max.apply(null, latest_height) + 50 });

			return $return;
		},
		_top_sum : function(item_sort_top_target){
			var h=0;

			item_sort_top_target.each
			(
				function(){
					h+=$(this).height();
				}
			);		

			return h + (this.params.margin * item_sort_top_target.length);

		}
	}
);
