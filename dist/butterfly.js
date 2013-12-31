/**
 * butterfly 2.0
 * @author qijun.weiqj@alibaba-inc.com
 */
;(function(global) {

var modules = {
	loader: {}
};


var cache = modules.loader,
	EMPTY = [];


var require = function(id) {
	return cache[id];
};


var define = function(id, depends, o) {
	if (cache[id]) {
		throw 'module already exist: ' + id;
	}
	if (!o) {
		o = depends;
		depends = EMPTY;
	}
	if (typeof o === 'function') {
		var args = [];
		for (var i = 0, c = depends.length; i < c; i++) {
			args.push(require(depends[i]));
		}
		o = o.apply(null, args);
	}
	cache[id] = o;
};


define('version', '2.0.0');
define('origindefine', function() {
	return global.define
});
define('originbutterfly', function() {
	return global.butterfly;
});
define('global', function() {
	return global;	
});

define('modules', modules);
define('loaderdefine', function() {
	return define;	
});


// for test
define._modules = modules;


global.butterfly = define;
global.define = define;


})(this);

define('util', function() {


var toString = Object.prototype.toString,
	guid = 1;


var util = {
	isArray: function(o) {
		return toString.call(o) === '[object Array]'; 
	},


	extend: function(des, src) {
		for (var k in src) {
			var v = src[k];
			if (v !== null && v !== undefined) {
				des[k] = v;
			}
		}
		return des;
	},


	each: function(iter, fn) {
		if (iter.length) {
			for (var i = 0, c = iter.length; i < c; i++) {
				if (fn(i, iter[i]) === false) {
					break;
				}
			}
		} else {
			for (var k in iter) {
				if (fn(k, iter[k]) === false) {
					break;
				}
			}
		}	
	},


	proxy: function(o, name) {
		return function() {
			return o[name].apply(o, arguments);
		};
	},


	assert: function(test, message) {
		if (!test) {
			throw new Error(message);
		}
	},

	
	guid: function() {
		return guid++;
	}
};


return util;


});

define('log', ['global', 'util'], function(global, util) {


var LEVEL = { none: 0, error: 1, warn: 2, info: 3, debug: 4 },
	level = (function() {
		var loc = global.location,
			search = loc ? loc.search : '';
		return (/\bdebug-log-level=(\w+)/.exec(search) || {})[1] || 'error';
	})(),
	join = [].join;


var log = function(msg, type) {
	if (log.isEnabled(type)) {
		msg = (typeof msg !== 'string' && msg.length) ? join.call(msg, ' ') : msg;
		msg = '[loader] ' + msg;
		log.handler(msg, type);
	}
};


log.level = level;
log.isEnabled = function(type) {
	return LEVEL[type] <= LEVEL[log.level];
};


util.each(LEVEL, function(type) {
	log[type] = function() {
		log(arguments, type);
	};
});


log.handler = global.console ? function(msg, type) {
	if (console[type]) {
		console[type](msg);
	} else if (console.log) {
		console.log(msg);
	}
} : function() {};


return log;


});

define('event', ['util', 'log'], function(util, log) {


var cache = {},
	slice = [].slice;


return {

	_cache: cache,


	on: function(name, fn) {
		log.debug('event.on:', name);

		var list = cache[name];
		if (!list) {
			list = cache[name] = [];
		}
		list.push(fn);
	},


	trigger: function(name) {
		log.debug('event.trigger:', name);

		var list = cache[name],
			params = slice.call(arguments, 1);
		if (list) {
			for (var i = 0, c = list.length; i < c; i++) {
				var result = list[i].apply(null, params);
				if (result !== null && result !== undefined) {
					return result;
				}
			}
		}
	},


	off: function(name, fn) {
		log.debug('event.off:', name);

		var list = cache[name];
		if (list) {
			for (var i = list.length - 1; i >= 0; i--) {
				if (list[i] === fn) {
					list.splice(i, 1);
				}
			}
			if (!list.length) {
				delete cache[name];
			}
		}
	}
};
//~

	
});

