var imgEvent;
var userId_glob;
var domain_glob = window.location.hostname;
const POSTS_TO_SHOW = 8;

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
    if(!(window.location.href.split("id=")[1]))  
        data.append("writtenTo", userId_glob);
    else
        data.append("writtenTo", window.location.href.split("id=")[1]);
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
        console.log("--------------------------commentsArr: " + JSON.stringify(commentsArr));
        commentsArr.forEach(function(comment) {   
            //console.log("-----------------------COMMENT: " + JSON.stringify(comment)) ;        
            getPost(comment.postId, function(currentPost){
                getProfileImageById(comment.userId, function(img){
                    var imgPath = (img.imgName !== undefined)? "http://" + domain_glob + ":" + location.port + "/getImage/" + img.imgName : 
                    "http://" + domain_glob + ":" + location.port + "/getImage/user.png";

                    $('#commentText_'+comment.postId).val("");
                    $( "#commentsPlaceHolder_"+  comment.postId).prepend(function() {

                     var delBtn = (comment.userId == userId_glob || currentPost.writtenBy == userId_glob)?
                        "<button id='btnDeleteComment_"+comment.id+"' type='button' class='btn-xs btn-danger pull-right'>Delete</button>" : "";                   
                    var showComment =
                        "<div class = 'comment' id='comment_"+ comment.id +"'>"+
                            "<a class = 'comment-avatar pull-left' "+
                            "href = 'http://"+domain_glob +':'+ location.port +"/profile?id="+ comment.userId +"'>"+
                            "<img src = '" + imgPath + "'></a>"+
                            "<div class = 'comment-text'><p>"+ comment.text +"</p></div>"+
                            delBtn +
                        "</div> <!-- ENDof Comment -->";
                    return showComment; 
                    });     
                });         
            }, function(){});
        }, this);
    }
}

/* function createCommentElement(comment, post, imgPath){
    var delBtn = (comment.userId == userId_glob || post.writtenBy == userId_glob)?
        "<button id='btnDeleteComment_"+comment.id+"' type='button' class='btn-xs btn-danger pull-right'>Delete</button>" : "";                   
    var showComment =
        "<div class = 'comment' id='comment_"+ comment.id +"'>"+
            "<a class = 'comment-avatar pull-left' "+
            "href = 'http://"+domain_glob +':'+ location.port +"/profile?id="+ comment.userId +"'>"+
            "<img src = '" + imgPath + "'></a>"+
            "<div class = 'comment-text'><p>"+ comment.text +"</p></div>"+
            delBtn +
        "</div> <!-- ENDof Comment -->";
return showComment;
} */

// Displays requested images from server by their names given in the array.
function getImages(imagesArr){  
    
    if(typeof imagesArr !== 'undefined'){
        imagesArr.forEach(function(img) {
            $("#imagesPlaceHolder_"+  img.postId).prepend(
            '<a href="http://' + domain_glob + ':' + location.port + '/getImage/' + img.name + '"' +
            'data-type="image" data-toggle="lightbox" data-parent=".gallery-parent" data-hover="tooltip"' + 
            'data-placement="top"> <img src="/getImage/' +img.name + '" class="img-thumbnail" height="50px" width="50px"></a>' );
        }, this);
    }  
}

// Getting requested likes from server per post. The format of array {likes: likes, postId:postId }
function updateLikes(likes){

    if(typeof likes !== 'undefined'){
        likes.forEach(function(like){
            getProfileImageById(like.id, function(img){
                
                var imgPath = (img.imgName !== undefined)? "http://" + domain_glob + ":" + location.port + "/getImage/" + img.imgName : 
                                                            "http://" + domain_glob + ":" + location.port + "/getImage/user.png";

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
                                '<img src="'+imgPath+'" height="35px" width="35px">  '+ like.fullname +'</a> </li> ');
                        changeLikesCounter(like.postId, 1);                    
                    }           
                }
                // If this like is of another user.
                else{
                    changeLikesCounter(like.postId, 1);
                    $("#likersList_"+  like.postId).prepend(
                        '<li id = "user_'+like.id+'_post_'+like.postId+'">'+
                            '<a href="http://'+ domain_glob +':'+ location.port +'/profile?id='+ like.id +'">'+
                            '<img src="'+imgPath+'" height="35px" width="35px">  ' + like.fullname +'</a>'+
                        '</li> ');
                }
                    
                // Disable drop-down function when there is no likes on post.
                if ($("#likesPost_"+  like.postId).text()==0)
                    $("#likersDropdown_"+  like.postId).removeAttr('data-toggle');
                else
                    if(!($("#likersDropdown_"+  like.postId).attr('data-toggle')))
                        $("#likersDropdown_"+  like.postId).attr('data-toggle', 'dropdown');
            }, function(){});
        });  
    }
}

