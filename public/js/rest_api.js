var clientId = null;
var contId = null;

var currUser = null;

var eventListeners = [];
var binaryListener = null;

var pollerId = Math.random();

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

function searchUserPrefix(prefix, onSuccess, onFailure) {
	get("/users/searchUserPrefix?prefix=" + prefix, onSuccess, onFailure);
}

function editUser(user, onSuccess, onFailure) {
	post("/users/updateUser", user, onSuccess, onFailure);
}

function getUserFriends(userId, onSuccess, onFailure) {
	get("/users/getUserFriends?id=" + userId, onSuccess, onFailure);
}

function uploadProfileImage(data, onSuccess, onFailure) {
	postFiles("/users/addProfileImg", data, onSuccess, onFailure);
}

function uploadAlbumImage(data, onSuccess, onFailure) {
	postFiles("/users/addAlbumImg", data, onSuccess, onFailure);
}

function removeAlbumImage(imageId, onSuccess, onFailure) {
	get("/users/removeAlbumImg?imageId=" + imageId, onSuccess, onFailure);
}

function getUserAlbumImages(userId, onSuccess, onFailure) {
	get("/users/getUserAlbumImages?id=" + userId, onSuccess, onFailure);
}

function getProfileImageById(userId, onSuccess, onFailure) {
	get("/users/getProfileImgById?id=" + userId, onSuccess, onFailure);
}

function checkFriends(userId, onSuccess, onFailure) {
	get("/users/checkFriends?id=" + userId, onSuccess, onFailure);
}

function addFriend(userId, onSuccess, onFailure) {
	get("/users/addFriend?id=" + userId, onSuccess, onFailure);
}

function removeFriend(userId, onSuccess, onFailure) {
	get("/users/removeFriend?id=" + userId, onSuccess, onFailure);
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

//	Get posts written by a given user.
function getPostsByUser(userId, onSuccess, onFailure) {
	get("/posts/getPostsByUser?id=" + userId, onSuccess, onFailure);
} 

//	Get all posts.
function getPosts(onSuccess, onFailure) {
	get("/posts/getPosts", onSuccess, onFailure);
}

//	Get specific post by id.
function getPost(postId, onSuccess, onFailure) {
	get("/posts/getPost/" + postId, onSuccess, onFailure);
}

//	Get all posts from a given user's wall.
function getPostsToUser(userId, onSuccess, onFailure) {
	get("/posts/getPostsToUser/"+ userId, onSuccess, onFailure);
}

//	Get all comments of specific post.
function getPostComments(postId, onSuccess, onFailure) {
	get("/posts/getPostComments/"+ postId, onSuccess, onFailure);
}

//	Get all likes of specific post.
function getPostLikes(postId, onSuccess, onFailure) {
	get("/posts/getPostLikes/"+ postId, onSuccess, onFailure);
}

//	Get all imgs of specific post.
function getPostImages(postId, onSuccess, onFailure) {
	get("/posts/getPostImages/"+ postId, onSuccess, onFailure);
}

 //	Get image from server by imageName.
function getImage(imageName, onSuccess, onFailure) {
	get("/getImage/"+ imageName, onSuccess, onFailure);
} 

//	Uploads a post to the server.
function uploadPost(data, onSuccess, onFailure) {
	postFiles("/posts/addPost", data, onSuccess, onFailure);
}

//	Uploads a comment to the server.
function uploadComment(data, onSuccess, onFailure) {
	post("/posts/addComment", data, onSuccess, onFailure);	
}

//	Adds a post like.
function addLike(postId, onSuccess, onFailure) {
	get("/posts/addLike/"+ postId, onSuccess, onFailure);	
}

//	Remove a like of specific user from specific post.
function removeLike(postId, onSuccess, onFailure) {
	get("/posts/removeLike/"+ postId, onSuccess, onFailure);	
}

//	Remove the post by ID.
function removePost(postId, onSuccess, onFailure) {
	get("/posts/removePost/"+ postId, onSuccess, onFailure);	
}

//	Remove the comment by ID.
function removeComment(commentId, onSuccess, onFailure) {
	get("/posts/removeComment/"+ commentId, onSuccess, onFailure);	
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