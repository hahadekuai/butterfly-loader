define('weave', 
	['util', 'loaderdefine', 'modules', 'loader', 'global', 
	'origindefine', 'originbutterfly'], 
function(util, loaderdefine, modules, Loader, global, 
	origindefine, originbutterfly) {


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

butterfly.noConflict = function(deep) {
	global.define = origindefine;
	if (deep) {
		global.butterfly = originbutterfly;
	}
	return butterfly;
};

});
