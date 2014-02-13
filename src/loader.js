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
	var cache = this._config;
	if (typeof name === 'string' && value === undefined) {
		return cache[name] || [];
	}

	var config = {};
	if (typeof name === 'string') {
		config[name] = value;
	} else {
		util.extend(config, name);
	}

	util.each(config, function() {
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
			return typeof alias === 'function' ? alias(id) : alias[id];
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

return loader;

	
});
