var express = require("express");
var router = express.Router();
var db = require("../core/db");
var utils = require("../core/utils");
var fs = require("fs");
var path = require('path');
var multer  =   require('multer');

const IMAGES_PATH = "../public/img/uploadedImgs";

var storage =   multer({dest: path.join(__dirname, IMAGES_PATH)});

router.all('*', function (req, res, next) {
	console.log(path.basename(module.filename) +', ' + req.url);
	next();
});

//  Adds a given post to DB.
router.post("/addPost",storage.any(), function (req, res, next) {	
    //console.log("Posts route: post uploaded successfully");

    var files = req.files; 

    var imgsDB = req.files.map(function(img) {return { imagePath : IMAGES_PATH + "/" + img.filename};});
    //console.log(JSON.stringify(imgsDB));

    db.addPost( { text : req.body.postText, privacy : req.body.privacy, userId: req.body.userId}, imgsDB , function(postDB){ 
        //console.log(JSON.stringify(postDB));
        res.send(postDB);
    });
});


router.post("/addComment", storage.any(), function (req, res, next) {	
    //console.log("Posts route: comment uploaded successfully"); 
    
    db.addComment( { postId : req.body.postId, userId : req.body.userId, text: req.body.text} , function(commentDB){ 
        res.send([commentDB]);
    });
});

//	Get a specific post.
router.get("/getPost/:id", function(req, res) {
	db.getPostById(req.params.id, function(post) {
        res.send([post]);
	});
});

//	Get the posts of specific user.
router.get("/getPostsOfUser/:userId", function(req, res) {
	db.getUserPosts(req.params.userId, function(posts) {
		res.send(posts);
    });
});

//	Get the comments of specific post.
router.get("/getCommentsOfPost/:postId", function(req, res) {
	db.getPostComments(req.params.postId, function(comments) {
		res.send(comments);
    });
});

/* //	Get all posts.
router.get("/getPosts", function(req, res) {
	db.getAllPosts(function(posts){
        console.log("Retrieving post " + JSON.stringify(posts));
		res.send(posts);
	});
}); */

module.exports = router;