define('define', 
	['util', 'log', 'event', 'modules'], 
	function(util, log, event, modules) {


var assert = util.assert,
	isArray = util.isArray;


var define = function(namespace, id, depends, factory) {
	var module = regular(id, depends, factory),
		id = module.id;

	module.namespace = namespace;

	var cache = modules[namespace];
	if (!cache) {
		cache = modules[namespace] = {};
	}

	if (cache[id]) {
		log.warn(mid(module), 'already defined, ignore it');
		return;
	} else {
		log.debug('define module:', mid(module));
		cache[id] = module;
	}

	event.trigger('define', module);

	return module;
};


/**
 * define(id, depends, factory)
 * define(id, factory{not array})
 * define(id, depends{array})
 * define(depends{array}, factory)
 * define(factory{function})
 */
var EMPTY = [];
var regular = function(id, depends, factory) {
	if (factory === undefined && !isArray(depends)) {
		factory = depends;
		depends = EMPTY;
	}

	if (typeof id === 'function') {
		factory = id;
		depends = EMPTY;
		id = null;
	} else if (isArray(id)) {
		depends = id;
		id = null;
	}

	assert(isArray(depends), 'arguments error, depends should be an array');
	
	var anonymous = !id;
	id = id || '____anonymous' + util.guid();

	return { id: id, depends: depends, factory: factory, anonymous: anonymous }; 
};
//~


var mid = function(module) {
	return module.namespace + ':' + module.id;	
};


define._regular = regular;
define._EMPTY = EMPTY;


return define;


});

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
		adepends = module.adepends = module.depends.slice(0);

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

			e.namespace = module.namespace;
			event.trigger('error', e);
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

	var status = event.trigger('request', 
			{ namespace: namespace, id: id, url: url }, 
			function() {
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

define('loader', 
		['util', 'log', 'event', 'define', 'require', 
		'modules', 'request'], 

function(util, log, event, define, require, 
		modules, request) { 


var loader = function(namespace, config) {
	this.namespace = namespace;	
	this._config = {};
	config && this.config(config);

	handleAlias(this);
	handleResolve(this);
	defineSpecial(this);
};


var proto = loader.prototype;


proto.config = function(name, value) {
	var config = {};
	if (typeof name === 'string') {
		config[name] = value;
	} else {
		util.extend(config, name);
	}
	
	var cache = this._config;
	util.each(config, function(name, value) {
		cache[name] = cache[name] || [];
		cache[name].push(value);
	});
};


proto.define = function(id, depends, factory) {
	return define(this.namespace, id, depends, factory);
};


proto.require = function(depends, factory) {
	return require(this.namespace, depends, factory);
};


proto.hasDefine = function(id) {
	var cache = modules[this.namespace];
	return cache && cache[id];
};


proto.getModules = function() {
	var list = [],
		cache = modules[this.namespace];
	
	if (cache) {
		for (var id in cache) {
			cache[id].anonymous || list.push(id);
		}
	}

	return list;
};


var eventList = {};
proto.on = function(name, fn) {
	var ns = this.namespace;

	var handler = function(o) {
		if (o && (typeof o === 'string' ? o === ns : o.namespace === ns)) {
			return fn.apply(self, arguments);
		}
	};
	eventList[fn] = handler;
	event.on(name, handler);
};


proto.off = function(name, fn) {
	event.off(name, eventList[fn]);
	delete eventList[fn];
};


var handleAlias = function(self) {
	self.on('alias', function(namespace, id) {
		return filter(self._config['alias'], function(index, alias) {
			return alias[id];
		});
	});
};


var rAbs = /(^\w*:\/\/)|(^[.\/])/;
var handleResolve = function(self) {
	self.on('resolve', function(namespace, id) {
		var url = filter(self._config['resolve'], function(index, resolve) {
			return resolve(id);
		});

		if (!url && rAbs.test(id)) {
			url = id;
		}

		return url;
	});
};


var filter = function(list, fn) {
	if (list) {
		for (var i = 0, c = list.length; i < c; i++) {
			var item = list[i],
				v = fn(i, item);
			if (v) {
				return v;
			}
		}
	}
};


var defineSpecial = function(self) {
	self.define('require', function() {
		return util.proxy(self, 'require');
	});

	self.define('module', function() {
		return {
			$compile: function(module) {
				return module;
			}
		};
	});

	self.define('exports', function() {
		return {
			$compile: function(module) {
				return module.exports;
			}
		};
	});
};
//~ loader


// handle global event

event.on('define', function(module) {
	if (module.anonymous) {
		log.debug('require anonymous module:', module.namespace, ':', module.id);
		require(module.namespace, module.id);
	}
});


var requestList = {};
event.on('request', function(o, callback) {
	var url = o.url,
		list = requestList[url] = requestList[url] || [];

	list.push(callback);
	if (list.length > 1) {
		return true;
	}

	request(url, function() {
		var cache = modules[o.namespace] || {};
		// define a proxy module for just url request
		if (!cache[o.id] && rAbs.test(url)) {
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

return loader;

	
});

define('weave', 
	['util', 'loaderdefine', 'modules', 'loader', 'global'], 
	function(util, loaderdefine, modules, Loader, global) {


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


});
