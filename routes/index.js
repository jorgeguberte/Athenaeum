
/*
 * GET home page.
 */

exports.index = function(req, res){
	if(!req.user){
		res.render('index', { title: 'Express' });
	}else{
		res.redirect('/app');
	}
};