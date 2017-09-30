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
    /* res.send({file:req.files[0].filename}); */
    console.log("Posts route: post uploaded successfully");

    var files = req.files; 

    var imgsDB = req.files.map(function(img) {return { imagePath : IMAGES_PATH + "/" + img.filename};});
    console.log(JSON.stringify(imgsDB));

    db.addPost( { text : req.body.postText, privacy : req.body.privacy}, imgsDB , function(postDB){ 
        console.log(JSON.stringify(postDB));
        res.send(postDB);
 });
    //db.addPost( { text : req.body.postText, privacy : req.body.privacy}, imgsDB , res);
    //res.send({"result":"success"});
});

router.get("/getPost", function(req, res){

	/* var fileName = req.query.fileName;
	fs.readFile(path.join(__dirname, IMAGES_PATH + fileName), function(err, data) {
		res.send(data);
  }); */
  
});

module.exports = router;