define('request', ['global', 'log', 'event'], function(global, log, loaderEvent) {


var doc = document,
	head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement = doc.getElementsByTagName('base')[0],
	rReadyStates = /loaded|complete|undefined/;


var rCss = /\.css(\?|$)/;

var request = function() {
	var type = rCss.test(arguments[0]) ? 'css' : 'script';
	return request[type].apply(request, arguments);
};


request.script = function(url, options) {
	log.debug('request script:', url);
	options = options || {};

	var node = doc.createElement('script');

	onLoadScript(node, url, options);

	node.async = 'async';
	node.src = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	append(node);
};
//~ script


var onLoadScript = function(node, url, options) {
	node.onload = node.onreadystatechange = function(event) {
		event = event || global.event || {};
		if (event.type === 'load' || rReadyStates.test('' + node.readyState)) {
			node.onload = node.onreadystatechange = node.onerror = null;
			log.isEnabled('debug') || head.removeChild(node);
			log.debug('request script success:', url);
			options.success && options.success();
		}
	};

	node.onerror = function() {
		node.onload = node.onreadystatechange = node.onerror = null;
		log.error('request js error:', url);
		options.error && options.error();
	};
};


var isOldWebKit = (global.navigator && 
			global.navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536;


request.css = function(url, options) {
	log.debug('request css:', url);
	options = options || {};

	var node = doc.createElement('link');

    node.rel = 'stylesheet';
    node.href = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	var success = function() {
		log.debug('request css success:' + url)	;
		options.success && options.success();
	};

	var error = function() {
		log.error('request css error:' + url);
		options.error && options.error();
	};

	if (isOldWebKit) {
		log.debug('request css use pool');
		setTimeout(function() {
			poll(node, success, error);
		}, 1);
	} else {
		node.onload = node.onreadystatechange = function() {
			if (rReadyStates.test(node.readyState)) {
				node.onload = node.onreadystatechange = node.onerror = null;
				success();
			}
		};
		node.onerror = function() {
			node.onload = node.onreadystatechange = node.onerror = null;
			error();
		};
	}

	append(node);	
};
//~ css


var rLoadXdSheetError = /security|denied/i;
var poll = function(node, success, error) {
	var flag = false;

	setTimeout(function() {
		if (!flag) {
			flag = true;	
			error();
		}
	}, 10000);

	var fn = function() {
		var isLoaded = false;	
		try {
			isLoaded = node.sheet && node.sheet.cssRules;
		} catch (e) {
			isLoaded = rLoadXdSheetError.test(e.message);
		}
	
		if (!flag) {
			if (isLoaded) {
				flag = true;
				success();
			} else {
				setTimeout(fn, 20);
			}
		}
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
