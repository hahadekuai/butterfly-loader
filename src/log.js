define('log', ['global', 'util'], function(global, util) {


var LEVEL = { none: 0, error: 1, warn: 2, info: 3, debug: 4 },
	level = (function() {
		var loc = global.location,
			search = loc ? loc.search : '';
		return (/\bdebug-log-level=(\w+)/.exec(search) || {})[1] || window.logLevel || 'error';
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
