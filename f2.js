/*
 * FullImageViewer 0.1
 *
 * Sadpig
 * Copyright 2014, MIT License
 *
 */

function f(container, options) {
	"use strict";
	var opt = !!options ? options : {};

	//默认开启惯性滚动
	if ('inertialScrolling' in opt) {
		opt.inertialScrolling = opt.inertialScrolling;
	} else {
		opt.inertialScrolling = true;
	}
	var imgNode,
		con = container,
		element = con.children()[0];
	if (!('url' in opt) || !opt.url) {
		return;
	}
	if (!con) {
		return;
	}
	var browser = {
		addEventListener: !!window.addEventListener,
		touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
		transitions: (function(temp) {
			var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
			for (var i in props)
				if (temp.style[props[i]] !== undefined) return true;
			return false;
		})(document.createElement('f'))
	};

	var min = 0;
	var max = 0;
	var imgHeight = 0;
	var start = {};
	var delta = {};
	var pos = {
		x: 0,
		y: 0,
		frame: 0
	}
	var ticker, v, amp, target, isTouchstart,img;

	var isScrolling;

	loader(opt.url, function(o) {
		img = element.appendChild(o);
		imgHeight = img.parentNode.offsetHeight;
		max = getMax();
		if (browser.touch) {
			element.addEventListener('touchstart', events, false);
			element.addEventListener('click', events, false);
		}

	});
	var events = {
		handleEvent: function(event) {
			//console.log(event);
			//console.log(123);
			event.preventDefault();
			switch (event.type) {
				case 'touchstart':
					this.start(event);
					break;
				case 'touchmove':
					this.move(event);
					break;
				case 'touchend':
					this.end(event);
					break;
				case 'click':
					this.close(events);
					//case 'webkitTransitionEnd':
					//case 'msTransitionEnd':
					//case 'oTransitionEnd':
					//case 'otransitionend':
					//case 'transitionend': offloadFn(this.transitionEnd(event)); break;
					//case 'resize': offloadFn(setup); break;
			}
		},
		start: function(event) {
			isScrolling = false;
			if (opt.inertialScrolling) {
				ticker = setInterval(track, 33);
			}
			var touches = event.touches[0];
			start = {

				// get initial touch coords
				x: touches.pageX,
				y: touches.pageY,

				time: +new Date

			};


			element.addEventListener('touchmove', this, false);
			element.addEventListener('touchend', this, false);
		},
		move: function(event) {

			if (event.touches.length > 1 || event.scale && event.scale !== 1) return;
			var touches = event.touches[0];

			delta = {
				x: touches.pageX - start.x,
				y: touches.pageY - start.y
			}


			isScrolling = true;
			//console.log(delta.y);

			translate(element, pos.y + delta.y, 0, 122);


		},
		end: function(event) {
			clearInterval(ticker);
			if (!isScrolling) return;
			pos.x = pos.x + delta.x
			pos.y = pos.y + delta.y;
			if (opt.inertialScrolling ) {

				if (v > 10 || v < -10 || pos.y < max || pos.y > min) {
					amp = 0.3 * v;
					console.log("amp:"+amp);
					console.log("pos.y:"+pos.y);
					target = Math.round(pos.y + amp);

					if (target <= max) {
						target = max;
						amp = target - pos.y;
					} else if (target >= min) {
						target = min;
						amp = target - pos.y;
					}
					console.log('target:'+target);
					//target = Math.round(pos.y+amp) < -1531 ? -1531 : Math.round(pos.y+amp);
					start.time = Date.now();
					requestAnimationFrame(autoScroll);

				}
			}

		},
		close: function(event) {
			con.hide();
		}
	}

	function getMax() {
		return max = parseInt(con.height()) - imgHeight;
	}

	function autoScroll() {
		if (!isScrolling) return;
		var elapsed, deltaY;
		if (amp) {
			elapsed = Date.now() - start.time;
			//console.log(elapsed);
			deltaY = -amp * Math.exp(-elapsed / 325);
			if (deltaY > 1 || deltaY < -1) {

				translate(element, target + deltaY, 0, 178);
				pos.y = target + deltaY;
				requestAnimationFrame(autoScroll);
			} else {
				pos.y = target;
				translate(element, target, 0, 183);

			}
		}
	}


	function translate(ele, dist, speed, t) {
		if (!isScrolling) return;
		console.log(t);
		var slide = ele;
		var style = slide && slide.style;

		if (!style) return;



		style.webkitTransform = 'translateY(' + dist + 'px)';
		style.msTransform =
			style.MozTransform =
			style.OTransform = 'translateY(' + dist + 'px)';
	}

	function track() {
		var now, elapsed, deltaY;
		now = Date.now();
		elapsed = now - start.time; //其实这里近似就是100ms了
		start.time = now; //更新时间戳

		deltaY = delta.y - pos.frame;
		pos.frame = delta.y; //计算偏移,offset仍然在scroll()函 数中被更新
		v = 1000 * deltaY / (1 + elapsed); //防止分母为0的情况
		//console.log(v);
	}



	function loader(url, callback) {
		var o = new Image();
		o.src = url;
		if (o.complete) {
			callback(o);
		} else {
			o.onload = function() {
				callback(o);
			};
			o.onerror = function() {
				window.alert('图片加载失败:' + url).show();
			};
		}
	}
	return {
		show: function() {
			con.show();

		},
		get: function() {
			console.log(pos);
		},
		hide: function() {
			con.hide();
		},
		setImgurl: function(url) {
			opt.url = url;
		},
		getmax: function() {
			console.log(con.height());
			console.log(getMax());
		}
	}

}