// Adds parameter "num" to counter of likes on post whith given Id.
function changeLikesCounter(postId, num){
    var el = parseInt($("#likesPost_"+  postId).text()); 
    if(el >= 0)
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

    if(typeof postsArr !== 'undefined'){
        var len = postsArr.length;
        postsArr.forEach(function(post) {   
            $( "#postsPlaceHolderHidden > div" ).length >= len - POSTS_TO_SHOW ?
                $( "#postsPlaceHolder" ).prepend(createPostElement(post)) :
                $( "#postsPlaceHolderHidden" ).prepend(createPostElement(post));
                
            getPostComments(post.id, showComments, function(){ });
            getPostImages(post.id, getImages, function(){});
            getPostLikes(post.id, updateLikes, function(){});
            
            getProfileImageById(post.writtenBy, function(img){
                if(img.imgName !== undefined)
                    $('#avatar_'+post.id).attr('src','http://' + domain_glob + ':' + location.port + '/getImage/' + img.imgName);
                else
                    $('#avatar_'+post.id).attr('src','http://' + domain_glob + ':' + location.port + '/getImage/user.png');
                
                getUserById(post.writtenBy, function(user){
                    $('#avatar_'+post.id).siblings('div').text((user.firstname + " " + user.lastname).substr(0,10));
                })
                
                $( $('#avatar_'+post.id)).parent().closest('a').attr('href', 'http://' + domain_glob + ':' + location.port + '/profile?id=' + post.writtenBy);
            }, function(){});

            if(post.writtenBy == userId_glob){
                $('#postPrivacy').prepend("<label for='privacy_"+ post.id +"' class='btn btn-info btn-sm'>Private<input type='checkbox' id='privacy_"+ post.id +"' class='badgebox'><span class='badge'>&check;</span></label>");             
                $('#privacy_'+ post.id).attr('checked', post.privacy);         
            }          
        }, this);
    }
}

 function createPostElement(post){
        var delBtn = (post.writtenBy == userId_glob || post.writtenTo == userId_glob)?
        "<div class = 'col-sm-2 pull-right  btn-delete'>" +
            "<button id='btnDeletePost_"+post.id+"' type='button' class='btn-sm btn-danger pull-right'>Delete</button>" +
        "</div>" : "" ;

        var showPosts =
        "<div class='panel panel-default post' "+ "id= 'post_"+post.id +"'>"+
            "<div class='panel-body'>" + 
                "<div class = row>" +
                    "<div class = row>" + delBtn + "</div>" +
                    "<div class = 'col-sm-2'>" + 
                        "<a class = 'post-avatar thumbnail' href='profile.html'>" +
                            "<img id='avatar_"+post.id+"' src='img/user.png'></img>" +
                            "<div class = 'text-center'>DevUser1</div>" + 
                        "</a>"+
                        "<div class = 'likes text-center'>" +
                            "<div id='likesPost_"+post.id+"'>0</div>" + 
                                "<div class='dropdown'>" +
                                "<a id='likersDropdown_"+post.id+"'><label>Likes</label></a>" +
                                "<span class='caret'></span>" +                                     
                                "<ul class='dropdown-menu' id='likersList_"+post.id+"'>" +
                                "</ul>" +
                            "</div>" +
                        "</div>" +                     
                    "</div> <!-- ENDof Col-sm-2 -->"+  
                    "<div class = 'col-sm-10'>"+
                        "<div class = row>" +
                            "<div class = 'col-sm-8 post-text'>"+
                            "<div class ='postCreatedDate'>"+ formatDate(new Date(post.createdAt)) + "</div>" + 
                                "<div class = 'bubble'>" +
                                    "<div class = 'pointer'>"+
                                        "<p>"+post.text+"</p>"+
                                    "</div>" +
                                    "<div class = 'pointer-border'> </div>"+          
                                "</div> <!-- ENDof bubbble -->" +         
                            "</div>" + 
                            "<div class = 'col-sm-4'>"+
                                "<!-- POST IMAGES -->" +
                                "<div id='imagesPlaceHolder_"+post.id+"' class = 'imagesHolder'></div>" +
                            "</div>" + 
                        "</div>" + 
                        "<div class='container'>" +
                            "<div class='row'>" +
                                "<div id ='postActions' class='col-xs-1'>" +
                                    "<p class = 'post-actions'>" +
                                        "<button id='likeBtn_"+ post.id +"' class='btn btn-info btn-sm  '>Like</button>" +
                                    "</p>"+  
                                "</div>" +
                                "<div id ='postPrivacy' class='col-xs-2 post-actions' > </div>" +
                            "</div>" +
                        "</div>" +
                        "<div class = 'comment-form'>" +
                            "<form class='form-inline'>" +
                                "<div class='form-group comment-txt'>" +
                                    "<input type='text' id = 'commentText_"+post.id+"' class='form-control' placeholder='Enter Comment'>"+
                                "</div>"+
                                "<button id='btnAddComment_"+post.id+"' type='button' class='btn btn-default'>Add</button>"+
                            "</form>"+
                        "</div> <!-- ENDof CommentForm -->"+
                        "<div class = 'clearfix'></div>"+


                        "<!-- COMMENTS -->" +
                        "<div id='commentsPlaceHolder_"+post.id+"' class = 'comments'></div> " +
                        "<div id='commentsHiddenPlaceHolder_"+post.id+"' class = 'comments'></div> " +
                        
                                               
                        "<!-- ENDof Comments -->"+

                    "</div> <!-- ENDof Col-sm-10 -->"+        
                "</div> <!-- ENDof row -->"+
            "</div> <!-- ENDof panel body -->";
        "</div>";
    return showPosts;
}

