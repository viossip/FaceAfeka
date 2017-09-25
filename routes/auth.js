//module is responsible for authorization of http access
//and user management api

var express = require('express');
var router = express.Router();
//var db = require("../core/db");
var fs = require('fs');

var contId = null;


router.get('/logout', function (req, res) {
	delete req.session.user;
	res.send({res:"success"});
});

// Login route.
// In case of success, mark the session as authenticated.
router.get('/login', function (req, res) {
	console.log("Route: login " + req.query.user + " psw: " + req.query.psw);

	if(req.session.user){
		//	Dont know if we even need this line below.
		//req.session.user.controllers = [contId];
		res.send(req.session.user);
		return;
	}
	
	//	TODO: get the user credentials *KEY* (not username and password because we do not store it in our database!).
	/*db.getUserByLogin(req.param('user'), function(user){
		
		user = JSON.parse(JSON.stringify(user));
		
		if(user && user.password === req.param('psw')){
			user.controllers = [contId];
			req.session.user = user;
			
			console.log("User found "+JSON.stringify(user));
			res.send(user);
		}else{
			res.sendStatus(401);
		}
	});
	*/
	req.session.user = {user: "fuck" };
	res.send({lol: "fuck"});
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
	console.log("Register user "+JSON.stringify(req.body));
	var user = req.body;
	
	var code = decodeURIComponent(req.query.code);
	//check qr code value
	//TODO add unig code for security
	if(code.indexOf("Touchwand") !== 0){
		console.log("Wrong prefix");
		res.sendStatus(403).send({res:"failure"});
		return;
	}

	//Touchwand_ADMIN_::44:55:66:77:88:88_[securityCode]
	var id = code.split("_")[2];
	
	var role = code.split("_")[1];

	var secCode = code.split("_")[3];

	var validCode;
	console.log("QR Code: id = " + id + ", role = " + role + ", secCode = " + secCode);

	try {
		validCode = fs.readFileSync("/opt/qr_secured_num.txt", "utf-8");
		console.log("QR validCode = " + validCode);
		console.log(JSON.stringify(validCode));
	}

	catch (err) {
		console.log("Couldn't read secured number at registration");
	}
	//check controller id matches
	if(id !== contId || validCode !== secCode){
		if (id !== contId)
			console.log("Wrong QR code, bad id, system's id: " + contId + ", QR id: " + id);
		else
			console.log("Wrong QR code, bad secnum, system's secnum: " + validCode + ", QR secnum: " + secCode);
		res.sendStatus(403).send({res:"failure"});
		return;
	}

	
	user.role = role;
	
	console.log("Saving user "+JSON.stringify(user));
	db.addUser(user, function(userDB, error){
		if(error){
			res.status(400).send(error);
		}else{
			cloud_support.syncUsers();
			res.send(user);
		}
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
