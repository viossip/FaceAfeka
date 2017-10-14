var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var cors = require('cors');

//  Routes
var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var posts = require("./routes/posts");
var friends = require("./routes/friends");

var oldLog = console.log;

console.log = function(msg, level) {
			var date = new Date();

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var miliseconds = date.getMilliseconds();

			oldLog.apply(console, [ "[" + day + "/" + month + "/" + year + " - " + hours + ":" + minutes + ":" + seconds + ":" + miliseconds + "]: " + msg ]);
};

//  Gracefully cleanup when termination signals are sent to the process.
var ON_DEATH = require('death')({
	uncaughtException : true
});

ON_DEATH(function(signal, err) {
	console.log("Process died, cleaning up " + signal + " " + err);

	if (err) {
		console.log("Error " + err.stack);
  }
  
	process.exit();
});

var app = express();

//use it before all route definitions
app.use(cors({origin: '*'}));

var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//  Generate secure random string and use it as a cookie secret.
app.use(session({
  cookieName : 'session',
  secret : 'AABBCCDDEEFF',
  duration : 30 * 60 * 1000,
  activeDuration : 30 * 60 * 1000,
}));

function checkLogin(req, res, next) {
    console.log("Checking login " + req.path);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.session.user || ip == "localhost" || ip.indexOf("127.0.0.1") >= 0
        || req.path.indexOf("/auth") === 0
        || req.path.indexOf("/login") === 0
        || req.path.indexOf("/register") === 0
        || req.path.indexOf("/forgotten-password.html") === 0)
        { 
        next(); // call next() here to move on to next middleware/router
    } else {
      res.redirect("/login?path=" + encodeURI(req.originalUrl));
    }
  
}

app.use(function(req, res, next) {
	if (!req.session.id) {
		req.session.id = req.cookies.session;
	}
	next();
});

app.all('/*.html', checkLogin);
app.all('/', checkLogin);

app.use(express.static(path.join(__dirname, 'public')));

app.use("/login", function(req, res, next) {
  res.render('login', { title: 'faceAfeka' });
});

// Rest API routes
app.use('/', checkLogin, index);
app.use('/auth', auth);
app.use("/posts", checkLogin, posts);
app.use('/users', checkLogin, users);
app.use("/friends", checkLogin, friends);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found ' + req.path);
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
