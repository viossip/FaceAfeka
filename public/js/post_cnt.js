var imgEvent;

function postClicked(event){
	
	var postTextElement = $('form textarea[id=postText]');
	var postText = postTextElement.val();

    event.preventDefault();

	if(!postText || postText.length === 0){
		postTextElement.attr('placeholder', "Write something here...").focus();
		return;
    }

    prepareUpload(imgEvent, uploadDone, function(){ });
}


function uploadDone(data){
    console.log("UploadDone: " + JSON.stringify(data));

    //  Clear the textField of post
    $('form textarea[id=postText]').val("");
    $('#privateCheckBox').prop('checked', false);

    // Display the new uploaded post
    // TODO: 
}

function showPosts(){
$( "#postsPlaceHolder" ).append(function() {
        var showPosts =
            "<div class='panel panel-default post'>"+
                "<div class='panel-body'>" + 
                    "<div class = row>" +
                        "<div class = 'col-sm-2'>" + 
                            "<a class = 'post-avatar thumbnail' href='profile.html'> <img src='img/user.png'>" +
                                "<div class = 'text-center'>DevUser1</div>" + 
                            "</a>"+
                            "<div class = 'likes text-center'>7 Likes</div>" +
                        "</div> <!-- ENDof Col-sm-2 -->"+
        
                        "<div class = 'col-sm-10'>"+
                            "<div class = 'bubble'>" +
                                "<div class = 'pointer'>"+
                                    "<p>The saga shells the curse beneath its renewing muck. A generalized snag beams. Against a library degenerates a loose faithful.</p>"+
                                "</div>"+

                                "<div class = 'pointer-border'> </div>"+
                            "</div> <!-- ENDof bubbble -->" +

                            "<p class = 'post-actions'><a href = '#'>Comment</a> - <a href = '#'>Like</a> - <a href = '#'>Follow</a> - <a href = '#'>Share</a></p>"+

                            "<div class = 'comment-form'>"+
                                "<form class='form-inline'>"+
                                    "<div class='form-group'>"+
                                        "<input type='text' class='form-control' id='exampleInputName2' placeholder='Enter Comment'>"+
                                    "</div>"+
                                    "<button type='submit' class='btn btn-default'>Add</button>"+
                                "</form>"+
                            "</div> <!-- ENDof CommentForm -->"+

                            "<div class = 'clearfix'></div>"+

                            "<div class = 'comments'>"+
                                "<div class = 'comment'>"+
                                    "<a class = 'comment-avatar pull-left' href = '#'><img src = 'img/user.png'></a>"+
                                    "<div class = 'comment-text'>"+
                                        "<p>The saga shells the curse beneath its renewing muck.</p>"+
                                    "</div>"+
                                "</div> <!-- ENDof Comment -->"+


                                "<div class = 'clearfix'></div>"+

                            "</div> <!-- ENDof Comments -->"+

                        "</div> <!-- ENDof Col-sm-10 -->"+

                    "</div> <!-- ENDof row -->"+
                "</div> <!-- ENDof panel body -->";
            "</div>";

        return showPosts + showPosts + showPosts;
    });
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

    showPosts();
});