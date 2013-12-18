define('request', ['global', 'log', 'event'], function(global, log, event) {


var doc = document,
	head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement = doc.getElementsByTagName('base')[0],
	isOldWebKit = (global.navigator && 
			global.navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536,
	rReadyStates = /loaded|complete|undefined/;


var rCss = /\.css(\?|$)/;

var request = function() {
	var type = rCss.test(arguments[0]) ? 'css' : 'script';
	return request[type].apply(request, arguments);
};


request.script = function(url, fn, options) {
	log.debug('request script:', url);
	options = options || {};

	var node = doc.createElement('script');

	onLoadScript(url, node, fn);

	node.async = 'async';
	node.src = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	append(node);
};
//~ script


var onLoadScript = function(url, node, fn) {
	node.onload = node.onreadystatechange = function(event) {
		event = event || global.event || {};
		if (event.type === 'load' || rReadyStates.test('' + node.readyState)) {
			node.onload = node.onreadystatechange = node.onerror = null;
			log.isEnabled('debug') || head.removeChild(node);
			log.debug('request script success:', url);
			fn();
		}
	};

	node.onerror = function() {
		node.onload = node.onreadystatechange = node.onerror = null;
		log.error('request js error:', url);
	};
};


request.css = function(url, fn, options) {
	log.debug('request css:', url);
	options = options || {};

	var node = doc.createElement('link');

    node.rel = 'stylesheet';
    node.href = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	if (isOldWebKit || !('onload' in node)) {
		log.debug('request css use image proxy');
		var img = doc.createElement('img');
		img.onerror = function() {
			img.onerror = null;
			log.debug('request css success with image proxy:', url);
			fn();
		};
		img.src = url;
	} else {
		node.onload = node.onreadystatechange = function() {
			if (rReadyStates.test(node.readyState)) {
				node.onload = node.onreadystatechange = node.onerror = null;
				log.debug('request css success:', url);
				fn();
			}
		};

		node.onerror = function() {
			node.onload = node.onreadystatechange = node.onerror = null;
			log.error('request css error: ' + url);
		};
	}

	append(node);	
};
//~ css


var append = function(node) {
	baseElement ?  
			head.insertBefore(node, baseElement) : 
			head.appendChild(node);
};


return request;

		
});
