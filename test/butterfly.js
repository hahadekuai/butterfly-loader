var define = butterfly._modules.loader['loaderdefine'];


describe('butterlfy', function() {


it('可以使用define定义和使用模块', function() {
	define('a', 1);

	var flag = false;
	define('use a', ['a'], function(a) {
		expect(a).toBe(1);
		flag = true;
	});
	expect(flag).toBeTruthy();


	define('hello', function() {
		return 'hello world';
	});

	define('use hello', ['hello'], function(hello) {
		expect(hello).toBe('hello world');
	});

});


it('默认定义了几个内部模块', function() {
	var names = ['version', 'originbutterfly', 'origindefine', 
			'global', 'modules', 'loaderdefine'];

	define('use inner module', names, function() {
		var o = butterfly._modules.loader;
		for (var i = 0, c = arguments.length; i < c; i++) {
			expect(arguments[i]).toBe(o[names[i]]);
		}
	});
});

		
});
