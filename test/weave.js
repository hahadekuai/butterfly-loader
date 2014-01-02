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

		
});
