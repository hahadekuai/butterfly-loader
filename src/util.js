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
