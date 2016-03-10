var express = require('express');
var app = express();
var keys = require('./keys.js');
var bodyparser = require('body-parser');
var cookieparser = require('cookie-parser');

/* NORMALLY WE WOULD BE INTERACTING WITH A DATABASE OF SOME SORT FOR STORING AND LOOKING UP A USER'S INFORMATION.
FOR THE SAKE OF SIMPLICITY WE WILL BE USING AN OBJECT FOR THIS EXERCISE. THE KEY WILL BE THE 'id' RETURNED BY GITHUB, THE VALUE WILL
BE THE PROFILE ITSELF. */
var users = {};

/* FIRST WE INCLUDE THE GENERIC 'passport' MODULE. PASSPORT MAKES USE OF VARIOUS 'strategies' FOR HANDLING AUTHENTICATION.
THESE STRATEGIES ARE INSTALLED USING 'npm install *strategy name*' AND REQUIRED INTO YOUR SERVER.JS FILE INDIVIDUALLY. IN THIS CASE
WE WILL BE USING THE 'passport-github' STRATEGY. */
var passport = require('passport');
var githubstrategy = require('passport-github').Strategy;

/* WE WILL BE USING 'SESSIONS'*/
var session = require('express-session');

/* TAKE NOTE OF THE MIDDLEWARE BEING USED HERE, PARTICULARLY 'express-session'. IF YOU DON'T UNDERSTAND WHAT SESSIONS ARE OR
HOW THEY WORK, DO YOURSELF A FAVOR AND TAKE A MINUTE TO RESEARCH THE TOPIC. IT WILL BE DIFFICULT FOR YOU TO MAKE SENSE OF WHAT
THE 'serializeUser' & 'deserializeUser' FUNCTIONS ARE DOING WITHOUT SOME UNDERSTANDING OF SESSIONS. */
app.use(cookieparser());
app.use(session({secret:'we2kdl536aam30dzv61'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/client'));

/* THE 'serializeUser' METHOD  */
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (userId, done) {
  if (users[userId]) {
  	done(null, users[userId]);
  } else {
  	done('user not found', null);
  }
});


// config passport
passport.use(new githubstrategy({
  clientID: keys.github.id,
  clientSecret: keys.github.secret,
  callbackUrl: 'http://m-oc.github.io/PassportJs/login/github_callback'
},
function (accessToken, refreshToken, profile, done) {
  users[profile.id] = profile;
  done(null, users[profile.id]);
}));


// routes
// github login
// github Oauth 2 app registration: https://github.com/settings/applications/new
// github callback: http://m-oc.github.io/PassportJs/github_callback

// GITHUB LOGIN
app.get('/login/github', passport.authenticate('github'));

app.get('/login/github_callback', passport.authenticate('github', {
  successRedirect: '/github/profile',
  failureRedirect: '/github/failure'
}));

app.get('/github/profile', checkPermission, function (req, res) {
  res.send(req.user);
});

app.get('/github/failure', function (req, res) {
  res.send("Authentication failed.");
});

function checkPermission (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/github/failure');
  }
}


// initialize server
app.listen(8000);
module.exports = app;