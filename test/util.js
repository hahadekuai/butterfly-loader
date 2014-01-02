define('test/util', ['util'], function(util) {
	
describe('util', function() {
		
	it('isArray', function() {
		expect(util.isArray([1, 2, 3])).toBeTruthy();
		expect(util.isArray('123')).toBeFalsy();
		expect(util.isArray(arguments)).toBeFalsy();
	});


	it('extend', function() {
		var o = util.extend(
				{ a: 1, b: 2, d: 'd'}, 
				{ b: 3, c: 4, d: null, e: undefined });
		expect(o).toEqual({ a: 1, b: 3, c: 4, d: 'd' });
	});


	it('each', function() {
		var list = [1, 2, 3, 4];
		var s = 0;
		util.each(list, function(index, value) {
			s += value;
		});
		expect(s).toBe(10);

		var o = { a: 1, b: 2, c: 3 };
		var s = '';
		util.each(o, function(k, v) {
			s += k + '=' + v + ';';
		});

		expect(s).toBe('a=1;b=2;c=3;');
	});


	it('proxy', function() {
		var o = { m: function() { return this.n; }, n: 100 };
		var fn = util.proxy(o, 'm');
		expect(fn()).toBe(100);
	});


	it('assert', function() {
		expect(function() {
			util.assert(true, 'assert true')
		}).not.toThrowError();

		expect(function() {
			util.assert(false, 'assert false');
		}).toThrowError();
	});


	it('guid', function() {
		expect(typeof util.guid()).toBe('number');
	});

});

});
