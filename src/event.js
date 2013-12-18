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
