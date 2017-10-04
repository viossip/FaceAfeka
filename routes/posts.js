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

    var imgsDB = req.files.map(function(img) {
        return { imagePath : IMAGES_PATH + "/" + img.filename };
    });

    db.getUserByLogin(req.session.user, function(user) {
        db.addPost({ text: req.body.postText, privacy: req.body.privacy, 
                     writtenTo: req.body.userId, writtenBy: user.id }, imgsDB, function(postDB) {
            db.getPostLikes(postDB, function(likes) {
                res.send({ post: postDB, likes: likes });
            });
        });
    });
});


/* router.post("/addComment", storage.any(), function (req, res, next) {	
    //console.log("Posts route: comment uploaded successfully"); 
    db.addComment( { postId : req.body.postId, userId : req.body.userId, text: req.body.text} , function(commentDB){ 
        res.send([commentDB]);
    });
}); */

router.post("/addComment", function (req, res) {	
    //console.log("Posts route: comment uploaded successfully");
    db.getUserByLogin(req.session.user, function(user) {
        db.addComment({ postId: req.body.postId, userId: user.id, text: req.body.text} , function(commentDB){ 
            res.send([commentDB]);
        });
    });
});

//	Get a specific post.
router.get("/getPost/:id", function(req, res) {
	db.getPostById(req.params.id, function(post) {
        res.send([post]);
	});
});

//	Get the posts of specific user.
router.get("/getUserPosts/:userId", function(req, res) {
/* 	db.getUserPosts(req.params.userId, function(posts) {
		res.send(posts);
    }); */
    db.getPostsToUser(req.params.userId, function(posts) {
        res.send(posts);
    });
});

//	Get the comments of specific post.
router.get("/getPostComments/:postId", function(req, res) {
	db.getPostComments(req.params.postId, function(comments) {
		res.send(comments);
    });
});

 //	Get images names array of specific post by given post Id.
router.get("/getPostImages/:postId", function(req, res){
    
    var imgsNames = [];
    db.getPostImages(req.params.postId, function(imgsFromDB) {
        imgsFromDB.forEach(function(imgFromDB) {
            imgsNames.push({"name" : (imgFromDB.imagePath).split('/').pop(), "postId" : req.params.postId })
        }, this);
        res.send(imgsNames);
    });
});

 //	Get images names array of specific post by given post Id.
router.get("/getImage/:imageName", function(req, res){
    
    fs.readFile(path.join(__dirname, IMAGES_PATH + "/" + req.params.imageName) , function(err, imgFromFile) {
        res.send(imgFromFile); 
    }); 
});

router.get("/getPostsToUser", function(req, res) {
    console.log(req.query.id);
    db.getPostsToUser(req.query.id, function(posts) {
        console.log(JSON.stringify(posts));
    });
});

router.get("/getPostsByUser", function(req, res) {
    console.log(req.query.id);
    db.getPostsByUser(req.query.id, function(posts) {
        console.log(JSON.stringify(posts));
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