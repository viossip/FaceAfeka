const axios = require('axios');
const FormData = require('form-data');
const db = require("../core/db");

var serverHostname = "localhost";
var serverPort = "1337";


var serverFullHostname = "http://" + serverHostname + ":" + serverPort;

module.exports.login = function(username, password, onSuccess, onFailure) {
    get("/auth/login?user=" + username + "&pass=" + password, {}, onSuccess, onFailure);
};

/* module.exports.uploadPost = function (data, onSuccess, onFailure) {
    postFiles("/posts/addPost", data, onSuccess, onFailure);
}; */

module.exports.uploadPost = function(data, onSuccess, onFailure) {
    db.getUserById(data.userId, function(user) {
        db.addPost({ text: data.postText, privacy: data.privacy, 
                     writtenTo: data.writtenTo, writtenBy: data.userId }, [], function(postDB) {                               
                        onSuccess(postDB);
        });
    });
};

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
        onSuccess();
    }).catch(function(error) {
        onFailure();
    });
}