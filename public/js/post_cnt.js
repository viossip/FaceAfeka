var imgEvent;
var userId_glob = window.location.href.split('=')[1];
var domain_glob = window.location.hostname;

function prepareUploadPost(event, onSuccess, onFailure) {
    if (event)
        files = event.target.files;
        
	// Create a formdata object and add the files
	var data = new FormData();
	if(typeof files !== 'undefined') {
    	$.each(files, function(key, value) {
            data.append(key, value);
        });
    }
    
    //  Attach the post's text to transmitted data.
    data.append("postText", $('form textarea[id=postText]').val());
	data.append("privacy", $('#privateCheckBox').is(":checked"));
    data.append("userId", $("#li_userId").text().split(':')[1].trim());
    //console.log("DATA:" + JSON.stringify(data));
    uploadPost(data, onSuccess, onFailure);
}


function postClicked(event) {
	
	var postTextElement = $('form textarea[id=postText]');
	var postText = postTextElement.val();

    event.preventDefault();
    event.stopPropagation();

	if(!postText || postText.length === 0){
		postTextElement.attr('placeholder', "Write something here...").focus();
		return;
    }

    prepareUploadPost(imgEvent, showPosts, function(){ });
}


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
            $("#imagesPlaceHolder_"+  img.postId).prepend('<img height="50px" width="50px" id ="img" src="/getImage/' +img.name+ '" /> ');
        }, this);
    }
}

// Getting requested likes from server per post. The format of array {likes: likes, postId:postId }
function getLikes(likesArr, onSuccess, onFailure){
  //  if(typeof likesArr !== 'undefined'){
     //   $("#likesPost_"+  likesArr.postId).text(likesArr.UserPostLikes.length + " Likes");
   //  }
   console.log("------------------------------------------------- " + JSON.stringify(likesArr));

     //TODO: add link that will open the list of users in case where the likes array is not empty.
     //
     //
}


// Displays posts from given array of posts
function showPosts(postsArr) {

    //  Clear post form fields
    $('input[type=file]').val('');
    $('form textarea[id=postText]').val("");
    $('#privateCheckBox').prop('checked', false);
    $('#preview').empty();
    //console.log(JSON.stringify(postsArr));

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
                                "<div class = 'likes text-center' id='likesPost_"+post.id+"'> " +
                                   // "7 Likes" +
                                "</div>" +
                                    
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
                                            "<a>Comment</button > - <a id='like_"+ post.id +"'>Like</a> - <a>Follow</a> - <a>Share</a>" +
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
            getPostLikes(post.id, getLikes, function(){});
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
    $("#images").on('change', function(event){
        previewImages();
        imgEvent = event;
        if($("#images")[0].files.length > 3) // Limit of 3 imgs per post.
            alert("You can select only 3 images");
    });

    $(document).delegate('*[id^="like_"]', 'click', function(event) {

        event.preventDefault();
        console.log("??????????????????????????// " + userId_glob);
        addLike({ postId : event.target.id.split('_')[1], userId : userId_glob}, getLikes, function() {});
        
    });

    if(userId_glob)
        getPostsToUser(userId_glob ,showPosts, function(){ });
    else  
        getUserById("", function(user){
            userId_glob = user.id; //   save variable globally
            getPostsToUser(user.id ,showPosts, function(){ });
        },function(){});

    // Listener for add comment button
    $('body').on('click', '#postsPlaceHolder', function(event) { 
        if(event.target.id.split('_')[0] == "btnAddComment"){
            var postIdToComment = event.target.id.split('_')[1];
            addComment(postIdToComment);
        }
    });
});