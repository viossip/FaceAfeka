var imgEvent;

//Grab the files and set them to our variable
/* function prepareUploadPost(event, onSuccess, onFailure) {
	if(event)
		files = event.target.files;
	uploadPost(event, onSuccess, onFailure);
} */

function prepareUploadPost(event, onSuccess, onFailure) {
    if (event) {
        files = event.target.files;
        event.stopPropagation(); // Stop event propagation.
		event.preventDefault(); // Prevent default event action.
    }

	// Create a formdata object and add the files
	var data = new FormData();
	if(typeof files !== 'undefined')
    	$.each(files, function(key, value) { data.append(key, value); });
    //  Attach the post's text to transmitted data.
    data.append("postText", $('form textarea[id=postText]').val());
	data.append("privacy", $('#privateCheckBox').is(":checked"));
    data.append("userId", $("#li_userId").text().split(':')[1].trim());
    console.log("DATA:" + JSON.stringify(data));
    uploadPost(data, onSuccess, onFailure);
}

/*
function uploadPost(event, onSuccess, onFailure) {
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
}*/

// Create new comment to post with given id.
/* function uploadComment(postId, onSuccess, onFailure){
	var data = new FormData();
	data.append("postId", postId);
	data.append("userId", $("#li_userId").text().split(':')[1].trim());
	data.append("text", $('#commentText_'+postId).val());

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

} */

function postClicked(event) {
	
	var postTextElement = $('form textarea[id=postText]');
	var postText = postTextElement.val();

    event.preventDefault();
    event.stopPropagation();

	if(!postText || postText.length === 0){
		postTextElement.attr('placeholder', "Write something here...").focus();
		return;
    }

    prepareUploadPost(imgEvent, uploadDone, function(){ });
}


function uploadDone(data) {
    $('input[type=file]').val('');
    //  Clear the textField of post
    $('form textarea[id=postText]').val("");
    $('#privateCheckBox').prop('checked', false);
    $('#preview').empty();
    console.log(JSON.stringify(data));

    //  Why get post again if you already have it??? (data)!!!
    getPost(data.id, showPosts, function(){ });

    // Display the new uploaded post
    // TODO: 
}

/* function addComment(postId){

    var commentTextElement = $('#commentText_'+postId);

    if(typeof commentTextElement !== 'undefined'){
        var commentText = commentTextElement.val();
        event.preventDefault();

        console.log("Comment Text"+ commentText);

        if(!commentText || commentText.length === 0){
            commentTextElement.attr('placeholder', "Write something here...").focus();
            return;
        }

        uploadComment(postId, showComments, function(){ });
    }
} */

function addComment(postID) {
  var commentTextElement = $("#commentText_" + postID);

  if (typeof commentTextElement !== "undefined") {
    var commentText = commentTextElement.val();
    event.preventDefault();

    console.log("Comment text " + commentText);

    if (!commentText || commentText.length === 0) {
      commentTextElement.attr("placeholder", "Write something here...").focus();
      return;
    }

    uploadComment({ postId: postID, text: commentText }, showComments, function() {});
  }
}

// Displays comments from given array of posts
function showComments(commentsArr, onSuccess, onFailure){
    if(typeof commentsArr !== 'undefined'){
        commentsArr.forEach(function(comment) {
            $('#commentText_'+comment.postId).val("");
            $( "#commentsPlaceHolder_"+  comment.postId).prepend(function() {
                var showComment =
                                "<div class = 'comment'>"+
                                    "<a class = 'comment-avatar pull-left' href = '#'><img src = 'img/user.png'></a>"+
                                    "<div class = 'comment-text'>"+
                                        "<p>"+ comment.text +"</p>"+
                                    "</div>"+
                                "</div> <!-- ENDof Comment -->";
                return showComment;
            });
        }, this);
    }
}

// Displays requested images from server by their names given in the array.
function getImages(imagesArr, onSuccess, onFailure){
    
    if(typeof imagesArr !== 'undefined'){
        imagesArr.forEach(function(img) {
            $("#imagesPlaceHolder_"+  img.postId).prepend('<img height="50px" width="50px" id ="img" src="/posts/getImage/' +img.name+ '" /> ');
        }, this);
    }
}


