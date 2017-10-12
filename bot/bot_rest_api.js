const axios = require('axios');
const FormData = require('form-data');
const concat = require("concat-stream")
const db = require("../core/db");

var serverHostname = "localhost";
var serverPort = "1337";

var serverFullHostname = "http://" + serverHostname + ":" + serverPort;

module.exports.login = function(username, password, onSuccess, onFailure) {
    //get("/auth/login?user=" + username + "&pass=" + password, {}, onSuccess, onFailure);
    axios.get(serverFullHostname + "/auth/login?user=" + username + "&pass=" + password, { withCredentials: true });
};

module.exports.uploadPost = function (formData, onSuccess, onFailure) {
    formData.pipe(concat({encoding: 'buffer'}, data => {
        axios.post(serverFullHostname + "/posts/addPost", data, {
          headers: formData.getHeaders()
        }).then(function(data) {
            onSuccess(data);
        }).catch(function(error) {
            onFailure(error);
        });
      }));
    //postFiles("/posts/addPost", data, onSuccess, onFailure);
}; 

/* module.exports.uploadPost = function(data, onSuccess, onFailure) {
    db.getUserById(data.userId, function(user) {
        db.addPost({ text: data.postText, privacy: data.privacy, 
                     writtenTo: data.writtenTo, writtenBy: data.userId }, [], function(postDB) {                               
                        onSuccess(postDB);
        });
    });
}; */

function get(url, data, onSuccess, onFailure) {
    axios({
        method: 'get',
        url: serverFullHostname + url,
        data: data
    }).then(function(data) {
        onSuccess();
    }).catch(function(error) {
        onFailure();
    });
}

function post(url, data, onSuccess, onFailure) {
    axios({
        method: 'post',
        url: serverFullHostname + url,
        data: data,
    }).then(function(data) {
        onSuccess(data);
    }).catch(function(error) {
        onFailure(error);
    });
}

module.exports.downloadImg = function (url, type, onSuccess, onFailure) {
    axios.request({
        responseType: "arraybuffer",
        url: url,
        method: "get",
        headers: {
            "Content-Type": type,
        },
    }).then(function(data) {
        onSuccess(data);
    }).catch(function(error) {
        onFailure(error);
    });
}