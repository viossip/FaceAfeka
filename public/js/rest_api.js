var clientId = null;
var contId = null;

var currUser = null;

var eventListeners = [];
var binaryListener = null;

var pollerId = Math.random();
/*
function notifyEventListeners(data){
	$.each(eventListeners, function(idx, listener) {

		try{

			if(Array.isArray(data)){

				$.each(data,function(idx, event){
					if (listener.unitId && listener.unitId !== event.unitId) {
						return;
					}

					if (listener.type	&& listener.type !== event.type) {
						return;
					}

					listener.cb(event);	
				});

			}else{
				var event = data;

				if (listener.unitId && listener.unitId !== event.unitId) {
					return;
				}

				if (listener.type	&& listener.type !== event.type) {
					return;
				}

				listener.cb(event);	
			}
		}catch(e){
			console.log(e.stack);
		}
	});
}

var updatesSocket = null;

function reconnectUpdates(){

	var wsPrefix = "ws:";

	if(window.location.protocol === "https:"){
		wsPrefix = "wss:";
	}

	updatesSocket = new WebSocket(wsPrefix+"//"+location.host+"/async","relay_protocol");

	updatesSocket.binaryType = "arraybuffer";

	updatesSocket.onmessage = function (event) {

		if(event.data instanceof ArrayBuffer){
			if(binaryListener){
				binaryListener(event.data);
			}
		}else{

			var data = JSON.parse(event.data);

			notifyEventListeners(data);

		}
	};	

	updatesSocket.onopen = function (event) {
		console.log("Opened updates websocket "+event);
		if(clientId){
			updatesSocket.send(JSON.stringify({clientId:clientId+"_"+pollerId}));
		}
	};

	updatesSocket.onerror = function(){

		//setTimeout(reconnectUpdates, 2000);

	};

	updatesSocket.onclose = function(){

		setTimeout(reconnectUpdates, 2000);

	};
}

if(!useProxy){

	reconnectUpdates();

}else{

	$(document).ready(function(){

		$(".icon-cloud > span").css("background-position","-940px -275px");

	});

}

//proxy polling

var proxyEventListeners = {};

var currProxyAjax = null, currContAjax = null;

var relaySocket = null;


setInterval(function(){

	for(var reqId in proxyEventListeners){
		try{
			var handler = proxyEventListeners[reqId];

			var ts = parseInt(reqId.split("_")[1]);

			if(new Date().getTime() - ts > 10000){
				delete proxyEventListeners[reqId];
				if(handler.onFailure){
					showMessageDialog(nls.string1 || "Error", nls.string26 || "Failed to load data", function(){
						logout();
					});
					handler.onFailure();
				}	
			}

		}catch(e){

		}

	}

},10000);

function reconnectRelay(){
	var wsPrefix = "ws:";

	if(window.location.protocol === "https:"){
		wsPrefix = "wss:";
	}
	relaySocket = new WebSocket(wsPrefix+"//"+PROXY_ADDRESS+"/client_relay","relay_protocol");

	relaySocket.onopen = function (event) {
		console.log("Opened websocket "+event); 
	};

	relaySocket.onerror = function(){

		//setTimeout(reconnectRelay, 1000);

	};

	relaySocket.onclose = function(){

		setTimeout(reconnectRelay, 1000);

	};

	relaySocket.onmessage = function (event) {

		var data = JSON.parse(event.data);

		if(data.async){
			notifyEventListeners(data);
			return;
		}

		var requestHandler = proxyEventListeners[data.url + "_" + data.requestId];

		if(requestHandler){

			try{
				var dataObj = JSON.parse(data.data);
				requestHandler.onSuccess(dataObj);
			}catch(err){
				requestHandler.onSuccess(data.data);
			}

			delete proxyEventListeners[data.url + "_" + data.requestId];
		}

	};

}

reconnectRelay();
*/

/* ---------------- USERS API ---------------- */

function getUserById(id, onSuccess, onFailure) {
	get("/users/getUserById?id=" + id, onSuccess, onFailure);
}

function getUserByLogin(login, onSuccess, onFailure) {
	get("/users/getUserByLogin?login=" + login, onSuccess, onFailure);
}

function getUsers(onSuccess, onFailure) {
	get("/users/getUsers", onSuccess, onFailure);
}

function editUser(user, onSuccess, onFailure) {
	post("/users/updateUser", user, onSuccess, onFailure);
}

/* ---------------- AUTH API ---------------- */

