var express = require('express');
var app = express();
var bodyparser = require('body-parser');

// apply middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/client'));

// routes
// github login
// github Oauth 2 app registration: https://github.com/settings/applications/new
app.get('/login/github', function (req, res){
  
});


// initialize
app.listen(8000);

module.exports = app;