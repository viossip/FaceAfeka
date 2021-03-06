var express = require("express");
var router = express.Router();
var db = require("../core/db");
var utils = require("../core/utils");
var path = require('path');
var multer = require('multer');
var crypto = require("crypto");

const IMAGES_PATH = "../uploadedImgs";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, IMAGES_PATH));
  },
  filename: function (req, file, cb) {
    var randString = crypto.randomBytes(10).toString('hex');
    var fileExt = file.originalname.split(".").pop();
    cb(null, randString + "_" + Date.now() + "." + fileExt);
  }
});

var upload = multer({ storage: storage });

//	Get a specific user given his id.
router.get("/getUserById", function(req, res, next) {
  if (!req.query.id) {
    if (req.session.user) {
      db.getUserByLogin(req.session.user, function(user) {
        user.getProfileImages().then(function(images) {
          if (images.length === 0)
            images.push({id: ""});
          res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: images[0].id});
        });
      });
    }
  }
  else {
    db.getUserById(req.query.id, function(user) {
      user.getProfileImages().then(function(images) {
        if (images.length === 0)
          images.push({id: ""});
        res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: images[0].id});
      });
    });
  }
});

//  Get a specific user given his login.
router.get("/getUserByLogin", function(req, res, next) {
  console.log("Retrieving user " + JSON.stringify(req.body.id));

  db.getUserByLogin(req.body.login, function(user) {
    user.getProfileImages().then(function(images) {
      if (images.length === 0)
        images.push({id: ""});
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

//  Checks if a given user is a friend of the requesting user.
router.get("/checkFriends", function(req, res) {
  db.checkFriends(req.session.user, req.query.id, function(result) {
    res.send(result);
  });
});

//  Get given user's friends.
router.get("/getUserFriends", function(req, res) {

  //  Get friends from DB, their images, and send them back.
  function processFriends(user) {
    user.getFriends().then(function(friends) {
      var users = [];
      if (friends.length !== 0) {
        friends.forEach(function(friend, index) {
          friend.getProfileImages().then(function(images) {
            var imageName = "user.png";
            //  If user has no images, it means he still uses the default profile image.
            if (images.length !== 0)
              imageName = images[0].imagePath.split("/").pop();
            //  Push the user to the friends array.
            users.push({ id: friend.id, login: friend.login, firstname: friend.firstName, lastname: friend.lastName, image: imageName });

            //  If all friends are in the users array, send it back!
            if (friends.length === users.length)
              res.send(users);
          });
        });
      }
      else {
        res.send(users);
      }
    });
  }

  var userId = req.query.id;
  //  If userId is undefined (user is trying to get his own friends).
  if (userId === "undefined") {
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

  if (!friendId || friendId < 0)
    res.send({});
  else {
    db.getUserByLogin(req.session.user, function(currUser) {
      db.getUserById(friendId, function(friendObj) {
        var friend = {};
        if (friendObj) {
          currUser.addFriend(friendObj).then(function() {
            friend = { id: friendObj.id, firstName: friendObj.firstName, lastName: friendObj.lastName };
            friendObj.addFriend(currUser).then(function() {
              res.send(friend);
            });
          });
        }
        else {
          res.send(friend);
        }
      });
    });
  }
});

//  Remove a given user (given the id) from current user's friends list.
router.get("/removeFriend", function(req, res, next) {
  var friendId = req.query.id;

  if (!friendId || friendId < 0)
    res.send({});
  else {
    db.getUserByLogin(req.session.user, function(currUser) {
        db.getUserById(friendId, function(friendObj) {
          var friend = {};
          if (friendObj) {
            currUser.removeFriend(friendObj).then(function() {
              friend = { id: friendObj.id, firstName: friendObj.firstName, lastName: friendObj.lastName };
              res.send(friend);
            });
          }
          else {
            res.send(friend);
          }
        });
    });
  }
});

//  Add profile image.
router.post("/addProfileImg", upload.any(), function(req, res) {
  

  var imgs = req.files.map(function(img) {
    return { imagePath : IMAGES_PATH + "/" + img.filename };
  });

  db.getUserByLogin(req.session.user, function(user) {
    db.changeUserProfilePic(user, imgs, function(imgPath) {
      res.send({ imageName: imgPath.split('/').pop() });
    });
  });

});

//  Get user profile image given his id.
router.get("/getProfileImgById", function(req, res) {
  function sendProfileBack(id) {
    db.getUserById(id, function(user) {
      
      user.getProfileImages().then(function(images) {
        if (images.length !== 0)
          res.send({imgName: images[0].imagePath.split("/").pop()});
        else
          res.send({});
      });
    });
  }

  var userId = req.query.id;
  if (userId === "undefined") {
    db.getUserByLogin(req.session.user, function(user) {
    
      sendProfileBack(user.id);
    });
  }
  else 
    sendProfileBack(userId);
});

//  Add an album image.
router.post("/addAlbumImg", upload.any(), function(req, res) {
  var imgs = req.files.map(function(img) {
    return { imagePath : IMAGES_PATH + "/" + img.filename };
  });

  db.getUserByLogin(req.session.user, function(user) {
    db.addUserAlbumImage(user, imgs, function(images) {
      res.send(images);
    });
  });
});

//  Removes an album image given its id.
router.get("/removeAlbumImg", function(req, res) {
  var imageId = req.query.imageId;

  db.getUserByLogin(req.session.user, function(user) {
    db.getImageById(imageId, function(imageDB) {
      console.log("users: Removing " + JSON.stringify(imageDB));
      //  Remove the image from the UserAlbumImage table.
      user.removeAlbumImage(imageDB).then(function() {
        //  Remove the actual image object and the image from the filesystem.
        db.removeImage(imageDB, function() {
          res.send({});
        });
      });
    });
  });
});

//  Gets a given user's album images.
router.get("/getUserAlbumImages", function(req, res) {

  function sendAlbumImages(user) {
    user.getAlbumImages().then(function(images) {
      res.send(images);
    });
  }

  var userId = req.query.id;
  //  If the userId is undefined, respond with the current session user image albums.
  if (userId === "undefined") {
    db.getUserByLogin(req.session.user, function(user) {
      sendAlbumImages(user);
    });
  }
  //  Respond with the given userId.
  else {
    db.getUserById(userId, function(user) {
      sendAlbumImages(user);
    });
  }
});

module.exports = router;