// Displays posts from given array of posts
function showPosts(postsArr) {
    if(typeof postsArr !== 'undefined'){
        postsArr.forEach(function(post) {
            $( "#postsPlaceHolder" ).prepend(function() {
                var showPosts =
                "<div class='panel panel-default post' "+ "id= 'post_"+post.id +"'>"+
                    "<div class='panel-body'>" + 
                        "<div class = row>" +
                            "<div class = row>" +
                            // IMAGES
                                "<div id='imagesPlaceHolder_"+post.id+"' class = 'col-sm-8'>"+
                                "</div>" +
                            "</div>" +
                            "<div class = 'col-sm-2'>" + 
                                "<a class = 'post-avatar thumbnail' href='profile.html'> <img src='img/user.png'>" +
                                    "<div class = 'text-center'>DevUser1</div>" + 
                                "</a>"+
                                "<div class = 'likes text-center'>7 Likes</div>" +
                                    
                            "</div> <!-- ENDof Col-sm-2 -->"+
                
                            "<div class = 'col-sm-10'>"+
                                "<div class = 'bubble'>" +
                                    "<div class = 'pointer'>"+
                                        "<p>"+post.text+"</p>"+
                                    "</div>" +

                                    "<div class = 'pointer-border'> </div>"+
                                "</div> <!-- ENDof bubbble -->" +

                                "<div class='container'>" +
                                    "<div class='row'>" +
                                        "<div id ='postActions' class='col-xs-3'>" +
                                            "<p class = 'post-actions'>" +
                                            "<a href = '#'>Comment</a> - <a href = '#'>Like</a> - <a href = '#'>Follow</a> - <a href = '#'>Share</a>" +
                                            "</p>"+
                                        "</div>" +
                                        "<div id ='postCreatedDate' class='col-xs-2' style='font-family: Arial Black; font-size: 12px; color: blue'>Created: "+ post.createdAt + "</div>" +
                                        "<div id ='postPrivacy' class='col-xs-2' style='font-family: Arial Black; font-size: 13px; color: blue'>Private: "+ post.privacy + "</div>" +
                                            
                                    "</div>" +
                                "</div>" +

                                "<div class = 'comment-form'>" +

                                    "<form class='form-inline'>" +
                                        "<div class='form-group'>" +
                                            "<input type='text' id = 'commentText_"+post.id+"' class='form-control' placeholder='Enter Comment'>"+
                                        "</div>"+
                                        "<button id='btnAddComment_"+post.id+"' type='button' class='btn btn-default'>Add</button>"+
                                    "</form>"+

                                "</div> <!-- ENDof CommentForm -->"+

                                "<div class = 'clearfix'></div>"+
                                //  COMMENTS
                                "<div id='commentsPlaceHolder_"+post.id+"' class = 'comments'>"+
                                    "<div class = 'clearfix'></div>"+
                                "</div> <!-- ENDof Comments -->"+

                            "</div> <!-- ENDof Col-sm-10 -->"+        
                        "</div> <!-- ENDof row -->"+
                    "</div> <!-- ENDof panel body -->";
                "</div>";
            return showPosts;
            });

            getPostComments(post.id, showComments, function(){ });
            getPostImages(post.id, getImages, function(){});
        }, this);
    }
}

function previewImages() {

  var $preview = $('#preview').empty();
  if ($("#images")[0].files) $.each($("#images")[0].files, readAndPreview);

  function readAndPreview(i, file) {
    
    if (!/\.(jpe?g|png|gif)$/i.test(file.name)){
      return alert(file.name +" is not an image");
    } // else...
    var reader = new FileReader();

    $(reader).on("load", function() {
      $preview.append($("<img/>", {src:this.result, height:80, width : 90}));
    });
    reader.readAsDataURL(file);
  }
}


$(document).ready(function() {
    //  Attach event handler to the form (sign in button)
    $('form').submit(postClicked);

    //  Attach event handler to the file input button.
    $('input[type=file]').on('change', function(event){
        previewImages();
        imgEvent = event;
        if($("#images")[0].files.length > 3) // Limit of 3 imgs per post.
            alert("You can select only 3 images");
    });

    var userId = $("#li_userId").text().split(':')[1].trim();

    getUserPosts(userId ,showPosts, function(){ });

    // Listener for add comment button
    $('body').on('click', '#postsPlaceHolder', function(event) { 
        if(event.target.id.split('_')[0] == "btnAddComment"){
            var postIdToComment = event.target.id.split('_')[1];
            //console.log("comment ID: " + postIdToComment);
            addComment(postIdToComment);
        }
        
    });
});