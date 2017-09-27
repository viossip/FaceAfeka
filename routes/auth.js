//module is responsible for authorization of http access
//and user management api

var express = require('express');
var router = express.Router();
var db = require("../core/db");
var fs = require('fs');

var contId = null;


//	Logout route.
router.get('/logout', function (req, res) {
	delete req.session.user;
	res.send({res:"success"});
});

// Login route.
// In case of success, mark the session as authenticated.
router.get('/login', function (req, res) {
	console.log("Route: login: " + req.query.user + " pass: " + req.query.pass);

	if (req.session.user) {
		res.send({login: req.query.user});
		return;
	}

	if (req.query.user && req.query.pass) {
		db.checkUserLogin(req.query.user, req.query.pass, function(loginOk) {
			if (loginOk) {
				req.session.user = req.query.user;
				res.send({login: req.query.user});
			}
			else 
				res.sendStatus(401);
		});
	}
});

//	Check if login exists in DB.
router.get('/checkLoginExists', function (req, res) {
	
	db.getUserByLogin(req.query.user, function(user){
		user ? res.send({res: true}) : res.send({res: false});
/* 		if(user)
			res.send({res:true});
		else
			res.send({res:false}); */
	});
	
});

//	Update user in DB.
router.post('/updateUser', function (req, res) {
	console.log("Updating user " + req.body.user);
	
	var user = req.body;

	if(!user.id){
		res.sendStatus(403);
		return;
	}
	
	db.updateUser(user, function(){
		res.sendStatus(200);
	});
	
});

//	Register user to DB.
router.post('/register', function (req, res) {
	console.log("Registering user " + JSON.stringify(req.body.user));

	var userLogin = req.body.user;
	
	var password = req.body.password;

	db.getUserByLogin(userLogin.login, function(user) {
		if (!user) {
			db.addUser(userLogin, password, function(userDB, error) {
				if (error)
					res.status(400).send(error);
				else 
					res.send(userDB);
			});
		}
		else {
			console.log("User " + userLogin.login + " already exists!");
			res.sendStatus(400);
		}
	});
});

//	Get a specific user.
router.get("/getUser", function(req, res) {
	console.log("Retrieving user " + JSON.stringify(req.body.id));

	db.getUserById(req.body.id, function(user) {
		res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: ProfileImageId});
	});

});

//	Get all users.
router.get("/getUsers", function(req, res) {
	
	db.getAllUsers(function(users){
		res.send(users);
	});
	
});
		
module.exports.router = router;
