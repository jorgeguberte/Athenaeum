
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var userProfile = require('userprofile');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var api = require('api');
var appConfig = require('appconfig');

var Q = require('q');





var app = module.exports =  express();
//var appConfig = new AppConfig(app);




var passport = require('passport'),
FacebookStrategy = require('passport-facebook').Strategy,
TwitterStrategy = require('passport-twitter').Strategy;	



passport.serializeUser(function(user, done) {
	//console.log(user);
	//find or create user

		userProfile.findOrCreate(user).then(function(val){
			console.log('thening');
			console.log(val);
			// console.log(val)
			done(null, val);
		}).catch(function(err){
			console.log('errorrrrr');
			console.log(err);
		});
});

passport.deserializeUser(function(id, done) {
	//find user by id
  /*User.findById(id, function(err, user) {
    done(err, user);
  });*/

	done(null, id);
});



//Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: appConfig.facebookStrategyConfig().id,
    clientSecret: appConfig.facebookStrategyConfig().secret,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
  	done(null, profile);
  }
));


//Twitter Strategy

passport.use(new TwitterStrategy({
		consumerKey: appConfig.twitterStrategyConfig().key,
		consumerSecret: appConfig.twitterStrategyConfig().secret,
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	function(token, tokenSecret, profile, done){
		//console.log(profile);
		done(null, profile);
	}
));



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/app', ensureAuthenticated, function(req, res){
	res.render('backbonefront', {user: req.user});
});


app.get('/test', function(req, res){
	function getUser(){
		var deferred = Q.defer();

		console.log('first one ok');
		deferred.resolve('resolving');
		return deferred.promise;
	}

	getUser().then(function(val){
		console.log(val);
	}).catch(function(error){
		console.log(error);
	})
});


app.get('/list', function(req, res){
	userProfile.find(req, res)
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/');
	}
}
//Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook', {scope:['user_likes']}));
app.get('/auth/facebook/callback', passport.authenticate('facebook',{successRedirect: '/app', failureRedirect:'/notlogged'}))

//Twitter auth routes
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {successRedirect: '/app', failureRedirect: '/notlogged'}));



//API Endpoints
app.get('/api/search/:taxonomy/:term', api.search);
app.post('/api/shelf', api.syncShelf);
app.get('/api/shelf', api.getShelf);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


