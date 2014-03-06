define('loader', 
		['util', 'log', 'event', 'define', 'require', 
		'modules', 'request'], 

function(util, log, event, define, require, 
		modules, request) { 


var loader = function(namespace) {
	this.namespace = namespace;	
	this._config = {};

	handleAlias(this);
	handleResolve(this);
	defineSpecial(this);
};


var proto = loader.prototype;


proto.config = function(name, value) {
	var cache = this._config;
	cache[name] = cache[name] || [];
	cache[name].push(value);
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


var eventList = {},
	slice = [].slice;
proto.on = function(name, fn) {
	var self = this;

	var handler = function(namespace) {
		if (self.namespace === namespace) {
			return fn.apply(self, slice.call(arguments, 1));
		}
	};

	fn.guid = util.guid();
	eventList[fn.guid] = handler;
	event.on(name, handler);
};


proto.off = function(name, fn) {
	event.off(name, eventList[fn.guid]);
	delete eventList[fn.guid];
};


var handleAlias = function(self) {
	event.on('alias', function(namespace, id) {
		if (self.namespace !== namespace) {
			return;
		}

		return filter(self._config['alias'], function(index, alias) {
			return typeof alias === 'function' ? alias(id) : alias[id];
		});
	});
};


var rAbs = /(^\w*:\/\/)|(^[.\/])/;
var handleResolve = function(self) {
	event.on('resolve', function(namespace, id) {
		if (self.namespace !== namespace) {
			return;
		}

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




return loader;

	
});
