define('test/event', ['event'], function(event) {

describe('event', function() {
		
	it('支持事件基本操作', function() {
		var s = 0;

		var fn1 = function(n) {
			s += n;	
		};

		var fn2 = function(a, b) {
			s *= (a + b);	
		};

		event.on('test', fn1);
		event.on('test', fn2);

		event.trigger('test', 3, 4);
		expect(s).toBe(21);

		event.off('test', fn1);
		event.trigger('test', 5, 2);
		expect(s).toBe(147);
	});


	it('事件支持返回值, 如果返回，则退出事件循环', function() {
		var s = 0;
		event.on('click', function() {
			s += 1;	
			return 'hello';
		});
		event.on('click', function() {
			s +=1;	
		});

		var ret = event.trigger('click');
		expect(ret).toBe('hello');
		expect(s).toBe(1);

	});


});
		
});
