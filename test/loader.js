define('test/loader', ['loader'], function(Loader) {


describe('Loader', function() {

	var loader = new Loader('testloader', {
		alias: {
			'a': 'test/a',
			'b': 'test/b'
		}
	});

		
	it('定义和加载模块', function() {
		loader.define('test/a', function() {
			return 'test a';
		});

		loader.define('test/b', function() {
			return 'test b';
		});

		var flag = false;
		loader.require(['a', 'b'], function(a, b) {
			expect(a).toBe('test a');
			expect(b).toBe('test b');
			flag = true;
		});

		//expect(flag).toBeTruthy();
		//expect(loader.getModules()).toEqual(['require', 'module', 'exports', 'test/a', 'test/b']);
		//expect(loader.hasDefine('test/a')).toBeTruthy();
		//expect(loader.hasDefine('a')).toBeFalsy();
	});


	it('使用require加载模块', function(done) {
		loader.define('test/c', function() {
			return 'test c';
		});

		loader.define('test/d', ['require'], function(require) {
			var c = require('test/c');
			return c + ' test d';
		});

		loader.require(['test/c', 'test/d'], function(c, d) {
			expect(c).toBe('test c');
			expect(d).toBe('test c test d');
			done();
		});
	});	
	
	
	it('使用module模块', function(done) {
		loader.define('hello', ['module'], function(module) {
			expect(module.id).toBe('hello');
			module.exports = 'this is hello';
		});

		loader.require(['hello'], function(hello) {
			expect(hello).toBe('this is hello');
			done();
		});
	});


	it('使用exports模块', function(done) {
		loader.define('seeme', ['exports'], function(exports) {
			exports.hello = 'this is hello';
		});

		loader.require(['seeme'], function(seeme) {
			expect(seeme.hello).toBe('this is hello');
			done();	
		});
	});


	it('支持define事件', function(done) {
		var handler = function(module) {
			expect(module.id).toBe('ondefine');
			done();
		};

		loader.on('define', handler);

		loader.define('ondefine', function() {
			return 'hello';
		});

		loader.off('define', handler);
	});


	it('请求url文件', function(done) {
		var url = './fixture/loader.js';
		loader.require(url, function() {
			expect(window.fixtureloader).toBeTruthy();
			done();
		});
	});

});

		
});
