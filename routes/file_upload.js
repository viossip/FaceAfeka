var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var uploadSource = './';
var multer  =   require('multer');

const IMAGES_PATH = "../public/img/uploadedImgs";

var storage =   multer({dest: path.join(__dirname, IMAGES_PATH)});

router.all('*', function (req, res, next) {
	console.log(path.basename(module.filename) +', ' + req.url);
	next();
});


router.post('/uploadFile',storage.any(), function (req, res, next) {	
    /* res.send({file:req.files[0].filename}); */
    console.log("File_upload route: post uploaded successfully");
    var text = req.body.postText;
    console.log(JSON.stringify(text));
    console.log("uploaded2");
});


router.get("/getFile", function(req, res){
	var fileName = req.query.fileName;
	
	fs.readFile(path.join(__dirname, IMAGES_PATH + fileName), function(err, data) {
		res.send(data);
	});
});


module.exports = router;