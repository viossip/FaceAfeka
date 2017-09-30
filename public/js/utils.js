//Grab the files and set them to our variable
function prepareUploadPost(event, onSuccess, onFailure)
{
	if(event)
		files = event.target.files;
	uploadPost(event, onSuccess, onFailure);
}

function uploadPost(event, onSuccess, onFailure)
{
	if(event){
		event.stopPropagation(); // Stop stuff happening
		event.preventDefault(); // Totally stop stuff happening
	}
	

	// Create a formdata object and add the files
	var data = new FormData();
	if(typeof files !== 'undefined')
    	$.each(files, function(key, value) { data.append(key, value); });
    //  Attach the post's text to transmitted data.
    data.append("postText", $('form textarea[id=postText]').val());
	data.append("privacy", $('#privateCheckBox').is(":checked"));
	data.append("userId", $("#li_userId").text().split(':')[1].trim());

	$.ajax({
		url: '/posts/addPost',
        type: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		success: function(data, textStatus, jqXHR)
		{
			if(typeof data.error === 'undefined'){ onSuccess(data); }
			else { console.log('ERRORS: ' + data.error); }
			$('input[type=file]').val('');
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log('ERRORS: ' + textStatus);
			$('input[type=file]').val('');
			onFailure();
		}
    });
}

// Create new comment to post with given id.
function uploadComment(postId, onSuccess, onFailure){
	var data = new FormData();
	data.append("postId", postId);
	data.append("userId", $("#li_userId").text().split(':')[1].trim());
	data.append("text", $('#commentText_'+postId).val());

	/* post("/posts/addComment", data ,onSuccess,onFailure) */

	$.ajax({
		url: '/posts/addComment',
        type: 'POST',
		data: data,
		cache: false,
		dataType: 'json',
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		success: function(data, textStatus, jqXHR)
		{
			if(typeof data.error === 'undefined'){ onSuccess(data); }
			else { console.log('ERRORS: ' + data.error); }
			$('input[type=file]').val('');
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			console.log('ERRORS: ' + textStatus);
			$('input[type=file]').val('');
			onFailure();
		}
    });

}

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
	get("/posts/getPostsOfUser/"+ userId, onSuccess, onFailure);
}

//	Get all comments of specific post.
function getPostComments(commentId, onSuccess, onFailure) {
	get("/posts/getCommentsOfPost/"+ commentId, onSuccess, onFailure);
}