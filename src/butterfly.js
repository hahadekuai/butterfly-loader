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
