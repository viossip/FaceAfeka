var express = require("express");
var router = express.Router();
var db = require("../core/db");
var utils = require("../core/utils");
var fs = require("fs");
var path = require('path');
var multer  =   require('multer');
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

router.all('*', function (req, res, next) {
	console.log(path.basename(module.filename) +', ' + req.url);
	next();
});

//  Adds a given post to DB.
router.post("/addPost", upload.any(), function (req, res, next) {	
    
    var savePost = function(postText, privacy, writtenTo, writtenBy) {
        console.log("Adding post by user: " + writtenBy);
        db.addPost({ text: postText, privacy: privacy, 
                     writtenTo: writtenTo, writtenBy: writtenBy }, imgs, function(postDB) {                               
            return res.send([postDB]);
        });
    }

    var imgs = req.files.map(function(img) {
        return { imagePath : IMAGES_PATH + "/" + img.filename };
    });
    if (req.body.userId) {
        db.getUserById(req.body.userId, function(user) {
            savePost(req.body.postText, req.body.privacy, req.body.writtenTo, user.id);
        });
    }
    else {
        db.getUserByLogin(req.session.user, function(user) {
            savePost(req.body.postText, req.body.privacy, req.body.writtenTo, user.id);
        });
    }
});

//  Add comment to post by given postId.
router.post("/addComment", function (req, res) {	
    db.getUserByLogin(req.session.user, function(user) {
        db.addComment({ postId: req.body.postId, userId: user.id, text: req.body.text} , function(commentDB){ 
            res.send([commentDB]);
        });
    });
});

//	Get a specific post.
router.get("/getPost/:id", function(req, res) {
	db.getPostById(req.params.id, function(post) {
        res.send(post);
	});
});

//	Get the posts of specific user (from specific user's wall).
router.get("/getPostsToUser/:userId", function(req, res) {
    var allowedPosts = [];
    db.getUserByLogin(req.session.user, function(user) {
        db.getPostsToUser(req.params.userId, function(posts) {
             posts.forEach(function(post){
                post.writtenBy == user.id || post.writtenTo == user.id ? allowedPosts.push(post) : ((post.privacy == false) && allowedPosts.push(post));
            });
            res.send(allowedPosts); 
        });
    });
});

//	Get the comments of specific post.
/* router.get("/getPostComments/:postId", function(req, res) {
    var coms = [];
	db.getPostComments(req.params.postId, function(comments) {
        comments.forEach(function(comment, index){
            db.getPostById(comment.postId, function(post){
                comment["postWrittenBy"] = post.writtenBy;
                coms.push(comment);
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++==   " + JSON.stringify(comment.postWrittenBy));
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++==   " + JSON.stringify(comment.postWrittenBy));
                
                if(comments.length == index+1)
                    {
                        console.log("??????????????????????????????????????????????????????/   " + JSON.stringify(coms[0].postWrittenBy));
                        
                        console.log("-----------------------------------------------   " + JSON.stringify(coms));
                        res.send(comments);
                    }
                    
            })
        })
		
    });
}); */
router.get("/getPostComments/:postId", function(req, res) {
	db.getPostComments(req.params.postId, function(comments) {
		res.send(comments);
    });
});

//	Get the likes of specific post.
router.get("/getPostLikes/:postId", function(req, res) {
	db.getPostLikes(req.params.postId, function(likesDB) {
            res.send(likesDB);
        });
});

 //	Get images names array of specific post by given post Id.
router.get("/getPostImages/:postId", function(req, res){
    
    var imgsNames = [];
    db.getPostImages(req.params.postId, function(imgsFromDB) {
        imgsFromDB.forEach(function(imgFromDB) {
            imgsNames.push({name : (imgFromDB.imagePath).split('/').pop(), postId : req.params.postId });
        }, this);
        return res.send(imgsNames);
    });
});

//  Adds like of specific user to specific post
router.get("/addLike/:postId", function(req, res) {
    db.getUserByLogin(req.session.user, function(user){      
        db.addPostLike(user.id, req.params.postId, function(LikeDB){
            res.send([LikeDB]);
        });
    });
});

//  Removes like of user from specific post
router.get("/removeLike/:postId", function(req, res) {
    db.getUserByLogin(req.session.user, function(user){   
        db.removePostLike(user.id, req.params.postId, function(LikeDB){
            res.send([LikeDB]);
        });
    });
});

//  Removes post by ID.
router.get("/removePost/:postId", function(req, res) {
    db.removePost(req.params.postId, function(removedPost){
        res.send(removedPost);
    });
});

//  Removes comment by ID.
router.get("/removeComment/:commentId", function(req, res) {
    db.removeCommentById(req.params.commentId, function(removedComment){
        res.send({id : removedComment});
    });
});

//  Removes comment by ID.
router.get("/changePrivacy/:postId", function(req, res) {
    db.changePrivacy(req.params.postId, function(post){
        res.send(post);
    });
});


//	Get all allowed to user posts.
router.get("/getPosts", function(req, res) {
    var allowedPosts = [];
    var postsChecked = 0;
    db.getUserByLogin(req.session.user, function(user) {
        db.getAllPosts(function(posts){               
            posts.forEach(function(post){    
                db.checkFriends(req.session.user, post.writtenBy, function(result){
                    (!post.privacy && result.friends) ? allowedPosts.push(post) : ((post.writtenBy == user.id) && allowedPosts.push(post));                         
                    if(++postsChecked == posts.length){
                        allowedPosts.sort(function(a,b) { // Sort posts by date before sending.
                            return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime() 
                        });
                        res.send(allowedPosts);
                    }
                        
                });                          
            });
        });
    });
}); 
                
module.exports = router;