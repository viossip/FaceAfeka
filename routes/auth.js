//module is responsible for authorization of http access
//and user management api

var express = require('express');
var router = express.Router();
var db = require("../core/db");
var fs = require('fs');

var contId = null;


router.get('/logout', function (req, res) {
	delete req.session.user;
	res.send({res:"success"});
});

// Login route.
// In case of success, mark the session as authenticated.
router.get('/login', function (req, res) {
	console.log("Route: login: " + req.query.user + " pass: " + req.query.pass);

	if (req.session.user) {
		res.send(req.session.user);
		return;
	}
	
	if (req.query.user && req.query.pass) {
		db.checkUserLogin(req.query.user, req.query.pass, function(user, passObj) {
			console.log("user.hash: " + user.hash + ", passObj.hash: " + passObj.hash);
			if (user.hash === passObj.hash) {
				req.session.user = user.login;
				res.send(user);
			}
			else 
				res.sendStatus(401);
		});
	}
	/*
	db.getUserByLogin(req.param('user'), function(user){
		
		user = JSON.parse(JSON.stringify(user));
		
		if(user && user.password === req.param('psw')){
			req.session.user = user;
			
			console.log("User found "+JSON.stringify(user));
			res.send(user);
		}else{
			res.sendStatus(401);
		}
	});
	*/
});

//check if login exists in db
router.get('/checkLoginExists', function (req, res) {
	
	db.getUserByLogin(req.param('user'), function(user){
		
		if(user){
			res.send({res:true});
		}else{
			res.send({res:false});
		}
		
	});
	
});

//update user in db
router.post('/updateUser', function (req, res) {
	console.log("Update user "+JSON.stringify(req.body));
	
	var user = req.body;
	
	if(user.controllers){
		delete user.controllers;
	}
	
	if(!user.id){
		res.sendStatus(403);
		return;
	}
	
	db.updateUser(user, function(){
		res.sendStatus(200);
	});
	
});

//add user to db
router.post('/register', function (req, res) {
	console.log("Register user " + JSON.stringify(req.body));

	var user = req.body.user;
	
	var password = req.body.password;
	
	console.log("Saving user " + JSON.stringify(user));

	db.addUser(user, password, function(userDB, error) {
		if (error)
			res.status(400).send(error);
		else 
			res.send(userDB);
	});
	
});

//list users
router.get("/getUsers",  function (req, res) {
	
	db.getUsers(function(users){
		res.send(users);
	});
	
});
		
//controller id
module.exports.setContId = function(newContId){
	contId = newContId;
};

module.exports.getContId = function(){
	return contId;
};

module.exports.router = router;
