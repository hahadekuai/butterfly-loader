describe('test/weave', function() {


	it('butterfly是一个loader', function(done) {
		butterfly.define('a', function() {
			return 'a';
		});


		butterfly.require(['a'], function(a) {
			expect(a).toBe('a');
			done();
		});
	});


	it('butterfly默认定义了一些模块', function() {
		butterfly.require(['loaderdefine', 'global'], function(loaderdefine, global) {
			expect(typeof loaderdefine).toBe('function');
			expect(global).toBe(window);
		});
	});


	it('匿名模块会被立刻require', function() {
		var flag = false;
		define([], function() {
			flag = true;	
		});
		expect(flag).toBeTruthy();
	});


	it('异步加载模块', function(done) {
		butterfly.config('resolve', function(id) {
			if (id === 'TestLoadModule')	{
				return 'fixture/test-load-module.js';
			}
		});

		butterfly.require('TestLoadModule', function(v) {
			expect(v).toBe('test load module');
			done();
		});
	});


});
