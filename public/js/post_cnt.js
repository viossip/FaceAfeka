var imgEvent;
//var userId_glob = window.location.href.split('=')[1];
var userId_glob;
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
            $("#imagesPlaceHolder_"+  img.postId).prepend(
            '<a href="http://' + domain_glob + ':' + location.port + '/getImage/' + img.name + '"' +
            'data-type="image" data-toggle="lightbox" data-parent=".gallery-parent" data-hover="tooltip"' + 
            'data-placement="top"> <img src="/getImage/' +img.name + '" height="50px" width="50px"></a>' );
        }, this);
    }
}

// Getting requested likes from server per post. The format of array {likes: likes, postId:postId }
function updateLikes(likes){

    if(typeof likes !== 'undefined'){

        likes.forEach(function(like){
            // If the like is of the current user
            if(like.id == userId_glob){
                if($("#likeBtn_"+  like.postId).text() == "Unlike"){

                    removeLike(like.postId, function(){
                        $("#likeBtn_"+  like.postId).text("Like");
                        changeLikesCounter(like.postId, -1);    
                        $('#liker_' + like.id + '_post_' + like.postId).remove();
                    }, function(){});////////////////////////
                }
                else{
                    $("#likeBtn_"+  like.postId).text("Unlike");
                    $("#likersList_"+  like.postId).prepend(
                        '<li id = "liker_'+like.id+'_post_'+like.postId+'">'+
                            '<a href="http://'+ domain_glob +':'+ location.port +'/profile">'+
                            '<img src="img/user.png" height="35px" width="35px">  '+ like.fullname +'</a> </li> ');
                    changeLikesCounter(like.postId, 1);                    
                }           
            }
            // If this like is of another user.
            else{
                changeLikesCounter(like.postId, 1);
                $("#likersList_"+  like.postId).prepend(
                    '<li id = "user_'+like.id+'_post_'+like.postId+'">'+
                        '<a href="http://'+ domain_glob +':'+ location.port +'/profile?id='+ like.id +'">'+
                        '<img src="img/user.png" height="35px" width="35px">  ' + like.fullname +'</a>'+
                    '</li> ');
            }
                
            // Disable drop-down function when there is no likes on post.
            if ($("#likesPost_"+  like.postId).text()==0)
                $("#likersDropdown_"+  like.postId).removeAttr('data-toggle');
            else
                if(!($("#likersDropdown_"+  like.postId).attr('data-toggle')))
                    $("#likersDropdown_"+  like.postId).attr('data-toggle', 'dropdown');

        });  
    }
}

// Adds parameter "num" to counter of likes on post whith given Id.
function changeLikesCounter(postId, num){
    var el = parseInt($("#likesPost_"+  postId).text()); 
    $("#likesPost_"+  postId).text(el + num); 
}

// Adds parameter "num" to counter of likes on post whith given Id.
function add(postId, num){
    var el = parseInt($("#likesPost_"+  postId).text()); 
    $("#likesPost_"+  postId).text(el + num); 
}

// Displays posts from given array of posts
function showPosts(postsArr) {

    //  Clear post form fields
    $('input[type=file]').val('');
    $('form textarea[id=postText]').val("");
    $('#privateCheckBox').prop('checked', false);
    $('#preview').empty();
    console.log(JSON.stringify(postsArr));

    if(typeof postsArr !== 'undefined'){
        postsArr.forEach(function(post) {
            $( "#postsPlaceHolder" ).prepend(function() {
                var delBtn = (post.writtenBy != userId_glob)?"":
                "<div class = 'col-sm-2 pull-right'>" +
                    "<button id='btnDeletePost_"+post.id+"' type='button' class='btn btn-danger pull-right'>Delete</button>" +
                "</div>" ;

                var showPosts =
                "<div class='panel panel-default post' "+ "id= 'post_"+post.id +"'>"+
                    "<div class='panel-body'>" + 
                        "<div class = row>" +
                            "<div class = row>" +                              
                                // POST IMAGES
                                "<div id='imagesPlaceHolder_"+post.id+"' class = 'col-sm-8'></div>" +
                                delBtn +
                            "</div>" +
                            "<div class = 'col-sm-2'>" + 
                                "<a class = 'post-avatar thumbnail' href='profile.html'> <img src='img/user.png'>" +
                                    "<div class = 'text-center'>DevUser1</div>" + 
                                "</a>"+
                                "<div class = 'likes text-center'>" +
                                    "<div id='likesPost_"+post.id+"'>0</div>" + 
                                                    /////////////////////////////////////////////////                           
                                        "<div class='dropdown'>" +
                                        //"<a data-toggle='dropdown' id='likersDropdown_"+post.id+"'><label>Likes</label></a>" +
                                        "<a id='likersDropdown_"+post.id+"'><label>Likes</label></a>" +
                                        "<span class='caret'></span>" +                                     
                                        "<ul class='dropdown-menu' id='likersList_"+post.id+"'>" +
                                        //  Likers links place.
                                        "</ul>" +
                                    "</div>" +
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
                                            ////////////////////////////////////////////
                                            "<button id='likeBtn_"+ post.id +"' class='btn btn-info btn-sm  '>Like</button>" +
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
            getPostLikes(post.id, updateLikes, function(){});
            ///getPostAvatar(post.id, showPostAvatar, function(){});
        }, this);
    }
}

// Displays avatar of user that created the post.
function showPostAvatar(postId, onSuccess, onFailure){
    
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

    $(document).delegate('*[id^="likeBtn_"]', 'click', function(event) {
        event.preventDefault();
        var postId = event.target.id.split('_')[1];
        addLike(postId, updateLikes, function(){ });      
    });
    
    //  Get current user ID
    getUserById("", function(user){
            userId_glob = user.id; //   save variable globally
            if(!(window.location.href.split("id=")[1]))        
            getPostsToUser(userId_glob ,showPosts, function(){ });
        else
            getPostsToUser(window.location.href.split("id=")[1] ,showPosts, function(){ });
    },function(){});  

    // Listener for add comment button
    $('body').on('click', '#postsPlaceHolder', function(event) { 
        if(event.target.id.split('_')[0] == "btnAddComment"){
            var postIdToComment = event.target.id.split('_')[1];
            addComment(postIdToComment);
        }
        else if(event.target.id.split('_')[0] == "btnDeletePost")
        console.log("--------------------------------- ");
    });
});