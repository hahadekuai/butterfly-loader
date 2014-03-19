define('weave', 
	['modules', 'util', 'log', 'event', 'define', 
	'require', 'loader', 'request', 'global', 'origindefine', 
	'originbutterfly'], 
function(modules, util, log, loaderevent, loaderdefine, 
	require, Loader, request, global, origindefine, 
	originbutterfly) {


loaderevent.on('define', function(namespace, module) {
	if (module.anonymous) {
		log.debug('require anonymous module:', module.namespace, ':', module.id);
		require(module.namespace, module.id);
	}
});


var requestList = {},
	rAbs = /(^\w*:\/\/)|(^[.\/])/;

loaderevent.on('request', function(namespace, o, callback) {
	var url = o.url,
		list = requestList[url] = requestList[url] || [];

	list.push(callback);
	if (list.length > 1) {
		return true;
	}

	var loader = Loader.get(namespace),
		options = loader.config('request');

	options = util.extend({}, options);
	
	options.success = function() {
		var cache = modules[namespace] || {};
		// define a proxy module for just url request
		if (!cache[o.id] && rAbs.test(o.id)) {
			log.debug('define proxy module for:', o.id);
			loaderdefine(namespace, o.id);
		}	

		delete requestList[url];
		util.each(list, function(index, fn) {
			fn();
		});
	};

	options.error = function() {
		var e = new Error('request error: ' + url);
		loaderevent.trigger('requireError', namespace, o.id);
	};
	
	request(url, options);

	return true;
});
//~


var butterfly = new Loader('butterfly');

butterfly.loader = function(namespace) {
	return new Loader(namespace);
};


butterfly.define('loaderdefine', function() {
	return loaderdefine;	
});


butterfly.define('global', function() {
	return global;	
});


// for test
butterfly._modules = modules;

global.butterfly = butterfly;
global.define = util.proxy(butterfly, 'define');

butterfly.noConflict = function(deep) {
	global.define = origindefine;
	if (deep) {
		global.butterfly = originbutterfly;
	}
	return butterfly;
};

});