function previewImages() {

  var $preview = $('#preview').empty();
  if ($("#images")[0].files) $.each($("#images")[0].files, readAndPreview);

  function readAndPreview(i, file) {   
    if (!/\.(jpe?g|png|gif)$/i.test(file.name))
      return alert(file.name +" is not an image");
    var reader = new FileReader();
    $(reader).on("load", function() {
      $preview.append($("<img/>", {src:this.result, height:60, width : 70}));
    });
    reader.readAsDataURL(file);
  }
}

function formatDate(date) {
    var monthNames = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December" ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    (minutes<10) && (minutes = "0" + minutes);
    (seconds<10) && (seconds = "0" + seconds);
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year + '  (' + hours + ':' + minutes + ':' + seconds + ')';
  }


$(document).ready(function() {
    //  Attach event handler to the form (sign in button)
    $('form').submit(postClicked);

    //  Attach event handler to the file input button.
    $("#images").on('change', function(event){
        if($(this)[0].files.length > 6){// Limit of 6 imgs per post.
            alert("You can select only 6 images");
            $(this).val(''); 
        } 
        else{
            previewImages();
            imgEvent = event;
        }   
    });

    $(document).delegate('*[id^="likeBtn_"]', 'click', function(event) {
        event.preventDefault();
        var postId = event.target.id.split('_')[1];
        addLike(postId, updateLikes, function(){ });      
    });
    
    
    //  Get current user ID and upload posts from db.
    getUserById("", function(user){
        userId_glob = user.id; //   save userId variable globally
        if(location.pathname.substring(1) == "profile"){
            if(!(window.location.href.split("id=")[1]))        
                getPostsToUser(userId_glob ,showPosts, function(){ });
            else
                getPostsToUser(window.location.href.split("id=")[1] ,showPosts, function(){ });
        }
        else
            {
                getPosts(showPosts, function(){});  
                lightboxSetup();
            }
              
    },function(){}); 
    
    // Set listener for cklicks on buttons on the post form.
    $('body').on('click', '#postsPlaceHolder', function(event) { 
        switch (event.target.id.split('_')[0]) {

            // Add comment button was pressed.
            case "btnAddComment":
                addComment(event.target.id.split('_')[1]);
                break;    
                
            // Delete post button was pressed.
            case "btnDeletePost":
                removePost(event.target.id.split('_')[1], function(post){
                    $( "#post_"+ post.id ).remove();
                }, function(){});
            break; 

            // Delete comment button was pressed.
            case "btnDeleteComment":
                removeComment(event.target.id.split('_')[1], function(comment){
                    $( "#comment_"+ comment.id ).remove();
                }, function(){});
            break; 

            //  Privacy checkbox was pressed: sends to the server num of post to change privacy.
            case "privacy":
                changePrivacy(event.target.id.split('_')[1], function(post){
                    $( "#privacy_"+ post.id ).attr('checked', post.privacy);                    
                }, function(){});
            break;

            default:          
            break;
        }
    });

    //  Show button "Next Posts" when the hidden posts placecolder not empty, and hide when empty.
    $('#postsPlaceHolderHidden').bind("DOMSubtreeModified",function() {
        $("#postsPlaceHolderHidden > div").length >=1 ? $('#openPosts').show() : $('#openPosts').hide();
    });

    //  Move posts from hidden placeholder to the main posts placeholder.
    $('#openPosts').click(function() {
        for (var index = 0; index < 4; index++) {
            $('#postsPlaceHolder').append($('#postsPlaceHolderHidden > div').first());
        }
    });

});