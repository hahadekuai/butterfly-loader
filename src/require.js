define('require', 
	['util', 'log', 'event', 'modules'], 
	function(util, log, event, modules) {


var assert = util.assert;


var require = function(namespace, depends, callback) {
	depends = util.isArray(depends) ? depends : [depends];

	var module = { 
		proxy: true,
		namespace: namespace, 
		id: '____require' + util.guid(),
		depends: depends, 
		factory: function() {
			return arguments;
		}
	};

	load(module, function() {
		callback && callback.apply(null, module.exports);
	});

	return module.exports && module.exports[0];
};
//~ require


var load = function(module, callback) {
	if (module.loadtimes > 0) {
		module.loadtimes++;
		log.debug(mid(module), 'is loaded', module.loadtimes, 'times');
		callback();
		return;
	}

	var loadlist = module.loadlist = module.loadlist || [];
	loadlist.push(callback);
	if (loadlist.length > 1) {
		return;
	}

	loadDepends(module, function() {
		compile(module, function() {
			log.debug(mid(module), 'is loaded');
			module.loadtimes = loadlist.length;
			delete module.loadlist;
			util.each(loadlist, function(index, fn) {
				fn();
			});
		});
	});
};
//~ load


var loadDepends = function(module, callback) {
	var depends = module.depends,
		n = depends.length,
		count = 0;

	if (n === 0) {
		return callback();
	}

	var check = function() {
		if (count >= n)	{
			callback();
		}
	};

	var cache = modules[module.namespace],
		// aliased depends
		adepends = module.adepends = depends.slice(0);

	var step = function(index) {
		var id = depends[index],
			aid = event.trigger('alias', module.namespace, id);

		if (aid) {
			log.debug('alias', id, '->', aid);
			id = aid;
		}

		adepends[index] = id;

		var o = cache[id];
		var fn = function(o) {
			load(o, function() {
				count++;	
				check();
			});
		};

		o ? fn(o) : loadAsync(module.namespace, id, fn);
	};

	for (var i = 0; i < n; i++) {
		step(i);
	}
};
//~ loadDepends


var compile = function(module, callback) {
	var factory = module.factory;
	if (typeof factory === 'function') {
		var cache = modules[module.namespace],
			depends = module.adepends,
			proxy = { id: module.id, exports: {} },
			list = [];

		depends && depends.length &&
		util.each(depends, function(index, id) {
			var o = cache[id];
			assert(('exports' in o), 'module should be loaded: ' + id);
			if (o.exports && typeof o.exports.$compile === 'function') {
				list[index] = o.exports.$compile(proxy, module);
			} else {
				list[index] = o.exports;
			}
		});

		try {
			log.debug('compile', mid(module));
			factory = factory.apply(null, list);

			if (factory === null || factory === undefined) {
				factory = proxy.exports;
			}
		} catch (e) {
			if (log.isEnabled('info')) {
				throw e;
			}

			event.trigger('error', module.namespace, e);
			log.error(e);
		}
	}

	module.exports = factory;
	callback();
};
//~ compile


var loadAsync = function(namespace, id, fn) {
	var url = event.trigger('resolve', namespace, id),
		mid = namespace + ':' + id;

	if (!url) {
		log.error('can not resolve module: ', mid);
		return;
	}

	log.debug('resolve', mid, '->', url);

	var o = {
		namespace: namespace,
		id: id,
		url: url
	};

	var status = event.trigger('request', namespace, o, function() {
		var o = modules[namespace][id];
		if (!o) {
			log.error('can not find module:', mid);
			return;
		}
		fn(o);
	});

	if (!status) {
		log.error('request handler not found:', mid);
	}
};
//~ loadAsync


var mid = function(module) {
	return module.namespace + ':' + module.id;	
};


return require;


});
