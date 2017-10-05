var express = require("express");
var router = express.Router();
var db = require("../core/db");
var utils = require("../core/utils");
var path = require('path');
var multer  =   require('multer');

const IMAGES_PATH = "../uploadedImgs";

var storage = multer({dest: path.join(__dirname, IMAGES_PATH)});

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

//	Get a specific user given his id.
router.get("/getUserById", function(req, res, next) {
	console.log("Retrieving user " + JSON.stringify(req.body.id));

  if (!req.body.id) {
    if (req.session.user) {
      db.getUserByLogin(req.session.user, function(user) {
        user.getImages().then(function(images) {
          if (images.length === 0)
            images.push({id: ""})
          res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: images[0].id});
        });
      });
    }
  }
  else {
    db.getUserById(req.body.id, function(user) {
      user.getImages().then(function(images) {
        if (images.length === 0)
          images.push({id: ""})
        res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: images[0].id});
      });
    });
  }
});

//  Get a specific user given his login.
router.get("/getUserByLogin", function(req, res, next) {
  console.log("Retrieving user " + JSON.stringify(req.body.id));

  db.getUserByLogin(req.body.login, function(user) {
    user.getImages().then(function(images) {
      res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: images[0].id});
    });
  });
});

//	Get all users.
router.get("/getUsers", function(req, res, next) {
	
	db.getAllUsers(function(users){
		res.send(users);
	});
	
});

//  Get given user's friends.
router.get("/getUserFriends", function(req, res) {

  //  Get friends from DB, their images, and send them back.
  function processFriends(user) {
    db.getUserFriends(user, function(friends) {
      var users = [];
      friends.forEach(function(friend) {
        friend.getImages().then(function(images) {
          users.push({ id: friend.id, login: friend.login, firstname: friend.firstName, lastname: friend.lastName, image: images[0].id });
        });
      });
      res.send(users);
    });
  }

  var userId = req.query.id;
  //  If userId is undefined (user is trying to get his own friends).
  if (!userId) {
    if (req.session.user) {
      db.getUserByLogin(req.session.user, function(user) {
        processFriends(user);
      });
    }
  }
  else {
    db.getUserById(userId, function(user) {
      processFriends(user);
    });
  }
});

//  Get users whom names begin with the given string
router.get("/searchUserPrefix", function(req, res) {
  console.log("users: Searching for user with name " + req.query.prefix);
  db.searchUserPrefix(req.query.prefix, function(users) {
    console.log(JSON.stringify(users));
    res.send(users);
  });
});

//	Update user in DB.
router.post('/updateUser', function (req, res,next) {
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

//  Add a given user (given the id) to current user's friends list.
router.get("/addFriend", function (req, res, next) {
  var friendId = req.query.id;

  if (!friendId)
    res.sendStatus(404);
  else {
    db.getUserByLogin(req.session.user, function(currUser) {
      db.getUserById(friendId, function(friend) {
        currUser.addFriend(friend);
      });
    });
  }
});

//  Remove a given user (given the id) from current user's friends list.
router.get("/removeFriend", function(req, res, next) {
  var friendId = req.query.id;

  if (!friendId && friendId > 0)
    res.sendStatus(404);
  else {
    db.getUserByLogin(req.session.user, function(currUser) {
        db.removeFriend(currUser.id, friendId, function(deleted) {
          deleted ? res.send({}) : res.sendStatus(400);
        });
    });
  }
});

router.post("/addProfileImg", storage.any(), function(req, res) {

  var imgs = req.files.map(function(img) {
    return { imagePath : IMAGES_PATH + "/" + img.filename };
  });

  db.getUserByLogin(req.session.user, function(user) {
    db.changeProfilePic(user, imgs, function(imgPath) {
      console.log(imgPath);
      res.send({ imageName: imgPath.split('/').pop() });
    });
  });

});

module.exports = router;
