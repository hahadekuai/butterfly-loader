define('weave', 
	['util', 'loaderdefine', 'modules', 'loader', 'global'], 
	function(util, loaderdefine, modules, Loader, global) {


var butterfly = new Loader('butterfly'),
	define = util.proxy(butterfly, 'define');


define('loaderdefine', function() {
	return loaderdefine;	
});


define('global', function() {
	return global;	
});


butterfly._modules = modules;
global.butterfly = butterfly;
global.define = define;


});
