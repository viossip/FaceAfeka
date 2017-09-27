var express = require("express");
var router = express.Router();
var db = require("../core/db");
var utils = require("../core/utils");

//  Get a specific user profile, given his id.
/* router.get("/profile/:id", function(req, res) {
  console.log("Retrieving user " + JSON.stringify(req.params.id));
  var userId = parseInt(req.params.id);
  
  //  Check if provided id is a positive number and its length is between 1 to 7 digits
  if (userId > 0 && utils.getLength(userId) > 0 && utils.getLength(userId) < 8) {
    db.getUserById(req.params.id, function(user) {
      user.getImages().then(function(images) {
        console.log(JSON.stringify(images[0].imagePath));
      });
      if (!user.image || user.image === "")
        user.image = "../../img/user.png";
      res.render("profile", {
        userFullname: user.firstName + " " + user.lastName,
        userEmail: user.login,
        userImage: user.image
      });
      //res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: ProfileImageId});
    });
  }
}); */

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

module.exports = router;
