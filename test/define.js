define('test/define', 
	['event', 'define', 'modules'], 
	function(event, define, modules) {
		
describe('define', function() {
	
	it('适配不同的参数', function() {
		var regular = define._regular;

		var fn = function() {};

		expect(regular('a', ['b', 'c', 'd'], fn)).toEqual({
			id: 'a',
			depends: ['b', 'c', 'd'],
			factory: fn,
			anonymous: false
		});


		expect(regular('a', fn)).toEqual({
			id: 'a',
			depends: define._EMPTY,
			factory: fn,
			anonymous: false
		});


		expect(regular('a', ['b', 'c', 'd'])).toEqual({
			id: 'a',
			depends: ['b', 'c', 'd'],
			factory: undefined,
			anonymous: false
		});


		var o = regular(['b', 'c', 'd'], fn);
		expect(o.id).not.toBeUndefined();
		expect(o.anonymous).toBeTruthy();


		var o = regular(fn);
		expect(o.factory).toBe(fn);
		expect(o.anonymous).toBeTruthy();
	});


	it('使用define定义模块, 能够响应define事件', function() {
		spyOn(event, 'trigger');

		define('test', 'test/a', ['a', 'b'], function() {});
		var o = modules.test['test/a'];

		expect(o.namespace).toBe('test');
		expect(o.id).toBe('test/a');

		expect(event.trigger).toHaveBeenCalledWith('define', o);
	});
		
});


});
