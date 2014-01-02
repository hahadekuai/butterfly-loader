define('test/log', ['log'], function(log) {
		
describe('log', function() {

	var level = (/\bdebug-log-level=(\w+)/.exec(location.search) || {})[1] || 'error';

	afterEach(function() {
		log.level = level;	
	});

	it('可以通过url参数 debug-log-level设置日志级别', function() {
		expect(log.level).toBe(level);
	});


	it('log.level=info时, log.info有输出', function() {
		log.level = 'info';

		spyOn(log, 'handler');
		log.info('hello');
		expect(log.handler).toHaveBeenCalled();
	});


	it('log.level=error时, log.info不输出', function() {
		log.level = 'error';

		spyOn(log, 'handler');
		log.info('hello');

		expect(log.handler).not.toHaveBeenCalled();
	});


	it('可以传递多个参数', function() {
		log.level = 'error';

		spyOn(log, 'handler');
		log.error('a', 'b', 'c');

		expect(log.handler).toHaveBeenCalledWith('[loader] a b c', 'error');
	});

});


});
