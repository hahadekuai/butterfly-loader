define('weave', 
	['util', 'loaderdefine', 'modules', 'loader', 'global', 
	'origindefine', 'originbutterfly'], 
function(util, loaderdefine, modules, Loader, global, 
	origindefine, originbutterfly) {


// handle global event

event.on('define', function(namespace, module) {
	if (module.anonymous) {
		log.debug('require anonymous module:', module.namespace, ':', module.id);
		require(module.namespace, module.id);
	}
});


var requestList = {};
event.on('request', function(namespace, o, callback) {
	var url = o.url,
		list = requestList[url] = requestList[url] || [];

	list.push(callback);
	if (list.length > 1) {
		return true;
	}

	request(url, function() {
		var cache = modules[o.namespace] || {};
		// define a proxy module for just url request
		if (!cache[o.id] && rAbs.test(o.id)) {
			log.debug('define proxy module for:', o.id);
			define(o.namespace, o.id);
		}

		delete requestList[url];

		util.each(list, function(index, fn) {
			fn();
		});
	});

	return true;
});
//~


var butterfly = new Loader('butterfly'),
	define = util.proxy(butterfly, 'define');


define('loaderdefine', function() {
	return loaderdefine;	
});


define('global', function() {
	return global;	
});


butterfly._modules = modules;
global.butterfly = butterfly;
global.define = define;

butterfly.noConflict = function(deep) {
	global.define = origindefine;
	if (deep) {
		global.butterfly = originbutterfly;
	}
	return butterfly;
};

});