function login(user, pass, onSuccess, onFailure) {
	get("/auth/login?user=" + user + "&pass=" + pass, function(user){
		//clientId = user.login;
		//currUser = user;
		onSuccess(user);

	}, onFailure);
}

function authLogout(onSuccess, onFailure) {
	get("/auth/logout", onSuccess, onFailure);
}

function checkLoginExists(user, onSuccess, onFailure) {
	get("/auth/checkLoginExists?user=" + user, onSuccess, onFailure);
}

function register(userObj, passwordStr, onSuccess, onFailure){
	post("/auth/registerUser", { user: userObj, password: passwordStr }, onSuccess, onFailure);
}

/* ---------------- POSTS API ---------------- */

/* //	Get posts written to a given user's wall
function getPostsToUser(userId, onSuccess, onFailure) {
	get("/posts/getPostsToUser?id=" + userId, onSuccess, onFailure);
}

//	Get posts written by a given user.
function getPostsByUser(userId, onSuccess, onFailure) {
	get("/posts/getPostsByUser?id=" + userId, onSuccess, onFailure);
} */

//	Get all posts.
function getPosts(onSuccess, onFailure) {
	get("/posts/getPosts", onSuccess, onFailure);
}

//	Get specific post by id.
function getPost(postId, onSuccess, onFailure) {
	get("/posts/getPost/" + postId, onSuccess, onFailure);
}

//	Get all posts of specific user.
function getUserPosts(userId, onSuccess, onFailure) {
	get("/posts/getUserPosts/"+ userId, onSuccess, onFailure);
}

//	Get all comments of specific post.
function getPostComments(postId, onSuccess, onFailure) {
	get("/posts/getPostComments/"+ postId, onSuccess, onFailure);
}

//	Get all imgs of specific post.
function getPostImages(postId, onSuccess, onFailure) {
	get("/posts/getPostImages/"+ postId, onSuccess, onFailure);
}

//	Get all imgs of specific post.
function getImage(imageName, onSuccess, onFailure) {
	get("/posts/getImage/"+ imageName, onSuccess, onFailure);
}

function uploadPost(data, onSuccess, onFailure) {
	postFiles("/posts/addPost", data, onSuccess, onFailure);
}

function uploadComment(data, onSuccess, onFailure) {
	post("/posts/addComment", data, onSuccess, onFailure);	
}



/* ---------------- HTTP METHODS ---------------- */

//	Post request with files.
function postFiles(url, data, onSuccess, onFailure) {

	$.ajax({
		url: url,
        type: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		success: function(data, textStatus, jqXHR)
		{
			onSuccess(data);
		},
		error: function(error) {
      		if (error.status === 401) {
        		if (window.location.pathname.indexOf("login") < 0) {
          			window.location = "/login";
        		}
      		}

     		if (onFailure) {
        		onFailure(error);
			}
		}
    });
}

//	Regular post request.
function post(url, data, onSuccess, onFailure, contentType, sync, direct) {

	var async = true;
	if (sync === true) {
		async = false;
	}

	if (url.indexOf("?") >= 0) {
		url += "&pc=" + new Date().getTime();
	} else {
		url += "?pc=" + new Date().getTime();
	}

	url += "&poller="+pollerId;

	$.ajax({
    	url: url,
    	data: data ? JSON.stringify(data) : null,
    	contentType: contentType || "application/json",
    	type: "POST",
    	async: async,
    	success: function(data) {
      		onSuccess(data);
    	},
    	error: function(error) {
      		if (error.status === 401) {
        		if (window.location.pathname.indexOf("login") < 0) {
          			window.location = "/login";
        		}
      		}

     		if (onFailure) {
        		onFailure(error);
      		}
    	}
  });
}

//	Regular get request.
function get(url, onSuccess, onFailure, sync) {
    
	var async = true;
	if (sync === true) {
		async = false;
	}

	if (url.indexOf("?") >= 0) {
		url += "&pc=" + (new Date().getTime());
	} else {
		url += "?pc=" + (new Date().getTime());
	}

    url += "&poller="+pollerId;

	return $.ajax({
		url : url,
		contentType : 'application/json',
		dataType : "json",
		type : 'GET',
		async : async,
		success : function(data) {
			onSuccess(data);
		},
		error : function(error) {

			if(error.status === 401){
				if(window.location.pathname.indexOf("login") < 0){
					window.location = "/login";
				}
            }
            
			if (onFailure) {
				onFailure(error);
			}
		}
	});
}