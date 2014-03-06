define('test/require', 
	['util', 'define', 'require', 'event'], 
	function(util, define, require, event) {
	
describe('require', function() {

	it('使用define定义模块, 再用require载入', function(done) {
		define('test2', 'a', ['b', 'c'], function(b, c) {
			return b + c;
		});

		define('test2', 'b', ['c'], function(c) {
			return 2 * c;	
		});

		define('test2', 'c', function() {
			return 100;	
		});

		require('test2', ['a'], function(a) {
			expect(a).toBe(300);
			done();
		});
	});


	it('使用事件来支持异步加载模块', function() {
		var url = 'http://butterfly/a/b/c.js'

		var resolve = jasmine.createSpy('resolve');
		resolve.and.returnValue(url);

		var request = jasmine.createSpy('request');
		request.and.returnValue(true);

		// clear all event
		var cache = event._cache,
			copy = util.extend({}, event._cache);

		var clear = function() {
			for (var k in cache) {
				cache[k] = null;
			}
		};

		clear();

		event.on('resolve', resolve);
		event.on('request', request);

		require('test2', ['a/b/c'], function(o) {});

		expect(resolve).toHaveBeenCalledWith('test2', 'a/b/c');
		expect(request).toHaveBeenCalledWith('test2',
				{ namespace: 'test2', id: 'a/b/c', url: url }, 
				jasmine.any(Function));

		// restore event
		clear();
		util.extend(cache, copy);
	});

});


});
