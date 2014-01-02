define('test/request', ['request'], function(request) {

var $tag = function(tag) {
	return document.getElementsByTagName(tag);
};

describe('request', function() {
	it('可以请求css文件', function(done) {
		var url = 'fixture/request.css',
			c1 = $tag('link').length;

		request.css(url, function() {
			var c2 = $tag('link').length;
			expect(c2 - c1).toBe(1);
			done();
		});
	});


	it('可以请求js文件', function(done) {
		var url = 'fixture/request.js';
		expect(window.test_request).toBeUndefined();
		request.script(url, function() {
			expect(window.test_request).toBe(101);
			done();
		});
	});
});

		
});
