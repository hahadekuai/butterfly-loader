define('request', ['global', 'log', 'event'], function(global, log, event) {


var doc = document,
	head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement = doc.getElementsByTagName('base')[0],
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


var isOldWebKit = (global.navigator && 
			global.navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536;


request.css = function(url, fn, options) {
	log.debug('request css:', url);
	options = options || {};

	var node = doc.createElement('link');

    node.rel = 'stylesheet';
    node.href = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	var callback = function() {
		log.debug('request css success:' + url)	;
		fn();
	};

	if (isOldWebKit) {
		log.debug('request css use pool');
		setTimeout(function() {
			poll(node, callback);
		}, 1);
	} else {
		node.onload = node.onreadystatechange = function() {
			if (rReadyStates.test(node.readyState)) {
				node.onload = node.onreadystatechange = node.onerror = null;
				callback();
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


var rLoadXdSheetError = /security|denied/i;
var poll = function(node, callback) {
	var fn = function() {
		var isLoaded = false;	
		try {
			isLoaded = node.sheet && node.sheet.cssRules;
		} catch (e) {
			isLoaded = rLoadXdSheetError.test(e.message);
		}
		isLoaded ? callback() : setTimeout(fn, 20);
	};

	fn();
};


var append = function(node) {
	baseElement ?  
			head.insertBefore(node, baseElement) : 
			head.appendChild(node);
};


return request;

		
});
