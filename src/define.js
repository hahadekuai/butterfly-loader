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
		return cache[id];
	} else {
		log.debug('define module:', mid(module));
		cache[id] = module;
	}

	event.trigger('define', namespace, module);

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


// for test
define._regular = regular;
define._EMPTY = EMPTY;


return define;


});
