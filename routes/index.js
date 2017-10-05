var express = require('express');
var db = require("../core/db");
var utils = require("../core/utils");
var path = require('path');
var router = express.Router();

const IMAGES_PATH = "../uploadedImgs";

//  Get index page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'faceAfeka' });
});

//  Get index page.
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'faceAfeka' });
});

//  Get members page.
router.get('/members', function(req, res, next) {
  res.render('members', { title: 'faceAfeka' });
});

//  Get register page.
router.get('/register', function(req, res, next) {
	res.render('register', { title: 'faceAfeka' });
});

//  Get photos page.
router.get('/photos', function(req, res, next) {
	res.render('photos', { title: 'faceAfeka' });
});

//  Get groups page.
router.get('/groups', function(req, res, next) {
	res.render('groups', { title: 'faceAfeka' });
});

//  Get profile page.
//  To get a specific profile use: hostname:port/profile?id=123
router.get('/profile', function(req, res, next) {
  
  var currUserId = req.query.id;

  //  If user goes to his own profile, there's no id in query
  if (!currUserId) {
    db.getUserByLogin(req.session.user, function(user) {
      currUserId = user.id;
      renderProfile(currUserId, req, res, next);
    });
  }
  else {
    renderProfile(currUserId, req, res, next);
  }
});

//	Get images names array of specific post by given post Id.
router.get("/getImage/:imageName", function(req, res){
    res.sendFile(path.join(__dirname, IMAGES_PATH, req.params.imageName));
});

function renderProfile(currUserId, req, res, next) {

  console.log("index: Retrieving user id " + currUserId);
  var userId = parseInt(currUserId);
  
  //  Check if provided id is a positive number and its length is between 1 to 7 digits
  if (userId > 0 && utils.getLength(userId) > 0 && utils.getLength(userId) < 8) {
    db.getUserById(userId, function(user) {
      //user.getImages().then(function(images) {
      //  console.log(JSON.stringify(images[0].imagePath));
      //});
      if (!user)
        res.sendStatus(401);
      if (user.getImages().length === 0) {
        userImage = "/getImage/user.png";
        res.render("profile", {
          userId: user.id,
          userFullname: user.firstName + " " + user.lastName,
          userEmail: user.login,
          userImage: userImage
        });
      }
        
      else {
        user.getImages().then(function(images) {
          userImage = "/getImage/" + images[0].imagePath.split('/').pop();
          res.render("profile", {
            userId: user.id,
            userFullname: user.firstName + " " + user.lastName,
            userEmail: user.login,
            userImage: userImage
          });
        });
      }
      
      //res.send({id: user.id, login: user.login, firstname: user.firstName, lastname: user.lastName, image: ProfileImageId});
    });
  }
  else
    res.sendStatus(401);
}

module.exports = router;
